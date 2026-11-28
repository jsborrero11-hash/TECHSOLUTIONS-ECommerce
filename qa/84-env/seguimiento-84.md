# Matriz maestra de la evidencia 84 · Implementación 84.5

Fecha de verificación: 27 de noviembre de 2026. Los **19 contratos** están diseñados, implementados, compilados y verificados técnicamente por HTTP. La revisión integral corresponde a **84.6**.

## Fuentes

- D1 · `Informe_Final_Sistema_Ecommerce_GA2_220501093_AA3_EV02.docx`.
- D2 · *Determinación de las especificaciones funcionales del software y metodología a utilizar*. Sus historias se usan como ejemplos de referencia.
- D3 · `GA5-220501095-AA1-EV02 Elaboración de Interfaz Gráfica y Mapa de Navegación.docx`.
- 84.1 · Inventario aprobado del CRUD y el esquema. 84.3 y 84.4 · Diseño de contratos y ajustes aprobados.

La trazabilidad utiliza los extractos recuperados. Los códigos de D1 y D3 conservan su identificación documental. Las rutas de la matriz son relativas a `/api/v1`.

| ID | Método y ruta | Requisito y fuente | Archivos principales | Validación y autorización | Persistencia | Evidencia ejecutada |
|---|---|---|---|---|---|---|
| 84-01 | GET `/productos` | D1 RF03, D3 RF-03/RF-04, D2 HU-03 | CatalogoApi, Catalogo, ProductoDAO | Búsqueda literal, categoría, página; inactivos y TODOS para administrador | producto, categoria | T01 · 200 búsqueda/página, 403 filtro restringido, 200 admin |
| 84-02 | GET `/productos/{id}` | D1 RF03, D3 RF-03 | CatalogoApi, Catalogo, ProductoDAO | ID positivo, público para activos y administrador para inactivos | producto, categoria | T02 · 200 detalle, 404 inactivo para público, 200 admin, stock constatado en T17 |
| 84-03 | GET `/categorias` | D3 RF-03/RF-04 | CatalogoApi, Catalogo | Público, página y orden por ID | categoria | T03 · 200 listado, 405 con Allow y 406 por negociación |
| 84-04 | POST `/productos` | D1 RF03, D2 HU-05, administrador D3 | CatalogoApi, Catalogo, ProductoDAO | ADMIN + CSRF, precio, categoría, campos y longitudes | producto, categoria | T04 · 201 con Location; 403, 415, 422 y 400 por JSON duplicado |
| 84-05 | PUT `/productos/{id}` | D1 RF03, D2 HU-05 | CatalogoApi, Catalogo, ProductoDAO | ADMIN + CSRF, datos completos; conserva stock; permite desactivar | producto, categoria | T05 · 200 edición/desactivación con stock intacto |
| 84-06 | PATCH `/productos/{id}/stock` | Administrador e inventario D3 | ApiServlet, CatalogoApi, Catalogo, ProductoDAO | ADMIN + CSRF, enteros no negativos, comparación atómica | producto | T06 · 200 ajuste, 409 stock esperado obsoleto |
| 84-07 | DELETE `/productos/{id}` | D1 RF03, gestión D3, CRUD 84.1 | CatalogoApi, Catalogo, ProductoDAO | ADMIN + CSRF, ID y restricción de FK | producto, detalle_carrito, detalle_pedido | T07 · 204 borrado de fixture libre, 409 por pedido asociado |
| 84-08 | GET `/sesion/csrf` | D1 RF02, D3 RF-02, decisión 84.3 | IdentidadApi, Seguridad, web.xml, context.xml | Origen, token vinculado a cookie | HttpSession | T08 · 200 con token/cookie, 403 origen ajeno |
| 84-09 | POST `/usuarios` | D1 RF01, D3 RF-01, D2 HU-01 | IdentidadApi, Usuarios, Contrasenas | CSRF, límites, correo normalizado y único, rol CLIENTE fijado en servidor | usuario | T09 · 201 sin Location, 409 correo duplicado, 400 rol ajeno, 403 CSRF |
| 84-10 | POST `/sesion` | D1 RF02, D3 RF-02, D2 HU-02 | IdentidadApi, Usuarios, Contrasenas, Seguridad | CSRF, Argon2id, límite de intentos y rotación | usuario, HttpSession | T10 · 200 cliente/admin con rotación comprobada, 401 credencial errónea |
| 84-11 | GET `/sesion` | D1 RF02 y D3 RF-02 | IdentidadApi, Seguridad | Sesión vigente | HttpSession | T11 · 200 con identidad, 401 sin sesión |
| 84-12 | DELETE `/sesion` | D3 RF-02 | IdentidadApi, Seguridad | Sesión y CSRF, invalidación y expiración de cookie | HttpSession | T12 · 204; consulta posterior 401 |
| 84-13 | GET `/carrito` | D1 RF04, actor Cliente D3 | CarritoApi, Carritos, CarritoDAO, ConfirmacionCarrito | CLIENTE, propiedad por sesión, precios vigentes, cotización firmada | carrito, detalle_carrito, producto | T13 · 200 vacío/con ítems/aislado, 403 administrador |
| 84-14 | PUT `/carrito/items/{idProducto}` | D1 RF04, D2 HU-04 | CarritoApi, Carritos, CarritoDAO, ProductoDAO | CLIENTE + CSRF, 1–99, activo, stock y unicidad | carrito, detalle_carrito, producto | T14 · 201 con Location, 200 repetición, 422 cantidad y 409 stock |
| 84-15 | DELETE `/carrito/items/{idProducto}` | D1 RF04, actor Cliente D3 | CarritoApi, Carritos, CarritoDAO | CLIENTE + CSRF, propiedad e idempotencia | carrito, detalle_carrito | T15 · 204 inicial y repetido |
| 84-16 | DELETE `/carrito` | D1 RF04, actor Cliente D3 | CarritoApi, Carritos, CarritoDAO | CLIENTE + CSRF, propiedad, revisión por cambios efectivos | carrito, detalle_carrito | T16 · 204; lectura posterior vacía |
| 84-17 | POST `/pedidos` | Procesos D1, actor Cliente D3, ajustes 84.4 | PedidosApi, Pedidos, PedidoDAO, ProductoDAO, CarritoDAO, Sql, ConfirmacionCarrito | CLIENTE + CSRF, UUID, token propio y vigente, revisión, cantidades, precios, stock, total BigDecimal y huella | pedido, detalle_pedido, carrito, detalle_carrito, producto | T17 · 201, 200 replay, 400 confirmación/UUID inválidos, 409 precio/revisión/vencimiento/clave usada; concurrencia y rollback verificados |
| 84-18 | GET `/pedidos` | Procesos D1, historial de Cliente D3 | PedidosApi, Pedidos, PedidoDAO | CLIENTE, propietario y paginación | pedido | T18 · 200 historial propio y aislamiento |
| 84-19 | GET `/pedidos/{id}` | Procesos D1, actor Cliente D3 | PedidosApi, Pedidos, PedidoDAO | CLIENTE e ID; inexistente o ajeno produce 404 | pedido, detalle_pedido | T19 · 200 pedido propio, 404 ajeno |

