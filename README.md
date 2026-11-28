# TECHSOLUTIONS-ECommerce

## Evidencia 84 · Servicios web REST

**GA7-220501096-AA5-EV01 · Jefferson Sosa Borrero · SENA**

La API se distribuye como WAR independiente. El frontend aprobado de la evidencia 82 conserva su funcionamiento con datos locales y todavía no consume el backend.

- [Informe de desarrollo (PDF)](docs/evidencia-84/Informe_Desarrollo_Servicios_Web.pdf) · [Fuente editable](docs/evidencia-84/Informe_Desarrollo_Servicios_Web.md)
- [Documentación REST (PDF)](docs/evidencia-84/Documentacion_API_REST.pdf) · [Fuente editable](docs/evidencia-84/Documentacion_API_REST.md)
- [Matriz maestra y evidencia QA](qa/84-env/seguimiento-84.md)

### Obtener el proyecto

```sh
git clone --branch evidencia-ga7-aa5-ev01-api-rest https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce.git
cd TECHSOLUTIONS-ECommerce
```

También se puede trabajar desde la raíz del ZIP extraído. Usar JDK 21, Maven 3.10.0, MySQL 8.4 y Tomcat 10.1. Node.js 24.x sirve para la regresión HTTP y para React. Confirmar `java -version`, `mvn -version` y que `JAVA_HOME` apunte al JDK. Ajustar las rutas locales según la instalación.

### Preparar MySQL de QA

1. Confirmar la instancia elegida con `SELECT VERSION(), @@port, @@datadir`. Usar un entorno independiente de datos originales.
2. Si `techsolutions_test` no existe, ejecutar con una cuenta autorizada, en este orden, [base](qa/84-env/techsolutions_test-base.sql), [datos ficticios](qa/84-env/techsolutions_test-demo.sql) y [V001](qa/84-env/V001__carrito_pedidos.sql). Usar rutas relativas a la raíz con `SOURCE` en el cliente MySQL. Si el esquema existe, revisar el DDL y su estado. V001 se aplica una sola vez. Cada ALTER confirma por separado y, ante un fallo intermedio, se revisa el esquema antes de reanudar.
3. Separar la cuenta de migración de la cuenta operativa. Crear la cuenta operativa con autenticación desde su sentencia inicial y conceder SELECT, INSERT, UPDATE y DELETE solo en `techsolutions_test.*`. Validar `SELECT DATABASE(), CURRENT_USER()` y `SHOW GRANTS`. En Windows se ofrece [Aprovisionar-CuentaQA.ps1](qa/84-env/Aprovisionar-CuentaQA.ps1) para MySQL local en 3306. Pasar `-Mysql` si el cliente está en otra ruta y `-ArchivoDpapi` con un destino fuera del repositorio. Ejecutar el script solo para una cuenta nueva y con un acceso de migración autorizado.

### Configurar, compilar y preparar el administrador ficticio

| Variable | Valor en un entorno local de QA |
|---|---|
| `TECHSOLUTIONS_DB_HOST` | `127.0.0.1` para MySQL local. |
| `TECHSOLUTIONS_DB_PORT` | Puerto verificado. El script Windows de despliegue espera `3306`. |
| `TECHSOLUTIONS_DB_NAME` | `techsolutions_test`. |
| `TECHSOLUTIONS_DB_USER` | Cuenta operativa limitada. |
| `TECHSOLUTIONS_DB_PASSWORD` | Secreto de esa cuenta, suministrado localmente. |
| `TECHSOLUTIONS_CART_SIGNING_KEY` | Base64 de al menos 32 bytes aleatorios. Mantenerlo estable mientras sigan vigentes las confirmaciones. |
| `TECHSOLUTIONS_QA_ADMIN_EMAIL` | Correo ficticio con dominio `example.test`. |
| `TECHSOLUTIONS_QA_ADMIN_PASSWORD` | Contraseña ficticia de 15–128 caracteres, suministrada localmente. |

Inyectar los secretos en el proceso mediante el mecanismo local autorizado. Si se utiliza el aprovisionador Windows, descifrar DPAPI desde el mismo usuario que creó el archivo y transferirlo al entorno del proceso. Los valores de las variables sensibles no se guardan en Git. Para crear la clave de firma sin mostrarla, en PowerShell:

