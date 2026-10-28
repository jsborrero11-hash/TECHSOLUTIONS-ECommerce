/* =========================================
   TECHSOLUTIONS E-COMMERCE
   JAVASCRIPT PRINCIPAL
   ========================================= */


/* =========================================
   DATOS DE PRODUCTOS
   ========================================= */

const productos = [
    {
        id: 1,
        nombre: "Lenovo LOQ 15",
        categoria: "Laptops",
        precio: 3500000,
        imagen: "img/laptop.webp",
        descripcion: "Portátil para trabajo, estudio y entretenimiento."
    },
    {
        id: 2,
        nombre: "Monitor Samsung",
        categoria: "Monitores",
        precio: 950000,
        imagen: "img/monitorsamsung.jpg",
        descripcion: "Monitor de alta calidad para trabajo y entretenimiento."
    },
    {
        id: 3,
        nombre: "Mouse Logitech",
        categoria: "Accesorios",
        precio: 180000,
        imagen: "img/mouse.webp",
        descripcion: "Mouse ergonómico para uso diario."
    },
    {
        id: 4,
        nombre: "Teclado mecánico",
        categoria: "Accesorios",
        precio: 250000,
        imagen: "img/tecladoswitch.jpg",
        descripcion: "Teclado mecánico ideal para productividad y gaming."
    },
    {
        id: 5,
        nombre: "SSD",
        categoria: "Almacenamiento",
        precio: 320000,
        imagen: "img/ssd.jpg",
        descripcion: "Unidad de almacenamiento SSD de alta velocidad."
    },
    {
        id: 6,
        nombre: "Audífonos Bluetooth",
        categoria: "Audio",
        precio: 220000,
        imagen: "img/audífonosbluetooth.jpg",
        descripcion: "Audífonos inalámbricos para música y entretenimiento."
    }
];


/* =========================================
   FORMATO DE MONEDA
   ========================================= */

function formatoPrecio(precio) {
    return precio.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
}


/* =========================================
   MOSTRAR PRODUCTOS
   ========================================= */

