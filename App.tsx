import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  useEffect(() => {
    // IMPORTANTE: Activar el soporte de claves foráneas cada vez que se abre la app
    db.execSync('PRAGMA foreign_keys = ON;');
    
    runMigrations();
    fetchData();
  }, []);

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    // Si es la primera vez o una versión antigua, vamos a recrear las tablas con CASCADE
    if (currentVersion < 4) {
      // Borramos para limpiar (solo para este tutorial de aprendizaje)
      db.execSync(`DROP TABLE IF EXISTS tasks;`);
      db.execSync(`DROP TABLE IF EXISTS categories;`);

      // 1. Crear tabla categorías
      db.execSync(`CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);
      db.execSync("INSERT INTO categories (name) VALUES ('Trabajo'), ('Hogar'), ('Estudio');");

      // 2. Crear tabla tareas con ON DELETE CASCADE
      // Esto significa: "Si borras la categoría, borra sus tareas"
      db.execSync(`
        CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          category_id INTEGER,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        );
      `);
      
      db.execSync(`PRAGMA user_version = 4`);
    }
  };

  const fetchData = () => {
    setCategories(db.getAllSync('SELECT * FROM categories'));
    setTasks(db.getAllSync('SELECT * FROM tasks'));
  };

  // Función para borrar una categoría
  const deleteCategory = (id: number) => {
    Alert.alert(
      "¿Borrar categoría?",
      "Se borrarán todas las tareas de esta categoría.",
      [
        { text: "Cancelar" },
        { text: "Eliminar", style: "destructive", onPress: () => {
          db.runSync('DELETE FROM categories WHERE id = ?', [id]);
          fetchData(); // Recargamos todo
        }}
      ]
    );
  };

  const addTask = () => {
    if (!taskText || !selectedCatId) return Alert.alert("Aviso", "Elige categoría y escribe la tarea");
    db.runSync('INSERT INTO tasks (name, category_id) VALUES (?, ?)', [taskText, selectedCatId]);
    setTaskText('');
    fetchData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías (Mantén presionado para borrar)</Text>
      
      <View style={styles.catContainer}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat.id} 
            onPress={() => setSelectedCatId(cat.id)}
            onLongPress={() => deleteCategory(cat.id)} // <--- PISTA APLICADA
            style={[styles.catBtn, selectedCatId === cat.id && styles.catBtnActive]}
          >
            <Text>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Nueva tarea..." value={taskText} onChangeText={setTaskText} />
        <Button title="+" onPress={addTask} />
      </View>

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.name} - <Text style={{fontWeight:'bold'}}>{categories.find(c => c.id === item.category_id)?.name}</Text></Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  catContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  catBtn: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginRight: 10, marginBottom: 10 },
  catBtnActive: { backgroundColor: '#4CAF50' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
  taskItem: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 5 }
});