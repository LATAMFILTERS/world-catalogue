-- 03 down: deshace renombres y fusiones restaurando las filas completas guardadas en m03_catalog_before.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.catalog_migration_log WHERE (id LIKE '04%' OR id LIKE '05%') AND reverted_at IS NULL) THEN
    RAISE EXCEPTION 'revert 05 and 04 first';
  END IF;
END $$;

-- 1) Evidencia de aplicaciones añadida por 03 up.
DELETE FROM public.catalog_application_evidence WHERE id IN (SELECT id FROM catalog_unification.m03_evidence_added);

-- 2) SKU de vuelta al nombre anterior (FK CASCADE devuelve a los hijos con FK) y luego los hijos sin FK.
UPDATE public.elimfilters_catalog c SET sku = p.old_sku
FROM catalog_unification.m03_pairs p WHERE c.sku = p.new_sku AND p.relation = 'RENAMED';

DO $$
DECLARE d record;
BEGIN
  FOR d IN SELECT DISTINCT tbl, col FROM catalog_unification.m03_dep_renames WHERE NOT skipped_conflict LOOP
    EXECUTE format($q$UPDATE %1$s t SET %2$I = r.old_sku FROM catalog_unification.m03_dep_renames r
                      WHERE t.%2$I = r.new_sku AND r.tbl = %1$L AND NOT r.skipped_conflict$q$, d.tbl, d.col);
  END LOOP;
END $$;

-- 3) Contenido completo previo (renombrados y fusionados). Es una vuelta atrás a filas que ya existían, así que los
--    disparadores de política (BEFORE) se desactivan solo durante esta sentencia; el de caché sigue activo.
ALTER TABLE public.elimfilters_catalog DISABLE TRIGGER trg_elimfilters_alternate_integrity;
ALTER TABLE public.elimfilters_catalog DISABLE TRIGGER trg_elimfilters_application_evidence_policy;
ALTER TABLE public.elimfilters_catalog DISABLE TRIGGER trg_elimfilters_codigo_base_policy;
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(format('%I = b.%I', column_name, column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'catalog_unification' AND table_name = 'm03_catalog_before' AND column_name NOT IN ('id', 'sku')
    AND column_name IN (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'elimfilters_catalog' AND is_generated = 'NEVER');
  EXECUTE format('UPDATE public.elimfilters_catalog c SET %s FROM catalog_unification.m03_catalog_before b WHERE c.id = b.id', cols);
END $$;
ALTER TABLE public.elimfilters_catalog ENABLE TRIGGER trg_elimfilters_alternate_integrity;
ALTER TABLE public.elimfilters_catalog ENABLE TRIGGER trg_elimfilters_application_evidence_policy;
ALTER TABLE public.elimfilters_catalog ENABLE TRIGGER trg_elimfilters_codigo_base_policy;

-- 4) Caché derivada de los SKUs afectados, tal como estaba.
DELETE FROM public.crossref_resolved_cache
WHERE sku IN (SELECT old_sku FROM catalog_unification.m03_pairs UNION SELECT new_sku FROM catalog_unification.m03_pairs);
INSERT INTO public.crossref_resolved_cache SELECT * FROM catalog_unification.m03_cache_before;

DROP TABLE public.catalog_sku_alias;
DROP TABLE catalog_unification.m03_cache_before;
DROP TABLE catalog_unification.m03_evidence_added;
DROP TABLE catalog_unification.m03_dep_renames;
DROP TABLE catalog_unification.m03_catalog_before;
DROP TABLE catalog_unification.m03_pairs;

UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
