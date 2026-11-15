-- EL86352 (canonical DONALDSON P556352): refresh its single ledger row. Catalog identity only.
BEGIN;
DO $$ BEGIN
  IF (SELECT count(DISTINCT sku) FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))='P556352')<>1
  OR (SELECT count(DISTINCT sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('P556352'))<>1
  OR (SELECT min(sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('P556352'))<>'EL86352'
  OR (SELECT count(*) FROM public.exact_part_conflicts WHERE 'EL86352'=ANY(skus))<>0
  OR (SELECT count(*) FROM public.catalog_reference_classification_conflicts_v WHERE sku='EL86352')<>0
  OR (SELECT count(*) FROM public.bad_crossref_quarantine WHERE source_sku='EL86352')<>0
  OR (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku='EL86352')<>'VERIFIED'
  THEN RAISE EXCEPTION 'CERTIFICATION_PRECHECK_FAILED'; END IF;
END $$;
UPDATE public.catalog_sku_certification SET codigo_base='P556352', certification_state='CERTIFIED',
  policy_version='2026-11-15-el86352-catalog-identity-v1', canonical_governance_ok=true, canonical_identity_ok=true,
  base_code_unique=true, resolver_unique=true, blocker_count=0, blockers=ARRAY[]::text[],
  evidence='{"scope":"CATALOG_IDENTITY_ONLY","laboratory_performance_verified":false,"canonical":"DONALDSON P556352","fleetguard_equivalent":"LF16352","oem_client_supplied":"JAC 1010305FE010"}'::jsonb,
  certified_at=now(), audited_at=now()
WHERE sku='EL86352' AND certification_state='BLOCKED'
  AND regional_policy_ok AND exact_reference_conflict_free AND classification_conflict_free AND quarantine_free AND application_domain_consistent;
SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku='EL86352';
COMMIT;
