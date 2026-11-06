-- HD governed application inheritance, first authorized pair EA11767 -> EA15231.
-- Apply with psql -X -v ON_ERROR_STOP=1 -f <this file>.
-- Transaction fails closed; no trigger disabling and no false individual-fitment verification.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '45s';

CREATE TABLE IF NOT EXISTS public.catalog_authorized_application_inheritance (
  source_sku text NOT NULL,
  target_sku text NOT NULL,
  source_payload_hash text NOT NULL,
  authorization text NOT NULL,
  official_relation_url text NOT NULL,
  inherited_count integer NOT NULL CHECK (inherited_count > 0),
  individual_fitment_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_sku,target_sku,source_payload_hash)
);

-- Fail if live trigger has diverged. Patch only the exact entry point of
-- its equipment verification branch. Existing OEM verification stays intact.
DO $install$
DECLARE
  definition text;
  needle text := 'IF equipment_changed THEN';
  extension text := $part$
  IF equipment_changed AND NOT vehicle_changed
     AND coalesce(gov->>'inheritance_status','') = 'INHERITED_AUTHORIZED' THEN
    IF duty_text <> 'HEAVY_DUTY'
       OR coalesce((gov->>'equipment_verified')::boolean,false) IS TRUE
       OR coalesce((gov->>'engine_verified')::boolean,false) IS TRUE
       OR NOT EXISTS (
         SELECT 1
         FROM public.catalog_authorized_application_inheritance a
         JOIN public.elimfilters_catalog src
           ON src.sku=a.source_sku
         WHERE a.target_sku=NEW.sku
           AND a.source_sku=gov->>'inherited_from'
           AND a.authorization='ELIMFILTERS_CEO'
           AND a.individual_fitment_verified IS FALSE
           AND src.duty='HEAVY_DUTY'
           AND src.catalog_active IS TRUE
           AND md5(src.equipment_applications::text)=a.source_payload_hash
           AND NEW.equipment_applications=src.equipment_applications
           AND jsonb_array_length(NEW.equipment_applications)=a.inherited_count
           AND coalesce(gov->>'equipment_db_payload_hash','')=a.source_payload_hash
           AND EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(coalesce(NEW.alternatives,'[]'::jsonb)) alt
             WHERE alt.value=src.sku
           )
           AND coalesce(
             NEW.enrichment_data->'documented_alternative_relations'->src.sku->>'relationship',
             ''
           )='INSTALLATION_COMPATIBLE_MEDIA_VARIANT'
           AND coalesce(
             NEW.enrichment_data->'documented_alternative_relations'->src.sku->>'official_authority',
             ''
           )<>''
           AND coalesce(
             NEW.enrichment_data->'documented_alternative_relations'->src.sku->>'source_url',
             ''
           )=a.official_relation_url
       ) THEN
      RAISE EXCEPTION 'APPLICATION_INHERITANCE_NOT_AUTHORIZED: %',NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  $part$;
BEGIN
  SELECT pg_get_functiondef('public.enforce_elimfilters_application_evidence_policy()'::regprocedure)
  INTO definition;
  IF position('APPLICATION_INHERITANCE_NOT_AUTHORIZED' in definition)>0 THEN
    RETURN;
  END IF;
  IF position(needle in definition)=0 OR
     position('APPLICATION_POLICY_V1: SKU % equipment payload is not verified' in definition)=0 THEN
    RAISE EXCEPTION 'TRIGGER_DEFINITION_DRIFT: refuse to replace live policy';
  END IF;
  definition := replace(definition,needle,extension || needle);
  EXECUTE definition;
END
$install$;

-- Lock both rows; validate exact official relation and source count.
DO $apply$
DECLARE
  src public.elimfilters_catalog%ROWTYPE;
  dst public.elimfilters_catalog%ROWTYPE;
  payload_hash text;
  gov jsonb;
  metadata jsonb;
