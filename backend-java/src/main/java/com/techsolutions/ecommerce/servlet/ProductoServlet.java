package com.techsolutions.ecommerce.servlet;

import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.modelo.Producto;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

/**
 * Este Servlet permite gestionar las solicitudes del módulo de productos.
 * Utilizo el método GET para mostrar el listado y el formulario, y el método POST para validar y registrar nuevos productos.
 */
@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {

    private final ProductoDAO productoDAO = new ProductoDAO();
/**
 * Atiende las solicitudes para consultar productos.
 * Si el usuario selecciona la opción de nuevo producto, muestra el formulario de registro.
 * En los demás casos, consulta y muestra los productos que están guardados en la base de datos.
 */
    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String accion = request.getParameter("accion");

        if ("nuevo".equals(accion)) {
            request.getRequestDispatcher(
                    "/WEB-INF/views/nuevo-producto.jsp"
            ).forward(request, response);
            return;
        }

        try {
            List<Producto> productos = productoDAO.listarTodos();
            request.setAttribute("productos", productos);

            request.getRequestDispatcher(
                    "/WEB-INF/views/productos.jsp"
            ).forward(request, response);

        } catch (SQLException e) {
            throw new ServletException(
                    "Error al consultar los productos.", e
            );
        }
    }
/**
 * Recibe los datos enviados desde el formulario de productos.
 * Verifica que los campos obligatorios tengan valores válidos y registra el producto en la base de datos.
 * Si ocurre un error, informa al usuario; si el registro es exitoso, lo redirige al listado de productos.
 */
    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        try {
            Producto producto = new Producto();

            producto.setIdCategoria(
                    Integer.parseInt(request.getParameter("idCategoria"))
            );
            producto.setNombreProducto(
                    request.getParameter("nombreProducto")
            );
            producto.setMarca(request.getParameter("marca"));
            producto.setDescripcion(request.getParameter("descripcion"));
            producto.setPrecio(
                    new BigDecimal(request.getParameter("precio"))
            );
            producto.setStock(
                    Integer.parseInt(request.getParameter("stock"))
            );
            producto.setEspecificaciones(
                    request.getParameter("especificaciones")
            );
            producto.setEstado(request.getParameter("estado"));

            if (producto.getIdCategoria() <= 0
                    || producto.getNombreProducto() == null
                    || producto.getNombreProducto().isBlank()
                    || producto.getMarca() == null
                    || producto.getMarca().isBlank()
                    || producto.getPrecio().compareTo(BigDecimal.ZERO) <= 0
                    || producto.getStock() < 0
                    || (!"ACTIVO".equals(producto.getEstado())
                        && !"INACTIVO".equals(producto.getEstado()))) {
                response.sendError(
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Los datos del producto no son válidos."
                );
                return;
            }

            productoDAO.insertar(producto);

            response.sendRedirect(
                    request.getContextPath() + "/productos"
            );

        } catch (NumberFormatException e) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Verifica los valores numéricos del formulario."
            );

        } catch (SQLException e) {
            throw new ServletException(
                    "Error al registrar el producto.", e
            );
        }
    }
}