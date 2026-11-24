
/**
 * TECHSOLUTIONS E-Commerce
 * Fuente centralizada de datos de productos.
 *
 * Datos iniciales recuperados del archivo js/app.js
 * del proyecto original.
 *
 * Estos datos son demostrativos y serán utilizados
 * hasta realizar la integración con el backend.
 */

export const productos = [
  {
    id: 1,
    nombre: 'Lenovo LOQ 15',
    categoria: 'Laptops',
    precio: 3500000,
    imagen: '/img/laptop.webp',
    descripcion: 'Portátil para trabajo, estudio y entretenimiento.',
    destacado: true,
  },
  {
    id: 2,
    nombre: 'Monitor Samsung',
    categoria: 'Monitores',
    precio: 950000,
    imagen: '/img/monitorsamsung.jpg',
    descripcion: 'Monitor de alta calidad para trabajo y entretenimiento.',
    destacado: false,
  },
  {
    id: 3,
    nombre: 'Mouse Logitech',
    categoria: 'Accesorios',
    precio: 180000,
    imagen: '/img/mouse.webp',
    descripcion: 'Mouse ergonómico para uso diario.',
    destacado: true,
  },
  {
    id: 4,
    nombre: 'Teclado mecánico',
    categoria: 'Accesorios',
    precio: 250000,
    imagen: '/img/tecladoswitch.jpg',
    descripcion: 'Teclado mecánico ideal para productividad y gaming.',
    destacado: false,
  },
  {
    id: 5,
    nombre: 'SSD',
    categoria: 'Almacenamiento',
    precio: 320000,
    imagen: '/img/ssd.jpg',
    descripcion: 'Unidad de almacenamiento SSD de alta velocidad.',
    destacado: false,
  },
  {
    id: 6,
    nombre: 'Audífonos Bluetooth',
    categoria: 'Audio',
    precio: 220000,
    imagen: '/img/audífonosbluetooth.jpg',
    descripcion: 'Audífonos inalámbricos para música y entretenimiento.',
    destacado: true,
  },
]

/**
 * Obtiene las categorías existentes sin duplicados.
 */
export const categorias = [
  ...new Set(productos.map(producto => producto.categoria)),
]

/**
 * Obtiene los productos seleccionados como destacados.
 */
export const productosDestacados = productos.filter(
  producto => producto.destacado,
)
