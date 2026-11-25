
/**
 * TECHSOLUTIONS E-Commerce
 * CF05 - Pie de página.
 *
 * Presenta información institucional,
 * enlaces rápidos y datos de contacto.
 */

import { Link } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth.js'

function Footer() {
  const anioActual = new Date().getFullYear()

  const {
    estaAutenticado,
    esCliente,
    esAdministrador,
  } = useAuth()

  return (
    <footer className="footer-principal bg-dark text-white pt-5 pb-3">

      <div className="container">

        <div className="row g-4">

          {/* Información institucional */}

          <div className="col-12 col-md-4">

            <h2 className="h5 mb-3">
              TECHSOLUTIONS E-Commerce
            </h2>

            <p>
              Tu tienda de tecnología en línea.
              Encuentra productos para el trabajo,
              el estudio y el entretenimiento.
            </p>

          </div>

          {/* Enlaces rápidos */}

          <div className="col-12 col-md-4">

            <h2 className="h5 mb-3">
              Enlaces rápidos
            </h2>

            <ul className="list-unstyled">

              <li className="mb-2">
                <Link
                  to="/"
                  className="text-white text-decoration-none"
                >
                  Inicio
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/catalogo"
                  className="text-white text-decoration-none"
                >
                  Productos
                </Link>
              </li>

              {!esAdministrador && (
                <li className="mb-2">
                  <Link
                    to="/carrito"
                    className="text-white text-decoration-none"
                  >
                    Carrito de compras
                  </Link>
                </li>
              )}

              {!estaAutenticado && (
                <>
                  <li className="mb-2">
                    <Link
                      to="/login"
                      className="text-white text-decoration-none"
                    >
                      Iniciar sesión
                    </Link>
                  </li>

                  <li className="mb-2">
                    <Link
                      to="/registro"
                      className="text-white text-decoration-none"
                    >
                      Registrarse
                    </Link>
                  </li>
                </>
              )}

              {esCliente && (
                <li className="mb-2">
                  <Link
                    to="/cliente"
                    className="text-white text-decoration-none"
                  >
                    Mi cuenta
                  </Link>
                </li>
              )}

              {esAdministrador && (
                <li className="mb-2">
                  <Link
                    to="/admin"
                    className="text-white text-decoration-none"
                  >
                    Administración
                  </Link>
                </li>
              )}

              <li className="mb-2">
                <Link
                  to="/contacto"
                  className="text-white text-decoration-none"
                >
                  Contacto
                </Link>
              </li>

            </ul>

          </div>

          {/* Información de contacto */}

          <div className="col-12 col-md-4">

            <h2 className="h5 mb-3">
              Contáctanos
            </h2>

            <p className="mb-2">
              <i
                className="bi bi-geo-alt me-2"
                aria-hidden="true"
              ></i>

              Bogotá, Colombia
            </p>

            <p className="mb-2">
              <i
                className="bi bi-telephone me-2"
                aria-hidden="true"
              ></i>

              +57 300 123 4567
            </p>

            <p className="mb-2 text-break">
              <i
                className="bi bi-envelope me-2"
                aria-hidden="true"
              ></i>

              contacto@techsolutions.com
            </p>

          </div>

        </div>

        <hr />

        <div className="text-center">

          <p className="mb-1">
            &copy; {anioActual} TECHSOLUTIONS E-Commerce.
            Todos los derechos reservados.
          </p>

          <p className="small mb-0">
            Proyecto formativo SENA.
          </p>

        </div>

      </div>

    </footer>
  )
}

export default Footer
