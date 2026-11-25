
/**
 * TECHSOLUTIONS E-Commerce
 * Servicio de autenticación.
 *
 * Implementación temporal para demostración del frontend.
 * La autenticación real se integrará posteriormente
 * con el backend Java y la base de datos MySQL.
 */

import {
  normalizarCorreo,
  validarLogin,
  validarRegistro,
  tieneErrores,
} from '../utils/validaciones.js'

import {
  CLAVES_STORAGE,
  guardarStorage,
  obtenerStorage,
  eliminarStorage,
} from '../utils/storage.js'

/**
 * Roles reconocidos por la aplicación.
 */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  CLIENTE: 'cliente',
})

/**
 * Cuentas ficticias utilizadas exclusivamente
 * para las pruebas funcionales del frontend.
 *
 * No corresponden a usuarios reales.
 */
const USUARIOS_DEMO = [
  {
    id: 1,
    nombre: 'Administrador Demo',
    correo: 'admin@techsolutions.com',
    contrasena: '123456',
    rol: ROLES.ADMIN,
  },
  {
    id: 2,
    nombre: 'Cliente Demo',
    correo: 'cliente@techsolutions.com',
    contrasena: '123456',
    rol: ROLES.CLIENTE,
  },
]

/**
 * Retorna únicamente los datos permitidos
 * para la sesión de demostración.
 *
 * Excluye la contraseña del usuario.
 */
function obtenerUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  }
}

/**
 * Inicia una sesión de demostración.
 */
export async function iniciarSesion(datos = {}) {
  const errores = validarLogin(datos)

  if (tieneErrores(errores)) {
    return {
      exito: false,
      mensaje: 'Verifica los campos del formulario.',
      errores,
    }
  }

  const correo = normalizarCorreo(datos.correo)

  const usuarioEncontrado = USUARIOS_DEMO.find(
    (usuario) =>
      usuario.correo === correo &&
      usuario.contrasena === datos.contrasena
  )

  if (!usuarioEncontrado) {
    return {
      exito: false,
      mensaje: 'El correo electrónico o la contraseña son incorrectos.',
    }
  }

  const usuario = obtenerUsuarioPublico(usuarioEncontrado)

  const sesionGuardada = guardarStorage(
    CLAVES_STORAGE.SESION_DEMO,
    usuario
  )

  if (!sesionGuardada) {
    return {
      exito: false,
      mensaje: 'No fue posible guardar la sesión. Verifica la configuración del navegador.',
    }
  }

  return {
    exito: true,
    mensaje: 'Inicio de sesión de demostración exitoso.',
    usuario,
  }
}

/**
 * Recupera la sesión de demostración almacenada.
 *
 * Comprueba que los datos correspondan a una
 * de las cuentas ficticias reconocidas.
 */
export function obtenerSesion() {
  const sesion = obtenerStorage(
    CLAVES_STORAGE.SESION_DEMO
  )

  if (!sesion || typeof sesion !== 'object') {
    return null
  }

  const usuarioEncontrado = USUARIOS_DEMO.find(
    (usuario) =>
      usuario.id === sesion.id &&
      usuario.correo === sesion.correo &&
      usuario.rol === sesion.rol
  )

  if (!usuarioEncontrado) {
    eliminarStorage(CLAVES_STORAGE.SESION_DEMO)

    return null
  }

  return obtenerUsuarioPublico(usuarioEncontrado)
}

/**
 * Finaliza la sesión de demostración.
 */
export async function cerrarSesion() {
  const sesionEliminada = eliminarStorage(
    CLAVES_STORAGE.SESION_DEMO
  )

  if (!sesionEliminada) {
    return {
      exito: false,
      mensaje: 'No fue posible eliminar la sesión almacenada.',
    }
  }

  return {
    exito: true,
    mensaje: 'Sesión cerrada correctamente.',
  }
}

/**
 * Valida y simula el registro de un nuevo cliente.
 *
 * No crea cuentas reales ni almacena contraseñas
 * o información personal en localStorage.
 */
export async function registrarUsuario(datos = {}) {
  const errores = validarRegistro(datos)

  if (tieneErrores(errores)) {
    return {
      exito: false,
      mensaje: 'Verifica los campos del formulario.',
      errores,
    }
  }

  const correo = normalizarCorreo(datos.correo)

  const correoExistente = USUARIOS_DEMO.some(
    (usuario) => usuario.correo === correo
  )

  if (correoExistente) {
    return {
      exito: false,
      mensaje: 'El correo electrónico ya está registrado como cuenta de demostración.',
      errores: {
        correo: 'Este correo electrónico ya está registrado.',
      },
    }
  }

  return {
    exito: true,
    simulado: true,
    mensaje:
      'Los datos del registro son válidos. Esta operación es una simulación y no crea una cuenta real. El registro estará disponible cuando se complete la integración con el backend.',
  }
}

/**
 * Determina la página de destino según el rol.
 */
export function obtenerRutaPorRol(rol) {
  switch (rol) {
    case ROLES.ADMIN:
      return '/admin'

    case ROLES.CLIENTE:
      return '/cliente'

    default:
      return '/'
  }
}
