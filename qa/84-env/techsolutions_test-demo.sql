USE techsolutions_test;
START TRANSACTION;
INSERT INTO categoria (id_categoria,nombre_categoria) VALUES (1,'Monitores QA');
INSERT INTO producto (id_categoria,nombre_producto,marca,precio,stock,estado)
VALUES (1,'Monitor Aula QA','Marca Demo',129900.00,5,'ACTIVO'),
       (1,'Monitor Ultima Unidad QA','Marca Demo',89900.00,1,'ACTIVO'),
       (1,'Monitor Retirado QA','Marca Demo',79900.00,0,'INACTIVO');
COMMIT;
