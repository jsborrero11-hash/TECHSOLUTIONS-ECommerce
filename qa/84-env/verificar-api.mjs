import assert from 'node:assert/strict'
import { createHmac, randomUUID } from 'node:crypto'

const base = 'http://127.0.0.1:8080/techsolutions-84'
const api = '/api/v1'
const modo = process.argv[2] ?? 'completa'
const integral = process.env.TECHSOLUTIONS_QA_INTEGRAL === 'true'
const tiempos = []
if (!['catalogo', 'carrito', 'completa'].includes(modo)) throw Error('Modo de verificación inválido')
if (process.env.TECHSOLUTIONS_DB_NAME !== 'techsolutions_test') throw Error('Verificación limitada al esquema QA')
const run = randomUUID().slice(0, 8)
const adminClave = process.env.TECHSOLUTIONS_QA_ADMIN_PASSWORD
assert.ok(adminClave, 'Inyecta la contraseña del administrador ficticio')
const adminCorreo = process.env.TECHSOLUTIONS_QA_ADMIN_EMAIL ?? 'admin84@example.test'

class Navegador {
  cookie = ''
  csrf = ''

  async http(etiqueta, metodo, ruta, esperado, { datos, cabeceras = {}, formulario = false, bruto } = {}) {
    const headers = { ...cabeceras }
    if (ruta.startsWith(api)) headers.Accept ??= 'application/json'
    if (this.cookie) headers.Cookie = this.cookie
    if (this.csrf && metodo !== 'GET') headers['X-CSRF-Token'] ??= this.csrf
    if (datos !== undefined || bruto !== undefined) {
      headers['Content-Type'] ??= formulario ? 'application/x-www-form-urlencoded' : 'application/json'
    }
    const body = bruto ?? (datos === undefined ? undefined : formulario ? new URLSearchParams(datos) : JSON.stringify(datos))
    const inicio = performance.now()
    const res = await fetch(base + ruta, { method: metodo, headers, body, redirect: 'manual', signal: AbortSignal.timeout(20000) })
    const texto = await res.text()
    tiempos.push(performance.now() - inicio)
    const tipo = res.headers.get('content-type') ?? ''
    const valor = tipo.includes('application/json') ? JSON.parse(texto) : texto
    const detalle = typeof valor === 'object' && valor?.codigo ? ' ' + valor.codigo : ''
    assert.ok([esperado].flat().includes(res.status), etiqueta + detalle + ': esperado ' + esperado + ', llegó ' + res.status)
    for (const cookie of res.headers.getSetCookie()) {
      this.cookie = cookie.split(';', 1)[0]
      assert.match(cookie, /HttpOnly/i)
      assert.match(cookie, /SameSite=Lax/i)
    }
    if (ruta.startsWith(api)) {
      assert.ok(res.headers.get('x-request-id'), 'ID de solicitud')
      assert.equal(res.headers.get('cache-control'), 'no-store')
      if (res.status === 204) assert.equal(texto, '')
      else assert.match(tipo, /application\/json/)
      if (res.status >= 400) {
        assert.deepEqual(Object.keys(valor).sort(), ['campos', 'codigo', 'idSolicitud', 'mensaje'])
        assert.equal(valor.idSolicitud, res.headers.get('x-request-id'))
        assert.equal(typeof valor.codigo, 'string')
        assert.equal(typeof valor.mensaje, 'string')
        assert.ok(Array.isArray(valor.campos))
        assert.doesNotMatch(texto, /SQLException|jdbc:mysql|java\.lang|org\.apache/i)
      }
    }
    console.log(etiqueta + ' ' + metodo + ' ' + res.status)
    return { valor, res }
  }

  async token() {
    const { valor } = await this.http('84-08', 'GET', api + '/sesion/csrf', 200)
    this.csrf = valor.tokenCsrf
    assert.ok(this.csrf)
  }

