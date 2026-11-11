package com.techsolutions.ecommerce.modelo;

import java.math.BigDecimal;
/**
 * Representa los productos que se manejan en TECHSOLUTIONS-ECommerce.
 * Aquí se guarda la información de cada producto, como su nombre, marca, precio, cantidad disponible y estado.
 */
public class Producto {
// Datos que identifican y describen cada producto.
    private int idProducto;
    private int idCategoria;
    private String nombreProducto;
    private String marca;
    private String descripcion;
    private BigDecimal precio;
    private int stock;
    private String especificaciones;
    private String estado;

    public Producto() {
    }    
/**
 * Los métodos get permiten consultar la información de un producto, mientras que los métodos set permiten asignar o actualizar sus datos.
 */
    public int getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(int idProducto) {
        this.idProducto = idProducto;
    }

    public int getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(int idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getEspecificaciones() {
        return especificaciones;
    }

    public void setEspecificaciones(String especificaciones) {
        this.especificaciones = especificaciones;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}