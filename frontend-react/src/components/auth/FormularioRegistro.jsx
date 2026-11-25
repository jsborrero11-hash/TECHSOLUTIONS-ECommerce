
/**
 * TECHSOLUTIONS E-Commerce
 * CF33 - Formulario de registro de usuarios.
 *
 * Administra la captura de datos, las validaciones
 * y la simulación del registro de nuevos clientes.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

import BotonPrimario from '../common/BotonPrimario.jsx'
import CampoFormulario from '../common/CampoFormulario.jsx'
import MensajeNotificacion from '../common/MensajeNotificacion.jsx'

import { useAuth } from '../../hooks/useAuth.js'

import {
  validarRegistro,
  tieneErrores,
  LONGITUD_MINIMA_CONTRASENA,
} from '../../utils/validaciones.js'

const DATOS_INICIALES = {
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  contrasena: '',
  confirmarContrasena: '',
}

function FormularioRegistro() {
  const {
    registrarUsuario,
    cargando,
  } = useAuth()

  const [datos, setDatos] = useState(DATOS_INICIALES)

  const [errores, setErrores] = useState({})

  const [notificacion, setNotificacion] =
    useState(null)

  /**
   * Actualiza los datos y elimina los errores
   * asociados al campo modificado.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target

    setDatos((datosAnteriores) => ({
      ...datosAnteriores,
      [name]: value,
    }))

    setErrores((erroresAnteriores) => {
      const nuevosErrores = {
        ...erroresAnteriores,
      }

      delete nuevosErrores[name]

      if (name === 'contrasena') {
        delete nuevosErrores.confirmarContrasena
      }

      return nuevosErrores
    })

    setNotificacion(null)
  }

  /**
   * Cierra la notificación activa.
   */
  function cerrarNotificacion() {
    setNotificacion(null)
  }

  /**
   * Valida los datos y ejecuta
   * el registro simulado del cliente.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    if (cargando) {
      return
    }

    setNotificacion(null)

    const erroresValidacion = validarRegistro(datos)

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

    const resultado = await registrarUsuario(datos)

    if (!resultado.exito) {
      setErrores(resultado.errores || {})

      setNotificacion({
        tipo: 'error',
        titulo: 'No fue posible completar el registro',
        mensaje: resultado.mensaje,
      })

      return
    }

    setDatos(DATOS_INICIALES)
    setErrores({})

    setNotificacion({
      tipo: resultado.simulado
        ? 'informacion'
        : 'exito',

      titulo: resultado.simulado
        ? 'Validación de registro completada'
        : 'Registro exitoso',

      mensaje: resultado.mensaje,
    })
  }

  return (
    <form
      className="formulario-registro"
      onSubmit={manejarEnvio}
      noValidate
      aria-label="Formulario de registro de usuarios"
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

      <div className="row gx-3">

        <div className="col-12">
          <CampoFormulario
            id="registro-nombre"
            nombre="nombre"
            etiqueta="Nombre completo"
            valor={datos.nombre}
            onChange={manejarCambio}
            placeholder="Ingresa tu nombre completo"
            error={errores.nombre}
            requerido
            deshabilitado={cargando}
            autoComplete="name"
            icono="bi-person"
          />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            id="registro-correo"
            nombre="correo"
            etiqueta="Correo electrónico"
            tipo="email"
            valor={datos.correo}
            onChange={manejarCambio}
            placeholder="Ingresa tu correo"
            error={errores.correo}
            requerido
            deshabilitado={cargando}
            autoComplete="email"
            inputMode="email"
            icono="bi-envelope"
          />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            id="registro-telefono"
            nombre="telefono"
            etiqueta="Teléfono"
            tipo="tel"
            valor={datos.telefono}
            onChange={manejarCambio}
            placeholder="Ingresa tu teléfono"
            error={errores.telefono}
            requerido
            deshabilitado={cargando}
            autoComplete="tel"
            inputMode="tel"
            icono="bi-telephone"
          />
        </div>

        <div className="col-12">
          <CampoFormulario
            id="registro-direccion"
            nombre="direccion"
            etiqueta="Dirección"
            valor={datos.direccion}
            onChange={manejarCambio}
            placeholder="Ingresa tu dirección"
            error={errores.direccion}
            requerido
            deshabilitado={cargando}
            autoComplete="street-address"
            icono="bi-geo-alt"
          />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            id="registro-contrasena"
            nombre="contrasena"
            etiqueta="Contraseña"
            tipo="password"
            valor={datos.contrasena}
            onChange={manejarCambio}
            placeholder="Crea una contraseña"
            error={errores.contrasena}
            ayuda={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
            requerido
            deshabilitado={cargando}
            autoComplete="new-password"
            minLength={LONGITUD_MINIMA_CONTRASENA}
            icono="bi-lock"
          />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            id="registro-confirmar-contrasena"
            nombre="confirmarContrasena"
            etiqueta="Confirmar contraseña"
            tipo="password"
            valor={datos.confirmarContrasena}
            onChange={manejarCambio}
            placeholder="Repite la contraseña"
            error={errores.confirmarContrasena}
            requerido
            deshabilitado={cargando}
            autoComplete="new-password"
            icono="bi-lock"
          />
        </div>

      </div>

      <BotonPrimario
        tipo="submit"
        icono="bi-person-plus"
        cargando={cargando}
        textoCarga="Validando registro..."
        anchoCompleto
      >
        Registrarse
      </BotonPrimario>

      <div className="registro-login">
        <p>¿Ya tienes una cuenta?</p>

        <Link
          to="/login"
          className="registro-enlace-login"
        >
          Iniciar sesión
        </Link>
      </div>
    </form>
  )
}

export default FormularioRegistro
