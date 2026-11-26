
import { Link } from 'react-router-dom'
import SelectorCantidad from '../common/SelectorCantidad'
import { formatoMoneda } from '../../utils/formatoMoneda'
import {
  calcularSubtotalProducto,
  CANTIDAD_MINIMA,
  CANTIDAD_MAXIMA,
} from '../../utils/calculosCompra'

function ItemCarrito({
  producto,
  onActualizarCantidad,
  onEliminarProducto,
  deshabilitado = false,
}) {
  const {
    id,
    nombre,
    precio,
    imagen,
    categoria,
    cantidad,
  } = producto

  const subtotal = calcularSubtotalProducto(
    precio,
    cantidad,
  )

  return (
    <article
      className="item-carrito border-bottom py-3"
      aria-label={`Producto ${nombre}`}
    >
      <div className="row g-3 align-items-center">

        {/* Información del producto */}
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center gap-3">

            <Link
              to={`/producto/${id}`}
              className="flex-shrink-0"
              aria-label={`Ver detalle de ${nombre}`}
            >
              <img
                src={imagen}
                alt={nombre}
                width="80"
                height="80"
                loading="lazy"
                className="object-fit-contain rounded border bg-white"
              />
            </Link>

            <div className="flex-grow-1">
              <Link
                to={`/producto/${id}`}
                className="fw-semibold text-dark text-decoration-none"
              >
                {nombre}
              </Link>

              {categoria && (
                <p className="small text-secondary mb-1">
                  {categoria}
                </p>
              )}

              <p className="small text-secondary mb-0">
                Precio unitario: {formatoMoneda(precio)}
              </p>
            </div>

          </div>
        </div>

        {/* Selector de cantidad */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="d-flex flex-column align-items-start align-items-md-center"
            role="group"
            aria-label={`Cantidad de ${nombre}`}
          >
            <span className="small text-secondary d-md-none mb-2">
              Cantidad
            </span>

            <SelectorCantidad
              cantidad={cantidad}
              minimo={CANTIDAD_MINIMA}
              maximo={CANTIDAD_MAXIMA}
              deshabilitado={deshabilitado}
              onCambiar={nuevaCantidad =>
                onActualizarCantidad(id, nuevaCantidad)
              }
            />
          </div>
        </div>

        {/* Subtotal del producto */}
        <div className="col-12 col-sm-6 col-md-3 text-sm-end">
          <span className="small text-secondary d-md-none d-block mb-1">
            Subtotal
          </span>

          <span className="fw-bold text-primary">
            {formatoMoneda(subtotal)}
          </span>
        </div>

        {/* Acción de eliminación */}
        <div className="col-12 col-md-1 text-end">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            disabled={deshabilitado}
            onClick={() => onEliminarProducto(id)}
            aria-label={`Eliminar ${nombre} del carrito`}
            title={`Eliminar ${nombre}`}
          >
            <i
              className="bi bi-trash"
              aria-hidden="true"
            />

            <span className="d-md-none ms-2">
              Eliminar
            </span>
          </button>
        </div>

      </div>
    </article>
  )
}

export default ItemCarrito
