
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
  Link,
} from 'react-router-dom'

import Layout from '../components/layout/Layout.jsx'

import Inicio from '../pages/Inicio.jsx'
import Catalogo from '../pages/Catalogo.jsx'
import DetalleProducto from '../pages/DetalleProducto.jsx'
import Login from '../pages/Login.jsx'
import Registro from '../pages/Registro.jsx'

import RutaProtegida from './RutaProtegida.jsx'

import { ROLES } from '../services/authService.js'

/**
 * Presenta las secciones que todavía
 * se encuentran en desarrollo.
 */
function PaginaProvisional({ titulo }) {
  return (
    <section className="container py-5 text-center">

      <i
        className="bi bi-tools fs-1 text-primary"
        aria-hidden="true"
      ></i>

      <h1 className="mt-3">
        {titulo}
      </h1>

      <p className="texto-secundario">
        Esta sección se encuentra en desarrollo.
      </p>

      <Link
        to="/"
        className="btn btn-primary mt-3"
      >
        Volver al inicio
      </Link>

    </section>
  )
}

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
          element={
            <PaginaProvisional titulo="Contacto" />
          }
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
            element={
              <PaginaProvisional
                titulo="Carrito de compras"
              />
            }
          />

          <Route
            path="cliente"
            element={
              <PaginaProvisional
                titulo="Panel del cliente"
              />
            }
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
            element={
              <PaginaProvisional
                titulo="Panel de administración"
              />
            }
          />

        </Route>

        {/* Ruta para páginas no encontradas */}

        <Route
          path="*"
          element={
            <PaginaProvisional
              titulo="Página no encontrada"
            />
          }
        />

      </Route>

    </Routes>
  )
}

export default AppRoutes
