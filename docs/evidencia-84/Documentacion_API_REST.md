# Documentación de la API REST

TECHSOLUTIONS-ECommerce · Evidencia GA7-220501096-AA5-EV01

Jefferson Sosa Borrero
Análisis y Desarrollo de Software · SENA
27 de noviembre de 2026

Referencia de operación, integración y verificación. Incluye los 19 contratos implementados y las observaciones de QA.

<!-- pagebreak -->

# Convenciones de uso

- **Base local** http://127.0.0.1:8080/techsolutions-84/api/v1
- **Paginación** pagina comienza en 1. tamano admite 1–100, con valor por defecto 20. total es el número de resultados de la consulta. Los identificadores son enteros positivos en rango INT.
- **Encabezados** Accept: application/json. En solicitudes con JSON, Content-Type: application/json. Las mutaciones que requieren CSRF llevan X-CSRF-Token y la cookie de la misma sesión.
- **Respuestas** JSON UTF-8, X-Request-Id, Cache-Control: no-store y X-Content-Type-Options: nosniff. 204 lleva cuerpo vacío. Los importes se emiten como cadenas con dos decimales, y la fecha de pedidos en UTC ISO 8601.
- **Errores transversales** 403 por origen rechazado; 404 para ruta inexistente; 405 con Allow; 406 para formato no aceptado; 413 por superar 131 072 bytes; 415 por tipo no válido; 500 por error interno y 503 por indisponibilidad. JSON inválido, claves duplicadas o campos desconocidos producen 400. La profundidad configurada es 16.
- **Ejemplos** todos son ficticios. Los valores entre < y > son marcadores sin capacidad de autenticación. Las fichas indican errores específicos y se complementan con estos códigos comunes.

```json
{
  "codigo": "NO_ENCONTRADO",
  "mensaje": "Recurso no encontrado.",
  "campos": [],
  "idSolicitud": "req-ficticia-001"
}
```

## Sesión y confirmación de compra

Obtener CSRF con 84-08 y conservar la cookie. Registrar con 84-09 cuando se necesite y autenticar con 84-10. Asociar a las siguientes mutaciones la cookie y el token rotados. Consultar la sesión con 84-11 o cerrarla con 84-12. HttpOnly y SameSite=Lax se comprobaron localmente. HTTPS, TLS y cookies Secure bajo HTTPS quedan pendientes.

Para comprar, consultar 84-13 y confirmar mediante 84-17. El token firmado vincula cliente, revisión, productos, cantidades y precios. Cambios relevantes generan 409 y conservan el carrito. La misma clave y el mismo cuerpo de un pedido confirmado recuperan el resultado previo, incluso tras el vencimiento. Los importes proceden del servidor.

## Fuentes

- D1 · Informe_Final_Sistema_Ecommerce_GA2_220501093_AA3_EV02.docx.
- D2 · Determinación de las especificaciones funcionales del software y metodología a utilizar. Las historias son ejemplos de referencia.
- D3 · GA5-220501095-AA1-EV02 Elaboración de Interfaz Gráfica y Mapa de Navegación.docx.
- D1–D3 corresponden a antecedentes recuperados. Los códigos se conservan por documento. Las fuentes locales son el código del WAR, la [matriz QA](../../qa/84-env/seguimiento-84.md) y sus bitácoras.

<!-- pagebreak -->

# 84-01 · Consultar catálogo

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/productos

**Actor** Público para activos. ADMIN para INACTIVO o TODOS.

**Trazabilidad** D1 RF03, D3 RF-03/RF-04, D2 HU-03.

**Entrada y reglas** Consulta q, idCategoria, estado, pagina y tamano opcionales. q admite hasta 100 caracteres y busca coincidencias literales en nombre, marca, descripción y categoría. ACTIVO es el estado por defecto. Orden ascendente por ID. Sin cuerpo JSON.

**Respuesta** 200 lista paginada. 400 por filtros inválidos y 403 si el filtro requiere rol administrativo.

**Persistencia** producto, categoria.

