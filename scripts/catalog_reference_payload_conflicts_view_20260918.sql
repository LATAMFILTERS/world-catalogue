CREATE OR REPLACE VIEW catalog_reference_payload_conflicts_v AS
SELECT c.sku,c.codigo_base,
 upper(coalesce(e->>'manufacturer',e->>'brand','')) AS manufacturer,
 upper(coalesce(e->>'code','')) AS reference_code,
 count(*)::int AS payload_count,
 count(distinct upper(coalesce(nullif(e->>'brand',''),e->>'manufacturer','')))::int AS brand_variants,
 CASE WHEN count(distinct upper(coalesce(nullif(e->>'brand',''),e->>'manufacturer',''))) > 1
      THEN 'PROVENANCE_CONFLICT' ELSE 'SAFE_DUPLICATE' END AS conflict_type,
 jsonb_agg(e) AS payloads
FROM elimfilters_catalog c
CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) e
GROUP BY c.sku,c.codigo_base,3,4
HAVING count(*)>1;
