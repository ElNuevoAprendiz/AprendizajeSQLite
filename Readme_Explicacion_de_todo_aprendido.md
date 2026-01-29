 Necesito que me expliques en detalle como si yo recién empezara en la

programación en typescript y react native como se usa sqlite, que lo hagas desarrollando un programa completo en react native y me lo expliques paso a paso que hace y que es cada línea de codigo

¡Qué buen paso estás dando! Combinar React Native con SQLite es la forma estándar de crear aplicaciones robustas que funcionen sin conexión (offline), permitiendo guardar datos directamente en el dispositivo del usuario.

Para este tutorial, utilizaremos la librería expo-sqlite, que es la más amigable y estable actualmente para el ecosistema de Expo.
1. Conceptos Básicos

    SQLite: Es un motor de base de datos relacional ligero que no necesita un servidor. Los datos se guardan en un solo archivo dentro del teléfono.

    SQL (Structured Query Language): Es el lenguaje que usaremos para hablarle a la base de datos (Crear tablas, insertar datos, consultar, etc.).

    Persistencia: Significa que aunque cierres la app o apagues el celular, los datos seguirán ahí.

2. Instalación del proyecto

Primero, crea tu proyecto y añade la librería necesaria:
Bash

npx create-expo-app@latest MiAppSqlite --template tabs
cd MiAppSqlite
npx expo install expo-sqlite

3. El Código: App de Lista de Tareas (Todo List)

Copia este código en tu archivo App.tsx. He comentado cada línea para que entiendas el flujo.
TypeScript

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

4. Explicación paso a paso
A. La conexión (openDatabaseSync)

const db = SQLite.openDatabaseSync('tasks.db'); Aquí le decimos a la app: "Busca un archivo llamado tasks.db. Si no existe, créalo". Esto nos devuelve un objeto db que es nuestra conexión para enviar comandos.
B. El Esquema (setupDatabase)

Las bases de datos relacionales necesitan una estructura. Usamos db.execSync para ejecutar un comando de creación.

    INTEGER PRIMARY KEY AUTOINCREMENT: Crea un ID único (1, 2, 3...) para cada tarea automáticamente.

    TEXT NOT NULL: Indica que el nombre de la tarea debe ser texto y no puede estar vacío.

C. Operaciones CRUD (Crear, Leer, Actualizar, Borrar)

    Create (Insertar): Usamos db.runSync. El uso de ? es vital. Nunca pongas la variable directamente en el string (ej: `VALUES (${taskText})`) porque eso haría que tu app sea vulnerable. El ? limpia los datos antes de guardarlos.

    Read (Leer): db.getAllSync nos devuelve un arreglo de objetos JavaScript que React puede entender fácilmente para dibujarlos en la pantalla con un FlatList.

    Delete (Borrar): Usamos el id único para decirle a la base de datos exactamente qué fila debe eliminar.

¿Por qué usamos funciones "Sync"?

En este ejemplo usamos las versiones Síncronas (runSync, getAllSync) porque son más fáciles de entender cuando estás empezando. Para aplicaciones muy grandes con miles de datos, se suelen usar las versiones asíncronas para no "congelar" la pantalla mientras se procesan los datos.

¿Te gustaría que te explique cómo modificar una tarea ya existente (Update) o prefieres profundizar en cómo hacer consultas más complejas?

me puedes generar un archivo md que contenga esta respuesta

¡Claro que sí! Aquí tienes todo el contenido estructurado en un archivo Markdown (.md). Puedes copiarlo y guardarlo como TutorialSQLite.md para consultarlo siempre que lo necesites.
Markdown

# Guía de SQLite en React Native con TypeScript 🚀

Esta guía explica cómo implementar una base de datos local en una aplicación de React Native utilizando la librería **expo-sqlite**.

---

## 1. Conceptos Fundamentales

* **SQLite**: Motor de base de datos que guarda la información en un archivo dentro del dispositivo. No requiere internet.
* **Persistencia**: Capacidad de que los datos se mantengan guardados incluso si cierras la app o reinicias el teléfono.
* **SQL**: Lenguaje de consultas estructuradas que usamos para crear tablas o insertar datos.