**QA y observaciones** T01 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/productos?q=Monitor&idCategoria=1
Accept: application/json
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "items": [
    {
      "idProducto": 42,
      "idCategoria": 1,
      "nombreCategoria": "Monitores QA",
      "nombreProducto": "Monitor Aula QA",
      "marca": "Marca Demo",
      "descripcion": null,
      "precio": "129900.00",
      "stock": 5,
      "especificaciones": null,
      "estado": "ACTIVO"
    }
  ],
  "pagina": 1,
  "tamano": 20,
  "total": 1
}
```

<!-- pagebreak -->

# 84-02 · Consultar producto

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/productos/{id}

**Actor** Público para activos. ADMIN también puede consultar inactivos.

**Trazabilidad** D1 RF03, D3 RF-03.

**Entrada y reglas** id entero positivo en la ruta. Un inactivo se oculta al público. Sin cuerpo JSON.

**Respuesta** 200 producto. 400 por ID inválido y 404 por inexistencia o falta de visibilidad.

**Persistencia** producto, categoria.

**QA y observaciones** T02 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/productos/42
Accept: application/json
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "idProducto": 42,
  "idCategoria": 1,
  "nombreCategoria": "Monitores QA",
  "nombreProducto": "Monitor Aula QA",
  "marca": "Marca Demo",
  "descripcion": null,
  "precio": "129900.00",
  "stock": 5,
  "especificaciones": null,
  "estado": "ACTIVO"
}
```

<!-- pagebreak -->

# 84-03 · Consultar categorías

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/categorias

**Actor** Público.

**Trazabilidad** D3 RF-03/RF-04.

**Entrada y reglas** pagina y tamano opcionales. Orden ascendente por ID. Sin cuerpo JSON.

**Respuesta** 200 lista paginada. 400 por paginación inválida.

**Persistencia** categoria.

**QA y observaciones** T03 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/categorias
Accept: application/json
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "items": [
    {
      "idCategoria": 1,
      "nombreCategoria": "Monitores QA",
      "descripcion": null
    }
  ],
  "pagina": 1,
  "tamano": 20,
  "total": 1
}
```

<!-- pagebreak -->

# 84-04 · Crear producto

**Método y ruta** POST http://127.0.0.1:8080/techsolutions-84/api/v1/productos

**Actor** ADMIN con sesión y CSRF.

**Trazabilidad** D1 RF03, D2 HU-05, actor administrador D3.

**Entrada y reglas** Cuerpo de producto. stockInicial opcional, por defecto 0. Categoría existente. Nombre y marca requeridos, máximo 100 y 50 caracteres. Descripción y especificaciones admiten null y hasta 65 535 bytes UTF-8 cada uno. Precio decimal positivo como cadena, hasta 10 dígitos enteros y dos decimales. Estado ACTIVO o INACTIVO. Stock entero no negativo. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 201 producto y Location al detalle. 400 por JSON incompatible, 401 sin sesión, 403 por rol o CSRF, 422 por validación o categoría inexistente.

**Persistencia** producto, categoria.

**QA y observaciones** T04 aprobado.

## Solicitud ficticia

```http
POST /techsolutions-84/api/v1/productos
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "idCategoria": 1,
  "nombreProducto": "Monitor Aula QA",
  "marca": "Marca Demo",
  "descripcion": null,
  "precio": "129900.00",
  "especificaciones": null,
  "estado": "ACTIVO",
  "stockInicial": 5
}
```

## Respuesta ficticia

```http
HTTP 201
Location: /techsolutions-84/api/v1/productos/42
Content-Type: application/json; charset=UTF-8

