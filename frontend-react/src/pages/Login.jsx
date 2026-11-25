
/**
 * TECHSOLUTIONS E-Commerce
 * CF30 - Página de inicio de sesión.
 *
 * Presenta la interfaz de acceso al sistema
 * y reutiliza el formulario de autenticación.
 */

import { Link, Navigate } from 'react-router-dom'

import Breadcrumb from '../components/common/Breadcrumb.jsx'
import FormularioLogin from '../components/auth/FormularioLogin.jsx'

import { useAuth } from '../hooks/useAuth.js'

import {
  obtenerRutaPorRol,
} from '../services/authService.js'

function Login() {
  const {
    usuario,
    estaAutenticado,
  } = useAuth()

  /**
   * Evita mostrar el formulario de inicio de sesión
   * cuando el usuario ya tiene una sesión activa.
   */
  if (estaAutenticado) {
    return (
      <Navigate
        to={obtenerRutaPorRol(usuario.rol)}
        replace
      />
    )
  }

  return (
    <section
      className="pagina-autenticacion pagina-login py-5"
      aria-labelledby="titulo-login"
    >
      <div className="container">

        <Breadcrumb
          elementos={[
            {
              nombre: 'Inicio',
              ruta: '/',
            },
            {
              nombre: 'Iniciar sesión',
            },
          ]}
        />

        <div className="autenticacion-contenedor">

          <div className="autenticacion-tarjeta">

            <div className="autenticacion-encabezado">

              <div
                className="autenticacion-icono"
                aria-hidden="true"
              >
                <i className="bi bi-person-circle"></i>
              </div>

              <h1
                id="titulo-login"
                className="autenticacion-titulo"
              >
                Iniciar sesión
              </h1>

              <p className="autenticacion-descripcion">
                Bienvenido a TECHSOLUTIONS E-Commerce.
                Ingresa tus credenciales para acceder
                a tu cuenta.
              </p>

            </div>

            <p className="autenticacion-campos-obligatorios">
              Los campos marcados con
              <span aria-hidden="true"> * </span>
              son obligatorios.
            </p>

            <FormularioLogin />

            <div className="autenticacion-aviso">

              <i
                className="bi bi-info-circle"
                aria-hidden="true"
              ></i>

              <p>
                Actualmente, la autenticación funciona
                en modo de demostración. No ingreses
                credenciales personales reales.
              </p>

            </div>

          </div>

          <div className="autenticacion-navegacion">

            <Link
              to="/"
              className="btn btn-outline-secondary"
            >
              <i
                className="bi bi-arrow-left me-2"
                aria-hidden="true"
              ></i>

              Volver al inicio
            </Link>

          </div>

        </div>

      </div>
    </section>
  )
}

export default Login
