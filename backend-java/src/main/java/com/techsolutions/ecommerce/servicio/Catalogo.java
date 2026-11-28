package com.techsolutions.ecommerce.servicio;

import com.techsolutions.ecommerce.api.Fallo;
import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.dao.Sql;
import com.techsolutions.ecommerce.modelo.Producto;
import com.techsolutions.ecommerce.validacion.Validar;
import java.sql.SQLException;
import java.util.List;

public final class Catalogo {
    private final ProductoDAO dao = new ProductoDAO();

    public record Datos(Integer idCategoria, String nombreProducto, String marca, String descripcion,
                       String precio, String especificaciones, String estado, Integer stockInicial) {}
    public record Edicion(Integer idCategoria, String nombreProducto, String marca, String descripcion,
                          String precio, String especificaciones, String estado) {}
    public record Stock(Integer stockEsperado, Integer stockNuevo) {}
    public record Existencia(int idProducto, int stock) {}
    public record Categoria(int idCategoria, String nombreCategoria, String descripcion) {}
    public record Vista(int idProducto, int idCategoria, String nombreCategoria, String nombreProducto,
                        String marca, String descripcion, String precio, int stock,
                        String especificaciones, String estado) {
        public static Vista desde(Producto p, String categoria) {
            return new Vista(p.getIdProducto(), p.getIdCategoria(), categoria, p.getNombreProducto(), p.getMarca(),
                    p.getDescripcion(), Validar.dinero(p.getPrecio()), p.getStock(), p.getEspecificaciones(), p.getEstado());
        }
    }

    public Validar.Lista<Vista> listar(String q, Integer categoria, String estado, Validar.Pagina pagina) throws SQLException {
        return dao.buscar(q, categoria, estado, pagina);
    }

    public List<Producto> listarHistorico() throws SQLException {
        return dao.listarActivos();
    }

    public Vista detalle(int id, boolean administrador) throws SQLException {
        Vista vista = dao.detalle(id);
        if (vista == null || !administrador && !"ACTIVO".equals(vista.estado())) {
            throw Fallo.ausente();
        }
        return vista;
    }

    public Validar.Lista<Categoria> categorias(Validar.Pagina pagina) throws SQLException {
        return Sql.conectar(c -> new Validar.Lista<>(Sql.lista(c, """
                SELECT id_categoria,nombre_categoria,descripcion FROM categoria
                ORDER BY id_categoria LIMIT ? OFFSET ?
                """, rs -> new Categoria(rs.getInt(1), rs.getString(2), rs.getString(3)), pagina.tamano(), pagina.offset()),
                pagina.numero(), pagina.tamano(), Sql.uno(c, "SELECT COUNT(*) FROM categoria", rs -> rs.getLong(1))));
    }

    public Vista crear(Datos datos) throws SQLException {
        Producto producto = validar(datos);
        producto.setStock(datos.stockInicial() == null ? 0
                : Validar.rango(datos.stockInicial(), 0, Integer.MAX_VALUE, "stockInicial"));
        try {
            return detalle(dao.insertar(producto), true);
        } catch (SQLException ex) {
            throw categoriaInvalida(ex);
        }
    }

    public Vista editar(int id, Edicion datos) throws SQLException {
        Producto producto = validar(new Datos(datos.idCategoria(), datos.nombreProducto(), datos.marca(),
                datos.descripcion(), datos.precio(), datos.especificaciones(), datos.estado(), null));
        producto.setIdProducto(id);
        try {
            if (!dao.actualizarCatalogo(producto)) {
                throw Fallo.ausente();
            }
            return detalle(id, true);
        } catch (SQLException ex) {
            throw categoriaInvalida(ex);
        }
    }

    public Existencia ajustar(int id, Stock datos) throws SQLException {
        int esperado = Validar.rango(datos.stockEsperado(), 0, Integer.MAX_VALUE, "stockEsperado");
        int nuevo = Validar.rango(datos.stockNuevo(), 0, Integer.MAX_VALUE, "stockNuevo");
        return Sql.transaccion(c -> {
            if (dao.bloquear(c, id) == null) {
                throw Fallo.ausente();
            }
            if (!dao.ajustarStock(c, id, esperado, nuevo)) {
                throw Fallo.conflicto("STOCK_MODIFICADO", "El stock vigente cambió.");
            }
            return new Existencia(id, nuevo);
        });
    }

    public void eliminar(int id) throws SQLException {
        try {
            if (!dao.eliminar(id)) {
                throw Fallo.ausente();
            }
        } catch (SQLException ex) {
            if (ex.getErrorCode() == 1451) {
                throw Fallo.conflicto("PRODUCTO_REFERENCIADO", "El producto tiene movimientos asociados. Puede desactivarlo.");
            }
            throw ex;
        }
    }

    private static SQLException categoriaInvalida(SQLException ex) {
        if (ex.getErrorCode() == 1452) {
            throw Fallo.dato("La categoría no existe.");
        }
        return ex;
    }

    private static Producto validar(Datos datos) {
        Producto p = new Producto();
        p.setIdCategoria(Validar.rango(datos.idCategoria(), 1, Integer.MAX_VALUE, "idCategoria"));
        p.setNombreProducto(Validar.texto(datos.nombreProducto(), 100, true, "nombreProducto"));
        p.setMarca(Validar.texto(datos.marca(), 50, true, "marca"));
        p.setDescripcion(Validar.textoMysql(datos.descripcion(), "descripcion"));
        p.setPrecio(Validar.precio(datos.precio()));
        p.setEspecificaciones(Validar.textoMysql(datos.especificaciones(), "especificaciones"));
        if (!"ACTIVO".equals(datos.estado()) && !"INACTIVO".equals(datos.estado())) {
            throw Fallo.dato("Estado inválido.");
        }
        p.setEstado(datos.estado());
        return p;
    }
}