```powershell
$cartBytes = New-Object byte[] 32
$cartRng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $cartRng.GetBytes($cartBytes) } finally { $cartRng.Dispose() }
$env:TECHSOLUTIONS_CART_SIGNING_KEY = [Convert]::ToBase64String($cartBytes)
```

Desde la raíz ejecutar:

```sh
mvn -f backend-java/pom.xml clean verify
```

El WAR se genera en `backend-java/target/backend-java-1.0-SNAPSHOT.war`. Para aprovisionar el administrador ficticio una sola vez desde PowerShell:

```powershell
$warDir = (Resolve-Path backend-java/target/backend-java-1.0-SNAPSHOT/WEB-INF).Path
java -cp "$warDir/classes;$warDir/lib/*" com.techsolutions.ecommerce.servicio.Usuarios
```

En sistemas tipo Unix, utilizar `:` como separador del classpath. El aprovisionador Java exige el esquema QA. Si el administrador ficticio ya existe, usar su acceso autorizado.

### Desplegar y verificar

- **General.** Iniciar un Tomcat 10.1 aislado con las variables configuradas y desplegar el WAR como `techsolutions-84.war`. Usar el puerto y contexto acordados. Verificar la conexión JDBC a QA antes de ejercer escrituras.
- **Windows local.** Con 8080 libre, usar [Iniciar-TomcatQA.ps1](qa/84-env/Iniciar-TomcatQA.ps1) con `-TomcatHome` apuntando a la instalación y `-Base` a una carpeta temporal nueva. Verifica el esquema y publica solo en loopback.
- **Lectura inicial.** Abrir `http://127.0.0.1:8080/techsolutions-84/api/v1/productos` o ejecutar `curl.exe -i http://127.0.0.1:8080/techsolutions-84/api/v1/categorias` en Windows. Para mutaciones autenticadas seguir la documentación de sesión y CSRF.
- **Pruebas.** Confirmar el esquema y los permisos antes de habilitar `TECHSOLUTIONS_RUN_QA_INTEGRATION=true` y repetir Maven. Con el Tomcat de QA desplegado, usar `TECHSOLUTIONS_QA_INTEGRAL=true` y ejecutar `node qa/84-env/verificar-api.mjs completa`. El proceso de prueba requiere el administrador ficticio y la misma clave de firma que Tomcat para cubrir vencimiento y replay. Solo crea datos ficticios en QA.
- **React opcional.** Desde `frontend-react/`, ejecutar `npm ci` y `npm run dev`. Sus antecedentes y comandos de verificación se conservan en la sección histórica.

Las evidencias de 84.6 corresponden a HTTP local. TLS, cookies Secure en HTTPS, carga y disponibilidad requieren otro perfil de validación.

## Antecedente · GA7-220501096-AA4-EV03

- **Institución:** Servicio Nacional de Aprendizaje (SENA)
- **Programa:** Análisis y Desarrollo de Software
- **Aprendiz:** Jefferson Sosa Borrero
- **Evidencia:** GA7-220501096-AA4-EV03 — Componente Frontend

TECHSOLUTIONS-ECommerce presenta un catálogo de productos tecnológicos y un recorrido de compra académico, desde la búsqueda hasta la factura simulada. El frontend usa React 19, React Router 7, Vite 8, Bootstrap 5, Bootstrap Icons, Inter y ESLint. La aplicación funciona con el catálogo incluido y almacenamiento local del navegador.

- `frontend-react/` contiene el código, las imágenes públicas, la configuración y el lockfile. Las rutas y páginas se apoyan en componentes, contextos, hooks, servicios y utilidades.
- `qa/` contiene las matrices, scripts y capturas de 82 y EV03.
- El repositorio conserva el prototipo HTML de referencia y el módulo Java de evidencias anteriores. El frontend funciona de forma independiente.

### Inicio rápido

Usar Node.js 24.x con npm. Desde la raíz del proyecto o del ZIP extraído:

```sh
cd frontend-react
npm ci
npm run dev
```

