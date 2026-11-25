
/**
 * TECHSOLUTIONS E-Commerce
 * Proveedor global de autenticación.
 *
 * Administra el estado de la sesión de demostración
 * y centraliza las operaciones de autenticación.
 */

import { useState } from 'react'

import AuthContext from './AuthContext.js'

import {
  ROLES,
  iniciarSesion as iniciarSesionServicio,
  cerrarSesion as cerrarSesionServicio,
  registrarUsuario as registrarUsuarioServicio,
  obtenerSesion,
} from '../services/authService.js'

/**
 * Proporciona el estado y las operaciones
 * de autenticación a los componentes de React.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    () => obtenerSesion()
  )

  const [cargando, setCargando] = useState(false)

  /**
   * Indicadores derivados del usuario autenticado.
   */
  const estaAutenticado = usuario !== null

  const esCliente =
    usuario?.rol === ROLES.CLIENTE

  const esAdministrador =
    usuario?.rol === ROLES.ADMIN

  /**
   * Inicia una sesión y actualiza el estado global
   * cuando el servicio confirma la operación.
   */
  async function iniciarSesion(datos) {
    setCargando(true)

    try {
      const resultado = await iniciarSesionServicio(datos)

      if (resultado.exito) {
        setUsuario(resultado.usuario)
      }

      return resultado
    } catch (error) {
      console.error(
        'Error durante el inicio de sesión.',
        error
      )

      return {
        exito: false,
        mensaje:
          'Ocurrió un error inesperado al iniciar sesión.',
      }
    } finally {
      setCargando(false)
    }
  }

  /**
   * Finaliza la sesión y actualiza el estado global.
   */
  async function cerrarSesion() {
    setCargando(true)

    try {
      const resultado = await cerrarSesionServicio()

      if (resultado.exito) {
        setUsuario(null)
      }

      return resultado
    } catch (error) {
      console.error(
        'Error durante el cierre de sesión.',
        error
      )

      return {
        exito: false,
        mensaje:
          'Ocurrió un error inesperado al cerrar sesión.',
      }
    } finally {
      setCargando(false)
    }
  }

  /**
   * Ejecuta el registro simulado de un usuario.
   *
   * No inicia sesión automáticamente porque
   * todavía no se crean cuentas reales.
   */
  async function registrarUsuario(datos) {
    setCargando(true)

    try {
      return await registrarUsuarioServicio(datos)
    } catch (error) {
      console.error(
        'Error durante el registro.',
        error
      )

      return {
        exito: false,
        mensaje:
          'Ocurrió un error inesperado durante el registro.',
      }
    } finally {
      setCargando(false)
    }
  }

  /**
   * Información y operaciones disponibles
   * para los componentes consumidores.
   */
  const valorContexto = {
    usuario,
    cargando,
    estaAutenticado,
    esCliente,
    esAdministrador,
    iniciarSesion,
    cerrarSesion,
    registrarUsuario,
  }

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  )
}
