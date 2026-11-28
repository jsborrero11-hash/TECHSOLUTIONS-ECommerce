package com.techsolutions.ecommerce.api;

import com.techsolutions.ecommerce.seguridad.Seguridad;
import com.techsolutions.ecommerce.servicio.Pedidos;
import com.techsolutions.ecommerce.validacion.Validar;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

final class PedidosApi {
    private final Pedidos pedidos = new Pedidos();

    void atender(HttpServletRequest req, HttpServletResponse res, String id) throws IOException, SQLException {
        if (id == null) {
            ApiServlet.metodo(req, res, "GET", "POST");
        } else {
            ApiServlet.metodo(req, res, "GET");
        }
        int usuario = Seguridad.exigir(req, "CLIENTE").idUsuario();
        if (id != null) {
            Json.responder(res, 200, pedidos.detalle(usuario, Validar.id(id)));
        } else if ("GET".equals(req.getMethod())) {
            Json.responder(res, 200, pedidos.listar(usuario, CatalogoApi.pagina(req)));
        } else {
            Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
            var resultado = pedidos.crear(usuario, req.getHeader("Idempotency-Key"), Json.leer(req, Pedidos.Confirmar.class));
            if (resultado.creado()) {
                res.setHeader("Location", req.getContextPath() + "/api/v1/pedidos/" + resultado.pedido().idPedido());
            }
            Json.responder(res, resultado.creado() ? 201 : 200, resultado.pedido());
        }
    }
}
