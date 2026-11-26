import { useState } from 'react'

const campos = [
  ['nombre', 'Nombre completo', 'text'],
  ['correo', 'Correo electrónico', 'email'],
  ['asunto', 'Asunto', 'text'],
  ['mensaje', 'Mensaje', 'textarea'],
]

export default function Contacto() {
  const [confirmado, setConfirmado] = useState(false)

  function enviar(evento) {
    evento.preventDefault()
    evento.currentTarget.reset()
    setConfirmado(true)
  }

  return (
    <section className="container py-5" aria-labelledby="titulo-contacto">
      <h1 id="titulo-contacto">Contacto</h1>
      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-7">
          <form className="card card-body" onSubmit={enviar}
            onReset={evento => {
              for (const campo of evento.currentTarget.elements) {
                campo.setCustomValidity('')
              }
              setConfirmado(false)
            }}
            onChange={() => setConfirmado(false)}>
            <h2 className="h4">Escríbenos</h2>
            <p className="texto-secundario">Formulario de demostración. Todos los campos son obligatorios.</p>
            {campos.map(([nombre, etiqueta, tipo]) => {
              const propiedades = {
                id: `contacto-${nombre}`, name: nombre, className: 'form-control', required: true,
                onInput: evento => {
                  const campo = evento.currentTarget
                  campo.setCustomValidity(campo.value && !campo.value.trim() ? 'Completa este campo.' : '')
                },
              }
              return (
                <div className="mb-3" key={nombre}>
                  <label className="form-label" htmlFor={propiedades.id}>{etiqueta}</label>
                  {tipo === 'textarea' ? <textarea {...propiedades} rows={5} /> : <input {...propiedades} type={tipo} />}
                </div>
              )
            })}
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit">Enviar mensaje</button>
              <button className="btn btn-outline-secondary" type="reset">Limpiar</button>
            </div>
            <div role="status">{confirmado && <p className="alert alert-success mt-3 mb-0">Envío simulado completado.</p>}</div>
          </form>
        </div>
        <aside className="col-12 col-lg-5">
          <div className="card card-body">
            <h2 className="h4">Información de contacto</h2>
            <address className="mb-0">
              Bogotá D.C., Colombia<br />
              +57 300 123 4567<br />
              <span className="text-break">contacto@techsolutions.com</span><br />
              Lunes a viernes, 8:00 a. m.–6:00 p. m.
            </address>
          </div>
        </aside>
      </div>
    </section>
  )
}
