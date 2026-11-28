package com.techsolutions.ecommerce.seguridad;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.api.Json;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.Base64;
import java.util.List;

public final class ConfirmacionCarrito {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private final SecretKeySpec clave;
    private final Clock reloj;

    public record Linea(int idProducto, int cantidad, String precioUnitario) {}
    public record Cotizacion(int usuario, long revision, long vence, List<Linea> items) {}

    public ConfirmacionCarrito(byte[] clave, Clock reloj) {
        if (clave.length < 32) {
            throw new IllegalStateException("La clave de carrito requiere al menos 32 bytes.");
        }
        this.clave = new SecretKeySpec(clave, "HmacSHA256");
        this.reloj = reloj;
    }

    public static ConfirmacionCarrito configurada() {
        try {
            String valor = System.getenv("TECHSOLUTIONS_CART_SIGNING_KEY");
            if (valor == null) {
                throw new IllegalStateException("Falta la clave de carrito.");
            }
            return new ConfirmacionCarrito(Base64.getDecoder().decode(valor), Clock.systemUTC());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("La clave de carrito no es Base64.");
        }
    }

    public String emitir(int usuario, long revision, List<Linea> items) {
        try {
            byte[] datos = Json.MAPPER.writeValueAsBytes(new Cotizacion(usuario, revision,
                    reloj.instant().plusSeconds(600).getEpochSecond(), items));
            return ENCODER.encodeToString(datos) + "." + ENCODER.encodeToString(firmar(datos));
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo generar la confirmación.", ex);
        }
    }

    public Cotizacion verificar(String token, int usuario) {
        if (token == null || token.length() > 60000) {
            throw Fallo.entrada("Confirmación de carrito inválida.");
        }
        String[] partes = token.split("\\.", -1);
        if (partes.length != 2) {
            throw Fallo.entrada("Confirmación de carrito inválida.");
        }
        try {
            byte[] datos = DECODER.decode(partes[0]);
            byte[] firma = DECODER.decode(partes[1]);
            if (!MessageDigest.isEqual(firmar(datos), firma)) {
                throw Fallo.entrada("Confirmación de carrito inválida.");
            }
            Cotizacion cotizacion = Json.MAPPER.readValue(datos, Cotizacion.class);
            if (cotizacion.usuario() != usuario) {
                throw Fallo.entrada("Confirmación de carrito inválida.");
            }
            if (cotizacion.vence() <= reloj.instant().getEpochSecond()) {
                throw Fallo.conflicto("CONFIRMACION_VENCIDA", "Consulta el carrito y confirma nuevamente.");
            }
            return cotizacion;
        } catch (IOException | IllegalArgumentException ex) {
            throw Fallo.entrada("Confirmación de carrito inválida.");
        }
    }

    private byte[] firmar(byte[] datos) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(clave);
            return mac.doFinal(datos);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("No se pudo firmar la confirmación.", ex);
        }
    }
}
