-- ET9/TURBOCORE scope correction — 2026-09-18
-- Policy: standalone metal/hardware parts are outside the active filtration catalog.
-- Complete filtration/separation units and replacement elements remain in scope.

ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS catalog_active boolean NOT NULL DEFAULT true;
ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS catalog_scope_reason text;
ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS catalog_scope_verified_at timestamptz;

UPDATE elimfilters_catalog
SET catalog_active=false,
    catalog_scope_reason='EXCLUDED_HARDWARE_ONLY_FLEETGUARD_FUEL_FILTER_HEADS',
    catalog_scope_verified_at=now()
WHERE sku = ANY(ARRAY['ET90011','ET90103','ET90125','ET90126','ET90134','ET90618','ET90647','ET91305','ET91402','ET91505','ET91894','ET92005','ET92006','ET92008','ET92011','ET92012','ET92013','ET92014','ET92088','ET92091','ET92092','ET92309','ET92319','ET92367','ET92717','ET93199','ET93352','ET93820','ET93925','ET94144','ET94287','ET94315','ET94450','ET94694','ET94711','ET94795','ET94842','ET94848','ET95498','ET96171','ET96248','ET97034','ET97232','ET97299','ET97737','ET97905','ET97937','ET98190','ET98559','ET99114','ET993200']);

UPDATE elimfilters_catalog
SET catalog_scope_reason = CASE
  WHEN catalog_active=false THEN catalog_scope_reason
  WHEN sku LIKE 'ET9%' AND upper(coalesce(sub_type,'')) LIKE '%REPLACEMENT ELEMENT%' THEN 'INCLUDED_REPLACEMENT_FILTER_ELEMENT'
  WHEN sku LIKE 'ET9%' AND (
       upper(coalesce(sub_type,'')) LIKE '%BOWL & ELEMENT ASSEMBLY%'
       OR upper(coalesce(description,'')) LIKE '%HOUSING AND ELEMENT%'
       OR upper(coalesce(description,'')) LIKE '%BOWL AND ELEMENT%'
  ) THEN 'INCLUDED_COMPLETE_FILTRATION_UNIT'
  WHEN sku LIKE 'ET9%' AND canonical_source_brand='FLEETGUARD' THEN 'INCLUDED_FLEETGUARD_FUEL_MODULE'
  WHEN sku LIKE 'ET9%' THEN 'INCLUDED_FUNCTIONAL_TURBOCORE_UNIT'
  ELSE catalog_scope_reason
END,
catalog_scope_verified_at = CASE WHEN sku LIKE 'ET9%' THEN now() ELSE catalog_scope_verified_at END
WHERE sku LIKE 'ET9%';

CREATE OR REPLACE VIEW elimfilters_catalog_active_v AS
SELECT * FROM elimfilters_catalog WHERE catalog_active=true;

CREATE OR REPLACE VIEW catalog_et9_scope_review_v AS
SELECT
 sku,codigo_base,technology,filter_type,sub_type,description,canonical_source_brand,canonical_source_code,
 CASE WHEN catalog_active THEN 'IN_SCOPE' ELSE 'EXCLUDED_HARDWARE_ONLY' END AS scope_status,
 'Functional rule: standalone metal/hardware piece is out; complete filtration/separation unit and replacement element are in.'::text AS scope_rule,
 catalog_active,catalog_scope_reason,catalog_scope_verified_at
FROM elimfilters_catalog
WHERE sku LIKE 'ET9%';
