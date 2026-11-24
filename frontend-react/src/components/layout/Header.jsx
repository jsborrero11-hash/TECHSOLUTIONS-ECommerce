/**
 * CF03 - Header
 * Encabezado principal de TECHSOLUTIONS E-Commerce.
 * Presenta la identidad visual de la tienda.
 */
function Header() {
  return (
    <header className="bg-primary text-white py-4">
      <div className="container text-center">
        <div className="d-flex align-items-center justify-content-center gap-3">
          <i
            className="bi bi-pc-display fs-1"
            aria-hidden="true"
          ></i>

          <p className="fs-3 fw-bold mb-0">
            TECHSOLUTIONS E-Commerce
          </p>
        </div>

        <p className="mb-0 mt-2">
          Tecnología, innovación y soluciones a tu alcance.
        </p>
      </div>
    </header>
  )
}

export default Header