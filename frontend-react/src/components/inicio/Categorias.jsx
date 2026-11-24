
import { Link } from 'react-router-dom'
import { categorias } from '../../data/productos.js'

/**
 * CF16 - Categorias
 * Presenta las categorías disponibles en la tienda.
 *
 * Utiliza los datos centralizados de productos y permite
 * navegar al catálogo mediante un filtro por categoría.
 */

const iconosCategorias = {
  Laptops: 'bi-laptop',
  Monitores: 'bi-display',
  Accesorios: 'bi-mouse',
  Almacenamiento: 'bi-device-ssd',
  Audio: 'bi-headphones',
}

function Categorias() {
  return (
    <section
      className="seccion-categorias py-5"
      aria-labelledby="titulo-categorias"
    >
      <div className="container">

        <div className="text-center mb-4">
          <h2 id="titulo-categorias">
            Explora nuestras categorías
          </h2>

          <p className="texto-secundario">
            Encuentra los productos tecnológicos que necesitas.
          </p>
        </div>

        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3 justify-content-center">

          {categorias.map(categoria => (
            <div className="col" key={categoria}>

              <Link
                to={`/catalogo?categoria=${encodeURIComponent(categoria)}`}
                className="tarjeta-categoria h-100"
              >
                <i
                  className={`bi ${iconosCategorias[categoria] || 'bi-grid'} categoria-icono`}
                  aria-hidden="true"
                ></i>

                <h3 className="categoria-nombre">
                  {categoria}
                </h3>
              </Link>

            </div>
          ))}

        </div>
      </div>
    </section>
  )
}

export default Categorias
