
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { productos } from '../data/productos.js'
import { formatoMoneda } from '../utils/formatoMoneda.js'

import Breadcrumb from '../components/common/Breadcrumb.jsx'
import SelectorCantidad from '../components/common/SelectorCantidad.jsx'

// Límites temporales para la selección de cantidades.
// Posteriormente se utilizará el inventario real.
const CANTIDAD_MINIMA = 1
const CANTIDAD_MAXIMA = 99

/**
 * Presenta la información del producto encontrado
 * y administra la cantidad seleccionada.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.producto - Producto seleccionado.
 */
function InformacionProducto({ producto }) {

  const [cantidad, setCantidad] = useState(CANTIDAD_MINIMA)

  // Calcula el importe según la cantidad seleccionada.
  const importe = producto.precio * cantidad

  return (
    <section
      className="pagina-detalle-producto py-5"
      aria-labelledby="titulo-detalle-producto"
    >
      <div className="container">

        {/* Ruta de navegación */}

        <Breadcrumb
          elementos={[
            { nombre: 'Inicio', ruta: '/' },
            { nombre: 'Catálogo', ruta: '/catalogo' },
            { nombre: producto.nombre },
          ]}
        />

        <div className="row g-4 g-lg-5 align-items-start">

          {/* Imagen del producto */}

          <div className="col-12 col-lg-6">

            <div className="detalle-imagen-contenedor">

              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="detalle-imagen"
              />

            </div>

          </div>

          {/* Información del producto */}

          <div className="col-12 col-lg-6">

            <div className="detalle-informacion">

              <p className="detalle-categoria">
                <i
                  className="bi bi-tag me-2"
                  aria-hidden="true"
                ></i>
                {producto.categoria}
              </p>

              <h1
                id="titulo-detalle-producto"
                className="detalle-nombre"
              >
                {producto.nombre}
              </h1>

              <p className="detalle-precio">
                {formatoMoneda(producto.precio)}
              </p>

              <p className="detalle-precio-etiqueta">
                Precio por unidad
              </p>

              {/* Descripción */}

              <div className="detalle-descripcion">

                <h2>Descripción del producto</h2>

                <p>{producto.descripcion}</p>

              </div>

              <hr className="detalle-separador" />

              {/* Selección de cantidad */}

              <div className="detalle-cantidad">

                <h2>Cantidad</h2>

                <SelectorCantidad
                  cantidad={cantidad}
                  onCambiar={setCantidad}
                  minimo={CANTIDAD_MINIMA}
                  maximo={CANTIDAD_MAXIMA}
                />

              </div>

              {/* Importe calculado dinámicamente */}

              <div className="detalle-importe">

                <p className="detalle-importe-etiqueta">
                  Importe seleccionado
                </p>

                <p
                  className="detalle-importe-valor"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatoMoneda(importe)}
                </p>

                <p className="detalle-importe-cantidad">
                  {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                </p>

              </div>

              {/* Acciones pendientes de integración */}

              <div className="detalle-acciones d-grid gap-3">

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled
                  aria-describedby="aviso-acciones-compra"
                >
                  <i
                    className="bi bi-cart-plus me-2"
                    aria-hidden="true"
                  ></i>
                  Agregar al carrito
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  disabled
                  aria-describedby="aviso-acciones-compra"
                >
                  <i
                    className="bi bi-bag-check me-2"
                    aria-hidden="true"
                  ></i>
                  Comprar ahora
                </button>

              </div>

              {/* Aviso temporal del proceso de compra */}

              <div
                id="aviso-acciones-compra"
                className="detalle-aviso"
              >
                <i
                  className="bi bi-info-circle"
                  aria-hidden="true"
                ></i>

                <p>
                  Las opciones de compra estarán disponibles
                  cuando se complete la integración del
                  carrito de compras.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Regresar al catálogo */}

        <div className="detalle-navegacion mt-4">

          <Link
            to="/catalogo"
            className="btn btn-outline-secondary"
          >
            <i
              className="bi bi-arrow-left me-2"
              aria-hidden="true"
            ></i>
            Volver al catálogo
          </Link>

        </div>

      </div>
    </section>
  )
}

/**
 * CF23 - DetalleProducto
 *
 * Página dinámica que recupera el identificador
 * del producto desde la URL, consulta los datos
 * disponibles y gestiona productos inexistentes.
 */
function DetalleProducto() {

  // Recupera el parámetro dinámico de la ruta.
  const { id } = useParams()

  // Busca el producto correspondiente al identificador.
  const producto = productos.find(
    elemento => String(elemento.id) === id
  )

  // Gestiona identificadores inexistentes o inválidos.
  if (!producto) {
    return (
      <section
        className="pagina-detalle-producto py-5"
        aria-labelledby="titulo-producto-no-encontrado"
      >
        <div className="container">

          <Breadcrumb
            elementos={[
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Catálogo', ruta: '/catalogo' },
              { nombre: 'Producto no encontrado' },
            ]}
          />

          <div className="detalle-no-encontrado text-center">

            <i
              className="bi bi-box-seam detalle-error-icono"
              aria-hidden="true"
            ></i>

            <h1 id="titulo-producto-no-encontrado">
              Producto no encontrado
            </h1>

            <p className="texto-secundario">
              El producto que estás buscando no existe
              o no se encuentra disponible en el catálogo.
            </p>

            <Link
              to="/catalogo"
              className="btn btn-primary"
            >
              <i
                className="bi bi-arrow-left me-2"
                aria-hidden="true"
              ></i>
              Volver al catálogo
            </Link>

          </div>

        </div>
      </section>
    )
  }

  // La clave reinicia la cantidad cuando cambia el producto.
  return (
    <InformacionProducto
      key={producto.id}
      producto={producto}
    />
  )
}

export default DetalleProducto
