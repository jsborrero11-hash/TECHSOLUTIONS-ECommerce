
/**
 * TECHSOLUTIONS E-Commerce
 * CF08 - Componente reutilizable BotonPrimario.
 *
 * Estandariza las acciones principales de la aplicación
 * y permite administrar estados de carga y deshabilitación.
 */

function BotonPrimario({
  children,
  tipo = 'button',
  onClick,
  deshabilitado = false,
  cargando = false,
  textoCarga = 'Procesando...',
  icono,
  anchoCompleto = false,
  className = '',
}) {
  const clases = [
    'btn',
    'btn-primary',
    'boton-primario',
    anchoCompleto ? 'w-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={tipo}
      className={clases}
      onClick={onClick}
      disabled={deshabilitado || cargando}
      aria-busy={cargando}
    >
      {cargando ? (
        <>
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          ></span>

          <span>{textoCarga}</span>
        </>
      ) : (
        <>
          {icono && (
            <i
              className={`bi ${icono}`}
              aria-hidden="true"
            ></i>
          )}

          <span>{children}</span>
        </>
      )}
    </button>
  )
}

export default BotonPrimario
