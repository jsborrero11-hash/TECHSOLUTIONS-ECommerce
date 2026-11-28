package com.techsolutions.ecommerce.api;

import com.techsolutions.ecommerce.seguridad.Seguridad;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/api/v1/*")
public final class ApiServlet extends HttpServlet {
    private final IdentidadApi identidad = new IdentidadApi();
    private final CatalogoApi catalogo = new CatalogoApi();
    private final CarritoApi carrito = new CarritoApi();
    private final PedidosApi pedidos = new PedidosApi();

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String solicitud = Json.iniciar(res);
        try {
            Seguridad.origen(req);
            aceptarJson(req.getHeader("Accept"));
            String ruta = req.getPathInfo();
            if (ruta == null) {
                throw Fallo.ausente();
            }
            switch (ruta) {
                case "/sesion" -> identidad.sesion(req, res, false);
                case "/sesion/csrf" -> identidad.sesion(req, res, true);
                case "/usuarios" -> identidad.registrar(req, res);
                case "/productos" -> catalogo.productos(req, res);
                case "/categorias" -> catalogo.categorias(req, res);
                case "/carrito" -> carrito.atender(req, res, null);
                case "/pedidos" -> pedidos.atender(req, res, null);
                default -> {
                    String[] partes = ruta.split("/", -1);
                    if (partes.length == 3 && "productos".equals(partes[1]) && !partes[2].isEmpty()) {
                        catalogo.producto(req, res, partes[2], false);
                    } else if (partes.length == 3 && "pedidos".equals(partes[1]) && !partes[2].isEmpty()) {
                        pedidos.atender(req, res, partes[2]);
                    } else if (partes.length == 4 && "productos".equals(partes[1]) && "stock".equals(partes[3])) {
                        catalogo.producto(req, res, partes[2], true);
                    } else if (partes.length == 4 && "carrito".equals(partes[1]) && "items".equals(partes[2])) {
                        carrito.atender(req, res, partes[3]);
                    } else {
                        throw Fallo.ausente();
                    }
                }
            }
        } catch (Fallo ex) {
            Json.error(res, ex, solicitud);
        } catch (SQLException ex) {
            getServletContext().log("Solicitud " + solicitud + ": error JDBC (" + ex.getSQLState() + ")");
            boolean temporal = ex instanceof java.sql.SQLTransientException
                    || ex.getSQLState() != null && ex.getSQLState().startsWith("08");
            Json.error(res, new Fallo(temporal ? 503 : 500, "ERROR_SERVICIO", "No fue posible completar la operación."), solicitud);
        } catch (IllegalStateException ex) {
            getServletContext().log("Solicitud " + solicitud + ": configuración o estado no disponible.");
            Json.error(res, new Fallo(503, "SERVICIO_NO_DISPONIBLE", "Servicio no disponible."), solicitud);
        } catch (RuntimeException ex) {
            getServletContext().log("Solicitud " + solicitud + ": " + ex.getClass().getSimpleName());
            Json.error(res, new Fallo(500, "ERROR_SERVICIO", "No fue posible completar la operación."), solicitud);
        }
    }

    private static void aceptarJson(String accept) {
        if (accept == null || accept.isBlank()) {
            return;
        }
        int especificidad = -1;
        boolean aceptado = false;
        for (String medio : accept.split(",")) {
            String[] partes = medio.strip().split(";");
            int actual = switch (partes[0].strip().toLowerCase(java.util.Locale.ROOT)) {
                case "application/json" -> 2;
                case "application/*" -> 1;
                case "*/*" -> 0;
                default -> -1;
            };
            if (actual < 0 || actual < especificidad) {
                continue;
            }
            boolean permitido = true;
            for (int i = 1; i < partes.length; i++) {
                String parametro = partes[i].strip();
                if (parametro.startsWith("q=")) {
                    try {
                        permitido = Double.parseDouble(parametro.substring(2)) > 0;
                    } catch (NumberFormatException ex) {
                        permitido = false;
                    }
                }
            }
            aceptado = actual > especificidad ? permitido : aceptado || permitido;
            especificidad = actual;
        }
        if (!aceptado) {
            throw new Fallo(406, "FORMATO_NO_ACEPTADO", "La API responde con JSON.");
        }
    }

    static void metodo(HttpServletRequest req, HttpServletResponse res, String... permitidos) {
        if (!List.of(permitidos).contains(req.getMethod())) {
            res.setHeader("Allow", String.join(", ", permitidos));
            throw new Fallo(405, "METODO_NO_PERMITIDO", "Método no permitido.");
        }
    }
}
