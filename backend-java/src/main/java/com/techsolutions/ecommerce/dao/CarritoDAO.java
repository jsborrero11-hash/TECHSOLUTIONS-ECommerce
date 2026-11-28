package com.techsolutions.ecommerce.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public final class CarritoDAO {
    public record Cabecera(int id, long revision) {}
    public record Linea(int idProducto, int cantidad, BigDecimal precio, int stock, String estado) {}

    public Cabecera bloquear(Connection c, int usuario, boolean crear) throws SQLException {
        if (crear) {
            Sql.cambiar(c, """
                    INSERT INTO carrito(id_usuario,fecha_creacion,estado) VALUES (?,UTC_TIMESTAMP(),'ACTIVO')
                    ON DUPLICATE KEY UPDATE id_carrito=id_carrito
                    """, usuario);
        }
        return Sql.uno(c, "SELECT id_carrito,revision FROM carrito WHERE id_usuario=? FOR UPDATE",
                rs -> new Cabecera(rs.getInt(1), rs.getLong(2)), usuario);
    }

    public List<Linea> lineas(Connection c, int carrito) throws SQLException {
        return Sql.lista(c, """
                SELECT p.id_producto,d.cantidad,p.precio,p.stock,p.estado
                FROM detalle_carrito d JOIN producto p USING(id_producto)
                WHERE d.id_carrito=? ORDER BY p.id_producto
                """, rs -> new Linea(rs.getInt(1), rs.getInt(2), rs.getBigDecimal(3), rs.getInt(4), rs.getString(5)), carrito);
    }

    public Integer cantidad(Connection c, int carrito, int producto) throws SQLException {
        return Sql.uno(c, "SELECT cantidad FROM detalle_carrito WHERE id_carrito=? AND id_producto=?",
                rs -> rs.getInt(1), carrito, producto);
    }

    public void fijar(Connection c, int carrito, int producto, int cantidad, BigDecimal precio) throws SQLException {
        Sql.cambiar(c, """
                INSERT INTO detalle_carrito(id_carrito,id_producto,cantidad,precio_unitario)
                VALUES (?,?,?,?) AS nuevo ON DUPLICATE KEY UPDATE
                cantidad=nuevo.cantidad,precio_unitario=nuevo.precio_unitario
                """, carrito, producto, cantidad, precio);
        incrementar(c, carrito);
    }

    public void quitar(Connection c, int carrito, int producto) throws SQLException {
        if (Sql.cambiar(c, "DELETE FROM detalle_carrito WHERE id_carrito=? AND id_producto=?", carrito, producto) > 0) {
            incrementar(c, carrito);
        }
    }

    public void vaciar(Connection c, int carrito) throws SQLException {
        if (Sql.cambiar(c, "DELETE FROM detalle_carrito WHERE id_carrito=?", carrito) > 0) {
            incrementar(c, carrito);
        }
    }

    private void incrementar(Connection c, int carrito) throws SQLException {
        Sql.cambiar(c, "UPDATE carrito SET revision=revision+1 WHERE id_carrito=?", carrito);
    }
}
