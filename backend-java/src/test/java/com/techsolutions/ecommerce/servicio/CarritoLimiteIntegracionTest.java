package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.dao.Sql;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;

@EnabledIfEnvironmentVariable(named = "TECHSOLUTIONS_RUN_QA_INTEGRATION", matches = "true")
class CarritoLimiteIntegracionTest {
    private record Datos(int usuario, int carrito, int categoria, List<Integer> productos) {}

    @Test
    void aceptaDoscientosProductosYRechazaElSiguiente() throws SQLException {
        assertEquals("techsolutions_test", System.getenv("TECHSOLUTIONS_DB_NAME"));
        Datos datos = Sql.transaccion(c -> {
            assertEquals("techsolutions_test", c.getCatalog());
            String marca = "T14-" + UUID.randomUUID();
            int categoria = Sql.insertar(c, "INSERT INTO categoria(nombre_categoria) VALUES (?)", marca);
            int usuario = Sql.insertar(c, """
                    INSERT INTO usuario(nombre,apellido,correo,contrasena,rol)
                    VALUES ('Limite','QA',?,'fixture-sin-acceso','CLIENTE')
                    """, marca + "@example.test");
            int carrito = Sql.insertar(c, """
                    INSERT INTO carrito(id_usuario,fecha_creacion,estado) VALUES (?,UTC_TIMESTAMP(),'ACTIVO')
                    """, usuario);
            List<Integer> productos = new ArrayList<>();
            for (int i = 1; i <= 201; i++) {
                int producto = Sql.insertar(c, """
                        INSERT INTO producto(id_categoria,nombre_producto,marca,precio,stock,estado)
                        VALUES (?,?,'QA',1.00,99,'ACTIVO')
                        """, categoria, marca + "-" + i);
                productos.add(producto);
                if (i < 200) {
                    Sql.cambiar(c, """
                            INSERT INTO detalle_carrito(id_carrito,id_producto,cantidad,precio_unitario) VALUES (?,?,1,1.00)
                            """, carrito, producto);
                }
            }
            return new Datos(usuario, carrito, categoria, productos);
        });
        try {
            Carritos servicio = new Carritos();
            assertTrue(servicio.fijar(datos.usuario(), datos.productos().get(199), new Carritos.Cantidad(99)).creado());
            assertEquals(200, servicio.consultar(datos.usuario()).items().size());
            Fallo extra = assertThrows(Fallo.class,
                    () -> servicio.fijar(datos.usuario(), datos.productos().get(200), new Carritos.Cantidad(1)));
            assertEquals(409, extra.estado);
            assertEquals("CARRITO_LLENO", extra.codigo);
            assertEquals(200, servicio.consultar(datos.usuario()).items().size());
        } finally {
            Sql.transaccion(c -> {
                Sql.cambiar(c, "DELETE FROM detalle_carrito WHERE id_carrito=?", datos.carrito());
                Sql.cambiar(c, "DELETE FROM carrito WHERE id_carrito=?", datos.carrito());
                Sql.cambiar(c, "DELETE FROM producto WHERE id_categoria=?", datos.categoria());
                Sql.cambiar(c, "DELETE FROM categoria WHERE id_categoria=?", datos.categoria());
                Sql.cambiar(c, "DELETE FROM usuario WHERE id_usuario=?", datos.usuario());
                return null;
            });
        }
    }
}
