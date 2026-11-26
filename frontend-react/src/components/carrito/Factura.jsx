import { Link } from 'react-router-dom'
import { formatoMoneda } from '../../utils/formatoMoneda.js'

export default function Factura({ pedido, aviso }) {
  const importes = [
    ['Subtotal', pedido.subtotal],
    ['IVA simulado', pedido.iva],
    ['Envío', pedido.costoEnvio],
    ['Total', pedido.total],
  ]

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <p className="fw-semibold mb-1">Pedido {pedido.id}</p>
        <p className="mb-3">Cliente {pedido.cliente.nombre}</p>
        {aviso && <p className="alert alert-warning" role="alert">{aviso}</p>}

        <ul className="list-group list-group-flush mb-3" aria-label="Productos del pedido">
          {pedido.productos.map(({ id, nombre, cantidad, precio }) => (
            <li key={id} className="list-group-item px-0 d-flex flex-wrap justify-content-between gap-2">
              <span>
                <strong className="d-block">{nombre}</strong>
                {cantidad} × {formatoMoneda(precio)}
              </span>
              <span>{formatoMoneda(cantidad * precio)}</span>
            </li>
          ))}
        </ul>

        <dl className="mb-3">
          {importes.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="d-flex flex-wrap justify-content-between column-gap-3">
              <dt>{etiqueta}</dt>
              <dd>{formatoMoneda(valor)}</dd>
            </div>
          ))}
        </dl>

        <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
      </div>
    </div>
  )
}
