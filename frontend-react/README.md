# TECHSOLUTIONS-ECommerce · Componente Frontend

- **Institución:** SENA
- **Programa:** Análisis y Desarrollo de Software
- **Aprendiz:** Jefferson Sosa Borrero
- **Evidencia:** GA7-220501096-AA4-EV03

El frontend permite explorar productos tecnológicos y completar un recorrido académico de compra, desde el catálogo hasta la visualización de una factura simulada. El proyecto conserva como antecedentes el prototipo HTML, la documentación del CRUD Java y la actividad 82 de carrito, pago y factura. [README principal](../README.md)

## Instalación y ejecución

Usar Node.js 24.x y npm. Desde la raíz del repositorio o del ZIP extraído:

```sh
cd frontend-react
npm ci
npm run dev
```

Abrir la URL que indique Vite, normalmente `http://localhost:5173/`. El acceso es por `/login`. Para verificar la entrega desde `frontend-react/`:

```sh
npm run lint
npm run build
npm run preview
```

El build se genera en `dist/`. En PowerShell, usar `npm.cmd` si está bloqueado `npm.ps1`. Para un despliegue estático, configurar el alojamiento para servir `index.html` en las rutas de la SPA.

### Cuentas ficticias de demostración

| Rol | Correo | Contraseña ficticia |
|---|---|---|
| Cliente | `cliente@techsolutions.com` | `123456` |
| Administrador | `admin@techsolutions.com` | `123456` |

Estas cuentas forman parte del código de demostración y se destinan exclusivamente a pruebas académicas.

## Funcionalidades y alcance

| Acceso | Rutas y funcionalidades |
|---|---|
| Público | `/`, `/catalogo`, `/producto/:id`, `/contacto`, `/login` y `/registro`. Incluye filtros, estados sin resultados, productos relacionados, formulario de contacto y página 404. |
| Cliente | `/cliente` y `/carrito`. Incluye perfil, consulta de pedidos locales, gestión de cantidades, envío, pago simulado y factura en pantalla. |
| Administrador | `/admin`. Incluye indicadores, alta y baja temporal de productos de demostración, consulta de categorías y cambio de estado de un pedido de ejemplo. |

El registro y el envío de contacto son simulados. La recuperación de contraseña muestra un aviso. La sesión, los carritos y los pedidos se almacenan en el navegador. El panel administrativo modifica una copia en memoria. La factura muestra un comprobante académico. El frontend se ejecuta sin servicios de pago, correo, backend Java ni base de datos.

## Tecnologías y arquitectura

React 19 y React Router 7 organizan la SPA. Vite 8 compila la aplicación. Bootstrap 5, Bootstrap Icons e Inter aportan estilos, iconos y tipografía. ESLint comprueba el código.

| Ruta | Responsabilidad |
|---|---|
| `src/main.jsx`, `src/App.jsx` | Inicio de la SPA, router y proveedores de estado. |
| `src/routes/`, `src/pages/` | Rutas, acceso por rol y pantallas. |
| `src/components/` | Layout y componentes reutilizables de catálogo, formularios y compra. |
| `src/context/`, `src/hooks/` | Estado de sesión y carrito. |
| `src/data/`, `src/services/`, `src/utils/` | Catálogo, operaciones locales, almacenamiento y validación. |
| `public/img/`, `src/assets/` | Imágenes y recursos. |
| `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js` | Dependencias reproducibles, compilación y análisis estático. |

## QA y entrega

La actividad 82 validó compra, persistencia, teclado y diseño responsive. EV03.4 cubrió cliente, administrador, contacto, 404, relacionados, filtros, registro simulado y regresión local. Las evidencias incluyen capturas a diferentes anchos y scripts reproducibles. La prueba táctil física de 82 quedó como comprobación complementaria sin ejecutar. [QA de 82](../qa/seguimiento-actividad-82.md) · [QA y auditoría EV03](../qa/seguimiento-ev03.md)

La entrega utiliza la rama `evidencia-ga7-aa4-frontend-react`. [Repositorio y rama en GitHub](https://github.com/jsborrero11-hash/TECHSOLUTIONS-ECommerce/tree/evidencia-ga7-aa4-frontend-react)