### Casos transversales y alcance de la verificación

- **T17** · Tras conflicto por precio/revisión, stock y carrito conservaron sus valores y el historial siguió vacío. Dos clientes disputaron la última unidad: un 201, un 409. Dos solicitudes simultáneas con la misma clave produjeron 201 y 200 con el mismo pedido. Se repitió una solicitud tras vencer la cotización, con el mismo pedido. La prueba JDBC indujo un fallo después de las escrituras y verificó el rollback de la operación.
- **T20** · Verificación básica de roles, origen, CSRF, JSON, encabezados, cookies locales y JSP histórico. Acceso anónimo al listado 200; formulario y POST sin sesión 401; POST de cliente y POST administrativo sin CSRF 403; POST administrativo válido 302.
- **T21** · El despliegue de 84.5 es HTTP en loopback. TLS, pruebas de carga para D1 RNF01 y medición de disponibilidad para D1 RNF03 requieren el perfil correspondiente. La evidencia presente cubre la ejecución técnica local, Argon2id y los atributos de cookie observados.
- **T22** · La rama y el commit base están verificados. `git diff --exit-code 92b74c8 -- frontend-react` devuelve cero. El seguimiento de commits de implementación queda pendiente de autorización.
- Este conjunto verifica escenarios concretos para **T01–T20** y deja trazados **T21–T22**. La revisión integral de todas sus variantes corresponde a 84.6.

