-- EF91026 was deleted (run_341). Remove the remaining links to it: the SUPERSEDED alias created by run_340 and the
-- EF91026 entry in the `alternatives` list of ES94925 and ES95957. Nothing else is written.
BEGIN;
DELETE FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND part_number='EF91026' AND sku='ES91026' AND source='RUN_340_RETIRED_INTO_ES91026';
UPDATE public.elimfilters_catalog
   SET alternatives = coalesce((SELECT jsonb_agg(x) FROM jsonb_array_elements(alternatives) x WHERE x <> '"EF91026"'::jsonb), '[]'::jsonb)
 WHERE sku IN ('ES94925','ES95957') AND alternatives @> '["EF91026"]'::jsonb;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.exact_part_reference WHERE upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))='EF91026')<>0
  OR (SELECT count(*) FROM public.elimfilters_catalog WHERE alternatives @> '["EF91026"]'::jsonb)<>0
  OR (SELECT count(*) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('EF91026'))<>0
  THEN RAISE EXCEPTION 'UNLINK_VERIFICATION_FAILED'; END IF;
END $$;
SELECT sku, alternatives FROM public.elimfilters_catalog WHERE sku IN ('ES94925','ES95957') ORDER BY sku;
COMMIT;
