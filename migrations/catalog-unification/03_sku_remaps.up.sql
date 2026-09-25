-- 03 up: adopta los remapeos de SKU de 5441 (decisión de Victor 2026-09-24) con tabla de alias permanente.
-- Requiere el esquema de staging unif_src_5441 (stage-sources.ps1).
--  RENAMED     : mismo codigo_base, 1 SKU solo-5432 <-> 1 SKU solo-5441. Se renombra el SKU y se adopta el contenido de la
--                fila de 5441 (reverificada el 16-17 sep). Hijos con FK ON UPDATE CASCADE siguen solos; los hijos sin FK
--                se renombran explícitamente.
--  MERGED_INTO : SKU solo-5432 que el remapeo hidráulico de 5441 fusionó en un SKU que 5432 también tiene.
--                No se borra: queda inactivo con catalog_scope_reason = 'MERGED_INTO:<nuevo>'.
-- La reversa usa catalog_unification.m03_catalog_before (filas completas previas).

CREATE TABLE public.catalog_sku_alias (
  old_sku varchar PRIMARY KEY,
  new_sku varchar NOT NULL,
  relation text NOT NULL CHECK (relation IN ('RENAMED', 'MERGED_INTO')),
  rule text NOT NULL,
  evidence text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE catalog_unification.m03_pairs AS
WITH s41 AS (SELECT sku, upper(codigo_base) AS cb FROM unif_src_5441.elimfilters_catalog),
     s32 AS (SELECT sku, upper(codigo_base) AS cb FROM public.elimfilters_catalog),
     new41 AS (SELECT * FROM s41 WHERE sku NOT IN (SELECT sku FROM s32)),
     old32 AS (SELECT * FROM s32 WHERE sku NOT IN (SELECT sku FROM s41)),
     one_new AS (SELECT cb FROM new41 GROUP BY cb HAVING count(*) = 1),
     one_old AS (SELECT cb FROM old32 GROUP BY cb HAVING count(*) = 1),
     remap AS (SELECT old_sku, new_sku FROM unif_src_5441.catalog_hydraulic_sku_remap_backup_20260917)
SELECT o.sku AS old_sku, n.sku AS new_sku, 'RENAMED'::text AS relation,
       CASE WHEN left(o.sku, 2) = 'EF' AND left(n.sku, 2) = 'ES' THEN 'EF_TO_ES_COOLANT_FUEL_RECLASSIFICATION'
            WHEN left(o.sku, 2) = 'EH' AND left(n.sku, 2) = 'EH' THEN 'DONALDSON_HYDRAULIC_SKU_RULE_20260917'
            ELSE 'CODIGO_BASE_1TO1_REMAP' END AS rule,
       CASE WHEN EXISTS (SELECT 1 FROM remap r WHERE r.old_sku = o.sku AND r.new_sku = n.sku)
            THEN 'catalog_hydraulic_sku_remap_backup_20260917' ELSE 'codigo_base=' || o.cb END AS evidence
FROM old32 o JOIN new41 n ON n.cb = o.cb
WHERE o.cb IN (SELECT cb FROM one_new) AND o.cb IN (SELECT cb FROM one_old)
UNION ALL
-- Caso ambiguo P553202: 5432 ET932002 (08-sep) = 5441 ET92002 (08-sep); ES93202 (16-sep) es alta nueva (04).
SELECT 'ET932002', 'ET92002', 'RENAMED', 'ET9_SIX_TO_FIVE_DIGIT_REMAP', 'codigo_base=P553202; same prefix and creation day'
WHERE EXISTS (SELECT 1 FROM public.elimfilters_catalog WHERE sku = 'ET932002')
  AND EXISTS (SELECT 1 FROM unif_src_5441.elimfilters_catalog WHERE sku = 'ET92002')
  AND NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog WHERE sku = 'ET92002')
UNION ALL
SELECT o.sku, r.new_sku, 'MERGED_INTO', 'DONALDSON_HYDRAULIC_SKU_RULE_20260917', 'catalog_hydraulic_sku_remap_backup_20260917'
FROM old32 o JOIN remap r ON r.old_sku = o.sku
WHERE o.cb NOT IN (SELECT cb FROM new41)
  AND EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = r.new_sku);

INSERT INTO public.catalog_sku_alias (old_sku, new_sku, relation, rule, evidence)
SELECT old_sku, new_sku, relation, rule, evidence FROM catalog_unification.m03_pairs;

-- Caché derivada (trg_crossref_cache_sync) de los SKUs afectados, para que la reversa la deje exacta.
CREATE TABLE catalog_unification.m03_cache_before AS
SELECT * FROM public.crossref_resolved_cache
WHERE sku IN (SELECT old_sku FROM catalog_unification.m03_pairs UNION SELECT new_sku FROM catalog_unification.m03_pairs);

CREATE TABLE catalog_unification.m03_catalog_before AS
SELECT * FROM public.elimfilters_catalog WHERE sku IN (SELECT old_sku FROM catalog_unification.m03_pairs);

