CREATE DATABASE techsolutions_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE techsolutions_test;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` varchar(20) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo_UNIQUE` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `descripcion` text,
  `precio` decimal(12,2) NOT NULL,
  `stock` int NOT NULL,
  `especificaciones` text,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `FK_PRODUCTO_CATEGORIA_idx` (`id_categoria`),
  CONSTRAINT `FK_PRODUCTO_CATEGORIA` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `CHK_PRODUCTO_PRECIO` CHECK ((`precio` >= 0)),
  CONSTRAINT `CHK_PRODUCTO_STOCK` CHECK ((`stock` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_carrito`),
  UNIQUE KEY `id_usuario_UNIQUE` (`id_usuario`),
  CONSTRAINT `FK_CARRITO_USUARIO` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `detalle_carrito` (
  `id_detalle_carrito` int NOT NULL AUTO_INCREMENT,
  `id_carrito` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle_carrito`),
  KEY `FK_DETALLE_CARRITO_PRODUCTO_idx` (`id_producto`),
  KEY `FK_DETALLE_CARRITO_CARRITO` (`id_carrito`),
  CONSTRAINT `FK_DETALLE_CARRITO_CARRITO` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`),
  CONSTRAINT `FK_DETALLE_CARRITO_PRODUCTO` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `CHK_DETALLE_CARRITO_CANTIDAD` CHECK ((`cantidad` > 0)),
  CONSTRAINT `CHK_DETALLE_CARRITO_PRECIO` CHECK ((`precio_unitario` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='				';
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_pedido` datetime NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `FK_PEDIDO_USUARIO_idx` (`id_usuario`),
  CONSTRAINT `FK_PEDIDO_USUARIO` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `CHK_PEDIDO_TOTAL` CHECK ((`total` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `detalle_pedido` (
  `id_detalle_pedido` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle_pedido`),
  KEY `FK_DETALLE_PEDIDO_PEDIDO_idx` (`id_pedido`),
  KEY `FK_DETALLE_PEDIDO_PRODUCTO_idx` (`id_producto`),
  CONSTRAINT `FK_DETALLE_PEDIDO_PEDIDO` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `FK_DETALLE_PEDIDO_PRODUCTO` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `CHK_DETALLE_PEDIDO_CANTIDAD` CHECK ((`cantidad` > 0)),
  CONSTRAINT `CHK_DETALLE_PEDIDO_PRECIO` CHECK ((`precio_unitario` >= 0)),
  CONSTRAINT `CHK_DETALLE_PEDIDO_SUBTOTAL` CHECK ((`subtotal` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
