package com.techsolutions.ecommerce.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
/**
 * Esta clase permite conectar mi proyecto TECHSOLUTIONS-ECommerce con la base de datos MySQL.
 * La utilizo para consultar y guardar la información de los productos.
 */
public class ConexionBD {
    // Dirección de la base de datos que utilizo en mi entorno local.
    private static final String URL =
            "jdbc:mysql://localhost:3306/techsolutions";

    // Usuario configurado para acceder a MySQL.
    private static final String USUARIO = "root";

    /**
     * Carga el controlador JDBC necesario para comunicarse con MySQL.
     * Si no está disponible, muestra un error que permite identificar el problema.
     */
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
    /**
     * Establece la conexión con la base de datos. La contraseña se obtiene de una variable de entorno para evitar escribirla directamente en el código.
     *
     * @return conexión activa con MySQL.
     * @throws SQLException si ocurre un error al establecer la conexión.
     */
    public static Connection obtenerConexion() throws SQLException {
        // Obtengo la contraseña configurada en el entorno.
        String contrasena =
                System.getenv("TECHSOLUTIONS_DB_PASSWORD");
        // Si no se configuró una contraseña, utilizo una cadena vacía.
        if (contrasena == null) {
            contrasena = "";
        }
        // Devuelvo la conexión para utilizarla en las operaciones del sistema.
        return DriverManager.getConnection(
                URL,
                USUARIO,
                contrasena
        );
    }
}
