# Plan de sustitución — requiere aprobación expresa

La única base de borrador es 5441. No se modificó 5432 ni se autorizó instalar la migración 226. Las operaciones de ensayo se realizan en bases nuevas del puerto 5450.

## Respaldo probado

Archivo: C:/ELIMSERVER/backups/catalogo_elimfilters/nightly/2026-10-08/catalogo_elimfilters.dump.

SHA256: 0b39ad10a2f8a386a2b8c11ad0c4f65e67637d2fb4066637cd351ae1e5687f34. Tamaño 96,626,533 bytes. Captura declarada por manifiesto: 2026-10-08 08:53:18 America/Chicago.

La prueba restauró todas las secciones de esquema, datos, funciones, índices, restricciones y triggers en audit_full_prod_20261008_1791470227059, puerto 5450. pg_restore terminó 0; 127 tablas comprobadas, cero diferencias no volátiles de conteo y cero índices inválidos. Los propietarios/ACL originales se excluyeron deliberadamente en el ensayo aislado; se conservan en el archivo original y deben validarse con las cuentas previstas antes del cambio real. Los globals del clúster y sus secretos no están incluidos en un dump de base.

El respaldo histórico no cubre escrituras posteriores a las 08:53. Antes del cambio se necesita un respaldo final consistente o una captura de los cambios posteriores, además de respaldo de roles/permisos/configuración y del enrutamiento/versiones de aplicación. No se ejecuta ni se programa la sustitución mediante este documento.

## Antes de solicitar aprobación

1. Resolver con el operador los 384 conflictos, las diferencias de actividad sin línea base, los dos registros retenidos por autoridad y cada caso que requiera 226. Conservar 5441 como única candidata; verificar su lista de productos activos/publicados y las renumeraciones. Mantener la evidencia completa y el registro de decisiones.
2. Construir una candidata aislada a partir de la producción restaurada y aplicar solo las diferencias aprobadas del borrador y los cambios reconciliados. Una restauración directa de toda la 5441 sobre producción no es el procedimiento propuesto. Validar las diferencias campo por campo para no perder cambios independientes en aplicaciones/especificaciones.
3. Comparar todos los objetos, datos de catálogo, dependencias, evidencias, índices de referencia, secuencias, claves, funciones, triggers, propietarios y permisos. Registrar las excepciones de caché volátil. Probar permisos reales de lectura/escritura con las cuentas de servicio, manteniendo protecciones activas.
4. Probar fichas de todos los SKUs publicados y sitemap, no solo la muestra inicial de diez. Comprobar códigos, producto correcto, estado activo y datos esenciales. Probar redirecciones de renumerados/retirados, HTTP 301 directo al destino correcto, sin ciclos ni cadenas, con ambos dominios, mayúsculas, barra final y parámetros. Validar EF90668/69 -> ES91026/27; EF91026/27 -> ES91026/27; EH60950 -> EH64378. Las dos rutas EF91026/27 están preparadas pero no desplegadas.
5. Preparar comparación aprobada final, recibos de respaldos y restauración, versión de candidata/aplicación, responsables y ventana. Solicitar aprobación expresa del operador solo con ese conjunto completo.

## Cambio, solo tras aprobación

6. Detener/controlar escrituras durante la ventana; registrar la última transacción y asegurar que el respaldo final/captura cubre todas las escrituras. Mantener intacta y recuperable la base anterior de 5432. Preferir conmutación de conexión a una candidata ya validada, conservando la anterior; si se requiere conservar puerto 5432, definir previamente con el operador el mecanismo concreto y probarlo en ensayo. No usar DROP ni sobrescribir a ciegas la base anterior.
7. Conmutar la aplicación y los procesos dependientes a la candidata aprobada. Desplegar las redirecciones aprobadas como un cambio trazable con su versión anterior conservada. Verificar conexión real de cada servicio, cachés, sitemap, fichas publicadas y todos los 301. Registrar resultados y errores.

## Vuelta atrás

8. Si falla una ficha publicada, hay producto equivocado, faltan relaciones/evidencias, falla un permiso, aparecen errores de servicio o redirecciones incorrectas, mantener/controlar escrituras y volver a la conexión/base y versión de aplicación anteriores. Volver también a la versión anterior de redirecciones cuando corresponda, evitando revertir redirecciones previamente válidas.
9. Conservar candidata fallida y capturar las escrituras realizadas después de la conmutación. Reconciliarlas antes de reabrir operaciones; nunca descartarlas. Si la base anterior no está disponible, restaurar el respaldo final en un entorno separado usando los propietarios/permisos necesarios y verificar integridad antes de conectar servicios.
10. Repetir las comprobaciones de todas las fichas publicadas, redirecciones, funciones/triggers, dependencias, permisos y colas. Registrar la recuperación. La base anterior y los respaldos se mantienen hasta aceptación explícita; su eliminación no está autorizada.
