package com.techsolutions.ecommerce.dao;

import com.techsolutions.ecommerce.validacion.Validar;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

public final class PedidoDAO {
    public record Resumen(int idPedido, String fechaPedido, String estado, String total) {}
    public record Detalle(int idProducto, int cantidad, String precioUnitario, String subtotal) {}
    public record Pedido(int idPedido, String fechaPedido, String estado, List<Detalle> items, String total) {}
    public record Referencia(int id, String huella) {}

    public Referencia referencia(Connection c, int usuario, String clave) throws SQLException {
        return Sql.uno(c, """
                SELECT id_pedido,huella_solicitud FROM pedido WHERE id_usuario=? AND clave_idempotencia=?
                """, rs -> new Referencia(rs.getInt(1), rs.getString(2)), usuario, clave);
    }

    public Pedido detalle(Connection c, int usuario, int id) throws SQLException {
        Resumen resumen = Sql.uno(c, """
                SELECT id_pedido,fecha_pedido,estado,total FROM pedido WHERE id_usuario=? AND id_pedido=?
                """, PedidoDAO::resumen, usuario, id);
        if (resumen == null) {
            return null;
        }
        List<Detalle> items = Sql.lista(c, """
                SELECT id_producto,cantidad,precio_unitario,subtotal FROM detalle_pedido
                WHERE id_pedido=? ORDER BY id_detalle_pedido
                """, rs -> new Detalle(rs.getInt(1), rs.getInt(2), Validar.dinero(rs.getBigDecimal(3)),
                Validar.dinero(rs.getBigDecimal(4))), id);
        return new Pedido(id, resumen.fechaPedido(), resumen.estado(), items, resumen.total());
    }

    public Validar.Lista<Resumen> listar(int usuario, Validar.Pagina pagina) throws SQLException {
        return Sql.conectar(c -> new Validar.Lista<>(Sql.lista(c, """
                SELECT id_pedido,fecha_pedido,estado,total FROM pedido WHERE id_usuario=?
                ORDER BY id_pedido DESC LIMIT ? OFFSET ?
                """, PedidoDAO::resumen, usuario, pagina.tamano(), pagina.offset()),
                pagina.numero(), pagina.tamano(), Sql.uno(c, "SELECT COUNT(*) FROM pedido WHERE id_usuario=?",
                rs -> rs.getLong(1), usuario)));
    }

    public int crear(Connection c, int usuario, BigDecimal total, String clave, String huella) throws SQLException {
        return Sql.insertar(c, """
                INSERT INTO pedido(id_usuario,fecha_pedido,total,estado,clave_idempotencia,huella_solicitud)
                VALUES (?,UTC_TIMESTAMP(),?,'REGISTRADO',?,?)
                """, usuario, total, clave, huella);
    }

    public void agregar(Connection c, int pedido, int producto, int cantidad, BigDecimal precio, BigDecimal subtotal)
            throws SQLException {
        Sql.cambiar(c, """
                INSERT INTO detalle_pedido(id_pedido,id_producto,cantidad,precio_unitario,subtotal) VALUES (?,?,?,?,?)
                """, pedido, producto, cantidad, precio, subtotal);
    }

    private static Resumen resumen(ResultSet rs) throws SQLException {
        return new Resumen(rs.getInt(1), rs.getObject(2, LocalDateTime.class).toInstant(ZoneOffset.UTC).toString(),
                rs.getString(3), Validar.dinero(rs.getBigDecimal(4)));
    }
}
