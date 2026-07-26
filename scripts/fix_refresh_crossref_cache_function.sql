-- Fixes refresh_crossref_cache(): the competitor_codes branch was reading
-- ref->>'brand' instead of ref->>'manufacturer', so almost every
-- competitor_codes-sourced row landed with manufacturer='UNKNOWN' (nearly
-- no competitor_codes entries in the catalog use a "brand" key). Already
-- applied to production on 2026-07-19; kept here for the record and for
-- replaying on any other environment.

CREATE OR REPLACE FUNCTION public.refresh_crossref_cache()
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE v_count INTEGER;
BEGIN
  TRUNCATE crossref_resolved_cache;
  INSERT INTO crossref_resolved_cache (code, sku, manufacturer, score)
  SELECT DISTINCT UPPER(REPLACE(ref->>'code','-','')), c.sku, UPPER(COALESCE(NULLIF(TRIM(ref->>'manufacturer'),''),'UNKNOWN')), 20
  FROM elimfilters_catalog c, jsonb_array_elements(c.oem_codes) AS ref
  WHERE c.oem_codes IS NOT NULL AND jsonb_typeof(c.oem_codes)='array' AND ref->>'code' IS NOT NULL AND TRIM(ref->>'code')!=''
  UNION
  SELECT DISTINCT UPPER(REPLACE(ref->>'code','-','')), c.sku, UPPER(COALESCE(NULLIF(TRIM(ref->>'manufacturer'),''),'UNKNOWN')), 20
  FROM elimfilters_catalog c, jsonb_array_elements(c.competitor_codes) AS ref
  WHERE c.competitor_codes IS NOT NULL AND jsonb_typeof(c.competitor_codes)='array' AND ref->>'code' IS NOT NULL AND TRIM(ref->>'code')!='';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

SELECT refresh_crossref_cache();
SELECT count(*) FROM crossref_resolved_cache;
