
import { Routes, Route, Link } from 'react-router-dom'

import Layout from '../components/layout/Layout.jsx'

import Inicio from '../pages/Inicio.jsx'
import Catalogo from '../pages/Catalogo.jsx'
import DetalleProducto from '../pages/DetalleProducto.jsx'

/**
 * Componente temporal para las páginas que todavía
 * se encuentran en proceso de desarrollo.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.titulo - Título de la página.
 */
function PaginaProvisional({ titulo }) {
  return (
    <section className="container py-5 text-center">

      <i
        className="bi bi-tools fs-1 text-primary"
        aria-hidden="true"
      ></i>

      <h1 className="mt-3">{titulo}</h1>

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
 * Configuración centralizada de las rutas
 * de TECHSOLUTIONS E-Commerce.
 *
 * Las páginas comparten la estructura general
 * definida mediante el componente Layout.
 */
function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>

        {/* Página de inicio */}
        <Route
          index
          element={<Inicio />}
        />

        {/* Catálogo de productos */}
        <Route
          path="catalogo"
          element={<Catalogo />}
        />

        {/* Detalle dinámico del producto */}
        <Route
          path="producto/:id"
          element={<DetalleProducto />}
        />

        {/* Inicio de sesión */}
        <Route
          path="login"
          element={
            <PaginaProvisional titulo="Iniciar sesión" />
          }
        />

        {/* Registro de usuarios */}
        <Route
          path="registro"
          element={
            <PaginaProvisional titulo="Registro de usuarios" />
          }
        />

        {/* Carrito de compras */}
        <Route
          path="carrito"
          element={
            <PaginaProvisional titulo="Carrito de compras" />
          }
        />

        {/* Contacto */}
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
