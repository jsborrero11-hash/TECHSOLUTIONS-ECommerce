package com.techsolutions.ecommerce.configuracion;

public record ConfiguracionBD(String host, int puerto, String esquema, String usuario, String contrasena) {
    public static ConfiguracionBD cargar() {
        String host = requerido("HOST");
        String esquema = requerido("NAME");
        if (!host.matches("[A-Za-z0-9.-]+") || !esquema.matches("[A-Za-z0-9_]+")) {
            throw new IllegalStateException("Host o esquema JDBC inválido");
        }
        int puerto;
        try {
            puerto = Integer.parseInt(requerido("PORT"));
        } catch (NumberFormatException ex) {
            throw new IllegalStateException("Puerto JDBC inválido");
        }
        if (puerto < 1 || puerto > 65535) {
            throw new IllegalStateException("Puerto JDBC inválido");
        }
        return new ConfiguracionBD(host, puerto, esquema, requerido("USER"), requerido("PASSWORD"));
    }

    private static String requerido(String nombre) {
        String valor = System.getenv("TECHSOLUTIONS_DB_" + nombre);
        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException("Falta TECHSOLUTIONS_DB_" + nombre);
        }
        return valor;
    }

    @Override
    public String toString() {
        return "ConfiguracionBD[esquema=" + esquema + "]";
    }
}
