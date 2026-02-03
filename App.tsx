import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Task {
  id: number;
  name: string;
  completed: number;
}

type FilterType = 'all' | 'pending' | 'completed';

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // 1. Nuevo estado para el texto de búsqueda
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    runMigrations();
    fetchTasks();
  }, [filter, searchText]); // Se ejecuta si cambia el filtro O la búsqueda

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;
    if (currentVersion < 2) {
      db.execSync(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, completed INTEGER DEFAULT 0);`);
      db.execSync(`PRAGMA user_version = 2`);
    }
  };

  // 2. Consulta avanzada con filtros y búsqueda
  const fetchTasks = () => {
    let query = 'SELECT * FROM tasks WHERE 1=1'; // "1=1" es un truco para concatenar filtros fácilmente
    let params: any[] = [];

    // Filtro por estado
    if (filter === 'pending') {
      query += ' AND completed = 0';
    } else if (filter === 'completed') {
      query += ' AND completed = 1';
    }

    // Filtro por búsqueda de texto
    if (searchText !== '') {
      query += ' AND name LIKE ?';
      params.push(`%${searchText}%`); // Buscamos el texto en cualquier posición
    }

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
      <Text style={styles.title}>Buscador SQLite</Text>
      
      {/* 3. Input de Búsqueda */}
      <TextInput 
        style={styles.searchBar} 
        placeholder="🔍 Buscar tarea..." 
        value={searchText}
        onChangeText={setSearchText} // Actualiza la lista al escribir
      />

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Nueva tarea..." 
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="Añadir" onPress={addTask} />
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={filter === f ? {color: 'white'} : {}}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleTask(item.id, item.completed)}>
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
  container: { flex: 1, padding: 30, backgroundColor: '#f0f2f5', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchBar: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  inputContainer: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 5, marginRight: 5 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  filterBtn: { padding: 8, borderRadius: 5, backgroundColor: '#ccc', flex: 1, marginHorizontal: 2, alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#007AFF' },
  taskItem: { padding: 15, backgroundColor: 'white', borderRadius: 8, marginBottom: 8 },
  taskText: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: 'gray' }
});