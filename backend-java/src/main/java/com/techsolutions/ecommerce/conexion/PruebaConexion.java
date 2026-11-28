package com.techsolutions.ecommerce.conexion;

import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;
import java.sql.Connection;
import java.sql.SQLException;

public class PruebaConexion {

    public static void main(String[] args) {

        System.out.println("Probando conexión JDBC con MySQL...");

        try (Connection conexion = ConexionBD.obtenerConexion()) {

            if (conexion.isValid(5)) {
                System.out.println("CONEXIÓN EXITOSA");
                System.out.println("Base de datos: " + conexion.getCatalog());
            } else {
                throw new SQLException("La conexión no es válida.");
            }

        } catch (SQLException | IllegalStateException e) {
            System.out.println("ERROR DE CONEXIÓN:");
            throw new IllegalStateException("No se pudo comprobar la conexión configurada.");

        } finally {
            try {
                AbandonedConnectionCleanupThread.checkedShutdown();
                System.out.println(
                        "Recursos del controlador MySQL liberados.");
            } catch (Exception e) {
                System.out.println(
                        "Aviso al cerrar el controlador: " + e.getMessage());
            }
        }
    }
}
