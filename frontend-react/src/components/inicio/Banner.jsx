
import { Link } from 'react-router-dom'

/**
 * CF15 - Banner
 * Componente de presentación comercial de la tienda.
 *
 * Reutiliza la imagen del proyecto original y permite
 * acceder directamente al catálogo de productos.
 */
function Banner() {
  return (
    <section
      className="banner-inicio"
      aria-labelledby="titulo-banner"
    >
      <div className="container banner-contenido text-center">

        <h1 id="titulo-banner" className="banner-titulo">
          Bienvenido a TECHSOLUTIONS E-Commerce
        </h1>

        <p className="banner-descripcion">
          Descubre computadores, celulares, accesorios y
          productos tecnológicos para tus necesidades.
        </p>

        <Link
          to="/catalogo"
          className="btn btn-primary btn-lg mt-3"
        >
          <i
            className="bi bi-grid me-2"
            aria-hidden="true"
          ></i>
          Ver productos
        </Link>

      </div>
    </section>
  )
}

export default Banner
