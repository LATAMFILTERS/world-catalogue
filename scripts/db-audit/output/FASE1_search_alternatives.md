# Fase 1 — Búsqueda libre de aplicación: benchmark real + 3 alternativas

## Benchmark real (`bench_equipment_search.js`, EXPLAIN ANALYZE, read-only, hoy)

Reproduce exactamente el SQL de `/api/search/equipment` (server-original.js:1983-2062).

| Escenario | Exec (ms) | Nodo del plan |
|---|---|---|
| Freightliner + Detroit Diesel Series 60 + 2010 | 98 | Index Scan (full, sin filtro útil) |
| Caterpillar | 152 | ídem |
| Volvo truck | **2,476** | ídem |
| Mack | 524 | ídem |
| Komatsu | 60 | ídem |
| Toyota pickup | **1,371** | ídem |
| Toyota forklift | **2,510** | ídem |
| Nissan pickup | **2,537** | ídem |
| BMW | 89 | ídem |
| Honda | 122 | ídem |
| Motor (SERIES 60) | 29 | ídem |
| Freightliner Cascadia 2015 | **2,268** | ídem |

**Causa raíz confirmada por el plan real** (no supuesta): el `Index Scan` sobre `elimfilters_catalog_sku_key` recorre esencialmente toda la tabla (11,308 de 11,338 filas descartadas por filtro en el caso "Volvo truck") y evalúa `jsonb_array_elements()` **fila por fila** para cada EXISTS — el índice GIN trigram existente (`idx_catalog_equipment_applications_trgm`, indexa la columna completa como texto) **no se usa en absoluto** para este patrón de query, porque el filtro real opera sobre `ea->>'model'` extraído del elemento desenrollado, no sobre el texto completo de la columna. Los términos genéricos ("pickup", "truck", "forklift") son los más lentos porque matchean muchos elementos dispersos en muchas filas, incluyendo las 121 filas outlier con hasta 24,350 elementos cada una.

## Verificación de redundancia interna (read-only, hoy)

| Métrica | Valor |
|---|---|
| Elementos totales en `equipment_applications` (HD, arrays >100 elementos, 1,122 filas) | 2,141,191 (≈ la cifra "2.2M" ya descartada para la migración 067) |
| Filas únicas por (sku, make, model) tras deduplicar | **501,913** (−76.6%) |
| SKU peor caso (EL83724/EL86397): 24,350 elementos crudos | 9,331 pares (make,model) únicos (−61.7%) |

## 3 alternativas (ninguna repite el diseño 067)

| # | Diseño | Filas est. | Tamaño est. | Backfill | Precisión | Latencia esperada | Rollback | Mantenimiento |
|---|---|---|---|---|---|---|---|---|
| **1 — Documento de búsqueda compacto por SKU** (recomendada) | Nueva tabla `catalog_equipment_search_index(catalog_id, sku, make, model, engine_codes text[], year_from, year_to)`, deduplicada por (sku,make,model) | 501,913 | ~115 MB (proyectado proporcional a 067: 500MB × 501913/2141191) | Batches de 500, igual patrón que 067 | Alta — conserva make/model exactos; engine/year se agregan por grupo, no se pierden | btree (make,model) → index scan, no unroll; esperable <100ms incluso para términos genéricos | `DROP TABLE`, JSONB permanece fuente única de verdad | Trigger AFTER INSERT/UPDATE/DELETE en `elimfilters_catalog` (mismo patrón que `trg_sync_crossref_cache`) |
| **2 — Columna derivada + tsvector en la propia tabla** | Agregar `search_tsv tsvector` a `elimfilters_catalog`, poblada con make+model+engine únicos extraídos vía trigger, GIN index sobre esa columna | 12,182 (no nueva tabla) | ~20-40 MB (solo el índice GIN sobre texto corto) | Backfill de 1 UPDATE por fila, sin tabla nueva | Media — bueno para ranking/relevancia, LIKE exacto de subcadena requiere trigram adicional | Rápida para full-text (`@@`), pero cambia semántica de "contiene" a "coincide léxicamente" — requiere validar con casos reales tipo "series 60" | `ALTER TABLE DROP COLUMN` | Mismo trigger, una sola tabla, cero JOIN nuevo |
| **3 — Caché de resultados por combinación (make,model,year,engine)** | Redis (ya en uso, `ioredis`), TTL 24-72h, key = hash de params normalizados | 0 filas nuevas en Postgres | Memoria Redis, no Postgres | Ninguno — se llena bajo demanda | Igual a la query actual en frío; instantánea en caliente | No mejora el peor caso (primera búsqueda de un término nuevo sigue en 1-2.5s) | Ninguno — solo TTL de Redis | Ninguno — complementa 1 o 2, no las reemplaza |

**Recomendación:** Alternativa 1 como solución de fondo (resuelve el peor caso, no solo el caso repetido), Alternativa 3 como complemento de bajo costo para mejorar la latencia percibida en el chat mientras se decide/aprueba la 1. Alternativa 2 queda documentada como opción de menor huella si Victor prefiere no crear tabla nueva, con la advertencia de que cambia la semántica de coincidencia (requiere validación adicional con los 12 casos de prueba).

**No implementado a producción — solo diseño + migración dry-run (ver `scripts/migrations/run_068_catalog_equipment_search_index_DRYRUN.js`, no ejecutada) + benchmark reproducible.**
