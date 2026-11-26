
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: CarritoContext.jsx
 * Descripción: Proveedor global encargado de administrar
 * el carrito de compras del cliente autenticado.
 */

import { useState } from 'react'

import CarritoContext from './CarritoContext.js'

import { useAuth } from '../hooks/useAuth'

import {
  obtenerCarritoDetallado,
  agregarProducto as agregarProductoServicio,
  actualizarCantidad as actualizarCantidadServicio,
  eliminarProducto as eliminarProductoServicio,
  vaciarCarrito as vaciarCarritoServicio,
} from '../services/carritoService'

import {
  calcularResumenCompra,
  obtenerMetodoEnvio,
  CANTIDAD_MINIMA,
} from '../utils/calculosCompra'

/**
 * Genera un estado inicial vacío para el carrito.
 */
function crearEstadoInicial() {
  return {
    productos: [],
    errorLectura: '',
    codigoErrorLectura: null,
  }
}

/**
 * Genera una respuesta de error estandarizada.
 */
function generarError(mensaje, codigo = 'OPERACION_INVALIDA') {
  return {
    exito: false,
    codigo,
    mensaje,
  }
}

/**
 * Recupera el carrito correspondiente al cliente.
 */
function recuperarEstadoCarrito(idUsuario) {
  if (idUsuario === null) {
    return crearEstadoInicial()
  }

  const resultado = obtenerCarritoDetallado(idUsuario)

  if (!resultado.exito) {
    return {
      productos: [],
      errorLectura:
        resultado.mensaje ||
        'No fue posible recuperar el carrito de compras.',
      codigoErrorLectura: resultado.codigo,
    }
  }

  return {
    productos: resultado.carrito,
    errorLectura: '',
    codigoErrorLectura: null,
  }
}

/**
 * Proveedor interno asociado a un cliente específico.
 *
 * Su estado se reinicia cuando cambia el usuario
 * autenticado mediante la propiedad key.
 */
