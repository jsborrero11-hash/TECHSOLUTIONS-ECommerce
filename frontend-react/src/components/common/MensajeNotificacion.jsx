
/**
 * TECHSOLUTIONS E-Commerce
 * CF10 - Componente reutilizable MensajeNotificacion.
 *
 * Presenta mensajes de éxito, error,
 * advertencia e información.
 */

const CONFIGURACION_MENSAJES = {
  exito: {
    variante: 'success',
    icono: 'bi-check-circle-fill',
    titulo: 'Operación exitosa',
  },

  error: {
    variante: 'danger',
    icono: 'bi-exclamation-circle-fill',
    titulo: 'Error',
  },

  advertencia: {
    variante: 'warning',
    icono: 'bi-exclamation-triangle-fill',
    titulo: 'Advertencia',
  },

  informacion: {
    variante: 'info',
    icono: 'bi-info-circle-fill',
    titulo: 'Información',
  },
}

function MensajeNotificacion({
  tipo = 'informacion',
  titulo,
  mensaje,
  onCerrar,
  className = '',
}) {
  if (!mensaje) {
    return null
  }

  const configuracion =
    Object.hasOwn(CONFIGURACION_MENSAJES, tipo)
      ? CONFIGURACION_MENSAJES[tipo]
      : CONFIGURACION_MENSAJES.informacion

  const esUrgente =
    tipo === 'error' || tipo === 'advertencia'

  const clases = [
    'alert',
    `alert-${configuracion.variante}`,
    'mensaje-notificacion',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={clases}
      role={esUrgente ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <i
        className={`bi ${configuracion.icono} mensaje-notificacion-icono`}
        aria-hidden="true"
      ></i>

      <div className="mensaje-notificacion-contenido">
        <p className="mensaje-notificacion-titulo">
          {titulo || configuracion.titulo}
        </p>

        <p className="mensaje-notificacion-texto">
          {mensaje}
        </p>
      </div>

      {typeof onCerrar === 'function' && (
        <button
          type="button"
          className="btn-close mensaje-notificacion-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar notificación"
        ></button>
      )}
    </div>
  )
}

export default MensajeNotificacion
