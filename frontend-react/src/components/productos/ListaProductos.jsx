
import ProductoCard from './ProductoCard.jsx'

/**
 * CF22 - ListaProductos
 * Presenta los productos disponibles después de aplicar
 * las condiciones de búsqueda y filtrado del catálogo.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.productos - Productos encontrados.
 * @param {number} props.totalProductos - Total del catálogo.
 * @param {Function} props.onLimpiarFiltros - Restablece los filtros.
 */
function ListaProductos({
  productos,
  totalProductos,
  onLimpiarFiltros
}) {
  return (
    <section
      className="lista-productos"
      aria-labelledby="titulo-resultados"
    >

      <div className="resultados-productos mb-4">

        <h2
          id="titulo-resultados"
          className="resultados-titulo"
        >
          Resultados del catálogo
        </h2>

        <p
          className="resultados-cantidad mb-0"
          role="status"
        >
          {productos.length} de {totalProductos} productos encontrados
        </p>

      </div>

      {productos.length > 0 ? (

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

          {productos.map(producto => (
            <div className="col" key={producto.id}>

              <ProductoCard producto={producto} />

            </div>
          ))}

        </div>

      ) : (

        <div className="productos-sin-resultados text-center">

          <i
            className="bi bi-search sin-resultados-icono"
            aria-hidden="true"
          ></i>

          <h3>No se encontraron productos</h3>

          <p className="texto-secundario">
            Intenta realizar otra búsqueda o selecciona
            una categoría diferente.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onLimpiarFiltros}
          >
            <i
              className="bi bi-arrow-counterclockwise me-2"
              aria-hidden="true"
            ></i>
            Limpiar filtros
          </button>

        </div>

      )}

    </section>
  )
}

export default ListaProductos
