package com.techsolutions.ecommerce.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBD {

    private static final String URL =
            "jdbc:mysql://localhost:3306/techsolutions";

    private static final String USUARIO = "root";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError(
                    "No se pudo cargar el controlador JDBC de MySQL: "
                    + e.getMessage()
            );
        }
    }

    public static Connection obtenerConexion() throws SQLException {

        String contrasena =
                System.getenv("TECHSOLUTIONS_DB_PASSWORD");

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