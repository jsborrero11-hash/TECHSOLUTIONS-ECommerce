package com.techsolutions.ecommerce.dao;

import com.techsolutions.ecommerce.conexion.ConexionBD;
import com.techsolutions.ecommerce.modelo.Producto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ProductoDAO {

    // CREATE: Registrar un producto
    public int insertar(Producto producto) throws SQLException {

        String sql = """
                INSERT INTO producto
                (id_categoria, nombre_producto, marca, descripcion,
                 precio, stock, especificaciones, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            sentencia.setInt(1, producto.getIdCategoria());
            sentencia.setString(2, producto.getNombreProducto());
            sentencia.setString(3, producto.getMarca());
            sentencia.setString(4, producto.getDescripcion());
            sentencia.setBigDecimal(5, producto.getPrecio());
            sentencia.setInt(6, producto.getStock());
            sentencia.setString(7, producto.getEspecificaciones());
            sentencia.setString(8, producto.getEstado());

            int filas = sentencia.executeUpdate();

            if (filas > 0) {
                try (ResultSet claves = sentencia.getGeneratedKeys()) {
                    if (claves.next()) {
                        int idGenerado = claves.getInt(1);
                        producto.setIdProducto(idGenerado);
                        return idGenerado;
                    }
                }
            }

            throw new SQLException(
                    "No se pudo obtener el ID del producto insertado.");
        }
    }

    // READ: Consultar un producto por ID
    public Producto consultarPorId(int idProducto) throws SQLException {

        String sql = "SELECT * FROM producto WHERE id_producto = ?";

        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(sql)) {

            sentencia.setInt(1, idProducto);

            try (ResultSet resultado = sentencia.executeQuery()) {
                if (resultado.next()) {
                    return convertirProducto(resultado);
                }
            }
        }

        return null;
    }

    // READ: Consultar todos los productos
    public List<Producto> listarTodos() throws SQLException {

        List<Producto> productos = new ArrayList<>();

        String sql = "SELECT * FROM producto ORDER BY id_producto";

        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(sql);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                productos.add(convertirProducto(resultado));
            }
        }

        return productos;
    }

    // UPDATE: Actualizar un producto
    public boolean actualizar(Producto producto) throws SQLException {

        String sql = """
                UPDATE producto
                SET id_categoria = ?, nombre_producto = ?, marca = ?,
                    descripcion = ?, precio = ?, stock = ?,
                    especificaciones = ?, estado = ?
                WHERE id_producto = ?
                """;

        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(sql)) {

            sentencia.setInt(1, producto.getIdCategoria());
            sentencia.setString(2, producto.getNombreProducto());
            sentencia.setString(3, producto.getMarca());
            sentencia.setString(4, producto.getDescripcion());
            sentencia.setBigDecimal(5, producto.getPrecio());
            sentencia.setInt(6, producto.getStock());
            sentencia.setString(7, producto.getEspecificaciones());
            sentencia.setString(8, producto.getEstado());
            sentencia.setInt(9, producto.getIdProducto());

            return sentencia.executeUpdate() > 0;
        }
    }

    // DELETE: Eliminar un producto por ID
    public boolean eliminar(int idProducto) throws SQLException {

        String sql = "DELETE FROM producto WHERE id_producto = ?";

        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(sql)) {

            sentencia.setInt(1, idProducto);

            return sentencia.executeUpdate() > 0;
        }
    }

    // Convertir una fila de MySQL en un objeto Producto
    private Producto convertirProducto(ResultSet resultado)
            throws SQLException {

        Producto producto = new Producto();

        producto.setIdProducto(resultado.getInt("id_producto"));
        producto.setIdCategoria(resultado.getInt("id_categoria"));
        producto.setNombreProducto(resultado.getString("nombre_producto"));
        producto.setMarca(resultado.getString("marca"));
        producto.setDescripcion(resultado.getString("descripcion"));
        producto.setPrecio(resultado.getBigDecimal("precio"));
        producto.setStock(resultado.getInt("stock"));
        producto.setEspecificaciones(
                resultado.getString("especificaciones"));
        producto.setEstado(resultado.getString("estado"));

        return producto;
    }
}