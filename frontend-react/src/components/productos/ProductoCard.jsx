
import { Link } from 'react-router-dom'
import { formatoMoneda } from '../../utils/formatoMoneda.js'

/**
 * CF21 - ProductoCard
 * Componente reutilizable para presentar productos.
 *
 * Recibe la información del producto mediante props.
 * Se utiliza en Inicio y en el Catálogo de productos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.producto - Información del producto.
 */
function ProductoCard({ producto }) {
  return (
    <article className="card producto-card h-100">

      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="card-img-top producto-imagen"
        loading="lazy"
      />

      <div className="card-body d-flex flex-column">

        <p className="producto-categoria mb-2">
          {producto.categoria}
        </p>

        <h3 className="producto-nombre">
          {producto.nombre}
        </h3>

        <p className="producto-descripcion">
          {producto.descripcion}
        </p>

        <p className="producto-precio mt-auto mb-3">
          {formatoMoneda(producto.precio)}
        </p>

        <Link
          to={`/producto/${producto.id}`}
          className="btn btn-primary w-100"
          aria-label={`Ver detalle de ${producto.nombre}`}
        >
          <i
            className="bi bi-eye me-2"
            aria-hidden="true"
          ></i>
          Ver detalle
        </Link>

      </div>
    </article>
  )
}

export default ProductoCard
