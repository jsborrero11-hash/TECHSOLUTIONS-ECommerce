
/**
 * TECHSOLUTIONS E-Commerce
 * CF07 - Componente RutaProtegida.
 *
 * Controla la navegación según el estado
 * de autenticación y el rol del usuario.
 *
 * Este control corresponde únicamente al frontend.
 */

import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth.js'

import {
  obtenerRutaPorRol,
} from '../services/authService.js'

function RutaProtegida({
  rolesPermitidos = [],
  children,
}) {
  const {
    usuario,
    estaAutenticado,
  } = useAuth()

  /**
   * Redirige a Login cuando no existe
   * una sesión activa.
   */
  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  /**
   * Redirige al panel correspondiente
   * cuando el usuario no tiene el rol permitido.
   */
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario.rol)
  ) {
    return (
      <Navigate
        to={obtenerRutaPorRol(usuario.rol)}
        replace
      />
    )
  }

  /**
   * Permite visualizar el contenido autorizado.
   */
  return children ?? <Outlet />
}

export default RutaProtegida
