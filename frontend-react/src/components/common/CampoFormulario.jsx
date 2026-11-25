
/**
 * TECHSOLUTIONS E-Commerce
 * CF09 - Componente reutilizable CampoFormulario.
 *
 * Centraliza la presentación de etiquetas, campos,
 * mensajes de ayuda y errores de validación.
 */

import { useId, useState } from 'react'

function CampoFormulario({
  id,
  nombre,
  etiqueta,
  tipo = 'text',
  valor = '',
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  ayuda = '',
  requerido = false,
  deshabilitado = false,
  soloLectura = false,
  autoComplete,
  inputMode,
  maxLength,
  minLength,
  icono,
  className = '',
}) {
  const idGenerado = useId()

  const idCampo = id || idGenerado

  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`

  const [mostrarContrasena, setMostrarContrasena] =
    useState(false)

  const esContrasena = tipo === 'password'

  const tipoCampo =
    esContrasena && mostrarContrasena
      ? 'text'
      : tipo

  const tieneGrupo = Boolean(icono) || esContrasena

  const descripcionCampo = [
    ayuda ? idAyuda : '',
    error ? idError : '',
  ]
    .filter(Boolean)
    .join(' ')

  /**
   * Alterna la visibilidad de la contraseña.
   */
  function alternarContrasena() {
    setMostrarContrasena(
      (estadoAnterior) => !estadoAnterior
    )
  }

  const campo = (
    <input
      id={idCampo}
      name={nombre}
      type={tipoCampo}
      className={`form-control campo-formulario-input${
        error ? ' is-invalid' : ''
      }`}
      value={valor}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={requerido}
      disabled={deshabilitado}
      readOnly={soloLectura}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      minLength={minLength}
      aria-invalid={Boolean(error)}
      aria-describedby={
        descripcionCampo || undefined
      }
    />
  )

  return (
    <div className={`campo-formulario ${className}`}>
      <label
        htmlFor={idCampo}
        className="form-label campo-formulario-etiqueta"
      >
        {etiqueta}

        {requerido && (
          <span
            className="campo-formulario-obligatorio ms-1"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {tieneGrupo ? (
        <div className="input-group">
          {icono && (
            <span
              className="input-group-text campo-formulario-icono"
              aria-hidden="true"
            >
              <i className={`bi ${icono}`}></i>
            </span>
          )}

          {campo}

          {esContrasena && (
            <button
              type="button"
              className="btn btn-outline-secondary campo-formulario-visibilidad"
              onClick={alternarContrasena}
              disabled={deshabilitado}
              aria-label={
                mostrarContrasena
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
              title={
                mostrarContrasena
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              <i
                className={`bi ${
                  mostrarContrasena
                    ? 'bi-eye-slash'
                    : 'bi-eye'
                }`}
                aria-hidden="true"
              ></i>
            </button>
          )}
        </div>
      ) : (
        campo
      )}

      {ayuda && (
        <div
          id={idAyuda}
          className="form-text campo-formulario-ayuda"
        >
          {ayuda}
        </div>
      )}

      {error && (
        <div
          id={idError}
          className="invalid-feedback d-block campo-formulario-error"
        >
          <i
            className="bi bi-exclamation-circle me-1"
            aria-hidden="true"
          ></i>

          {error}
        </div>
      )}
    </div>
  )
}

export default CampoFormulario
