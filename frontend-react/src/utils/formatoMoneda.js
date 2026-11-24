
/**
 * TECHSOLUTIONS E-Commerce
 * Utilidad para el formato de valores monetarios.
 *
 * Permite presentar los precios y valores de compra
 * en pesos colombianos (COP).
 */

const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Convierte un valor numérico al formato monetario colombiano.
 *
 * @param {number} valor - Valor monetario que se desea formatear.
 * @returns {string} Valor formateado en pesos colombianos.
 */
export function formatoMoneda(valor) {
  return formateadorCOP.format(valor)
}