Abrir la URL que imprime Vite, normalmente `http://localhost:5173/`. Desde esa misma carpeta, ejecutar `npm run lint` y `npm run build` para validar y compilar. En PowerShell, usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

El frontend ofrece inicio, catálogo con filtros, detalle y relacionados, acceso por rol, panel del cliente, administración de demostración, contacto, carrito, pago y factura simulados, registro simulado y página 404. La guía del frontend contiene las cuentas ficticias, las rutas y los límites de cada simulación. [Guía de ejecución](frontend-react/README.md)

La actividad 82 documenta el flujo de compra, teclado, responsive y toque emulado. EV03.4 documenta las pantallas nuevas, las redirecciones por rol y la regresión incremental. El prototipo HTML del repositorio se usó como referencia; la versión aprobada y los requisitos originales siguen pendientes de respaldo documental. [QA de 82](qa/seguimiento-actividad-82.md) · [Matriz maestra EV03](qa/seguimiento-ev03.md)

**Repositorio y rama de entrega:** [TECHSOLUTIONS-ECommerce · evidencia-ga7-aa4-frontend-react](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/tree/evidencia-ga7-aa4-frontend-react)

---

## Documentación histórica · GA7-220501096-AA2-EV01

Esta sección conserva las instrucciones de la entrega Java anterior. Para ejecutar el WAR de la evidencia 84, utilizar la configuración y el esquema QA descritos al inicio del README.

Las siguientes secciones describen el módulo Java y las instrucciones de aquella evidencia. La entrega Frontend EV03 se ejecuta siguiendo la guía anterior.

## Proyecto de software – SENA

**Programa de formación:** Análisis y Desarrollo de Software (ADSO)  
**Evidencia:** GA7-220501096-AA2-EV01  
**Actividad:** Codificación de módulos del software  
**Aprendiz:** Jefferson Sosa Borrero  
**Ficha:** 3336153  
**Institución:** Servicio Nacional de Aprendizaje (SENA)

## 1. Descripción del proyecto

TECHSOLUTIONS-ECommerce es un proyecto de comercio electrónico orientado a la comercialización de productos tecnológicos mediante una plataforma digital.

El sistema contempla funcionalidades de consulta de productos, gestión de inventarios, administración de usuarios, carrito de compras y procesamiento de pedidos.

Para la evidencia GA7-220501096-AA2-EV01 se desarrolló un módulo backend en Java que permite administrar productos mediante operaciones CRUD y establecer una conexión con una base de datos MySQL utilizando JDBC.

Este módulo constituye una implementación funcional de la capa de acceso a datos del proyecto.

## 2. Antecedentes y evolución del proyecto

Durante las primeras etapas de análisis y diseño, el sistema de comercio electrónico fue documentado bajo el nombre **SmartCommerce IA**.

Posteriormente, durante el desarrollo y la implementación, se adoptó el nombre **TECHSOLUTIONS-ECommerce**.

Ambos nombres corresponden al mismo proyecto de software.

Los documentos elaborados anteriormente constituyen los antecedentes de diseño utilizados como referencia para el desarrollo del módulo de productos.

Entre ellos se encuentran:

- **GA2-220501093-AA1:** Documentación de casos de uso e historias de usuario.
- **GA2-220501093-AA2-EV01:** Modelo de dominio del sistema de comercio electrónico.
- **GA4-220501095-AA1-EV01:** Modelo conceptual y lógico de la base de datos.
- **GA4-220501095-AA2-EV03:** Diagrama de clases del proyecto.
- **GA4-220501095-AA3-EV01:** Diagrama de despliegue y arquitectura del software.

En estos documentos se identifican la entidad Producto, la administración del inventario, las relaciones con categorías y la utilización de MySQL.

La implementación actual se concentra específicamente en el módulo de gestión de productos. Los demás componentes descritos en los modelos anteriores forman parte del alcance general y de la evolución prevista del sistema.

## 3. Objetivo general

Desarrollar un módulo funcional de gestión de productos utilizando Java, JDBC y MySQL, implementando operaciones de inserción, consulta, actualización y eliminación de registros, aplicando principios de programación orientada a objetos, estándares de codificación y control de versiones.