function mostrarProductos(listaProductos) {

    const contenedor =
        document.getElementById("contenedor-productos");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (listaProductos.length === 0) {

        contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                No se encontraron productos.
            </div>
        `;

        return;
    }

    listaProductos.forEach(producto => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "col-md-4 mb-4";

        tarjeta.innerHTML = `
            <div class="card h-100 shadow-sm">

                <img
                    src="${producto.imagen}"
                    class="card-img-top"
                    alt="${producto.nombre}"
                    style="height: 220px; object-fit: cover;"
                >

                <div class="card-body d-flex flex-column">

                    <h5 class="card-title">
                        ${producto.nombre}
                    </h5>

                    <p class="text-muted mb-2">
                        ${producto.categoria}
                    </p>

                    <p class="card-text">
                        ${producto.descripcion}
                    </p>

                    <h5 class="text-primary mt-auto">
                        ${formatoPrecio(producto.precio)}
                    </h5>

                    <button
                        class="btn btn-primary mt-3"
                        onclick="agregarAlCarrito(${producto.id})"
                    >
                        Agregar al carrito
                    </button>

                </div>

            </div>
        `;

        contenedor.appendChild(tarjeta);

    });
}


/* =========================================
   BÚSQUEDA DE PRODUCTOS
   ========================================= */

function buscarProductos() {

    const campoBusqueda =
        document.getElementById("busqueda");

    if (!campoBusqueda) {
        return;
    }

    const texto =
        campoBusqueda.value.toLowerCase().trim();

    const resultados =
        productos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto) ||
            producto.categoria.toLowerCase().includes(texto)
        );

    mostrarProductos(resultados);
}


/* =========================================
   FILTRO POR CATEGORÍA
   ========================================= */

function filtrarCategoria(categoria) {

    if (categoria === "Todos") {

        mostrarProductos(productos);

        return;
    }

    const resultados =
        productos.filter(producto =>
            producto.categoria === categoria
        );

    mostrarProductos(resultados);
}


/* =========================================
   INICIALIZACIÓN DEL CATÁLOGO Y CARRITO
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const contenedorProductos =
        document.getElementById("contenedor-productos");

    if (contenedorProductos) {
        mostrarProductos(productos);
    }

    mostrarCarrito();

});


/* =========================================
   CARRITO DE COMPRAS
   ========================================= */

function agregarAlCarrito(idProducto) {

    const producto =
        productos.find(
            producto => producto.id === idProducto
        );

    if (!producto) {
        return;
    }

    let carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    const productoExistente =
        carrito.find(
            item => item.id === idProducto
        );

    if (productoExistente) {

        productoExistente.cantidad++;

    } else {

        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });

    }

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    alert(
        producto.nombre +
        " fue agregado al carrito."
    );
}


/* =========================================
   MOSTRAR CARRITO
   ========================================= */

function mostrarCarrito() {

    const tablaCarrito =
        document.getElementById("tabla-carrito");

    if (!tablaCarrito) {
        return;
    }

    const carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    tablaCarrito.innerHTML = "";

    /*
       Elementos del resumen
    */

    const elementoSubtotal =
        document.getElementById("subtotal-carrito");

    const elementoIva =
        document.getElementById("iva-carrito");

    const elementoTotal =
        document.getElementById("total-carrito");


    /*
       Carrito vacío
    */

    if (carrito.length === 0) {

        tablaCarrito.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">

                    <i class="bi bi-cart-x fs-1 text-muted"></i>

                    <p class="mt-2 mb-0">
                        Tu carrito está vacío.
                    </p>

                </td>
            </tr>
        `;

        if (elementoSubtotal) {
            elementoSubtotal.textContent = "$0";
        }

        if (elementoIva) {
            elementoIva.textContent = "$0";
        }

        if (elementoTotal) {
            elementoTotal.textContent = "$0";
        }

        return;
    }


    /*
       Cálculo del subtotal
    */

    let subtotal = 0;

    carrito.forEach(producto => {

        const subtotalProducto =
            producto.precio * producto.cantidad;

        subtotal += subtotalProducto;

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>

                <img
                    src="${producto.imagen}"
                    width="80"
                    class="img-fluid rounded"
                    alt="${producto.nombre}"
                >

            </td>

            <td>
                ${producto.nombre}
            </td>

            <td>
                ${formatoPrecio(producto.precio)}
            </td>

            <td>

                <input
                    type="number"
                    class="form-control"
                    value="${producto.cantidad}"
                    min="1"
                    onchange="actualizarCantidad(${producto.id}, this.value)"
                >

            </td>

            <td>
                ${formatoPrecio(subtotalProducto)}
            </td>

            <td>

                <button
                    class="btn btn-danger"
                    onclick="eliminarDelCarrito(${producto.id})"
                >

                    <i class="bi bi-trash-fill"></i>

                    Eliminar

                </button>

            </td>
        `;

        tablaCarrito.appendChild(fila);

    });


    /*
       IVA y total
    */

    const iva =
        subtotal * 0.19;

    const total =
        subtotal + iva;


    /*
       Mostrar resumen
    */

    if (elementoSubtotal) {

        elementoSubtotal.textContent =
            formatoPrecio(subtotal);

    }

    if (elementoIva) {

        elementoIva.textContent =
            formatoPrecio(iva);

    }

    if (elementoTotal) {

        elementoTotal.textContent =
            formatoPrecio(total);

    }

}


/* =========================================
   ELIMINAR PRODUCTO DEL CARRITO
   ========================================= */

function eliminarDelCarrito(idProducto) {

    let carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    carrito =
        carrito.filter(
            producto => producto.id !== idProducto
        );

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    mostrarCarrito();
}


/* =========================================
   ACTUALIZAR CANTIDAD
   ========================================= */

function actualizarCantidad(
    idProducto,
    nuevaCantidad
) {

    let carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    nuevaCantidad =
        parseInt(nuevaCantidad);

    if (
        nuevaCantidad < 1 ||
        isNaN(nuevaCantidad)
    ) {

        nuevaCantidad = 1;

    }

    const producto =
        carrito.find(
            producto => producto.id === idProducto
        );

    if (producto) {

        producto.cantidad =
            nuevaCantidad;

    }

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    mostrarCarrito();
}


/* =========================================
   FINALIZAR COMPRA
   ========================================= */

function finalizarCompra() {

    const carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];


    /*
       Validar carrito vacío
    */

    if (carrito.length === 0) {

        alert(
            "Tu carrito está vacío."
        );

        return;
    }


    /*
       Calcular valores antes de
       eliminar el carrito
    */

    let subtotal = 0;

    carrito.forEach(producto => {

        subtotal +=
            producto.precio *
            producto.cantidad;

    });

    const iva =
        subtotal * 0.19;

    const total =
        subtotal + iva;


    /*
       Mostrar confirmación
    */

    alert(
        "Compra realizada correctamente.\n\n" +
        "Subtotal: " +
        formatoPrecio(subtotal) +
        "\n" +
        "IVA (19%): " +
        formatoPrecio(iva) +
        "\n" +
        "Total: " +
        formatoPrecio(total) +
        "\n\n" +
        "Gracias por comprar en TECHSOLUTIONS."
    );


    /*
       Vaciar carrito
    */

    localStorage.removeItem("carrito");

    mostrarCarrito();
}


/* =========================================
   LOGIN
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const formularioLogin =
        document.getElementById("form-login");

    if (!formularioLogin) {
        return;
    }

    formularioLogin.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            const correo =
                document
                    .getElementById("correo-login")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password-login")
                    .value
                    .trim();

            const mensaje =
                document.getElementById(
                    "mensaje-login"
                );


            /*
               Validación de campos
            */

            if (
                correo === "" ||
                password === ""
            ) {

                mensaje.className =
                    "alert alert-warning";

                mensaje.textContent =
                    "Por favor, complete todos los campos.";

                return;
            }


            /*
               Usuario administrador
            */

            if (
                correo === "admin@techsolutions.com" &&
                password === "123456"
            ) {

                localStorage.setItem(
                    "usuarioLogueado",
                    "admin"
                );

                mensaje.className =
                    "alert alert-success";

                mensaje.textContent =
                    "Inicio de sesión correcto. Bienvenido.";

                setTimeout(function () {

                    window.location.href =
                        "admin.html";

                }, 1000);

                return;
            }


            /*
               Usuario cliente
            */

            if (
                correo === "cliente@techsolutions.com" &&
                password === "123456"
            ) {

                localStorage.setItem(
                    "usuarioLogueado",
                    "cliente"
                );

                mensaje.className =
                    "alert alert-success";

                mensaje.textContent =
                    "Inicio de sesión correcto. Bienvenido.";

                setTimeout(function () {

                    window.location.href =
                        "cliente.html";

                }, 1000);

                return;
            }


            /*
               Credenciales incorrectas
            */

            mensaje.className =
                "alert alert-danger";

            mensaje.textContent =
                "Correo o contraseña incorrectos.";

        }
    );

});


/* =========================================
   RECUPERAR CONTRASEÑA
   ========================================= */

function recuperarPassword(evento) {

    evento.preventDefault();

    alert(
        "La recuperación de contraseña estará disponible próximamente."
    );
}


/* =========================================
   CREAR CUENTA
   ========================================= */

function crearCuenta(evento) {

    evento.preventDefault();

    alert(
        "El registro de nuevos usuarios estará disponible próximamente."
    );
}


/* =========================================
   PANEL DEL CLIENTE
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const nombreCliente =
        document.getElementById("nombre-cliente");

    if (nombreCliente) {

        const usuario =
            localStorage.getItem(
                "usuarioLogueado"
            );

        if (usuario === "cliente") {

            nombreCliente.textContent =
                "Cliente TECHSOLUTIONS";

        }

    }

});


/* =========================================
   SECCIONES DEL CLIENTE
   ========================================= */

function mostrarSeccionCliente(
    seccion,
    evento
) {

    evento.preventDefault();

    const titulo =
        document.getElementById(
            "titulo-informacion"
        );

    const contenido =
        document.getElementById(
            "contenido-informacion"
        );

    const informacion =
        document.getElementById(
            "informacion-cliente"
        );

    if (!informacion) {
        return;
    }

    informacion.classList.remove(
        "d-none"
    );


    if (seccion === "perfil") {

        titulo.textContent =
            "Mi Perfil";

        contenido.textContent =
            "Desde esta sección podrás consultar y actualizar la información de tu cuenta.";

    }


    if (seccion === "pedidos") {

        titulo.textContent =
            "Mis Pedidos";

        contenido.textContent =
            "Aquí podrás consultar el historial, estado y detalle de tus pedidos.";

    }


    if (seccion === "favoritos") {

        titulo.textContent =
            "Mis Favoritos";

        contenido.textContent =
            "Aquí se mostrarán los productos que hayas marcado como favoritos.";

    }


    if (seccion === "configuracion") {

        titulo.textContent =
            "Configuración";

        contenido.textContent =
            "Desde aquí podrás administrar las preferencias de tu cuenta.";

    }

}


/* =========================================
   DETALLE DEL PEDIDO
   ========================================= */

function verDetallePedido(numeroPedido) {

    alert(
        "Detalle del pedido #" +
        numeroPedido +
        "\n\n" +
        "El detalle del pedido estará disponible en la versión conectada a la base de datos."
    );

}


/* =========================================
   CERRAR SESIÓN
   ========================================= */

function cerrarSesion() {

    localStorage.removeItem(
        "usuarioLogueado"
    );

}


/* =========================================
   PANEL DE ADMINISTRACIÓN
   ========================================= */

function mostrarGestion(seccion) {

    const productos =
        document.getElementById(
            "gestion-productos"
        );

    const categorias =
        document.getElementById(
            "gestion-categorias"
        );

    const pedidos =
        document.getElementById(
            "gestion-pedidos"
        );

    if (
        !productos ||
        !categorias ||
        !pedidos
    ) {

        return;

    }


    productos.classList.add("d-none");

    categorias.classList.add("d-none");

    pedidos.classList.add("d-none");


    if (seccion === "productos") {

        productos.classList.remove(
            "d-none"
        );

    }


    if (seccion === "categorias") {

        categorias.classList.remove(
            "d-none"
        );

    }


    if (seccion === "pedidos") {

        pedidos.classList.remove(
            "d-none"
        );

    }

}


/* =========================================
   MOSTRAR PRODUCTOS EN ADMINISTRACIÓN
   ========================================= */

function mostrarProductosAdmin() {

    const tabla =
        document.getElementById(
            "tabla-productos-admin"
        );

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    productos.forEach(producto => {

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>
                ${producto.id}
            </td>

            <td>
                ${producto.nombre}
            </td>

            <td>
                ${producto.categoria}
            </td>

            <td>
                ${formatoPrecio(producto.precio)}
            </td>

            <td>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="eliminarProductoAdmin(${producto.id})"
                >

                    <i class="bi bi-trash"></i>

                    Eliminar

                </button>

            </td>
        `;

        tabla.appendChild(fila);

    });

}


