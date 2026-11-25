
/**
 * TECHSOLUTIONS E-Commerce
 * Utilidades de almacenamiento local.
 *
 * Centraliza las operaciones permitidas sobre localStorage.
 *
 * No utilizar para almacenar contraseñas, credenciales,
 * tokens de autenticación reales ni información bancaria.
 */

const PREFIJO_STORAGE = 'techsolutions_'

/**
 * Claves utilizadas por los módulos de la aplicación.
 */
export const CLAVES_STORAGE = Object.freeze({
  SESION_DEMO: 'sesion_demo',
  CARRITO: 'carrito',
})

/**
 * Genera una clave exclusiva para el proyecto.
 */
function generarClave(clave) {
  return `${PREFIJO_STORAGE}${clave}`
}

/**
 * Guarda un valor serializado en localStorage.
 *
 * Retorna true cuando la operación es satisfactoria.
 */
export function guardarStorage(clave, valor) {
  try {
    const valorSerializado = JSON.stringify(valor)

    if (valorSerializado === undefined) {
      return false
    }

    localStorage.setItem(
      generarClave(clave),
      valorSerializado
    )

    return true
  } catch (error) {
    console.warn(
      `No fue posible guardar la información: ${clave}.`,
      error
    )

    return false
  }
}

/**
 * Recupera un valor almacenado en localStorage.
 *
 * Retorna el valor predeterminado cuando la información
 * no existe o no puede recuperarse correctamente.
 */
export function obtenerStorage(
  clave,
  valorPredeterminado = null
) {
  try {
    const valorAlmacenado = localStorage.getItem(
      generarClave(clave)
    )

    if (valorAlmacenado === null) {
      return valorPredeterminado
    }

    return JSON.parse(valorAlmacenado)
  } catch (error) {
    console.warn(
      `No fue posible recuperar la información: ${clave}.`,
      error
    )

    return valorPredeterminado
  }
}

/**
 * Elimina exclusivamente la información asociada
 * a la clave indicada.
 */
export function eliminarStorage(clave) {
  try {
    localStorage.removeItem(generarClave(clave))

    return true
  } catch (error) {
    console.warn(
      `No fue posible eliminar la información: ${clave}.`,
      error
    )

    return false
  }
}
