import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { once } from 'node:events'
import { setTimeout as esperar } from 'node:timers/promises'

const [chrome, sitio = 'http://127.0.0.1:4380', modo] = process.argv.slice(2)
assert.ok(chrome, 'Indica la ruta al ejecutable de Chrome o Chromium.')
const claveDemo = process.env.TECHSOLUTIONS_QA_PASSWORD
assert.ok(claveDemo, 'Configura TECHSOLUTIONS_QA_PASSWORD con la clave de la cuenta ficticia.')
const evidencias = resolve('qa/evidencias-438')
await mkdir(evidencias, { recursive: true })
const perfil = await mkdtemp(join(tmpdir(), 'techsolutions-438-'))
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
  const claveCarrito = 'techsolutions_carrito_2'
  const clavePedidos = 'techsolutions_pedidos_2'
  const leer = clave => evaluar(k => JSON.parse(localStorage.getItem(k)), clave)
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

  async function importeVisible(...valores) {
    for (const valor of valores) {
      assert.ok(await evaluar(n =>
        document.querySelector('main').innerText.includes(n.toLocaleString('es-CO')), valor), `Importe ausente: ${valor}`)
    }
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

  async function comprobarAnchos(vista) {
    for (const width of [320, 390, 768, 1440]) {
      await ajustarAncho(width)
      assert.ok(await evaluar(() =>
        document.documentElement.scrollWidth <= innerWidth), `${vista} desborda a ${width}px`)
      if (vista === 'carrito' && width === 320) {
        assert.ok(await evaluar(() => {
          const cantidad = document.querySelector('[aria-label^="Cantidad de"]').getBoundingClientRect()
          const subtotal = document.querySelector('.item-carrito .text-primary').getBoundingClientRect()
          return cantidad.bottom <= subtotal.top
        }), 'La cantidad invade el subtotal a 320 px')
      }
      await captura(`${vista}-${width}`)
    }
  }

  async function tocar(selector) {
    const punto = await evaluar(sel => {
      const elemento = document.querySelector(sel)
      elemento.scrollIntoView({ block: 'center', behavior: 'instant' })
      const rect = elemento.getBoundingClientRect()
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    }, selector)
    const coordenadas = { x: Math.round(punto.x), y: Math.round(punto.y), button: 'left', clickCount: 1 }
    for (const type of ['mousePressed', 'mouseReleased']) {
      await comando('Input.emulateTouchFromMouseEvent', { type, ...coordenadas })
    }
  }

  async function comprobarRadios() {
    const radios = await evaluar(() => [...document.querySelectorAll('main input[type="radio"]')].map(input => ({
      id: input.id,
      name: input.name,
      valor: input.value,
      marcado: input.checked,
      deshabilitado: input.matches(':disabled'),
      etiqueta: input.labels[0]?.textContent.trim(),
      grupo: input.closest('fieldset')?.querySelector('legend')?.textContent.trim(),
    })))
    assert.equal(radios.length, 3)
    assert.equal(new Set(radios.map(radio => radio.name)).size, 1)
    assert.equal(new Set(radios.map(radio => radio.id)).size, 3)
    assert.ok(radios.every(radio => radio.id && radio.name && radio.etiqueta && radio.grupo && !radio.marcado && !radio.deshabilitado))
    console.log(JSON.stringify(radios))
  }

  async function compraConTeclado() {
    await comando('Page.bringToFront')
    await comando('Emulation.setFocusEmulationEnabled', { enabled: true })
    await abrir('/login', 'Iniciar sesión')
    await tabHasta('#login-correo')
    await comando('Input.insertText', { text: 'cliente@techsolutions.com' })
    await tabHasta('#login-contrasena')
    await comando('Input.insertText', { text: claveDemo })
    await tecla('Enter', 13)
    await titulo('Panel del cliente')
    await abrir('/producto/1', 'Lenovo LOQ 15')
    await click('button', 'Agregar al carrito')
    await abrir('/carrito', 'Carrito de compras')
    await comando('Page.bringToFront')
    await evaluar(() => {
      window.teclasQA = []
      document.addEventListener('keydown', evento => {
        const control = evento.target
        queueMicrotask(() => window.teclasQA.push({
          tecla: evento.key, id: control.id, cancelado: evento.defaultPrevented,
          confiable: evento.isTrusted,
        }))
      })
    })
    await comprobarRadios()
    try {
      await tabHasta('input[value="recogida"]')
    } catch (error) {
      console.log(await evaluar(() => ({ focoDocumento: document.hasFocus(), teclas: window.teclasQA.slice(-8) })))
      throw error
    }
    await tecla(' ', 32)
    assert.equal(await evaluar(() => document.querySelector('input[value="recogida"]').checked), true, 'Espacio en método de envío')
    await tecla('ArrowRight', 39)
    assert.equal(await evaluar(() => document.querySelector('input[value="estandar"]').checked), true, 'Flecha derecha en método de envío')
    await tabHasta('button', 'Continuar compra')
    await tecla('Tab', 9, 8)
    assert.equal(await evaluar(() => document.activeElement.value), 'estandar', 'Shift+Tab devuelve el foco al envío')
    await tecla('Tab', 9)
    await tecla('Enter', 13)
    await titulo('Proceso de compra')
    assert.equal(await evaluar(() => document.activeElement.id), 'titulo-pagina-carrito')
    await comprobarRadios()
    assert.equal(await botonDeshabilitado('Confirmar compra'), true)
    await tabHasta('input[value="pse"]')
    await tecla(' ', 32)
    assert.equal(await evaluar(() => document.querySelector('input[value="pse"]').checked), true, 'Espacio en PSE')
    await tabHasta('button', 'Confirmar compra')
    await captura('03-foco-confirmar')
    await tecla('Enter', 13)
    await titulo('Factura del pedido')
    await importeVisible(4180000)
    assert.equal((await leer(clavePedidos)).length, 1)
    assert.deepEqual(errores, [])
    console.log('438-QA-03 aprobado · compra completa con Tab, Shift+Tab, flechas, Espacio y Enter')
  }

  await comando('Page.enable')
  await comando('Runtime.enable')
  if (modo === '--teclado') {
    await compraConTeclado()
  } else {
  await comando('Emulation.setFocusEmulationEnabled', { enabled: true })
  await comando('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await ajustarAncho(1440)
  await abrir('/login', 'Iniciar sesión')
  await tabHasta('#login-correo')
  await captura('01-foco-login')
  await comando('Input.insertText', { text: 'cliente@techsolutions.com' })
  await tabHasta('#login-contrasena')
  await comando('Input.insertText', { text: claveDemo })
  await tecla('Enter', 13)
  await titulo('Panel del cliente')
  assert.match(await evaluar(() => document.querySelector('nav').innerText), /Cliente Demo/)
  await captura('01-panel-cliente')
  console.log('438-QA-01 aprobado · formulario real, teclado y panel de cliente')

  await ajustarAncho(390)
  await comando('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await evaluar(() => {
    document.addEventListener('pointerdown', evento => {
      window.ultimoTipoPunteroQA = evento.pointerType
    })
  })
  await tocar('.navbar-toggler')
  await hasta(() => evaluar(() => document.querySelector('.navbar-toggler').getAttribute('aria-expanded') === 'true'), 'Menú táctil no abrió')
  await tocar('nav a[href="/catalogo"]')
  await titulo('Catálogo de productos')
  assert.equal(await evaluar(() => window.ultimoTipoPunteroQA), 'touch')
  await captura('05-catalogo-tactil-390')
  await comando('Emulation.setTouchEmulationEnabled', { enabled: false })
  await ajustarAncho(1440)
  await enfocar('input[type="search"]')
  await comando('Input.insertText', { text: 'Lenovo LOQ 15' })
  await hasta(() => evaluar(() => document.querySelectorAll('main a[href^="/producto/"]').length === 1), 'La búsqueda no produjo un único producto')
  await captura('02-catalogo')
  await click('main a[href="/producto/1"]')
  await titulo('Lenovo LOQ 15')
  await captura('02-detalle')
  await click('button', 'Agregar al carrito')
  await hasta(() => evaluar(() => document.querySelector('nav a[href="/carrito"] .badge')?.textContent.trim() === 'Unidades 1'), 'Contador de carrito incorrecto')
  await click('nav a[href="/carrito"]')
  await titulo('Carrito de compras')
  assert.equal((await leer(claveCarrito))[0].cantidad, 1)
  await importeVisible(3500000, 665000, 4165000)
  assert.equal(await botonDeshabilitado('Continuar compra'), true)
  console.log('438-QA-02 aprobado · búsqueda, detalle, alta, contador e importes')

  await enfocar('input[type="radio"]')
  await tecla('ArrowRight', 39)
  const envioPorFlecha = await evaluar(() => document.querySelector('input[value="estandar"]').checked)
  if (!envioPorFlecha) await click('input[value="estandar"]')
  await importeVisible(3500000, 665000, 15000, 4180000)
  assert.equal(await botonDeshabilitado('Continuar compra'), false)
  await comprobarAnchos('carrito')
  await click('button', 'Continuar compra')
  await titulo('Proceso de compra')
  await hasta(() => evaluar(() => document.activeElement?.id === 'titulo-pagina-carrito'), 'Foco inicial en pago')
  assert.equal(await botonDeshabilitado('Confirmar compra'), true)
  await enfocar('input[value="pse"]')
  await tecla(' ', 32)
  const pagoPorEspacio = await evaluar(() => document.querySelector('input[value="pse"]').checked)
  if (!pagoPorEspacio) await click('input[value="pse"]')
  assert.equal(await botonDeshabilitado('Confirmar compra'), false)
  await importeVisible(3500000, 665000, 15000, 4180000)
  await comprobarAnchos('pago')
  await enfocar('button', 'Confirmar compra')
  await captura('03-foco-confirmar')
  console.log(`438-QA-03 funcional aprobado · flecha en envío: ${envioPorFlecha}, espacio en pago: ${pagoPorEspacio}, foco inicial y métodos obligatorios verificados`)

  await click('button', 'Confirmar compra')
  await titulo('Factura del pedido')
  await hasta(() => evaluar(() => document.activeElement?.id === 'titulo-pagina-carrito'), 'Foco inicial en factura')
  const pedidos = await leer(clavePedidos)
  assert.equal(pedidos.length, 1)
  const [pedido] = pedidos
  assert.equal(pedido.cliente.nombre, 'Cliente Demo')
  assert.equal(pedido.productos[0].nombre, 'Lenovo LOQ 15')
  assert.equal(pedido.productos[0].cantidad, 1)
  assert.deepEqual([pedido.subtotal, pedido.iva, pedido.costoEnvio, pedido.total], [3500000, 665000, 15000, 4180000])
  assert.equal(await leer(claveCarrito), null)
  await importeVisible(3500000, 665000, 15000, 4180000)
  assert.match(await evaluar(() => document.querySelector('main').innerText), /Cliente Demo[\s\S]*Lenovo LOQ 15/)
  await comprobarAnchos('factura')
  await abrir('/carrito', 'Carrito de compras')
  assert.deepEqual(await leer(clavePedidos), pedidos)
  assert.equal(await botonDeshabilitado('Continuar compra'), true)
  await captura('04-carrito-vacio')
  console.log('438-QA-04 aprobado · factura, foco, vaciado y persistencia')

  assert.deepEqual(errores, [])
  console.log('438-QA-05 aprobado · tres vistas en cuatro anchos y navegación mediante toque emulado')
  }

} finally {
  socket?.close()
  if (navegador.exitCode === null) {
    const salida = once(navegador, 'exit')
    navegador.kill()
    await Promise.race([salida, esperar(1500)])
  }
  assert.equal(dirname(resolve(perfil)), resolve(tmpdir()))
  assert.ok(basename(perfil).startsWith('techsolutions-438-'))
  await rm(perfil, { recursive: true, force: true, maxRetries: 4, retryDelay: 150 })
}
