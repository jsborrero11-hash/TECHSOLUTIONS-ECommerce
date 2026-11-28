package com.techsolutions.ecommerce.api;

import com.techsolutions.ecommerce.seguridad.Seguridad;
import com.techsolutions.ecommerce.servicio.Catalogo;
import com.techsolutions.ecommerce.validacion.Validar;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

final class CatalogoApi {
    private final Catalogo catalogo = new Catalogo();

    void categorias(HttpServletRequest req, HttpServletResponse res) throws IOException, SQLException {
        ApiServlet.metodo(req, res, "GET");
        Json.responder(res, 200, catalogo.categorias(pagina(req)));
    }

    void productos(HttpServletRequest req, HttpServletResponse res) throws IOException, SQLException {
        ApiServlet.metodo(req, res, "GET", "POST");
        if ("POST".equals(req.getMethod())) {
            adminEscritura(req);
            var producto = catalogo.crear(Json.leer(req, Catalogo.Datos.class));
            res.setHeader("Location", req.getContextPath() + "/api/v1/productos/" + producto.idProducto());
            Json.responder(res, 201, producto);
            return;
        }
        String estado = req.getParameter("estado");
        estado = estado == null ? "ACTIVO" : estado;
        if (!java.util.Set.of("ACTIVO", "INACTIVO", "TODOS").contains(estado)) {
            throw Fallo.entrada("Filtro de estado inválido.");
        }
        if (!"ACTIVO".equals(estado) && !administrador(req)) {
            throw new Fallo(403, "ROL_DENEGADO", "El filtro requiere privilegios de administrador.");
        }
        String categoria = req.getParameter("idCategoria");
        String q = req.getParameter("q");
        if (q != null && q.codePointCount(0, q.length()) > 100) {
            throw Fallo.entrada("q excede su longitud.");
        }
        Json.responder(res, 200, catalogo.listar(q, categoria == null ? null : Validar.id(categoria), estado, pagina(req)));
    }

    void producto(HttpServletRequest req, HttpServletResponse res, String segmento, boolean stock)
            throws IOException, SQLException {
        if (stock) {
            ApiServlet.metodo(req, res, "PATCH");
            adminEscritura(req);
            Json.responder(res, 200, catalogo.ajustar(Validar.id(segmento), Json.leer(req, Catalogo.Stock.class)));
            return;
        }
        ApiServlet.metodo(req, res, "GET", "PUT", "DELETE");
        int id = Validar.id(segmento);
        switch (req.getMethod()) {
            case "GET" -> Json.responder(res, 200, catalogo.detalle(id, administrador(req)));
            case "PUT" -> {
                adminEscritura(req);
                Json.responder(res, 200, catalogo.editar(id, Json.leer(req, Catalogo.Edicion.class)));
            }
            case "DELETE" -> {
                adminEscritura(req);
                catalogo.eliminar(id);
                Json.responder(res, 204, null);
            }
            default -> throw new IllegalStateException();
        }
    }

    static Validar.Pagina pagina(HttpServletRequest req) {
        return Validar.pagina(req.getParameter("pagina"), req.getParameter("tamano"));
    }

    private static boolean administrador(HttpServletRequest req) {
        var identidad = Seguridad.identidad(req);
        return identidad != null && "ADMIN".equals(identidad.rol());
    }

    private static void adminEscritura(HttpServletRequest req) {
        Seguridad.exigir(req, "ADMIN");
        Seguridad.csrf(req, req.getHeader("X-CSRF-Token"));
    }
}
