-- EA11056 (Donaldson P181056): drop the exact-part rows for the references removed by run_326 and refresh its
-- single ledger row. Other SKUs keep their exact-part rows. Catalog identity only.
BEGIN;
DELETE FROM public.exact_part_reference
 WHERE sku='EA11056'
   AND regexp_replace(upper(part_number),'[^A-Z0-9]','','g') IN ('3123012700','73119795','AF2982','A822','HF1687','362','E2408','T562','027002423','TA7325');
DO $$ BEGIN
  IF (SELECT count(*) FROM public.exact_part_conflicts WHERE 'EA11056'=ANY(skus))<>0
  OR (SELECT count(*) FROM public.catalog_reference_classification_conflicts_v WHERE sku='EA11056')<>0
  OR (SELECT count(*) FROM public.bad_crossref_quarantine WHERE source_sku='EA11056')<>0
  OR (SELECT count(DISTINCT sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('P181056'))<>1
  OR (SELECT min(sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('P181056'))<>'EA11056'
  OR (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku='EA11056')<>'VERIFIED'
  THEN RAISE EXCEPTION 'CERTIFICATION_PRECHECK_FAILED'; END IF;
END $$;
UPDATE public.catalog_sku_certification SET certification_state='CERTIFIED', policy_version='2026-11-15-ea11056-catalog-identity-v1',
  resolver_unique=true, exact_reference_conflict_free=true, classification_conflict_free=true, blocker_count=0, blockers=ARRAY[]::text[],
  evidence='{"scope":"CATALOG_IDENTITY_ONLY","laboratory_performance_verified":false,"canonical":"DONALDSON P181056","cleanup":"run_326/run_327"}'::jsonb,
  certified_at=now(), audited_at=now()
WHERE sku='EA11056' AND certification_state='BLOCKED' AND canonical_governance_ok AND regional_policy_ok AND canonical_identity_ok
  AND base_code_unique AND quarantine_free AND application_domain_consistent;
SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku='EA11056';
COMMIT;
