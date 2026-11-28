package com.techsolutions.ecommerce.conexion;

import com.techsolutions.ecommerce.configuracion.ConfiguracionBD;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class ConexionBD {
    private ConexionBD() {}

    public static Connection obtenerConexion() throws SQLException {
        ConfiguracionBD config = ConfiguracionBD.cargar();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ex) {
            throw new SQLException("Controlador JDBC no disponible", ex);
        }
        String url = "jdbc:mysql://%s:%d/%s?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true"
                .formatted(config.host(), config.puerto(), config.esquema());
        Connection conexion = DriverManager.getConnection(url, config.usuario(), config.contrasena());
        try {
            if (!config.esquema().equals(conexion.getCatalog())) {
                throw new SQLException("Esquema JDBC inesperado");
            }
            return conexion;
        } catch (SQLException ex) {
            conexion.close();
            throw ex;
        }
    }
}
