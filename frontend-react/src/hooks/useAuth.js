
/**
 * TECHSOLUTIONS E-Commerce
 * Hook personalizado de autenticación.
 *
 * Facilita el acceso al contexto global
 * desde los componentes de React.
 */

import { useContext } from 'react'

import AuthContext from '../context/AuthContext.js'

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (contexto === null) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.'
    )
  }

  return contexto
}
