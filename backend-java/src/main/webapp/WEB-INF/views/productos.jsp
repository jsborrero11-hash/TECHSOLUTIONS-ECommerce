<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.techsolutions.ecommerce.modelo.Producto" %>

<%!
    private String escaparHtml(String valor) {
        if (valor == null) {
            return "";
        }

        return valor
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
%>

<%
    @SuppressWarnings("unchecked")
    List<Producto> productos =
            (List<Producto>) request.getAttribute("productos");
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Gestión de productos - TECHSOLUTIONS</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 30px 15px;
        }

        .contenedor {
            max-width: 1200px;
            margin: auto;
            background-color: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #1e3a5f;
            text-align: center;
        }

        .boton-nuevo {
            display: inline-block;
            margin-top: 15px;
            padding: 12px 20px;
            background-color: #1e3a5f;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }

        .boton-nuevo:hover {
            background-color: #2c5687;
        }

        .tabla-contenedor {
            width: 100%;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
        }

        th {
            background-color: #1e3a5f;
            color: white;
        }

        tbody tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        .mensaje {
            text-align: center;
            color: #666;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <main class="contenedor">

        <h1>Gestión de productos</h1>

        <p>TECHSOLUTIONS-ECommerce</p>

        <p>
            Listado de productos registrados en MySQL
            mediante Java Servlet y JSP.
        </p>

        <!-- Botón para abrir el formulario de registro -->
        <a class="boton-nuevo"
           href="${pageContext.request.contextPath}/productos?accion=nuevo">
            + Registrar nuevo producto
        </a>

        <% if (productos != null && !productos.isEmpty()) { %>

            <div class="tabla-contenedor">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Marca</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        <% for (Producto producto : productos) { %>
                            <tr>
                                <td>
                                    <%= producto.getIdProducto() %>
                                </td>

                                <td>
                                    <%= escaparHtml(
                                            producto.getNombreProducto()
                                    ) %>
                                </td>

                                <td>
                                    <%= escaparHtml(producto.getMarca()) %>
                                </td>

                                <td>
                                    <%= producto.getPrecio() %>
                                </td>

                                <td>
                                    <%= producto.getStock() %>
                                </td>

                                <td>
                                    <%= escaparHtml(producto.getEstado()) %>
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>

        <% } else { %>

            <p class="mensaje">
                No hay productos registrados en la base de datos.
            </p>

        <% } %>

    </main>
</body>
</html>