package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.dao.Sql;
import com.techsolutions.ecommerce.seguridad.Contrasenas;
import com.techsolutions.ecommerce.seguridad.Seguridad.Identidad;
import com.techsolutions.ecommerce.validacion.Validar;
import java.sql.SQLException;
import java.util.Locale;

public final class Usuarios {
    public record Registro(String nombre, String apellido, String correo, String contrasena, String telefono) {}
    public record Acceso(String correo, String contrasena) {}
    public record Publico(int idUsuario, String nombre, String apellido, String correo, String telefono, String rol) {}
    private record Credencial(Identidad usuario, String hash) {}

    private Usuarios() {}

    public static Publico registrar(Registro datos) throws SQLException {
        return crear(datos, "CLIENTE");
    }

    private static Publico crear(Registro datos, String rol) throws SQLException {
        String nombre = Validar.texto(datos.nombre(), 50, true, "nombre");
        String apellido = Validar.texto(datos.apellido(), 50, true, "apellido");
        String correo = correo(datos.correo());
        String telefono = Validar.texto(datos.telefono(), 20, false, "telefono");
        if (datos.contrasena() == null || datos.contrasena().isBlank()) {
            throw Fallo.dato("Contraseña obligatoria.");
        }
        Validar.rango(datos.contrasena().codePointCount(0, datos.contrasena().length()), 15, 128, "contraseña");
        String hash = Contrasenas.codificar(datos.contrasena());
        try {
            int id = Sql.conectar(c -> Sql.insertar(c, """
                    INSERT INTO usuario(nombre,apellido,correo,contrasena,telefono,rol) VALUES (?,?,?,?,?,?)
                    """, nombre, apellido, correo, hash, telefono, rol));
            return new Publico(id, nombre, apellido, correo, telefono, rol);
        } catch (SQLException ex) {
            if (ex.getErrorCode() == 1062) {
                throw Fallo.conflicto("CORREO_DUPLICADO", "El correo ya está registrado.");
            }
            throw ex;
        }
    }

    public static Identidad acceso(Acceso datos) throws SQLException {
        String correo;
        try {
            correo = correo(datos.correo());
        } catch (Fallo ex) {
            throw Fallo.entrada("Correo inválido.");
        }
        if (datos.contrasena() == null || datos.contrasena().isEmpty()
                || datos.contrasena().codePointCount(0, datos.contrasena().length()) > 128) {
            throw Fallo.entrada("Contraseña inválida.");
        }
        Credencial credencial = Sql.conectar(c -> Sql.uno(c,
                "SELECT id_usuario,nombre,rol,contrasena FROM usuario WHERE correo=?",
                rs -> new Credencial(new Identidad(rs.getInt(1), rs.getString(2), rs.getString(3)), rs.getString(4)), correo));
        if (!Contrasenas.verificar(datos.contrasena(), credencial == null ? null : credencial.hash())
                || !("ADMIN".equals(credencial.usuario().rol()) || "CLIENTE".equals(credencial.usuario().rol()))) {
            throw new Fallo(401, "CREDENCIALES_INVALIDAS", "Credenciales inválidas.");
        }
        return credencial.usuario();
    }

    private static String correo(String valor) {
        String correo = Validar.texto(valor, 100, true, "correo").toLowerCase(Locale.ROOT);
        if (correo.length() > 100 || !correo.matches("[a-z0-9.!#$%&'*+/=?^_|~+-]+@[a-z0-9-]+(\\.[a-z0-9-]+)+")) {
            throw Fallo.dato("Correo inválido.");
        }
        return correo;
    }

    public static void main(String[] args) throws SQLException {
        if (!"techsolutions_test".equals(System.getenv("TECHSOLUTIONS_DB_NAME"))) {
            throw new IllegalStateException("Aprovisionamiento limitado a techsolutions_test.");
        }
        String correo = System.getenv("TECHSOLUTIONS_QA_ADMIN_EMAIL");
        if (correo == null || !correo.endsWith("@example.test")) {
            throw new IllegalStateException("Se requiere un correo ficticio.");
        }
        crear(new Registro("Administrador", "QA", correo, System.getenv("TECHSOLUTIONS_QA_ADMIN_PASSWORD"), null), "ADMIN");
        System.out.println("Administrador ficticio creado en QA.");
    }
}
