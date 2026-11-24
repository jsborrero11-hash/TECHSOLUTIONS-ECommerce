
import Banner from '../components/inicio/Banner.jsx'
import Categorias from '../components/inicio/Categorias.jsx'
import ProductosDestacados from '../components/inicio/ProductosDestacados.jsx'

/**
 * CF14 - Inicio
 * Página principal de TECHSOLUTIONS E-Commerce.
 *
 * Integra los componentes de presentación comercial,
 * categorías y productos destacados de la tienda.
 *
 * Los componentes generales Header, Navbar y Footer
 * son administrados por Layout.
 */
function Inicio() {
  return (
    <>
      <Banner />
      <Categorias />
      <ProductosDestacados />
    </>
  )
}

export default Inicio
