-- 04 up: inserta los SKUs de 5441 que siguen sin existir en 5432 tras 03 (altas ET9/fuel/hidráulico/coolant del 16-17 sep,
-- incluidos los ET9 inactivos con su catalog_scope_reason) y sus filas dependientes.
-- Las políticas del catálogo (triggers) se respetan: cada fila se inserta por separado; si una política la rechaza,
-- la fila completa queda intacta en m04_rejected con el motivo y NO se inserta (decisión pendiente de Victor).
-- También copia catalog_scope_reason/verified_at de 5441 a SKUs comunes donde 5432 no tiene valor.

CREATE TABLE catalog_unification.m04_candidates AS
SELECT s.sku FROM unif_src_5441.elimfilters_catalog s
WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = s.sku);

-- Caché derivada (trg_crossref_cache_sync) de los candidatos, para que la reversa la deje exacta.
CREATE TABLE catalog_unification.m04_cache_before AS
SELECT * FROM public.crossref_resolved_cache WHERE sku IN (SELECT sku FROM catalog_unification.m04_candidates);

CREATE TABLE catalog_unification.m04_skus (sku text PRIMARY KEY, catalog_active boolean);
CREATE TABLE catalog_unification.m04_rejected (sku text PRIMARY KEY, error text NOT NULL, source_row jsonb NOT NULL, rejected_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE catalog_unification.m04_deps (tbl text, col text, preexisting_skus int, rows_inserted int);
CREATE TABLE catalog_unification.m04_preexisting (tbl text, sku text);
CREATE TABLE catalog_unification.m04_evidence_added (id bigint PRIMARY KEY, sku text);

-- 1) Evidencia de aplicaciones primero: APPLICATION_POLICY_V1 la exige al insertar el padre (sin FK, puede ir antes).
INSERT INTO catalog_unification.m04_preexisting
SELECT DISTINCT 'public.catalog_application_evidence', sku FROM public.catalog_application_evidence
WHERE sku IN (SELECT sku FROM catalog_unification.m04_candidates);
WITH ins AS (
  INSERT INTO public.catalog_application_evidence
    (sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at)
  SELECT sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at
  FROM unif_src_5441.catalog_application_evidence WHERE sku IN (SELECT sku FROM catalog_unification.m04_candidates)
  ON CONFLICT DO NOTHING RETURNING id, sku)
INSERT INTO catalog_unification.m04_evidence_added SELECT id, sku FROM ins;

-- 2) Padre, fila a fila.
DO $$
DECLARE r record; cols text;
BEGIN
  SELECT string_agg(format('%I', t.column_name), ', ' ORDER BY t.ordinal_position) INTO cols
  FROM information_schema.columns t
  WHERE t.table_schema = 'public' AND t.table_name = 'elimfilters_catalog'
    AND coalesce(t.column_default, '') NOT LIKE 'nextval(%' AND t.is_identity = 'NO' AND t.is_generated = 'NEVER'
    AND EXISTS (SELECT 1 FROM information_schema.columns s WHERE s.table_schema = 'unif_src_5441'
                AND s.table_name = 'elimfilters_catalog' AND s.column_name = t.column_name);
  FOR r IN SELECT s.sku, s.catalog_active, to_jsonb(s) AS j FROM unif_src_5441.elimfilters_catalog s
           WHERE s.sku IN (SELECT sku FROM catalog_unification.m04_candidates) ORDER BY s.sku LOOP
    BEGIN
      EXECUTE format('INSERT INTO public.elimfilters_catalog (%s) SELECT %s FROM unif_src_5441.elimfilters_catalog WHERE sku = $1', cols, cols) USING r.sku;
      INSERT INTO catalog_unification.m04_skus VALUES (r.sku, r.catalog_active);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO catalog_unification.m04_rejected (sku, error, source_row) VALUES (r.sku, SQLERRM, r.j);
    END;
  END LOOP;
END $$;

-- La evidencia añadida para SKUs rechazados no se queda.
DELETE FROM public.catalog_application_evidence
WHERE id IN (SELECT id FROM catalog_unification.m04_evidence_added WHERE sku IN (SELECT sku FROM catalog_unification.m04_rejected));
DELETE FROM catalog_unification.m04_evidence_added WHERE sku IN (SELECT sku FROM catalog_unification.m04_rejected);

