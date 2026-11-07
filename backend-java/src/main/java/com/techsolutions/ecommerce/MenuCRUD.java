package com.techsolutions.ecommerce;

import com.techsolutions.ecommerce.dao.ProductoDAO;
import com.techsolutions.ecommerce.modelo.Producto;
import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;

public class MenuCRUD {

    public static void main(String[] args) {

        ProductoDAO productoDAO = new ProductoDAO();

        try (Scanner scanner = new Scanner(System.in)) {

            int opcion;

            do {
                System.out.println();
                System.out.println("==================================");
                System.out.println("  TECHSOLUTIONS - SISTEMA CRUD");
                System.out.println("==================================");
                System.out.println("1. Registrar producto");
                System.out.println("2. Consultar todos los productos");
                System.out.println("3. Consultar producto por ID");
                System.out.println("4. Actualizar producto");
                System.out.println("5. Eliminar producto");
                System.out.println("0. Salir");
                System.out.println("==================================");
                System.out.print("Seleccione una opcion: ");

                String entrada = scanner.nextLine();

                try {
                    opcion = Integer.parseInt(entrada);
                } catch (NumberFormatException e) {
                    System.out.println(
                            "Error: ingrese un numero valido.");
                    opcion = -1;
                    continue;
                }

                switch (opcion) {

                    case 1:
                        System.out.println();
                        System.out.println("=== REGISTRAR PRODUCTO ===");

                        try {
                            Producto nuevoProducto = new Producto();

                            System.out.print("ID de categoria: ");
                            int idCategoria = Integer.parseInt(
                                    scanner.nextLine().trim());

                            if (idCategoria <= 0) {
                                System.out.println(
                                        "Error: la categoria debe ser mayor que cero.");
                                break;
                            }

                            System.out.print("Nombre del producto: ");
                            String nombre = scanner.nextLine().trim();

                            if (nombre.isEmpty() || nombre.length() > 100) {
                                System.out.println(
                                        "Error: el nombre debe tener entre 1 y 100 caracteres.");
                                break;
                            }

                            System.out.print("Marca: ");
                            String marca = scanner.nextLine().trim();

                            if (marca.isEmpty() || marca.length() > 50) {
                                System.out.println(
                                        "Error: la marca debe tener entre 1 y 50 caracteres.");
                                break;
                            }

                            System.out.print("Descripcion: ");
                            String descripcion = scanner.nextLine().trim();

                            System.out.print("Precio: ");
                            BigDecimal precio = new BigDecimal(
                                    scanner.nextLine().trim());

                            if (precio.compareTo(BigDecimal.ZERO) <= 0
                                    || precio.scale() > 2
                                    || precio.precision() - precio.scale() > 10) {
                                System.out.println(
                                        "Error: ingrese un precio positivo con maximo 2 decimales.");
                                break;
                            }

                            System.out.print("Stock: ");
                            int stock = Integer.parseInt(
                                    scanner.nextLine().trim());

                            if (stock < 0) {
                                System.out.println(
                                        "Error: el stock no puede ser negativo.");
                                break;
                            }

                            System.out.print("Especificaciones: ");
                            String especificaciones =
                                    scanner.nextLine().trim();

                            System.out.print("Estado (ACTIVO/INACTIVO): ");
                            String estado = scanner.nextLine()
                                    .trim().toUpperCase();

                            if (!estado.equals("ACTIVO")
                                    && !estado.equals("INACTIVO")) {
                                System.out.println(
                                        "Error: el estado debe ser ACTIVO o INACTIVO.");
                                break;
                            }

                            nuevoProducto.setIdCategoria(idCategoria);
                            nuevoProducto.setNombreProducto(nombre);
                            nuevoProducto.setMarca(marca);
                            nuevoProducto.setDescripcion(descripcion);
                            nuevoProducto.setPrecio(precio);
                            nuevoProducto.setStock(stock);
                            nuevoProducto.setEspecificaciones(
                                    especificaciones);
                            nuevoProducto.setEstado(estado);

                            System.out.println();
                            System.out.println("=== CONFIRMAR REGISTRO ===");
                            System.out.println("Nombre: " + nombre);
                            System.out.println("Marca: " + marca);
                            System.out.println("Precio: $" + precio);
                            System.out.println("Stock: " + stock);
                            System.out.print(
                                    "Desea guardar este producto? (S/N): ");

                            String confirmacion = scanner.nextLine()
                                    .trim().toUpperCase();

                            if (!confirmacion.equals("S")) {
                                System.out.println(
                                        "Registro cancelado. No se guardaron cambios.");
                                break;
                            }

                            int idGenerado =
                                    productoDAO.insertar(nuevoProducto);

                            if (idGenerado > 0) {
                                System.out.println(
                                        "Producto registrado correctamente.");
                                System.out.println(
                                        "ID generado: " + idGenerado);
                            } else {
                                System.out.println(
                                        "No se pudo confirmar el registro del producto.");
                            }

                        } catch (NumberFormatException e) {
                            System.out.println(
                                    "Error: ingrese valores numericos validos.");

                        } catch (SQLException e) {
                            System.out.println(
                                    "Error al registrar producto: "
                                            + e.getMessage());
                        }

                        break;

                    case 2:
                        System.out.println();
                        System.out.println("=== LISTADO DE PRODUCTOS ===");

                        try {
                            List<Producto> productos =
                                    productoDAO.listarTodos();

                            if (productos.isEmpty()) {
                                System.out.println(
                                        "No hay productos registrados.");
                            } else {
                                System.out.println(
                                        "Total de productos: "
                                                + productos.size());

                                for (Producto producto : productos) {
                                    System.out.println("--------------------------");
                                    System.out.println(
                                            "ID: " + producto.getIdProducto());
                                    System.out.println(
                                            "Nombre: " + producto.getNombreProducto());
                                    System.out.println(
                                            "Marca: " + producto.getMarca());
                                    System.out.println(
                                            "Precio: $" + producto.getPrecio());
                                    System.out.println(
                                            "Stock: " + producto.getStock());
                                    System.out.println(
                                            "Estado: " + producto.getEstado());
                                }
                            }

                            System.out.println("--------------------------");
                            System.out.println(
                                    "Consulta finalizada correctamente.");

                        } catch (SQLException e) {
                            System.out.println(
                                    "Error al consultar productos: "
                                            + e.getMessage());
                        }

                        break;

                    case 3:
                        System.out.println();
                        System.out.println("=== CONSULTAR PRODUCTO POR ID ===");
                        System.out.print("Ingrese el ID del producto: ");

                        try {
                            int idConsulta = Integer.parseInt(
                                    scanner.nextLine().trim());

                            if (idConsulta <= 0) {
                                System.out.println(
                                        "El ID debe ser mayor que cero.");
                                break;
                            }

                            Producto producto =
                                    productoDAO.consultarPorId(idConsulta);

                            if (producto != null) {
                                System.out.println("--------------------------");
                                System.out.println(
                                        "ID: " + producto.getIdProducto());
                                System.out.println(
                                        "Categoria: " + producto.getIdCategoria());
                                System.out.println(
                                        "Nombre: " + producto.getNombreProducto());
                                System.out.println(
                                        "Marca: " + producto.getMarca());
                                System.out.println(
                                        "Descripcion: " + producto.getDescripcion());
                                System.out.println(
                                        "Precio: $" + producto.getPrecio());
                                System.out.println(
                                        "Stock: " + producto.getStock());
                                System.out.println(
                                        "Especificaciones: "
                                                + producto.getEspecificaciones());
                                System.out.println(
                                        "Estado: " + producto.getEstado());
                                System.out.println("--------------------------");
                            } else {
                                System.out.println(
                                        "No existe un producto con ese ID.");
                            }

                        } catch (NumberFormatException e) {
                            System.out.println(
                                    "Error: ingrese un ID numerico valido.");

                        } catch (SQLException e) {
                            System.out.println(
                                    "Error al consultar el producto: "
                                            + e.getMessage());
                        }

                        break;

                    case 4:
                        System.out.println();
                        System.out.println("=== ACTUALIZAR PRODUCTO ===");
                        System.out.print("Ingrese el ID del producto: ");

                        try {
                            int idActualizar = Integer.parseInt(
                                    scanner.nextLine().trim());

                            if (idActualizar <= 0) {
                                System.out.println(
                                        "Error: el ID debe ser mayor que cero.");
                                break;
                            }

                            Producto productoActualizar =
                                    productoDAO.consultarPorId(idActualizar);

                            if (productoActualizar == null) {
                                System.out.println(
                                        "No existe un producto con ese ID.");
                                break;
                            }

                            System.out.println();
                            System.out.println("=== DATOS ACTUALES ===");
                            System.out.println(
                                    "ID: " + productoActualizar.getIdProducto());
                            System.out.println(
                                    "Nombre: " + productoActualizar.getNombreProducto());
                            System.out.println(
                                    "Marca: " + productoActualizar.getMarca());
                            System.out.println(
                                    "Precio: $" + productoActualizar.getPrecio());
                            System.out.println(
                                    "Stock: " + productoActualizar.getStock());
                            System.out.println(
                                    "Estado: " + productoActualizar.getEstado());

                            System.out.println();
                            System.out.println(
                                    "Deje un campo vacio para conservar su valor.");

                            System.out.print("Nuevo nombre: ");
                            String nuevoNombre = scanner.nextLine().trim();

                            if (!nuevoNombre.isEmpty()) {
                                if (nuevoNombre.length() > 100) {
                                    System.out.println(
                                            "Error: el nombre no puede superar 100 caracteres.");
                                    break;
                                }
                                productoActualizar.setNombreProducto(
                                        nuevoNombre);
                            }

                            System.out.print("Nueva marca: ");
                            String nuevaMarca = scanner.nextLine().trim();

                            if (!nuevaMarca.isEmpty()) {
                                if (nuevaMarca.length() > 50) {
                                    System.out.println(
                                            "Error: la marca no puede superar 50 caracteres.");
                                    break;
                                }
                                productoActualizar.setMarca(nuevaMarca);
                            }

                            System.out.print("Nueva descripcion: ");
                            String nuevaDescripcion =
                                    scanner.nextLine().trim();

                            if (!nuevaDescripcion.isEmpty()) {
                                productoActualizar.setDescripcion(
                                        nuevaDescripcion);
                            }

                            System.out.print("Nuevo precio: ");
                            String entradaPrecio = scanner.nextLine().trim();

                            if (!entradaPrecio.isEmpty()) {
                                BigDecimal nuevoPrecio =
                                        new BigDecimal(entradaPrecio);

                                if (nuevoPrecio.compareTo(BigDecimal.ZERO) <= 0
                                        || nuevoPrecio.scale() > 2
                                        || nuevoPrecio.precision()
                                                - nuevoPrecio.scale() > 10) {
                                    System.out.println(
                                            "Error: precio invalido.");
                                    break;
                                }

                                productoActualizar.setPrecio(nuevoPrecio);
                            }

                            System.out.print("Nuevo stock: ");
                            String entradaStock = scanner.nextLine().trim();

                            if (!entradaStock.isEmpty()) {
                                int nuevoStock =
                                        Integer.parseInt(entradaStock);

                                if (nuevoStock < 0) {
                                    System.out.println(
                                            "Error: el stock no puede ser negativo.");
                                    break;
                                }

                                productoActualizar.setStock(nuevoStock);
                            }

                            System.out.print("Nuevas especificaciones: ");
                            String nuevasEspecificaciones =
                                    scanner.nextLine().trim();

                            if (!nuevasEspecificaciones.isEmpty()) {
                                productoActualizar.setEspecificaciones(
                                        nuevasEspecificaciones);
                            }

                            System.out.print(
                                    "Nuevo estado (ACTIVO/INACTIVO): ");
                            String nuevoEstado = scanner.nextLine()
                                    .trim().toUpperCase();

                            if (!nuevoEstado.isEmpty()) {
                                if (!nuevoEstado.equals("ACTIVO")
                                        && !nuevoEstado.equals("INACTIVO")) {
                                    System.out.println(
                                            "Error: el estado debe ser ACTIVO o INACTIVO.");
                                    break;
                                }

                                productoActualizar.setEstado(nuevoEstado);
                            }

                            System.out.println();
                            System.out.println("=== CONFIRMAR ACTUALIZACION ===");
                            System.out.println(
                                    "ID: " + productoActualizar.getIdProducto());
                            System.out.println(
                                    "Nombre: " + productoActualizar.getNombreProducto());
                            System.out.println(
                                    "Marca: " + productoActualizar.getMarca());
                            System.out.println(
                                    "Precio: $" + productoActualizar.getPrecio());
                            System.out.println(
                                    "Stock: " + productoActualizar.getStock());
                            System.out.println(
                                    "Estado: " + productoActualizar.getEstado());

                            System.out.print(
                                    "Desea guardar los cambios? (S/N): ");

                            String confirmarActualizacion =
                                    scanner.nextLine().trim().toUpperCase();

                            if (!confirmarActualizacion.equals("S")) {
                                System.out.println(
                                        "Actualizacion cancelada. No se guardaron cambios.");
                                break;
                            }

                            boolean actualizado =
                                    productoDAO.actualizar(productoActualizar);

                            if (actualizado) {
                                System.out.println(
                                        "Producto actualizado correctamente.");
                            } else {
                                System.out.println(
                                        "No se pudo actualizar el producto.");
                            }

                        } catch (NumberFormatException e) {
                            System.out.println(
                                    "Error: ingrese valores numericos validos.");

                        } catch (SQLException e) {
                            System.out.println(
                                    "Error al actualizar producto: "
                                            + e.getMessage());
                        }

                        break;


                    case 5:
                        System.out.println();
                        System.out.println("=== ELIMINAR PRODUCTO ===");
                        System.out.print("Ingrese el ID del producto: ");

                        try {
                            int idEliminar = Integer.parseInt(
                                    scanner.nextLine().trim());

                            if (idEliminar <= 0) {
                                System.out.println(
                                        "Error: el ID debe ser mayor que cero.");
                                break;
                            }

                            Producto productoEliminar =
                                    productoDAO.consultarPorId(idEliminar);

                            if (productoEliminar == null) {
                                System.out.println(
                                        "No existe un producto con ese ID.");
                                break;
                            }

                            System.out.println();
                            System.out.println("=== PRODUCTO A ELIMINAR ===");
                            System.out.println(
                                    "ID: " + productoEliminar.getIdProducto());
                            System.out.println(
                                    "Nombre: " + productoEliminar.getNombreProducto());
                            System.out.println(
                                    "Marca: " + productoEliminar.getMarca());
                            System.out.println(
                                    "Precio: $" + productoEliminar.getPrecio());
                            System.out.println(
                                    "Stock: " + productoEliminar.getStock());

                            System.out.println();
                            System.out.println(
                                    "ADVERTENCIA: esta accion eliminara el producto.");
                            System.out.print(
                                    "Escriba ELIMINAR para confirmar: ");

                            String confirmacionEliminar =
                                    scanner.nextLine().trim();

                            if (!confirmacionEliminar.equals("ELIMINAR")) {
                                System.out.println(
                                        "Eliminacion cancelada. No se realizaron cambios.");
                                break;
                            }

                            boolean eliminado = productoDAO.eliminar(idEliminar);

                            if (eliminado) {
                                System.out.println(
                                        "Producto eliminado correctamente.");
                            } else {
                                System.out.println(
                                        "No se pudo eliminar el producto.");
                            }

                        } catch (NumberFormatException e) {
                            System.out.println(
                                    "Error: ingrese un ID numerico valido.");

                        } catch (SQLException e) {
                            System.out.println(
                                    "Error al eliminar producto: "
                                            + e.getMessage());
                        }

                        break;


                    case 0:
                        System.out.println(
                                "Gracias por utilizar TECHSOLUTIONS.");
                        break;

                    default:
                        System.out.println(
                                "Opcion no valida. Intente nuevamente.");
                }

            } while (opcion != 0);

        } finally {
            try {
                AbandonedConnectionCleanupThread.checkedShutdown();
                System.out.println(
                        "Recursos del controlador MySQL liberados.");
            } catch (Exception e) {
                System.out.println(
                        "Aviso al cerrar el controlador: "
                                + e.getMessage());
            }
        }
    }
}