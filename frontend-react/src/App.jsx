
/**
 * TECHSOLUTIONS E-Commerce
 * Componente principal de la aplicación.
 *
 * Integra los proveedores globales y
 * el sistema de navegación del frontend.
 */

import './App.css'

import AppRoutes from './routes/AppRoutes.jsx'

import { AuthProvider } from './context/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
