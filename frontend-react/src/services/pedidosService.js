import {
  CLAVES_STORAGE,
  guardarStorageUsuario,
  obtenerStorageUsuarioDetallado,
} from '../utils/storage.js'
import { validarCompra, tieneErrores } from '../utils/validaciones.js'
import { calcularResumenCompra } from '../utils/calculosCompra.js'

export function consultarPedidos(idUsuario) {
  const lectura = obtenerStorageUsuarioDetallado(CLAVES_STORAGE.PEDIDOS, idUsuario)
  const pedidos = lectura.existe ? lectura.valor : []
  if (!lectura.exito || !Array.isArray(pedidos) || !pedidos.every(pedido =>
    pedido?.cliente?.id === idUsuario &&
    typeof pedido.cliente.nombre === 'string' &&
    Number.isSafeInteger(pedido.id) &&
    Array.isArray(pedido.productos) &&
    pedido.productos.every(producto => typeof producto?.nombre === 'string')
  )) {
    return { exito: false, mensaje: 'No fue posible recuperar tus pedidos.' }
  }

  return { exito: true, pedidos }
}

export function registrarPedido(cliente, compra) {
  if (
    cliente?.id !== compra?.idUsuario ||
    tieneErrores(validarCompra(compra))
  ) {
    return { exito: false, mensaje: 'Los datos del pedido no son válidos.' }
  }

  const clave = CLAVES_STORAGE.PEDIDOS
  const consulta = consultarPedidos(cliente.id)
  if (!consulta.exito) return consulta

  const { pedidos } = consulta
  const { subtotal, iva, costoEnvio, total } = calcularResumenCompra(
    compra.productos,
    compra.idMetodoEnvio,
  )
  const pedido = {
    id: pedidos.length + 1,
    cliente: { id: cliente.id, nombre: cliente.nombre },
    productos: compra.productos.map(({ id, nombre, precio, cantidad }) => ({
      id, nombre, precio, cantidad,
    })),
    idMetodoEnvio: compra.idMetodoEnvio,
    idMetodoPago: compra.idMetodoPago,
    subtotal,
    iva,
    costoEnvio,
    total,
  }

  if (!guardarStorageUsuario(clave, cliente.id, [...pedidos, pedido])) {
    return { exito: false, mensaje: 'No fue posible guardar el pedido. Intenta nuevamente.' }
  }

  return { exito: true, pedido }
}
