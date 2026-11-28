package com.techsolutions.ecommerce.seguridad;

import com.techsolutions.ecommerce.api.Fallo;
import jakarta.servlet.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

public final class Seguridad {
    private static final SecureRandom ALEATORIO = new SecureRandom();
    private static final String IDENTIDAD = "identidad";
    private static final String CSRF = "csrf";

    private Seguridad() {}

    public record Identidad(int idUsuario, String nombre, String rol) {}

    private record Autenticacion(Identidad usuario, Instant inicio) {}

    public static Identidad identidad(HttpServletRequest req) {
        HttpSession sesion = req.getSession(false);
        if (sesion == null) {
            return null;
        }
        try {
            Autenticacion auth = (Autenticacion) sesion.getAttribute(IDENTIDAD);
            if (auth == null) {
                return null;
            }
            if (!Instant.now().isBefore(auth.inicio().plusSeconds(28800))) {
                sesion.invalidate();
                return null;
            }
            return auth.usuario();
        } catch (IllegalStateException ex) {
            return null;
        }
    }

    public static Identidad exigir(HttpServletRequest req, String rol) {
        Identidad identidad = identidad(req);
        if (identidad == null) {
            throw new Fallo(401, "SESION_REQUERIDA", "Inicia sesión.");
        }
        if (rol != null && !rol.equals(identidad.rol())) {
            throw new Fallo(403, "ROL_DENEGADO", "Permiso insuficiente.");
        }
        return identidad;
    }

    public static byte[] aleatorio(int longitud) {
        byte[] bytes = new byte[longitud];
        ALEATORIO.nextBytes(bytes);
        return bytes;
    }

    private static String tokenNuevo() {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(aleatorio(32));
    }

    public static String token(HttpServletRequest req) {
        identidad(req);
        HttpSession sesion = req.getSession();
        sesion.setMaxInactiveInterval(1800);
        synchronized (sesion) {
            String token = (String) sesion.getAttribute(CSRF);
            if (token == null) {
                token = tokenNuevo();
                sesion.setAttribute(CSRF, token);
            }
            return token;
        }
    }

    public static String autenticar(HttpServletRequest req, Identidad identidad) {
        HttpSession sesion = req.getSession();
        req.changeSessionId();
        String token = tokenNuevo();
        sesion.setAttribute(CSRF, token);
        sesion.setAttribute(IDENTIDAD, new Autenticacion(identidad, Instant.now()));
        sesion.setMaxInactiveInterval(1800);
        return token;
    }

    public static void origen(HttpServletRequest req) {
        String origen = req.getHeader("Origin");
        if (origen == null) {
            if ("cross-site".equals(req.getHeader("Sec-Fetch-Site"))) {
                throw new Fallo(403, "ORIGEN_DENEGADO", "Origen no autorizado.");
            }
            return;
        }
        String configurado = req.getServletContext().getInitParameter("techsolutions.origen");
        String autoridad = req.getServerName() + (req.getServerPort() == (req.isSecure() ? 443 : 80)
                ? "" : ":" + req.getServerPort());
        String esperado = configurado == null ? req.getScheme() + "://" + autoridad : configurado;
        if (!origen.equals(esperado)) {
            throw new Fallo(403, "ORIGEN_DENEGADO", "Origen no autorizado.");
        }
    }

    public static void csrf(HttpServletRequest req, String recibido) {
        origen(req);
        HttpSession sesion = req.getSession(false);
        String esperado = sesion == null ? null : (String) sesion.getAttribute(CSRF);
        if (esperado == null || recibido == null || recibido.length() != esperado.length()
                || !MessageDigest.isEqual(esperado.getBytes(StandardCharsets.UTF_8), recibido.getBytes(StandardCharsets.UTF_8))) {
            throw new Fallo(403, "CSRF_INVALIDO", "Token CSRF inválido.");
        }
    }
}
