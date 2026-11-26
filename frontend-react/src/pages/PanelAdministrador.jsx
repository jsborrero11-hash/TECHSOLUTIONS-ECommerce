import { useState } from 'react'
import { categorias, productos } from '../data/productos.js'
import { formatoMoneda } from '../utils/formatoMoneda.js'

const estados = ['Pendiente', 'En proceso', 'Enviado', 'Entregado']
const secciones = ['Productos', 'Categorías', 'Pedidos']

export default function PanelAdministrador() {
  const [articulos, setArticulos] = useState(productos)
  const [seccion, setSeccion] = useState('Productos')
  const [estado, setEstado] = useState(estados[0])
  const [mensaje, setMensaje] = useState('')

  function agregar(evento) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const nombre = datos.get('nombre').trim()
    const categoria = datos.get('categoria')
    const precio = Number(datos.get('precio'))
    if (!nombre || !categorias.includes(categoria) || !Number.isFinite(precio) || precio <= 0) {
      setMensaje('Ingresa un nombre, una categoría y un precio mayor que cero.')
      return
    }
    setArticulos(lista => [
      ...lista,
      { id: Math.max(0, ...lista.map(producto => producto.id)) + 1, nombre, categoria, precio },
    ])
    evento.currentTarget.reset()
    setMensaje('Producto agregado en la demostración.')
  }

  function eliminar(id) {
    setArticulos(lista => lista.filter(producto => producto.id !== id))
    setMensaje('Producto eliminado en la demostración.')
  }

  return (
    <section className="container py-5" aria-labelledby="titulo-admin">
      <h1 id="titulo-admin">Panel de administración</h1>
      <p className="texto-secundario">Panel de demostración. Los cambios se conservan mientras esta página permanece abierta.</p>
      <dl className="row row-cols-2 row-cols-lg-4 g-3">
        {[
          ['Productos', articulos.length], ['Categorías', categorias.length],
          ['Pedidos de ejemplo', 1], ['Usuarios', 'Sin datos'],
        ].map(([etiqueta, valor]) => (
          <div className="col" key={etiqueta}>
            <div className="card card-body h-100"><dt>{etiqueta}</dt><dd className="h4 mb-0">{valor}</dd></div>
          </div>
        ))}
      </dl>
      <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Secciones de administración">
        {secciones.map(nombre => (
          <button key={nombre} type="button" aria-pressed={seccion === nombre}
            className={`btn ${seccion === nombre ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setSeccion(nombre); setMensaje('') }}>{nombre}</button>
        ))}
      </div>
      <section className="card card-body" aria-labelledby="gestion-admin">
        <h2 className="h4" id="gestion-admin">Gestión de {seccion.toLowerCase()}</h2>
        <div role="status">{mensaje && <p className="alert alert-info">{mensaje}</p>}</div>
        {seccion === 'Productos' && <>
          <form className="row g-3 mb-4" onSubmit={agregar}>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="admin-nombre">Nombre del producto</label>
              <input className="form-control" id="admin-nombre" name="nombre" required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="admin-categoria">Categoría</label>
              <select className="form-select" id="admin-categoria" name="categoria" required defaultValue="">
                <option value="" disabled>Selecciona una categoría</option>
                {categorias.map(categoria => <option key={categoria}>{categoria}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="admin-precio">Precio</label>
              <input className="form-control" id="admin-precio" name="precio" type="number" min="1" required />
            </div>
            <div className="col-12"><button className="btn btn-primary" type="submit">Agregar producto</button></div>
          </form>
          {articulos.length === 0 && <p>No hay productos de demostración.</p>}
          <ul className="list-group list-group-flush">
            {articulos.map(({ id, nombre, categoria, precio }) => (
              <li className="list-group-item px-0 d-flex flex-wrap align-items-center justify-content-between gap-2" key={id}>
                <div className="text-break"><strong>{nombre}</strong><br />{categoria} · {formatoMoneda(precio)}</div>
                <button type="button" className="btn btn-sm btn-outline-danger"
                  aria-label={`Eliminar ${nombre}`} onClick={() => eliminar(id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </>}
        {seccion === 'Categorías' && (
          <ul className="list-group list-group-flush">
            {categorias.map(categoria => (
              <li className="list-group-item px-0" key={categoria}>
                {categoria} · {articulos.filter(producto => producto.categoria === categoria).length} productos
              </li>
            ))}
          </ul>
        )}
        {seccion === 'Pedidos' && (
          <div>
            <p>Pedido de ejemplo</p>
            <label className="form-label" htmlFor="admin-estado">Estado del pedido</label>
            <select className="form-select w-auto" id="admin-estado" value={estado}
              onChange={evento => { setEstado(evento.target.value); setMensaje('Estado actualizado en la demostración.') }}>
              {estados.map(opcion => <option key={opcion}>{opcion}</option>)}
            </select>
          </div>
        )}
      </section>
    </section>
  )
}