## 4. Objetivos específicos

- Implementar la conexión entre Java y MySQL mediante JDBC.
- Crear una clase modelo para representar los productos.
- Implementar las operaciones CRUD utilizando sentencias SQL preparadas.
- Organizar el código en paquetes según sus responsabilidades.
- Comprobar el funcionamiento del módulo mediante pruebas de ejecución.
- Gestionar el código fuente mediante Git y GitHub.
- Documentar las instrucciones necesarias para compilar y ejecutar el proyecto.

## 5. Tecnologías utilizadas

| Tecnología | Utilización |
|---|---|
| Java 21 | Desarrollo del backend |
| JDBC | Conexión y operaciones con MySQL |
| MySQL 8.4.3 | Sistema gestor de base de datos |
| MySQL Connector/J 9.5.0 | Controlador JDBC |
| Apache Maven 3.10.0 | Gestión de dependencias y compilación |
| Git | Control de versiones |
| GitHub | Repositorio remoto |
| Visual Studio Code | Edición del código |
| Laragon | Entorno de desarrollo local |
| HTML, CSS y JavaScript | Interfaz frontend existente |

## 6. Estructura del proyecto

```text
TECHSOLUTIONS-ECommerce/
│
├── backend-java/
│   ├── pom.xml
│   └── src/
│       └── main/
│           └── java/
│               └── com/
│                   └── techsolutions/
│                       └── ecommerce/
│                           ├── MenuCRUD.java
│                           ├── PruebaCRUD.java
│                           ├── conexion/
│                           │   ├── ConexionBD.java
│                           │   └── PruebaConexion.java
│                           ├── dao/
│                           │   └── ProductoDAO.java
│                           └── modelo/
│                               └── Producto.java
│
├── css/
├── img/
├── js/
│
├── index.html
├── admin.html
├── carrito.html
├── catalogo.html
├── cliente.html
├── contacto.html
├── login.html
├── producto.html
│
├── .gitignore
├── ENLACE_REPOSITORIO.txt
└── README.md
```

## 7. Arquitectura del módulo Java

El backend está organizado siguiendo una separación de responsabilidades.

### 7.1. Clase Producto

**Ubicación:** `modelo/Producto.java`

Representa los datos de un producto almacenado en la base de datos.

Sus atributos son:

- idProducto
- idCategoria
- nombreProducto
- marca
- descripcion
- precio
- stock
- especificaciones
- estado

La clase utiliza encapsulamiento mediante atributos privados y métodos públicos de acceso (`getters` y `setters`).

### 7.2. Clase ConexionBD

**Ubicación:** `conexion/ConexionBD.java`

Se encarga de establecer la conexión JDBC con la base de datos MySQL.

La contraseña se obtiene mediante la variable de entorno `TECHSOLUTIONS_DB_PASSWORD`, evitando almacenar directamente la credencial en el código fuente.

### 7.3. Clase ProductoDAO

**Ubicación:** `dao/ProductoDAO.java`

Implementa el acceso a datos mediante el patrón DAO (*Data Access Object*).

Incluye los métodos:

| Método | Función |
|---|---|
| `insertar()` | Registra un nuevo producto |
| `consultarPorId()` | Consulta un producto por identificador |
| `listarTodos()` | Obtiene el listado de productos |
| `actualizar()` | Modifica un producto existente |
| `eliminar()` | Elimina un producto |
| `convertirProducto()` | Convierte los resultados SQL en objetos Producto |

Se utilizan `PreparedStatement` y mecanismos de cierre automático de recursos para gestionar las operaciones JDBC.

### 7.4. Clase MenuCRUD

**Ubicación:** `MenuCRUD.java`

Proporciona una interfaz de consola para interactuar con las operaciones del módulo.

Permite:

1. Registrar productos.
2. Consultar todos los productos.
3. Consultar productos por ID.
4. Actualizar productos.
5. Eliminar productos.
6. Salir del programa.

Incluye validaciones de entrada y confirmaciones para determinadas operaciones.

### 7.5. Clases de prueba

**PruebaConexion.java:** permite comprobar la conexión con MySQL.