## Reproducción en QA

1. Verificar identidad de la instancia local y leer `SELECT DATABASE(), CURRENT_USER()` y `SHOW GRANTS` con la cuenta operativa. Debe tener solo SELECT, INSERT, UPDATE y DELETE sobre `techsolutions_test.*`. Se comprobó el rechazo de UPDATE contra el original usando `EXPLAIN UPDATE`, sin ejecutar la escritura.
2. En un entorno nuevo, usar la cuenta de migración para ejecutar [DDL base](techsolutions_test-base.sql), [datos ficticios](techsolutions_test-demo.sql) y [V001](V001__carrito_pedidos.sql), en ese orden. El DDL base falla si el esquema ya existe. V001 se aplica una vez. Ante un fallo a mitad de migración, revisar el DDL efectivo antes de reanudar, porque cada ALTER TABLE confirma por separado en MySQL.
3. Inyectar `TECHSOLUTIONS_DB_HOST`, `TECHSOLUTIONS_DB_PORT`, `TECHSOLUTIONS_DB_NAME`, `TECHSOLUTIONS_DB_USER`, `TECHSOLUTIONS_DB_PASSWORD` y `TECHSOLUTIONS_CART_SIGNING_KEY`. Para la firma usar Base64 de al menos 32 bytes aleatorios. Mantener la clave estable entre reinicios mientras deban ser válidas las cotizaciones en curso. La clave y las contraseñas se suministran fuera del repositorio.
4. Con Java 21, ejecutar `mvn -f backend-java/pom.xml clean verify`. Para incluir la prueba JDBC habilitar `TECHSOLUTIONS_RUN_QA_INTEGRATION=true` solo después de verificar cuenta y esquema. El guard de integración exige `techsolutions_test` antes de cualquier escritura.
5. Si falta el administrador ficticio, inyectar `TECHSOLUTIONS_QA_ADMIN_EMAIL` con dominio `example.test` y `TECHSOLUTIONS_QA_ADMIN_PASSWORD`. Desde PowerShell, usar `$war = (Resolve-Path backend-java/target/backend-java-1.0-SNAPSHOT/WEB-INF).Path` y luego `java -cp "$war/classes;$war/lib/*" com.techsolutions.ecommerce.servicio.Usuarios`. El aprovisionamiento exige el esquema QA y usa Argon2id. Si ya existe, reutilizar el acceso local autorizado.
6. Liberar 8080 únicamente si lo ocupa el Tomcat temporal identificado de esta evidencia. Ejecutar [Iniciar-TomcatQA.ps1](Iniciar-TomcatQA.ps1) con un `-Base` temporal nuevo si ya existe el anterior. El script comprueba la conexión JDBC efectiva y usa `127.0.0.1:8080/techsolutions-84`.
7. Ejecutar `node qa/84-env/verificar-api.mjs completa` con la identidad de administrador ficticia y la configuración de QA. Para verificar vencimiento y replay en la misma ejecución, inyectar también la misma clave de firma usada por ese Tomcat. El script admite las modalidades `catalogo` y `carrito`. Los datos generados llevan identificadores ficticios por ejecución y pueden persistir en QA.

**Ejecución registrada** · 5 pruebas unitarias, 1 integración JDBC y 101 solicitudes HTTP comprobadas. Maven registró `BUILD SUCCESS` con 0 fallos, 0 errores y 0 omisiones. El [programa de verificación HTTP](verificar-api.mjs) genera evidencia sin imprimir cuerpos, cookies, contraseñas ni claves.

