import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { once } from 'node:events'
import { setTimeout as esperar } from 'node:timers/promises'

const [chrome, sitio = 'http://127.0.0.1:4381'] = process.argv.slice(2)
assert.ok(chrome, 'Indica la ruta al ejecutable de Chrome o Chromium.')
const claveDemo = process.env.TECHSOLUTIONS_QA_PASSWORD
assert.ok(claveDemo, 'Configura TECHSOLUTIONS_QA_PASSWORD con la clave de la cuenta ficticia.')
const evidencias = resolve('qa/evidencias-ev03')
await mkdir(evidencias, { recursive: true })
const perfil = await mkdtemp(join(tmpdir(), 'techsolutions-ev03-'))
const navegador = spawn(chrome, [
  ...(process.env.TECHSOLUTIONS_QA_VISIBLE === '1' ? [] : ['--headless']),
  '--disable-gpu', '--remote-debugging-port=0', '--window-size=1440,1000',
  `--user-data-dir=${perfil}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true })
const errores = []
let socket

async function hasta(comprobar, descripcion) {
  for (let intento = 0; intento < 100; intento++) {
    const resultado = await comprobar()
    if (resultado) return resultado
    await esperar(50)
  }
  throw new Error(descripcion)
}

try {
  const puerto = await hasta(async () => {
    try {
      return (await readFile(join(perfil, 'DevToolsActivePort'), 'utf8')).split('\n')[0]
    } catch {
      return false
    }
  }, 'Chrome no publicó el puerto de depuración.')
  const paginas = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()
  socket = new WebSocket(paginas.find(({ type }) => type === 'page').webSocketDebuggerUrl)
  await once(socket, 'open')
  let cierre
  socket.addEventListener('close', evento => { cierre = evento })
  const pendientes = new Map()
  let id = 0
  socket.addEventListener('message', ({ data }) => {
    const mensaje = JSON.parse(data)
    if (mensaje.method === 'Runtime.exceptionThrown') errores.push(mensaje.params.exceptionDetails.text)
    if (mensaje.id) {
      pendientes.get(mensaje.id)?.(mensaje)
      pendientes.delete(mensaje.id)
    }
  })

  async function comando(method, params = {}) {
    const actual = ++id
    const respuesta = new Promise(resolve => pendientes.set(actual, resolve))
    socket.send(JSON.stringify({ id: actual, method, params }))
    const mensaje = await Promise.race([respuesta, esperar(7000, null)])
    assert.ok(mensaje, `Chrome no respondió a ${method} (${cierre?.code ?? socket.readyState} ${cierre?.reason ?? ''}).`)
    assert.ok(!mensaje.error, JSON.stringify(mensaje.error))
    return mensaje.result
  }

  async function evaluar(fn, ...args) {
    const { result, exceptionDetails } = await comando('Runtime.evaluate', {
      expression: `(${fn})(...${JSON.stringify(args)})`,
      returnByValue: true,
    })
    assert.ok(!exceptionDetails, exceptionDetails?.exception?.description)
    return result.value
  }

  async function abrir(ruta, titulo) {
    const anterior = await evaluar(() => performance.timeOrigin)
    await comando('Page.navigate', { url: new URL(ruta, sitio).href })
    await hasta(() => evaluar((instante, texto) =>
      performance.timeOrigin !== instante && document.querySelector('h1')?.textContent.includes(texto),
    anterior, titulo), `No cargó ${ruta} ${titulo}`)
  }

  async function click(selector, texto = '') {
    await hasta(() => evaluar((sel, nombre) => {
      const elemento = [...document.querySelectorAll(sel)].find(el =>
        !el.disabled && el.getClientRects().length && el.textContent.trim().includes(nombre))
      elemento?.click()
      return Boolean(elemento)
    }, selector, texto), `Control no disponible ${selector} ${texto}`)
  }

  const botonDeshabilitado = texto => evaluar(nombre =>
    [...document.querySelectorAll('button')].find(el => el.textContent.trim() === nombre)?.disabled, texto)
  const titulo = texto => hasta(() => evaluar(t =>
    document.querySelector('h1')?.textContent.trim() === t, texto), texto)

  async function tecla(key, windowsVirtualKeyCode, modifiers = 0) {
    const datos = {
      key, code: key === ' ' ? 'Space' : key,
      windowsVirtualKeyCode,
      modifiers,
    }
    await comando('Input.dispatchKeyEvent', {
      type: key === 'Tab' ? 'rawKeyDown' : 'keyDown', ...datos,
      text: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined,
    })
    await comando('Input.dispatchKeyEvent', { type: 'keyUp', ...datos })
    await esperar(60)
  }

  async function tabHasta(selector, texto = '') {
    const recorrido = new Set()
    for (let i = 0; i < 60; i++) {
      await tecla('Tab', 9)
      recorrido.add(await evaluar(() => {
        const el = document.activeElement
        return [el.tagName, el.id, el.getAttribute('aria-label'), el.getAttribute('href')].filter(Boolean).join(' ')
      }))
      if (await evaluar((sel, nombre) =>
        document.activeElement?.matches(sel) &&
        document.activeElement.textContent.includes(nombre), selector, texto)) return
    }
    throw new Error(`Foco no encontrado: ${selector} ${texto}. ${[...recorrido].join(', ')}`)
  }

  async function enfocar(selector, texto = '') {
    assert.ok(await evaluar((sel, nombre) => {
      const control = [...document.querySelectorAll(sel)].find(el =>
        !el.matches(':disabled') && el.textContent.includes(nombre))
      control?.focus()
      return control && document.activeElement === control
    }, selector, texto), `No se pudo enfocar ${selector} ${texto}`)
  }

  async function ajustarAncho(width) {
    await comando('Emulation.setDeviceMetricsOverride', {
      width, height: 900, deviceScaleFactor: 1, mobile: false,
    })
    await hasta(() => evaluar(ancho => innerWidth === ancho, width), `Ancho ${width}`)
  }

  async function captura(nombre) {
    await evaluar(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    const { cssContentSize: { height } } = await comando('Page.getLayoutMetrics')
    const width = await evaluar(() => innerWidth)
    const { data } = await comando('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: Math.ceil(height), scale: 1 },
    })
    await writeFile(join(evidencias, `${nombre}.png`), Buffer.from(data, 'base64'))
  }

  async function ajustaYCaptura(vista) {
    for (const ancho of [320, 390, 768, 1440]) {
      await ajustarAncho(ancho)
      assert.ok(await evaluar(() => document.documentElement.scrollWidth <= innerWidth),
        vista + ' desborda a ' + ancho + ' px')
      if (ancho === 320 || ancho === 1440) await captura(vista + '-' + ancho)
    }
  }

  async function escribir(selector, valor) {
    await enfocar(selector)
    await comando('Input.insertText', { text: valor })
  }

  async function esperarTexto(texto) {
    await hasta(() => evaluar(t => document.querySelector('main').innerText.includes(t), texto), texto)
  }

  async function login(rol, destino) {
    await abrir('/login', 'Iniciar sesión')
    await escribir('#login-correo', rol + '@techsolutions.com')
    await escribir('#login-contrasena', claveDemo)
    await tecla('Enter', 13)
    await titulo(destino)
  }

  async function seleccionar(selector, valor) {
    await evaluar((sel, val) => {
      const control = document.querySelector(sel)
      control.value = val
      control.dispatchEvent(new Event('change', { bubbles: true }))
    }, selector, valor)
  }

  await comando('Page.enable')
  await comando('Runtime.enable')
  await comando('Emulation.setFocusEmulationEnabled', { enabled: true })
  await ajustarAncho(1440)

  await abrir('/cliente', 'Iniciar sesión')
  await abrir('/admin', 'Iniciar sesión')
  await login('cliente', 'Panel del cliente')
  await esperarTexto('Todavía no tienes pedidos')
  await click('button', 'Mi perfil')
  await esperarTexto('Cliente Demo')
  await click('button', 'Mis favoritos')
  await esperarTexto('No hay favoritos')
  await click('button', 'Configuración')
  await esperarTexto('sin edición')
  await abrir('/admin', 'Panel del cliente')
  assert.equal(await evaluar(() => location.pathname), '/cliente')
  // Datos de prueba del mismo modelo que usa el servicio de pedidos.
  await evaluar(() => {
    const ejemplo = {
      id: 17, cliente: { id: 2, nombre: 'Cliente Demo' },
      productos: [{ id: 3, nombre: 'Mouse Logitech', precio: 180000, cantidad: 1 }],
      subtotal: 180000, iva: 34200, costoEnvio: 0, total: 214200,
    }
    localStorage.setItem('techsolutions_pedidos_2', JSON.stringify([ejemplo]))
    localStorage.setItem('techsolutions_pedidos_1', JSON.stringify([{ ...ejemplo, id: 99 }]))
  })
  await abrir('/cliente', 'Panel del cliente')
  await esperarTexto('Pedido 17')
  assert.equal(await evaluar(() => document.querySelector('main').innerText.includes('Pedido 99')), false)
  await click('button', 'Ver detalle del pedido 17')
  await esperarTexto('Mouse Logitech')
  await ajustaYCaptura('cliente')
  await evaluar(() => localStorage.setItem('techsolutions_pedidos_2', '[null]'))
  await abrir('/cliente', 'Panel del cliente')
  await esperarTexto('No fue posible recuperar tus pedidos.')
  console.log('EV03.4 cliente · acceso, secciones, vacío, pedido local y aislamiento por usuario')

  await click('button', 'Cerrar sesión')
  await login('admin', 'Panel de administración')
  await abrir('/cliente', 'Panel de administración')
  assert.equal(await evaluar(() => location.pathname), '/admin')
  await click('button', 'Agregar producto')
  assert.equal(await evaluar(() => document.querySelector('#admin-nombre').validity.valueMissing), true)
  await escribir('#admin-nombre', 'Producto QA EV03')
  await seleccionar('#admin-categoria', 'Accesorios')
  await escribir('#admin-precio', '-1')
  await click('button', 'Agregar producto')
  assert.equal(await evaluar(() => document.querySelector('#admin-precio').validity.rangeUnderflow), true)
  await tecla('Backspace', 8)
  await tecla('Backspace', 8)
  await escribir('#admin-precio', '1000')
  await click('button', 'Agregar producto')
  await esperarTexto('Producto agregado')
  await click('button[aria-label="Eliminar Producto QA EV03"]')
  await esperarTexto('Producto eliminado')
  await click('button', 'Categorías')
  await esperarTexto('Gestión de categorías')
  await click('button', 'Pedidos')
  await seleccionar('#admin-estado', 'Enviado')
  await esperarTexto('Estado actualizado')
  await ajustaYCaptura('admin')
  console.log('EV03.4 administrador · roles, validación, alta, baja, categorías y estado simulado')

  await abrir('/contacto', 'Contacto')
  await click('button[type="submit"]')
  assert.equal(await evaluar(() => document.querySelector('#contacto-nombre').validity.valueMissing), true)
  await escribir('#contacto-nombre', '   ')
  assert.equal(await evaluar(() => document.querySelector('#contacto-nombre').validity.customError), true)
  await click('button[type="reset"]')
  assert.equal(await evaluar(() => document.querySelector('#contacto-nombre').validity.customError), false)
  await escribir('#contacto-nombre', 'Cliente QA')
  await escribir('#contacto-correo', 'invalido')
  assert.equal(await evaluar(() => document.querySelector('#contacto-correo').validity.typeMismatch), true)
  await click('button[type="reset"]')
  await escribir('#contacto-nombre', 'Cliente QA')
  await escribir('#contacto-correo', 'cliente-qa@example.test')
  await escribir('#contacto-asunto', 'Prueba académica')
  await escribir('#contacto-mensaje', 'Mensaje de demostración')
  await click('button[type="submit"]')
  await esperarTexto('Envío simulado completado')
  assert.equal(await evaluar(() => [...document.querySelectorAll('main input, main textarea')].every(campo => campo.value === '')), true)
  await ajustaYCaptura('contacto')
  console.log('EV03.4 contacto · requeridos, espacios, correo, confirmación y limpieza')

  await abrir('/catalogo?categoria=Accesorios', 'Catálogo de productos')
  assert.equal(await evaluar(() => document.querySelector('#filtro-categorias').value), 'Accesorios')
  assert.equal(await evaluar(() => document.querySelectorAll('main a[href^="/producto/"]').length), 2)
  await escribir('input[type="search"]', 'zz sin coincidencias')
  await esperarTexto('No se encontraron productos')
  await captura('catalogo-sin-resultados')
  await click('main button', 'Limpiar filtros')
  assert.equal(await evaluar(() => document.querySelectorAll('main a[href^="/producto/"]').length), 6)
  await abrir('/producto/3', 'Mouse Logitech')
  assert.equal(await evaluar(() => document.querySelector('[aria-labelledby="titulo-relacionados"] a').getAttribute('href')), '/producto/4')
  await ajustaYCaptura('relacionados')
  await click('[aria-labelledby="titulo-relacionados"] a[href="/producto/4"]')
  await titulo('Teclado mecánico')
  await hasta(() => evaluar(() => document.activeElement.id === 'titulo-detalle-producto'), 'Foco en el producto relacionado')
  assert.equal(await evaluar(() => document.querySelector('[aria-labelledby="titulo-relacionados"] a').getAttribute('href')), '/producto/3')
  await abrir('/producto/1', 'Lenovo LOQ 15')
  assert.equal(await evaluar(() => Boolean(document.querySelector('#titulo-relacionados'))), false)
  console.log('EV03.4 catálogo y detalle · filtro, sin resultados, limpieza y relacionados')

  await abrir('/ruta-ev03-inexistente', 'Página no encontrada')
  await ajustaYCaptura('404')
  await tabHasta('main a[href="/"]')
  await tecla('Enter', 13)
  await hasta(() => evaluar(() => location.pathname === '/'), 'No volvió al inicio')
  await click('button', 'Cerrar sesión')
  await abrir('/registro', 'Crear una cuenta')
  await click('main button[type="submit"]')
  await hasta(() => evaluar(() => Boolean(document.querySelector('main [aria-invalid="true"]'))), 'Sin errores de registro')
  await escribir('#registro-nombre', 'Cliente QA')
  await escribir('#registro-correo', 'cliente-qa@example.test')
  await escribir('#registro-telefono', '3001234567')
  await escribir('#registro-direccion', 'Calle 123')
  await escribir('#registro-contrasena', 'PruebaEV03')
  await escribir('#registro-confirmar-contrasena', 'PruebaEV03')
  await click('main button[type="submit"]')
  await esperarTexto('no crea una cuenta real')
  await captura('registro-simulado')
  assert.deepEqual(errores, [])
  console.log('EV03.4 404 y registro · retorno al inicio, validación negativa y registro simulado')

} finally {
  socket?.close()
  if (navegador.exitCode === null) {
    const salida = once(navegador, 'exit')
    navegador.kill()
    await Promise.race([salida, esperar(1500)])
  }
  assert.equal(dirname(resolve(perfil)), resolve(tmpdir()))
  assert.ok(basename(perfil).startsWith('techsolutions-ev03-'))
  await rm(perfil, { recursive: true, force: true, maxRetries: 4, retryDelay: 150 })
}
