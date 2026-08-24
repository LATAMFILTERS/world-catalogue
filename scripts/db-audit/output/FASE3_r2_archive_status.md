# Fase 3 — oem_codes_legacy y familia: estado del archivo verificable

## Restore drill local (ejecutado hoy, sin tocar ninguna base de datos)

`scripts/db-audit/restore_drill_local.js` — valida, sobre los archivos ya exportados en
`scripts/db-audit/output/r2-export/` (local, gitignored): checksum SHA-256 vigente,
cada línea NDJSON es JSON válido, el conteo de filas coincide exactamente con el
manifiesto, y la forma de columnas es consistente en todas las filas.

**Resultado: 34/34 paquetes PASS** (32 tablas + 2 vistas schema-only). Detalle completo en
`scripts/db-audit/output/restore_drill_results.json`.

Esto **no** es la prueba de restauración real en Postgres (que exige una escritura, aunque
sea desechable) — es la mitad local y segura: prueba que el paquete es internamente
consistente y restaurable, antes de pedir autorización para el paso que sí escribe.

## Prefijo R2 versionado propuesto

```
postgres-archives/catalogo-elimfilters/2026-08-12/<tabla>/
  ├── data.ndjson.gz
  ├── schema.sql
  ├── manifest.json
  └── checksum.sha256
```

## Comandos preparados (NO ejecutados — destino/credenciales de R2 sin confirmar)

```bash
# Upload (requiere credenciales R2 configuradas — no existen en este entorno)
rclone copy scripts/db-audit/output/r2-export/ \
  r2remote:elimfilters-db-archive/postgres-archives/catalogo-elimfilters/2026-08-12/ \
  --checksum --dry-run   # quitar --dry-run solo tras autorización explícita

# Verificación remota post-upload (lista objetos + compara checksum)
rclone check scripts/db-audit/output/r2-export/ \
  r2remote:elimfilters-db-archive/postgres-archives/catalogo-elimfilters/2026-08-12/

# Restore drill remoto (descarga y re-verifica, sin escribir en Postgres)
rclone copy r2remote:elimfilters-db-archive/postgres-archives/catalogo-elimfilters/2026-08-12/<tabla>/ /tmp/verify/<tabla>/
sha256sum -c /tmp/verify/<tabla>/checksum.sha256

# Restauración real en Postgres (tabla desechable, requiere autorización — NO ejecutado)
# Ver restore_test.sql.example dentro de cada carpeta de export.

# Rollback si algo sale mal en R2 (objeto ya subido, antes de cualquier DROP en Postgres)
rclone delete r2remote:elimfilters-db-archive/postgres-archives/catalogo-elimfilters/2026-08-12/<tabla>/
```

## Espacio recuperable exacto (si se autoriza el ciclo completo)

- `oem_codes_legacy`: 129 MB (tabla) + 48 MB (`mv_crossref_engine`) = **177 MB**, condicionado
  a que Victor confirme que el motor v1 (`oem_codes_legacy`→`mv_crossref_engine`/`v_crossref_engine`)
  es prescindible — ver hallazgo de la sesión anterior: la cadena viva real es
  `elimfilters_catalog`→`crossref_resolved_cache`→`v_api_resolver_v5`, no esta.
- Resto de la familia de staging/auditoría (30 tablas): **~40 MB**.
- **Total: ~217 MB recuperables**, ninguno ejecutado todavía.

## Pendiente de autorización (no se avanza sin ella)

1. Confirmar destino/credenciales R2 reales.
2. Subida real (`--apply`, sin `--dry-run`).
3. Restauración real en tabla `_restore_test` de Postgres.
4. `DROP` final, solo después de (2) y (3) exitosos.
