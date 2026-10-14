# Cierre general ELIMFILTERS: avance por bloques, 14 de octubre de 2026

Estado: EN CURSO. No se declara el catálogo completo ni se certifican universalmente motores, aplicaciones, dimensiones o pruebas físicas.

## Lectura vigente

Producción catalogo_elimfilters, puerto 5432, consulta de solo lectura: 13,406 filas, 13,390 activas y 16 inactivas. Registro de certificación activo: 4,738 CERTIFIED, 8,647 BLOCKED y 5 RESEARCHING. Porcentaje registrado: 35.38%; pendientes registrados: 8,652. El denominador cambió en una fila durante la sesión por una operación externa.

## Operaciones comprobadas

| Bloque | Productos que pasan a CERTIFIED |
|---|---:|
| Reevaluación LD con identidad y controles vigentes, incluyendo auditorías MANN099/100 |256|
| Reevaluación posterior a clasificación de referencias |62|
| Estados FRAM antiguos contradictorios con la autoridad y a aprobada |986|
| Referencias FRAM comprobadas de nuevo mediante sus páginas oficiales |10|
| EA 31877 y EL 36006: ficha exacta y aplicaciones publicadas por FRAM |2|
| Identidades MANN faltantes: documento, tipo, GTIN e imagen coincidentes |42|
| Segundo lote de identidades MANN, reconociendo el campo explícito model_family |108|
| Reevaluación posterior a clasificación Virgis |6|
| Reevaluación posterior a clasificación LHA |33|
| Total bruto desbloqueado |1,505|

Además, diez certificados antiguos fueron corregidos a BLOCKED porque fallan los controles actuales. No se retiraron sus productos ni se cambiaron sus fichas. Reducción neta de pendientes del registro en esta etapa: 1,495.

Se corrigieron referencias duplicadas de Magneti Marelli en 373 productos y de Tecnocomp en 140. Estas cantidades son operaciones sobre fichas, pueden solaparse y no equivalen a productos completamente cerrados. Solo se retiraron duplicados exactos de marca/código de la columna incorrecta, preservando las referencias distintas y los originales en archivos de respaldo.

## Fuente oficial y controles

El lote MANN consultó 3,254 códigos originales y confirmó 2,333 mediante coincidencia de título y tipo en el sitio oficial. Eso es investigación documental, no aprobación automática. Para registrar las nuevas identidades se exigió además GTIN válido, imagen exacta, código original igual al actual, origen EUROPEAN y a declarado, familia y terminación coherentes, ausencia de identidad competidora y cumplimiento de los controles vigentes. No se asignó un origen regional por inferencia.

Los modelos no se deducen de años ni de model_type. El ajuste de lectura admite un model_family explícito no ambiguo cuando no existe y a una identidad de modelo o vehículo reconocida. Mantiene los hashes de las aplicaciones antes válidas y la exigencia de evidencia al escribir aplicaciones.

EA 31877 y EL 36006 fueron corregidos mediante el servicio gobernado de aplicaciones, con la URL y el SHA256 del documento de FRAM. Se almacenaron 12 y 66 aplicaciones respectivamente, sin inventar códigos de motor. Se verificó que no surgieran regresiones en las promociones MANN.

La base carecía de 16 columnas usadas por el servicio relacional vigente. Se añadieron únicamente las definiciones aditivas de las migraciones 112/113, sin ejecutar su backfill. Se respaldaron las 296,058 filas completas de la tabla afectada, sus columnas e índices y se comprobó que los valores originales no cambiaron. Las filas antiguas quedaron UNVERIFIED en los nuevos campos de evidencia; no se certificaron por añadir columnas.

## Respaldo, límites y continuidad

Los cambios tuvieron prueba previa revertida, archivos completos de las filas afectadas y huellas SHA256, y lectura posterior. Los originales, documentos y reportes detallados permanecen en el directorio privado de evidencias de esta sesión. Los respaldos por SKU y de la tabla de aplicaciones no son un respaldo completo de producción.

No se sustituyó 5432, no se instaló 226 y no se eliminaron retenciones manuales. Se conservaron 228 códigos anteriores con un único sucesor activo; sin anomalías en esa comprobación de datos. No se afirma haber probado todas las redirecciones 301 públicas.

Sigue pendiente resolver identidades ambiguas, origen regional no documentado, códigos que no coinciden con su origen, conflictos de referencias y documentos que no se pudieron confirmar. Las siguientes operaciones deben reutilizar los planes documentales por grupos, volver a comprobar producción y conservar los mismos controles; no deben promoverse fichas solo para reducir el conteo.

Validación del cambio de código:40 pruebas de aplicaciones/gateway y 146 pruebas de gobernanza pasan.

La continuación corrigió 130 duplicados en 100 fichas Virgis y 134 en 113 fichas LHA, con respaldo, prueba de reversión y verificación posterior. De ellas, seis y 33 productos respectivamente pasaron todos los controles vigentes y quedaron CERTIFIED. Fuentes: https://www.virgis.com/en/air-elements/ y https://ir.donaldson.com/news/news-details/2003/Donaldson-Company-Acquires-LHA-Industrial-Hydraulic-Business-from-Berendsen-Fluid-Power-Inc/default.aspx. Las otras fichas conservan sus bloqueos. La lectura global posterior confirma los totales indicados arriba.
