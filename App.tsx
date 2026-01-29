import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Definimos la estructura: Ahora incluimos 'completed'
interface Task {
  id: number;
  name: string;
  completed: number; // 0 o 1
}

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setupDatabase();
    fetchTasks();
  }, []);

  const setupDatabase = () => {
    // Añadimos la columna 'completed' con valor por defecto 0
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );
    `);
  };

  const fetchTasks = () => {
    const allRows = db.getAllSync<Task>('SELECT * FROM tasks');
    setTasks(allRows);
  };

  const addTask = () => {
    if (taskText.trim() === '') return;
    // Insertamos solo el nombre, 'completed' será 0 por defecto
    db.runSync('INSERT INTO tasks (name) VALUES (?)', [taskText]);
    setTaskText('');
    fetchTasks();
  };

  // NUEVA FUNCIÓN: Actualizar el estado de la tarea
  const toggleTask = (id: number, currentStatus: number) => {
    // Si es 0, cambiamos a 1. Si es 1, cambiamos a 0.
    const newStatus = currentStatus === 0 ? 1 : 0;
    
    // Usamos el comando UPDATE de SQL
    db.runSync(
      'UPDATE tasks SET completed = ? WHERE id = ?', 
      [newStatus, id]
    );
    fetchTasks(); // Recargar lista para ver el cambio
  };

  const deleteTask = (id: number) => {
    db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tareas</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Nueva tarea..." 
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="Añadir" onPress={addTask} />
      </View>

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => toggleTask(item.id, item.completed)}
            >
              <Text style={[
                styles.taskText, 
                item.completed === 1 && styles.completedText // Estilo condicional
              ]}>
                {item.completed === 1 ? '✅ ' : '⏳ '}
                {item.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteBtn}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10, padding: 5 },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 15, 
    backgroundColor: '#f9f9f9', 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  taskText: { fontSize: 16 },
  completedText: { 
    textDecorationLine: 'line-through', // Tachado
    color: 'gray' 
  },
  deleteBtn: { color: 'red', marginLeft: 10 }
});