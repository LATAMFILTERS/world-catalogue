-- 05 down: vacía las tablas HERMES (02 down las elimina).
TRUNCATE public.hermes_catalogue_dossier, public.hermes_catalogue_backlog, public.hermes_catalogue_evidence, public.hermes_catalogue_readiness;
UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
