
/**
 * CF19 - BuscadorProductos
 * Componente controlado para capturar el texto
 * de búsqueda del catálogo de productos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.busqueda - Texto de búsqueda actual.
 * @param {Function} props.onBuscar - Actualiza la búsqueda.
 */
function BuscadorProductos({ busqueda, onBuscar }) {
  return (
    <div className="buscador-productos">

      <label
        htmlFor="busqueda-productos"
        className="form-label fw-semibold"
      >
        Buscar productos
      </label>

      <div className="input-group">

        <span className="input-group-text buscador-icono">
          <i
            className="bi bi-search"
            aria-hidden="true"
          ></i>
        </span>

        <input
          type="search"
          id="busqueda-productos"
          className="form-control"
          placeholder="Buscar por nombre, categoría o descripción..."
          value={busqueda}
          onChange={evento => onBuscar(evento.target.value)}
          autoComplete="off"
        />

        {busqueda !== '' && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onBuscar('')}
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
          >
            <i
              className="bi bi-x-lg"
              aria-hidden="true"
            ></i>
          </button>
        )}

      </div>

    </div>
  )
}

export default BuscadorProductos