---

## 2. Configuración Inicial

Para comenzar, necesitas instalar la librería en tu proyecto de Expo:

```bash
npx expo install expo-sqlite

3. Código Completo (App.tsx)

Este código crea una lista de tareas donde puedes añadir y eliminar elementos guardándolos permanentemente.
TypeScript

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
// Importamos SQLite
import * as SQLite from 'expo-sqlite';

// Definimos la estructura de nuestros datos para TypeScript
interface Task {
  id: number;
  name: string;
}

export default function App() {
  // 1. Abrimos (o creamos) la base de datos
  const db = SQLite.openDatabaseSync('tasks.db');

  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // 2. Inicialización: Se ejecuta una sola vez al abrir la app
  useEffect(() => {
    setupDatabase();
    fetchTasks();
  }, []);

  // 3. Crear la tabla si no existe
  const setupDatabase = () => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL
      );
    `);
  };

  // 4. Leer los datos de la tabla
  const fetchTasks = () => {
    // Obtenemos todas las filas y las guardamos en el estado 'tasks'
    const allRows = db.getAllSync<Task>('SELECT * FROM tasks');
    setTasks(allRows);
  };

  // 5. Insertar una nueva tarea
  const addTask = () => {
    if (taskText.trim() === '') return;

    // Usamos '?' para prevenir inyecciones SQL (seguridad)
    db.runSync('INSERT INTO tasks (name) VALUES (?)', [taskText]);
    
    setTaskText(''); // Limpiar input
    fetchTasks();    // Actualizar lista
  };

  // 6. Eliminar una tarea por su ID
  const deleteTask = (id: number) => {
    db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
    fetchTasks();
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

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>X</Text>
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
    justifyContent: 'space-between', 
    padding: 15, 
    backgroundColor: '#f9f9f9', 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
});

4. Glosario de Funciones Utilizadas
Función	Propósito
openDatabaseSync(nombre)	Abre el archivo de la base de datos. Si no existe, lo crea.
execSync(query)	Ejecuta comandos SQL que no devuelven datos (como crear tablas).
runSync(query, [params])	Ejecuta comandos para modificar datos (Insertar, Borrar, Actualizar).
getAllSync(query)	Consulta la base de datos y devuelve todos los resultados en un Array.
5. Tips para Principiantes

    Seguridad: Siempre usa el signo ? en tus consultas en lugar de insertar variables directamente en el texto. Esto evita que alguien pueda "hackear" tu base de datos mediante texto malicioso.

    Consola: Si quieres ver qué está pasando, puedes usar console.log(allRows) dentro de la función fetchTasks.

    Tipado: Gracias a TypeScript, al usar <Task>, VS Code te ayudará autocompletando item.name e item.id.


¿Deseas que te explique cómo añadir una columna adicional para marcar tareas como "completadas" usando un valor booleano?

si por favor

¡Excelente! Agregar un estado de "completado" es la mejor forma de aprender cómo se actualizan datos existentes en una base de datos.

En SQLite no existe el tipo de dato "Boolean" (true/false) como tal, así que usaremos números: 0 para falso (no completada) y 1 para verdadero (completada).

Aquí tienes el archivo Markdown actualizado con la nueva funcionalidad de "marcar como completada".
Markdown

# SQLite en React Native: Update y Tipado 📝

En esta versión mejorada, aprenderemos a actualizar registros existentes y a manejar estados booleanos dentro de SQLite.

---

## 1. Cambios en la Estructura (Esquema)

Para permitir tareas completadas, añadimos una columna llamada `completed`.
* `0`: La tarea está pendiente.
* `1`: La tarea está terminada.



---

## 2. Código Completo Actualizado

He modificado las funciones `setupDatabase`, `addTask` y añadido `toggleTask`.