/* =========================================
   ELIMINAR PRODUCTO ADMIN
   ========================================= */

function eliminarProductoAdmin(idProducto) {

    const confirmar =
        confirm(
            "¿Desea eliminar este producto?"
        );

    if (!confirmar) {
        return;
    }

    const indice =
        productos.findIndex(
            producto =>
                producto.id === idProducto
        );

    if (indice !== -1) {

        productos.splice(
            indice,
            1
        );

        mostrarProductosAdmin();

        const total =
            document.getElementById(
                "total-productos"
            );

        if (total) {

            total.textContent =
                productos.length;

        }

        alert(
            "Producto eliminado correctamente."
        );

    }

}


/* =========================================
   AGREGAR PRODUCTO DESDE ADMIN
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const formulario =
            document.getElementById(
                "form-producto"
            );

        if (!formulario) {
            return;
        }

        mostrarProductosAdmin();

        formulario.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                const nombre =
                    document
                        .getElementById(
                            "nombre-producto"
                        )
                        .value
                        .trim();

                const categoria =
                    document
                        .getElementById(
                            "categoria-producto"
                        )
                        .value;

                const precio =
                    parseFloat(
                        document
                            .getElementById(
                                "precio-producto"
                            )
                            .value
                    );


                if (
                    !nombre ||
                    !categoria ||
                    isNaN(precio)
                ) {

                    alert(
                        "Complete correctamente todos los campos."
                    );

                    return;
                }


                const nuevoId =
                    productos.length > 0
                        ? Math.max(
                            ...productos.map(
                                producto =>
                                    producto.id
                            )
                        ) + 1
                        : 1;


                productos.push({

                    id: nuevoId,

                    nombre: nombre,

                    categoria: categoria,

                    precio: precio,

                    imagen:
                        "img/laptop.webp",

                    descripcion:
                        "Producto tecnológico disponible en TECHSOLUTIONS."

                });


                mostrarProductosAdmin();


                const total =
                    document.getElementById(
                        "total-productos"
                    );

                if (total) {

                    total.textContent =
                        productos.length;

                }


                formulario.reset();


                alert(
                    "Producto agregado correctamente."
                );

            }
        );

    }
);


/* =========================================
   ACTUALIZAR ESTADO DEL PEDIDO
   ========================================= */