-- Hijos sin FK: se renombran solo si el SKU nuevo no existe ya en esa tabla (si existe, se registra y se omite).
CREATE TABLE catalog_unification.m03_dep_renames (tbl text, col text, old_sku text, new_sku text, rows_renamed int, skipped_conflict boolean);
DO $$
DECLARE d record;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('public.kg_product_equipment', 'product_sku'), ('public.kg_product_systems', 'product_sku'),
      ('public.kg_product_technologies', 'product_sku'), ('public.oem_codes_legacy', 'sku'),
      ('public.catalog_sku_certification', 'sku'), ('public.catalog_application_evidence', 'sku'),
      ('public.mann_donaldson_matches', 'elimfilters_sku'), ('public.mann_fleetguard_matches', 'elimfilters_sku'),
      ('public.fleetguard_true_cross', 'elimfilters_sku'), ('public.search_result_priority', 'sku')) v(tbl, col)
  LOOP
    IF to_regclass(d.tbl) IS NULL THEN CONTINUE; END IF;
    EXECUTE format($q$
      INSERT INTO catalog_unification.m03_dep_renames
      SELECT %1$L, %2$L, p.old_sku, p.new_sku, 0, true FROM catalog_unification.m03_pairs p
      WHERE p.relation = 'RENAMED' AND EXISTS (SELECT 1 FROM %1$s t WHERE t.%2$I = p.new_sku)$q$, d.tbl, d.col);
    EXECUTE format($q$
      WITH u AS (
        UPDATE %1$s t SET %2$I = p.new_sku FROM catalog_unification.m03_pairs p
        WHERE t.%2$I = p.old_sku AND p.relation = 'RENAMED'
          AND NOT EXISTS (SELECT 1 FROM catalog_unification.m03_dep_renames r
                          WHERE r.tbl = %1$L AND r.old_sku = p.old_sku AND r.skipped_conflict)
        RETURNING p.old_sku, p.new_sku)
      INSERT INTO catalog_unification.m03_dep_renames
      SELECT %1$L, %2$L, old_sku, new_sku, count(*), false FROM u GROUP BY old_sku, new_sku$q$, d.tbl, d.col);
  END LOOP;
END $$;

-- Evidencia de aplicaciones de 5441 para los SKUs nuevos: APPLICATION_POLICY_V1 exige evidencia verificada del payload
-- exacto antes de aceptar el contenido. No hay FK hacia el catálogo, así que puede ir antes del renombre.
CREATE TABLE catalog_unification.m03_evidence_added (id bigint PRIMARY KEY);
WITH ins AS (
  INSERT INTO public.catalog_application_evidence
    (sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at)
  SELECT sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at
  FROM unif_src_5441.catalog_application_evidence
  WHERE sku IN (SELECT new_sku FROM catalog_unification.m03_pairs WHERE relation = 'RENAMED')
  ON CONFLICT DO NOTHING
  RETURNING id)
INSERT INTO catalog_unification.m03_evidence_added SELECT id FROM ins;

-- Renombre + contenido de 5441 (todas las columnas compartidas salvo id y created_at). FK CASCADE arrastra a los hijos.
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(format('%I = s.%I', column_name, column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns t
  WHERE t.table_schema = 'public' AND t.table_name = 'elimfilters_catalog' AND t.column_name NOT IN ('id', 'created_at') AND t.is_generated = 'NEVER'
    AND EXISTS (SELECT 1 FROM information_schema.columns s WHERE s.table_schema = 'unif_src_5441'
                AND s.table_name = 'elimfilters_catalog' AND s.column_name = t.column_name);
  EXECUTE format('UPDATE public.elimfilters_catalog c SET %s FROM catalog_unification.m03_pairs p
                  JOIN unif_src_5441.elimfilters_catalog s ON s.sku = p.new_sku
                  WHERE c.sku = p.old_sku AND p.relation = %L', cols, 'RENAMED');
END $$;

UPDATE public.elimfilters_catalog c
SET catalog_active = false, catalog_scope_reason = 'MERGED_INTO:' || p.new_sku, catalog_scope_verified_at = now()
FROM catalog_unification.m03_pairs p
WHERE c.sku = p.old_sku AND p.relation = 'MERGED_INTO';

INSERT INTO public.catalog_migration_log (id, sha256, notes)
SELECT :'migration_id', :'migration_sha', jsonb_build_object(
  'renamed', count(*) FILTER (WHERE relation = 'RENAMED'),
  'merged', count(*) FILTER (WHERE relation = 'MERGED_INTO'),
  'dep_rows_renamed', (SELECT coalesce(sum(rows_renamed), 0) FROM catalog_unification.m03_dep_renames),
  'dep_skipped_conflicts', (SELECT count(*) FROM catalog_unification.m03_dep_renames WHERE skipped_conflict))
FROM catalog_unification.m03_pairs
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, notes = EXCLUDED.notes, applied_at = now(), reverted_at = NULL;
