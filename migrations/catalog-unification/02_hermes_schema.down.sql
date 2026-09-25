-- 02 down: elimina el esquema HERMES creado por 02 up. Falla si 05 (datos) sigue aplicada.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.catalog_migration_log WHERE id LIKE '05%' AND reverted_at IS NULL) THEN
    RAISE EXCEPTION 'revert 05_hermes_data first';
  END IF;
END $$;
DROP VIEW IF EXISTS public.hermes_catalogue_dossier_progress_v;
DROP VIEW IF EXISTS public.hermes_catalogue_quality_summary_v;
DROP TABLE IF EXISTS public.hermes_catalogue_dossier;
DROP TABLE IF EXISTS public.hermes_catalogue_backlog;
DROP TABLE IF EXISTS public.hermes_catalogue_evidence;
DROP TABLE IF EXISTS public.hermes_catalogue_readiness;

UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
