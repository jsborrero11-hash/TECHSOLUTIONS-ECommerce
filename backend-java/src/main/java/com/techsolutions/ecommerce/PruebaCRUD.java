package com.techsolutions.ecommerce;

import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.modelo.Producto;
import java.sql.SQLException;
import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;

public class PruebaCRUD {

    public static void main(String[] args) {

        ProductoDAO productoDAO = new ProductoDAO();

        System.out.println("=== PRUEBA CRUD - TECHSOLUTIONS ===");
        System.out.println("Operación: DELETE - Eliminar producto");

        int idProducto = 3;

        try {
            Producto producto = productoDAO.consultarPorId(idProducto);

            if (producto == null) {
                System.out.println(
                        "No existe el producto con ID: " + idProducto);
                return;
            }

            if (!"Mouse Logitech Actualizado JDBC"
                    .equals(producto.getNombreProducto())) {
                System.out.println(
                        "El producto no coincide con el registro de prueba.");
                System.out.println("No se realizará la eliminación.");
                return;
            }

            System.out.println("Producto que se eliminará:");
            System.out.println("ID: " + producto.getIdProducto());
            System.out.println("Nombre: " + producto.getNombreProducto());

            boolean eliminado = productoDAO.eliminar(idProducto);

            if (eliminado) {
                Producto verificacion =
                        productoDAO.consultarPorId(idProducto);

                if (verificacion == null) {
                    System.out.println(
                            "PRODUCTO ELIMINADO CORRECTAMENTE");
                    System.out.println(
                            "Verificación: el producto ya no existe.");
                } else {
                    System.out.println(
                            "ADVERTENCIA: el producto todavía existe.");
                }

            } else {
                System.out.println("No se pudo eliminar el producto.");
            }

        } catch (SQLException e) {
            System.out.println("ERROR AL ELIMINAR PRODUCTO:");
            System.out.println(e.getMessage());
        }

        try {
            AbandonedConnectionCleanupThread.checkedShutdown();
            System.out.println("Recursos del controlador MySQL liberados.");
        } catch (Exception e) {
            System.out.println("Aviso al cerrar el controlador: " + e.getMessage());
        }
    }
}