```typescript
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

3. ¿Qué aprendimos hoy?

    UPDATE: El comando SQL para cambiar valores de filas que ya existen. La sintaxis es UPDATE tabla SET columna = nuevo_valor WHERE condicion.

    Lógica Booleana en SQLite: Como no hay true/false, usamos 1/0 y lo manejamos en React con comparaciones (item.completed === 1).

    Estilos Condicionales: En React Native, puedes pasar un arreglo de estilos [estilo1, condicion && estilo2] para aplicar cambios visuales (como el tachado de texto) según los datos de la base de datos.


### Un pequeño reto para ti:
¿Te fijaste que al actualizar la tabla en `setupDatabase` si ya tenías la app instalada antes, la columna `completed` no aparecerá mágicamente? Esto es porque la tabla ya existe y el comando `CREATE TABLE IF NOT EXISTS` no hace nada si la tabla ya está ahí.

Si quieres que los cambios se apliquen, debes:
1. Borrar la app de tu simulador/celular y volverla a instalar.
2. O usar un comando llamado `DROP TABLE tasks;` para borrarla y que se cree de nuevo.

¿Te gustaría que te enseñe cómo manejar "versiones" de la base de datos para no tener que borrar la app cada vez que hagas un cambio? (A esto se le llama **Migraciones**).

si por favor

¡Excelente iniciativa! Las migraciones son fundamentales en el desarrollo profesional. Imagina que tu app ya tiene miles de usuarios; no puedes pedirles que borren la app y pierdan sus datos cada vez que tú quieras añadir una nueva función.

Para manejar esto, utilizaremos el concepto de Versiones de Esquema.
1. El Concepto de Migraciones

Cuando inicias una base de datos, esta comienza en la Versión 0. Cada vez que cambias la estructura (añades una columna, cambias un nombre), subes la versión.
2. Código Implementando Migraciones

Aquí tienes el código actualizado. He separado la lógica de la base de datos para que sea más limpia. Este patrón es el que usarás en proyectos reales.
TypeScript

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

3. Explicación paso a paso
¿Qué es PRAGMA user_version?

Es un comando especial de SQLite. Imagina que es como una "etiqueta" pegada en la caja de tu base de datos que dice "Versión 1". Cuando la app inicia, leemos esa etiqueta para saber qué cambios nos falta aplicar.
El comando ALTER TABLE

Este comando es la clave. En lugar de borrar la tabla y crearla de nuevo (CREATE), le decimos a SQLite: "Oye, a la tabla que ya tienes, agrégale esta nueva columna". Los datos que ya tenían tus usuarios no se tocan, se mantienen intactos.
Tu guía en Markdown (Resumen)

He preparado este resumen para tu archivo .md:
Concepto	Descripción	Comando SQL
Versión	Número que identifica el estado del esquema.	PRAGMA user_version
Migración	Código que transforma la DB de una versión a otra.	if (version < 2) { ... }
Alteración	Modificar una tabla existente sin borrar datos.	ALTER TABLE

    Nota de Pro: En aplicaciones muy grandes, se suelen usar librerías como drizzle-orm o typeorm que manejan las migraciones automáticamente, pero entender cómo funciona por debajo con PRAGMA te hace un desarrollador mucho más completo.

¿Te gustaría que ahora veamos cómo filtrar las tareas (ver solo las completadas o solo las pendientes) usando comandos de búsqueda en la base de datos?

si gracias

¡Excelente! Aprender a filtrar datos es lo que realmente le da poder a una base de datos. En lugar de traer miles de registros y filtrarlos con JavaScript (lo cual sería lento), le pediremos a SQLite que haga el trabajo pesado y nos entregue solo lo que necesitamos.

Para esto usaremos la cláusula WHERE y crearemos un sistema de pestañas (filtros).
1. El concepto de Filtrado en SQL

Usaremos tres tipos de consultas dependiendo de lo que el usuario quiera ver:

    Todas: SELECT * FROM tasks

    Pendientes: SELECT * FROM tasks WHERE completed = 0

    Completadas: SELECT * FROM tasks WHERE completed = 1

2. Código con Filtros Dinámicos

Aquí tienes la versión final con un selector de filtros. He añadido comentarios en las partes nuevas.
TypeScript

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

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    if (currentVersion < 2) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          name TEXT NOT NULL,
          completed INTEGER DEFAULT 0
        );
      `);
      db.execSync(`PRAGMA user_version = 2`);
    }
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