**PruebaCRUD.java:** contiene operaciones de prueba sobre registros específicos. Su ejecución puede modificar o eliminar información; por ello, debe utilizarse únicamente en un entorno controlado.

## 8. Base de datos

**Motor:** MySQL  
**Base de datos:** `techsolutions`  
**Tabla principal del módulo:** `producto`

La tabla de productos utiliza los siguientes campos:

| Campo | Descripción |
|---|---|
| id_producto | Identificador del producto |
| id_categoria | Categoría asociada |
| nombre_producto | Nombre comercial |
| marca | Marca del producto |
| descripcion | Descripción |
| precio | Valor comercial |
| stock | Cantidad disponible |
| especificaciones | Características técnicas |
| estado | Estado del producto |

El identificador `id_producto` se genera automáticamente mediante la base de datos.

El modelo actual incorpora campos específicos para productos tecnológicos, como marca y especificaciones, que amplían la información del modelo conceptual inicial.

## 9. Implementación JDBC

La conexión con MySQL se realiza utilizando el controlador MySQL Connector/J.

Las operaciones del módulo emplean sentencias SQL preparadas.

Las principales instrucciones implementadas corresponden a:

- `INSERT`: registrar productos.
- `SELECT`: consultar productos.
- `UPDATE`: modificar productos.
- `DELETE`: eliminar productos.

El uso de `PreparedStatement` permite enviar parámetros a las consultas sin concatenar directamente los valores introducidos por el usuario.

## 10. Requisitos para ejecutar el proyecto

Se requiere tener instalados y configurados:

- JDK 21.
- Apache Maven.
- MySQL.
- Base de datos `techsolutions` con su tabla `producto`.
- Credenciales válidas para conectarse a MySQL.

El servidor MySQL debe estar iniciado antes de ejecutar las operaciones JDBC.

## 11. Configuración de la conexión

La clase `ConexionBD` obtiene la contraseña desde la variable de entorno:

`TECHSOLUTIONS_DB_PASSWORD`

En PowerShell, se puede configurar para la sesión actual mediante:

```powershell
$env:TECHSOLUTIONS_DB_PASSWORD = "TU_CONTRASENA"
```

Se debe reemplazar `TU_CONTRASENA` por la contraseña real del entorno local.

Si la cuenta MySQL no utiliza contraseña, la variable puede establecerse como una cadena vacía:

```powershell
$env:TECHSOLUTIONS_DB_PASSWORD = ""
```

Las credenciales no deben publicarse en GitHub ni incorporarse al archivo comprimido de entrega.

## 12. Compilación del backend

Abrir PowerShell desde la carpeta principal del proyecto:

```powershell
cd C:\laragon\www\TECHSOLUTIONS-ECommerce
```

Ejecutar:

```powershell
mvn -f backend-java/pom.xml clean compile
```

Una compilación correcta mostrará:

```text
BUILD SUCCESS
```

## 13. Ejecución del módulo CRUD

Desde la carpeta principal del proyecto, ejecutar:

```powershell
mvn -f backend-java/pom.xml exec:java "-Dexec.mainClass=com.techsolutions.ecommerce.MenuCRUD"
```

El programa mostrará un menú interactivo para gestionar los productos registrados en MySQL.

Las operaciones de creación, actualización y eliminación pueden modificar los datos existentes, por lo que se recomienda utilizar registros de prueba.

## 14. Pruebas realizadas

Durante el desarrollo del módulo se efectuaron comprobaciones funcionales de las operaciones CRUD.

| Prueba | Resultado |
|---|---|
| Conexión JDBC con MySQL | Satisfactoria |
| Registro de producto | Satisfactorio |
| Consulta de productos | Satisfactoria |
| Consulta por identificador | Satisfactoria |
| Actualización de producto | Satisfactoria |
| Eliminación de producto de prueba | Satisfactoria |
| Compilación Maven | BUILD SUCCESS |

Las pruebas de CRUD se realizaron mediante el menú de consola y registros temporales, sin requerir la integración con la interfaz web.

## 15. Estándares de codificación

El código Java aplica las siguientes convenciones:

