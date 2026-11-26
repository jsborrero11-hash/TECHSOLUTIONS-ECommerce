
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCarrito from './ItemCarrito'
import { useCarrito } from '../../hooks/useCarrito'

function TablaCarrito() {
  const {
    productos,
    productosDistintos,
    cantidadTotal,
    carritoVacio,
    puedeGestionarCarrito,
    tieneErrorLectura,
    errorLectura,
    errorOperacion,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    recargarCarrito,
    limpiarErrorOperacion,
  } = useCarrito()

  const [confirmarVaciado, setConfirmarVaciado] =
    useState(false)

  const accionesDeshabilitadas =
    !puedeGestionarCarrito ||
    tieneErrorLectura ||
    confirmarVaciado

  function manejarActualizacion(idProducto, cantidad) {
    actualizarCantidad(idProducto, cantidad)
  }

  function manejarEliminacion(idProducto) {
    eliminarProducto(idProducto)
  }

  function manejarVaciado() {
    const resultado = vaciarCarrito()

    if (resultado.exito) {
      setConfirmarVaciado(false)
    }
  }

  function manejarRecarga() {
    recargarCarrito()
    setConfirmarVaciado(false)
  }

  // Restringir el acceso a usuarios no autorizados.
  if (!puedeGestionarCarrito) {
    return (
      <div className="alert alert-warning" role="alert">
        Debes iniciar sesión como cliente para gestionar
        tu carrito de compras.

        <div className="mt-3">
          <Link to="/login" className="btn btn-primary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section
      className="tabla-carrito card border-0 shadow-sm"
      aria-labelledby="titulo-tabla-carrito"
    >
      <div className="card-body p-3 p-lg-4">

        {/* Encabezado */}
        <div className="mb-4">
          <h2
            id="titulo-tabla-carrito"
            className="h5 fw-bold mb-2"
          >
            Productos del carrito
          </h2>

          {!tieneErrorLectura && (
            <p
              className="text-secondary small mb-0"
              aria-live="polite"
            >
              {productosDistintos}{' '}
              {productosDistintos === 1
                ? 'producto'
                : 'productos'}
              {' · '}
              {cantidadTotal}{' '}
              {cantidadTotal === 1
                ? 'unidad'
                : 'unidades'}
            </p>
          )}
        </div>

        {/* Error de lectura y recuperación */}
        {tieneErrorLectura && (
          <div className="alert alert-danger" role="alert">
            <h3 className="h6 fw-bold">
              No fue posible recuperar el carrito
            </h3>

            <p className="mb-2">
              {errorLectura}
            </p>

            <p className="small mb-3">
              Puedes intentar recuperar la información.
              Si el problema persiste, puedes vaciar el
              carrito para comenzar nuevamente.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={manejarRecarga}
              >
                <i
                  className="bi bi-arrow-clockwise me-2"
                  aria-hidden="true"
                />
                Reintentar
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={confirmarVaciado}
                onClick={() => setConfirmarVaciado(true)}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}

        {/* Error de operación */}
        {errorOperacion &&
          (!tieneErrorLectura ||
            errorOperacion !== errorLectura) && (
            <div
              className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
              role="alert"
            >
              <span>{errorOperacion}</span>

              <button
                type="button"
                className="btn-close flex-shrink-0"
                aria-label="Cerrar mensaje de error"
                onClick={limpiarErrorOperacion}
              />
            </div>
          )}

        {/* Confirmación de vaciado */}
        {confirmarVaciado && (
          <div
            className="alert alert-warning"
            role="alert"
          >
            <h3 className="h6 fw-bold">
              ¿Deseas vaciar el carrito?
            </h3>

            <p className="small mb-3">
              Se eliminará toda la información almacenada
              de los productos de tu carrito.
              Esta acción no se puede deshacer.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={manejarVaciado}
              >
                Sí, vaciar carrito
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setConfirmarVaciado(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Estado del carrito vacío */}
        {carritoVacio && !tieneErrorLectura && (
          <div className="text-center py-5">
            <i
              className="bi bi-cart3 display-4 text-secondary"
              aria-hidden="true"
            />

            <h3 className="h5 fw-bold mt-3">
              Tu carrito está vacío
            </h3>

            <p className="text-secondary mb-4">
              Explora nuestro catálogo y agrega los
              productos que necesitas.
            </p>

            <Link
              to="/catalogo"
              className="btn btn-primary"
            >
              Explorar catálogo
            </Link>
          </div>
        )}

        {/* Productos almacenados */}
        {!carritoVacio && (
          <>
            {tieneErrorLectura && (
              <p className="small text-secondary">
                Se muestra la última información disponible.
                Las cantidades y los productos no pueden
                modificarse hasta recuperar el carrito.
              </p>
            )}

            {/* Encabezado para escritorio */}
            <div className="d-none d-md-block border-bottom pb-2">
              <div className="row g-3 small fw-semibold text-secondary">
                <div className="col-md-5">
                  Producto
                </div>

                <div className="col-md-3 text-center">
                  Cantidad
                </div>

                <div className="col-md-3 text-end">
                  Subtotal
                </div>

                <div className="col-md-1">
                  <span className="visually-hidden">
                    Acciones
                  </span>
                </div>
              </div>
            </div>

            {/* Listado de productos */}
            <div>
              {productos.map(producto => (
                <ItemCarrito
                  key={producto.id}
                  producto={producto}
                  onActualizarCantidad={manejarActualizacion}
                  onEliminarProducto={manejarEliminacion}
                  deshabilitado={accionesDeshabilitadas}
                />
              ))}
            </div>

            {/* Acciones generales */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
              <Link
                to="/catalogo"
                className="btn btn-outline-primary"
              >
                <i
                  className="bi bi-arrow-left me-2"
                  aria-hidden="true"
                />
                Continuar comprando
              </Link>

              {!tieneErrorLectura && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={accionesDeshabilitadas}
                  onClick={() => setConfirmarVaciado(true)}
                >
                  <i
                    className="bi bi-trash me-2"
                    aria-hidden="true"
                  />
                  Vaciar carrito
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  )
}

export default TablaCarrito
