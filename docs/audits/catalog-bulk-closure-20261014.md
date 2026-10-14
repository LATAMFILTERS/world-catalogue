# Cierre general ELIMFILTERS: avance por bloques, 14 de octubre de 2026

Estado: EN CURSO. No se declara el catálogo completo ni se certifican universalmente motores, aplicaciones, dimensiones o pruebas físicas.

## Lectura vigente

Producción catalogo_elimfilters, puerto 5432, consulta de solo lectura: 13,406 filas, 13,390 activas y 16 inactivas. Registro de certificación activo: 4,698 CERTIFIED, 8,598 BLOCKED y 94 RESEARCHING. Porcentaje registrado: 35.09%; pendientes registrados: 8,692. El denominador cambió en una fila durante la sesión por una operación externa.

## Operaciones comprobadas

| Bloque | Productos que pasan a CERTIFIED |
|---|---:|
| Reevaluación LD con identidad y controles vigentes, incluyendo auditorías MANN099/100 |256|
| Reevaluación posterior a clasificación de referencias |62|
| Estados FRAM antiguos contradictorios con la autoridad ya aprobada |986|
| Referencias FRAM comprobadas de nuevo mediante sus páginas oficiales |10|
| EA31877 y EL36006: ficha exacta y aplicaciones publicadas por FRAM |2|
| Identidades MANN faltantes: documento, tipo, GTIN e imagen coincidentes |42|
| Segundo lote de identidades MANN, reconociendo el campo explícito model_family |108|
| Reevaluación posterior a clasificación Virgis |6|
| Reevaluación posterior a clasificación LHA |33|
| Clasificación PBR/Cyclone/Diamond |18|
| Clasificación de quince fabricantes |13|
| Clasificación de otros treinta y cuatro fabricantes |4|
| Total bruto de promociones ejecutadas, antes de revisar el alcance MANN |1,540|

Además, diez certificados antiguos fueron corregidos a BLOCKED porque fallan los controles actuales. No se retiraron sus productos ni se cambiaron sus fichas. Además, se retiraron 78 certificaciones MANN de los lotes de 42 y 108: sus documentos publican usos de camión o maquinaria incompatibles con el alcance ligero declarado. Quedaron RESEARCHING para corregir su identidad y alcance con evidencia; no se alteraron ni retiraron sus productos. La validación inicial de esos lotes no detectó este problema semántico. Las promociones brutas no representan el avance neto actual.

Se corrigieron referencias duplicadas de Magneti Marelli en 373 productos y de Tecnocomp en 140. Estas cantidades son operaciones sobre fichas, pueden solaparse y no equivalen a productos completamente cerrados. Solo se retiraron duplicados exactos de marca/código de la columna incorrecta, preservando las referencias distintas y los originales en archivos de respaldo.

## Fuente oficial y controles

El lote MANN consultó 3,254 códigos originales y confirmó 2,333 mediante coincidencia de título y tipo en el sitio oficial. Eso es investigación documental, no aprobación automática. Para registrar las nuevas identidades se exigió además GTIN válido, imagen exacta, código original igual al actual, origen EUROPEAN ya declarado, familia y terminación coherentes, ausencia de identidad competidora y cumplimiento de los controles vigentes. No se asignó un origen regional por inferencia.

Los modelos no se deducen de años ni de model_type. El ajuste de lectura admite un model_family explícito no ambiguo cuando no existe ya una identidad de modelo o vehículo reconocida. Mantiene los hashes de las aplicaciones antes válidas y la exigencia de evidencia al escribir aplicaciones.

EA31877 y EL36006 fueron corregidos mediante el servicio gobernado de aplicaciones, con la URL y el SHA256 del documento de FRAM. Se almacenaron 12 y 66 aplicaciones respectivamente, sin inventar códigos de motor. Se verificó que no surgieran regresiones en las promociones MANN.

La base carecía de 16 columnas usadas por el servicio relacional vigente. Se añadieron únicamente las definiciones aditivas de las migraciones 112/113, sin ejecutar su backfill. Se respaldaron las 296,058 filas completas de la tabla afectada, sus columnas e índices y se comprobó que los valores originales no cambiaron. Las filas antiguas quedaron UNVERIFIED en los nuevos campos de evidencia; no se certificaron por añadir columnas.

## Respaldo, límites y continuidad

Los cambios tuvieron prueba previa revertida, archivos completos de las filas afectadas y huellas SHA256, y lectura posterior. Los originales, documentos y reportes detallados permanecen en el directorio privado de evidencias de esta sesión. Los respaldos por SKU y de la tabla de aplicaciones no son un respaldo completo de producción.

No se sustituyó 5432, no se instaló 226 y no se eliminaron retenciones manuales. Se conservaron 228 códigos anteriores con un único sucesor activo; sin anomalías en esa comprobación de datos. No se afirma haber probado todas las redirecciones 301 públicas.

Sigue pendiente resolver identidades ambiguas, origen regional no documentado, códigos que no coinciden con su origen, conflictos de referencias y documentos que no se pudieron confirmar. Las siguientes operaciones deben reutilizar los planes documentales por grupos, volver a comprobar producción y conservar los mismos controles; no deben promoverse fichas solo para reducir el conteo.

Validación del cambio de código:40 pruebas de aplicaciones/gateway y 146 pruebas de gobernanza pasan.

