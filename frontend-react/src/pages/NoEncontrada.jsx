import { Link } from 'react-router-dom'

export default function NoEncontrada() {
  return (
    <section className="container py-5 text-center" aria-labelledby="titulo-404">
      <p className="text-primary h2">404</p>
      <h1 id="titulo-404">Página no encontrada</h1>
      <p className="texto-secundario">La dirección que abriste no corresponde a una página del sitio.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </section>
  )
}
