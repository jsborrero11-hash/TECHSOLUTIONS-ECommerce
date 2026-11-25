
/**
 * TECHSOLUTIONS E-Commerce
 * Contexto global de autenticación.
 *
 * Define el contexto utilizado para compartir
 * el estado de autenticación entre componentes.
 */

import { createContext } from 'react'

const AuthContext = createContext(null)

export default AuthContext
