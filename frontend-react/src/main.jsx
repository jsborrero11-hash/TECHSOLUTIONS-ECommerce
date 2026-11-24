import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Tipografía principal de TECHSOLUTIONS
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

// Estilos e iconografía de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Funcionalidades interactivas de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Estilos personalizados de la aplicación
import './index.css'

// Componente principal
import App from './App.jsx'

// Punto de entrada de TECHSOLUTIONS E-Commerce
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)