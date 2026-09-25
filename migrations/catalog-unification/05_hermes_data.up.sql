-- 05 up: copia los datos HERMES de 5441 (tablas vacías recién creadas por 02) conservando sus ids.
-- Requiere 03 y 04: todos los SKUs de 5441 deben existir ya en elimfilters_catalog (FKs).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.hermes_catalogue_readiness UNION ALL SELECT 1 FROM public.hermes_catalogue_backlog
             UNION ALL SELECT 1 FROM public.hermes_catalogue_evidence UNION ALL SELECT 1 FROM public.hermes_catalogue_dossier) THEN
    RAISE EXCEPTION 'HERMES tables are not empty; refusing to merge';
  END IF;
END $$;

DO $$
DECLARE t text; cols text; s record;
BEGIN
  FOREACH t IN ARRAY ARRAY['hermes_catalogue_readiness', 'hermes_catalogue_backlog', 'hermes_catalogue_evidence', 'hermes_catalogue_dossier'] LOOP
    SELECT string_agg(format('%I', c.column_name), ', ' ORDER BY c.ordinal_position) INTO cols
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t
      AND EXISTS (SELECT 1 FROM information_schema.columns x WHERE x.table_schema = 'unif_src_5441' AND x.table_name = t AND x.column_name = c.column_name);
    -- Solo filas cuyo SKU existe en el catálogo (los SKUs rechazados por política en 04 no están).
    EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM unif_src_5441.%I s
                    WHERE (s.sku IS NULL OR s.sku IN (SELECT sku FROM public.elimfilters_catalog))%s',
                   t, cols, cols, t,
                   CASE WHEN t = 'hermes_catalogue_dossier'
                        THEN ' AND (s.backlog_id IS NULL OR s.backlog_id IN (SELECT backlog_id FROM public.hermes_catalogue_backlog))' ELSE '' END);
  END LOOP;
  -- secuencias propias de esas tablas al máximo copiado
  FOR s IN SELECT d.refobjid::regclass AS tbl, a.attname AS col, d.objid::regclass AS seq
           FROM pg_depend d JOIN pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
           WHERE d.classid = 'pg_class'::regclass AND d.deptype IN ('a', 'i')
             AND d.refobjid::regclass::text LIKE 'hermes_catalogue_%' AND pg_get_serial_sequence(d.refobjid::regclass::text, a.attname) IS NOT NULL LOOP
    EXECUTE format('SELECT setval(%L, coalesce((SELECT max(%I) FROM %s), 0) + 1, false)', s.seq, s.col, s.tbl);
  END LOOP;
END $$;

INSERT INTO public.catalog_migration_log (id, sha256, notes)
SELECT :'migration_id', :'migration_sha', jsonb_build_object(
  'readiness', (SELECT count(*) FROM public.hermes_catalogue_readiness),
  'backlog', (SELECT count(*) FROM public.hermes_catalogue_backlog),
  'evidence', (SELECT count(*) FROM public.hermes_catalogue_evidence),
  'dossier', (SELECT count(*) FROM public.hermes_catalogue_dossier),
  'skipped_missing_sku', jsonb_build_object(
    'readiness', (SELECT count(*) FROM unif_src_5441.hermes_catalogue_readiness) - (SELECT count(*) FROM public.hermes_catalogue_readiness),
    'backlog', (SELECT count(*) FROM unif_src_5441.hermes_catalogue_backlog) - (SELECT count(*) FROM public.hermes_catalogue_backlog),
    'evidence', (SELECT count(*) FROM unif_src_5441.hermes_catalogue_evidence) - (SELECT count(*) FROM public.hermes_catalogue_evidence)))
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, notes = EXCLUDED.notes, applied_at = now(), reverted_at = NULL;
