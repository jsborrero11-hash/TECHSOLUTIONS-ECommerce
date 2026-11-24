
import { Routes, Route, Link } from 'react-router-dom'

import Layout from '../components/layout/Layout.jsx'
import Inicio from '../pages/Inicio.jsx'
import Catalogo from '../pages/Catalogo.jsx'

/**
 * Componente temporal para las páginas
 * que todavía se encuentran en desarrollo.
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
 * AppRoutes
 * Centraliza las rutas de navegación
 * de TECHSOLUTIONS E-Commerce.
 */
function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>

        {/* Páginas implementadas */}

        <Route
          index
          element={<Inicio />}
        />

        <Route
          path="catalogo"
          element={<Catalogo />}
        />

        {/* Páginas pendientes de implementación */}

        <Route
          path="producto/:id"
          element={
            <PaginaProvisional titulo="Detalle del producto" />
          }
        />

        <Route
          path="login"
          element={
            <PaginaProvisional titulo="Iniciar sesión" />
          }
        />

        <Route
          path="registro"
          element={
            <PaginaProvisional titulo="Registro de usuarios" />
          }
        />

        <Route
          path="carrito"
          element={
            <PaginaProvisional titulo="Carrito de compras" />
          }
        />

        <Route
          path="contacto"
          element={
            <PaginaProvisional titulo="Contacto" />
          }
        />

        {/* Gestión de rutas inexistentes */}

        <Route
          path="*"
          element={
            <PaginaProvisional titulo="Página no encontrada" />
          }
        />

      </Route>

    </Routes>
  )
}

export default AppRoutes
