
/**
 * CF20 - FiltroCategorias
 * Componente controlado que permite seleccionar
 * una categoría del catálogo de productos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.categorias - Categorías disponibles.
 * @param {string} props.categoriaSeleccionada - Categoría actual.
 * @param {Function} props.onFiltrar - Actualiza la categoría.
 */
function FiltroCategorias({
  categorias,
  categoriaSeleccionada,
  onFiltrar
}) {
  return (
    <div className="filtro-categorias">

      <label
        htmlFor="filtro-categorias"
        className="form-label fw-semibold"
      >
        Filtrar por categoría
      </label>

      <div className="input-group">

        <span className="input-group-text filtro-icono">
          <i
            className="bi bi-funnel"
            aria-hidden="true"
          ></i>
        </span>

        <select
          id="filtro-categorias"
          className="form-select"
          value={categoriaSeleccionada}
          onChange={evento => onFiltrar(evento.target.value)}
        >

          <option value="">
            Todas las categorías
          </option>

          {categorias.map(categoria => (
            <option
              key={categoria}
              value={categoria}
            >
              {categoria}
            </option>
          ))}

        </select>

      </div>

    </div>
  )
}

export default FiltroCategorias