  async login(correo, contrasena) {
    const anterior = this.cookie
    const csrfAnterior = this.csrf
    const { valor } = await this.http('84-10', 'POST', api + '/sesion', 200, { datos: { correo, contrasena } })
    this.csrf = valor.tokenCsrf
    assert.notEqual(this.cookie, anterior)
    assert.notEqual(this.csrf, csrfAnterior)
    return valor.usuario
  }
}

const visitante = new Navegador()
const admin = new Navegador()
const cliente = new Navegador()
const clienteClave = randomUUID() + randomUUID()
const clienteCorreo = 'qa-' + run + '@example.test'
const registro = {
  nombre: 'Cliente', apellido: 'Prueba', correo: clienteCorreo.toUpperCase(), contrasena: clienteClave, telefono: null
}
await visitante.http('84-11 sin sesión', 'GET', api + '/sesion', 401)
await visitante.http('84-08 origen', 'GET', api + '/sesion/csrf', 403, { cabeceras: { Origin: 'https://example.test' } })
await cliente.token()
await cliente.http('84-09 CSRF', 'POST', api + '/usuarios', 403, { datos: registro, cabeceras: { 'X-CSRF-Token': 'incorrecto' } })
await cliente.http('84-09 rol inyectado', 'POST', api + '/usuarios', 400, { datos: { ...registro, rol: 'ADMIN' } })
const alta = await cliente.http('84-09', 'POST', api + '/usuarios', 201, { datos: registro })
assert.equal(alta.res.headers.get('location'), null)
assert.equal(alta.valor.rol, 'CLIENTE')
assert.equal(alta.valor.correo, clienteCorreo)
assert.equal(Object.hasOwn(alta.valor, 'contrasena'), false)
await cliente.http('84-09 correo duplicado', 'POST', api + '/usuarios', 409, { datos: registro })
await cliente.http('84-10 rechaza credencial', 'POST', api + '/sesion', 401, { datos: { correo: clienteCorreo, contrasena: 'incorrecta' } })
assert.equal((await cliente.login(clienteCorreo, clienteClave)).rol, 'CLIENTE')
assert.equal((await cliente.http('84-11', 'GET', api + '/sesion', 200)).valor.idUsuario, alta.valor.idUsuario)
await admin.token()
assert.equal((await admin.login(adminCorreo, adminClave)).rol, 'ADMIN')
const categorias = (await visitante.http('84-03', 'GET', api + '/categorias', 200)).valor.items
assert.ok(categorias.length)
const categoria = categorias[0].idCategoria
const datos = {
  idCategoria: categoria, nombreProducto: 'Producto QA ' + run, marca: 'Marca QA',
  descripcion: 'Descripción de prueba', precio: '12.00', especificaciones: null, estado: 'ACTIVO'
}
await cliente.http('84-04 rol', 'POST', api + '/productos', 403, { datos })
await admin.http('84-04 precio cero', 'POST', api + '/productos', 422, { datos: { ...datos, precio: '0.00' } })
await admin.http('84-04 categoría inexistente', 'POST', api + '/productos', 422, { datos: { ...datos, idCategoria: 2147483647 } })
await admin.http('84-04 clave JSON duplicada', 'POST', api + '/productos', 400, { bruto: '{"estado":"ACTIVO","estado":"ACTIVO"}' })
const nuevo = await admin.http('84-04', 'POST', api + '/productos', 201, { datos: { ...datos, stockInicial: 4 } })
const id = nuevo.valor.idProducto
const ruta = api + '/productos/' + id
assert.equal(nuevo.res.headers.get('location'), '/techsolutions-84' + ruta)
const lista = await visitante.http('84-01', 'GET', api + '/productos?q=' + run + '&tamano=1', 200)
assert.deepEqual(lista.valor.items.map(p => p.idProducto), [id])
assert.equal((await visitante.http('84-02', 'GET', ruta, 200)).valor.precio, '12.00')
assert.equal((await admin.http('84-06 PATCH', 'PATCH', ruta + '/stock', 200,
  { datos: { stockEsperado: 4, stockNuevo: 5 } })).valor.stock, 5)
