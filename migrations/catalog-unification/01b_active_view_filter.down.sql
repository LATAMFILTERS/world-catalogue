-- 01b down: vuelve a la definición previa de elimfilters_catalog_active_v guardada por 01b up.
DO $$
DECLARE def text := (SELECT definition FROM catalog_unification.m01b_view_before);
BEGIN
  DROP VIEW public.elimfilters_catalog_active_v;
  EXECUTE 'CREATE VIEW public.elimfilters_catalog_active_v AS ' || def;
END $$;
DROP TABLE catalog_unification.m01b_view_before;

UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
