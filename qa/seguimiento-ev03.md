# Matriz maestra de seguimiento EV03

Evidencia SENA GA7-220501096-AA4-EV03 · TECHSOLUTIONS-ECommerce.

El prototipo HTML del repositorio es la referencia de implementación autorizada. La versión aprobada y los requisitos originales quedan por localizar. Los identificadores de la matriz corresponden a las actividades de trabajo.

| Actividad | Funcionalidad | Fuente de referencia | Archivos modificados o creados | Resultado esperado | Resultado obtenido | Estado | Evidencia | Hallazgos | Pendientes |
|---|---|---|---|---|---|---|---|---|---|
| EV03.3.1 | Panel del cliente y sus pedidos | [cliente.html](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/blob/bfccdd7b1a5cfb7c9597cc026b8af4e494717186/cliente.html), modelo local de pedidos de 82 | `PanelCliente.jsx`, `pedidosService.js`, `AppRoutes.jsx` | Acceso de cliente, perfil, secciones, estados vacíos y consulta aislada por usuario | Chrome comprobó acceso, perfil, favoritos, configuración, ausencia de pedidos, pedido de prueba, detalle, aislamiento y aviso por datos inválidos | Validado | [Panel y detalle a 320 px](evidencias-ev03/cliente-320.png) | Favoritos y configuración son vistas de demostración. Los pedidos usan el almacenamiento local existente | — |
| EV03.3.2 | Panel de administración | [admin.html](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/blob/bfccdd7b1a5cfb7c9597cc026b8af4e494717186/admin.html), [JS del prototipo](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/blob/bfccdd7b1a5cfb7c9597cc026b8af4e494717186/js/app.js) | `PanelAdministrador.jsx`, `AppRoutes.jsx` | Indicadores y secciones protegidas, alta y baja de productos y cambio simulado de estado | Chrome comprobó acceso, formulario inválido y válido, alta, baja, categorías y estado de pedido de ejemplo | Validado | [Estado de pedido a 1440 px](evidencias-ev03/admin-1440.png) | Los cambios administrativos viven en memoria. Las categorías muestran recuentos derivados de la copia de trabajo | — |
| EV03.3.3 | Contacto | [contacto.html](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/blob/bfccdd7b1a5cfb7c9597cc026b8af4e494717186/contacto.html) | `Contacto.jsx`, `AppRoutes.jsx` | Datos de contacto, validación y envío simulado con limpieza | Chrome comprobó campos requeridos, espacios, correo inválido, limpieza manual y confirmación con campos limpios | Validado | [Confirmación a 320 px](evidencias-ev03/contacto-320.png) | Se contempla el borrado del error personalizado al limpiar | — |
| EV03.3.4 | Productos relacionados | [producto.html](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/blob/bfccdd7b1a5cfb7c9597cc026b8af4e494717186/producto.html), catálogo React | `DetalleProducto.jsx` | Tarjetas de la misma categoría, exclusión del actual y navegación responsive | Chrome comprobó enlaces Mouse ↔ Teclado, foco en el nuevo título y ausencia del bloque para una categoría sin pares | Validado | [Tarjeta a 320 px](evidencias-ev03/relacionados-320.png) | La navegación entre detalles ahora devuelve el foco al encabezado | — |
| EV03.3.5 | Página no encontrada | Ruta comodín del frontend | `NoEncontrada.jsx`, `AppRoutes.jsx` | Mensaje 404 y retorno al inicio | Chrome abrió una URL inexistente y retornó al inicio con Tab y Enter | Validado | [404 a 320 px](evidencias-ev03/404-320.png) | Sustituye el mensaje de sección en desarrollo | — |
| EV03.3.6 | Comentarios y estilos | Hallazgos de EV03.2 | `FormularioPago.jsx`, `index.css` | Comentarios acordes al flujo y retirada del estilo obsoleto tras verificar sus referencias | Comentarios del registro local actualizados. Se retiró `.detalle-aviso` tras comprobar que solo existían sus declaraciones | Validado | ESLint y build | La modificación del formulario de pago fue documental | — |
| EV03.4 | Regresión incremental, responsive, teclado y herramientas | Auditoría EV03.2 y [QA histórico 82](seguimiento-actividad-82.md) | `qa/actividad-ev03.mjs`, esta matriz, `qa/evidencias-ev03/` | Validar cambios y rutas sin repetir el checkout | Chrome comprobó roles, filtros, estados sin resultados, registro simulado y las cinco nuevas vistas o secciones a 320, 390, 768 y 1440 px. Se comprobó foco de relacionados y teclado en 404. Pasaron ESLint y build. Ocho aserciones adicionales cubrieron la lectura y el registro local de pedidos | Validado en Chrome y Node | [Script](actividad-ev03.mjs), [catálogo vacío](evidencias-ev03/catalogo-sin-resultados.png), [registro simulado](evidencias-ev03/registro-simulado.png) | Se reutilizan los resultados de 82 para carrito, pago y factura. Las capturas de estas nuevas vistas se guardaron a 320 y 1440 px | El QA ejecutado no cubre dispositivo físico, lector de pantalla ni todos los recorridos exclusivamente por teclado |

