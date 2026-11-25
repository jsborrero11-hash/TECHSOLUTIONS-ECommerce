
/**
 * TECHSOLUTIONS E-Commerce
 * CF04 - Barra de navegación principal.
 *
 * Adapta las opciones de navegación según
 * el estado de autenticación y el rol del usuario.
 */

import { useState } from 'react'

import {
  NavLink,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth.js'

import MensajeNotificacion from '../common/MensajeNotificacion.jsx'

function Navbar() {
  const navigate = useNavigate()

  const {
    usuario,
    estaAutenticado,
    esCliente,
    esAdministrador,
    cargando,
    cerrarSesion,
  } = useAuth()

  const [menuAbierto, setMenuAbierto] =
    useState(false)

  const [notificacion, setNotificacion] =
    useState(null)

  /**
   * Alterna la visibilidad del menú móvil.
   */
  function alternarMenu() {
    setMenuAbierto(
      (estadoAnterior) => !estadoAnterior
    )
  }

  /**
   * Cierra el menú después de navegar.
   */
  function cerrarMenu() {
    setMenuAbierto(false)
    setNotificacion(null)
  }

  /**
   * Finaliza la sesión del usuario.
   */
  async function manejarCierreSesion() {
    if (cargando) {
      return
    }

    setNotificacion(null)

    const resultado = await cerrarSesion()

    if (!resultado.exito) {
      setNotificacion(resultado.mensaje)

      return
    }

    cerrarMenu()

    navigate('/', {
      replace: true,
    })
  }

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark navbar-principal"
        aria-label="Navegación principal"
      >
        <div className="container">

          <NavLink
            to="/"
            className="navbar-brand"
            onClick={cerrarMenu}
          >
            <i
              className="bi bi-shop me-2"
              aria-hidden="true"
            ></i>

            TECHSOLUTIONS
          </NavLink>

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

          <div
            id="menuPrincipal"
            className={`collapse navbar-collapse${
              menuAbierto ? ' show' : ''
            }`}
          >

            <ul className="navbar-nav me-auto">

              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className="nav-link"
                  onClick={cerrarMenu}
                >
                  Inicio
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/catalogo"
                  className="nav-link"
                  onClick={cerrarMenu}
                >
                  Productos
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/contacto"
                  className="nav-link"
                  onClick={cerrarMenu}
                >
                  Contacto
                </NavLink>
              </li>

            </ul>

            <ul className="navbar-nav navbar-opciones-usuario">

              {/* Carrito disponible para visitantes
                  y clientes. La ruta exige sesión. */}

              {!esAdministrador && (
                <li className="nav-item">
                  <NavLink
                    to="/carrito"
                    className="nav-link"
                    onClick={cerrarMenu}
                  >
                    <i
                      className="bi bi-cart3 me-1"
                      aria-hidden="true"
                    ></i>

                    Carrito
                  </NavLink>
                </li>
              )}

              {/* Opciones para visitantes */}

              {!estaAutenticado && (
                <>
                  <li className="nav-item">
                    <NavLink
                      to="/login"
                      className="nav-link"
                      onClick={cerrarMenu}
                    >
                      <i
                        className="bi bi-person-circle me-1"
                        aria-hidden="true"
                      ></i>

                      Ingresar
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      to="/registro"
                      className="nav-link"
                      onClick={cerrarMenu}
                    >
                      Registrarse
                    </NavLink>
                  </li>
                </>
              )}

              {/* Opciones exclusivas del cliente */}

              {esCliente && (
                <li className="nav-item">
                  <NavLink
                    to="/cliente"
                    className="nav-link"
                    onClick={cerrarMenu}
                  >
                    <i
                      className="bi bi-person me-1"
                      aria-hidden="true"
                    ></i>

                    Mi cuenta
                  </NavLink>
                </li>
              )}

              {/* Opciones exclusivas del administrador */}

              {esAdministrador && (
                <li className="nav-item">
                  <NavLink
                    to="/admin"
                    className="nav-link"
                    onClick={cerrarMenu}
                  >
                    <i
                      className="bi bi-speedometer2 me-1"
                      aria-hidden="true"
                    ></i>

                    Administración
                  </NavLink>
                </li>
              )}

              {/* Información de la sesión activa */}

              {estaAutenticado && (
                <>
                  <li className="nav-item navbar-usuario">
                    <span className="navbar-nombre-usuario">
                      <i
                        className="bi bi-person-check me-1"
                        aria-hidden="true"
                      ></i>

                      {usuario.nombre}
                    </span>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className="btn navbar-cerrar-sesion"
                      onClick={manejarCierreSesion}
                      disabled={cargando}
                    >
                      <i
                        className="bi bi-box-arrow-right me-1"
                        aria-hidden="true"
                      ></i>

                      {cargando
                        ? 'Procesando...'
                        : 'Cerrar sesión'}
                    </button>
                  </li>
                </>
              )}

            </ul>

          </div>

        </div>
      </nav>

      {notificacion && (
        <div className="container mt-3">
          <MensajeNotificacion
            tipo="error"
            titulo="No fue posible cerrar sesión"
            mensaje={notificacion}
            onCerrar={() => setNotificacion(null)}
          />
        </div>
      )}
    </>
  )
}

export default Navbar
