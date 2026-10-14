# Cierre general ELIMFILTERS: avance por bloques, 14 de octubre de 2026

Estado: EN CURSO. No se declara el catálogo completo ni se certifican universalmente motores, aplicaciones, dimensiones o pruebas físicas.

## Lectura vigente

Producción catalogo_elimfilters, puerto 5432, consulta de solo lectura: 13,406 filas, 13,390 activas y 16 inactivas. Registro de certificación activo: 4,699 CERTIFIED, 8,686 BLOCKED y 5 RESEARCHING. Porcentaje registrado: 35.09%; pendientes registrados:8,691. El denominador cambió en una fila durante la sesión por una operación externa.

## Operaciones comprobadas

| Bloque | Productos que pasan a CERTIFIED |
|---|---:|
| Reevaluación LD con identidad y controles vigentes, incluyendo auditorías MANN099/100 |256|
| Reevaluación posterior a clasificación de referencias |62|
| Estados FRAM antiguos contradictorios con la autoridad ya aprobada |986|
| Referencias FRAM comprobadas de nuevo mediante sus páginas oficiales |10|
| EA31877 yEL36006: ficha exacta y aplicaciones publicadas por FRAM |2|
| Identidades MANN faltantes: documento, tipo, GTIN e imagen coincidentes |42|
| Segundo lote de identidades MANN, reconociendo el campo explícito model_family |108|
| Total bruto desbloqueado |1,466|

Además, diez certificados antiguos fueron corregidos a BLOCKED porque fallan los controles actuales. No se retiraron sus productos ni se cambiaron sus fichas. Reducción neta de pendientes del registro en esta etapa:1,456.

Se corrigieron referencias duplicadas de Magneti Marelli en373 productos yde Tecnocomp en140. Estas cantidades son operaciones sobre fichas, pueden solaparse yno equivalen a productos completamente cerrados. Solo se retiraron duplicados exactos de marca/código de la columna incorrecta, preservando las referencias distintas ylos originales en archivos de respaldo.

## Fuente oficial y controles

El lote MANN consultó3,254 códigos originales yconfirmó2,333 mediante coincidencia de título ytipo en el sitio oficial. Eso es investigación documental, no aprobación automática. Para registrar las nuevas identidades se exigió además GTIN válido, imagen exacta, código original igual al actual, origenEUROPEAN ya declarado, familia yterminación coherentes, ausencia de identidad competidora ycumplimiento de los controles vigentes. No se asignó un origen regional por inferencia.

Los modelos no se deducen de años ni de model_type. El ajuste de lectura admite un model_family explícito no ambiguo cuando no existe ya una identidad de modelo ovehículo reconocida. Mantiene los hashes de las aplicaciones antes válidas yla exigencia de evidencia al escribir aplicaciones.

EA31877 yEL36006 fueron corregidos mediante el servicio gobernado de aplicaciones, con la URL yel SHA256 del documento de FRAM. Se almacenaron12 y66 aplicaciones respectivamente, sin inventar códigos de motor. Se verificó que no surgieran regresiones en las promociones MANN.

La base carecía de16 columnas usadas por el servicio relacional vigente. Se añadieron únicamente las definiciones aditivas de las migraciones112/113, sin ejecutar su backfill. Se respaldaron las296,058 filas completas de la tabla afectada, sus columnas eíndices yse comprobó que los valores originales no cambiaron. Las filas antiguas quedaron UNVERIFIED en los nuevos campos de evidencia; no se certificaron por añadir columnas.

## Respaldo, límites ycontinuidad

Los cambios tuvieron prueba previa revertida, archivos completos de las filas afectadas yhuellas SHA256, ylectura posterior. Los originales, documentos yreportes detallados permanecen en el directorio privado de evidencias de esta sesión. Los respaldos por SKU yde la tabla de aplicaciones no son un respaldo completo de producción.

No se sustituyó5432, no se instaló226 yno se eliminaron retenciones manuales. Se conservaron228 códigos anteriores con un único sucesor activo; sin anomalías en esa comprobación de datos. No se afirma haber probado todas las redirecciones301 públicas.

Sigue pendiente resolver identidades ambiguas, origen regional no documentado, códigos que no coinciden con su origen, conflictos de referencias ydocumentos que no se pudieron confirmar. Las siguientes operaciones deben reutilizar los planes documentales por grupos, volver a comprobar producción yconservar los mismos controles; no deben promoverse fichas solo para reducir el conteo.

Validación del cambio de código:40 pruebas de aplicaciones/gateway y146 pruebas de gobernanza pasan.
