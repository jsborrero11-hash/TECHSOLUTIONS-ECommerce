
/**
 * Proyecto: TECHSOLUTIONS E-Commerce
 * Archivo: storage.js
 * Descripción: Utilidades para gestionar el almacenamiento
 * local de sesiones, carritos y pedidos simulados.
 */

// Prefijo utilizado para identificar los datos del proyecto.
const PREFIJO_STORAGE = 'techsolutions_'

/**
 * Claves generales de almacenamiento.
 */
export const CLAVES_STORAGE = Object.freeze({
  SESION_DEMO: 'sesion_demo',
  CARRITO: 'carrito',
  PEDIDOS: 'pedidos',
})

/**
 * Genera la clave completa de almacenamiento.
 */
function obtenerClaveCompleta(clave) {
  return `${PREFIJO_STORAGE}${clave}`
}

/**
 * Verifica que una clave de almacenamiento sea válida.
 */
function esClaveValida(clave) {
  return (
    typeof clave === 'string' &&
    clave.trim().length > 0
  )
}

/**
 * Verifica que el identificador del usuario sea
 * un número entero positivo.
 */
export function esIdentificadorUsuarioValido(idUsuario) {
  return (
    Number.isSafeInteger(idUsuario) &&
    idUsuario > 0
  )
}

/**
 * Genera una clave de almacenamiento asociada
 * a un usuario específico.
 *
 * Ejemplo:
 * carrito_2
 * pedidos_2
 */
export function generarClaveUsuario(clave, idUsuario) {
  if (
    !esClaveValida(clave) ||
    !esIdentificadorUsuarioValido(idUsuario)
  ) {
    return null
  }

  return `${clave}_${idUsuario}`
}

/**
 * Guarda información en localStorage.
 *
 * Retorna true si la operación fue exitosa.
 * Retorna false si ocurre algún error.
 */
export function guardarStorage(clave, valor) {
  if (!esClaveValida(clave)) {
    return false
  }

  try {
    const claveCompleta = obtenerClaveCompleta(clave)
    const valorSerializado = JSON.stringify(valor)

    if (valorSerializado === undefined) {
      return false
    }

    localStorage.setItem(
      claveCompleta,
      valorSerializado,
    )

    return true
  } catch (error) {
    console.warn(
      'No fue posible guardar la información:',
      error,
    )

    return false
  }
}

/**
 * Recupera información de localStorage.
 *
 * Si la clave no existe o se presenta un error,
 * retorna el valor predeterminado.
 */
export function obtenerStorage(
  clave,
  valorPredeterminado = null,
) {
  if (!esClaveValida(clave)) {
    return valorPredeterminado
  }

  try {
    const claveCompleta = obtenerClaveCompleta(clave)

    const valorAlmacenado =
      localStorage.getItem(claveCompleta)

    if (valorAlmacenado === null) {
      return valorPredeterminado
    }

    return JSON.parse(valorAlmacenado)
  } catch (error) {
    console.warn(
      'No fue posible recuperar la información:',
      error,
    )

    return valorPredeterminado
  }
}

/**
 * Elimina información de localStorage.
 */
export function eliminarStorage(clave) {
  if (!esClaveValida(clave)) {
    return false
  }

  try {
    const claveCompleta = obtenerClaveCompleta(clave)

    localStorage.removeItem(claveCompleta)

    return true
  } catch (error) {
    console.warn(
      'No fue posible eliminar la información:',
      error,
    )

    return false
  }
}

/**
 * Guarda información asociada a un usuario.
 */
export function guardarStorageUsuario(
  clave,
  idUsuario,
  valor,
) {
  const claveUsuario = generarClaveUsuario(
    clave,
    idUsuario,
  )

  if (claveUsuario === null) {
    return false
  }

  return guardarStorage(claveUsuario, valor)
}

/**
 * Recupera información asociada a un usuario.
 */
export function obtenerStorageUsuario(
  clave,
  idUsuario,
  valorPredeterminado = null,
) {
  const claveUsuario = generarClaveUsuario(
    clave,
    idUsuario,
  )

  if (claveUsuario === null) {
    return valorPredeterminado
  }

  return obtenerStorage(
    claveUsuario,
    valorPredeterminado,
  )
}

/**
 * Elimina información asociada a un usuario.
 */
export function eliminarStorageUsuario(
  clave,
  idUsuario,
) {
  const claveUsuario = generarClaveUsuario(
    clave,
    idUsuario,
  )

  if (claveUsuario === null) {
    return false
  }

  return eliminarStorage(claveUsuario)
}


/**
 * Recupera información del almacenamiento indicando
 * si la lectura fue exitosa, si la clave existe
 * o si ocurrió un error.
 */
export function obtenerStorageDetallado(clave) {
  if (!esClaveValida(clave)) {
    return {
      exito: false,
      existe: false,
      valor: null,
      codigo: 'CLAVE_INVALIDA',
      mensaje: 'La clave de almacenamiento no es válida.',
    }
  }

  let datos

  try {
    datos = localStorage.getItem(
      obtenerClaveCompleta(clave),
    )
  } catch (error) {
    console.warn(
      'No fue posible leer el almacenamiento:',
      error,
    )

    return {
      exito: false,
      existe: null,
      valor: null,
      codigo: 'ERROR_LECTURA',
      mensaje: 'No fue posible recuperar la información.',
    }
  }

  // La clave no existe: situación normal.

  if (datos === null) {
    return {
      exito: true,
      existe: false,
      valor: null,
      codigo: 'NO_EXISTE',
      mensaje: '',
    }
  }

  // La clave existe: intentar interpretar el JSON.

  try {
    return {
      exito: true,
      existe: true,
      valor: JSON.parse(datos),
      codigo: 'LECTURA_EXITOSA',
      mensaje: '',
    }
  } catch (error) {
    console.warn(
      'La información almacenada no es válida:',
      error,
    )

    return {
      exito: false,
      existe: true,
      valor: null,
      codigo: 'JSON_INVALIDO',
      mensaje: 'La información almacenada está dañada.',
    }
  }
}

/**
 * Recupera información asociada a un usuario
 * mediante una lectura detallada.
 */
export function obtenerStorageUsuarioDetallado(
  clave,
  idUsuario,
) {
  const claveUsuario = generarClaveUsuario(
    clave,
    idUsuario,
  )

  if (claveUsuario === null) {
    return {
      exito: false,
      existe: false,
      valor: null,
      codigo: 'CLAVE_USUARIO_INVALIDA',
      mensaje: 'El identificador o la clave no son válidos.',
    }
  }

  return obtenerStorageDetallado(claveUsuario)
}