{
  "idProducto": 42,
  "idCategoria": 1,
  "nombreCategoria": "Monitores QA",
  "nombreProducto": "Monitor Aula QA",
  "marca": "Marca Demo",
  "descripcion": null,
  "precio": "129900.00",
  "stock": 5,
  "especificaciones": null,
  "estado": "ACTIVO"
}
```

<!-- pagebreak -->

# 84-05 · Editar o desactivar producto

**Método y ruta** PUT http://127.0.0.1:8080/techsolutions-84/api/v1/productos/{id}

**Actor** ADMIN con sesión y CSRF.

**Trazabilidad** D1 RF03, D2 HU-05.

**Entrada y reglas** id positivo y cuerpo con los campos editables del producto. Usa las validaciones del alta. Se puede elegir INACTIVO. El stock se conserva y stockInicial queda fuera del cuerpo de edición. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 200 producto actualizado. 400 por ID o JSON inválido, 401 sin sesión, 403 por rol/CSRF, 404 por inexistencia y 422 por datos inválidos.

**Persistencia** producto, categoria.

**QA y observaciones** T05 aprobado.

## Solicitud ficticia

```http
PUT /techsolutions-84/api/v1/productos/42
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "idCategoria": 1,
  "nombreProducto": "Monitor Aula QA",
  "marca": "Marca Demo",
  "descripcion": null,
  "precio": "129900.00",
  "especificaciones": null,
  "estado": "INACTIVO"
}
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "idProducto": 42,
  "idCategoria": 1,
  "nombreCategoria": "Monitores QA",
  "nombreProducto": "Monitor Aula QA",
  "marca": "Marca Demo",
  "descripcion": null,
  "precio": "129900.00",
  "stock": 5,
  "especificaciones": null,
  "estado": "INACTIVO"
}
```

<!-- pagebreak -->

# 84-06 · Ajustar stock

**Método y ruta** PATCH http://127.0.0.1:8080/techsolutions-84/api/v1/productos/{id}/stock

**Actor** ADMIN con sesión y CSRF.

**Trazabilidad** Actor inventario D3, decisión técnica 84.3.

**Entrada y reglas** id positivo. stockEsperado y stockNuevo son enteros no negativos. El ajuste compara el valor vigente de manera atómica. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 200 ID y stock actualizado. 400 por ID/JSON inválido, 401/403 por seguridad, 404 si el producto no existe, 409 STOCK_MODIFICADO, 422 por rango.

**Persistencia** producto.

**QA y observaciones** T06 aprobado.

## Solicitud ficticia

```http
PATCH /techsolutions-84/api/v1/productos/42/stock
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "stockEsperado": 5,
  "stockNuevo": 8
}
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "idProducto": 42,
  "stock": 8
}
```

<!-- pagebreak -->

# 84-07 · Eliminar producto

**Método y ruta** DELETE http://127.0.0.1:8080/techsolutions-84/api/v1/productos/{id}

**Actor** ADMIN con sesión y CSRF.

**Trazabilidad** D1 RF03, actor administrador D3, CRUD 84.1.

**Entrada y reglas** id positivo. Borrado físico condicionado a las claves foráneas. Para retirar un producto referenciado se usa 84-05 con estado INACTIVO. Sin cuerpo JSON.

**Respuesta** 204 sin cuerpo. 400 por ID inválido, 401/403 por seguridad, 404 por inexistencia y 409 PRODUCTO_REFERENCIADO.

**Persistencia** producto, detalle_carrito, detalle_pedido.

**QA y observaciones** T07 aprobado.

## Solicitud ficticia

```http
DELETE /techsolutions-84/api/v1/productos/42
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>
```

## Respuesta ficticia

```http
HTTP 204
[cuerpo vacío]
```

<!-- pagebreak -->

# 84-08 · Obtener CSRF

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/sesion/csrf

**Actor** Visitante o sesión existente.

**Trazabilidad** D1 RF02, D3 RF-02, decisión técnica 84.3.

**Entrada y reglas** Sin parámetros. Crea o reutiliza una sesión y retorna el token asociado. Conservar la cookie de sesión. Sin cuerpo JSON.

**Respuesta** 200 token y Set-Cookie cuando corresponda. 403 por origen rechazado.

**Persistencia** HttpSession.

**QA y observaciones** T08 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/sesion/csrf
Accept: application/json
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "tokenCsrf": "<csrf-ficticio>"
}
```

<!-- pagebreak -->

# 84-09 · Registrar cliente

**Método y ruta** POST http://127.0.0.1:8080/techsolutions-84/api/v1/usuarios

**Actor** Visitante con cookie y CSRF.

**Trazabilidad** D1 RF01, D3 RF-01, D2 HU-01.

