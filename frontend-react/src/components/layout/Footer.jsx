import { Link } from 'react-router-dom'

/**
 * CF05 - Footer
 * Pie de página de TECHSOLUTIONS E-Commerce.
 * Presenta información de la tienda, enlaces
 * de navegación y datos de contacto.
 */
function Footer() {
  const anioActual = new Date().getFullYear()

  return (
    <footer className="footer-techsolutions text-white pt-5 pb-3">
      <div className="container">
        <div className="row g-4">

          {/* Información de la tienda */}
          <div className="col-12 col-md-4">
            <h2 className="h5 text-white fw-bold">
              <i
                className="bi bi-pc-display me-2"
                aria-hidden="true"
              ></i>
              TECHSOLUTIONS E-Commerce
            </h2>

            <p className="footer-texto">
              Tienda virtual especializada en computadores,
              celulares, accesorios y productos tecnológicos.
            </p>

            <p className="footer-texto">
              Tecnología, innovación y soluciones a tu alcance.
            </p>
          </div>

          {/* Enlaces de navegación */}
          <div className="col-12 col-md-4">
            <h2 className="h5 text-white fw-bold">
              Enlaces rápidos
            </h2>

            <nav aria-label="Navegación del pie de página">
              <ul className="list-unstyled">
                <li>
                  <Link to="/">Inicio</Link>
                </li>

                <li>
                  <Link to="/catalogo">Productos</Link>
                </li>

                <li>
                  <Link to="/carrito">Carrito de compras</Link>
                </li>

                <li>
                  <Link to="/login">Iniciar sesión</Link>
                </li>

                <li>
                  <Link to="/registro">Registrarse</Link>
                </li>

                <li>
                  <Link to="/contacto">Contacto</Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Información de contacto */}
          <div className="col-12 col-md-4">
            <h2 className="h5 text-white fw-bold">
              Contáctanos
            </h2>

            <ul className="list-unstyled footer-texto">
              <li className="mb-2">
                <i
                  className="bi bi-geo-alt me-2"
                  aria-hidden="true"
                ></i>
                Bogotá, Colombia
              </li>

              <li className="mb-2">
                <i
                  className="bi bi-telephone me-2"
                  aria-hidden="true"
                ></i>
                +57 300 123 4567
              </li>

              <li className="mb-2">
                <i
                  className="bi bi-envelope me-2"
                  aria-hidden="true"
                ></i>
                contacto@techsolutions.com
              </li>
            </ul>
          </div>

        </div>

        <hr className="footer-separador" />

        {/* Derechos reservados */}
        <div className="text-center">
          <p className="footer-texto mb-1">
            © {anioActual} TECHSOLUTIONS E-Commerce.
            Todos los derechos reservados.
          </p>

          <p className="footer-texto small mb-0">
            Proyecto formativo — Análisis y Desarrollo de Software.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer