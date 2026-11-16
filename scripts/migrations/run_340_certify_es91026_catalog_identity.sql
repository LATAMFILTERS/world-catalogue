-- ES91026 (Donaldson P551026): its ledger row is the 2026-11-08 snapshot. Since then run_338/run_339 removed every
-- exact-reference conflict. The only remaining reason is the retired twin EF91026 (inactive, same base P551026),
-- which the audit counts as a duplicate base. EF91026 is marked superseded by ES91026 (run_275 mechanism) and
-- registered as a SUPERSEDED reference; ES91026 is recertified on live checks (active rows only). Catalog identity only.
BEGIN;
UPDATE public.elimfilters_catalog
   SET enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}',
     '{"state":"INACTIVE_RETIRED","reason":"RETIRED_TWIN_OF_ES91026_SAME_DONALDSON_BASE_P551026","superseded_by":"ES91026","donaldson_base":"P551026","decided_by":"OPERATOR","updated_at":"2026-11-15","migration":"run_340"}'::jsonb)
 WHERE sku='EF91026' AND NOT catalog_active AND codigo_base='P551026';
DELETE FROM public.crossref_resolved_cache WHERE sku='EF91026';
INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
VALUES ('SUPERSEDED','ELIMFILTERS','EF91026','ES91026','RUN_340_RETIRED_INTO_ES91026') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.exact_part_conflicts WHERE 'ES91026'=ANY(skus))<>0
  OR (SELECT count(*) FROM public.catalog_reference_classification_conflicts_v WHERE sku='ES91026')<>0
  OR (SELECT count(*) FROM public.bad_crossref_quarantine WHERE source_sku='ES91026')<>0
  OR (SELECT count(*) FROM public.elimfilters_catalog WHERE catalog_active AND upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))='P551026')<>1
  OR (SELECT count(DISTINCT sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('11110683'),ld_catalog.norm_part('FS19914')))<>1
  OR (SELECT min(sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('11110683'))<>'ES91026'
  OR (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku='ES91026')<>'VERIFIED'
  THEN RAISE EXCEPTION 'CERTIFICATION_PRECHECK_FAILED'; END IF;
END $$;
UPDATE public.catalog_sku_certification SET certification_state='CERTIFIED', policy_version='2026-11-15-es91026-catalog-identity-v1',
  base_code_unique=true, resolver_unique=true, exact_reference_conflict_free=true, classification_conflict_free=true, blocker_count=0, blockers=ARRAY[]::text[],
  evidence='{"scope":"CATALOG_IDENTITY_ONLY","laboratory_performance_verified":false,"canonical":"DONALDSON P551026","cleanup":"run_338/run_339/run_340","base_uniqueness":"active rows only; retired twin EF91026 superseded"}'::jsonb,
  certified_at=now(), audited_at=now()
WHERE sku='ES91026' AND certification_state='BLOCKED' AND canonical_governance_ok AND regional_policy_ok AND canonical_identity_ok AND quarantine_free AND application_domain_consistent;
SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku='ES91026';
COMMIT;
