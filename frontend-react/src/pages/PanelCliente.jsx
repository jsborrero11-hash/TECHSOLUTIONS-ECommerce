import { useState } from 'react'
import { Link } from 'react-router-dom'
import Factura from '../components/carrito/Factura.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { consultarPedidos } from '../services/pedidosService.js'
import { formatoMoneda } from '../utils/formatoMoneda.js'

const secciones = ['Mi perfil', 'Mis pedidos', 'Mis favoritos', 'Configuración']

export default function PanelCliente() {
  const { usuario } = useAuth()
  const [lectura] = useState(() => consultarPedidos(usuario.id))
  const [seccion, setSeccion] = useState('Mis pedidos')
  const [pedidoAbierto, setPedidoAbierto] = useState(null)

  return (
    <section className="container py-5" aria-labelledby="titulo-cliente">
      <h1 id="titulo-cliente" className="mb-2">Panel del cliente</h1>
      <p className="texto-secundario">Hola, {usuario.nombre}.</p>
      <div className="row g-4">
        <nav className="col-12 col-lg-3" aria-label="Secciones de la cuenta">
          <div className="list-group">
            {secciones.map(nombre => (
              <button key={nombre} type="button"
                className={`list-group-item list-group-item-action ${seccion === nombre ? 'active' : ''}`}
                aria-pressed={seccion === nombre}
                onClick={() => { setSeccion(nombre); setPedidoAbierto(null) }}>
                {nombre}
              </button>
            ))}
          </div>
        </nav>
        <div className="col-12 col-lg-9">
          {lectura.exito && (
            <div className="card card-body mb-3">
              <strong className="h4">{lectura.pedidos.length}</strong>
              <span>Pedidos registrados en este navegador</span>
            </div>
          )}
          <section className="card card-body" aria-labelledby="seccion-cliente">
            <h2 id="seccion-cliente" className="h4">{seccion}</h2>
            {seccion === 'Mi perfil' && (
              <dl className="mb-0">
                <dt>Nombre</dt><dd>{usuario.nombre}</dd>
                <dt>Correo electrónico</dt><dd className="text-break">{usuario.correo}</dd>
              </dl>
            )}
            {seccion === 'Mis pedidos' && (
              !lectura.exito ? <p role="alert" className="mb-0">{lectura.mensaje}</p> :
                lectura.pedidos.length === 0 ? (
                  <div><p>Todavía no tienes pedidos.</p><Link to="/catalogo">Explorar catálogo</Link></div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {lectura.pedidos.map(pedido => (
                      <li key={pedido.id} className="list-group-item px-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <span>Pedido {pedido.id} · {formatoMoneda(pedido.total)}</span>
                          <button className="btn btn-outline-primary" type="button"
                            aria-expanded={pedidoAbierto === pedido.id}
                            aria-controls={`pedido-${pedido.id}`}
                            onClick={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}>
                            {pedidoAbierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'} del pedido {pedido.id}
                          </button>
                        </div>
                        <div id={`pedido-${pedido.id}`} className="mt-3" hidden={pedidoAbierto !== pedido.id}>
                          {pedidoAbierto === pedido.id && <Factura pedido={pedido} />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
            )}
            {seccion === 'Mis favoritos' && <p className="mb-0">No hay favoritos. Esta sección es de demostración.</p>}
            {seccion === 'Configuración' && <p className="mb-0">Las preferencias de la cuenta se muestran en la versión de demostración sin edición.</p>}
          </section>
        </div>
      </div>
    </section>
  )
}
