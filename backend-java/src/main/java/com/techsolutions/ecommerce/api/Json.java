package com.techsolutions.ecommerce.api;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.json.JsonMapper;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;

public final class Json {
    private static final int MAX_CUERPO = 131072;
    public static final ObjectMapper MAPPER = JsonMapper.builder(JsonFactory.builder()
            .streamReadConstraints(StreamReadConstraints.builder().maxNestingDepth(16)
                    .maxStringLength(65535).maxNumberLength(32).build())
            .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build())
            .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .disable(MapperFeature.ALLOW_COERCION_OF_SCALARS)
            .disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT)
            .withCoercionConfig(com.fasterxml.jackson.databind.type.LogicalType.Textual, config -> config
                    .setCoercion(com.fasterxml.jackson.databind.cfg.CoercionInputShape.Integer, com.fasterxml.jackson.databind.cfg.CoercionAction.Fail)
                    .setCoercion(com.fasterxml.jackson.databind.cfg.CoercionInputShape.Float, com.fasterxml.jackson.databind.cfg.CoercionAction.Fail)
                    .setCoercion(com.fasterxml.jackson.databind.cfg.CoercionInputShape.Boolean, com.fasterxml.jackson.databind.cfg.CoercionAction.Fail))
            .build();

    private Json() {}

    public static <T> T leer(HttpServletRequest req, Class<T> tipo) throws IOException {
        String contentType = req.getContentType();
        if (contentType == null || !contentType.split(";", 2)[0].strip().equalsIgnoreCase("application/json")) {
            throw new Fallo(415, "TIPO_CONTENIDO", "Se requiere application/json.");
        }
        if (req.getContentLengthLong() > MAX_CUERPO) {
            throw new Fallo(413, "CUERPO_EXCESIVO", "El cuerpo excede el límite.");
        }
        byte[] datos = req.getInputStream().readNBytes(MAX_CUERPO + 1);
        if (datos.length > MAX_CUERPO) {
            throw new Fallo(413, "CUERPO_EXCESIVO", "El cuerpo excede el límite.");
        }
        try {
            T valor = MAPPER.readValue(datos, tipo);
            if (valor == null) {
                throw Fallo.entrada("Se requiere un objeto JSON.");
            }
            return valor;
        } catch (JsonProcessingException ex) {
            throw Fallo.entrada("JSON inválido o campos incompatibles.");
        }
    }

    public static void responder(HttpServletResponse res, int estado, Object cuerpo) throws IOException {
        res.setStatus(estado);
        if (cuerpo != null) {
            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            MAPPER.writeValue(res.getOutputStream(), cuerpo);
        }
    }

    public static void error(HttpServletResponse res, Fallo fallo, String solicitud) throws IOException {
        responder(res, fallo.estado, new ErrorApi(fallo.codigo, fallo.getMessage(), java.util.List.of(), solicitud));
    }

    public static String iniciar(HttpServletResponse res) {
        String solicitud = UUID.randomUUID().toString();
        res.setHeader("X-Request-Id", solicitud);
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        return solicitud;
    }

    public record ErrorApi(String codigo, String mensaje, java.util.List<String> campos, String idSolicitud) {}
}