-- 3) Dependientes de los SKUs insertados (con y sin FK). Columnas id seriales/identity quedan a su default.
DO $$
DECLARE d record; pre int; n int; cols text; rel text;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('public.catalog_codigo_base_evidence', 'sku'), ('public.catalog_codigo_base_sanitation_queue', 'sku'),
      ('public.catalog_sku_certification', 'sku'), ('public.exact_part_reference', 'sku'), ('public.kit_components', 'filter_sku'),
      ('public.mann_donaldson_matches', 'elimfilters_sku'), ('public.product_element', 'elimfilters_sku'),
      ('public.product_model', 'elimfilters_sku'), ('public.kg_product_equipment', 'product_sku'),
      ('public.kg_product_systems', 'product_sku'), ('public.kg_product_technologies', 'product_sku'),
      ('public.oem_codes_legacy', 'sku')) v(tbl, col)
  LOOP
    rel := split_part(d.tbl, '.', 2);
    EXECUTE format('INSERT INTO catalog_unification.m04_preexisting SELECT DISTINCT %L, %I FROM %s WHERE %I IN (SELECT sku FROM catalog_unification.m04_skus)',
                   d.tbl, d.col, d.tbl, d.col);
    GET DIAGNOSTICS pre = ROW_COUNT;
    SELECT string_agg(format('%I', t.column_name), ', ' ORDER BY t.ordinal_position) INTO cols
    FROM information_schema.columns t
    WHERE t.table_schema = 'public' AND t.table_name = rel
      AND coalesce(t.column_default, '') NOT LIKE 'nextval(%' AND t.is_identity = 'NO' AND t.is_generated = 'NEVER'
      AND EXISTS (SELECT 1 FROM information_schema.columns s WHERE s.table_schema = 'unif_src_5441' AND s.table_name = rel AND s.column_name = t.column_name);
    EXECUTE format('INSERT INTO %s (%s) SELECT %s FROM unif_src_5441.%I s WHERE s.%I IN (SELECT sku FROM catalog_unification.m04_skus) ON CONFLICT DO NOTHING',
                   d.tbl, cols, cols, rel, d.col);
    GET DIAGNOSTICS n = ROW_COUNT;
    INSERT INTO catalog_unification.m04_deps VALUES (d.tbl, d.col, pre, n);
  END LOOP;
END $$;

-- 4) Alcance ET9 para SKUs comunes.
CREATE TABLE catalog_unification.m04_scope_synced AS
SELECT c.sku FROM public.elimfilters_catalog c JOIN unif_src_5441.elimfilters_catalog s ON s.sku = c.sku
WHERE c.catalog_scope_reason IS NULL AND s.catalog_scope_reason IS NOT NULL
  AND c.sku NOT IN (SELECT sku FROM catalog_unification.m04_skus);
UPDATE public.elimfilters_catalog c
SET catalog_scope_reason = s.catalog_scope_reason, catalog_scope_verified_at = s.catalog_scope_verified_at
FROM unif_src_5441.elimfilters_catalog s
WHERE s.sku = c.sku AND c.sku IN (SELECT sku FROM catalog_unification.m04_scope_synced);

INSERT INTO public.catalog_migration_log (id, sha256, notes)
SELECT :'migration_id', :'migration_sha', jsonb_build_object(
  'candidates', (SELECT count(*) FROM catalog_unification.m04_candidates),
  'skus_inserted', (SELECT count(*) FROM catalog_unification.m04_skus),
  'inactive_inserted', (SELECT count(*) FROM catalog_unification.m04_skus WHERE NOT catalog_active),
  'rejected_by_policy', (SELECT count(*) FROM catalog_unification.m04_rejected),
  'evidence_added', (SELECT count(*) FROM catalog_unification.m04_evidence_added),
  'dependents', (SELECT jsonb_object_agg(tbl, rows_inserted) FROM catalog_unification.m04_deps),
  'scope_synced', (SELECT count(*) FROM catalog_unification.m04_scope_synced))
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, notes = EXCLUDED.notes, applied_at = now(), reverted_at = NULL;
