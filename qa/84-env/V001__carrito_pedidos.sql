USE techsolutions_test;
ALTER TABLE carrito ADD COLUMN revision BIGINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE detalle_carrito ADD CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto);
ALTER TABLE pedido
    ADD COLUMN clave_idempotencia CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
    ADD COLUMN huella_solicitud CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    ADD CONSTRAINT uq_pedido_idempotencia UNIQUE (id_usuario, clave_idempotencia),
    ADD CONSTRAINT chk_pedido_idempotencia CHECK (
        (clave_idempotencia IS NULL AND huella_solicitud IS NULL) OR
        (clave_idempotencia IS NOT NULL AND huella_solicitud IS NOT NULL)
    );
