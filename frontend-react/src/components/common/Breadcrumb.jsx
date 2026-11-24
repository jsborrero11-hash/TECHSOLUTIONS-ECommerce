
import { Link } from 'react-router-dom'

/**
 * CF06 - Breadcrumb
 *
 * Componente reutilizable que representa la ubicación
 * actual del usuario dentro de la aplicación y facilita
 * la navegación hacia niveles anteriores.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.elementos - Elementos de navegación.
 * @param {string} props.elementos[].nombre - Texto visible.
 * @param {string} [props.elementos[].ruta] - Ruta de navegación.
 */
function Breadcrumb({ elementos = [] }) {
  return (
    <nav
      className="breadcrumb-navegacion"
      aria-label="Ruta de navegación"
    >
      <ol className="breadcrumb mb-0">

        {elementos.map((elemento, indice) => {
          const esUltimo = indice === elementos.length - 1

          return (
            <li
              key={indice}
              className={`breadcrumb-item${esUltimo ? ' active' : ''}`}
              aria-current={esUltimo ? 'page' : undefined}
            >
              {esUltimo || !elemento.ruta ? (
                <span>{elemento.nombre}</span>
              ) : (
                <Link to={elemento.ruta}>
                  {elemento.ruta === '/' && (
                    <i
                      className="bi bi-house-door me-1"
                      aria-hidden="true"
                    ></i>
                  )}

                  {elemento.nombre}
                </Link>
              )}
            </li>
          )
        })}

      </ol>
    </nav>
  )
}

export default Breadcrumb
