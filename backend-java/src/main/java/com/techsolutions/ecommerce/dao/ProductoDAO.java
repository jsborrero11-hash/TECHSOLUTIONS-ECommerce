package com.techsolutions.ecommerce.dao;

import com.techsolutions.ecommerce.conexion.ConexionBD;
import com.techsolutions.ecommerce.modelo.Producto;
import com.techsolutions.ecommerce.servicio.Catalogo.Vista;
import com.techsolutions.ecommerce.validacion.Validar;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ProductoDAO {

    private static final String JOIN_CATEGORIA = """
            FROM producto p JOIN categoria c USING (id_categoria)
            """;

    public Validar.Lista<Vista> buscar(String q, Integer categoria, String estado, Validar.Pagina pagina) throws SQLException {
        List<Object> filtros = new ArrayList<>();
        StringBuilder condiciones = new StringBuilder(" WHERE 1=1");
        if (!"TODOS".equals(estado)) {
            condiciones.append(" AND p.estado=?");
            filtros.add(estado);
        }
        if (categoria != null) {
            condiciones.append(" AND p.id_categoria=?");
            filtros.add(categoria);
        }
        if (q != null && !q.isBlank()) {
            condiciones.append("""
                     AND (LOCATE(?,p.nombre_producto)>0 OR LOCATE(?,p.marca)>0
                          OR LOCATE(?,p.descripcion)>0 OR LOCATE(?,c.nombre_categoria)>0)
                    """);
            filtros.addAll(List.of(q.strip(), q.strip(), q.strip(), q.strip()));
        }
        return Sql.conectar(c -> {
            long total = Sql.uno(c, "SELECT COUNT(*) " + JOIN_CATEGORIA + condiciones, rs -> rs.getLong(1), filtros.toArray());
            filtros.add(pagina.tamano());
            filtros.add(pagina.offset());
            List<Vista> items = Sql.lista(c, "SELECT p.*,c.nombre_categoria " + JOIN_CATEGORIA
                    + condiciones + " ORDER BY p.id_producto LIMIT ? OFFSET ?", this::vista, filtros.toArray());
            return new Validar.Lista<>(items, pagina.numero(), pagina.tamano(), total);
        });
    }

    public Vista detalle(int id) throws SQLException {
        return Sql.conectar(c -> Sql.uno(c, "SELECT p.*,c.nombre_categoria " + JOIN_CATEGORIA
                + " WHERE p.id_producto=?", this::vista, id));
    }

    private Vista vista(ResultSet rs) throws SQLException {
        return Vista.desde(convertirProducto(rs), rs.getString("nombre_categoria"));
    }

    public List<Producto> listarActivos() throws SQLException {
        return Sql.conectar(c -> Sql.lista(c, "SELECT * FROM producto WHERE estado='ACTIVO' ORDER BY id_producto",
                this::convertirProducto));
    }

    public boolean actualizarCatalogo(Producto p) throws SQLException {
        return Sql.conectar(c -> Sql.cambiar(c, """
                UPDATE producto SET id_categoria=?,nombre_producto=?,marca=?,descripcion=?,
                    precio=?,especificaciones=?,estado=? WHERE id_producto=?
                """, p.getIdCategoria(), p.getNombreProducto(), p.getMarca(), p.getDescripcion(),
                p.getPrecio(), p.getEspecificaciones(), p.getEstado(), p.getIdProducto()) > 0);
    }

    public Producto bloquear(Connection c, int id) throws SQLException {
        return Sql.uno(c, "SELECT * FROM producto WHERE id_producto=? FOR UPDATE", this::convertirProducto, id);
    }

    public boolean ajustarStock(Connection c, int id, int esperado, int nuevo) throws SQLException {
        return Sql.cambiar(c, "UPDATE producto SET stock=? WHERE id_producto=? AND stock=?",
                nuevo, id, esperado) > 0;
    }

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
