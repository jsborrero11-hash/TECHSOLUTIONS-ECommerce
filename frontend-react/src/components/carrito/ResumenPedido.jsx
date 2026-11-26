
import { useId } from 'react'
import { useCarrito } from '../../hooks/useCarrito'
import { formatoMoneda } from '../../utils/formatoMoneda'
import {
  METODOS_ENVIO,
  TASA_IVA
} from '../../utils/calculosCompra'
import BotonPrimario from '../common/BotonPrimario'

function ResumenPedido({ onContinuarCompra }) {
  const idComponente = useId()

  const {
    resumen,
    carritoVacio,
    puedeGestionarCarrito,
    puedeContinuarCompra,
    idMetodoEnvio,
    tieneErrorLectura,
    seleccionarMetodoEnvio
  } = useCarrito()

  const {
    subtotal,
    iva,
    costoEnvio,
    total,
    envioSeleccionado
  } = resumen

  const idTitulo = `${idComponente}-titulo`
  const idAyuda = `${idComponente}-ayuda`
  const nombreGrupoEnvio = `${idComponente}-envio`

  const envioDeshabilitado =
    !puedeGestionarCarrito ||
    carritoVacio ||
    tieneErrorLectura

  const continuarDeshabilitado =
    !puedeContinuarCompra ||
    typeof onContinuarCompra !== 'function'

  const totalProvisional =
    !carritoVacio && !envioSeleccionado

  const porcentajeIVA = Math.round(TASA_IVA * 100)

  const manejarSeleccionEnvio = (idEnvio) => {
    if (envioDeshabilitado) {
      return
    }

    seleccionarMetodoEnvio(idEnvio)
  }

  const manejarContinuarCompra = () => {
    if (continuarDeshabilitado) {
      return
    }

    onContinuarCompra()
  }

  let mensajeAyuda

  if (!puedeGestionarCarrito) {
    mensajeAyuda =
      'Debes iniciar sesión como cliente para continuar.'
  } else if (tieneErrorLectura) {
    mensajeAyuda =
      'Recupera el carrito antes de continuar con la compra.'
  } else if (carritoVacio) {
    mensajeAyuda =
      'Agrega productos al carrito para continuar.'
  } else if (!envioSeleccionado) {
    mensajeAyuda =
      'Selecciona un método de envío para continuar.'
  } else if (typeof onContinuarCompra !== 'function') {
    mensajeAyuda =
      'La continuación de compra no está disponible.'
  } else if (!puedeContinuarCompra) {
    mensajeAyuda =
      'No es posible continuar con la compra en este momento.'
  } else {
    mensajeAyuda =
      'Puedes continuar con el proceso de compra.'
  }

  return (
    <section
      className="card shadow-sm resumen-pedido"
      aria-labelledby={idTitulo}
    >
      <div className="card-body p-3 p-lg-4">
        <h2
          id={idTitulo}
          className="h5 fw-bold mb-4"
        >
          Resumen del pedido
        </h2>

        {tieneErrorLectura && (
          <div
            className="alert alert-warning small"
            role="status"
          >
            Los valores mostrados pueden no estar
            actualizados. Recupera el carrito antes
            de continuar.
          </div>
        )}

        <dl className="mb-4">
          <div className="d-flex justify-content-between gap-3 mb-3">
            <dt className="fw-normal">
              Subtotal
            </dt>

            <dd className="mb-0 fw-semibold text-end">
              {formatoMoneda(subtotal)}
            </dd>
          </div>

          <div className="d-flex justify-content-between gap-3 mb-3">
            <dt className="fw-normal">
              IVA ({porcentajeIVA} %)
            </dt>

            <dd className="mb-0 fw-semibold text-end">
              {formatoMoneda(iva)}
            </dd>
          </div>

          <div className="d-flex justify-content-between gap-3 mb-3">
            <dt className="fw-normal">
              Costo de envío
            </dt>

            <dd className="mb-0 fw-semibold text-end">
              {carritoVacio
                ? formatoMoneda(0)
                : envioSeleccionado
                  ? formatoMoneda(costoEnvio)
                  : 'Pendiente'}
            </dd>
          </div>
        </dl>

        <fieldset
          className="mb-4"
          disabled={envioDeshabilitado}
          aria-describedby={idAyuda}
        >
          <legend className="h6 fw-bold mb-3">
            Método de envío
          </legend>

          {METODOS_ENVIO.map((metodo) => {
            const idOpcion =
              `${idComponente}-envio-${metodo.id}`

            const seleccionado =
              idMetodoEnvio === metodo.id

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
                    className="form-check-input"
                    type="radio"
                    name={nombreGrupoEnvio}
                    id={idOpcion}
                    value={metodo.id}
                    checked={seleccionado}
                    onChange={() =>
                      manejarSeleccionEnvio(metodo.id)
                    }
                  />

                  <label
                    className="form-check-label w-100"
                    htmlFor={idOpcion}
                  >
                    <span className="d-block fw-semibold">
                      {metodo.nombre}
                    </span>

                    <span className="d-block small text-body-secondary">
                      {metodo.costo === 0
                        ? 'Gratis'
                        : formatoMoneda(metodo.costo)}
                    </span>
                  </label>
                </div>
              </div>
            )
          })}
        </fieldset>

        <div
          className="border-top pt-3 mb-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="fw-bold">
              {totalProvisional
                ? 'Total provisional'
                : 'Total del pedido'}
            </span>

            <span className="fs-4 fw-bold text-primary">
              {formatoMoneda(total)}
            </span>
          </div>

          {totalProvisional && (
            <p className="small text-body-secondary mt-2 mb-0">
              El total se actualizará cuando selecciones
              un método de envío.
            </p>
          )}
        </div>

        <BotonPrimario
          tipo="button"
          anchoCompleto
          deshabilitado={continuarDeshabilitado}
          onClick={manejarContinuarCompra}
          icono="bi-arrow-right-circle"
        >
          Continuar compra
        </BotonPrimario>

        <p
          id={idAyuda}
          className="small text-body-secondary text-center mt-3 mb-0"
          role="status"
        >
          {mensajeAyuda}
        </p>
      </div>
    </section>
  )
}

export default ResumenPedido
