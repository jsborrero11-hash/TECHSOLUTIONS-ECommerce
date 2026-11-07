
package com.techsolutions.ecommerce.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBD {

    private static final String URL =
            "jdbc:mysql://localhost:3306/techsolutions";

    private static final String USUARIO = "root";

    public static Connection obtenerConexion() throws SQLException {
        String contrasena = System.getenv("TECHSOLUTIONS_DB_PASSWORD");

        if (contrasena == null) {
            contrasena = "";
        }

        return DriverManager.getConnection(
                URL,
                USUARIO,
                contrasena
        );
    }
}