function actualizarEstadoPedido(select) {

    const estado =
        select.value;

    alert(
        "El estado del pedido fue actualizado a: " +
        estado
    );

}


/* =========================================
   FORMULARIO DE CONTACTO
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const formulario =
            document.getElementById(
                "form-contacto"
            );

        if (!formulario) {
            return;
        }

        formulario.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                const mensaje =
                    document.getElementById(
                        "mensaje-contacto"
                    );

                mensaje.className =
                    "alert alert-success";

                mensaje.textContent =
                    "Mensaje enviado correctamente. Gracias por contactarnos.";

                formulario.reset();

            }
        );

    }
);


/* =========================================
   DETALLE DINÁMICO DEL PRODUCTO
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const nombreProducto =
            document.getElementById(
                "nombre-producto"
            );

        /*
           Si no estamos en producto.html,
           no hacemos nada.
        */

        if (!nombreProducto) {
            return;
        }


        /*
           Obtener ID desde la URL

           Ejemplo:
           producto.html?id=1
        */

        const parametros =
            new URLSearchParams(
                window.location.search
            );

        const idProducto =
            parseInt(
                parametros.get("id")
            ) || 1;


        /*
           Buscar producto
        */

        const producto =
            productos.find(
                producto =>
                    producto.id === idProducto
            );


        /*
           Producto inexistente
        */

        if (!producto) {

            nombreProducto.textContent =
                "Producto no encontrado";

            return;
        }


        /*
           NOMBRE
        */

        nombreProducto.textContent =
            producto.nombre;


        /*
           PRECIO
        */

        const precioProducto =
            document.getElementById(
                "precio-producto"
            );

        if (precioProducto) {

            precioProducto.textContent =
                formatoPrecio(
                    producto.precio
                );

        }


        /*
           IMAGEN PRINCIPAL
        */

        const imagenProducto =
            document.getElementById(
                "imagen-producto"
            );

        if (imagenProducto) {

            imagenProducto.src =
                producto.imagen;

            imagenProducto.alt =
                producto.nombre;

        }


        /*
           MINIATURA 1
        */

        const miniatura1 =
            document.getElementById(
                "imagen-miniatura-1"
            );

        if (miniatura1) {

            miniatura1.src =
                producto.imagen;

            miniatura1.alt =
                producto.nombre;

        }


        /*
           MINIATURA 2
        */

        const miniatura2 =
            document.getElementById(
                "imagen-miniatura-2"
            );

        if (miniatura2) {

            miniatura2.src =
                producto.imagen;

            miniatura2.alt =
                producto.nombre;

        }


        /*
           MINIATURA 3
        */

        const miniatura3 =
            document.getElementById(
                "imagen-miniatura-3"
            );

        if (miniatura3) {

            miniatura3.src =
                producto.imagen;

            miniatura3.alt =
                producto.nombre;

        }


        /*
           DESCRIPCIÓN
        */

        const descripcionProducto =
            document.getElementById(
                "descripcion-producto"
            );

        if (descripcionProducto) {

            descripcionProducto.textContent =
                producto.descripcion;

        }


        /*
           CATEGORÍA
        */

        const categoriaProducto =
            document.getElementById(
                "categoria-producto"
            );

        if (categoriaProducto) {

            categoriaProducto.textContent =
                producto.categoria;

        }


        /*
           ID DEL PRODUCTO
        */

        const elementoId =
            document.getElementById(
                "id-producto"
            );

        if (elementoId) {

            elementoId.textContent =
                producto.id;

        }


        /*
           BREADCRUMB
        */

        const breadcrumbProducto =
            document.getElementById(
                "breadcrumb-producto"
            );

        if (breadcrumbProducto) {

            breadcrumbProducto.textContent =
                producto.nombre;

        }


        /*
           BOTÓN AGREGAR AL CARRITO
        */

        const botonAgregar =
            document.getElementById(
                "btn-agregar-producto"
            );

        if (botonAgregar) {

            botonAgregar.addEventListener(
                "click",
                function () {

                    const cantidadInput =
                        document.getElementById(
                            "cantidad-producto"
                        );

                    let cantidad =
                        parseInt(
                            cantidadInput.value
                        );


                    if (
                        isNaN(cantidad) ||
                        cantidad < 1
                    ) {

                        cantidad = 1;

                    }


                    /*
                       Agregar la cantidad
                       seleccionada al carrito
                    */

                    for (
                        let i = 0;
                        i < cantidad;
                        i++
                    ) {

                        agregarAlCarrito(
                            producto.id
                        );

                    }

                }
            );

        }

    }
);