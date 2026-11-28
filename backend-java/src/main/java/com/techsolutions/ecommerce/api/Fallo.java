package com.techsolutions.ecommerce.api;

public final class Fallo extends RuntimeException {
    public final int estado;
    public final String codigo;

    public Fallo(int estado, String codigo, String mensaje) {
        super(mensaje);
        this.estado = estado;
        this.codigo = codigo;
    }

    public static Fallo entrada(String mensaje) { return new Fallo(400, "SOLICITUD_INVALIDA", mensaje); }
    public static Fallo dato(String mensaje) { return new Fallo(422, "VALIDACION", mensaje); }
    public static Fallo ausente() { return new Fallo(404, "NO_ENCONTRADO", "Recurso no encontrado."); }
    public static Fallo conflicto(String codigo, String mensaje) { return new Fallo(409, codigo, mensaje); }
}
