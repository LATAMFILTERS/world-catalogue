# Reconciliación de catálogo — 2026-10-08

5441 es el único borrador. No se sustituyó producción, no se instaló 226 en 5441/5432, no se trasladaron cambios de 5440 ni se resolvieron conflictos automáticamente. Las cuatro correcciones autorizadas de producción en 5441 se conservan.

## PR y migración 226

El cuerpo del PR #866 ya identifica 5440 como ubicación de las 19 resoluciones del grupo original de 367; sus 348 pendientes no son una medición de 5441. Los snapshots son JSON de originales/dependencias por SKU, no respaldos de base completa. EF90628/P550628 y EH69797/P169797 siguen en 5440, pendientes de traslado controlado.

Consulta de solo lectura: 9 casos marcados en 5440 y 6 en 5441. La lista por SKU contiene producto Donaldson, SKU ocupado y producto ocupante, referencia Fleetguard, URL oficial, página, texto y hash cuando existen. Los 6 de 5441 carecen del registro documental de equivalencia exigido por la 226; no se consideran aprobados. Los 9 de 5440 tienen SHA256 del PDF local coincidente con el registro y línea encontrada en la página de texto guardada. La comprobación no certifica motores/aplicaciones ni reemplaza revisión del operador.

EF90083 requiere revisión especial: el ocupante EF90710/DBF0710 ya está registrado como alternativa de P580710. Códigos distintos no demuestran productos distintos; no se autoriza excepción ni consolidación automática. Otras 566 colisiones potenciales en 5441 se enumeran aparte: no prueban identidad distinta, equivalencia ni necesidad definitiva de usar 226.

## Respaldos y comparación

Se iniciaron únicamente las bases de ensayo del puerto 5450 y se crearon bases nuevas con nombres audit_divergence_*. Se restauró solo el esquema/datos de la tabla de catálogo para comparar; esto no es una prueba de restauración completa de las bases.

- Copia común probable de septiembre: 13,307 filas restauradas. Su inventario identifica fecha, base y snapshot, pero no prueba que fuera el origen de 5441. La búsqueda de su nombre en evidencia/documentación solo encontró las instrucciones. No se afirma origen confirmado.
- Septiembre 24: 5432=13,312; 5441=13,948; 5440=13,210 filas, con SHA256 concordante con cada manifiesto.
- Trece respaldos diarios de producción de septiembre 25 a octubre 7: huellas comprobadas y tablas restauradas en bases nuevas temporales. Octubre 8 tiene un dump vacío y no es válido.

Archivo original: 3,331 diferencias. Comparación de codigo_base, canonical_source_status y catalog_active contra copia común **probable**:

| Clasificación condicional | Filas |
|---|---:|
| Cambio solo de producción | 13 |
| Cambio solo del borrador | 1,060 |
| Cambios distintos en ambos | 2,255 |
| Ambos convergen actualmente | 3 |

Clasificación de rama no equivale a autoría ni a mejora correcta. La atribución sigue sin demostrar; los conflictos requieren operador. La fecha de cada cambio se expresa como intervalo entre capturas, no hora exacta de modificación. Cronología completa de producción: 5,153 eventos en 5,147 SKUs para los tres campos, incluidos cambios fuera de la lista original. Incluye intervalo posterior al último respaldo hasta la captura de lectura de producción.

## Condiciones antes de sustitución

La cuenta disponible de producción no puede respaldar todos los objetos: permiso denegado en public.backup_catalog_audit_batch01_20261007. Se solicitó ruta segura/procedimiento administrativo, sin pedir contraseñas en el chat. No existe un respaldo completo actual validado generado por este trabajo.

Antes de aprobación: respaldo completo actual 5432, roles/permisos y configuración necesarios, checksum y prueba de restauración completa aislada; copia intacta para volver atrás; candidato construido conservando producción y aplicando solo cambios reconciliados; validación de integridad, relaciones, evidencia, cachés, SKUs publicados y HTTP. Sustitución únicamente con aprobación expresa. Volver a la base y versión anteriores si fallan las comprobaciones; registrar y recuperar escrituras de la ventana, sin descartarlas.

Diez fichas publicadas respondieron 200; tres redirecciones antiguas dieron 301 correcto. EF91026/EF91027 respondieron 404: cambios de código y rutas preparados, sin despliegue. Las pruebas locales cubren 40 combinaciones de host, mayúsculas, barra final y parámetros; dos pruebas pasaron. La comprobación HTTP completa debe repetirse con el candidato y después de cualquier sustitución aprobada.

Archivos locales: comparacion-tres-vias-SKU-20261008.csv, produccion-cambios-fechados-20261008.csv, migration226-casos-por-SKU.csv/.md, migration226-colisiones-potenciales-5441.csv, migration226-document-verification.json, temporary-restore-manifest.json y daily-temporary-restore-manifest.json. Los datos completos/snapshots/credenciales no se publican en el PR.
