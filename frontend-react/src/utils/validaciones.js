
/**
 * TECHSOLUTIONS E-Commerce
 * Utilidades de validación de formularios.
 *
 * Centraliza las reglas de validación utilizadas
 * por los diferentes módulos de la aplicación.
 */

import {
  esCantidadValida,
  esPrecioValido,
  obtenerMetodoEnvio,
  obtenerMetodoPago,
} from './calculosCompra'

export const LONGITUD_MINIMA_CONTRASENA = 8

/**
 * Verifica que un valor de texto no esté vacío.
 */
export function esCampoObligatorioValido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

/**
 * Verifica el formato básico de un correo electrónico.
 */
export function esCorreoValido(correo) {
  if (!esCampoObligatorioValido(correo)) {
    return false
  }

  const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return expresionCorreo.test(correo.trim())
}

/**
 * Normaliza el correo electrónico para facilitar
 * la comparación de cuentas de usuario.
 */
export function normalizarCorreo(correo) {
  return typeof correo === 'string'
    ? correo.trim().toLowerCase()
    : ''
}

/**
 * Verifica el formato básico de un teléfono.
 * Permite entre 7 y 15 dígitos y separadores habituales.
 */
export function esTelefonoValido(telefono) {
  if (!esCampoObligatorioValido(telefono)) {
    return false
  }

  const telefonoNormalizado = telefono
    .trim()
    .replace(/[\s()-]/g, '')

  return /^\+?\d{7,15}$/.test(telefonoNormalizado)
}

/**
 * Verifica la longitud mínima de una contraseña nueva.
 */
export function esContrasenaValida(contrasena) {
  return (
    typeof contrasena === 'string' &&
    contrasena.trim().length > 0 &&
    contrasena.length >= LONGITUD_MINIMA_CONTRASENA
  )
}

/**
 * Verifica que las contraseñas coincidan exactamente.
 */
export function coincidenContrasenas(
  contrasena,
  confirmacion
) {
  return (
    typeof contrasena === 'string' &&
    typeof confirmacion === 'string' &&
    contrasena.length > 0 &&
    contrasena === confirmacion
  )
}

/**
 * Valida los campos del formulario de inicio de sesión.
 *
 * Las cuentas de demostración existentes utilizan
 * contraseñas de seis caracteres.
 */
export function validarLogin(datos = {}) {
  const errores = {}

  if (!esCampoObligatorioValido(datos.correo)) {
    errores.correo = 'El correo electrónico es obligatorio.'
  } else if (!esCorreoValido(datos.correo)) {
    errores.correo = 'Ingresa un correo electrónico válido.'
  }

  if (!esCampoObligatorioValido(datos.contrasena)) {
    errores.contrasena = 'La contraseña es obligatoria.'
  }

  return errores
}

/**
 * Valida los campos del formulario de registro.
 */
export function validarRegistro(datos = {}) {
  const errores = {}

  if (!esCampoObligatorioValido(datos.nombre)) {
    errores.nombre = 'El nombre completo es obligatorio.'
  }

  if (!esCampoObligatorioValido(datos.correo)) {
    errores.correo = 'El correo electrónico es obligatorio.'
  } else if (!esCorreoValido(datos.correo)) {
    errores.correo = 'Ingresa un correo electrónico válido.'
  }

  if (!esCampoObligatorioValido(datos.telefono)) {
    errores.telefono = 'El teléfono es obligatorio.'
  } else if (!esTelefonoValido(datos.telefono)) {
    errores.telefono = 'Ingresa un número de teléfono válido.'
  }

  if (!esCampoObligatorioValido(datos.direccion)) {
    errores.direccion = 'La dirección es obligatoria.'
  }

  if (!esCampoObligatorioValido(datos.contrasena)) {
    errores.contrasena = 'La contraseña es obligatoria.'
  } else if (!esContrasenaValida(datos.contrasena)) {
    errores.contrasena =
      `La contraseña debe tener mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`
  }

  if (!esCampoObligatorioValido(datos.confirmarContrasena)) {
    errores.confirmarContrasena =
      'Debes confirmar la contraseña.'
  } else if (
    !coincidenContrasenas(
      datos.contrasena,
      datos.confirmarContrasena
    )
  ) {
    errores.confirmarContrasena =
      'Las contraseñas no coinciden.'
  }

  return errores
}

/**
 * Valida la información necesaria para confirmar
 * una compra simulada.
 *
 * No modifica el carrito, no accede al almacenamiento
 * y no realiza transacciones financieras.
 *
 * Las condiciones de autenticación, autorización
 * y recuperación del carrito deben comprobarse
 * desde el contexto y el flujo de confirmación.
 */
export function validarCompra(datos = {}) {
  const errores = {}

  const {
    idUsuario,
    productos,
    idMetodoEnvio,
    idMetodoPago,
  } = datos ?? {}

  // Validación del identificador del cliente.
  if (
    !Number.isSafeInteger(idUsuario) ||
    idUsuario <= 0
  ) {
    errores.idUsuario =
      'No se ha identificado un cliente válido.'
  }

  // Validación de los productos del carrito.
  if (
    !Array.isArray(productos) ||
    productos.length === 0
  ) {
    errores.productos =
      'El carrito debe contener al menos un producto.'
  } else {
    const productosValidos = productos.every(
      (producto) =>
        Number.isSafeInteger(producto?.id) &&
        producto.id > 0 &&
        esCantidadValida(producto.cantidad) &&
        esPrecioValido(producto.precio),
    )

    if (!productosValidos) {
      errores.productos =
        'El carrito contiene productos con información no válida.'
    }
  }

  // Validación del método de envío.
  if (!obtenerMetodoEnvio(idMetodoEnvio)) {
    errores.idMetodoEnvio =
      'Selecciona un método de envío válido.'
  }

  // Validación del método de pago.
  if (!obtenerMetodoPago(idMetodoPago)) {
    errores.idMetodoPago =
      'Selecciona un método de pago válido.'
  }

  return errores
}

/**
 * Determina si existen errores de validación.
 */
export function tieneErrores(errores = {}) {
  return Object.keys(errores).length > 0
}
