package com.techsolutions.ecommerce.api;

import com.techsolutions.ecommerce.seguridad.LimiteIntentos;
import com.techsolutions.ecommerce.seguridad.Seguridad;
import com.techsolutions.ecommerce.servicio.Usuarios;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

final class IdentidadApi {
    private final LimiteIntentos accesos = new LimiteIntentos(20, 60);
    private final LimiteIntentos altas = new LimiteIntentos(10, 60);

    void sesion(HttpServletRequest req, HttpServletResponse res, boolean csrf) throws IOException, SQLException {
        if (csrf) {
            ApiServlet.metodo(req, res, "GET");
            Json.responder(res, 200, Map.of("tokenCsrf", Seguridad.token(req)));
            return;
        }
        ApiServlet.metodo(req, res, "GET", "POST", "DELETE");
        switch (req.getMethod()) {
            case "GET" -> Json.responder(res, 200, Seguridad.exigir(req, null));
            case "POST" -> {
                accesos.comprobar(req.getRemoteAddr());
                if (Seguridad.identidad(req) != null) {
                    throw Fallo.conflicto("SESION_ACTIVA", "Cierra la sesión actual.");
                }
                Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
                var identidad = Usuarios.acceso(Json.leer(req, Usuarios.Acceso.class));
                Json.responder(res, 200, Map.of("usuario", identidad, "tokenCsrf", Seguridad.autenticar(req, identidad)));
            }
            case "DELETE" -> {
                Seguridad.exigir(req, null);
                Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
                req.getSession(false).invalidate();
                Cookie cookie = new Cookie("JSESSIONID", "");
                cookie.setPath(req.getContextPath().isEmpty() ? "/" : req.getContextPath());
                cookie.setHttpOnly(true);
                cookie.setSecure(req.isSecure());
                cookie.setAttribute("SameSite", "Lax");
                cookie.setMaxAge(0);
                res.addCookie(cookie);
                Json.responder(res, 204, null);
            }
            default -> throw new IllegalStateException();
        }
    }

    void registrar(HttpServletRequest req, HttpServletResponse res) throws IOException, SQLException {
        ApiServlet.metodo(req, res, "POST");
        altas.comprobar(req.getRemoteAddr());
        Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
        Json.responder(res, 201, Usuarios.registrar(Json.leer(req, Usuarios.Registro.class)));
    }
}
