Me puedes explicar paso a paso en forma detallada sabiendo que estoy recien aprendiendo typescript y react native que hace el siguiente fragmento de codigo:if (searchText !== '') {
      query += ' AND name LIKE ?';
      params.push%${searchText}%); // Buscamos el texto en cualquier posición
    }
4:30 p. m.

¡Claro! Te voy a explicar este código paso a paso de manera muy detallada.
¿Qué hace este código?

Este fragmento está construyendo una consulta de base de datos que permite buscar registros cuyo nombre contenga un texto específico.
Explicación línea por línea:
1. if (searchText !== '') {

¿Qué es searchText? Es una variable que contiene el texto que el usuario escribió en una barra de búsqueda.

¿Qué hace !==? Es el operador de "no es estrictamente igual a". Verifica que searchText NO sea una cadena vacía ('').

¿Por qué este if? Solo queremos agregar el filtro de búsqueda si el usuario realmente escribió algo. Si no escribió nada, no tiene sentido filtrar.

Ejemplo:

    Si searchText = "Juan" → la condición es verdadera (no está vacío)
    Si searchText = "" → la condición es falsa (está vacío)

2. query += ' AND name LIKE ?';

¿Qué es query? Es una variable de tipo string que contiene una consulta SQL. Probablemente antes de este código ya tenía algo como "SELECT * FROM usuarios WHERE edad > 18".

¿Qué hace +=? Agrega (concatena) texto al final del string existente.

¿Qué es AND? Es un operador SQL que significa "y también". Combina múltiples condiciones.

¿Qué es LIKE? Es un operador SQL que permite buscar patrones de texto (no necesita coincidencia exacta).

¿Qué es ?? Es un marcador de posición (placeholder). Se reemplazará más tarde con un valor real por seguridad (evita inyección SQL).

Ejemplo: Si query era "SELECT * FROM usuarios WHERE activo = 1", ahora quedará:

"SELECT * FROM usuarios WHERE activo = 1 AND name LIKE ?"

3. params.push(%${searchText}%);

¿Qué es params? Es un array (lista) que contiene los valores que reemplazarán los ? en la consulta.

¿Qué hace push()? Agrega un elemento al final del array.

¿Qué son los %? Son comodines de SQL que significan "cualquier cantidad de caracteres (incluso ninguno)".

    %texto% significa: "cualquier cosa + texto + cualquier cosa"
    Encuentra "texto" en cualquier posición

¿Qué es ${searchText}? Es interpolación de strings (template literals). Inserta el valor de la variable dentro del texto.

Ejemplo:

    Si searchText = "Ana", se agrega "%Ana%" al array
    Esto encontrará: "Ana", "Mariana", "Anabel", "Susana", etc.

Ejemplo completo funcionando:
typescript

// Variables antes del código
let query = "SELECT * FROM usuarios WHERE activo = 1";
let params = [];
let searchText = "Mar";

// Tu código
if (searchText !== '') {
  query += ' AND name LIKE ?';
  params.push(`%${searchText}%`);
}

// Resultado:
// query = "SELECT * FROM usuarios WHERE activo = 1 AND name LIKE ?"
// params = ["%Mar%"]

// Al ejecutarse, el ? se reemplaza con "%Mar%"
// Consulta final: SELECT * FROM usuarios WHERE activo = 1 AND name LIKE '%Mar%'
// Encontrará: "María", "Marco", "Marta", "Mariana", etc.

¿Por qué usar ? y params separados?

Es una práctica de seguridad llamada "consultas parametrizadas". Evita que usuarios maliciosos inyecten código SQL peligroso. La base de datos se encarga de escapar caracteres especiales automáticamente.