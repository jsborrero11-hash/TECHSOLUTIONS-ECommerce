
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: carritoService.js
 * Descripción: Servicio encargado de gestionar las
 * operaciones y la persistencia del carrito de compras.
 *
 * Corrección BUG-CAR-001:
 * Control de errores de lectura para evitar la
 * sobrescritura involuntaria de productos almacenados.
 */

import { productos } from '../data/productos'

import {
  CANTIDAD_MINIMA,
  CANTIDAD_MAXIMA,
  esCantidadValida,
  esPrecioValido,
  calcularResumenCompra,
} from '../utils/calculosCompra'

import {
  CLAVES_STORAGE,
  esIdentificadorUsuarioValido,
  guardarStorageUsuario,
  obtenerStorageUsuarioDetallado,
  eliminarStorageUsuario,
} from '../utils/storage'

/**
 * Genera una respuesta de operación fallida.
 */
function generarError(mensaje) {
  return {
    exito: false,
    mensaje,
  }
}

/**
 * Genera una respuesta de operación exitosa.
 */
function generarExito(mensaje, carrito) {
  return {
    exito: true,
    mensaje,
    carrito,
  }
}

/**
 * Valida el identificador de un producto.
 */
function esIdentificadorProductoValido(idProducto) {
  return (
    Number.isSafeInteger(idProducto) &&
    idProducto > 0
  )
}

/**
 * Consulta un producto válido del catálogo.
 */
export function obtenerProductoCarrito(idProducto) {
  if (!esIdentificadorProductoValido(idProducto)) {
    return null
  }

  const producto = productos.find(
    (item) => item.id === idProducto,
  )

  if (!producto || !esPrecioValido(producto.precio)) {
    return null
  }

  return producto
}

/**
 * Normaliza los datos recuperados del almacenamiento.
 *
 * Descarta productos inexistentes y cantidades inválidas.
 * Consolida productos duplicados respetando el límite
 * máximo permitido.
 */
function normalizarCarrito(carrito) {
  if (!Array.isArray(carrito)) {
    return []
  }

  const productosNormalizados = new Map()

  carrito.forEach((item) => {
    if (
      !item ||
      !esIdentificadorProductoValido(item.id) ||
      !esCantidadValida(item.cantidad)
    ) {
      return
    }

    const producto = obtenerProductoCarrito(item.id)

    if (!producto) {
      return
    }

    const cantidadAnterior =
      productosNormalizados.get(item.id) ?? 0

    const cantidad = Math.min(
      cantidadAnterior + item.cantidad,
      CANTIDAD_MAXIMA,
    )

    productosNormalizados.set(item.id, cantidad)
  })

  return Array.from(
    productosNormalizados,
    ([id, cantidad]) => ({
      id,
      cantidad,
    }),
  )
}

/**
 * Recupera el carrito básico mediante una lectura
 * detallada del almacenamiento.
 *
 * Permite distinguir un carrito inexistente
 * de un error de lectura.
 */
function obtenerCarritoBase(idUsuario) {
  if (!esIdentificadorUsuarioValido(idUsuario)) {
    return {
      exito: false,
      codigo: 'USUARIO_INVALIDO',
      mensaje: 'El identificador del usuario no es válido.',
      carrito: [],
    }
  }

  const lectura = obtenerStorageUsuarioDetallado(
    CLAVES_STORAGE.CARRITO,
    idUsuario,
  )

  if (!lectura.exito) {
    return {
      exito: false,
      codigo: lectura.codigo,
      mensaje: lectura.mensaje,
      carrito: [],
    }
  }

  return {
    exito: true,
    codigo: lectura.codigo,
    mensaje: '',
    carrito: normalizarCarrito(lectura.valor),
  }
}

/**
 * Completa los datos del carrito utilizando
 * la información vigente del catálogo.
 */
function completarDatosCarrito(carrito) {
  return carrito
    .map((item) => {
      const producto = obtenerProductoCarrito(item.id)

      if (!producto) {
        return null
      }

      return {
        ...producto,
        cantidad: item.cantidad,
      }
    })
    .filter(Boolean)
}

/**
 * Guarda el carrito básico de un cliente.
 */
function guardarCarrito(idUsuario, carrito) {
  return guardarStorageUsuario(
    CLAVES_STORAGE.CARRITO,
    idUsuario,
    carrito,
  )
}

/**
 * Genera una respuesta de error cuando no es posible
 * recuperar el carrito antes de modificarlo.
 */
function generarErrorLectura(lectura) {
  return {
    exito: false,
    codigo: lectura.codigo,
    mensaje:
      'No fue posible recuperar el carrito. ' +
      'No se realizaron cambios en los productos almacenados.',
  }
}

/**
 * Recupera el carrito con los datos completos
 * y el estado de la operación de lectura.
 */
export function obtenerCarritoDetallado(idUsuario) {
  const lectura = obtenerCarritoBase(idUsuario)

  if (!lectura.exito) {
    return lectura
  }

  return {
    ...lectura,
    carrito: completarDatosCarrito(lectura.carrito),
  }
}

/**
 * Recupera el carrito con los datos completos
 * de los productos.
 *
 * Conserva la compatibilidad con las funciones
 * y pruebas implementadas anteriormente.
 */
export function obtenerCarrito(idUsuario) {
  const lectura = obtenerCarritoDetallado(idUsuario)

  return lectura.exito
    ? lectura.carrito
    : []
}

