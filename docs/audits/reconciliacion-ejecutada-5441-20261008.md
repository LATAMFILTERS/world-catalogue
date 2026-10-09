# Reconciliación ejecutada en 5441 — 2026-10-08

Este informe sustituye las conclusiones provisionales anteriores. La 5432 no recibió escrituras de este trabajo; se usaron transacciones de solo lectura. No hubo sustitución de base ni despliegue. 5441 es el único borrador; 5440 queda como referencia. La migración 226 no se instaló en 5441 ni en 5432.

## 1. Origen común

Se confirmó operativamente que la construcción de 5441 utilizó el snapshot catalogo_elimfilters-2026-09-14T04-24-59-677Z-snapshot.dump: constructor de septiembre 14 a las 00:37, selección del snapshot más reciente, dos candidatos conservados, verificador que nombra explícitamente ese archivo y primer arranque/restauración en 5441 a las 00:38. Ver origen-comun-confirmado-20261008.md para las rutas, líneas y límites de esa confirmación. No se afirma una prueba criptográfica de ejecución histórica del comando.

El origen tiene 13,307 filas y carece de catalog_active. No se atribuye un cambio a partir de actividad desconocida; se conservan esas diferencias para revisión separada. Los 2,255 conflictos inicialmente informados eran un error y quedan retirados; son 384 al corregirlo.

## 2. Transferencia de producción

Respaldo previo completo de 5441: closure-reports/db-safety-20261008/draft5441-before-production-transfer-20261008-093941.dump. SHA256 10363169365599fc4c6775e3f35aaa8eb23d3c54bbaa785a20dd2d923cc5c0c6. Manifiesto adyacente con tamaño y fecha; incluye propietarios/permisos del dump de base, no globals del clúster. Su restauración completa no se ensayó en este paso.

De 1,304 casos seleccionados, 1,302 quedaron aplicados y comprobados en 5441 mediante transacción serializable:

- 1,284 registros existentes: identidad/base/estado y evidencia de soporte reconciliados; atributos del producto del borrador conservados.
- 11 altas: identidad y evidencia incorporadas; fila original completa de producción archivada en enrichment_data. La transferencia no certifica ni republica automáticamente sus aplicaciones/especificaciones originales.
- 7 retiradas de producción: registros del borrador conservados como archivos inactivos, sin eliminación física.

143 SKUs exigían retirar de las listas de alternativos entradas cuyo código normalizado era exactamente el nuevo código base. Solo esas entradas se retiraron de las listas activas, preservándolas en el historial. No se desactivaron triggers ni se dispensaron reglas.

Dos altas fueron rechazadas por las reglas existentes y no se publicaron:

| SKU | Registro de producción | Motivo de retención |
|---|---|---|
| EA33603 | KIA OK6B0-23-603, activo, VERIFIED | La autoridad requerida por la política LD no está validada; una búsqueda sin resultado no certifica ausencia de fabricación |
| ED40719 | TB719, retirado, UNVERIFIED; superseded_by ED47754 | La política HD no permite insertar esa identidad sin autoridad Donaldson/ausencia validada |

Los dos originales completos están en public.catalog_production_reconciliation_hold de 5441, approved=false, con motivo; también en el snapshot production-only-transfer-execute.json. Se informa 1,302 aplicados y 2 retenidos, no 1,304 incorporados al catálogo.

La verificación independiente confirmó cero diferencias en base/estado para los aplicados, retiradas inactivas y cero cambios en aplicaciones de equipo/vehículo, especificaciones, tipo, duty, geometría, tecnología, nombre, descripción e imagen de los registros existentes. Comparó catálogo de producción antes/después en los seis campos de identidad/base/estado/actividad: sin cambios. Counts: producción 13,316 total / 13,304 activos; borrador 13,989 total / 13,917 activos. No son porcentajes de certificación del catálogo.

## 3. Cambios del borrador y conflictos