await admin.http('84-06 conflicto', 'PATCH', ruta + '/stock', 409, { datos: { stockEsperado: 4, stockNuevo: 8 } })
assert.equal((await admin.http('84-05', 'PUT', ruta, 200, { datos: { ...datos, estado: 'INACTIVO' } })).valor.stock, 5)
await visitante.http('84-02 inactivo', 'GET', ruta, 404)
await admin.http('84-02 admin inactivo', 'GET', ruta, 200)
await visitante.http('84-01 filtro restringido', 'GET', api + '/productos?estado=TODOS', 403)
assert.ok((await admin.http('84-01 filtro admin', 'GET', api + '/productos?estado=INACTIVO&q=' + run, 200))
  .valor.items.some(p => p.idProducto === id))
await admin.http('84-07', 'DELETE', ruta, 204)
const metodo = await visitante.http('HTTP método', 'PUT', api + '/categorias', 405)
assert.equal(metodo.res.headers.get('allow'), 'GET')
await visitante.http('HTTP negociación', 'GET', api + '/categorias', 406, { cabeceras: { Accept: 'text/plain' } })
await admin.http('HTTP tipo de cuerpo', 'POST', api + '/productos', 415, { datos, cabeceras: { 'Content-Type': 'text/plain' } })
await visitante.http('JSP listado público', 'GET', '/productos', 200)
await visitante.http('JSP formulario sin sesión', 'GET', '/productos?accion=nuevo', 401)
await visitante.http('JSP POST sin sesión', 'POST', '/productos', 401)
await cliente.http('JSP POST rol cliente', 'POST', '/productos', 403)
await admin.http('JSP POST sin CSRF', 'POST', '/productos', 403, { formulario: true, datos: { stock: 1 } })
const jsp = await admin.http('JSP formulario admin', 'GET', '/productos?accion=nuevo', 200)
assert.ok(jsp.valor.includes('name="csrf"'))
const registroJsp = 'JSP QA ' + run
await admin.http('JSP POST válido', 'POST', '/productos', 302, { formulario: true,
  datos: { csrf: admin.csrf, idCategoria: categoria, nombreProducto: registroJsp, marca: 'Marca QA',
    precio: '12.00', stock: 2, estado: 'ACTIVO' } })
const jspCreado = (await visitante.http('JSP persistencia', 'GET', api + '/productos?q=' + encodeURIComponent(registroJsp), 200)).valor.items[0]
assert.ok(jspCreado)
await admin.http('84-07 limpieza producto ficticio', 'DELETE', api + '/productos/' + jspCreado.idProducto, 204)
if (integral) await verificarContratosAdicionales()

if (modo !== 'catalogo') {
  await verificarCarritoPedidos()
}
await cliente.http('84-12', 'DELETE', api + '/sesion', 204)
await cliente.http('84-12 sesión invalidada', 'GET', api + '/sesion', 401)
if (integral) {
  const pruebaLimite = new Navegador()
  await pruebaLimite.token()
  let altaLimitada = false
  for (let i = 1; i <= 11 && !altaLimitada; i += 1) {
    const intento = await pruebaLimite.http('T09.b límite alta ' + i, 'POST', api + '/usuarios', [422, 429],
      { datos: { ...registro, correo: 'invalido' } })
    altaLimitada = intento.res.status === 429
  }
  assert.ok(altaLimitada, 'Se alcanzó el límite de registro')
  let limitado = false
  for (let i = 1; i <= 21 && !limitado; i += 1) {
    const intento = await pruebaLimite.http('T10.a límite intento ' + i, 'POST', api + '/sesion', [401, 429],
      { datos: { correo: 'limite-' + run + '@example.test', contrasena: 'ficticia-no-valida' } })
    limitado = intento.res.status === 429
  }
  assert.ok(limitado, 'Se alcanzó el límite de acceso')
}
if (integral) {
  const orden = tiempos.toSorted((a, b) => a - b)
  console.log('T21 HTTP local ms ' + JSON.stringify({
    muestras: orden.length, minimo: +orden[0].toFixed(2),
    mediana: +orden[Math.ceil(orden.length * 0.5) - 1].toFixed(2),
    p95: +orden[Math.ceil(orden.length * 0.95) - 1].toFixed(2),
    maximo: +orden.at(-1).toFixed(2), bajo3000: orden.filter(t => t < 3000).length
  }))
}
console.log('Verificación técnica ' + modo + ' completada.')

