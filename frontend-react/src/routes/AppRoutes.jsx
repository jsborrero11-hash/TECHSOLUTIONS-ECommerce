import { Routes, Route, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import Inicio from '../pages/Inicio.jsx'

/**
 * Página provisional para las interfaces
 * que se encuentran pendientes de implementación.
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

      <Link to="/" className="btn btn-primary mt-3">
        Volver al inicio
      </Link>
    </section>
  )
}

/**
 * Configuración centralizada de las rutas
 * de TECHSOLUTIONS E-Commerce.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        <Route index element={<Inicio />} />

        <Route
          path="catalogo"
          element={<PaginaProvisional titulo="Catálogo de productos" />}
        />

        <Route
          path="producto/:id"
          element={<PaginaProvisional titulo="Detalle del producto" />}
        />

        <Route
          path="login"
          element={<PaginaProvisional titulo="Iniciar sesión" />}
        />

        <Route
          path="registro"
          element={<PaginaProvisional titulo="Registro de usuarios" />}
        />

        <Route
          path="carrito"
          element={<PaginaProvisional titulo="Carrito de compras" />}
        />

        <Route
          path="contacto"
          element={<PaginaProvisional titulo="Contacto" />}
        />

        <Route
          path="*"
          element={<PaginaProvisional titulo="Página no encontrada" />}
        />

      </Route>
    </Routes>
  )
}

export default AppRoutes