3. ¿Qué hemos añadido?

    Cláusula WHERE: Es el filtro de SQL. Permite que la base de datos solo busque los registros que cumplen una condición. Es mucho más eficiente que traer todo y filtrarlo en React.

    Cláusula ORDER BY: Usamos ORDER BY id DESC para que las tareas nuevas aparezcan primero en la lista.

    Estado de Filtro (filter): Usamos un estado de React para controlar qué pestaña está seleccionada. Al poner [filter] en el useEffect, la lista se actualiza automáticamente cada vez que tocas un botón de filtro.

Resumen para tu archivo .md
Comando SQL	Resultado
WHERE completed = 1	Trae solo los elementos marcados como completados.
ORDER BY name ASC	Ordena los resultados alfabéticamente de la A a la Z.
ORDER BY id DESC	Ordena mostrando los registros más recientes primero.

¡Ya tienes una aplicación de base de datos bastante profesional! Tiene creación, lectura, actualización, borrado, migraciones y filtros.

¿Te gustaría aprender cómo hacer una búsqueda por texto (por ejemplo, buscar una tarea escribiendo su nombre) o prefieres que veamos cómo exportar/respaldar la base de datos?

si gracias

¡De nada! Es genial ver tu progreso. Ahora vamos a añadir una funcionalidad de búsqueda en tiempo real. Esto permitirá que, a medida que escribas en una barra de búsqueda, la base de datos filtre las tareas que coincidan con ese texto.

Para lograr esto, usaremos el operador LIKE de SQL, que sirve para buscar patrones de texto.
1. El concepto de Búsqueda con LIKE

En SQL, si quieres buscar una palabra que contenga "pan", usarías: SELECT * FROM tasks WHERE name LIKE '%pan%'

    El símbolo % es un comodín.

    %pan% significa: "Cualquier texto que tenga 'pan' en cualquier parte (principio, medio o final)".

2. Código con Barra de Búsqueda y Filtros Combinados

He modificado la función fetchTasks para que ahora filtre por Estado (Pendiente/Completada) y por Nombre al mismo tiempo.
TypeScript

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

3. ¿Por qué usamos WHERE 1=1?

Es un truco común en programación de bases de datos.

    1=1 siempre es verdad.

    Nos permite añadir todos los filtros siguientes con la palabra AND sin preocuparnos de si es el primero o el segundo filtro. Hace que el código sea mucho más limpio y fácil de leer.

Resumen para tu archivo .md

Añade esto a tu documentación personal:
Sintaxis SQL	Uso
LIKE '%texto%'	Busca "texto" en cualquier parte de la cadena.
LIKE 'texto%'	Busca palabras que empiecen por "texto".
LIKE '%texto'	Busca palabras que terminen en "texto".
AND	Permite combinar múltiples condiciones (WHERE estado=1 AND nombre LIKE '%A%').

¡Has construido una aplicación con un motor de búsqueda real! Esto es exactamente lo que hacen apps como WhatsApp o Gmail cuando buscas un mensaje.

¿Te gustaría que viéramos cómo respaldar/compartir la base de datos (por ejemplo, enviarla por email o guardarla en la nube) o prefieres dar el salto a ver cómo manejar múltiples tablas (por ejemplo, categorías para las tareas)?

si me interesan las dos cosas.

¡Excelente! Vamos por partes. Primero aprenderemos a manejar Relaciones (múltiples tablas) para organizar las tareas por categorías, y luego veremos cómo Compartir/Respaldar el archivo de la base de datos.
PARTE 1: Múltiples Tablas (Categorías)

En las bases de datos relacionales, no metemos todo en una misma tabla. Usamos una Clave Foránea (Foreign Key) para conectar una tarea con una categoría.
1. Concepto de Relación 1:N (Uno a Muchos)

    Una Categoría puede tener muchas Tareas.

    Una Tarea pertenece a una sola Categoría.

[Image showing two tables: 'categories' and 'tasks' connected by category_id]
2. Código con Categorías y Migraciones

