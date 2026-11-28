package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.dao.CarritoDAO;
import com.techsolutions.ecommerce.dao.Sql;
import com.techsolutions.ecommerce.seguridad.ConfirmacionCarrito;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;

@EnabledIfEnvironmentVariable(named = "TECHSOLUTIONS_RUN_QA_INTEGRATION", matches = "true")
class PedidosIntegracionTest {
    @Test
    void reviertePedidoDetallesStockYCarritoTrasUnaFallaAntesDelCommit() throws SQLException {
        assertEquals("techsolutions_test", System.getenv("TECHSOLUTIONS_DB_NAME"));
        var base = Sql.conectar(c -> {
            assertEquals("techsolutions_test", c.getCatalog());
            return Sql.uno(c, """
                    SELECT id_producto,stock FROM producto
                    WHERE nombre_producto='Monitor Aula QA' AND estado='ACTIVO' AND stock>0
                    ORDER BY id_producto LIMIT 1
                    """, rs -> new Existencia(rs.getInt(1), rs.getInt(2)));
        });
        assertNotNull(base, "Carga los datos ficticios de 84.4");
        String correo = UUID.randomUUID() + "@example.test";
        String clave = UUID.randomUUID().toString();
        CarritoDAO dao = new CarritoDAO();
        var datos = Sql.transaccion(c -> {
            int u = Sql.insertar(c, """
                    INSERT INTO usuario(nombre,apellido,correo,contrasena,rol)
                    VALUES ('Integracion','QA',?,'fixture-sin-acceso','CLIENTE')
                    """, correo);
            var cabecera = dao.bloquear(c, u, true);
            var precio = Sql.uno(c, "SELECT precio FROM producto WHERE id_producto=?", rs -> rs.getBigDecimal(1), base.id());
            dao.fijar(c, cabecera.id(), base.id(), 1, precio);
            return new CarritoPrueba(u, cabecera.id(), cabecera.revision() + 1, precio);
        });
        int[] idPedido = new int[1];
        try {
            SQLException fallo = assertThrows(SQLException.class, () -> Sql.transaccion(c -> {
                String token = ConfirmacionCarrito.configurada().emitir(datos.usuario(), datos.revision(),
                        List.of(Carritos.cotizar(base.id(), 1, datos.precio())));
                var resultado = new Pedidos().confirmar(c, datos.usuario(), clave, token, "0".repeat(64));
                idPedido[0] = resultado.pedido().idPedido();
                assertTrue(resultado.creado());
                assertEquals(1, resultado.pedido().items().size());
                assertTrue(dao.lineas(c, datos.carrito()).isEmpty());
                int stockDurante = Sql.uno(c, "SELECT stock FROM producto WHERE id_producto=?",
                        rs -> rs.getInt(1), base.id());
                assertEquals(base.stock() - 1, stockDurante);
                throw new SQLException("Fallo QA inducido antes del commit");
            }));
            assertEquals("Fallo QA inducido antes del commit", fallo.getMessage());
            Sql.conectar(c -> {
                int stock = Sql.uno(c, "SELECT stock FROM producto WHERE id_producto=?", rs -> rs.getInt(1), base.id());
                int pedidos = Sql.uno(c, "SELECT COUNT(*) FROM pedido WHERE clave_idempotencia=?", rs -> rs.getInt(1), clave);
                int detalles = Sql.uno(c, "SELECT COUNT(*) FROM detalle_pedido WHERE id_pedido=?", rs -> rs.getInt(1), idPedido[0]);
                var cabecera = dao.bloquear(c, datos.usuario(), false);
                var lineas = dao.lineas(c, cabecera.id());
                assertEquals(base.stock(), stock);
                assertEquals(0, pedidos);
                assertEquals(0, detalles);
                assertEquals(datos.revision(), cabecera.revision());
                assertEquals(1, lineas.size());
                assertEquals(base.id(), lineas.getFirst().idProducto());
                assertEquals(1, lineas.getFirst().cantidad());
                return null;
            });
        } finally {
            Sql.transaccion(c -> {
                Sql.cambiar(c, "DELETE FROM detalle_carrito WHERE id_carrito=?", datos.carrito());
                Sql.cambiar(c, "DELETE FROM carrito WHERE id_carrito=?", datos.carrito());
                Sql.cambiar(c, "DELETE FROM usuario WHERE id_usuario=?", datos.usuario());
                return null;
            });
        }
    }

    private record Existencia(int id, int stock) {}
    private record CarritoPrueba(int usuario, int carrito, long revision, java.math.BigDecimal precio) {}
}
