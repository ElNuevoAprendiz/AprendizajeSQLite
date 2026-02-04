import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing'; // Para respaldar
import * as FileSystem from 'expo-file-system'; // Para manejar archivos
import { Paths, File, Directory } from 'expo-file-system';

interface Category {
  id: number;
  name: string;
}

interface Task {
  id: number;
  name: string;
  completed: number;
  category_id: number;
}

export default function App() {
  const db = SQLite.openDatabaseSync('tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  useEffect(() => {
    runMigrations();
    fetchData();
  }, []);

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    if (currentVersion < 3) {
      // 1. Crear tabla de categorías
      db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `);
      
      // 2. Insertar categorías por defecto
      db.execSync("INSERT INTO categories (name) VALUES ('Trabajo'), ('Hogar'), ('Estudio');");

      // 3. Modificar tabla de tareas para incluir la relación
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          category_id INTEGER,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        );
      `);
      db.execSync(`PRAGMA user_version = 3`);
    }
  };

  const fetchData = () => {
    setCategories(db.getAllSync<Category>('SELECT * FROM categories'));
    setTasks(db.getAllSync<Task>('SELECT * FROM tasks ORDER BY id DESC'));
  };

  const addTask = () => {
    if (!taskText || !selectedCatId) return Alert.alert("Error", "Escribe la tarea y selecciona una categoría");
    db.runSync('INSERT INTO tasks (name, category_id) VALUES (?, ?)', [taskText, selectedCatId]);
    setTaskText('');
    fetchData();
  };

  // --- PARTE 2: RESPALDO (BACKUP) ---
  const backupDatabase = async () => {
    // La ruta donde Expo guarda la base de datos
    //const dbUri = FileSystem.documentDirectory + 'SQLite/tasks.db';//version anterior no funciona con el actual sdk 54
    
    // Obtener el URI del directorio de documentos usando lo recomendad por la nueva API, ver el archivo Readme_errorFileSystem.documentDirectory.txt
    const docsDirUri = Paths.document.uri;
    const dbUri = docsDirUri + 'SQLite/tasks.db';// Construir la ruta completa al archivo de la base de datos
    
    // Verificamos si podemos compartir
    if (!(await Sharing.isAvailableAsync())) {
      return Alert.alert("Error", "Compartir no está disponible en este dispositivo");
    }

    await Sharing.shareAsync(dbUri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas por Categoría</Text>
      
      {/* Selector de Categorías */}
      <View style={styles.catContainer}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat.id} 
            onPress={() => setSelectedCatId(cat.id)}
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
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.name} ({categories.find(c => c.id === item.category_id)?.name})</Text>
          </View>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Respaldar Base de Datos" color="green" onPress={backupDatabase} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  catContainer: { flexDirection: 'row', marginBottom: 15, justifyContent: 'space-between' },
  catBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 5 },
  catBtnActive: { backgroundColor: '#FFD700' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
  taskItem: { padding: 15, backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 5 }
});