package com.techsolutions.ecommerce.seguridad;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.api.Json;
import com.techsolutions.ecommerce.servicio.Usuarios;
import com.techsolutions.ecommerce.validacion.Validar;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SeguridadTest {
    @Test
    void contrasenasArgon2idConSalIndividual() {
        String valor = "Frase ficticia para JUnit.";
        String primero = Contrasenas.codificar(valor);
        assertTrue(primero.startsWith("$argon2id$v=19$"));
        assertNotEquals(primero, Contrasenas.codificar(valor));
        assertTrue(Contrasenas.verificar(valor, primero));
        assertFalse(Contrasenas.verificar("incorrecta", primero));
        assertFalse(Contrasenas.verificar(valor, null));
    }

    @Test
    void jsonRechazaCamposDesconocidosYDuplicados() {
        assertThrows(com.fasterxml.jackson.core.JsonProcessingException.class,
                () -> Json.MAPPER.readValue("{\"correo\":\"a\",\"rol\":\"ADMIN\"}", Usuarios.Acceso.class));
        assertThrows(com.fasterxml.jackson.core.JsonProcessingException.class,
                () -> Json.MAPPER.readValue("{\"correo\":\"a\",\"correo\":\"b\"}", Usuarios.Acceso.class));
    }

    @Test
    void lectorJsonLimitaLaProfundidad() {
        assertThrows(com.fasterxml.jackson.core.exc.StreamConstraintsException.class,
                () -> Json.MAPPER.readTree("[".repeat(18) + "0" + "]".repeat(18)));
    }

    @Test
    void cotizacionVinculaUsuarioRevisionItemsYVencimiento() {
        byte[] clave = Seguridad.aleatorio(32);
        Instant instante = Instant.parse("2026-11-27T15:00:00Z");
        ConfirmacionCarrito emisor = new ConfirmacionCarrito(clave, Clock.fixed(instante, ZoneOffset.UTC));
        var items = List.of(new ConfirmacionCarrito.Linea(7, 2, "20.00"));
        String token = emisor.emitir(5, 3, items);
        assertEquals(items, emisor.verificar(token, 5).items());
        assertEquals(3, emisor.verificar(token, 5).revision());
        assertEquals(400, assertThrows(Fallo.class, () -> emisor.verificar(token, 6)).estado);
        assertEquals(400, assertThrows(Fallo.class, () -> emisor.verificar("a.b", 5)).estado);
        assertEquals(items, new ConfirmacionCarrito(clave,
                Clock.fixed(instante.plusSeconds(599), ZoneOffset.UTC)).verificar(token, 5).items());
        ConfirmacionCarrito verificador = new ConfirmacionCarrito(clave,
                Clock.fixed(instante.plusSeconds(600), ZoneOffset.UTC));
        assertEquals(409, assertThrows(Fallo.class, () -> verificador.verificar(token, 5)).estado);
    }

    @Test
    void precioRespetaPrecisionYPositividad() {
        assertEquals("9999999999.99", Validar.dinero(Validar.precio("9999999999.99")));
        for (String invalido : List.of("0.00", "1.001", "10000000000", "1e2")) {
            assertEquals(422, assertThrows(Fallo.class, () -> Validar.precio(invalido)).estado);
        }
    }
}