async function verificarCarritoPedidos() {
  const alterno = new Navegador()
  const alternoCorreo = 'otro-' + run + '@example.test'
  const alternoClave = randomUUID() + randomUUID()
  await alterno.token()
  await alterno.http('84-09 segundo cliente', 'POST', api + '/usuarios', 201,
    { datos: { ...registro, correo: alternoCorreo, contrasena: alternoClave } })
  await alterno.login(alternoCorreo, alternoClave)

  const producto = (await admin.http('84-04 producto para carrito', 'POST', api + '/productos', 201,
    { datos: { ...datos, nombreProducto: 'Compra QA ' + run, stockInicial: 5 } })).valor
  const item = api + '/carrito/items/' + producto.idProducto
  if (integral) {
    await visitante.http('T13.a anónimo', 'GET', api + '/carrito', 401)
    await cliente.http('T14.a cantidad cero', 'PUT', item, 422, { datos: { cantidad: 0 } })
    await cliente.http('T14.b propietario impuesto', 'PUT', item, 400, { datos: { cantidad: 1, idUsuario: 123 } })
    await cliente.http('T14.c producto inexistente', 'PUT', api + '/carrito/items/2147483647', 404, { datos: { cantidad: 1 } })
    await admin.http('T14.d desactivar', 'PUT', api + '/productos/' + producto.idProducto, 200,
      { datos: { ...datos, nombreProducto: producto.nombreProducto, estado: 'INACTIVO' } })
    await cliente.http('T14.e producto inactivo', 'PUT', item, 409, { datos: { cantidad: 1 } })
    await admin.http('T14.f reactivar', 'PUT', api + '/productos/' + producto.idProducto, 200,
      { datos: { ...datos, nombreProducto: producto.nombreProducto } })
  }
  assert.deepEqual((await cliente.http('84-13 vacío', 'GET', api + '/carrito', 200)).valor.items, [])
  await admin.http('84-13 rol', 'GET', api + '/carrito', 403)
  await cliente.http('84-14 cantidad inválida', 'PUT', item, 422, { datos: { cantidad: 100 } })
  await cliente.http('84-14 stock insuficiente', 'PUT', item, 409, { datos: { cantidad: 6 } })
  const agregado = await cliente.http('84-14', 'PUT', item, 201, { datos: { cantidad: 2 } })
  assert.equal(agregado.res.headers.get('location'), '/techsolutions-84' + item)
  await cliente.http('84-14 reemplazo idempotente', 'PUT', item, 200, { datos: { cantidad: 2 } })
  const carrito = (await cliente.http('84-13', 'GET', api + '/carrito', 200)).valor
  assert.equal(carrito.items.length, 1)
  assert.equal(carrito.items[0].cantidad, 2)
  assert.equal(carrito.subtotalEstimado, '24.00')
  assert.ok(carrito.confirmacionCarrito)
  assert.deepEqual((await alterno.http('84-13 aislamiento', 'GET', api + '/carrito', 200)).valor.items, [])
  await cliente.http('84-15', 'DELETE', item, 204)
  await cliente.http('84-15 repetición', 'DELETE', item, 204)
  if (integral) {
    const cambios = await Promise.all([1, 2].map(cantidad =>
      cliente.http('T14.g mutación concurrente ' + cantidad, 'PUT', item, [200, 201], { datos: { cantidad } })))
    assert.deepEqual(cambios.map(c => c.res.status).sort(), [200, 201])
    const estado = await cliente.http('T14.h unicidad después de carrera', 'GET', api + '/carrito', 200)
    assert.equal(estado.valor.items.length, 1)
    assert.ok([1, 2].includes(estado.valor.items[0].cantidad))
  } else {
    await cliente.http('84-14 reingreso', 'PUT', item, 201, { datos: { cantidad: 1 } })
  }
  await cliente.http('84-16', 'DELETE', api + '/carrito', 204)
  assert.deepEqual((await cliente.http('84-13 vacío tras borrado', 'GET', api + '/carrito', 200)).valor.items, [])
  await admin.http('84-07 limpieza carrito', 'DELETE', api + '/productos/' + producto.idProducto, 204)
  if (modo === 'completa') await verificarPedidos(alterno)
}