## Cierre de QA · 84.6

**27 de noviembre de 2026.** La cobertura inicial de 84.5 abarcaba los 19 endpoints en 101 solicitudes y seguía T01–T20 en escenarios básicos. T21 carecía de muestras y T22 ya tenía evidencia de rama y frontend. En 84.6 se evaluaron los **22 casos principales**, se registraron **34 identificadores adicionales de subcaso HTTP** y se hicieron **162 solicitudes HTTP** en la pasada final medida, además de la comprobación de arranque. Las repeticiones de pasos y las solicitudes de preparación se contabilizan como tráfico, y los identificadores repetidos cuentan una sola vez como subcaso.

La identificación de servicios, fuentes, archivos y persistencia se conserva en la tabla anterior. La columna inicial indica alcance de las comprobaciones de 84.5. La revisión de 84.6 usa los resultados de [HTTP](evidencias-84.6/http.log), [Maven](evidencias-84.6/maven.log) e [integridad SQL](evidencias-84.6/integridad-sql.log).

| Caso y alcance | Cobertura inicial | Esperado y resultado final observado | Estado final |
|---|---|---|---|
| T01 · 84-01 | Básica | Listado activo, búsqueda, filtro de categoría y orden estable entre páginas, 200. Tamaño fuera de rango, 400. Filtro administrativo, 403/200 según actor. | APROBADO |
| T02 · 84-02 | Parcial | ID cero 400, inexistente e inactivo público 404, detalle autorizado 200. | APROBADO |
| T03 · 84-03 | Básica | Listado 200 y método incorrecto 405 con Allow. La categoría obtenida sirvió para altas y búsquedas. | APROBADO |
| T04 · 84-04 | Parcial | Alta 201 con Location. Categoría inexistente, precio cero/negativo/fuera de rango, stock negativo y texto largo 422. Precio numérico y JSON duplicado 400; rol incorrecto 403. | APROBADO |
| T05 · 84-05 | Básica | Edición y cambios de estado 200. Stock preservado. El precio anterior queda en el detalle de compra. | APROBADO |
| T06 · 84-06 | Básica | PATCH 200 con valor esperado correcto y 409 si el stock cambió. | APROBADO |
| T07 · 84-07 | Parcial | Borrado libre 204; FK de pedido existente produce 409. | APROBADO |
| T08 · 84-08 | Básica | 200 con cookie HttpOnly y SameSite=Lax; origen ajeno 403. | APROBADO |
| T09 · 84-09 | Parcial | 201 sin Location; correo normalizado, registro duplicado 409, campos inválidos 422, rol inyectado 400, CSRF inválido 403 y límite 429. Argon2id con sal distinta por prueba unitaria. | APROBADO |
| T10 · 84-10 | Parcial | 200 para cliente y administrador con rotación de sesión y token; credencial incorrecta 401 y límite de intentos 429. | APROBADO |
| T11 · 84-11 | Parcial | 200 para sesión activa y 401 sin sesión o tras invalidación. Caducidad real por inactividad y límite absoluto pendientes de una ejecución temporal específica. | APROBADO CON OBSERVACIONES |
| T12 · 84-12 | Básica | Cierre 204 sin cuerpo y consulta posterior 401. | APROBADO |
| T13 · 84-13 | Básica | 200 vacío o con importes e ítems propios; anónimo 401, administrador 403, otro cliente ve su propio carrito. | APROBADO |
| T14 · 84-14 | Parcial | 201/200 con unicidad incluso tras mutaciones concurrentes. Cantidades fuera de rango 422, propietario inyectado 400, producto inexistente 404 e inactivo o sin stock 409. JDBC comprueba cantidad 99, aceptación del producto distinto 200 y 409 para el 201. | APROBADO |
| T15 · 84-15 | Básica | 204 al remover un ítem propio y 204 al repetir. | APROBADO |
| T16 · 84-16 | Básica | 204 y lectura posterior con ítems vacíos. | APROBADO |
| T17 · 84-17 | Parcial | 201 con REGISTRADO; 400 para UUID/token inválidos o dueños distintos; 409 por vacío, vencimiento, revisión, precio, inactividad, stock o clave con cuerpo distinto. Replay 200 aun vencido. Una sola compra de la última unidad. Rollback real preserva líneas/revisión/stock y revierte pedido, detalles y clave. | APROBADO |
| T18 · 84-18 | Básica | 200 con historial paginado y aislado, 401 anónimo. | APROBADO |
| T19 · 84-19 | Parcial | 200 para detalle propio, 400 ID inválido, 404 ajeno/inexistente, importes históricos idénticos tras modificar precio del producto. | APROBADO |
| T20 · Seguridad transversal | Parcial | Respuestas JSON de error uniformes, ID correlacionado, 404/405/406/413/415, rechazo de JSON desconocido o duplicado, profundidad comprobada también directamente en Jackson, origen/CSRF/roles correctos. JSP protegido. HTTPS y cookies Secure quedan fuera de la medición local. | APROBADO CON OBSERVACIONES |
| T21 · D1 RNF01/RNF02/RNF03 | Sin mediciones | 162/162 muestras locales bajo 3 s. Mediana 11,16 ms; p95 35,66 ms; máximo 461,22 ms. TLS, carga y disponibilidad del 99 % pendientes. | APROBADO CON OBSERVACIONES |
| T22 · Git y entrega | Rama/base y diff comprobados | HEAD y rama 82 en el commit aprobado, diff del frontend vacío, temporal con SHA-256 original, diff --check sin errores de espacios. Los commits quedan fuera de 84.6. | APROBADO |

