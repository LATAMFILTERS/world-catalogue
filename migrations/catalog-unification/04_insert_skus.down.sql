-- 04 down: borra los SKUs insertados por 04, sus dependientes añadidos (sin tocar SKUs que ya existían en cada tabla),
-- la evidencia añadida y la sincronización de alcance.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.catalog_migration_log WHERE id LIKE '05%' AND reverted_at IS NULL) THEN
    RAISE EXCEPTION 'revert 05 first';
  END IF;
END $$;

UPDATE public.elimfilters_catalog SET catalog_scope_reason = NULL, catalog_scope_verified_at = NULL
WHERE sku IN (SELECT sku FROM catalog_unification.m04_scope_synced);

DO $$
DECLARE d record;
BEGIN
  FOR d IN SELECT tbl, col FROM catalog_unification.m04_deps LOOP
    EXECUTE format('DELETE FROM %s t WHERE t.%I IN (SELECT sku FROM catalog_unification.m04_skus)
                    AND t.%I NOT IN (SELECT sku FROM catalog_unification.m04_preexisting WHERE tbl = %L)',
                   d.tbl, d.col, d.col, d.tbl);
  END LOOP;
END $$;

DELETE FROM public.elimfilters_catalog WHERE sku IN (SELECT sku FROM catalog_unification.m04_skus);
DELETE FROM public.catalog_application_evidence WHERE id IN (SELECT id FROM catalog_unification.m04_evidence_added);

DELETE FROM public.crossref_resolved_cache WHERE sku IN (SELECT sku FROM catalog_unification.m04_candidates);
INSERT INTO public.crossref_resolved_cache SELECT * FROM catalog_unification.m04_cache_before;

DROP TABLE catalog_unification.m04_cache_before;
DROP TABLE catalog_unification.m04_scope_synced;
DROP TABLE catalog_unification.m04_evidence_added;
DROP TABLE catalog_unification.m04_preexisting;
DROP TABLE catalog_unification.m04_deps;
DROP TABLE catalog_unification.m04_rejected;
DROP TABLE catalog_unification.m04_skus;
DROP TABLE catalog_unification.m04_candidates;

UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
