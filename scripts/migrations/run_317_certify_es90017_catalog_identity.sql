-- HERMES #1313: ledger row for ES90017 (canonical Donaldson R010017). Same pattern as run_283.
-- Scope: catalog identity only; laboratory performance NOT verified. Single row, no overwrite.
BEGIN;
DO $$ BEGIN
  IF (SELECT count(DISTINCT sku) FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))='R010017')<>1
  OR (SELECT count(*) FROM public.exact_part_conflicts WHERE 'ES90017'=ANY(skus))<>0
  OR (SELECT count(*) FROM public.bad_crossref_quarantine WHERE source_sku='ES90017')<>0
  OR (SELECT count(*) FROM public.catalog_sku_certification WHERE sku='ES90017')<>0
  THEN RAISE EXCEPTION 'CERTIFICATION_PRECHECK_FAILED'; END IF;
END $$;
INSERT INTO public.catalog_sku_certification
 (sku,duty,filter_type,codigo_base,certification_state,policy_version,canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
  base_code_unique,resolver_unique,exact_reference_conflict_free,classification_conflict_free,quarantine_free,application_domain_consistent,
  blocker_count,blockers,evidence,certified_at,audited_at)
SELECT sku,'HEAVY_DUTY','water',codigo_base,'CERTIFIED','2026-11-15-es90017-catalog-identity-v1',true,true,true,true,true,true,true,true,true,0,ARRAY[]::text[],
  '{"scope":"CATALOG_IDENTITY_ONLY","laboratory_performance_verified":false,"canonical":"DONALDSON R010017","oem_added":"WEICHAI 1000424916A","issue":"HERMES #1313"}'::jsonb,now(),now()
FROM public.elimfilters_catalog WHERE sku='ES90017' AND catalog_active;
SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku='ES90017';
COMMIT;