### Auditoría de aserciones y regresión

- Antes, el rollback invocaba el servicio real, pero creaba el carrito en la misma transacción que fallaba. Ahora el carrito está persistido antes del fallo y se verifican después sus líneas y revisión, los detalles del pedido, la clave y el stock. Se eliminaron exclusivamente las filas de los fixtures creados por las pruebas JDBC.
- Un HTTP 400 para JSON muy anidado puede provenir del tipo del primer campo. La prueba unitaria adicional comprueba directamente `StreamConstraintsException`. Se añadió validación de la estructura del error y de que su ID coincide con el encabezado.
- La primera pasada ampliada completó 158 solicitudes y 7 pruebas Maven. La regresión final completó 162 solicitudes y 8 pruebas Maven, de ellas 6 unitarias y 2 JDBC. Ambas pasadas finalizaron correctamente. No se reprodujo un defecto funcional en los escenarios ejecutados.
- **QA-846-01 · Provisión de cuenta, seguimiento del incidente de 84.5.** La causa original fue el generador incompatible con Windows PowerShell, que permitió continuar sin clave. El [aprovisionador](Aprovisionar-CuentaQA.ps1) usa la API compatible, exige 64 dígitos hexadecimales antes de CREATE USER y rehúsa aprovisionar una cuenta existente. El archivo protegido se guarda antes de la sentencia. Se validó la sintaxis y se verificaron en lectura la autenticación y los privilegios de la cuenta operativa vigente. El flujo de alta se revisó sin crear otra cuenta.
- Para reproducir la cobertura ampliada, ejecutar el procedimiento anterior con `TECHSOLUTIONS_QA_INTEGRAL=true`, la misma clave de firma del Tomcat QA y la ejecución Maven de integración habilitada. Las muestras HTTP se miden desde el envío hasta la recepción del cuerpo, en loopback y durante la regresión funcional, con concurrencia solo en los escenarios previstos. Las bitácoras imprimen etiquetas, estados y estadísticas.

**Resultado** · 19 casos aprobados y 3 aprobados con observaciones. Se recomienda aprobar 84.6 y autorizar 84.7 para documentar los servicios. HTTPS/TLS, cookies Secure, carga, disponibilidad, integración React–API, pagos y facturación, reportes y administración ampliada conservan el alcance acordado.