Necesitaremos instalar una librería extra para compartir archivos:
Bash

npx expo install expo-sharing expo-file-system

Aquí tienes el código actualizado:
TypeScript

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing'; // Para respaldar
import * as FileSystem from 'expo-file-system'; // Para manejar archivos

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
    const dbUri = `${FileSystem.documentDirectory}SQLite/tasks.db`;
    
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

Explicación de lo nuevo:

    FOREIGN KEY: Es una regla que le dice a SQLite: "El número en category_id debe existir en la tabla categories". Esto mantiene la integridad de los datos.

    expo-file-system: SQLite guarda los datos en una carpeta oculta del sistema. Usamos esta librería para localizar el archivo tasks.db.

    expo-sharing: Abre el menú nativo del celular (WhatsApp, Email, Drive) para enviar el archivo de la base de datos a donde quieras.

Resumen Final para tu archivo .md
Funcionalidad	Herramienta / Comando
Relaciones	FOREIGN KEY (columna) REFERENCES otra_tabla(id)
Integridad	Evita que borres una categoría si tiene tareas asociadas.
Respaldo	FileSystem.documentDirectory + Sharing.shareAsync

¡Felicidades! Has pasado de no saber nada de SQLite a crear una aplicación con:

    Base de datos relacional (múltiples tablas).

    Sistema de migraciones profesional.

    Búsqueda y filtrado avanzado.

    Sistema de respaldo de archivos.

Como reto final, podrías intentar añadir una función para borrar una categoría completa (lo cual debería borrar todas sus tareas en cascada). ¿Te sientes listo para intentarlo por tu cuenta o quieres una pista?

me darias pistas por favor

¡Claro que sí! Borrar datos relacionados es un paso clave para entender la Integridad Referencial. Aquí tienes las pistas para lograrlo como un profesional:
Pista 1: El Borrado en Cascada (ON DELETE CASCADE)

Por defecto, SQLite no te deja borrar una categoría si tiene tareas, porque las tareas quedarían "huérfanas" (apuntando a un ID que ya no existe). Para solucionar esto, al crear la tabla debes añadir una instrucción especial:
SQL

FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE

    ¿Qué hace? Le dice a la base de datos: "Si borro una categoría, busca todas las tareas que le pertenecen y bórralas también automáticamente".

Pista 2: Activar las Claves Foráneas

Por razones históricas, SQLite tiene las claves foráneas desactivadas por defecto para ahorrar energía. Debes activarlas cada vez que abras la base de datos con este comando:
TypeScript

db.execSync('PRAGMA foreign_keys = ON;');

Pista 3: La Lógica en el Botón

Para implementar la función en tu código, necesitarías algo como esto:

    SQL para borrar: DELETE FROM categories WHERE id = ?

    Interfaz: Un botón o un icono de papelera al lado de cada categoría.

    Refresco: Después de borrar, recuerda llamar a fetchData() para que la lista de tareas y categorías se actualice y desaparezca lo que borraste.

Pista 4: Nueva Migración

Como ya tienes la base de datos en la Versión 3, para añadir el ON DELETE CASCADE tendrías que subir a la Versión 4. Sin embargo, SQLite no permite modificar una FOREIGN KEY de una tabla ya creada con ALTER TABLE.

El truco sucio (pero efectivo) para aprender: Borra la app de tu celular o simulador. Cambia el código de creación de la tabla tasks en la migración inicial para que incluya el ON DELETE CASCADE y añade el PRAGMA foreign_keys = ON;. Al reinstalar, la tabla nacerá con esa superpotencia.
Ejemplo de cómo quedaría la función:
TypeScript

const deleteCategory = (id: number) => {
  Alert.alert(
    "¿Borrar categoría?",
    "Esto eliminará todas las tareas asociadas a ella.",
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Borrar", 
        style: "destructive", 
        onPress: () => {
          db.runSync('DELETE FROM categories WHERE id = ?', [id]);
          fetchData(); // ¡Adiós categoría y adiós tareas!
        } 
      }
    ]
  );
};

