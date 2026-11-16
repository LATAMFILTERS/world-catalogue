-- EA18431 (JAC OEM 1109010E843-1): ledger row, catalog identity only (same pattern as run_283 / run_317).
BEGIN;
DO $$ BEGIN
  IF (SELECT count(DISTINCT sku) FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))='1109010E8431')<>1
  OR (SELECT count(DISTINCT sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('1109010E8431'))<>1
  OR (SELECT min(sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('1109010E8431'))<>'EA18431'
  OR (SELECT count(*) FROM public.exact_part_conflicts WHERE 'EA18431'=ANY(skus))<>0
  OR (SELECT count(*) FROM public.catalog_reference_classification_conflicts_v WHERE sku='EA18431')<>0
  OR (SELECT count(*) FROM public.bad_crossref_quarantine WHERE source_sku='EA18431')<>0
  OR (SELECT count(*) FROM public.catalog_sku_certification WHERE sku='EA18431')<>0
  THEN RAISE EXCEPTION 'CERTIFICATION_PRECHECK_FAILED'; END IF;
END $$;
INSERT INTO public.catalog_sku_certification
 (sku,duty,filter_type,codigo_base,certification_state,policy_version,canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
  base_code_unique,resolver_unique,exact_reference_conflict_free,classification_conflict_free,quarantine_free,application_domain_consistent,
  blocker_count,blockers,evidence,certified_at,audited_at)
SELECT sku,'HEAVY_DUTY','air',codigo_base,'CERTIFIED','2026-11-15-ea14334-catalog-identity-v1',true,true,true,true,true,true,true,true,true,0,ARRAY[]::text[],
  '{"scope":"CATALOG_IDENTITY_ONLY","laboratory_performance_verified":false,"canonical":"JAC OEM 1109010E843-1 (verified OEM fallback)"}'::jsonb,now(),now()
FROM public.elimfilters_catalog WHERE sku='EA18431' AND catalog_active;
SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku='EA18431';
COMMIT;
