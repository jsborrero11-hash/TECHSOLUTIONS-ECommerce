
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: Carrito.jsx
 *
 * Página del carrito de compras.
 *
 * Integra la gestión de productos, el resumen
 * del pedido y el formulario de pago simulado.
 *
 * Permite alternar entre las vistas de carrito
 * y pago sin modificar la ruta ni perder los
 * datos administrados por CarritoContext.
 */

import { useEffect, useRef, useState } from 'react'

import Breadcrumb from '../components/common/Breadcrumb'
import TablaCarrito from '../components/carrito/TablaCarrito'
import ResumenPedido from '../components/carrito/ResumenPedido'
import FormularioPago from '../components/carrito/FormularioPago'
import Factura from '../components/carrito/Factura'

import { useCarrito } from '../hooks/useCarrito'
import { useAuth } from '../hooks/useAuth'
import { registrarPedido } from '../services/pedidosService'

/**
 * Elementos de navegación contextual.
 */
const ELEMENTOS_BREADCRUMB = [
  {
    nombre: 'Inicio',
    ruta: '/',
  },
  {
    nombre: 'Carrito de compras',
  },
]

function Carrito() {
  const { usuario } = useAuth()
  const { puedeContinuarCompra, vaciarCarrito } = useCarrito()
  const [confirmacion, setConfirmacion] = useState(null)

  /**
   * Controla la apertura temporal del
   * formulario de pago.
   */
  const [
    mostrarFormularioPago,
    setMostrarFormularioPago,
  ] = useState(false)

  /**
   * Referencia al encabezado principal
   * para gestionar el foco entre vistas.
   */
  const referenciaTitulo = useRef(null)

  /**
   * El formulario solamente puede permanecer
   * visible mientras la compra sea válida.
   */
  const formularioPagoVisible =
    mostrarFormularioPago &&
    puedeContinuarCompra

  /**
   * Conserva la vista anterior para detectar
   * cambios entre el carrito y el formulario.
   */
  const vista = confirmacion ? 'factura' : formularioPagoVisible ? 'pago' : 'carrito'
  const vistaAnterior = useRef(vista)

  /**
   * Restablece la apertura del formulario
   * cuando la compra deja de ser válida.
   *
   * Evita que el formulario vuelva a abrirse
   * automáticamente después de recuperar
   * las condiciones del carrito.
   */
  if (
    mostrarFormularioPago &&
    !puedeContinuarCompra
  ) {
    setMostrarFormularioPago(false)
  }

  /**
   * Gestiona el foco al cambiar de vista.
   *
   * No modifica el foco durante el montaje
   * inicial ni durante las actualizaciones
   * normales de productos o valores.
   */
  useEffect(() => {
    if (
      vistaAnterior.current !== vista
    ) {
      vistaAnterior.current = vista

      referenciaTitulo.current?.focus()
    }
  }, [vista])

  /**
   * Abre el formulario de pago únicamente
   * cuando el carrito permite continuar.
   */
  function manejarContinuarCompra() {
    if (!puedeContinuarCompra) {
      return
    }

    setMostrarFormularioPago(true)
  }

  /**
   * Regresa a la vista principal del carrito.
   *
   * No modifica los productos, cantidades,
   * valores monetarios ni método de envío.
   */
  function manejarVolverAlCarrito() {
    setMostrarFormularioPago(false)
  }

  function manejarConfirmarCompra(compra) {
    const resultado = registrarPedido(usuario, compra)
    if (!resultado.exito) {
      return resultado
    }

    const limpieza = vaciarCarrito()
    setConfirmacion({
      pedido: resultado.pedido,
      aviso: limpieza.exito ? '' : 'El pedido quedó guardado. El carrito no se pudo vaciar. Revisa sus productos antes de comprar nuevamente.',
    })
    setMostrarFormularioPago(false)
    return resultado
  }

  return (
    <section
      className="container py-4 py-lg-5 pagina-carrito"
      aria-labelledby="titulo-pagina-carrito"
    >
      <div className="mb-3">
        <Breadcrumb
          elementos={ELEMENTOS_BREADCRUMB}
        />
      </div>

      <header className="mb-4">
        <h1
          id="titulo-pagina-carrito"
          ref={referenciaTitulo}
          tabIndex={-1}
          className="h3 fw-bold mb-2"
        >
          {confirmacion ? 'Factura del pedido' : formularioPagoVisible
            ? 'Proceso de compra'
            : 'Carrito de compras'}
        </h1>

        <p className="texto-secundario mb-0">
          {confirmacion ? 'Tu pedido simulado quedó registrado.' : formularioPagoVisible
            ? 'Verifica los datos de tu compra antes de realizar la confirmación.'
            : 'Revisa los productos de tu carrito, selecciona un método de envío y continúa con tu compra.'}
        </p>
      </header>

      {confirmacion ? (
        <Factura pedido={confirmacion.pedido} aviso={confirmacion.aviso} />
      ) : formularioPagoVisible ? (
        <FormularioPago
          onVolver={manejarVolverAlCarrito}
          onConfirmarCompra={manejarConfirmarCompra}
        />
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <TablaCarrito />
          </div>

          <div className="col-12 col-lg-4">
            <ResumenPedido
              onContinuarCompra={
                manejarContinuarCompra
              }
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default Carrito
