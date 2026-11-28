package com.techsolutions.ecommerce.servlet;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.seguridad.Seguridad;
import com.techsolutions.ecommerce.servicio.Catalogo;
import com.techsolutions.ecommerce.validacion.Validar;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {
    private final Catalogo catalogo = new Catalogo();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        try {
            if ("nuevo".equals(req.getParameter("accion"))) {
                Seguridad.exigir(req, "ADMIN");
                req.setAttribute("csrf", Seguridad.token(req));
                res.setHeader("Cache-Control", "no-store");
                req.getRequestDispatcher("/WEB-INF/views/nuevo-producto.jsp").forward(req, res);
                return;
            }
            req.setAttribute("productos", catalogo.listarHistorico());
            var identidad = Seguridad.identidad(req);
            req.setAttribute("administrador", identidad != null && "ADMIN".equals(identidad.rol()));
            res.setHeader("Cache-Control", "no-store");
            req.getRequestDispatcher("/WEB-INF/views/productos.jsp").forward(req, res);
        } catch (Fallo ex) {
            res.sendError(ex.estado);
        } catch (SQLException | IllegalStateException ex) {
            throw new ServletException("No fue posible consultar productos.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        try {
            Seguridad.exigir(req, "ADMIN");
            Seguridad.csrf(req, req.getParameter("csrf"));
            var datos = new Catalogo.Datos(Validar.id(req.getParameter("idCategoria")),
                    req.getParameter("nombreProducto"), req.getParameter("marca"), req.getParameter("descripcion"),
                    req.getParameter("precio"), req.getParameter("especificaciones"), req.getParameter("estado"),
                    Integer.valueOf(req.getParameter("stock")));
            catalogo.crear(datos);
            res.sendRedirect(req.getContextPath() + "/productos");
        } catch (Fallo ex) {
            res.sendError(ex.estado, ex.getMessage());
        } catch (NumberFormatException ex) {
            res.sendError(400, "Verifica los valores numéricos.");
        } catch (SQLException | IllegalStateException ex) {
            throw new ServletException("No fue posible registrar el producto.");
        }
    }
}
