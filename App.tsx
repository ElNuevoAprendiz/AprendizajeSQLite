import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
// 1. Importamos la librería de SQLite
import * as SQLite from 'expo-sqlite';

// 2. Definimos la forma de nuestros datos (TypeScript)
interface Task {
  id: number;
  name: string;
}

export default function App() {
  // 3. Abrimos o creamos la base de datos llamada 'tasks.db'
  const db = SQLite.openDatabaseSync('tasks.db');

  // Estados para manejar el texto del input y la lista de tareas
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // 4. useEffect para inicializar la base de datos cuando la app carga
  useEffect(() => {
    setupDatabase();
    fetchTasks();
  }, []);

  // 5. Crear la tabla si no existe
  const setupDatabase = () => {
    // Ejecutamos un comando SQL: CREATE TABLE IF NOT EXISTS
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL
      );
    `);
  };

  // 6. Función para obtener (leer) las tareas de la base de datos
  const fetchTasks = () => {
    // Obtenemos todos los registros de la tabla 'tasks'
    const allRows = db.getAllSync<Task>('SELECT * FROM tasks');
    setTasks(allRows); // Guardamos el resultado en el estado de React
  };

  // 7. Función para añadir una nueva tarea
  const addTask = () => {
    if (taskText === '') return; // No agregar si está vacío

    // Insertamos el texto en la base de datos
    // El '?' es un marcador de posición por seguridad (evita ataques SQL)
    db.runSync('INSERT INTO tasks (name) VALUES (?)', [taskText]);
    
    setTaskText(''); // Limpiamos el input
    fetchTasks();    // Refrescamos la lista
  };

  // 8. Función para eliminar una tarea por ID
  const deleteTask = (id: number) => {
    db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
    fetchTasks(); // Refrescamos la lista
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tareas (SQLite)</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Escribe una tarea..." 
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="Añadir" onPress={addTask} />
      </View>

      {/* Listado de tareas */}
      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: 'red' }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// Estilos básicos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10, padding: 5 },
  taskItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    backgroundColor: '#f9f9f9', 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
});