**Entrada y reglas** Nombre y apellido obligatorios hasta 50 caracteres. Correo hasta 100, normalizado a minúsculas y único. Teléfono opcional hasta 20. Contraseña de 15–128 caracteres no vacía. El servidor asigna CLIENTE y guarda Argon2id. La operación no inicia sesión. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 201 usuario público sin Location. 400 por JSON incompatible, 403 por CSRF, 409 CORREO_DUPLICADO, 422 por validación, 429 por límite de intentos.

**Persistencia** usuario.

**QA y observaciones** T09 aprobado.

## Solicitud ficticia

```http
POST /techsolutions-84/api/v1/usuarios
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "nombre": "Ana",
  "apellido": "Demo",
  "correo": "ana@example.test",
  "contrasena": "<contraseña-ficticia-no-utilizable>",
  "telefono": null
}
```

## Respuesta ficticia

```http
HTTP 201
Content-Type: application/json; charset=UTF-8

{
  "idUsuario": 31,
  "nombre": "Ana",
  "rol": "CLIENTE",
  "apellido": "Demo",
  "correo": "ana@example.test",
  "telefono": null
}
```

<!-- pagebreak -->

# 84-10 · Iniciar sesión

**Método y ruta** POST http://127.0.0.1:8080/techsolutions-84/api/v1/sesion

**Actor** Visitante con cookie y CSRF.

**Trazabilidad** D1 RF02, D3 RF-02, D2 HU-02.

**Entrada y reglas** Correo normalizado y contraseña. El servidor verifica Argon2id y un rol conocido. Rota el ID de sesión y el token CSRF. Conservar las versiones nuevas. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 200 usuario y tokenCsrf, con cookie actualizada. 400 por entrada inválida, 401 por credenciales incorrectas, 403 por CSRF, 409 SESION_ACTIVA, 429 por límite de intentos.

**Persistencia** usuario, HttpSession.

**QA y observaciones** T10 aprobado.

## Solicitud ficticia

```http
POST /techsolutions-84/api/v1/sesion
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "correo": "ana@example.test",
  "contrasena": "<contraseña-ficticia-no-utilizable>"
}
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "usuario": { "idUsuario": 31, "nombre": "Ana", "rol": "CLIENTE" },
  "tokenCsrf": "<csrf-renovado-ficticio>"
}
```

<!-- pagebreak -->

# 84-11 · Consultar sesión

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/sesion

**Actor** CLIENTE o ADMIN con sesión.

**Trazabilidad** D1 RF02, D3 RF-02.

**Entrada y reglas** Sin parámetros. La identidad se obtiene de la sesión. La configuración prevé 30 minutos de inactividad y 8 horas absolutas. Sin cuerpo JSON.

**Respuesta** 200 identidad pública. 401 si la sesión falta o dejó de ser válida.

**Persistencia** HttpSession.

**QA y observaciones** T11 aprobado con observaciones. Caducidad real por inactividad y límite absoluto pendiente..

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/sesion
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "idUsuario": 31,
  "nombre": "Ana",
  "rol": "CLIENTE"
}
```

<!-- pagebreak -->

# 84-12 · Cerrar sesión

**Método y ruta** DELETE http://127.0.0.1:8080/techsolutions-84/api/v1/sesion

**Actor** CLIENTE o ADMIN con sesión y CSRF.

**Trazabilidad** D3 RF-02.

**Entrada y reglas** Sin cuerpo. Invalida la sesión en servidor y envía una cookie de expiración. Para iniciar otra sesión se obtiene un CSRF nuevo. Sin cuerpo JSON.

**Respuesta** 204 sin cuerpo. 401 sin sesión válida y 403 por origen o CSRF.

**Persistencia** HttpSession.

**QA y observaciones** T12 aprobado.

## Solicitud ficticia

```http
DELETE /techsolutions-84/api/v1/sesion
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>
```

## Respuesta ficticia

```http
HTTP 204
[cuerpo vacío]
```

<!-- pagebreak -->

# 84-13 · Consultar carrito

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/carrito

**Actor** CLIENTE con sesión.

**Trazabilidad** D1 RF04, actor Cliente D3.

**Entrada y reglas** No admite identificador de propietario. El servidor estima el subtotal con precios vigentes, informa disponibilidad y emite confirmacionCarrito con vigencia de 600 s. Sin cuerpo JSON.

**Respuesta** 200 vista del carrito, incluso cuando está vacío. 401 sin sesión y 403 por rol.

**Persistencia** carrito, detalle_carrito, producto.

**QA y observaciones** T13 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/carrito
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "items": [
    {
      "idProducto": 42,
      "cantidad": 1,
      "precioUnitario": "129900.00",
      "subtotal": "129900.00",
      "disponible": true
    }
  ],
  "subtotalEstimado": "129900.00",
  "confirmacionCarrito": "<confirmacion-ficticia>"
}
```

