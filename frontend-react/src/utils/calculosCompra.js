
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: calculosCompra.js
 * Descripción: Utilidades para validar cantidades y calcular
 * los importes del carrito y del proceso de compra simulado.
 */

// Configuración general del proceso de compra.
export const TASA_IVA = 0.19
export const CANTIDAD_MINIMA = 1
export const CANTIDAD_MAXIMA = 99

/**
 * Métodos de envío disponibles.
 * Los costos corresponden a valores de demostración.
 */
export const METODOS_ENVIO = Object.freeze([
  Object.freeze({
    id: 'recogida',
    nombre: 'Recogida en tienda',
    costo: 0,
  }),
  Object.freeze({
    id: 'estandar',
    nombre: 'Envío estándar - Servientrega',
    costo: 15000,
  }),
  Object.freeze({
    id: 'express',
    nombre: 'Envío express',
    costo: 25000,
  }),
])

/**
 * Métodos de pago disponibles.
 * No representan transacciones financieras reales.
 */
export const METODOS_PAGO = Object.freeze([
  Object.freeze({
    id: 'pse',
    nombre: 'PSE',
  }),
  Object.freeze({
    id: 'tarjeta',
    nombre: 'Tarjeta de crédito o débito',
  }),
  Object.freeze({
    id: 'contraentrega',
    nombre: 'Contraentrega',
  }),
])

/**
 * Verifica que una cantidad sea un número entero
 * dentro de los límites permitidos.
 */
export function esCantidadValida(cantidad) {
  return (
    Number.isInteger(cantidad) &&
    cantidad >= CANTIDAD_MINIMA &&
    cantidad <= CANTIDAD_MAXIMA
  )
}

/**
 * Verifica que un precio sea un número válido
 * y no negativo.
 */
export function esPrecioValido(precio) {
  return (
    typeof precio === 'number' &&
    Number.isFinite(precio) &&
    precio >= 0
  )
}

/**
 * Calcula el subtotal correspondiente a un producto.
 */
export function calcularSubtotalProducto(precio, cantidad) {
  if (!esPrecioValido(precio) || !esCantidadValida(cantidad)) {
    return 0
  }

  return Math.round(precio * cantidad)
}

/**
 * Calcula el subtotal general de los productos.
 */
export function calcularSubtotalCarrito(productos = []) {
  if (!Array.isArray(productos)) {
    return 0
  }

  return productos.reduce((subtotal, producto) => {
    return (
      subtotal +
      calcularSubtotalProducto(
        producto?.precio,
        producto?.cantidad,
      )
    )
  }, 0)
}

/**
 * Calcula el IVA simulado sobre el subtotal general.
 */
export function calcularIVA(subtotal) {
  if (!esPrecioValido(subtotal)) {
    return 0
  }

  return Math.round(subtotal * TASA_IVA)
}

/**
 * Obtiene el método de envío mediante su identificador.
 */
export function obtenerMetodoEnvio(idMetodo) {
  return (
    METODOS_ENVIO.find(
      (metodo) => metodo.id === idMetodo,
    ) ?? null
  )
}

/**
 * Obtiene el costo del método de envío seleccionado.
 * Devuelve null cuando el método no existe.
 */
export function calcularCostoEnvio(idMetodo) {
  const metodo = obtenerMetodoEnvio(idMetodo)

  return metodo ? metodo.costo : null
}

/**
 * Obtiene el método de pago mediante su identificador.
 */
export function obtenerMetodoPago(idMetodo) {
  return (
    METODOS_PAGO.find(
      (metodo) => metodo.id === idMetodo,
    ) ?? null
  )
}

/**
 * Calcula la cantidad total de unidades del carrito.
 */
export function calcularCantidadTotal(productos = []) {
  if (!Array.isArray(productos)) {
    return 0
  }

  return productos.reduce((total, producto) => {
    if (!esCantidadValida(producto?.cantidad)) {
      return total
    }

    return total + producto.cantidad
  }, 0)
}

/**
 * Calcula el total de productos diferentes.
 */
export function calcularProductosDistintos(productos = []) {
  if (!Array.isArray(productos)) {
    return 0
  }

  const identificadores = productos
    .filter(
      (producto) =>
        producto?.id != null &&
        esCantidadValida(producto.cantidad),
    )
    .map((producto) => producto.id)

  return new Set(identificadores).size
}

/**
 * Calcula el resumen completo del carrito.
 *
 * Los valores se expresan en pesos colombianos.
 * El IVA y los costos de envío son simulados.
 */
export function calcularResumenCompra(
  productos = [],
  idMetodoEnvio = null,
) {
  const subtotal = calcularSubtotalCarrito(productos)
  const iva = calcularIVA(subtotal)
  const cantidadTotal = calcularCantidadTotal(productos)

  const productosDistintos =
    calcularProductosDistintos(productos)

  const metodoEnvio = obtenerMetodoEnvio(idMetodoEnvio)

  const envioSeleccionado = metodoEnvio !== null

  const costoEnvio =
    cantidadTotal > 0 && envioSeleccionado
      ? metodoEnvio.costo
      : 0

  const total = subtotal + iva + costoEnvio

  return {
    subtotal,
    iva,
    costoEnvio,
    total,
    cantidadTotal,
    productosDistintos,
    metodoEnvio,
    envioSeleccionado,
  }
}
