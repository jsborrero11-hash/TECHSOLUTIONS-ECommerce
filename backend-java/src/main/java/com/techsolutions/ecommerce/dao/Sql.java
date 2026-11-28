package com.techsolutions.ecommerce.dao;

import com.techsolutions.ecommerce.conexion.ConexionBD;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public final class Sql {
    private Sql() {}

    @FunctionalInterface
    public interface Fila<T> { T leer(ResultSet rs) throws SQLException; }
    @FunctionalInterface
    public interface Operacion<T> { T ejecutar(Connection c) throws SQLException; }

    private static void parametros(PreparedStatement s, Object[] valores) throws SQLException {
        for (int i = 0; i < valores.length; i++) {
            s.setObject(i + 1, valores[i]);
        }
    }

    public static <T> List<T> lista(Connection c, String sql, Fila<T> fila, Object... valores) throws SQLException {
        try (PreparedStatement s = c.prepareStatement(sql)) {
            parametros(s, valores);
            try (ResultSet rs = s.executeQuery()) {
                List<T> filas = new ArrayList<>();
                while (rs.next()) {
                    filas.add(fila.leer(rs));
                }
                return filas;
            }
        }
    }

    public static <T> T uno(Connection c, String sql, Fila<T> fila, Object... valores) throws SQLException {
        List<T> filas = lista(c, sql, fila, valores);
        return filas.isEmpty() ? null : filas.getFirst();
    }

    public static int cambiar(Connection c, String sql, Object... valores) throws SQLException {
        try (PreparedStatement s = c.prepareStatement(sql)) {
            parametros(s, valores);
            return s.executeUpdate();
        }
    }

    public static int insertar(Connection c, String sql, Object... valores) throws SQLException {
        try (PreparedStatement s = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            parametros(s, valores);
            s.executeUpdate();
            try (ResultSet rs = s.getGeneratedKeys()) {
                if (!rs.next()) {
                    throw new SQLException("No se generó identificador");
                }
                return rs.getInt(1);
            }
        }
    }

    public static <T> T conectar(Operacion<T> operacion) throws SQLException {
        try (Connection c = ConexionBD.obtenerConexion()) {
            return operacion.ejecutar(c);
        }
    }

    public static <T> T transaccion(Operacion<T> operacion) throws SQLException {
        return conectar(c -> {
            c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            c.setAutoCommit(false);
            try {
                T resultado = operacion.ejecutar(c);
                c.commit();
                return resultado;
            } catch (SQLException | RuntimeException | Error ex) {
                try {
                    c.rollback();
                } catch (SQLException rollback) {
                    ex.addSuppressed(rollback);
                }
                throw ex;
            }
        });
    }
}
