import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Task {
  id: number;
  name: string;
  completed: number;
}

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    runMigrations();
    fetchTasks();
  }, []);

  // --- LÓGICA DE MIGRACIONES ---
  const runMigrations = () => {
    // 1. Consultar la versión actual de la base de datos
    // user_version es un espacio especial en SQLite para guardar un número de versión
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    console.log("Versión actual de la DB:", currentVersion);

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

    // MIGRACIÓN 2: Añadir la columna 'completed' si no existe
    if (currentVersion < 2) {
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

  // --- RESTO DE FUNCIONES ---
  const fetchTasks = () => {
    const allRows = db.getAllSync<Task>('SELECT * FROM tasks');
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
      <Text style={styles.title}>Tareas con Migraciones</Text>
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
  container: { flex: 1, padding: 50, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
  taskItem: { padding: 15, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderColor: '#eee' },
  taskText: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: 'gray' }
});