## Reproducción

Desde la raíz, ejecutar ESLint, build y dejar la vista previa activa en el puerto 4381.

```powershell
npm.cmd --prefix frontend-react run lint
npm.cmd --prefix frontend-react run build
npm.cmd --prefix frontend-react run preview -- --host 127.0.0.1 --port 4381 --strictPort
```

En otra terminal, proporcionar la contraseña ficticia mediante `TECHSOLUTIONS_QA_PASSWORD` y ejecutar con Chrome visible. El script crea un perfil temporal y utiliza los formularios reales de inicio de sesión. Los pedidos de prueba se cargan en el perfil temporal para verificar el panel sin repetir la compra de 82.

```powershell
$env:TECHSOLUTIONS_QA_VISIBLE = '1'
node qa/actividad-ev03.mjs 'C:/Program Files/Google/Chrome/Application/chrome.exe'
```

## EV03.5 · Auditoría final de la entrega

| Indicador | Evidencia revisada | Conclusión |
|---|---|---|
| Diseño frente a prototipos | Comparación de las ocho pantallas HTML del repositorio y las vistas React. EV03.3 incorporó los dos paneles, contacto y productos relacionados | Correspondencia funcional y estructural sustentada frente al prototipo disponible. Falta confirmar su versión aprobada |
| Archivos y enlace del repositorio | Código, recursos, manifest, lockfile, configuración, instrucciones, enlace de la rama y QA de 82 y EV03 | Conjunto identificado para empaquetar desde el commit definitivo. La comprobación del ZIP se registra en el informe de cierre |
| Navegación | Evidencia de 82 y EV03.4 sobre catálogo, detalle, compra, acceso por rol, relacionados y 404 | Verificada para los recorridos documentados |
| Requisitos iniciales | Alcance autorizado de EV03, HTML disponible, implementación y resultados QA | Alcance técnico autorizado cubierto. Los requisitos originales y sus criterios siguen pendientes de respaldo documental |

- `AppRoutes.jsx` figura entre los archivos modificados de EV03.3. Mantiene el layout, las rutas públicas y las protecciones existentes, y conecta las vistas definitivas de contacto, cliente, administrador y 404.
- El código conserva componentes, contextos, servicios y utilidades separados. Los comentarios documentan el control de acceso, las simulaciones y los detalles menos evidentes del flujo. ESLint y el build se utilizan como controles de entrega.
- Git y GitHub registran la evolución del frontend y el cierre de 82. Se conservaron los README históricos y la observación de la imagen del Lenovo LOQ 15. Los identificadores CF del código sirven de referencia técnica.
- El ZIP de EV03 incluye la SPA React y ambas generaciones de QA. Los prototipos y artefactos históricos se consultan en GitHub. El módulo Java es independiente y queda fuera del paquete.
