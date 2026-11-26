
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: FormularioPago.jsx
 *
 * Permite revisar la información de una compra,
 * seleccionar un método de pago y confirmar
 * un pedido simulado.
 */

import { useId, useRef, useState } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { useCarrito } from '../../hooks/useCarrito'

import {
  METODOS_PAGO,
  TASA_IVA,
  obtenerMetodoPago,
} from '../../utils/calculosCompra'

import {
  validarCompra,
  tieneErrores,
} from '../../utils/validaciones'

import { formatoMoneda } from '../../utils/formatoMoneda'

import BotonPrimario from '../common/BotonPrimario'
import MensajeNotificacion from '../common/MensajeNotificacion'

/**
 * Descripciones informativas de los métodos de pago.
 * No representan integraciones financieras reales.
 */
const DESCRIPCIONES_PAGO = Object.freeze({
  pse:
    'Simula el pago mediante una cuenta bancaria utilizando PSE.',

  tarjeta:
    'Simula el pago mediante una tarjeta de crédito o débito, sin solicitar información financiera.',

  contraentrega:
    'Simula el pago al momento de recibir los productos.',
})

/**
 * Comprueba que el arreglo de productos sea completo
 * y no contenga posiciones vacías.
 */
function esArregloProductosCompleto(productos) {
  if (!Array.isArray(productos)) {
    return false
  }

  for (let i = 0; i < productos.length; i += 1) {
    if (!Object.hasOwn(productos, i)) {
      return false
    }
  }

  return true
}

/**
 * Compara los productos presentados al cliente
 * con los recuperados antes de confirmar.
 *
 * No modifica los arreglos originales y no depende
 * del orden en que se encuentren los productos.
 */
function coincidenProductos(
  productosActuales,
  productosRecuperados,
) {
  if (
    !esArregloProductosCompleto(productosActuales) ||
    !esArregloProductosCompleto(productosRecuperados) ||
    productosActuales.length !== productosRecuperados.length
  ) {
    return false
  }

  const productosPorId = new Map(
    productosRecuperados.map((producto) => [
      producto.id,
      producto,
    ]),
  )

  const identificadoresActuales = new Set(
    productosActuales.map((producto) => producto.id),
  )

  if (
    productosPorId.size !== productosRecuperados.length ||
    identificadoresActuales.size !== productosActuales.length
  ) {
    return false
  }

  return productosActuales.every((producto) => {
    const productoRecuperado =
      productosPorId.get(producto.id)

    return (
      productoRecuperado !== undefined &&
      producto.nombre === productoRecuperado.nombre &&
      producto.cantidad === productoRecuperado.cantidad &&
      producto.precio === productoRecuperado.precio
    )
  })
}

/**
 * Formulario de pago simulado.
 *
 * onVolver:
 * Permite regresar a la vista principal del carrito.
 *
 * onConfirmarCompra:
 * Recibe los datos validados y devuelve el resultado del registro.
 */
