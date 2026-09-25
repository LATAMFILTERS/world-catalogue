# Unificación del catálogo en 5432

Lleva a `catalogo_elimfilters@5432` (autoridad) los deltas de 5441. Plan completo y decisiones:
`C:\elimfilters-os\docs\plan-unificacion-catalogo.md`. **Nada de esto se ha aplicado a 5432.**

| Migración | Qué hace | Reversa |
|---|---|---|
| `01_schema_columns_views` | `catalog_scope_*` en el catálogo, 16 columnas + 4 índices LD (sin el backfill de `run_112`), 3 vistas de 5441, tabla `catalog_migration_log`, esquema `catalog_unification` | Borra lo añadido |
| `01b_active_view_filter` | `elimfilters_catalog_active_v` con `WHERE catalog_active = true` (en 5432 hoy no filtra). **Cambia lo que ve el público: aprobar aparte** | Restaura la definición previa |
| `02_hermes_schema` | `run_108`, `run_110`, `run_111` del repo (tablas y vistas HERMES) | Borra tablas y vistas HERMES |
| `03_sku_remaps` | 294 renombres (adopta la fila de 5441) + 32 fusiones (quedan inactivas, no se borran) + `catalog_sku_alias` + evidencia de aplicaciones de 5441 | Restaura filas completas, nombres, hijos, evidencia y caché |
| `04_insert_skus` | Altas de 5441 fila a fila respetando las políticas; las rechazadas quedan en `catalog_unification.m04_rejected` | Borra altas, dependientes añadidos, evidencia y restaura caché |
| `05_hermes_data` | Datos HERMES de 5441 (solo SKUs presentes) | `TRUNCATE` |

Uso (siempre primero en el cluster de ensayo):

```powershell
.\stage-sources.ps1 -Dump <5441.dump> -ScratchSecret <clixml> -TargetPort <p> -TargetUser <u> -TargetSecret <clixml> -TargetDb <db>
.\run.ps1 -Direction up   -Port <p> -User <u> -Secret <clixml> -Database <db>
.\run.ps1 -Direction down -Port <p> -User <u> -Secret <clixml> -Database <db>
```

Cada migración corre en una sola transacción (`psql -1`) y queda registrada en `public.catalog_migration_log`.
El esquema `unif_src_5441` (staging) se elimina con `DROP SCHEMA unif_src_5441 CASCADE` cuando ya no se necesite.
