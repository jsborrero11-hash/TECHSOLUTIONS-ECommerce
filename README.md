# TECHSOLUTIONS-ECommerce

## Descripción del proyecto

TECHSOLUTIONS-ECommerce es un proyecto de software orientado a la gestión de una tienda virtual de productos tecnológicos.

El proyecto incluye una interfaz web desarrollada con HTML, CSS y JavaScript, así como un módulo backend desarrollado en Java para administrar la información de productos mediante una base de datos MySQL.

Este desarrollo forma parte de las actividades de formación del programa Análisis y Desarrollo de Software (ADSO) del SENA.

## Objetivo general

Desarrollar módulos de software que permitan gestionar productos de una tienda virtual, aplicando programación orientada a objetos, conexión a bases de datos y operaciones CRUD.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Java 21
- JDBC
- MySQL 8
- Apache Maven
- Git y GitHub
- Visual Studio Code
- Laragon

## Estructura del proyecto

```text
TECHSOLUTIONS-ECommerce/
├── assets/
├── backend-java/
│   ├── pom.xml
│   └── src/main/java/com/techsolutions/ecommerce/
│       ├── MenuCRUD.java
│       ├── PruebaCRUD.java
│       ├── conexion/
│       │   ├── ConexionBD.java
│       │   └── PruebaConexion.java
│       ├── dao/
│       │   └── ProductoDAO.java
│       └── modelo/
│           └── Producto.java
├── css/
├── img/
├── js/
├── admin.html
├── carrito.html
├── catalogo.html
├── cliente.html
├── contacto.html
├── index.html
├── login.html
├── producto.html
└── README.md
```

## Módulo backend Java

El backend implementa un sistema de administración de productos utilizando programación orientada a objetos y acceso a datos mediante JDBC.

### Clases principales

**Producto.java**

Representa el modelo de datos de los productos de la tienda.

**ConexionBD.java**

Gestiona la conexión entre la aplicación Java y la base de datos MySQL.

**ProductoDAO.java**

Implementa las operaciones de acceso y manipulación de datos mediante consultas SQL preparadas.

**MenuCRUD.java**

Proporciona un menú interactivo por consola para ejecutar las operaciones de administración de productos.

**PruebaConexion.java**

Permite comprobar la conexión con MySQL.

**PruebaCRUD.java**

Contiene pruebas de las operaciones CRUD realizadas durante el desarrollo.

## Operaciones CRUD implementadas

| Operación | Funcionalidad |
|-----------|---------------|
| CREATE | Registrar nuevos productos |
| READ | Consultar todos los productos |
| READ | Consultar un producto por ID |
| UPDATE | Actualizar información de productos |
| DELETE | Eliminar productos mediante confirmación |

Las operaciones utilizan sentencias SQL preparadas y manejo de conexiones mediante JDBC.

## Base de datos

El sistema utiliza una base de datos MySQL denominada `techsolutions`.

Las tablas del modelo de datos son:

- usuario
- categoria
- producto
- carrito
- detalle_carrito
- pedido
- detalle_pedido

El módulo CRUD desarrollado trabaja principalmente con la tabla `producto`.

## Requisitos de ejecución

Para ejecutar el backend se necesita:

1. Tener instalado Java JDK 21.
2. Tener instalado Apache Maven.
3. Contar con MySQL en funcionamiento.
4. Disponer de la base de datos `techsolutions` y su estructura correspondiente.
5. Configurar las credenciales de conexión según el entorno local.

La clase `ConexionBD` permite obtener la contraseña de MySQL desde la variable de entorno `TECHSOLUTIONS_DB_PASSWORD`.

## Compilación del backend

Desde la raíz del proyecto ejecutar:

```powershell
mvn -f backend-java/pom.xml clean compile
```

## Ejecución del menú CRUD

Desde la raíz del proyecto ejecutar:

```powershell
mvn -f backend-java/pom.xml exec:java "-Dexec.mainClass=com.techsolutions.ecommerce.MenuCRUD"
```

El menú permite seleccionar las operaciones CRUD mediante opciones numéricas.

## Pruebas funcionales realizadas

Se realizaron pruebas manuales del módulo de productos:

1. Registro de un producto de prueba.
2. Consulta del listado de productos.
3. Consulta individual mediante identificador.
4. Actualización del nombre, precio y stock.
5. Verificación de los datos actualizados.
6. Eliminación del producto con confirmación.
7. Verificación de que el producto eliminado ya no existe.
8. Comprobación de que los productos existentes permanecen intactos.

Las pruebas funcionales principales finalizaron satisfactoriamente.

## Control de versiones

El código fuente se administra mediante Git y se encuentra publicado en GitHub.

Repositorio:

https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce

## Evidencia de formación

**Programa:** Análisis y Desarrollo de Software (ADSO)

**Evidencia:** GA7-220501096-AA2-EV01

**Actividad:** Codificación de módulos del software.

**Proyecto:** TECHSOLUTIONS-ECommerce

El desarrollo evidencia la implementación de clases Java, conexión con MySQL, operaciones CRUD, validaciones y control de versiones.