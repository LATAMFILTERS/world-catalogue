# Origen común confirmado operativamente

El snapshot catalogo_elimfilters-2026-09-14T04-24-59-677Z-snapshot.dump es la copia de producción utilizada para construir la 5441. La confirmación combina registros conservados, no solo el inventario:

1. C:/ELIMSERVER/state/build-catalog-blue-5441.ps1 se creó y modificó el 14 de septiembre a las 00:37:23, hora America/Chicago. Línea 5 selecciona el archivo *-snapshot.dump más reciente por LastWriteTime; línea 16 restaura ese archivo en el puerto 5441 con pg_restore --exit-on-error.
2. Solo hay dos snapshots con ese patrón en el directorio. El del 13 de septiembre terminó a las 11:01; el del 14 de septiembre terminó a las 23:25:47 del día 13. Por tanto, el segundo era el seleccionado al construir la base a las 00:38 del día 14.
3. C:/ELIMSERVER/state/verify-final-catalog-backup.ps1, creado el día 13 a las 23:29 y modificado a las 23:30, identifica explícitamente el nombre catalogo_elimfilters-2026-09-14T04-24-59-677Z-snapshot en su línea 2.
4. C:/ELIMSERVER/state/catalog-pg18-blue/postgres.log registra el primer arranque del puerto 5441 a las 00:38:15 del día 14 y la carga posterior. El archivo de inventario registra snapshot PostgreSQL consistente, fecha de captura y 13,307 filas; la tabla se restauró con ese conteo en el ensayo 5450.

Es una confirmación de procedencia mediante la cadena operativa conservada. No existe aquí una prueba criptográfica de ejecución histórica del comando ni un recibo histórico BLUE_DUMP capturado: se explicita ese límite. La clasificación no atribuye autoría individual ni certifica las mejoras.

El campo catalog_active no existe en ese respaldo. Su ausencia se considera desconocida; no se usa para atribuir cambios contra septiembre 14. Las diferencias actuales de actividad se preservan por separado.