La continuación corrigió 130 duplicados en 100 fichas Virgis y 134 en 113 fichas LHA, con respaldo, prueba de reversión y verificación posterior. De ellas, seis y 33 productos respectivamente pasaron todos los controles vigentes y quedaron CERTIFIED. Fuentes: https://www.virgis.com/en/air-elements/ y https://ir.donaldson.com/news/news-details/2003/Donaldson-Company-Acquires-LHA-Industrial-Hydraulic-Business-from-Berendsen-Fluid-Power-Inc/default.aspx. Las otras fichas conservan sus bloqueos. La lectura global posterior confirma los totales indicados arriba.

Lectura posterior de solo lectura, 18:07 UTC: confirma los totales de esta revisión. Los 83 RESEARCHING incluyen las cinco retenciones manuales y los 78 casos MANN en revisión documental. La cifra CERTIFIED describe el registro; no acredita certificación física ni aplicaciones universales. Las 228 URL antiguas probadas devolvieron 404 y sus destinos no están en la publicación limitada a diez fichas de fase 1. La continuidad pública de esas redirecciones sigue pendiente.

## Dimensiones expresas del fabricante

Se completaron 78 valores numéricos vacíos en 76 fichas MANN, en dos bloques de diez y 66 productos. Se exigió código completo del fabricante igual a la autoridad actual, documento oficial archivado con SHA256 y etiqueta expresa de diámetro interior, diámetro exterior o altura en milímetros. Se conservaron todos los valores que ya existían; no se trasladaron dimensiones entre marcas ni entre referencias comerciales.

Ambos bloques tuvieron respaldo de las filas afectadas, ejecución de prueba revertida y lectura posterior completa. Las identidades, aplicaciones, clasificación de uso y estados de certificación quedaron iguales. Estas correcciones mejoran las fichas y no reducen por sí solas los pendientes. Los respaldos por producto no constituyen un respaldo íntegro de la base.

## Protección adicional de tipos declarados

La validación rechaza maquinaria expresamente declarada, como excavadoras, cosechadoras y cargadoras, cuando se presenta dentro de aplicaciones de uso ligero. No infiere ese tipo por el fabricante o el nombre del modelo; un camión genérico o una pickup no se considera automáticamente pesado. Se conservan los hashes y los controles de evidencia anteriores.

Las seis pruebas nuevas y las ocho de model_family están incorporadas al comando de gobernanza de CI. Pasaron 160 pruebas de gobernanza. Una evaluación de solo lectura sobre las 6,553 fichas ligeras no encontró entradas con esos tipos explícitos; la nueva protección es preventiva y no resuelve los 78 casos MANN cuyo problema aparece en el documento del fabricante. No se atribuye ninguna reducción de pendientes a este cambio. Su integración y despliegue siguen sujetos a revisión obligatoria.

## Recuperación de códigos completos y periodos publicados

Se recuperaron catorce referencias MANN que estaban reducidas a cuatro dígitos. Se exigió coincidencia de la referencia original con la única referencia MANN completa actual, documento oficial exacto y marcas de vehículos publicadas cubiertas por la política de familias europea existente. Esa clasificación no describe el país de fabricación del filtro. No se renombraron SKUs ni se consolidaron productos. Los originales y dependencias se respaldaron; hubo prueba revertida y verificación posterior. Las catorce fichas permanecen en investigación por aplicaciones pendientes.

El servicio relacional admite ahora periodos publicados con fin abierto explícito, preservando la etiqueta original y las fechas exactas en la evidencia. Guarda el año final como NULL y rechaza fechas imposibles, años contradictorios, etiquetas incompatibles y el uso de 9999 como fecha final. El formato nuevo exige SHA256 de la fuente; los formatos y hashes anteriores se conservan. Once pruebas nuevas están incluidas en CI: pasan 171 pruebas de gobernanza. Este soporte todavía requiere revisión e integración antes de desplegarse.

## Comprobación posterior de producción, 22:07 UTC

Las catorce recuperaciones de código quedaron en investigación. Con el servicio existente, se corrigieron las aplicaciones publicadas de tres referencias con periodos cerrados: EA35148/C35148 (52 filas), EA37181/C27181 (22) y EL37035/HU7035Y (11). Las dos primeras pasaron todos los controles; EL37035 conserva conflictos. Se conservaron condiciones y fechas del fabricante, respaldos por producto y dependencias, reversión comprobada y lectura posterior. No se desplegó el soporte nuevo de periodos abiertos.

En 388 fichas se retiraron 3,214 duplicados de las columnas de referencias, conservando cada pareja única de fabricante y código completo. La función de cada fabricante coincidía entre las secciones OEM/FILTER del catálogo oficial MANN y la política existente. Se excluyeron marcas ambiguas. Se utilizó exclusivamente la ruta existente de limpieza por retirada, sin cambiar autoridad, aplicaciones o certificados ni ampliar el gateway. Respaldo, reversión y lectura posterior verificados. Esta operación no acredita nuevas equivalencias.

La reevaluación posterior permitió certificar EH61613/P171613; las otras fichas conservan sus bloqueos. Lectura global actual: 4,698 certificados y 8,692 pendientes. Los 94 registros en investigación incluyen las cinco retenciones manuales y recuperaciones documentales pendientes. Las cifras anteriores del informe representan cortes previos. Continúan pendientes las redirecciones públicas y la revisión obligatoria del código.

Se confirmó además la autoridad Donaldson de EH60602/P580602, EH60616/P580616 y EH60618/P580618 mediante su tabla oficial F112100, edición 04/26, página impresa 158. La tabla distingue grados de filtración entre referencias de una misma carcasa. Se corrigió únicamente la autoridad documental y se conservaron explícitamente pendientes esas relaciones entre variantes; no hubo nuevas certificaciones, consolidaciones ni cambios de aplicaciones. Respaldo de originales y dependencias, prueba revertida y lectura posterior comprobados.
