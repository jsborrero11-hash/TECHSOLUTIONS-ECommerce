package com.techsolutions.ecommerce.seguridad;

import com.techsolutions.ecommerce.api.Fallo;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public final class LimiteIntentos {
    private final Map<String, Ventana> ventanas = new HashMap<>();
    private final int limite;
    private final long segundos;
    private long proximaLimpieza;

    private record Ventana(long fin, int intentos) {}

    public LimiteIntentos(int limite, long segundos) {
        this.limite = limite;
        this.segundos = segundos;
    }

    public synchronized void comprobar(String clave) {
        long ahora = Instant.now().getEpochSecond();
        if (ahora >= proximaLimpieza) {
            ventanas.values().removeIf(ventana -> ventana.fin() <= ahora);
            proximaLimpieza = ahora + 30;
        }
        Ventana ventana = ventanas.get(clave);
        if (ventana == null && ventanas.size() >= 10000
                || ventana != null && ventana.fin() > ahora && ventana.intentos() >= limite) {
            throw new Fallo(429, "DEMASIADOS_INTENTOS", "Intenta nuevamente más tarde.");
        }
        ventanas.put(clave, ventana == null || ventana.fin() <= ahora
                ? new Ventana(ahora + segundos, 1) : new Ventana(ventana.fin(), ventana.intentos() + 1));
    }
}
