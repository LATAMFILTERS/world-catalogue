-- Huella por tabla (filas + suma de hashes de fila). Excluye staging, tablas auxiliares de la migración y el log.
-- Para comparar 5432 en vivo, ignorar public.crossref_resolved_cache (la escribe el search-api).
\pset footer off
\pset format unaligned
\pset fieldsep '|'
\pset tuples_only on
-- Huella por tabla: filas y suma de hashes de cada fila (independiente del orden).
SELECT format('SELECT %L, count(*), coalesce(sum(hashtextextended(t::text, 0)), 0) FROM %I.%I t',
              n.nspname || '.' || c.relname, n.nspname, c.relname)
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'p') AND n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT IN ('unif_src_5441', 'catalog_unification') AND c.relname <> 'catalog_migration_log'
ORDER BY 1
\gexec