async function verificarContratosAdicionales() {
  await visitante.http('T20.a ruta inexistente', 'GET', api + '/no-existe', 404)
  await visitante.http('T02.a ID cero', 'GET', api + '/productos/0', 400)
  await visitante.http('T02.b ID inexistente', 'GET', api + '/productos/2147483647', 404)
  await visitante.http('T01.a página inválida', 'GET', api + '/productos?tamano=101', 400)
  const a = (await visitante.http('T01.b página 1', 'GET', api + '/productos?tamano=1&pagina=1', 200)).valor
  const b = (await visitante.http('T01.c página 2', 'GET', api + '/productos?tamano=1&pagina=2', 200)).valor
  assert.ok(a.items[0].idProducto < b.items[0].idProducto)
  const filtro = (await visitante.http('T01.d categoría', 'GET', api + '/productos?idCategoria=' + categoria, 200)).valor
  assert.ok(filtro.items.length > 0 && filtro.items.every(p => p.idCategoria === categoria && p.estado === 'ACTIVO'))
  for (const [campo, valor] of Object.entries({ precio: '-0.01', stockInicial: -1, marca: 'a'.repeat(51), nombreProducto: 'a'.repeat(101) })) {
    await admin.http('T04.a límite ' + campo, 'POST', api + '/productos', 422, { datos: { ...datos, [campo]: valor } })
  }
  await admin.http('T04.b importe fuera de rango', 'POST', api + '/productos', 422, { datos: { ...datos, precio: '10000000000.00' } })
  await admin.http('T04.c precio de tipo incorrecto', 'POST', api + '/productos', 400, { datos: { ...datos, precio: 12 } })
  await admin.http('T20.b límite de tamaño', 'POST', api + '/productos', 413, { bruto: ' '.repeat(131073) })
  await admin.http('T20.c límite de profundidad', 'POST', api + '/productos', 400,
    { bruto: '{"descripcion":' + '['.repeat(18) + '0' + ']'.repeat(18) + '}' })
  const registroNegativo = new Navegador()
  await registroNegativo.token()
  for (const [campo, valor] of Object.entries({ nombre: null, correo: 'invalido', contrasena: 'corta', rol: 'ADMINISTRADOR' })) {
    await registroNegativo.http('T09.a registro inválido ' + campo, 'POST', api + '/usuarios', campo === 'rol' ? 400 : 422,
      { datos: { ...registro, correo: 'negativo-' + run + '@example.test', [campo]: valor } })
  }
  await visitante.http('T20.d CORS no permitido', 'OPTIONS', api + '/productos', 403,
    { cabeceras: { Origin: 'https://example.test', 'Access-Control-Request-Method': 'POST' } })
}

