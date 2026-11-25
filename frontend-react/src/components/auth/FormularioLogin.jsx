
/**
 * TECHSOLUTIONS E-Commerce
 * CF31 - Formulario de inicio de sesión.
 *
 * Administra la captura de credenciales,
 * las validaciones y la autenticación del usuario.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import BotonPrimario from '../common/BotonPrimario.jsx'
import CampoFormulario from '../common/CampoFormulario.jsx'
import MensajeNotificacion from '../common/MensajeNotificacion.jsx'

import { useAuth } from '../../hooks/useAuth.js'

import {
  validarLogin,
  tieneErrores,
} from '../../utils/validaciones.js'

import {
  obtenerRutaPorRol,
} from '../../services/authService.js'

const DATOS_INICIALES = {
  correo: '',
  contrasena: '',
}

function FormularioLogin() {
  const navigate = useNavigate()

  const {
    iniciarSesion,
    cargando,
  } = useAuth()

  const [datos, setDatos] = useState(DATOS_INICIALES)

  const [errores, setErrores] = useState({})

  const [notificacion, setNotificacion] =
    useState(null)

  /**
   * Actualiza los campos del formulario.
   * Elimina el error asociado al campo modificado.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target

    setDatos((datosAnteriores) => ({
      ...datosAnteriores,
      [name]: value,
    }))

    setErrores((erroresAnteriores) => ({
      ...erroresAnteriores,
      [name]: '',
    }))

    setNotificacion(null)
  }

  /**
   * Cierra la notificación activa.
   */
  function cerrarNotificacion() {
    setNotificacion(null)
  }

  /**
   * Informa sobre la disponibilidad futura
   * de la recuperación de contraseña.
   */
  function manejarRecuperacion() {
    setNotificacion({
      tipo: 'informacion',
      titulo: 'Recuperación de contraseña',
      mensaje:
        'Esta funcionalidad estará disponible cuando se complete la integración con el backend.',
    })
  }

  /**
   * Valida el formulario y ejecuta
   * el inicio de sesión.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    if (cargando) {
      return
    }

    setNotificacion(null)

    const erroresValidacion = validarLogin(datos)

    setErrores(erroresValidacion)

    if (tieneErrores(erroresValidacion)) {
      setNotificacion({
        tipo: 'error',
        titulo: 'Verifica los campos',
        mensaje:
          'Completa correctamente los campos del formulario para continuar.',
      })

      return
    }

    const resultado = await iniciarSesion(datos)

    if (!resultado.exito) {
      setErrores(resultado.errores || {})

      setNotificacion({
        tipo: 'error',
        titulo: 'No fue posible iniciar sesión',
        mensaje: resultado.mensaje,
      })

      return
    }

    setDatos(DATOS_INICIALES)
    setErrores({})

    const rutaDestino = obtenerRutaPorRol(
      resultado.usuario.rol
    )

    navigate(rutaDestino, {
      replace: true,
    })
  }

  return (
    <form
      className="formulario-login"
      onSubmit={manejarEnvio}
      noValidate
      aria-label="Formulario de inicio de sesión"
      aria-busy={cargando}
    >
      {notificacion && (
        <MensajeNotificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          onCerrar={cerrarNotificacion}
        />
      )}

      <CampoFormulario
        id="login-correo"
        nombre="correo"
        etiqueta="Correo electrónico"
        tipo="email"
        valor={datos.correo}
        onChange={manejarCambio}
        placeholder="Ingresa tu correo electrónico"
        error={errores.correo}
        requerido
        deshabilitado={cargando}
        autoComplete="username"
        inputMode="email"
        icono="bi-envelope"
      />

      <CampoFormulario
        id="login-contrasena"
        nombre="contrasena"
        etiqueta="Contraseña"
        tipo="password"
        valor={datos.contrasena}
        onChange={manejarCambio}
        placeholder="Ingresa tu contraseña"
        error={errores.contrasena}
        requerido
        deshabilitado={cargando}
        autoComplete="current-password"
        icono="bi-lock"
      />

      <div className="login-recuperacion">
        <button
          type="button"
          className="btn btn-link login-enlace-recuperacion"
          onClick={manejarRecuperacion}
          disabled={cargando}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <BotonPrimario
        tipo="submit"
        icono="bi-box-arrow-in-right"
        cargando={cargando}
        textoCarga="Iniciando sesión..."
        anchoCompleto
      >
        Iniciar sesión
      </BotonPrimario>

      <div className="login-registro">
        <p>
          ¿Todavía no tienes una cuenta?
        </p>

        <Link
          to="/registro"
          className="login-enlace-registro"
        >
          Crear una cuenta
        </Link>
      </div>
    </form>
  )
}

export default FormularioLogin