<!-- pagebreak -->

# 84-14 · Fijar cantidad de un ítem

**Método y ruta** PUT http://127.0.0.1:8080/techsolutions-84/api/v1/carrito/items/{idProducto}

**Actor** CLIENTE con sesión y CSRF.

**Trazabilidad** D1 RF04, D2 HU-04.

**Entrada y reglas** idProducto positivo. cantidad entera de 1 a 99 y hasta el stock vigente. Producto activo. Máximo 200 productos distintos. PUT fija la cantidad total y la revisión cambia ante mutaciones efectivas. El stock no se reserva. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 201 ítem nuevo con Location; 200 para un ítem existente. 400 por entrada incompatible, 401/403 por seguridad, 404 si falta el producto, 409 por disponibilidad o CARRITO_LLENO, 422 por rango.

**Persistencia** carrito, detalle_carrito, producto.

**QA y observaciones** T14 aprobado. La ruta del ítem admite PUT y DELETE; la consulta se hace con 84-13..

## Solicitud ficticia

```http
PUT /techsolutions-84/api/v1/carrito/items/42
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>

{
  "cantidad": 1
}
```

## Respuesta ficticia

```http
HTTP 201
Location: /techsolutions-84/api/v1/carrito/items/42
Content-Type: application/json; charset=UTF-8

{
  "idProducto": 42,
  "cantidad": 1,
  "precioUnitario": "129900.00",
  "subtotal": "129900.00",
  "disponible": true
}
```

<!-- pagebreak -->

# 84-15 · Retirar ítem

**Método y ruta** DELETE http://127.0.0.1:8080/techsolutions-84/api/v1/carrito/items/{idProducto}

**Actor** CLIENTE con sesión y CSRF.

**Trazabilidad** D1 RF04, actor Cliente D3.

**Entrada y reglas** idProducto positivo. Retira exclusivamente el ítem propio e incrementa la revisión si hubo cambio. Admite repetir el retiro. Sin cuerpo JSON.

**Respuesta** 204 sin cuerpo, incluido un ítem ausente. 400 por ID inválido y 401/403 por seguridad.

**Persistencia** carrito, detalle_carrito.

**QA y observaciones** T15 aprobado.

## Solicitud ficticia

```http
DELETE /techsolutions-84/api/v1/carrito/items/42
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>
```

## Respuesta ficticia

```http
HTTP 204
[cuerpo vacío]
```

<!-- pagebreak -->

# 84-16 · Vaciar carrito

**Método y ruta** DELETE http://127.0.0.1:8080/techsolutions-84/api/v1/carrito

**Actor** CLIENTE con sesión y CSRF.

**Trazabilidad** D1 RF04, actor Cliente D3.

**Entrada y reglas** Sin parámetros ni cuerpo. Quita los ítems del usuario autenticado y conserva la cabecera si existe. Incrementa la revisión si hubo cambio. Sin cuerpo JSON.

**Respuesta** 204 sin cuerpo incluso con carrito vacío o inexistente. 401/403 por seguridad.

**Persistencia** carrito, detalle_carrito.

**QA y observaciones** T16 aprobado.

## Solicitud ficticia

```http
DELETE /techsolutions-84/api/v1/carrito
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>
```

## Respuesta ficticia

```http
HTTP 204
[cuerpo vacío]
```

<!-- pagebreak -->

# 84-17 · Confirmar y crear pedido

**Método y ruta** POST http://127.0.0.1:8080/techsolutions-84/api/v1/pedidos

**Actor** CLIENTE con sesión, CSRF e Idempotency-Key.

