
import { Link } from 'react-router-dom'
import { productosDestacados } from '../../data/productos.js'
import ProductoCard from '../productos/ProductoCard.jsx'

/**
 * CF17 - ProductosDestacados
 * Presenta los productos destacados de la tienda.
 *
 * Utiliza la fuente centralizada de datos y reutiliza
 * el componente ProductoCard para evitar duplicación
 * de código.
 */
function ProductosDestacados() {
  return (
    <section
      className="seccion-destacados py-5"
      aria-labelledby="titulo-destacados"
    >
      <div className="container">

        <div className="text-center mb-4">

          <h2 id="titulo-destacados">
            Productos destacados
          </h2>

          <p className="texto-secundario">
            Conoce nuestra selección de productos tecnológicos.
          </p>

        </div>

        {productosDestacados.length > 0 ? (

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">

            {productosDestacados.map(producto => (
              <div className="col" key={producto.id}>

                <ProductoCard producto={producto} />

              </div>
            ))}

          </div>

        ) : (

          <div className="alert alert-info text-center">
            Actualmente no hay productos destacados disponibles.
          </div>

        )}

        <div className="text-center mt-5">

          <Link
            to="/catalogo"
            className="btn btn-primary btn-lg"
          >
            Ver todos los productos

            <i
              className="bi bi-arrow-right ms-2"
              aria-hidden="true"
            ></i>

          </Link>

        </div>

      </div>
    </section>
  )
}

export default ProductosDestacados
