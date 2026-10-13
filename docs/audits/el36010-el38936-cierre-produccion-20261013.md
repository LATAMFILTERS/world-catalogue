# Correcciones aplicadas en producción

Autorización: el operador pidió corregir EL36010 y EL38936 y después llevarlos a producción. Preparación en rama local, prueba ROLLBACK y ejecución COMMIT en 5432 con consulta posterior.

- EL36010: activo, FRAM PH6010A, CERTIFIED, cero bloqueos.
- EL30671: conserva original inactivo; vínculo de identidad documentado hacia EL36010.
- EL38936: original PH8936 preservado, ahora inactivo con sucesor Heavy Duty EL82008.
- EL82008: activo, Donaldson P502008; recibe referencia competidora FRAM PH8936. Conserva su bloqueo previo REFERENCE_CLASSIFICATION_CONFLICT; no se certificó por arrastre.

## Unicidad de EL36010

La evaluación run_093 preparada en esta rama excluye únicamente EL30671 si está inactivo, con fabricante FRAM y base PH6010A coincidentes, sucesor EL36010 activo y vínculo verificado. Las pruebas con el SQL exacto pasaron: original retirado aprobado cuenta un dueño; dos activos cuentan dos; retirado sin enlace cuenta dos; tercer dueño activo cuenta dos. No se cambian triggers ni otros duplicados. No se ejecutó el run_093 global ni se instaló migración 226; la adaptación del código queda para revisión en PR.

## Continuidad de EL38936

La ficha contiene 11 aplicaciones de camiones Fuso FE/FG/FH, motores 3.9/4.9/5.0/5.9 litros. La API oficial de Premium Guard para HG50040 enumera PH8936 y P502008 en su lista de interchanges: https://api.pgfilters.com/catalog/api/v1/products/HG50040/interchanges . Consulta HTTP 200 conservada en HG50040-current.json; payload/hash incluidos en el reporte.

Se eligió el propietario Heavy Duty existente de P502008, sin crear duplicado. Ambos fabricantes tienen especificaciones propias: las dimensiones y aplicaciones originales no se mezclaron ni trasladaron; no se certificaron motores. EL38936 y EL30671 tienen cada uno un único destino activo SUPERSEDED. Esto verifica la base y las referencias de búsqueda, no una prueba HTTP pública ni redirecciones 301.

## Respaldo y verificación

Respaldo: final-two-originals-2026-10-13T15-12-54-954Z.json. Incluye las cuatro filas completas, auditorías previas y referencias de alias anteriores. SHA256 comprobado por relectura antes de escribir: 0cedbf4f1386a6f97473138ea6529ddf53361fc41f0d241440f2325872f30e2c. Manifiesto adyacente. Es respaldo de los registros intervenidos, no de toda la base.

Prueba: final-two-corrections-dry-run.json. Ejecución y consulta posterior: final-two-corrections-execute.json. Comparación campo por campo: solo resolución histórica de EL30671, actividad/resolución de EL38936, referencia PH8936 agregada a EL82008 y auditorías de los dos casos.

Si se solicita reversión: comprobar hashes y coincidencia con after, respaldar cambios posteriores; restaurar solo campos intervenidos y las dos auditorías desde el original; retirar únicamente los alias de esta ejecución que no existían antes y reconstruir cachés por mecanismo canónico. No restaurar la base global ni sobreescribir trabajo posterior. No se ejecutó reversión.

Se reutilizaron consultas/gateway vigentes. El arnés temporal conserva copia, pruebas y resultado; no se creó otro catálogo maestro ni tareas recurrentes. No hubo sustitución de base ni despliegue de servidor.