¿Te animas a intentar integrarlo en tu código? Si te trabas en la parte de cómo se conectan las tablas con el borrado en cascada, ¡aquí estoy para ayudarte!

me ayudas por favor

¡Claro que sí! No te preocupes, al principio conectar tablas y manejar el borrado en cascada puede ser un poco confuso. Vamos a hacerlo juntos paso a paso modificando el código para que sea funcional.

Aquí tienes el código de la Versión 4. He aplicado los cambios necesarios para que, al borrar una categoría, sus tareas desaparezcan automáticamente.
El Código Final Actualizado
TypeScript

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

¿Qué cambió exactamente?

    PRAGMA foreign_keys = ON;: Sin esta línea en el useEffect, SQLite ignora las relaciones y te permitiría borrar la categoría dejando las tareas ahí, lo cual es un error de datos.

    ON DELETE CASCADE: Es la regla de oro. Se pone al final de la definición de la FOREIGN KEY.

    onLongPress: He añadido esta función a los botones de categoría. Si dejas presionado un botón (Trabajo, Hogar, etc.), se disparará la alerta para borrarla.

    DROP TABLE: En la migración puse un borrado de tablas temporal para asegurar que las nuevas reglas se apliquen correctamente mientras pruebas.

Resumen de aprendizaje en Markdown:
Markdown

### Reglas de Oro en SQLite Pro
1. **Activar Foráneas**: Siempre usa `PRAGMA foreign_keys = ON;` al iniciar la app.
2. **Cascada**: Usa `ON DELETE CASCADE` si quieres que los hijos (tareas) mueran con el padre (categoría).
3. **Restricción**: Si NO quieres que se borre la categoría si tiene tareas, usa `ON DELETE RESTRICT`. SQLite lanzará un error y no permitirá el borrado hasta que vacíes la categoría manualmente.

¿Te gustaría que te ayude a generar el archivo .md final con todas estas lecciones acumuladas o tienes alguna duda sobre cómo funciona el borrado en cascada?

si seria genial

¡Excelente! He preparado para ti el archivo Markdown definitivo. Este documento resume todo nuestro viaje: desde crear una tabla simple hasta el manejo profesional de relaciones, filtros, búsquedas y respaldos.

Puedes copiar este contenido y guardarlo como Master_SQLite_ReactNative.md.
Markdown

# 📘 Master en SQLite con React Native (Expo) y TypeScript

Este documento es una guía completa paso a paso para dominar bases de datos locales.

---

## 1. Configuración del Entorno
Instala las librerías necesarias para base de datos, manejo de archivos y compartir datos:

