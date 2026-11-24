
/**
 * CF12 - SelectorCantidad
 *
 * Componente reutilizable y controlado que permite
 * incrementar o disminuir la cantidad de un producto,
 * respetando los límites establecidos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number} props.cantidad - Cantidad actual.
 * @param {Function} props.onCambiar - Actualiza la cantidad.
 * @param {number} [props.minimo=1] - Cantidad mínima.
 * @param {number} [props.maximo=99] - Cantidad máxima.
 * @param {boolean} [props.deshabilitado=false] - Desactiva el selector.
 */
function SelectorCantidad({
  cantidad,
  onCambiar,
  minimo = 1,
  maximo = 99,
  deshabilitado = false,
}) {

  // Disminuye la cantidad sin superar el límite inferior.
  function disminuirCantidad() {
    if (!deshabilitado && cantidad > minimo) {
      onCambiar(cantidad - 1)
    }
  }

  // Incrementa la cantidad sin superar el límite superior.
  function aumentarCantidad() {
    if (!deshabilitado && cantidad < maximo) {
      onCambiar(cantidad + 1)
    }
  }

  return (
    <div
      className="selector-cantidad"
      role="group"
      aria-label="Selector de cantidad"
    >

      <button
        type="button"
        className="btn btn-outline-secondary selector-cantidad-boton"
        onClick={disminuirCantidad}
        disabled={deshabilitado || cantidad <= minimo}
        aria-label="Disminuir cantidad"
        title="Disminuir cantidad"
      >
        <i className="bi bi-dash-lg" aria-hidden="true"></i>
      </button>

      <output
        className="selector-cantidad-valor"
        aria-label="Cantidad seleccionada"
        aria-live="polite"
        aria-atomic="true"
      >
        {cantidad}
      </output>

      <button
        type="button"
        className="btn btn-outline-secondary selector-cantidad-boton"
        onClick={aumentarCantidad}
        disabled={deshabilitado || cantidad >= maximo}
        aria-label="Aumentar cantidad"
        title="Aumentar cantidad"
      >
        <i className="bi bi-plus-lg" aria-hidden="true"></i>
      </button>

    </div>
  )
}

export default SelectorCantidad
