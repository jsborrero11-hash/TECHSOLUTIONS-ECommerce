# Informe de desarrollo de servicios web

TECHSOLUTIONS-ECommerce
GA7-220501096-AA5-EV01 · Diseño y Desarrollo de Servicios Web – Proyecto

Jefferson Sosa Borrero
Análisis y Desarrollo de Software · Servicio Nacional de Aprendizaje, SENA
27 de noviembre de 2026

Entrega individual · Evidencia 84

<!-- pagebreak -->

# 1. Introducción, objetivos y proyecto

TECHSOLUTIONS-ECommerce es un proyecto académico de comercio electrónico para productos tecnológicos. Su backend histórico ya administraba productos con Java, Servlet/JSP y JDBC. El frontend aprobado de la evidencia 82 ofrece un recorrido simulado con almacenamiento local. Esta evidencia implementa una API REST en el mismo WAR y verifica su comportamiento en un esquema independiente de QA.

**Objetivo general** desarrollar, documentar y verificar los servicios web requeridos por el alcance aprobado.

- Traducir los requisitos recuperados en operaciones HTTP trazables y documentadas.
- Reutilizar el WAR, el modelo de productos y sus componentes de acceso a datos.
- Proteger la identidad, los permisos y las escrituras, incluidas las rutas JSP históricas.
- Comprobar el inventario, el carrito, los pedidos, la concurrencia y el rollback en QA.
- Preparar una ejecución reproducible y conservar evidencia verificable mediante Git.

## Alcance

Se implementaron 19 operaciones que cubren catálogo y categorías, administración de productos y stock, registro e identidad, carrito y pedidos propios. El visitante consulta productos activos y se registra. El cliente autenticado gestiona su carrito y pedidos. El administrador opera sobre el catálogo y el inventario. El frontend de 82 conserva su ejecución independiente y no consume la API.

## Requisitos y trazabilidad

| Fuente | Antecedente recuperado | Cobertura de la evidencia |
|---|---|---|
| D1 | RF01 registro, RF02 acceso, RF03 catálogo, RF04 carrito | Identidad, catálogo e inventario y carrito. |
| D1 | Procesos de pedidos y RNF01–RNF04 | Pedidos propios y medición local. Seguridad, disponibilidad e interfaz se evalúan dentro de sus perfiles aplicables. |
| D2 | HU-01 a HU-05 como ejemplos | Registro, login, búsqueda, carrito y gestión de productos. |
| D3 | RF-01 a RF-04, actores identificados | Registro, inicio/cierre, catálogo organizado y búsqueda. El actor Cliente respalda pedido e historial. |
| D1 y D2 | RF05, RF06 y ejemplo HU-06 | Pago, facturación y reportes quedan diferidos. |

Los códigos se mantienen separados por documento. D1–D3 se conocen por los extractos recuperados y las referencias de 84.2. La matriz conserva las correspondencias con los casos T01–T22 y los resultados obtenidos.

<!-- pagebreak -->

# 2. Arquitectura y tecnologías

El backend se empaqueta como WAR. El servlet frontal despacha por método y ruta en /api/v1. Los adaptadores interpretan HTTP y los DTO definen el intercambio. Los servicios aplican reglas y controlan las transacciones. DAO y JDBC ejecutan consultas parametrizadas. Las rutas JSP comparten el servicio de productos, con control de administrador y CSRF al escribir.

```text
Consumidor HTTP -> Servlet /api/v1 -> Servicios -> DAO/JDBC -> MySQL
                        |
                        +-> Sesión, roles, CSRF y errores JSON

Servlet /productos -> Servicio de catálogo -> DAO/JDBC -> MySQL
Frontend React aprobado -> datos locales y almacenamiento del navegador
```

| Componente | Tecnología y función |
|---|---|
| Entorno Java | Eclipse Temurin 21.0.13 y Apache Maven 3.10.0. |
| Web | Jakarta Servlet 6.0 y Tomcat 10.1.61. JSP para el módulo histórico. |
| JSON y contraseñas | Jackson Databind 2.21.4. Argon2id mediante Bouncy Castle 1.84. |
| Persistencia | MySQL 8.4.3, Connector/J 9.5.0, JDBC e InnoDB. |
| Pruebas | JUnit 5, integración JDBC y regresión HTTP automatizada con Node.js. |

## Diseño e implementación

