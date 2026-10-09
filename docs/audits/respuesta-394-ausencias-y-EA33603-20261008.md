# Revisión antes de sustituir: 322 conflictos y 72 retiradas

No se sustituyó ninguna base. 5432 se consultó en modo de solo lectura. No se instaló la migración 226. Las únicas escrituras de esta revisión fueron los tres estados de actividad solicitados en 5441.

## 322 conflictos: por qué falta el código antiguo

| Grupo | Cantidad | Explicación comprobada |
|---|---:|---|
| Combustible | 204 | La auditoría catalog_fuel_ingest_audit_20260917 guarda SKU anterior y posterior para la misma referencia. El proceso de ingestión actualizó el SKU y reclasificó las familias EF/ES conforme a su conjunto de combustible/separador. Prueba de renumeración; no de que se haya aprobado retirar la URL publicada. |
| Hidráulicos | 114 | catalog_hydraulic_sku_remap_backup_20260917 guarda old_sku/new_sku y el original. El proceso aplicó su plan de códigos hidráulicos y conservó la referencia Donaldson. |
| Cambio de familia conservando el registro | 1 | EL83489 → EH63489, referencia P173489: mismo ID en el origen común y en la copia del 24 de septiembre, mismo código en 5441. No se localizó una justificación documental de la reclasificación aceite → hidráulico. |
| Sin traza directa | 3 | EA106488, EA108665 y EA121575. Hay candidatos por referencia EA14728, EA14203 y EA15551, respectivamente. Esa coincidencia no prueba una consolidación aprobada ni permite afirmar que las identidades o aplicaciones estén certificadas. |

Las ausencias ya existían en el borrador previo a la transferencia de los 1,302 cambios de producción de esta sesión. No se atribuye quién las ejecutó sin evidencia de autoría. Los registros anteriores muestran cambios de código, no una desaparición del producto por sí misma.

Dos destinos de la auditoría de combustible tampoco existen hoy: EF90907 → ES9907 (candidato actual ES90907) y EF952423 → EF9552423 (candidato actual EF92423). Su referencia coincide, pero la segunda etapa de renumeración debe confirmarse antes de aprobar una redirección definitiva. Los otros 317 destinos con traza del grupo 322 existen activos y conservan la referencia canónica normalizada.

## 72 retiradas del borrador

| Grupo | Cantidad | Explicación comprobada |
|---|---:|---|
| Combustible documentado | 1 | EF30404 → EF90404 en la auditoría de ingestión: comprobar la fila detallada del CSV como autoridad para el destino exacto. |
| Mismo registro en las copias | 2 | ES90990 → EL80990 (P550990), ET932002 → ET92002 (P553202). Mismo ID y referencia. No hay evidencia suficiente para atribuir el motivo o aprobar su baja comercial. |
| Sin traza directa | 69 | Se encontraron candidatos activos con referencia coincidente; no se encontró prueba directa de consolidación autorizada. La explicación de su retiro queda pendiente. No deben aceptarse como bajas aprobadas. |

Las 72 están activas en producción; no todas tienen estado VERIFIED. El estado original de cada una está en la lista. Una coincidencia con códigos provisionales como EF984xxx, EH685xxx o EL883xxx no convierte al candidato en una identidad certificada. Los trabajos sobre EF984004 → EF90628 y EH685199 → EH69797 en 5440 se documentaron aparte; no demuestran por sí mismos por qué el código original ya faltaba en 5441 ni autorizan reenviar al candidato provisional.

## Redirecciones y publicación

Se consultaron las URL https://elimfilters.com/products/{sku_en_minúsculas}/ con HEAD, sin seguir redirecciones. Las 394 URL antiguas devolvieron 404. No hay ninguna 301 comprobada. Las URL de destinos confirmados o candidatos comprobadas también devolvieron 404. Un SKU activo en la base no garantiza que tenga una página publicada en esa ruta.

revision-394-ausencias-20261008.csv contiene una fila por código: grupo, referencia, tipo, explicación, prueba, destino histórico, destino confirmado en 5441, candidato no aprobado, URL anterior, estado HTTP, Location real, comprobación de 301, URL/estado del destino y decisión pendiente del operador. La columna candidato nunca debe tratarse como una redirección autorizada. El JSON conserva los resultados y la hora de comprobación.

Antes de sustituir: confirmar los 72 casos sin traza directa y las dos cadenas incompletas, revisar el cambio de familia EL83489, aprobar destinos, publicar fichas de destino válidas y preparar/comprobar cada 301 sin bucles ni saltos a otra identidad. No se desplegaron redirecciones en esta revisión.

## Tres estados corregidos en 5441

EL30671 = inactivo; EL36019 = inactivo; EF30727 = activo. Solo se modificó catalog_active, se preservaron las fichas y se actualizaron las cachés afectadas. active-flags-three-corrections-20261008.json contiene originales de producción, antes y después de 5441. La corrección se confirmó mediante transacción; producción recibió cero escrituras.

## EA33603: protección que lo rechaza y propuesta para conservarlo

EA33603 está activo y VERIFIED en producción, con referencia OEM KIA OK6B0-23-603. Su original completo se conserva en catalog_production_reconciliation_hold de 5441, approved=false; no se insertó como producto del catálogo del borrador.

La función enforce_elimfilters_codigo_base_policy(), rama LIGHT_DUTY, exige autoridad canónica del fabricante regional. Para NON_EUROPEAN, la política activa exige FRAM. La primera protección que rechaza esta fila es CATALOG_POLICY_V32: LD SKU requires verified canonical manufacturer authority, porque primary_manufacturer_verified=false. Si solo se pusiera ese indicador a true, fallaría la comprobación siguiente: approved_manufacturer=KIA no coincide con FRAM. El indicador fram_absence_verified=true no abre una excepción en esta rama actual. Una búsqueda sin resultados no demuestra ausencia oficial.

La protección evita presentar un OEM como una identidad FRAM verificada sin pruebas. Que el original esté VERIFIED en producción no basta para superar una inserción bajo la protección actual. No se desactivó el control ni se alteró la evidencia para hacerlo pasar.

Propuesta: conservar EA33603 activo en producción y bloquear la sustitución hasta resolverlo. Preparar para aprobación una excepción limitada de preservación de registros existentes: SKU exacto y referencia exacta, original vinculado al respaldo comprobado, evidencia OEM revisada y autorización individual, sin fingir autoridad FRAM ni certificar motores/aplicaciones. Esa excepción sería un cambio de política distinto de la migración 226 y requiere aprobación antes de aplicarse. Alternativamente, obtener una referencia FRAM oficial equivalente y revisar cómo conservar el SKU original sin perder identidad. Ninguna opción se aplicó.

## Evidencias

- missing-sku-history-live-20261008.json: proyección de identidad y definición real de los controles.
- missing-sku-audit-records-20261008.json: registros históricos de renumeración.
- missing-sku-lineage-20261008.json: comparación con origen común y copia del 24 de septiembre.
- revision-394-ausencias-20261008.csv/.json: lista completa y respuestas HTTP.
- active-flags-three-corrections-20261008.json: los tres cambios solicitados.
- scripts/apply_donaldson_hydraulic_sku_rule_20260917.mjs y scripts/migrations/run_103_donaldson_fuel_499_20260917.js: mecanismos de las renumeraciones históricas; no se ejecutaron ahora.
