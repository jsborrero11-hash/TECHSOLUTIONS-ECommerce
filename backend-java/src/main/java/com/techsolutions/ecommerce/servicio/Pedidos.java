package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.dao.CarritoDAO;
import com.techsolutions.ecommerce.dao.PedidoDAO;
import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.dao.Sql;
import com.techsolutions.ecommerce.modelo.Producto;
import com.techsolutions.ecommerce.seguridad.ConfirmacionCarrito;
import com.techsolutions.ecommerce.validacion.Validar;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

public final class Pedidos {
    private static final BigDecimal IMPORTE_MAXIMO = new BigDecimal("9999999999.99");

    private final PedidoDAO pedidos = new PedidoDAO();
    private final CarritoDAO carritos = new CarritoDAO();
    private final ProductoDAO productos = new ProductoDAO();

    public record Confirmar(String confirmacionCarrito) {}
    public record Resultado(boolean creado, PedidoDAO.Pedido pedido) {}
    private record Linea(Producto producto, int cantidad, BigDecimal subtotal) {}

    public Resultado crear(int usuario, String encabezado, Confirmar confirmar) throws SQLException {
        String clave = clave(encabezado);
        String token = confirmar.confirmacionCarrito();
        if (token == null || token.isBlank() || token.length() > 60000) {
            throw Fallo.entrada("Confirmación de carrito inválida.");
        }
        String huella = huella(token);
        return Sql.transaccion(c -> confirmar(c, usuario, clave, token, huella));
    }

    Resultado confirmar(Connection c, int usuario, String clave, String token, String huella) throws SQLException {
        Resultado previo = recuperar(c, usuario, clave, huella);
        if (previo != null) {
            return previo;
        }
        var cabecera = carritos.bloquear(c, usuario, false);
        previo = recuperar(c, usuario, clave, huella);
        if (previo != null) {
            return previo;
        }

        var cotizacion = ConfirmacionCarrito.configurada().verificar(token, usuario);
        if (cabecera == null) {
            throw Fallo.conflicto("CARRITO_VACIO", "El carrito está vacío.");
        }
        if (cabecera.revision() != cotizacion.revision()) {
            throw cotizacionModificada();
        }
        List<CarritoDAO.Linea> items = carritos.lineas(c, cabecera.id());
        if (items.isEmpty()) {
            throw Fallo.conflicto("CARRITO_VACIO", "El carrito está vacío.");
        }
        List<Linea> lineas = confirmarLineas(c, items, cotizacion);
        BigDecimal total = lineas.stream().map(Linea::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(IMPORTE_MAXIMO) > 0) {
            throw Fallo.dato("El total supera la capacidad monetaria del pedido.");
        }
        int id = pedidos.crear(c, usuario, total, clave, huella);
        for (Linea linea : lineas) {
            Producto producto = linea.producto();
            pedidos.agregar(c, id, producto.getIdProducto(), linea.cantidad(), producto.getPrecio(), linea.subtotal());
            if (!productos.ajustarStock(c, producto.getIdProducto(), producto.getStock(),
                    producto.getStock() - linea.cantidad())) {
                throw cotizacionModificada();
            }
        }
        carritos.vaciar(c, cabecera.id());
        return new Resultado(true, pedidos.detalle(c, usuario, id));
    }

    private List<Linea> confirmarLineas(Connection c, List<CarritoDAO.Linea> items,
                                        ConfirmacionCarrito.Cotizacion cotizacion) throws SQLException {
        List<Linea> lineas = new ArrayList<>();
        List<ConfirmacionCarrito.Linea> vigentes = new ArrayList<>();
        // El DAO retorna los ítems en orden ascendente de producto para estabilizar los bloqueos.
        for (var item : items) {
            Producto producto = productos.bloquear(c, item.idProducto());
            if (producto == null || producto.getPrecio().signum() <= 0
                    || !Carritos.disponible(producto.getEstado(), producto.getStock(), item.cantidad())) {
                throw Fallo.conflicto("PRODUCTO_NO_DISPONIBLE", "Consulta el carrito y confirma nuevamente.");
            }
            vigentes.add(Carritos.cotizar(item.idProducto(), item.cantidad(), producto.getPrecio()));
            lineas.add(new Linea(producto, item.cantidad(), Carritos.subtotal(producto.getPrecio(), item.cantidad())));
        }
        if (!vigentes.equals(cotizacion.items())) {
            throw cotizacionModificada();
        }
        return lineas;
    }

    private Resultado recuperar(Connection c, int usuario, String clave, String huella) throws SQLException {
        var previo = pedidos.referencia(c, usuario, clave);
        if (previo == null) {
            return null;
        }
        if (!huella.equals(previo.huella())) {
            throw Fallo.conflicto("CLAVE_IDEMPOTENCIA_EN_USO", "La clave ya corresponde a otra solicitud.");
        }
        return new Resultado(false, pedidos.detalle(c, usuario, previo.id()));
    }

    public Validar.Lista<PedidoDAO.Resumen> listar(int usuario, Validar.Pagina pagina) throws SQLException {
        return pedidos.listar(usuario, pagina);
    }

    public PedidoDAO.Pedido detalle(int usuario, int id) throws SQLException {
        var pedido = Sql.conectar(c -> pedidos.detalle(c, usuario, id));
        if (pedido == null) {
            throw Fallo.ausente();
        }
        return pedido;
    }

    static String clave(String valor) {
        if (valor == null || !valor.matches("(?i)[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}")) {
            throw Fallo.entrada("Idempotency-Key requiere un UUID.");
        }
        return UUID.fromString(valor).toString();
    }

    private static String huella(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no disponible.", ex);
        }
    }

    private static Fallo cotizacionModificada() {
        return Fallo.conflicto("CONFIRMACION_MODIFICADA", "Consulta el carrito y confirma nuevamente.");
    }
}