| Servicio | Operaciones | Implementación y reglas |
|---|---|---|
| Catálogo e inventario | 84-01–84-07 | Paginación, filtros, activos públicos, escritura administrativa, stock condicional y tratamiento de claves foráneas. |
| Registro y sesión | 84-08–84-12 | CSRF, creación de cliente, login con rotación, consulta y cierre. |
| Carrito | 84-13–84-16 | Propiedad por sesión, cantidad total 1–99, hasta 200 productos distintos y confirmación firmada. |
| Pedidos | 84-17–84-19 | Creación transaccional, historial paginado y detalle propio con importes históricos. |

El contrato técnico completo, los encabezados y los ejemplos ficticios se encuentran en la [Documentación de la API REST](Documentacion_API_REST.md). Las escrituras administrativas regresan errores específicos de validación, autorización e integridad. Los errores JSON incluyen un identificador de solicitud.

<!-- pagebreak -->

# 3. Persistencia e integridad de pedidos

```text
categoria 1 --- N producto
usuario   1 --- 0..1 carrito  1 --- N detalle_carrito N --- 1 producto
usuario   1 --- N pedido      1 --- N detalle_pedido  N --- 1 producto
```

Las siete tablas usan InnoDB. La base QA se creó desde las definiciones verificadas, con datos ficticios. V001 se aplicó exclusivamente en techsolutions_test. Agrega la revisión del carrito, un ítem por producto, la clave idempotente por usuario y la huella de la solicitud. La cuenta operativa permite SELECT, INSERT, UPDATE y DELETE solo en QA. La cuenta de migración se mantiene separada. JDBC rechaza configuración incompleta y comprueba el esquema seleccionado.

## Validaciones y reglas

- Los IDs son positivos. Los rangos, longitudes y tipos se validan antes de persistir. El precio es positivo, el stock no negativo y la categoría debe existir.
- El catálogo público muestra activos. La edición de catálogo conserva el stock. Un producto referenciado se retira mediante desactivación; el borrado físico bloqueado devuelve 409.
- Un cliente fija entre 1 y 99 unidades por producto y hasta 200 productos distintos por carrito. La adición no reserva inventario.
- Los importes se calculan con BigDecimal. Se mantienen como importes históricos en el detalle, aun si después se edita el precio del producto.

## Transacción, idempotencia y sobreventa

El cliente consulta una confirmación firmada, válida por 600 segundos, que vincula su identidad, la revisión del carrito, los productos, cantidades y precios. El servidor usa una conexión JDBC para bloquear el carrito, verificar si la clave ya existe, bloquear los productos por ID y recalcular los importes. Si cambió una condición que exige nueva confirmación, devuelve 409 y deja intacto el carrito.

El éxito confirma cabecera REGISTRADO, detalles, descuento, vaciado del carrito, clave UUID y huella en una transacción. El reintento de la misma solicitud confirmada devuelve el mismo pedido incluso si venció el token. Reutilizar una clave aceptada con otro cuerpo produce 409. La carrera por la última unidad dejó un pedido exitoso, un conflicto y stock cero. La prueba JDBC sobre el servicio real indujo un fallo antes de confirmar y comprobó la conservación de líneas, revisión y stock, y la ausencia de pedido y detalles.

<!-- pagebreak -->

# 4. Seguridad, verificación y hallazgos

La identidad y el rol se derivan de la sesión del servidor. El registro público asigna CLIENTE. Las contraseñas se protegen con Argon2id y sal individual. El login rota sesión y CSRF. Las mutaciones requieren token, y el origen ajeno se rechaza. La cookie usa HttpOnly y SameSite=Lax en el perfil local. Se limitan los intentos de acceso y alta, el tamaño y profundidad JSON, y se rechazan campos desconocidos o duplicados. Los registros y ejemplos de entrega omiten secretos y credenciales.

## Resultados de QA

| Medida | Resultado final de 84.6 |
|---|---|
| Endpoints | 19 de 19 verificados. |
| Casos principales | 22 evaluados, 19 aprobados y 3 aprobados con observaciones. |
| Subcasos HTTP | 34 identificadores adicionales. |
| Solicitudes HTTP | 162, incluidas preparación, reintentos y comprobaciones posteriores. |
| Maven | 6 unitarias y 2 de integración JDBC. 0 fallos, errores u omisiones. BUILD SUCCESS. |
| Latencia local | Mediana 11,16 ms; p95 35,66 ms; máximo 461,22 ms. Las 162 muestras quedaron bajo 3 s. |

Las cifras de latencia corresponden a la regresión funcional en loopback. Los escenarios ejecutados no dejaron defectos funcionales críticos o altos detectados. No constituyen una prueba de carga de producción.

## Gestión de hallazgos