function FormularioPago({
  onVolver,
  onConfirmarCompra,
}) {
  const idComponente = useId()

  const {
    usuario,
    estaAutenticado,
    esCliente,
  } = useAuth()

  const {
    productos,
    resumen,
    cantidadTotal,
    puedeGestionarCarrito,
    puedeContinuarCompra,
    idMetodoEnvio,
    tieneErrorLectura,
    recargarCarrito,
  } = useCarrito()

  const [idMetodoPago, setIdMetodoPago] =
    useState(null)

  const [notificacion, setNotificacion] =
    useState(null)

  /**
   * Control inmediato de confirmaciones simultáneas.
   *
   * El registro local del pedido es síncrono,
   * por lo que no se utilizan temporizadores
   * ni estados de carga artificiales.
   */
  const confirmacionEnCurso = useRef(false)

  const idTitulo = `${idComponente}-titulo`
  const idTituloCliente = `${idComponente}-cliente`
  const idTituloResumen = `${idComponente}-resumen`
  const idAyuda = `${idComponente}-ayuda`
  const idInformacion = `${idComponente}-informacion`
  const nombreGrupoPago = `${idComponente}-pago`

  const {
    subtotal,
    iva,
    costoEnvio,
    total,
    metodoEnvio,
  } = resumen

  const porcentajeIVA = Math.round(TASA_IVA * 100)

  const metodoPago =
    obtenerMetodoPago(idMetodoPago)

  const clienteValido =
    estaAutenticado &&
    esCliente &&
    puedeGestionarCarrito &&
    Number.isSafeInteger(usuario?.id) &&
    usuario.id > 0

  const compraDisponible =
    clienteValido &&
    puedeContinuarCompra &&
    !tieneErrorLectura

  const erroresCompra = validarCompra({
    idUsuario: usuario?.id,
    productos,
    idMetodoEnvio,
    idMetodoPago,
  })

  const puedeConfirmarCompra =
    compraDisponible &&
    esArregloProductosCompleto(productos) &&
    !tieneErrores(erroresCompra)

  /**
   * Registra una notificación de error.
   */
  function mostrarError(mensaje) {
    setNotificacion({
      tipo: 'error',
      titulo: 'No fue posible validar la compra',
      mensaje,
    })
  }

  /**
   * Registra una advertencia.
   */
  function mostrarAdvertencia(mensaje) {
    setNotificacion({
      tipo: 'advertencia',
      titulo: 'Revisa la información de tu compra',
      mensaje,
    })
  }

  /**
   * Selecciona un método de pago reconocido.
   * La selección permanece únicamente en memoria.
   */
  function manejarSeleccionPago(idMetodo) {
    if (
      !compraDisponible ||
      confirmacionEnCurso.current
    ) {
      return
    }

    const metodo = obtenerMetodoPago(idMetodo)

    if (!metodo) {
      setIdMetodoPago(null)

      mostrarError(
        'Selecciona un método de pago válido.',
      )

      return
    }

    setIdMetodoPago(metodo.id)
    setNotificacion(null)
  }

  /**
   * Cierra la notificación sin modificar
   * el método de pago seleccionado.
   */
  function manejarCerrarNotificacion() {
    setNotificacion(null)
  }

  /**
   * Regresa al carrito conservando
   * los datos administrados por CarritoContext.
   */
  function manejarVolver() {
    if (confirmacionEnCurso.current) {
      return
    }

    setIdMetodoPago(null)
    setNotificacion(null)

    if (typeof onVolver === 'function') {
      onVolver()
    }
  }

  /**
   * Valida el carrito antes de registrar el pedido simulado.
   */
  function manejarConfirmarCompra(evento) {
    evento.preventDefault()

    if (confirmacionEnCurso.current) {
      return
    }

    if (!compraDisponible) {
      mostrarError(
        'Las condiciones del carrito no permiten continuar con la compra.',
      )

      return
    }

    if (!puedeConfirmarCompra) {
      mostrarError(
        Object.values(erroresCompra)[0] ||
        'La información de los productos no es válida.',
      )

      return
    }

    confirmacionEnCurso.current = true
    let pedidoRegistrado = false

    setNotificacion(null)

    try {
      /**
       * Recupera los datos vigentes del carrito.
       *
       * Se utiliza directamente el resultado porque
       * el estado de React no se actualiza de manera
       * inmediata dentro del mismo evento.
       */
      const resultado = recargarCarrito()

      if (!resultado?.exito) {
        mostrarError(
          resultado?.mensaje ||
          'No fue posible recuperar el carrito de compras.',
        )

        return
      }

      const productosRecuperados =
        resultado.carrito

      /**
       * Comprueba nuevamente los datos recuperados
       * antes de preparar la confirmación.
       */
      const erroresFinales = validarCompra({
        idUsuario: usuario.id,
        productos: productosRecuperados,
        idMetodoEnvio,
        idMetodoPago,
      })

      if (
        tieneErrores(erroresFinales) ||
        !esArregloProductosCompleto(
          productosRecuperados,
        )
      ) {
        mostrarError(
          Object.values(erroresFinales)[0] ||
          'La información recuperada del carrito no es válida.',
        )

        return
      }

      /**
       * Si los productos cambiaron, se requiere
       * una nueva confirmación con los valores
       * actualizados del contexto.
       */
      if (
        !coincidenProductos(
          productos,
          productosRecuperados,
        )
      ) {
        mostrarAdvertencia(
          'Los productos, cantidades o precios de tu carrito han cambiado. Revisa los valores actualizados antes de confirmar nuevamente.',
        )

        return
      }

      /**
       * Prepara una copia independiente de los datos.
       *
       * Los valores monetarios provienen del resumen
       * existente y no se calculan nuevamente.
       */
      const datosCompra = {
        idUsuario: usuario.id,

        productos: productosRecuperados.map(
          (producto) => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad,
          }),
        ),

        idMetodoEnvio,
        idMetodoPago,
        subtotal,
        iva,
        costoEnvio,
        total,
      }

      const registro = onConfirmarCompra(datosCompra)
      pedidoRegistrado = registro.exito
      if (!pedidoRegistrado) {
        mostrarError(registro.mensaje)
      }
    } catch {
      mostrarError(
        'Ocurrió un error inesperado al validar la compra. Intenta nuevamente.',
      )
    } finally {
      if (!pedidoRegistrado) {
        confirmacionEnCurso.current = false
      }
    }
  }

  /**
   * Mensaje de ayuda asociado al grupo de pago.
   */
  let mensajeAyuda

  if (!clienteValido) {
    mensajeAyuda =
      'Debes iniciar sesión como cliente para confirmar la compra.'
  } else if (tieneErrorLectura) {
    mensajeAyuda =
      'Recupera el carrito antes de confirmar la compra.'
  } else if (!compraDisponible) {
    mensajeAyuda =
      'Revisa los productos y el método de envío.'
  } else if (!metodoPago) {
    mensajeAyuda =
      'Selecciona un método de pago para continuar.'
  } else if (!puedeConfirmarCompra) {
    mensajeAyuda =
      Object.values(erroresCompra)[0] ||
      'Revisa la información de los productos.'
  } else {
    mensajeAyuda =
      'Puedes confirmar la información de tu compra.'
  }

  /**
   * Protección adicional del componente.
   *
   * La página Carrito será responsable de regresar
   * automáticamente a su vista principal cuando
   * las condiciones de compra dejen de ser válidas.
   */
  if (!compraDisponible) {
    return null
  }

  return (
    <section
      className="formulario-pago"
      aria-labelledby={idTitulo}
    >
      <header className="mb-4">
        <h2
          id={idTitulo}
          className="h4 fw-bold mb-2"
        >
          Formulario de pago
        </h2>

        <p className="texto-secundario mb-0">
          Revisa la información de tu compra y
          selecciona el método de pago que prefieras.
        </p>
      </header>

      {notificacion && (
        <MensajeNotificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          onCerrar={manejarCerrarNotificacion}
          className="mb-4"
        />
      )}

      <form
        onSubmit={manejarConfirmarCompra}
        noValidate
      >
        <div className="row g-4">

          {/* Información del cliente y método de pago */}
          <div className="col-12 col-lg-8">

            {/* Información del cliente */}
            <section
              className="card shadow-sm mb-4"
              aria-labelledby={idTituloCliente}
            >
              <div className="card-body p-3 p-lg-4">
                <h3
                  id={idTituloCliente}
                  className="h5 fw-bold mb-3"
                >
                  <i
                    className="bi bi-person-circle me-2"
                    aria-hidden="true"
                  ></i>

                  Información del cliente
                </h3>

                <p className="small text-body-secondary mb-3">
                  Los datos corresponden a tu sesión
                  actual y se presentan únicamente
                  para consulta.
                </p>

                <dl className="row mb-0">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <dt className="small text-body-secondary fw-normal mb-1">
                      Nombre completo
                    </dt>

                    <dd className="fw-semibold text-break mb-0">
                      {usuario.nombre}
                    </dd>
                  </div>

                  <div className="col-12 col-md-6">
                    <dt className="small text-body-secondary fw-normal mb-1">
                      Correo electrónico
                    </dt>

                    <dd className="fw-semibold text-break mb-0">
                      {usuario.correo}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Selección del método de pago */}
            <section className="card shadow-sm">
              <div className="card-body p-3 p-lg-4">

                <fieldset
                  className="mb-3"
                  aria-describedby={`${idAyuda} ${idInformacion}`}
                >
                  <legend className="h5 fw-bold mb-3">
                    <i
                      className="bi bi-credit-card me-2"
                      aria-hidden="true"
                    ></i>

                    Método de pago
                  </legend>

                  {METODOS_PAGO.map((metodo) => {
                    const idOpcion =
                      `${idComponente}-pago-${metodo.id}`

                    const seleccionado =
                      idMetodoPago === metodo.id

                    return (
                      <div
                        key={metodo.id}
                        className={`border rounded p-3 mb-2 ${
                          seleccionado
                            ? 'border-primary bg-primary-subtle'
                            : ''
                        }`}
                      >
                        <div className="form-check mb-0">
                          <input
                            type="radio"
                            className="form-check-input"
                            id={idOpcion}
                            name={nombreGrupoPago}
                            value={metodo.id}
                            checked={seleccionado}
                            onChange={() =>
                              manejarSeleccionPago(
                                metodo.id,
                              )
                            }
                          />

                          <label
                            className="form-check-label w-100"
                            htmlFor={idOpcion}
                          >
                            <span className="fw-semibold">
                              {metodo.nombre}
                            </span>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </fieldset>

                {metodoPago && (
                  <div
                    className="border rounded bg-body-tertiary p-3 mb-3"
                    role="status"
                    aria-atomic="true"
                  >
                    <p className="fw-semibold mb-1">
                      {metodoPago.nombre}
                    </p>

                    <p className="small mb-0">
                      {DESCRIPCIONES_PAGO[metodoPago.id]}
                    </p>
                  </div>
                )}

                <div
                  id={idInformacion}
                  className="alert alert-info mb-0"
                >
                  <div className="d-flex align-items-start gap-2">
                    <i
                      className="bi bi-info-circle-fill"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <p className="fw-semibold mb-1">
                        Pago simulado
                      </p>

                      <p className="small mb-0">
                        Este proceso hace parte de un
                        proyecto formativo. No se
                        realizarán cobros ni se
                        solicitarán datos bancarios,
                        números de tarjetas o
                        credenciales financieras.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Resumen de compra y confirmación */}
          <div className="col-12 col-lg-4">
            <section
              className="card shadow-sm resumen-pago"
              aria-labelledby={idTituloResumen}
            >
              <div className="card-body p-3 p-lg-4">
                <h3
                  id={idTituloResumen}
                  className="h5 fw-bold mb-4"
                >
                  Resumen de compra
                </h3>

                <p className="small text-body-secondary mb-3">
                  {cantidadTotal}{' '}
                  {cantidadTotal === 1
                    ? 'unidad en el carrito'
                    : 'unidades en el carrito'}
                </p>

                <dl className="mb-4">
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <dt className="fw-normal">
                      Subtotal
                    </dt>

                    <dd className="fw-semibold text-end mb-0">
                      {formatoMoneda(subtotal)}
                    </dd>
                  </div>

                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <dt className="fw-normal">
                      IVA ({porcentajeIVA} %)
                    </dt>

                    <dd className="fw-semibold text-end mb-0">
                      {formatoMoneda(iva)}
                    </dd>
                  </div>

                  <div className="mb-3">
                    <dt className="small text-body-secondary fw-normal mb-1">
                      Método de envío
                    </dt>

                    <dd className="fw-semibold text-break mb-0">
                      {metodoEnvio?.nombre}
                    </dd>
                  </div>

                  <div className="d-flex justify-content-between gap-3">
                    <dt className="fw-normal">
                      Costo de envío
                    </dt>

                    <dd className="fw-semibold text-end mb-0">
                      {formatoMoneda(costoEnvio)}
                    </dd>
                  </div>
                </dl>

                <div
                  className="border-top pt-3 mb-4"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <span className="fw-bold">
                      Total del pedido
                    </span>

                    <span className="fs-4 fw-bold text-primary">
                      {formatoMoneda(total)}
                    </span>
                  </div>
                </div>

                <BotonPrimario
                  tipo="submit"
                  anchoCompleto
                  deshabilitado={!puedeConfirmarCompra}
                  icono="bi-check-circle"
                >
                  Confirmar compra
                </BotonPrimario>

                <p
                  id={idAyuda}
                  className="small text-body-secondary text-center mt-3 mb-3"
                  role="status"
                >
                  {mensajeAyuda}
                </p>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={manejarVolver}
                  disabled={typeof onVolver !== 'function'}
                >
                  <i
                    className="bi bi-arrow-left me-2"
                    aria-hidden="true"
                  ></i>

                  Volver al carrito
                </button>
              </div>
            </section>
          </div>

        </div>
      </form>
    </section>
  )
}

export default FormularioPago