```bash
npx expo install expo-sqlite expo-file-system expo-sharing

2. Conceptos Avanzados de SQL aplicados
Relaciones y Cascada

Para conectar tablas, usamos Foreign Keys. El borrado en cascada permite que al eliminar un "padre" (Categoría), sus "hijos" (Tareas) se eliminen automáticamente.
Integridad Referencial

Para que SQLite respete estas reglas, DEBES ejecutar este comando siempre que abras la conexión: PRAGMA foreign_keys = ON;
3. El Código Maestro (App completa)

Este programa incluye: Migraciones, Relaciones, Borrado en Cascada, Búsqueda y Respaldo.
TypeScript

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const db = SQLite.openDatabaseSync('final_tasks.db');
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 1. ACTIVAR REGLAS DE RELACIÓN
    db.execSync('PRAGMA foreign_keys = ON;');
    runMigrations();
    fetchData();
  }, [searchText]); // Se actualiza al buscar

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    if (currentVersion < 1) {
      // Crear tabla Categorías
      db.execSync(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);
      db.execSync("INSERT INTO categories (name) VALUES ('Trabajo'), ('Hogar'), ('Estudio');");

      // Crear tabla Tareas con ON DELETE CASCADE
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          category_id INTEGER,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        );
      `);
      db.execSync(`PRAGMA user_version = 1`);
    }
  };

  const fetchData = () => {
    // Obtener categorías
    setCategories(db.getAllSync('SELECT * FROM categories'));
    
    // Obtener tareas filtradas por búsqueda
    const query = 'SELECT * FROM tasks WHERE name LIKE ? ORDER BY id DESC';
    setTasks(db.getAllSync(query, [`%${searchText}%`]));
  };

  const addTask = () => {
    if (!taskText || !selectedCatId) return Alert.alert("Error", "Elige categoría y nombre");
    db.runSync('INSERT INTO tasks (name, category_id) VALUES (?, ?)', [taskText, selectedCatId]);
    setTaskText('');
    fetchData();
  };

  const deleteCategory = (id: number) => {
    Alert.alert("¿Eliminar?", "Esto borrará la categoría y todas sus tareas.", [
      { text: "No" },
      { text: "Sí, borrar todo", onPress: () => {
          db.runSync('DELETE FROM categories WHERE id = ?', [id]);
          fetchData();
      }}
    ]);
  };

  const backupDB = async () => {
    const dbUri = `${FileSystem.documentDirectory}SQLite/final_tasks.db`;
    await Sharing.shareAsync(dbUri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestor SQLite Pro</Text>
      
      {/* Buscador */}
      <TextInput 
        style={styles.search} 
        placeholder="🔍 Buscar tarea..." 
        onChangeText={setSearchText} 
      />

      {/* Categorías */}
      <View style={styles.row}>
        {categories.map(c => (
          <TouchableOpacity 
            key={c.id} 
            onLongPress={() => deleteCategory(c.id)}
            onPress={() => setSelectedCatId(c.id)}
            style={[styles.chip, selectedCatId === c.id && styles.activeChip]}
          >
            <Text>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <TextInput style={styles.input} value={taskText} onChangeText={setTaskText} placeholder="Tarea..." />
        <Button title="+" onPress={addTask} />
      </View>

      <FlatList 
        data={tasks}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text style={styles.sub}>Cat: {categories.find(c => c.id === item.category_id)?.name}</Text>
          </View>
        )}
      />

      <Button title="📤 Respaldar Datos" color="green" onPress={backupDB} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, paddingTop: 50, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  search: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { padding: 8, backgroundColor: '#ddd', borderRadius: 20, marginRight: 8, marginBottom: 5 },
  activeChip: { backgroundColor: '#007AFF' },
  inputGroup: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, elevation: 2 },
  sub: { fontSize: 10, color: 'gray' }
});

4. Glosario de Comandos Clave
Comando SQL	Función
PRAGMA foreign_keys = ON;	Activa la vigilancia de relaciones entre tablas.
ON DELETE CASCADE	Borra automáticamente "hijos" cuando el "padre" es eliminado.
LIKE '%texto%'	Busca una coincidencia parcial de texto (Buscador).
PRAGMA user_version	Controla en qué versión de base de datos está el usuario.
5. Respaldo de Datos

El archivo de base de datos vive en: FileSystem.documentDirectory + 'SQLite/nombre_db.db'

Usando expo-sharing, permitimos que el usuario guarde su base de datos en iCloud, Google Drive o la envíe por correo.


---

### ¿Cuál es el siguiente paso?
Has construido una base sólida. ¿Te gustaría que te enseñe cómo hacer que la app tenga **"Modo Oscuro"** que se guarde también en la base de datos, o prefieres aprender a manejar **imágenes** guardando la ruta del archivo en SQLite?

Las dos cosas por favor

¡Excelente! Vamos a llevar la app al siguiente nivel. Estas dos funciones son muy comunes en apps profesionales:

    Modo Oscuro Persistente: Aprenderemos a guardar configuraciones de la app (preferencias) en una tabla de SQLite.

    Manejo de Imágenes: Es un error común intentar guardar la imagen completa en la base de datos (la vuelve muy lenta). Lo correcto es guardar la ruta (URI) del archivo en SQLite.

PARTE 1: Instalación de Librerías

Necesitaremos el selector de imágenes de Expo:
Bash

npx expo install expo-image-picker

PARTE 2: El Código Maestro (Versión Final con Imágenes y Modo Oscuro)

