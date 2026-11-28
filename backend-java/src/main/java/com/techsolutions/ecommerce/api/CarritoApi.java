package com.techsolutions.ecommerce.api;

import com.techsolutions.ecommerce.seguridad.Seguridad;
import com.techsolutions.ecommerce.servicio.Carritos;
import com.techsolutions.ecommerce.validacion.Validar;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

final class CarritoApi {
    private final Carritos carritos = new Carritos();

    void atender(HttpServletRequest req, HttpServletResponse res, String producto) throws IOException, SQLException {
        if (producto == null) {
            ApiServlet.metodo(req, res, "GET", "DELETE");
        } else {
            ApiServlet.metodo(req, res, "PUT", "DELETE");
        }
        int usuario = Seguridad.exigir(req, "CLIENTE").idUsuario();
        if ("GET".equals(req.getMethod())) {
            Json.responder(res, 200, carritos.consultar(usuario));
            return;
        }
        Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
        Integer id = producto == null ? null : Validar.id(producto);
        if ("PUT".equals(req.getMethod())) {
            var fijado = carritos.fijar(usuario, id, Json.leer(req, Carritos.Cantidad.class));
            if (fijado.creado()) {
                res.setHeader("Location", req.getContextPath() + "/api/v1/carrito/items/" + id);
            }
            Json.responder(res, fijado.creado() ? 201 : 200, fijado.item());
            return;
        }
        carritos.quitar(usuario, id);
        Json.responder(res, 204, null);
    }
}
