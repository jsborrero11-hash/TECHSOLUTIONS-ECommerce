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
                System.out.println("Base de datos: techsolutions");
            } else {
                System.out.println("La conexión no es válida.");
            }

        } catch (SQLException e) {
            System.out.println("ERROR DE CONEXIÓN:");
            System.out.println(e.getMessage());

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