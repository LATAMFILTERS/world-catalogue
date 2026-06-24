# FASE 4B — PRE-LOAD DATABASE PLAN

## Objetivo
Diseñar una estrategia limpia, segura y validada para la carga de los datos generados durante las fases 3 y 4A hacia PostgreSQL. El foco central de este plan es evitar corrupciones de base de datos, conservar integridad referencial y garantizar que los datos comerciales (OEM, Competitor, Apps, Specs) queden lógicamente segmentados en el entorno de producción.

## Tablas Propuestas

El plan introduce un esquema llamado `ld_catalog` que alojará la data sin pisar ninguna tabla del entorno `public` o `master` anterior.

1. **ld_product_catalog:** Tabla maestra de SKUs LD (`elimfilters_sku` PK).
2. **ld_production_readiness:** Metadatos de tiering comercial.
3. **ld_competitor_cross_references:** Equivalencias de Aftermarket puras.
4. **ld_oem_cross_references:** Equivalencias OEM puras.
5. **ld_vehicle_applications:** Cobertura de aplicaciones vehiculares unificada (master + external).
6. **ld_product_specifications:** Atributos dimensionales unificados.

## Reglas de Integridad Críticas

- **Identidad:** `elimfilters_sku` es la clave primaria unificadora y foránea en todas las tablas secundarias (`ON DELETE CASCADE`).
- **Segregación:** En todo momento, la tabla `ld_competitor_cross_references` estará aislada de `ld_oem_cross_references`, lo cual facilita la renderización en el frontend.
- **Sin Pérdida de Datos:** Las operaciones están definidas como secuencias `INSERT ... ON CONFLICT DO UPDATE/NOTHING` para realizar un *Upsert* limpio. No se emplearán directivas `TRUNCATE` ni `DROP`.

## Orden de Carga (Load Sequence)

| Paso | Archivo de Origen | Tabla de Destino | Registros Estimados | Estrategia |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `phase4a_production_readiness.csv` | `ld_product_catalog` | 7,833 | INSERT / DO NOTHING |
| **2** | `phase4a_production_readiness.csv` | `ld_production_readiness` | 7,833 | UPSERT (Update Flags) |
| **3** | `competitor_cross_references_ld.csv` | `ld_competitor_cross_references` | 66,663 | UPSERT (Ignore dupes) |
| **4** | `oem_cross_references_external_ld.csv` | `ld_oem_cross_references` | 6,213 | UPSERT (Ignore dupes) |
| **5** | `vehicle_applications_master.csv` | `ld_vehicle_applications` | 292,221 | UPSERT (Ignore dupes) |
| **6** | `external_vehicle_applications_ld.csv` | `ld_vehicle_applications` | 18,898 | UPSERT (Ignore dupes) |
| **7** | `external_specs_ld.csv` | `ld_product_specifications` | 1,179 | UPSERT (Update values) |

## Riesgos Detectados (Risk Assessment)

1. **Rendimiento de Inserción Masiva:** Cargar más de 311,000 registros de aplicaciones a través de un ORM estándar o inserciones uno a uno puede ocasionar latencia o *timeouts*.
   - *Mitigación:* Se sugiere usar comandos `COPY` nativos de Postgres, u operaciones de `bulkInsert` empaquetadas en transacciones por bloques de 10,000 registros.
2. **Duplicidad Latente:** Algunas marcas en `vehicle_applications_master.csv` podrían estar escritas de forma marginalmente distinta (ej. `VOLKSWAGEN` vs `VW`).
   - *Mitigación:* Se ha provisto un índice compuesto `UNIQUE (elimfilters_sku, make, model_family, model_type, year)` para evitar duplicidad estricta y permitir a la base de datos manejar las colisiones sin explotar el script.
3. **Bloqueos de Tabla (Locks):** En caso de que el sistema comercial esté corriendo paralelamente contra las tablas antiguas.
   - *Mitigación:* Como el plan ocurre en un esquema `ld_catalog` nuevo/tablas nuevas, las escrituras estarán totalmente aisladas de las consultas a las viejas tablas de `public`.
4. **Campos Vacíos / Nulos:** CSVs exportados suelen representar nulos como texto vacío (`""`). 
   - *Mitigación:* El script de migración deberá parsear correctamente los `""` a `NULL` antes del envío por SQL, particularmente en campos numéricos (como `year`, `kw`, `hp`).

> [!WARNING]
> Este documento representa la planeación teórica. **No se han ejecutado scripts ni sentencias SQL** contra el entorno de base de datos actual en acatamiento de las reglas operativas establecidas. Se espera explícitamente el 'Go/No-Go' para iniciar FASE 4C.