/**
 * Agrega un producto al carrito.
 *
 * Si el producto ya existe, acumula la cantidad.
 * Rechaza la operación si falla la lectura.
 */
export function agregarProducto(
  idUsuario,
  idProducto,
  cantidad = CANTIDAD_MINIMA,
) {
  if (!esIdentificadorUsuarioValido(idUsuario)) {
    return generarError(
      'Debes iniciar sesión para agregar productos.',
    )
  }

  const producto = obtenerProductoCarrito(idProducto)

  if (!producto) {
    return generarError(
      'El producto seleccionado no está disponible.',
    )
  }

  if (!esCantidadValida(cantidad)) {
    return generarError(
      `La cantidad debe estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
    )
  }

  const lectura = obtenerCarritoBase(idUsuario)

  // BUG-CAR-001: impedir escrituras si falla la lectura.

  if (!lectura.exito) {
    return generarErrorLectura(lectura)
  }

  const carrito = lectura.carrito

  const productoExistente = carrito.find(
    (item) => item.id === idProducto,
  )

  let carritoActualizado

  if (productoExistente) {
    const nuevaCantidad =
      productoExistente.cantidad + cantidad

    if (nuevaCantidad > CANTIDAD_MAXIMA) {
      return generarError(
        `No puedes superar las ${CANTIDAD_MAXIMA} unidades por producto.`,
      )
    }

    carritoActualizado = carrito.map((item) =>
      item.id === idProducto
        ? {
            ...item,
            cantidad: nuevaCantidad,
          }
        : item,
    )
  } else {
    carritoActualizado = [
      ...carrito,
      {
        id: idProducto,
        cantidad,
      },
    ]
  }

  if (!guardarCarrito(idUsuario, carritoActualizado)) {
    return generarError(
      'No fue posible guardar el producto en el carrito.',
    )
  }

  return generarExito(
    'Producto agregado correctamente al carrito.',
    completarDatosCarrito(carritoActualizado),
  )
}

/**
 * Actualiza la cantidad de un producto existente.
 * Rechaza la operación si falla la lectura.
 */
export function actualizarCantidad(
  idUsuario,
  idProducto,
  cantidad,
) {
  if (!esIdentificadorUsuarioValido(idUsuario)) {
    return generarError(
      'Debes iniciar sesión para actualizar el carrito.',
    )
  }

  if (!esCantidadValida(cantidad)) {
    return generarError(
      `La cantidad debe estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
    )
  }

  const lectura = obtenerCarritoBase(idUsuario)

  // BUG-CAR-001: proteger los datos almacenados.

  if (!lectura.exito) {
    return generarErrorLectura(lectura)
  }

  const carrito = lectura.carrito

  const productoExistente = carrito.some(
    (item) => item.id === idProducto,
  )

  if (!productoExistente) {
    return generarError(
      'El producto no se encuentra en el carrito.',
    )
  }

  const carritoActualizado = carrito.map((item) =>
    item.id === idProducto
      ? {
          ...item,
          cantidad,
        }
      : item,
  )

  if (!guardarCarrito(idUsuario, carritoActualizado)) {
    return generarError(
      'No fue posible actualizar la cantidad.',
    )
  }

  return generarExito(
    'Cantidad actualizada correctamente.',
    completarDatosCarrito(carritoActualizado),
  )
}

/**
 * Elimina un producto individual del carrito.
 * Rechaza la operación si falla la lectura.
 */
export function eliminarProducto(
  idUsuario,
  idProducto,
) {
  if (!esIdentificadorUsuarioValido(idUsuario)) {
    return generarError(
      'Debes iniciar sesión para modificar el carrito.',
    )
  }

  const lectura = obtenerCarritoBase(idUsuario)

  // BUG-CAR-001: proteger los datos almacenados.

  if (!lectura.exito) {
    return generarErrorLectura(lectura)
  }

  const carrito = lectura.carrito

  const productoExistente = carrito.some(
    (item) => item.id === idProducto,
  )

  if (!productoExistente) {
    return generarError(
      'El producto no se encuentra en el carrito.',
    )
  }

  const carritoActualizado = carrito.filter(
    (item) => item.id !== idProducto,
  )

  if (!guardarCarrito(idUsuario, carritoActualizado)) {
    return generarError(
      'No fue posible eliminar el producto.',
    )
  }

  return generarExito(
    'Producto eliminado correctamente.',
    completarDatosCarrito(carritoActualizado),
  )
}

/**
 * Elimina todos los productos del carrito.
 *
 * Es una operación explícita de eliminación.
 * La confirmación se gestionará desde la interfaz.
 */
export function vaciarCarrito(idUsuario) {
  if (!esIdentificadorUsuarioValido(idUsuario)) {
    return generarError(
      'Debes iniciar sesión para vaciar el carrito.',
    )
  }

  const eliminado = eliminarStorageUsuario(
    CLAVES_STORAGE.CARRITO,
    idUsuario,
  )

  if (!eliminado) {
    return generarError(
      'No fue posible vaciar el carrito.',
    )
  }

  return generarExito(
    'Carrito vaciado correctamente.',
    [],
  )
}

/**
 * Obtiene el resumen monetario del carrito.
 */
export function obtenerResumenCarrito(
  idUsuario,
  idMetodoEnvio = null,
) {
  const carrito = obtenerCarrito(idUsuario)

  return calcularResumenCompra(
    carrito,
    idMetodoEnvio,
  )
}
