package com.techsolutions.ecommerce.validacion;

import com.techsolutions.ecommerce.api.Fallo;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

public final class Validar {
    private Validar() {}

    public static int id(String valor) {
        try {
            if (valor != null && valor.matches("[1-9][0-9]{0,9}")) {
                return Integer.parseInt(valor);
            }
        } catch (NumberFormatException ignored) {
            // Se devuelve el mismo error para un identificador fuera del rango INT.
        }
        throw Fallo.entrada("Se requiere un identificador entero positivo.");
    }

    public static int rango(Integer valor, int minimo, int maximo, String campo) {
        if (valor == null || valor < minimo || valor > maximo) {
            throw Fallo.dato(campo + " está fuera de rango.");
        }
        return valor;
    }

    public static String texto(String valor, int maximo, boolean requerido, String campo) {
        String normalizado = valor == null ? null : valor.strip();
        if (normalizado == null || normalizado.isEmpty()) {
            if (requerido) {
                throw Fallo.dato(campo + " es obligatorio.");
            }
            return null;
        }
        if (normalizado.codePointCount(0, normalizado.length()) > maximo) {
            throw Fallo.dato(campo + " excede su longitud.");
        }
        return normalizado;
    }

    public static String textoMysql(String valor, String campo) {
        if (valor != null && valor.getBytes(StandardCharsets.UTF_8).length > 65535) {
            throw Fallo.dato(campo + " excede su longitud.");
        }
        return valor;
    }

    public static BigDecimal precio(String valor) {
        if (valor == null || !valor.matches("[0-9]{1,10}(\\.[0-9]{1,2})?")) {
            throw Fallo.dato("Precio inválido.");
        }
        BigDecimal precio = new BigDecimal(valor).setScale(2);
        if (precio.signum() <= 0) {
            throw Fallo.dato("El precio debe ser positivo.");
        }
        return precio;
    }

    public static String dinero(BigDecimal importe) {
        return importe.setScale(2).toPlainString();
    }

    public record Pagina(int numero, int tamano) {
        public long offset() { return (long) (numero - 1) * tamano; }
    }

    public static Pagina pagina(String numero, String tamano) {
        int limite = tamano == null ? 20 : id(tamano);
        if (limite > 100) {
            throw Fallo.entrada("tamano debe estar entre 1 y 100.");
        }
        return new Pagina(numero == null ? 1 : id(numero), limite);
    }

    public record Lista<T>(java.util.List<T> items, int pagina, int tamano, long total) {}
}
