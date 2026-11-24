import './App.css'

/**
 * Componente principal de TECHSOLUTIONS E-Commerce.
 * Organiza la estructura general de la aplicación.
 */
function App() {
  return (
    <div className="app">
      <main className="contenido-principal">
        <section className="container py-5 text-center">
          <i
            className="bi bi-pc-display fs-1 text-primary"
            aria-hidden="true"
          ></i>

          <h1 className="mt-3">
            TECHSOLUTIONS E-Commerce
          </h1>

          <p className="texto-secundario">
            Tecnología, innovación y soluciones a tu alcance.
          </p>

          <div className="mt-4">
            <button type="button" className="btn btn-primary">
              <i className="bi bi-cart3 me-2" aria-hidden="true"></i>
              Ver productos
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App