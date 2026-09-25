-- Prueba en seco (transacción descartada): qué altas de unif_src_5441 rechazarían las políticas del catálogo.
\pset footer off
BEGIN;
-- Evidencia de 5441 para todas las altas (como hace 04), para que solo fallen las políticas reales.
INSERT INTO public.catalog_application_evidence (sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at)
SELECT sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata, created_at
FROM unif_src_5441.catalog_application_evidence s WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = s.sku) ON CONFLICT DO NOTHING;
CREATE TEMP TABLE dry (sku text, err text);
DO $$
DECLARE r record; cols text;
BEGIN
  SELECT string_agg(format('%I', t.column_name), ', ' ORDER BY t.ordinal_position) INTO cols
  FROM information_schema.columns t WHERE t.table_schema='public' AND t.table_name='elimfilters_catalog'
    AND coalesce(t.column_default,'') NOT LIKE 'nextval(%' AND t.is_generated='NEVER'
    AND EXISTS (SELECT 1 FROM information_schema.columns s WHERE s.table_schema='unif_src_5441' AND s.table_name='elimfilters_catalog' AND s.column_name=t.column_name);
  FOR r IN SELECT sku FROM unif_src_5441.elimfilters_catalog s WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = s.sku) LOOP
    BEGIN
      EXECUTE format('INSERT INTO public.elimfilters_catalog (%s) SELECT %s FROM unif_src_5441.elimfilters_catalog WHERE sku = $1', cols, cols) USING r.sku;
      INSERT INTO dry VALUES (r.sku, NULL);
    EXCEPTION WHEN OTHERS THEN INSERT INTO dry VALUES (r.sku, SQLERRM);
    END;
  END LOOP;
END $$;
SELECT CASE WHEN err IS NULL THEN 'OK' ELSE regexp_replace(regexp_replace(err, 'SKU [A-Z0-9]+', 'SKU <x>'), 'payload [0-9a-f]+', 'payload <h>') END AS result,
       count(*) AS n, string_agg(sku, ',' ORDER BY sku) AS skus
FROM dry GROUP BY 1 ORDER BY 2 DESC;
ROLLBACK;
