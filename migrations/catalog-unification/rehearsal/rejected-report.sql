-- Reporte de SKUs de 5441 rechazados por las políticas del catálogo durante 04_insert_skus.
-- Se ejecuta contra una base donde 04 esté aplicada (ensayo o 5432). Salida CSV.
\pset footer off
\pset format csv
SELECT r.sku,
       CASE WHEN r.error LIKE 'ALTERNATE_INTEGRITY%' THEN 'ALTERNATE_INTEGRITY'
            WHEN r.error LIKE 'APPLICATION_POLICY_V1%' THEN 'APPLICATION_POLICY_V1'
            WHEN r.error LIKE 'CATALOG_POLICY_V32%' THEN 'CATALOG_POLICY_V32'
            ELSE 'OTHER' END AS policy,
       r.error,
       r.source_row->>'codigo_base' AS codigo_base,
       r.source_row->>'duty' AS duty,
       r.source_row->>'filter_type' AS filter_type,
       r.source_row->>'technology' AS technology,
       r.source_row->>'catalog_active' AS catalog_active_in_5441,
       r.source_row->>'catalog_scope_reason' AS scope_reason_in_5441,
       r.source_row->>'canonical_source_brand' AS canonical_source_brand,
       r.source_row->>'canonical_source_code' AS canonical_source_code,
       left(r.source_row->>'created_at', 10) AS created_in_5441,
       coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(r.source_row->'equipment_applications') = 'array' THEN r.source_row->'equipment_applications' END), 0) AS equipment_apps,
       coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(r.source_row->'oem_codes') = 'array' THEN r.source_row->'oem_codes' END), 0) AS oem_codes,
       coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(r.source_row->'competitor_codes') = 'array' THEN r.source_row->'competitor_codes' END), 0) AS competitor_codes,
       (SELECT string_agg(c.sku, ' ') FROM public.elimfilters_catalog c WHERE upper(c.codigo_base) = upper(r.source_row->>'codigo_base')) AS catalog_skus_same_codigo_base
FROM catalog_unification.m04_rejected r
ORDER BY 2, 1;