En 84.5, PowerShell permitió continuar temporalmente sin clave al aprovisionar una cuenta nueva. Antes de usarla desde la aplicación se configuró un secreto aleatorio. El aprovisionador corregido verifica la clave y conserva una copia protegida antes de crear la cuenta. En 84.6 se revisó el script, se verificaron el secreto configurado y los permisos de la cuenta vigente y no se creó otra cuenta.

La prueba anterior de rollback ya invocaba el servicio de pedidos. 84.6 reforzó la aserción con un carrito persistido antes del fallo. También se comprobó el límite de profundidad directamente en Jackson, independientemente del código HTTP.

## Observaciones de cobertura

T11 deja pendiente la caducidad real de sesión por inactividad y límite absoluto. T20 deja pendientes HTTPS, TLS y cookies Secure bajo HTTPS. T21 deja pendientes rendimiento bajo carga y disponibilidad del 99 %. El frontend adaptable se mantiene como antecedente de 82 y funciona independientemente.

<!-- pagebreak -->

# 5. Evaluación interna, versionamiento y cierre

| Indicador SENA | Revisión interna | Evidencia |
|---|---|---|
| I1 · Servicios según requisitos | CUMPLE CON OBSERVACIONES | 19 contratos dentro del alcance trazado. Se usan extractos recuperados y se explicitan las funciones diferidas. |
| I2 · API REST según necesidades | CUMPLE | 19 operaciones documentadas y verificadas por HTTP en el WAR. |
| I3 · Validaciones correctamente | CUMPLE CON OBSERVACIONES | QA local de contrato, seguridad y transacciones; T11, T20 y T21 mantienen sus límites de cobertura. |
| I4 · Herramientas de versionamiento | CUMPLE | Rama dedicada de la evidencia 84 y commit de entrega identificado en ENLACE_REPOSITORIO.txt del paquete. La verificación final del remoto se registra en el informe de cierre. |

La evaluación anterior es interna. La calificación oficial corresponde al instructor.

## Versionamiento y límites funcionales

Repositorio: https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce

Rama de trabajo: evidencia-ga7-aa5-ev01-api-rest. Commit base de la entrega aprobada de 82: 92b74c8484e7202a9b181ba8d6731f41cb878e6c. La rama 82 y los archivos del frontend aprobado se conservan. El esquema original techsolutions se cotejó mediante consultas de lectura. La evidencia de validación usa la instancia Laragon del puerto 3306.

Quedan diferidas la integración React–API, el pago y facturación en el backend, los reportes, la administración ampliada y la actualización administrativa de estados de pedidos. Pagos reales y facturación electrónica fiscal quedan excluidos. La colección formal de Postman pertenece a la evidencia 85.

## Conclusiones

La evidencia entrega un backend REST funcional sobre el WAR existente, con gestión de catálogo, identidad, carrito y pedidos. La prueba local demuestra que el servidor mantiene los importes históricos, evita el descuento duplicado y protege el inventario frente a compras concurrentes. La matriz y las guías permiten reproducir las comprobaciones dentro de un esquema separado.

<!-- pagebreak -->

# 6. Referencias y evidencias

Los documentos D1–D3 se citan para identificar el origen del alcance funcional. Los informes aprobados de 84.1 a 84.6 aportan el contexto de auditoría, diseño, preparación, implementación y verificación. La matriz y las bitácoras locales son la referencia para auditar los resultados reproducibles.

- D1 · Informe_Final_Sistema_Ecommerce_GA2_220501093_AA3_EV02.docx, antecedente recuperado en extractos.
- D2 · Determinación de las especificaciones funcionales del software y metodología a utilizar, antecedente recuperado en extractos.
- D3 · GA5-220501095-AA1-EV02 Elaboración de Interfaz Gráfica y Mapa de Navegación.docx, antecedente recuperado en extractos.
- [README y ejecución](../../README.md) · [Matriz maestra](../../qa/84-env/seguimiento-84.md).
- [Regresión HTTP](../../qa/84-env/evidencias-84.6/http.log) · [Maven](../../qa/84-env/evidencias-84.6/maven.log) · [Integridad SQL](../../qa/84-env/evidencias-84.6/integridad-sql.log).
- [Migración V001](../../qa/84-env/V001__carrito_pedidos.sql) · [Código backend](../../backend-java/pom.xml).
- [Aprovisionamiento QA](../../qa/84-env/Aprovisionar-CuentaQA.ps1) · [Despliegue aislado](../../qa/84-env/Iniciar-TomcatQA.ps1) · [Regresión reproducible](../../qa/84-env/verificar-api.mjs).