| Tipo de cambio exclusivo del borrador | SKUs |
|---|---:|
| Altas | 1,060 |
| Cambios de estado | 485 |
| Retiradas | 72 |
| Cambios de base y estado | 9 |
| Total | 1,626 |

Archivo cambios-borrador-1626-por-tipo.csv: detalle por SKU y familia, conservado sin afirmar autoría ni mejora. Archivo conflictos-384-para-operador.csv: cada SKU con estado de origen, producción, borrador, actividad y decision_operador vacía. No se aplicó ninguna decisión sobre esos conflictos. Las 15 filas sin cambios de base/estado y las diferencias de actividad sin línea base siguen revisándose por separado.

## 4. Cambios de 5440

De las 19 resoluciones de códigos documentadas en 5440:

- 2 identidades trasladadas a 5441: EF90628/P550628 y EH69797/P169797, VERIFIED y activas. Prueba revertida y ejecución confirmada; evidencia incorporada y original completo archivado. Se importó identidad, sin certificar ni transferir aplicaciones o especificaciones.
- 8 operaciones descartadas como redundantes: EL80352 -> EL82352 y siete consolidaciones. En cuatro, el propietario correcto en 5441 es ES91426, ES91430, ES91422 o ES91436: no se crearon las versiones EF propuestas por 5440. Las otras ya están representadas y el SKU antiguo está ausente.
- 9 operaciones retenidas porque usan 226; aprobación del operador pendiente por caso.

Archivo decisiones-5440-a-5441-20261008.csv contiene cada decisión y su snapshot. No se copiaron globalmente las demás diferencias/metadata de 5440. Sus evidencias, cambios históricos de enlaces y snapshots se conservan como referencias; no se certifican relaciones de motor/aplicación por la existencia de un producto.

## 5. Migración 226

Sigue pendiente. Los informes existentes listan los 9 casos de 5440, los 6 marcados previamente en 5441 y las 566 colisiones potenciales. Bandera, colisión de referencia y equivalencia no son lo mismo. EF90083 requiere revisión especial por P580710/DBF0710; no se decide su tratamiento automáticamente. La aprobación deberá especificar producto, propietario ocupado, alternativa, evidencia y cambio concreto; no autoriza todos los casos por instalar la regla.

## 6. Respaldo de octubre 8 y sustitución

El respaldo fallido vacío fue reemplazado por el respaldo válido de 96,626,533 bytes: SHA256 0b39ad10a2f8a386a2b8c11ad0c4f65e67637d2fb4066637cd351ae1e5687f34, manifiesto 08:53:18 America/Chicago y recibo local de subida 08:53:24. No se descargó ni verificó independientemente el objeto R2 en este trabajo.

Prueba en base nueva audit_full_prod_20261008_1791470227059 del puerto temporal 5450: restauración de todas las secciones de esquema/datos/funciones/índices/restricciones/triggers, exit 0, 127 tablas, cero diferencias de conteo no volátil, cero índices inválidos. Se excluyeron propietarios/ACL en el ensayo, preservados en el dump original; faltan validación de permisos reales y globals/configuración antes de cualquier cambio real.

Ver plan-sustitucion-y-vuelta-atras-20261008.md. Antes de pedir aprobación: resolver conflictos/retenciones/casos 226; validar candidata desde producción más diferencias aprobadas; respaldar/capturar todas las escrituras posteriores a las 08:53; probar roles/permisos, relaciones y todas las fichas/redirecciones publicadas. Mantener producción anterior intacta, versión y conexiones anteriores recuperables, capturar escrituras de la ventana y reconciliarlas si hay vuelta atrás. No se ejecutó ningún paso de sustitución.

HTTP repetido: diez fichas 200, EF90668/69 -> ES91026/27 y EH60950 -> EH64378 301 correcto; EF91026/27 todavía 404. Código preparado para estas dos rutas, sin despliegue; las pruebas locales previas pasaron 40 combinaciones. La verificación de todas las publicaciones y de sus contenidos, además de permisos/roles, queda como condición del plan.
