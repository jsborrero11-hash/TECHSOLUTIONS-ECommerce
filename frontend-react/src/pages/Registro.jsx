
/**
 * TECHSOLUTIONS E-Commerce
 * CF32 - Página de registro de usuarios.
 *
 * Presenta la interfaz de registro de clientes
 * y reutiliza los componentes de autenticación.
 */

import { Link, Navigate } from 'react-router-dom'

import Breadcrumb from '../components/common/Breadcrumb.jsx'
import FormularioRegistro from '../components/auth/FormularioRegistro.jsx'

import { useAuth } from '../hooks/useAuth.js'

import {
  obtenerRutaPorRol,
} from '../services/authService.js'

function Registro() {
  const {
    usuario,
    estaAutenticado,
  } = useAuth()

  /**
   * Redirige al panel correspondiente cuando
   * el usuario ya tiene una sesión activa.
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
      className="pagina-autenticacion pagina-registro py-5"
      aria-labelledby="titulo-registro"
    >
      <div className="container">

        <Breadcrumb
          elementos={[
            {
              nombre: 'Inicio',
              ruta: '/',
            },
            {
              nombre: 'Registro',
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
                <i className="bi bi-person-plus-fill"></i>
              </div>

              <h1
                id="titulo-registro"
                className="autenticacion-titulo"
              >
                Crear una cuenta
              </h1>

              <p className="autenticacion-descripcion">
                Completa tus datos para registrarte
                como cliente de TECHSOLUTIONS E-Commerce.
              </p>

            </div>

            <div className="autenticacion-aviso">

              <i
                className="bi bi-info-circle"
                aria-hidden="true"
              ></i>

              <p>
                El registro funciona actualmente en
                modo de demostración. Utiliza datos
                ficticios. No se crearán cuentas reales
                ni se almacenarán tus datos personales.
              </p>

            </div>

            <p className="autenticacion-campos-obligatorios">
              Los campos marcados con
              <span aria-hidden="true"> * </span>
              son obligatorios.
            </p>

            <FormularioRegistro />

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

export default Registro
