
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: useCarrito.js
 * Descripción: Hook personalizado para acceder
 * al contexto global del carrito de compras.
 */

import { useContext } from 'react'

import CarritoContext from '../context/CarritoContext.js'

/**
 * Permite acceder al estado y las operaciones
 * del carrito desde los componentes de React.
 */
export function useCarrito() {
  const contexto = useContext(CarritoContext)

  if (contexto === null) {
    throw new Error(
      'useCarrito debe utilizarse dentro de CarritoProvider.',
    )
  }

  return contexto
}