async function verificarPedidos(alterno) {
  const producto = (await admin.http('84-04 producto para pedido', 'POST', api + '/productos', 201,
    { datos: { ...datos, nombreProducto: 'Pedido QA ' + run, stockInicial: 3 } })).valor
  const rutaProducto = api + '/productos/' + producto.idProducto
  const item = api + '/carrito/items/' + producto.idProducto
  const pedidos = api + '/pedidos'
  const verCarrito = async navegador => (await navegador.http('84-13 cotización', 'GET', api + '/carrito', 200)).valor
  const postar = (nav, etiqueta, cuerpo, clave, status) => nav.http(etiqueta, 'POST', pedidos, status,
    { datos: { confirmacionCarrito: cuerpo }, cabeceras: { 'Idempotency-Key': clave } })
  const comprar = async (nav, etiqueta, cotizacion, status) => postar(nav, etiqueta, cotizacion, randomUUID(), status)
  if (integral) {
    await comprar(cliente, 'T17.a carrito vacío', (await verCarrito(cliente)).confirmacionCarrito, 409)
    await visitante.http('T18.a anónimo', 'GET', pedidos, 401)
    await cliente.http('T19.a ID inválido', 'GET', pedidos + '/0', 400)
    await cliente.http('T19.b pedido inexistente', 'GET', pedidos + '/2147483647', 404)
  }
  await cliente.http('84-14 preparar pedido', 'PUT', item, 201, { datos: { cantidad: 1 } })
  const inicial = (await verCarrito(cliente)).confirmacionCarrito
  await comprar(alterno, '84-17 token de otro usuario', inicial, 400)
  await comprar(cliente, '84-17 token malformado', 'a.b', 400)
  await postar(cliente, '84-17 clave malformada', inicial, 'incorrecta', 400)
  await cliente.http('84-14 cambiar revisión', 'PUT', item, 200, { datos: { cantidad: 2 } })
  const revision = await comprar(cliente, '84-17 revisión modificada', inicial, 409)
  assert.equal(revision.valor.codigo, 'CONFIRMACION_MODIFICADA')
  const precioAnterior = (await verCarrito(cliente)).confirmacionCarrito
  await admin.http('84-05 cambio de precio', 'PUT', rutaProducto, 200,
    { datos: { ...datos, nombreProducto: producto.nombreProducto, precio: '15.00' } })
  const precio = await comprar(cliente, '84-17 precio modificado', precioAnterior, 409)
  assert.equal(precio.valor.codigo, 'CONFIRMACION_MODIFICADA')
  assert.equal((await verCarrito(cliente)).items[0].cantidad, 2)
  assert.equal((await visitante.http('84-02 stock intacto tras conflicto', 'GET', rutaProducto, 200)).valor.stock, 3)
  assert.equal((await cliente.http('84-18 sin pedido tras conflicto', 'GET', pedidos, 200)).valor.total, 0)
  const vigente = (await verCarrito(cliente)).confirmacionCarrito
  if (integral) {
    await admin.http('T17.b desactivar artículo cotizado', 'PUT', rutaProducto, 200,
      { datos: { ...datos, nombreProducto: producto.nombreProducto, estado: 'INACTIVO', precio: '15.00' } })
    const rechazo = await comprar(cliente, 'T17.c artículo inactivo', vigente, 409)
    assert.equal(rechazo.valor.codigo, 'PRODUCTO_NO_DISPONIBLE')
    assert.equal((await verCarrito(cliente)).items[0].cantidad, 2)
    await admin.http('T17.d reactivar artículo', 'PUT', rutaProducto, 200,
      { datos: { ...datos, nombreProducto: producto.nombreProducto, precio: '15.00' } })
  }
  const clave = randomUUID()
  let paraConfirmar = vigente
  let vence
  if (process.env.TECHSOLUTIONS_CART_SIGNING_KEY) {
    const firmarConVence = (token, vencimiento) => {
      const payload = JSON.parse(Buffer.from(token.split('.')[0], 'base64url'))
      payload.vence = vencimiento
      const bytes = Buffer.from(JSON.stringify(payload))
      const firma = createHmac('sha256', Buffer.from(process.env.TECHSOLUTIONS_CART_SIGNING_KEY, 'base64')).update(bytes).digest('base64url')
      return bytes.toString('base64url') + '.' + firma
    }
    const vencida = await comprar(cliente, '84-17 referencia vencida', firmarConVence(vigente, 1), 409)
    assert.equal(vencida.valor.codigo, 'CONFIRMACION_VENCIDA')
    vence = Math.floor(Date.now() / 1000) + 4
    paraConfirmar = firmarConVence(vigente, vence)
  }
  const creado = await postar(cliente, '84-17', paraConfirmar, clave, 201)
  assert.equal(creado.valor.estado, 'REGISTRADO')
  assert.equal(creado.valor.total, '30.00')
  assert.equal(creado.valor.items[0].precioUnitario, '15.00')
  assert.equal(creado.res.headers.get('location'), '/techsolutions-84' + pedidos + '/' + creado.valor.idPedido)
  assert.deepEqual((await verCarrito(cliente)).items, [])
  if (vence) await new Promise(resolve => setTimeout(resolve, Math.max(0, vence * 1000 - Date.now() + 100)))
  const replay = await postar(cliente, vence ? '84-17 replay tras vencimiento' : '84-17 replay', paraConfirmar, clave, 200)
  assert.deepEqual(replay.valor, creado.valor)
  const reutilizada = await postar(cliente, '84-17 clave reutilizada', precioAnterior, clave, 409)
  assert.equal(reutilizada.valor.codigo, 'CLAVE_IDEMPOTENCIA_EN_USO')
  assert.equal((await visitante.http('84-02 descuento único', 'GET', rutaProducto, 200)).valor.stock, 1)
  const historial = (await cliente.http('84-18', 'GET', pedidos + '?pagina=1&tamano=1', 200)).valor
  assert.equal(historial.total, 1)
  assert.equal(historial.items[0].idPedido, creado.valor.idPedido)
  const detalle = pedidos + '/' + creado.valor.idPedido
  assert.deepEqual((await cliente.http('84-19', 'GET', detalle, 200)).valor, creado.valor)
  if (integral) {
    await admin.http('T17.e subir precio tras pedido', 'PUT', rutaProducto, 200,
      { datos: { ...datos, nombreProducto: producto.nombreProducto, precio: '16.00' } })
    assert.deepEqual((await cliente.http('T19.c importe histórico', 'GET', detalle, 200)).valor, creado.valor)
  }
  await alterno.http('84-19 pedido ajeno', 'GET', detalle, 404)
  assert.equal((await alterno.http('84-18 aislamiento', 'GET', pedidos, 200)).valor.total, 0)
  await admin.http('84-07 FK', 'DELETE', rutaProducto, 409)

  await cliente.http('84-14 carrera cliente A', 'PUT', item, 201, { datos: { cantidad: 1 } })
  await alterno.http('84-14 carrera cliente B', 'PUT', item, 201, { datos: { cantidad: 1 } })
  const [a, b] = await Promise.all([verCarrito(cliente), verCarrito(alterno)])
  const carrera = await Promise.all([
    comprar(cliente, '84-17 carrera cliente A', a.confirmacionCarrito, [201, 409]),
    comprar(alterno, '84-17 carrera cliente B', b.confirmacionCarrito, [201, 409])
  ])
  assert.deepEqual(carrera.map(r => r.res.status).sort(), [201, 409])
  assert.equal((await visitante.http('84-02 último stock', 'GET', rutaProducto, 200)).valor.stock, 0)
  const noCompro = carrera[0].res.status === 409 ? cliente : alterno
  assert.equal((await verCarrito(noCompro)).items[0].cantidad, 1)
  await noCompro.http('84-16 limpiar carrito ficticio', 'DELETE', api + '/carrito', 204)

  const duplicado = (await admin.http('84-04 producto replay concurrente', 'POST', api + '/productos', 201,
    { datos: { ...datos, nombreProducto: 'Idempotencia QA ' + run, stockInicial: 1 } })).valor
  const rutaDuplicado = api + '/productos/' + duplicado.idProducto
  await cliente.http('84-14 preparar replay concurrente', 'PUT', api + '/carrito/items/' + duplicado.idProducto, 201,
    { datos: { cantidad: 1 } })
  const cotizacion = (await verCarrito(cliente)).confirmacionCarrito
  const claveConcurrente = randomUUID()
  const simultaneos = await Promise.all([
    postar(cliente, '84-17 misma clave concurrente A', cotizacion, claveConcurrente, [200, 201]),
    postar(cliente, '84-17 misma clave concurrente B', cotizacion, claveConcurrente, [200, 201])
  ])
  assert.deepEqual(simultaneos.map(r => r.res.status).sort(), [200, 201])
  assert.deepEqual(simultaneos[0].valor, simultaneos[1].valor)
  assert.equal((await visitante.http('84-02 stock tras replay concurrente', 'GET', rutaDuplicado, 200)).valor.stock, 0)
}
