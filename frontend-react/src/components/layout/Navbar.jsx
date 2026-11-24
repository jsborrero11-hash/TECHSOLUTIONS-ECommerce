import { useState } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * CF04 - Navbar
 * Menú principal de navegación de TECHSOLUTIONS E-Commerce.
 * Permite acceder a las diferentes secciones de la tienda.
 * Incluye apertura y cierre del menú móvil mediante React.
 */
function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Permite abrir o cerrar el menú móvil.
  const alternarMenu = () => {
    setMenuAbierto(estadoAnterior => !estadoAnterior)
  }

  // Cierra el menú después de seleccionar una opción.
  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark navbar-techsolutions"
      aria-label="Navegación principal"
    >
      <div className="container">

        {/* Botón del menú para dispositivos móviles */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={alternarMenu}
          aria-controls="menuPrincipal"
          aria-expanded={menuAbierto}
          aria-label={
            menuAbierto
              ? 'Cerrar menú de navegación'
              : 'Abrir menú de navegación'
          }
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Opciones del menú principal */}
        <div
          className={`collapse navbar-collapse ${menuAbierto ? 'show' : ''}`}
          id="menuPrincipal"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/"
                end
                onClick={cerrarMenu}
              >
                <i
                  className="bi bi-house-door me-2"
                  aria-hidden="true"
                ></i>
                Inicio
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/catalogo"
                onClick={cerrarMenu}
              >
                <i
                  className="bi bi-grid me-2"
                  aria-hidden="true"
                ></i>
                Productos
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/contacto"
                onClick={cerrarMenu}
              >
                <i
                  className="bi bi-envelope me-2"
                  aria-hidden="true"
                ></i>
                Contacto
              </NavLink>
            </li>

          </ul>

          {/* Opciones de compra y autenticación */}
          <ul className="navbar-nav">

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/carrito"
                onClick={cerrarMenu}
              >
                <i
                  className="bi bi-cart3 me-2"
                  aria-hidden="true"
                ></i>
                Carrito
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/login"
                onClick={cerrarMenu}
              >
                <i
                  className="bi bi-person-circle me-2"
                  aria-hidden="true"
                ></i>
                Ingresar
              </NavLink>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar