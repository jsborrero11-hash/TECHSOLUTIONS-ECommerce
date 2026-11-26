
/**
 * TECHSOLUTIONS E-Commerce
 * Configuración de rutas de la aplicación.
 *
 * Integra las páginas públicas, las páginas
 * de autenticación y las rutas protegidas.
 */

import {
  Routes,
  Route,
} from 'react-router-dom'

import Layout from '../components/layout/Layout.jsx'

import Inicio from '../pages/Inicio.jsx'
import Catalogo from '../pages/Catalogo.jsx'
import DetalleProducto from '../pages/DetalleProducto.jsx'
import Login from '../pages/Login.jsx'
import Registro from '../pages/Registro.jsx'
import Carrito from '../pages/Carrito.jsx'
import Contacto from '../pages/Contacto.jsx'
import PanelCliente from '../pages/PanelCliente.jsx'
import PanelAdministrador from '../pages/PanelAdministrador.jsx'
import NoEncontrada from '../pages/NoEncontrada.jsx'

import RutaProtegida from './RutaProtegida.jsx'

import { ROLES } from '../services/authService.js'

/**
 * Define las rutas públicas y protegidas.
 */
function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>

        {/* Rutas públicas */}

        <Route
          index
          element={<Inicio />}
        />

        <Route
          path="catalogo"
          element={<Catalogo />}
        />

        <Route
          path="producto/:id"
          element={<DetalleProducto />}
        />

        <Route
          path="contacto"
          element={<Contacto />}
        />

        {/* Rutas de autenticación */}

        <Route
          path="login"
          element={<Login />}
        />

        <Route
          path="registro"
          element={<Registro />}
        />

        {/* Rutas exclusivas del cliente */}

        <Route
          element={
            <RutaProtegida
              rolesPermitidos={[ROLES.CLIENTE]}
            />
          }
        >

          <Route
            path="carrito"
            element={<Carrito />}
          />

          <Route
            path="cliente"
            element={<PanelCliente />}
          />

        </Route>

        {/* Rutas exclusivas del administrador */}

        <Route
          element={
            <RutaProtegida
              rolesPermitidos={[ROLES.ADMIN]}
            />
          }
        >

          <Route
            path="admin"
            element={<PanelAdministrador />}
          />

        </Route>

        {/* Ruta para páginas no encontradas */}

        <Route
          path="*"
          element={<NoEncontrada />}
        />

      </Route>

    </Routes>
  )
}

export default AppRoutes
