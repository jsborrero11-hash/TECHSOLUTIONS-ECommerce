import {
  CLAVES_STORAGE,
  guardarStorageUsuario,
  obtenerStorageUsuarioDetallado,
} from '../utils/storage.js'
import { validarCompra, tieneErrores } from '../utils/validaciones.js'
import { calcularResumenCompra } from '../utils/calculosCompra.js'

export function registrarPedido(cliente, compra) {
  if (
    cliente?.id !== compra?.idUsuario ||
    tieneErrores(validarCompra(compra))
  ) {
    return { exito: false, mensaje: 'Los datos del pedido no son válidos.' }
  }

  const clave = CLAVES_STORAGE.PEDIDOS
  const lectura = obtenerStorageUsuarioDetallado(clave, cliente.id)
  if (!lectura.exito || (lectura.existe && !Array.isArray(lectura.valor))) {
    return { exito: false, mensaje: 'No fue posible recuperar tus pedidos.' }
  }

  const pedidos = lectura.valor ?? []
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
