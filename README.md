# TECHSOLUTIONS-ECommerce

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