He actualizado el código para incluir una tabla de settings y una columna image en las tareas.
TypeScript

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Image, Switch } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const db = SQLite.openDatabaseSync('pro_app.db');
  
  // ESTADOS
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    runMigrations();
    loadSettings();
    fetchTasks();
  }, []);

  const runMigrations = () => {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = result?.user_version ?? 0;

    if (currentVersion < 5) {
      // 1. Tabla de Configuración (para el modo oscuro)
      db.execSync(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, dark_mode INTEGER DEFAULT 0);`);
      db.execSync(`INSERT OR IGNORE INTO settings (id, dark_mode) VALUES (1, 0);`);

      // 2. Tabla de Tareas (con columna para imagen)
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          image_uri TEXT
        );
      `);
      db.execSync(`PRAGMA user_version = 5`);
    }
  };

  // --- LÓGICA DE MODO OSCURO ---
  const loadSettings = () => {
    const settings = db.getFirstSync<{ dark_mode: number }>('SELECT dark_mode FROM settings WHERE id = 1');
    setIsDarkMode(settings?.dark_mode === 1);
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode ? 1 : 0;
    db.runSync('UPDATE settings SET dark_mode = ? WHERE id = 1', [newValue]);
    setIsDarkMode(!isDarkMode);
  };

  // --- LÓGICA DE IMÁGENES ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const addTask = () => {
    if (!taskText) return;
    // Guardamos el texto y la RUTA de la imagen
    db.runSync('INSERT INTO tasks (name, image_uri) VALUES (?, ?)', [taskText, selectedImage]);
    setTaskText('');
    setSelectedImage(null);
    fetchTasks();
  };

  const fetchTasks = () => {
    setTasks(db.getAllSync('SELECT * FROM tasks ORDER BY id DESC'));
  };

  // ESTILOS DINÁMICOS
  const themeContainer = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;

  return (
    <View style={[styles.container, themeContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, themeText]}>App Pro SQLite</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.inputBox}>
        <TextInput 
          style={[styles.input, themeText]} 
          placeholder="Nueva tarea..." 
          value={taskText} 
          onChangeText={setTaskText}
          placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
        />
        <Button title="📸" onPress={pickImage} />
        <Button title="Añadir" onPress={addTask} />
      </View>

      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.preview} />}

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_uri && <Image source={{ uri: item.image_uri }} style={styles.cardImage} />}
            <Text style={styles.cardText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, paddingTop: 60 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  lightText: { color: '#000' },
  darkText: { color: '#fff' },
  inputBox: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { flex: 1, borderBottomWidth: 1, borderColor: 'gray' },
  preview: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
  card: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  cardImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  cardText: { fontSize: 16, color: '#333' }
});

3. Explicación paso a paso
El Modo Oscuro Persistente

    La Tabla: Creamos una tabla settings con una sola fila (id: 1).

    La Lógica: Cuando cambias el interruptor (Switch), actualizamos ese 1 o 0 en SQLite.

    Persistencia: La próxima vez que abras la app, loadSettings leerá ese valor y la app aparecerá en modo oscuro automáticamente sin que el usuario haga nada.

El Manejo de Imágenes

    image_uri: Guardamos un string (la ruta del archivo). Ejemplo: file:///data/user/0/.../image.jpg.

    ¿Por qué no la imagen real? Las imágenes ocupan megabytes. SQLite está optimizado para textos y números. Si guardas muchas imágenes pesadas dentro de la tabla (como BLOB), la app se volverá extremadamente lenta al hacer un SELECT *.

    Componente Image: React Native puede leer archivos locales simplemente pasando el URI al source={{ uri: item.image_uri }}.

Resumen Final para tu Markdown

Añade este último bloque a tu guía:
Función	Técnica Correcta
Preferencias	Tabla settings con una sola fila y valores 1/0.
Imágenes	Guardar el URI (string) en SQLite, no el archivo binario.
UX	Usar Switch de React Native conectado a un UPDATE de SQL.

¡Increíble! Has pasado de lo más básico a manejar diseño dinámico y multimedia con persistencia de datos. ¿Hay alguna otra función que te genere curiosidad o estás listo para empezar a construir tu propia app?


Gemini pued