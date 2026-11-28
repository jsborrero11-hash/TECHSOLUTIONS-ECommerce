package com.techsolutions.ecommerce.seguridad;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;
import java.util.concurrent.Semaphore;

public final class Contrasenas {
    private static final String PERFIL = "$argon2id$v=19$m=19456,t=2,p=1$";
    private static final Semaphore CUPO = new Semaphore(4);
    private static final String FICTICIO = codificar("Hash interno para tiempo comparable.");

    private Contrasenas() {}

    private static byte[] derivar(String valor, byte[] sal) {
        if (!CUPO.tryAcquire()) {
            throw new com.techsolutions.ecommerce.api.Fallo(503, "IDENTIDAD_OCUPADA", "Intenta nuevamente.");
        }
        byte[] bytes = valor.getBytes(StandardCharsets.UTF_8);
        try {
            var parametros = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                    .withVersion(Argon2Parameters.ARGON2_VERSION_13).withMemoryAsKB(19456)
                    .withIterations(2).withParallelism(1).withSalt(sal).build();
            var generador = new Argon2BytesGenerator();
            generador.init(parametros);
            byte[] hash = new byte[32];
            generador.generateBytes(bytes, hash);
            return hash;
        } finally {
            Arrays.fill(bytes, (byte) 0);
            CUPO.release();
        }
    }

    public static String codificar(String valor) {
        byte[] sal = Seguridad.aleatorio(16);
        Base64.Encoder encoder = Base64.getEncoder().withoutPadding();
        return PERFIL + encoder.encodeToString(sal) + "$" + encoder.encodeToString(derivar(valor, sal));
    }

    public static boolean verificar(String valor, String hash) {
        boolean conocido = hash != null && hash.startsWith(PERFIL) && hash.length() == PERFIL.length() + 66;
        String[] datos = (conocido ? hash : FICTICIO).substring(PERFIL.length()).split("\\$", -1);
        try {
            var decoder = Base64.getDecoder();
            byte[] sal = decoder.decode(datos[0]);
            byte[] esperado = decoder.decode(datos[1]);
            boolean coincide = MessageDigest.isEqual(esperado, derivar(valor, sal));
            return conocido && coincide;
        } catch (IllegalArgumentException | IndexOutOfBoundsException ex) {
            return false;
        }
    }
}
