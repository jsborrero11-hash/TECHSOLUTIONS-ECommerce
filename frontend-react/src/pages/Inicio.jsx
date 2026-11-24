import { Link } from 'react-router-dom'

/**
 * CF14 - Inicio
 * Página principal de TECHSOLUTIONS E-Commerce.
 * Estructura inicial para validar la integración
 * de los componentes generales.
 */
function Inicio() {
  return (
    <section className="container py-5 text-center">
      <i
        className="bi bi-pc-display fs-1 text-primary"
        aria-hidden="true"
      ></i>

      <h1 className="mt-3">
        Bienvenido a TECHSOLUTIONS E-Commerce
      </h1>

      <p className="texto-secundario">
        Encuentra computadores, celulares, accesorios
        y productos tecnológicos.
      </p>

      <div className="mt-4">
        <Link to="/catalogo" className="btn btn-primary">
          <i className="bi bi-cart3 me-2" aria-hidden="true"></i>
          Ver productos
        </Link>
      </div>
    </section>
  )
}

export default Inicio