# Seguimiento QA de la actividad 438

La [matriz ejecutable](actividad-438.mjs) reutiliza los identificadores del recorrido manual. La ejecución final se realizó en Chrome sin ventana, con un perfil temporal, sobre el servidor local de Vite. La sesión se inició en el formulario real. La contraseña de demostración se proporciona mediante `TECHSOLUTIONS_QA_PASSWORD`.

| Caso | Alcance | Estado | Resultado y evidencia |
|---|---|---|---|
| 438-QA-01 | Acceso con el formulario real y teclado | Aprobado | El usuario confirmó foco visible en correo y contraseña, envío con Enter y redirección a `/cliente`. Vio Panel del cliente, Cliente Demo, Carrito con 0 unidades y Cerrar sesión. Evidencia reportada por el usuario. |
| 438-QA-02 | Catálogo, detalle, incorporación e inspección visual del carrito | Aprobado con observación | El usuario confirmó Lenovo LOQ 15, cantidad 1, precio unitario y subtotal de $3.500.000, IVA de $665.000 y total provisional de $4.165.000. El contador pasó de 0 a 1. Controles e importes legibles, sin superposición. Evidencia reportada por el usuario. La imagen parece de un portátil HP. El catálogo original y React asignan `laptop.webp` al Lenovo y ambos archivos tienen el mismo SHA-256. El carrito usa la imagen del catálogo. Observación de datos de catálogo, sin cambios. |
| 438-QA-03 | Formulario de pago, controles y teclado | Aprobado | En Chrome visible, `Tab` enfocó el primer envío, `Espacio` marcó recogida y `Flecha derecha` seleccionó el envío estándar. `Shift+Tab` devolvió el foco al envío. `Enter` abrió el pago, `Espacio` seleccionó PSE y `Enter` confirmó la compra. Se registró un pedido por $4.180.000. [Foco antes de confirmar](evidencias-438/03-foco-confirmar.png) |
| 438-QA-04 | Confirmación y visualización de la factura | Aprobado en Chrome | Pedido 1, Cliente Demo, Lenovo LOQ 15, cantidad 1, subtotal $3.500.000, IVA $665.000, envío $15.000 y total $4.180.000. El foco pasó al encabezado, el carrito quedó vacío y el pedido persistió al recargar. [Factura](evidencias-438/factura-768.png) · [Carrito vacío](evidencias-438/04-carrito-vacio.png) |
| 438-QA-05 | Responsive y tacto emulado | Aprobado | Se inspeccionaron capturas de carrito, pago y factura a 320, 390, 768 y 1440 px. Chrome confirmó que las tres vistas caben en cada ancho. A 390 px se abrió el menú y se navegó al catálogo con un puntero de tipo `touch`. La prueba complementaria en un dispositivo físico no se ejecutó. [Carrito corregido](evidencias-438/carrito-320.png) · [Navegación táctil](evidencias-438/05-catalogo-tactil-390.png) |

## Hallazgos y regresión

- **Carrito a 320 px.** El selector y el subtotal compartían una fila de dos columnas estrechas. El botón de aumento invadía el espacio del importe. La corrección apila ambos bloques por debajo del breakpoint `sm` de Bootstrap. Se comprobó visualmente la separación y se agregó una aserción de sus límites en la matriz. [Antes](evidencias-438/hallazgo-carrito-320-antes.png) · [Después](evidencias-438/carrito-320.png)
- **Imagen del Lenovo LOQ 15.** La captura del detalle muestra el logotipo HP. El catálogo original y React ya usaban el mismo archivo y el carrito reproduce esa asociación. La corrección de datos del catálogo queda fuera del alcance autorizado. [Detalle](evidencias-438/02-detalle.png)
- **Controles de calidad.** Después del ajuste de `ItemCarrito.jsx` pasaron ESLint, build, la aserción de separación a 320 px y el recorrido funcional en Chrome. La ejecución anterior ya cubría fallos de almacenamiento y doble confirmación. Esta sesión se concentró en la interfaz real y la evidencia visual.
- **Teclado.** Cada grupo renderizó tres radios nativos, con `name` común en el grupo, `id` únicos, etiquetas asociadas y una leyenda en su `fieldset`. El estado inicial de `checked` y el estado efectivo de `disabled` fueron los esperados para un carrito válido. React actualiza la opción en `onChange`. La revisión no encontró manejadores que cancelaran el teclado ni estilos que ocultaran los radios. En un intento sin ventana llegaron al documento cuatro eventos `Tab` confiables y sin cancelar, aunque el script envió 60. Con Chrome visible, la misma secuencia de eventos del protocolo llegó a los controles y completó la compra. El resultado apunta al modo de automatización. No se modificó el código de React.
- **Evidencia revisada.** Los 20 PNG abren correctamente. Las capturas permiten leer el estado de las vistas, los importes y el foco de confirmación e inspeccionar la distribución del flujo a los cuatro anchos. Se conservaron las capturas anterior y posterior del defecto a 320 px.

Para repetir 438-QA-03, define `TECHSOLUTIONS_QA_PASSWORD` con la clave de demostración y ejecuta desde la raíz, con Vite activo:

```powershell
$env:TECHSOLUTIONS_QA_VISIBLE = '1'
node qa/actividad-438.mjs 'C:/Program Files/Google/Chrome/Application/chrome.exe' http://127.0.0.1:4380 --teclado
```

## Estado de cierre

La instrucción original de 438.12 exige pruebas funcionales, responsive y de regresión. En los criterios facilitados y la documentación revisada no se encontró una exigencia de usar un dispositivo físico. El cierre de 438.12 se aprobó con las pruebas funcionales, la inspección responsive, la accesibilidad por teclado, la regresión y el toque emulado. El tacto físico queda como comprobación complementaria sin ejecutar.

Etapas 438.1 a 438.13 validadas contra los criterios disponibles. El cierre 438.14 se autorizó para la rama `evidencia-ga7-aa4-frontend-react`, con seguimiento en `origin`. El informe final registra el resultado del commit, el push y la verificación remota.

## Inventario para la entrega

- **6 archivos rastreados modificados**, relativos a la aplicación, rutas, persistencia, validaciones e integración del carrito. En `frontend-react/src/`: `App.jsx`, `routes/AppRoutes.jsx`, `utils/storage.js`, `utils/validaciones.js`, `components/layout/Navbar.jsx` y `pages/DetalleProducto.jsx`.
- **12 archivos nuevos del frontend**, incluidos los cambios de las primeras siete etapas. En `frontend-react/src/`: `context/CarritoContext.js`, `context/CarritoContext.jsx`, `hooks/useCarrito.js`, `pages/Carrito.jsx`, `services/carritoService.js`, `services/pedidosService.js`, `utils/calculosCompra.js` y, bajo `components/carrito/`, `TablaCarrito.jsx`, `ItemCarrito.jsx`, `ResumenPedido.jsx`, `FormularioPago.jsx` y `Factura.jsx`.
- **22 archivos de QA**, correspondientes a la matriz ejecutable, este seguimiento y los 20 PNG de `qa/evidencias-438/`.
- **Exclusiones.** `CarritoQATemporal.jsx` sigue sin seguimiento y sin importaciones ni rutas dependientes. `node_modules` y `dist` están ignorados. El perfil temporal de Chrome se eliminó al terminar y las evidencias no contienen la clave. El inventario no incluye archivos ajenos a la actividad.
