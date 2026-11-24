import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/**
 * CF02 - Layout
 * Estructura general de TECHSOLUTIONS E-Commerce.
 * Integra los componentes comunes y permite mostrar
 * dinámicamente el contenido de cada ruta.
 */
function Layout() {
  return (
    <div className="app">

      {/* Encabezado principal */}
      <Header />

      {/* Menú de navegación */}
      <Navbar />

      {/* Contenido dinámico de cada página */}
      <main
        id="contenido-principal"
        className="contenido-principal"
      >
        <Outlet />
      </main>

      {/* Pie de página */}
      <Footer />

    </div>
  )
}

export default Layout