- Clases nombradas con `PascalCase`.
- Métodos y variables nombrados con `camelCase`.
- Paquetes escritos en minúsculas.
- Constantes identificadas con letras mayúsculas.
- Atributos privados con acceso mediante métodos públicos.
- Organización del código según responsabilidades.
- Uso de nombres descriptivos.
- Utilización de `PreparedStatement` para las operaciones SQL.

Las declaraciones de clases, métodos, atributos y variables locales examinadas fueron revisadas para comprobar las convenciones de nomenclatura.

## 16. Control de versiones

El proyecto utiliza Git para gestionar las modificaciones del código fuente.

El repositorio remoto se encuentra alojado en GitHub.

**Repositorio:**

https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce

**Rama principal:** `master`

El repositorio contiene los archivos del frontend, el backend Java, la configuración Maven y la documentación técnica.

El archivo `.gitignore` evita incluir determinados archivos generados automáticamente, configuraciones locales y archivos sensibles.

## 17. Relación con los artefactos de diseño anteriores

El desarrollo del módulo CRUD se fundamenta en los modelos y casos de uso elaborados durante las actividades anteriores del programa ADSO.

**Caso de uso: Gestionar productos**

Actor: Administrador.

Funcionalidades identificadas en el diseño:

- Crear productos.
- Editar productos.
- Eliminar productos.

La implementación actual también permite consultar productos, completando las operaciones CRUD.

**Diagrama de clases**

El modelo anterior contempla una clase Producto con atributos relacionados con el identificador, nombre, descripción, precio y existencias.

La implementación Java conserva estos conceptos y adapta los atributos a la estructura de la base de datos utilizada.

**Modelo de base de datos**

El diseño conceptual y lógico establece las entidades Producto y Categoría y su relación.

La implementación actual utiliza los campos `id_producto` e `id_categoria`, manteniendo esa referencia estructural.

**Diagrama de despliegue**

La arquitectura propuesta contempla una aplicación de comercio electrónico conectada a una base de datos MySQL mediante JDBC.

El módulo Java implementado materializa la comunicación con la base de datos correspondiente a esta parte de la arquitectura.

## 18. Alcance y limitaciones

La presente evidencia se concentra en la codificación del módulo de productos.

Se encuentra implementada y probada la funcionalidad CRUD mediante Java, JDBC y MySQL.

El frontend HTML, CSS y JavaScript existe dentro del proyecto, pero todavía no está integrado directamente con el backend Java.

Por lo tanto, no se presenta el sistema completo como una aplicación web integrada.

Los módulos de usuarios, pedidos, pagos, reseñas, fidelización y otras funcionalidades contempladas en los diseños anteriores no forman parte del CRUD Java implementado en esta evidencia.

## 19. Entrega de la evidencia

**Código:** GA7-220501096-AA2-EV01

**Formato de entrega:** ZIP.

**Nombre del archivo:**

`JEFFERSONSOSABORRERO_AA2_EV01.zip`

La entrega contiene los archivos fuente del proyecto y el documento `ENLACE_REPOSITORIO.txt`, con la dirección del repositorio GitHub.

Los archivos generados por la compilación y la carpeta interna de Git no forman parte del paquete de entrega.

## 20. Conclusiones

El desarrollo del módulo de productos permitió aplicar los conocimientos de programación orientada a objetos, conexión a bases de datos mediante JDBC y gestión de información con MySQL.

Se implementaron las operaciones de inserción, consulta, actualización y eliminación de productos, organizando el código en clases y paquetes con responsabilidades definidas.

Las pruebas realizadas permitieron verificar el funcionamiento del módulo y su compilación mediante Maven.

El uso de Git y GitHub facilitó el control de versiones y la conservación del código fuente.

Finalmente, el módulo implementado mantiene una relación funcional con los casos de uso, modelos de clases y diseños de base de datos elaborados en las etapas anteriores del proyecto, inicialmente denominado SmartCommerce IA y posteriormente TECHSOLUTIONS-ECommerce.

---

**Servicio Nacional de Aprendizaje – SENA**  
**Programa:** Análisis y Desarrollo de Software  
**Evidencia:** GA7-220501096-AA2-EV01  
**Aprendiz:** Jefferson Sosa Borrero
