-- 02 up: esquema HERMES (tablas, índices, vistas) aplicando en orden las migraciones gobernadas del repo.
-- Todas son idempotentes y solo DDL. Nota: volver a ejecutar run_110 después de run_111 falla
-- ("cannot change name of view column source_close_ready to dossier_complete"): bug preexistente de HERMES.
\ir ../../scripts/migrations/run_108_hermes_catalogue_quality_ledger_20260918.sql
\ir ../../scripts/migrations/run_110_hermes_catalogue_dossier_20260918.sql
\ir ../../scripts/migrations/run_111_hermes_duty_source_role_20260918.sql

INSERT INTO public.catalog_migration_log (id, sha256) VALUES (:'migration_id', :'migration_sha')
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, applied_at = now(), reverted_at = NULL;
