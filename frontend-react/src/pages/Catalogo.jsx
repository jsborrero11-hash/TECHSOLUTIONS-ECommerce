
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { productos, categorias } from '../data/productos.js'

import BuscadorProductos from '../components/productos/BuscadorProductos.jsx'
import FiltroCategorias from '../components/productos/FiltroCategorias.jsx'
import ListaProductos from '../components/productos/ListaProductos.jsx'

/**
 * Normaliza un texto para realizar búsquedas
 * sin distinguir mayúsculas, minúsculas ni tildes.
 *
 * @param {string} texto - Texto que se desea normalizar.
 * @returns {string} Texto normalizado.
 */
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * CF18 - Catalogo
 * Página encargada de presentar, buscar y filtrar
 * los productos de TECHSOLUTIONS E-Commerce.
 *
 * Integra los componentes BuscadorProductos,
 * FiltroCategorias y ListaProductos.
 */
function Catalogo() {

  // Estado del texto de búsqueda.
  const [busqueda, setBusqueda] = useState('')

  // Parámetros de navegación de la URL.
  const [searchParams, setSearchParams] = useSearchParams()

  // Recupera la categoría seleccionada desde la URL.
  const categoriaURL = searchParams.get('categoria') || ''

  // Verifica que la categoría recibida sea válida.
  const categoriaSeleccionada = categorias.includes(categoriaURL)
    ? categoriaURL
    : ''

  // Normaliza el texto ingresado por el usuario.
  const busquedaNormalizada = normalizarTexto(busqueda)

  /**
   * Actualiza el filtro de categoría y sincroniza
   * su valor con los parámetros de la URL.
   */
  function cambiarCategoria(categoria) {
    const nuevosParametros = new URLSearchParams(searchParams)

    if (categoria) {
      nuevosParametros.set('categoria', categoria)
    } else {
      nuevosParametros.delete('categoria')
    }

    setSearchParams(nuevosParametros)
  }

  /**
   * Restablece el buscador y el filtro de categoría.
   */
  function limpiarFiltros() {
    setBusqueda('')

    const nuevosParametros = new URLSearchParams(searchParams)

    nuevosParametros.delete('categoria')

    setSearchParams(nuevosParametros)
  }

  // Aplica simultáneamente la búsqueda y la categoría.
  const productosFiltrados = productos.filter(producto => {

    const textoProducto = normalizarTexto(
      `${producto.nombre} ${producto.categoria} ${producto.descripcion}`
    )

    const coincideBusqueda = textoProducto.includes(
      busquedaNormalizada
    )

    const coincideCategoria =
      categoriaSeleccionada === '' ||
      producto.categoria === categoriaSeleccionada

    return coincideBusqueda && coincideCategoria
  })

  // Identifica si existen filtros aplicados.
  const hayFiltros =
    busqueda !== '' || categoriaURL !== ''

  return (
    <section
      className="pagina-catalogo py-5"
      aria-labelledby="titulo-catalogo"
    >

      <div className="container">

        {/* Encabezado del catálogo */}

        <div className="catalogo-encabezado text-center mb-4">

          <h1 id="titulo-catalogo">
            Catálogo de productos
          </h1>

          <p className="texto-secundario">
            Encuentra los productos tecnológicos
            que necesitas.
          </p>

        </div>

        {/* Buscador y filtro de categorías */}

        <div className="catalogo-filtros mb-5">

          <div className="row g-3 align-items-end">

            <div className="col-12 col-lg-6">

              <BuscadorProductos
                busqueda={busqueda}
                onBuscar={setBusqueda}
              />

            </div>

            <div className="col-12 col-md-8 col-lg-4">

              <FiltroCategorias
                categorias={categorias}
                categoriaSeleccionada={categoriaSeleccionada}
                onFiltrar={cambiarCategoria}
              />

            </div>

            <div className="col-12 col-md-4 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-secondary btn-limpiar-filtros w-100"
                onClick={limpiarFiltros}
                disabled={!hayFiltros}
              >

                <i
                  className="bi bi-arrow-counterclockwise me-2"
                  aria-hidden="true"
                ></i>

                Limpiar filtros

              </button>

            </div>

          </div>

        </div>

        {/* Resultados del catálogo */}

        <ListaProductos
          productos={productosFiltrados}
          totalProductos={productos.length}
          onLimpiarFiltros={limpiarFiltros}
        />

      </div>

    </section>
  )
}

export default Catalogo
