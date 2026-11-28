package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.dao.CarritoDAO;
import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.dao.Sql;
import com.techsolutions.ecommerce.seguridad.ConfirmacionCarrito;
import com.techsolutions.ecommerce.validacion.Validar;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public final class Carritos {
    private final CarritoDAO carritos = new CarritoDAO();
    private final ProductoDAO productos = new ProductoDAO();

    public record Cantidad(Integer cantidad) {}
    public record Item(int idProducto, int cantidad, String precioUnitario, String subtotal, boolean disponible) {}
    public record Vista(List<Item> items, String subtotalEstimado, String confirmacionCarrito) {}
    public record Fijado(boolean creado, Item item) {}

    public Vista consultar(int usuario) throws SQLException {
        return Sql.transaccion(c -> {
            var cabecera = carritos.bloquear(c, usuario, false);
            List<CarritoDAO.Linea> lineas = cabecera == null ? List.of() : carritos.lineas(c, cabecera.id());
            BigDecimal total = lineas.stream().map(linea -> subtotal(linea.precio(), linea.cantidad()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String token = ConfirmacionCarrito.configurada().emitir(usuario, cabecera == null ? 0 : cabecera.revision(),
                    lineas.stream().map(l -> cotizar(l.idProducto(), l.cantidad(), l.precio())).toList());
            return new Vista(lineas.stream().map(l -> item(l.idProducto(), l.cantidad(), l.precio(),
                    disponible(l.estado(), l.stock(), l.cantidad()))).toList(), Validar.dinero(total), token);
        });
    }

    public Fijado fijar(int usuario, int id, Cantidad datos) throws SQLException {
        int cantidad = Validar.rango(datos.cantidad(), 1, 99, "cantidad");
        return Sql.transaccion(c -> {
            var carrito = carritos.bloquear(c, usuario, true);
            var producto = productos.bloquear(c, id);
            if (producto == null) {
                throw Fallo.ausente();
            }
            if (!disponible(producto.getEstado(), producto.getStock(), cantidad)) {
                throw Fallo.conflicto("PRODUCTO_NO_DISPONIBLE", "Producto inactivo o stock insuficiente.");
            }
            Integer anterior = carritos.cantidad(c, carrito.id(), id);
            if (anterior == null || anterior != cantidad) {
                if (anterior == null && carritos.lineas(c, carrito.id()).size() >= 200) {
                    throw Fallo.conflicto("CARRITO_LLENO", "El carrito admite hasta 200 productos distintos.");
                }
                carritos.fijar(c, carrito.id(), id, cantidad, producto.getPrecio());
            }
            return new Fijado(anterior == null, item(id, cantidad, producto.getPrecio(), true));
        });
    }

    public void quitar(int usuario, Integer id) throws SQLException {
        Sql.transaccion(c -> {
            var cabecera = carritos.bloquear(c, usuario, false);
            if (cabecera != null) {
                if (id == null) {
                    carritos.vaciar(c, cabecera.id());
                } else {
                    carritos.quitar(c, cabecera.id(), id);
                }
            }
            return null;
        });
    }

    static boolean disponible(String estado, int stock, int cantidad) {
        return "ACTIVO".equals(estado) && stock >= cantidad;
    }

    static BigDecimal subtotal(BigDecimal precio, int cantidad) {
        return precio.multiply(BigDecimal.valueOf(cantidad));
    }

    static ConfirmacionCarrito.Linea cotizar(int id, int cantidad, BigDecimal precio) {
        return new ConfirmacionCarrito.Linea(id, cantidad, Validar.dinero(precio));
    }

    private static Item item(int id, int cantidad, BigDecimal precio, boolean disponible) {
        return new Item(id, cantidad, Validar.dinero(precio), Validar.dinero(subtotal(precio, cantidad)), disponible);
    }
}
