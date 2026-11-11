package com.techsolutions.ecommerce.modelo;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ProductoTest {

    @Test
    void debeGuardarYConsultarDatosDelProducto() {

        // Preparar los datos del producto
        Producto producto = new Producto();

        producto.setIdProducto(1);
        producto.setIdCategoria(2);
        producto.setNombreProducto("Computador portátil");
        producto.setMarca("Lenovo");
        producto.setDescripcion("Computador de prueba");
        producto.setPrecio(new BigDecimal("2500000.00"));
        producto.setStock(10);
        producto.setEspecificaciones("16 GB RAM");
        producto.setEstado("ACTIVO");

        // Verificar los datos almacenados
        assertEquals(1, producto.getIdProducto());
        assertEquals(2, producto.getIdCategoria());
        assertEquals("Computador portátil", producto.getNombreProducto());
        assertEquals("Lenovo", producto.getMarca());
        assertEquals("Computador de prueba", producto.getDescripcion());
        assertEquals(0, new BigDecimal("2500000.00")
                .compareTo(producto.getPrecio()));
        assertEquals(10, producto.getStock());
        assertEquals("16 GB RAM", producto.getEspecificaciones());
        assertEquals("ACTIVO", producto.getEstado());
    }
}
