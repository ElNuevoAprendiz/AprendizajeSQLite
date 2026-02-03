import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Task {
  id: number;
  name: string;
  completed: number;
}

// Definimos los tipos de filtro posibles
type FilterType = 'all' | 'pending' | 'completed';

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // 1. Estado para saber qué filtro está activo
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    runMigrations();
    fetchTasks(); // Recargar cuando cambie el filtro
  }, [filter]); // <-- IMPORTANTE: Se ejecuta cada vez que el filtro cambia

  

   // --- LÓGICA DE MIGRACIONES ---
  const runMigrations = () => {
    // 1. Consultar la versión actual de la base de datos
    // user_version es un espacio especial en SQLite para guardar un número de versión
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    console.log("Versión actual de la DB:", currentVersion);

    //Prueba mia para saber si existe la columna completed

     
     //console.log("Columnas de la tabla tasks:", result2);
     //console.log([result2.some(column => column.name === 'completed')]);


    // MIGRACIÓN 1: Crear la tabla inicial
    if (currentVersion < 1) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          name TEXT NOT NULL
        );
      `);
      currentVersion = 1;
    }

    //Uso result2 para obtener el resultado de la estructura de la tabla para despues poder verificar si existe 
    //la columna completed, de no existir se añade en la migración 2
    const result2 = db.getAllSync<{ name: string }>(`PRAGMA table_info(tasks)`);
    console.log("Columnas de la tabla tasks:", result2);
    console.log(Array.isArray(result2));
    const respuesta: boolean = result2.some(column => column.name === 'completed');

    // MIGRACIÓN 2: Añadir la columna 'completed' si no existe
    if (respuesta === false) {
      try {
        db.execSync(`ALTER TABLE tasks ADD COLUMN completed INTEGER DEFAULT 0;`);
      } catch (e) {
        console.log("La columna ya existía o hubo un error", e);
      }
      currentVersion = 2;
    }

    // 2. Guardar la nueva versión en la base de datos
    db.execSync(`PRAGMA user_version = ${currentVersion}`);
  };

  // 2. Función de lectura modificada para filtrar
  const fetchTasks = () => {
    let query = 'SELECT * FROM tasks';
    let params: any[] = [];

    if (filter === 'pending') {
      query += ' WHERE completed = 0';
    } else if (filter === 'completed') {
      query += ' WHERE completed = 1';
    }

    // Ordenar para que las más nuevas aparezcan arriba
    query += ' ORDER BY id DESC';

    const allRows = db.getAllSync<Task>(query, params);
    setTasks(allRows);
  };

  const addTask = () => {
    if (taskText.trim() === '') return;
    db.runSync('INSERT INTO tasks (name) VALUES (?)', [taskText]);
    setTaskText('');
    fetchTasks();
  };

  const toggleTask = (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    db.runSync('UPDATE tasks SET completed = ? WHERE id = ?', [newStatus, id]);
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tareas Pro</Text>
      
      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Nueva tarea..." 
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="+" onPress={addTask} />
      </View>

      {/* 3. Botones de Filtro */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={filter === f ? {color: 'white'} : {}}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleTask(item.id, item.completed)}>
              <Text style={[styles.taskText, item.completed === 1 && styles.completedText]}>
                {item.completed === 1 ? '✅ ' : '⏳ '}{item.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#f4f4f9' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  inputContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'white', borderRadius: 8, padding: 5 },
  input: { flex: 1, paddingHorizontal: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  filterBtn: { padding: 8, borderRadius: 5, backgroundColor: '#ddd' },
  filterBtnActive: { backgroundColor: '#007AFF' },
  taskItem: { 
    padding: 15, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 2 
  },
  taskText: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: 'gray' }
});