**Trazabilidad** Procesos D1, actor Cliente D3, ajuste aprobado 84.4.

**Entrada y reglas** Idempotency-Key requiere UUID. El cuerpo contiene confirmacionCarrito vigente. Se verifica la firma y el usuario y se comparan revisión, ítems, cantidades y precios. Se bloquean los productos y se recalcula el total con BigDecimal antes de confirmar. El estado inicial es REGISTRADO. El cuerpo y los encabezados están en el ejemplo.

**Respuesta** 201 con Location; 200 para el mismo cuerpo y clave ya confirmados. 400 por UUID/token inválido; 401/403 por seguridad; 409 por vacío, vencimiento, cambio, falta de disponibilidad o misma clave con otro cuerpo; 422 por total fuera de rango.

**Persistencia** pedido, detalle_pedido, carrito, detalle_carrito, producto.

**QA y observaciones** T17 aprobado. Tras un 409 de cotización, consultar el carrito y obtener una referencia y clave nuevas. Un replay exitoso funciona aunque venza el token..

## Solicitud ficticia

```http
POST /techsolutions-84/api/v1/pedidos
Accept: application/json
Content-Type: application/json
Cookie: JSESSIONID=<sesion-ficticia>
X-CSRF-Token: <csrf-ficticio>
Idempotency-Key: 00000000-0000-4000-8000-000000000001

{
  "confirmacionCarrito": "<confirmacion-ficticia>"
}
```

## Respuesta ficticia

```http
HTTP 201
Location: /techsolutions-84/api/v1/pedidos/81
Content-Type: application/json; charset=UTF-8

{
  "idPedido": 81,
  "fechaPedido": "2026-11-27T18:00:00Z",
  "estado": "REGISTRADO",
  "total": "129900.00",
  "items": [
    {
      "idProducto": 42,
      "cantidad": 1,
      "precioUnitario": "129900.00",
      "subtotal": "129900.00"
    }
  ]
}
```

<!-- pagebreak -->

# 84-18 · Consultar historial de pedidos

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/pedidos

**Actor** CLIENTE con sesión.

**Trazabilidad** Procesos D1, historial del Cliente D3.

**Entrada y reglas** pagina y tamano opcionales. Filtra por identidad del servidor y ordena por ID descendente. total exterior representa cantidad de pedidos. Sin cuerpo JSON.

**Respuesta** 200 lista de resúmenes. 400 por paginación inválida y 401/403 por seguridad.

**Persistencia** pedido.

**QA y observaciones** T18 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/pedidos?pagina=1&tamano=20
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "items": [
    {
      "idPedido": 81,
      "fechaPedido": "2026-11-27T18:00:00Z",
      "estado": "REGISTRADO",
      "total": "129900.00"
    }
  ],
  "pagina": 1,
  "tamano": 20,
  "total": 1
}
```

<!-- pagebreak -->

# 84-19 · Consultar detalle de pedido

**Método y ruta** GET http://127.0.0.1:8080/techsolutions-84/api/v1/pedidos/{id}

**Actor** CLIENTE con sesión.

**Trazabilidad** Procesos D1, actor Cliente D3.

**Entrada y reglas** id positivo. Se requiere ser propietario. Retorna las cantidades, precios y subtotales históricos, en cadenas decimales. Sin cuerpo JSON.

**Respuesta** 200 detalle. 400 por ID inválido, 401/403 por seguridad y 404 tanto para un pedido inexistente como uno ajeno.

**Persistencia** pedido, detalle_pedido.

**QA y observaciones** T19 aprobado.

## Solicitud ficticia

```http
GET /techsolutions-84/api/v1/pedidos/81
Accept: application/json
Cookie: JSESSIONID=<sesion-ficticia>
```

## Respuesta ficticia

```http
HTTP 200
Content-Type: application/json; charset=UTF-8

{
  "idPedido": 81,
  "fechaPedido": "2026-11-27T18:00:00Z",
  "estado": "REGISTRADO",
  "total": "129900.00",
  "items": [
    {
      "idProducto": 42,
      "cantidad": 1,
      "precioUnitario": "129900.00",
      "subtotal": "129900.00"
    }
  ]
}
```