BEGIN
  PERFORM 1 FROM public.elimfilters_catalog
   WHERE sku IN ('EA11767','EA15231') ORDER BY sku FOR UPDATE;
  SELECT * INTO STRICT src FROM public.elimfilters_catalog WHERE sku='EA11767';
  SELECT * INTO STRICT dst FROM public.elimfilters_catalog WHERE sku='EA15231';
  IF src.codigo_base<>'P601767' OR dst.codigo_base<>'DBA5231'
    OR src.duty<>'HEAVY_DUTY' OR dst.duty<>'HEAVY_DUTY'
    OR src.catalog_active IS NOT TRUE OR dst.catalog_active IS NOT TRUE
    OR jsonb_array_length(src.equipment_applications)<>161
    OR jsonb_array_length(dst.equipment_applications) NOT IN (0,161)
    OR NOT (src.alternatives @> '["EA15231"]'::jsonb)
    OR NOT (dst.alternatives @> '["EA11767"]'::jsonb)
    OR dst.enrichment_data->'documented_alternative_relations'->'EA11767'->>'relationship'
       IS DISTINCT FROM 'INSTALLATION_COMPATIBLE_MEDIA_VARIANT'
    OR dst.enrichment_data->'documented_alternative_relations'->'EA11767'->>'official_authority'
       IS DISTINCT FROM 'DONALDSON'
    THEN RAISE EXCEPTION 'PAIR_VALIDATION_FAILED'; END IF;
  IF jsonb_array_length(dst.equipment_applications)=161 AND
     dst.equipment_applications<>src.equipment_applications THEN
    RAISE EXCEPTION 'TARGET_HAS_DIFFERENT_APPLICATIONS'; END IF;
  payload_hash := md5(src.equipment_applications::text);
  INSERT INTO public.catalog_authorized_application_inheritance
   (source_sku,target_sku,source_payload_hash,authorization,official_relation_url,
    inherited_count,individual_fitment_verified)
  VALUES ('EA11767','EA15231',payload_hash,'ELIMFILTERS_CEO',
    'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/donaldson-blue/F111417-ENG/Donaldson-Blue-Filtration-Overview.pdf',
    161,false)
  ON CONFLICT DO NOTHING;
  gov := coalesce(dst.enrichment_data->'application_governance','{}'::jsonb)
    || jsonb_build_object(
      'policy_version','2026-08-19-app-v1',
      'evidence_recorded',true,
      'evidence_authority','ELIMFILTERS_CEO',
      'inheritance_status','INHERITED_AUTHORIZED',
      'inherited_from','EA11767',
      'equipment_verified',false,
      'engine_verified',false,
      'equipment_db_payload_hash',payload_hash);
  metadata := jsonb_build_object(
     'source_sku','EA11767',
     'source_base','P601767',
     'target_base','DBA5231',
     'status','INHERITED_AUTHORIZED',
     'individual_fitment_verified',false,
     'source_evidence_verified',false,
     'equipment_count',161,
     'source_payload_hash',payload_hash,
     'authorized_by','ELIMFILTERS_CEO',
     'inherited_at',now());
  UPDATE public.elimfilters_catalog
     SET equipment_applications=src.equipment_applications,
         enrichment_data=jsonb_set(
           jsonb_set(coalesce(enrichment_data,'{}'::jsonb),
                     '{application_governance}',gov,true),
           '{application_inheritance}',metadata,true)
   WHERE sku='EA15231';
  IF NOT EXISTS (
    SELECT 1 FROM public.elimfilters_catalog c
    WHERE c.sku='EA15231' AND c.equipment_applications=src.equipment_applications
      AND jsonb_array_length(c.equipment_applications)=161
      AND c.enrichment_data->'application_inheritance'->>'status'='INHERITED_AUTHORIZED'
  ) THEN RAISE EXCEPTION 'INHERITANCE_POSTCHECK_FAILED'; END IF;
END
$apply$;
COMMIT;

SELECT sku,codigo_base,jsonb_array_length(equipment_applications) AS equipment_count,
       enrichment_data->'application_inheritance'->>'status' AS inheritance_status,
       enrichment_data->'application_inheritance'->>'individual_fitment_verified'
         AS individual_fitment_verified
FROM public.elimfilters_catalog
WHERE sku IN ('EA11767','EA15231')
ORDER BY sku;
