<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar producto - TECHSOLUTIONS</title>
    <style>
        * { box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: #f2f4f8;
            margin: 0;
            padding: 30px 15px;
        }

        .contenedor {
            max-width: 650px;
            margin: auto;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 3px 12px #00000015;
        }

        h1 {
            color: #1d3b63;
            text-align: center;
        }

        label {
            display: block;
            margin-top: 15px;
            margin-bottom: 6px;
            font-weight: bold;
        }

        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font: inherit;
        }

        textarea { resize: vertical; }

        button {
            margin-top: 25px;
            padding: 12px;
            width: 100%;
            border: none;
            border-radius: 5px;
            background: #1d3b63;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover { background: #285487; }

        .volver {
            display: block;
            margin-top: 20px;
            text-align: center;
            color: #1d3b63;
        }
    </style>
</head>
<body>
    <main class="contenedor">
        <h1>Registrar producto</h1>
        <p>TECHSOLUTIONS-ECommerce</p>

        <form action="${pageContext.request.contextPath}/productos"
              method="post" accept-charset="UTF-8">

            <label for="idCategoria">ID de categoría</label>
            <input type="number" id="idCategoria"
                   name="idCategoria" min="1" required>

            <label for="nombreProducto">Nombre del producto</label>
            <input type="text" id="nombreProducto"
                   name="nombreProducto" maxlength="150" required>

            <label for="marca">Marca</label>
            <input type="text" id="marca"
                   name="marca" maxlength="100" required>

            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion"
                      rows="3"></textarea>

            <label for="precio">Precio</label>
            <input type="number" id="precio" name="precio"
                   min="0.01" step="0.01" required>

            <label for="stock">Cantidad disponible</label>
            <input type="number" id="stock" name="stock"
                   min="0" required>

            <label for="especificaciones">Especificaciones</label>
            <textarea id="especificaciones" name="especificaciones"
                      rows="3"></textarea>

            <label for="estado">Estado</label>
            <select id="estado" name="estado" required>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
            </select>

            <button type="submit">Guardar producto</button>
        </form>

        <a class="volver"
           href="${pageContext.request.contextPath}/productos">
            Volver al listado de productos
        </a>
    </main>
</body>
</html>