function CarritoProveedorInterno({
  children,
  idUsuario,
}) {
  const [estadoCarrito, setEstadoCarrito] = useState(
    () => recuperarEstadoCarrito(idUsuario),
  )

  const [idMetodoEnvio, setIdMetodoEnvio] =
    useState(null)

  const [errorOperacion, setErrorOperacion] =
    useState('')

  const puedeGestionarCarrito =
    idUsuario !== null

  const {
    productos,
    errorLectura,
    codigoErrorLectura,
  } = estadoCarrito

  const tieneErrorLectura =
    Boolean(errorLectura)

  /**
   * Calcula el resumen utilizando el estado actual.
   */
  const resumen = calcularResumenCompra(
    productos,
    idMetodoEnvio,
  )

  const cantidadTotal = resumen.cantidadTotal

  const productosDistintos =
    resumen.productosDistintos

  const carritoVacio = productos.length === 0

  /**
   * Indica si el cliente puede avanzar
   * hacia el proceso de compra.
   */
  const puedeContinuarCompra =
    puedeGestionarCarrito &&
    !tieneErrorLectura &&
    !carritoVacio &&
    resumen.envioSeleccionado

  /**
   * Registra un error de operación.
   */
  function registrarError(resultado) {
    setErrorOperacion(resultado.mensaje)

    return resultado
  }

  /**
   * Limpia los mensajes de error de operación.
   *
   * No elimina los errores de lectura,
   * ya que estos requieren una recuperación real.
   */
  function limpiarErrorOperacion() {
    setErrorOperacion('')
  }

  /**
   * Recupera nuevamente los datos almacenados.
   */
  function recargarCarrito() {
    if (!puedeGestionarCarrito) {
      return registrarError(
        generarError(
          'Debes iniciar sesión como cliente.',
          'ACCESO_NO_AUTORIZADO',
        ),
      )
    }

    const resultado =
      obtenerCarritoDetallado(idUsuario)

    if (!resultado.exito) {
      setEstadoCarrito((estadoAnterior) => ({
        ...estadoAnterior,
        errorLectura:
          resultado.mensaje ||
          'No fue posible recuperar el carrito.',
        codigoErrorLectura: resultado.codigo,
      }))

      return registrarError(resultado)
    }

    setEstadoCarrito({
      productos: resultado.carrito,
      errorLectura: '',
      codigoErrorLectura: null,
    })

    if (resultado.carrito.length === 0) {
      setIdMetodoEnvio(null)
    }

    setErrorOperacion('')

    return resultado
  }

  /**
   * Valida las condiciones necesarias
   * para modificar el carrito.
   */
  function validarOperacion() {
    if (!puedeGestionarCarrito) {
      return generarError(
        'Debes iniciar sesión como cliente.',
        'ACCESO_NO_AUTORIZADO',
      )
    }

    if (tieneErrorLectura) {
      return generarError(
        'No fue posible recuperar el carrito. Intenta recargarlo antes de continuar.',
        codigoErrorLectura || 'ERROR_LECTURA',
      )
    }

    return null
  }

  /**
   * Procesa la respuesta de una operación
   * ejecutada mediante carritoService.
   */
  function procesarResultado(resultado) {
    if (!resultado.exito) {
      const codigosErrorLectura = [
        'ERROR_LECTURA',
        'JSON_INVALIDO',
        'CLAVE_INVALIDA',
        'CLAVE_USUARIO_INVALIDA',
        'USUARIO_INVALIDO',
      ]

      if (
        codigosErrorLectura.includes(resultado.codigo)
      ) {
        setEstadoCarrito((estadoAnterior) => ({
          ...estadoAnterior,
          errorLectura: resultado.mensaje,
          codigoErrorLectura: resultado.codigo,
        }))
      }

      return registrarError(resultado)
    }

    setEstadoCarrito({
      productos: resultado.carrito,
      errorLectura: '',
      codigoErrorLectura: null,
    })

    if (resultado.carrito.length === 0) {
      setIdMetodoEnvio(null)
    }

    setErrorOperacion('')

    return resultado
  }

  /**
   * Agrega un producto al carrito.
   */
  function agregarProducto(
    idProducto,
    cantidad = CANTIDAD_MINIMA,
  ) {
    const error = validarOperacion()

    if (error) {
      return registrarError(error)
    }

    const resultado = agregarProductoServicio(
      idUsuario,
      idProducto,
      cantidad,
    )

    return procesarResultado(resultado)
  }

  /**
   * Actualiza la cantidad de un producto.
   */
  function actualizarCantidad(
    idProducto,
    cantidad,
  ) {
    const error = validarOperacion()

    if (error) {
      return registrarError(error)
    }

    const resultado = actualizarCantidadServicio(
      idUsuario,
      idProducto,
      cantidad,
    )

    return procesarResultado(resultado)
  }

  /**
   * Elimina un producto individual.
   */
  function eliminarProducto(idProducto) {
    const error = validarOperacion()

    if (error) {
      return registrarError(error)
    }

    const resultado = eliminarProductoServicio(
      idUsuario,
      idProducto,
    )

    return procesarResultado(resultado)
  }

  /**
   * Vacía el carrito mediante una acción explícita.
   *
   * La confirmación del cliente será responsabilidad
   * del componente de interfaz gráfica.
   */
  function vaciarCarrito() {
    if (!puedeGestionarCarrito) {
      return registrarError(
        generarError(
          'Debes iniciar sesión como cliente.',
          'ACCESO_NO_AUTORIZADO',
        ),
      )
    }

    const resultado =
      vaciarCarritoServicio(idUsuario)

    return procesarResultado(resultado)
  }

  /**
   * Selecciona un método de envío válido.
   */
  function seleccionarMetodoEnvio(idMetodo) {
    const error = validarOperacion()

    if (error) {
      return registrarError(error)
    }

    if (carritoVacio) {
      return registrarError(
        generarError(
          'Debes agregar productos antes de seleccionar el envío.',
          'CARRITO_VACIO',
        ),
      )
    }

    const metodo = obtenerMetodoEnvio(idMetodo)

    if (!metodo) {
      return registrarError(
        generarError(
          'El método de envío seleccionado no es válido.',
          'ENVIO_INVALIDO',
        ),
      )
    }

    setIdMetodoEnvio(metodo.id)
    setErrorOperacion('')

    return {
      exito: true,
      mensaje: 'Método de envío seleccionado.',
      metodo,
    }
  }

  /**
   * Elimina la selección del método de envío.
   */
  function limpiarMetodoEnvio() {
    setIdMetodoEnvio(null)
  }

  /**
   * Información y operaciones disponibles
   * para los componentes consumidores.
   */
  const valorContexto = {
    productos,
    resumen,
    cantidadTotal,
    productosDistintos,
    carritoVacio,
    puedeGestionarCarrito,
    puedeContinuarCompra,
    idMetodoEnvio,
    tieneErrorLectura,
    errorLectura,
    codigoErrorLectura,
    errorOperacion,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    recargarCarrito,
    seleccionarMetodoEnvio,
    limpiarMetodoEnvio,
    limpiarErrorOperacion,
  }

  return (
    <CarritoContext.Provider value={valorContexto}>
      {children}
    </CarritoContext.Provider>
  )
}

/**
 * Proveedor principal del carrito.
 *
 * Se integra con AuthContext para identificar
 * al cliente autenticado y mantener su carrito
 * independiente de otras sesiones.
 */
export function CarritoProvider({ children }) {
  const {
    usuario,
    estaAutenticado,
    esCliente,
  } = useAuth()

  const idUsuario =
    estaAutenticado &&
    esCliente &&
    Number.isSafeInteger(usuario?.id) &&
    usuario.id > 0
      ? usuario.id
      : null

  const claveProveedor =
    idUsuario === null
      ? 'sin-cliente'
      : `cliente-${idUsuario}`

  return (
    <CarritoProveedorInterno
      key={claveProveedor}
      idUsuario={idUsuario}
    >
      {children}
    </CarritoProveedorInterno>
  )
}
