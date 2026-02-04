El error "Property 'documentDirectory' does not exist on type 'typeof import'" en Visual Studio Code generalmente indica un problema con la configuración de TypeScript o la versión de la API de
expo-file-system que estás utilizando. 
Aquí te presento las posibles soluciones:
1. Revisa la Importación
Asegúrate de que estás importando * as FileSystem o usando la destructuración correcta, dependiendo de la versión de la API que estés usando. 

    API Heredada (Legacy) / Estándar anterior: Esta API usa propiedades estáticas como FileSystem.documentDirectory.
    typescript

    import * as FileSystem from 'expo-file-system';
    const fileUri = FileSystem.documentDirectory + 'myFile.txt';

    Nueva API (Introducida en SDK 54 como estable): La nueva API es orientada a objetos y utiliza la clase Directory y la constante Paths en lugar de FileSystem.documentDirectory directamente.
    typescript

    import { Paths, File, Directory } from 'expo-file-system';

    // Para acceder al directorio:
    const docsDirUri = Paths.document.uri; 
    // O crea una instancia de Directory:
    const docsDir = new Directory(Paths.document);
    // Luego puedes crear un archivo dentro:
    const file = new File(docsDir, 'myFile.txt');

    Si tu proyecto está usando una versión reciente de Expo, es probable que la nueva API sea la estándar. 

2. Actualiza las Dependencias de Expo
Es posible que estés usando una versión antigua del paquete expo-file-system que no es compatible con la versión de TypeScript o del SDK de Expo en tu proyecto, o viceversa. 

    Ejecuta npx expo doctor para verificar si hay problemas de compatibilidad en tus dependencias.
    Si es necesario, actualiza tus paquetes de Expo ejecutando npx expo upgrade. 

3. Verifica la Versión del SDK 
Si tu proyecto usa una versión muy antigua de Expo, la documentación y el soporte pueden variar. Revisa la documentación de expo-file-system para la versión específica de tu SDK de Expo en la sección de Documentación de Expo.
4. Reinicia Visual Studio Code y el Servidor de TypeScript 
A veces, VS Code no actualiza correctamente la caché de tipos después de cambios en las dependencias o archivos de configuración. 

    Reinicia VS Code.
    Intenta reiniciar el servidor de TypeScript en VS Code (puedes buscar "Restart TypeScript server" en la paleta de comandos). 

Nota Importante sobre documentDirectory
Ten en cuenta que la ruta completa de FileSystem.documentDirectory (o Paths.document.uri en la nueva API) contiene un UUID que cambia con cada instalación de la aplicación (por ejemplo, al actualizar por TestFlight o la App Store). No debes guardar la URI completa de los archivos en tu almacenamiento persistente (como AsyncStorage). En su lugar, guarda solo el nombre o la ruta relativa del archivo y concaténalos con FileSystem.documentDirectory en tiempo de ejecución.