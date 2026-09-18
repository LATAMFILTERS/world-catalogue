CREATE OR REPLACE VIEW catalog_et9_scope_review_v AS
SELECT
  sku,codigo_base,technology,filter_type,sub_type,description,canonical_source_brand,canonical_source_code,
  CASE
    WHEN upper(coalesce(sub_type,'')) like '%REPLACEMENT ELEMENT%' THEN 'INCLUDE_FILTER_ELEMENT'
    WHEN upper(coalesce(sub_type,'')) like '%BOWL & ELEMENT ASSEMBLY%' THEN 'INCLUDE_COMPLETE_FILTRATION_UNIT'
    WHEN upper(coalesce(description,'')) like '%HOUSING AND ELEMENT%' THEN 'INCLUDE_COMPLETE_FILTRATION_UNIT'
    WHEN upper(coalesce(description,'')) like '%BOWL AND ELEMENT%' THEN 'INCLUDE_COMPLETE_FILTRATION_UNIT'
    WHEN upper(coalesce(description,'')) like '%FILTER HEAD%' THEN 'EXCLUDE_HARDWARE_ONLY_CANDIDATE'
    WHEN upper(coalesce(description,'')) like '%FILTER HOUSING%' OR upper(coalesce(sub_type,'')) like '%FILTER HOUSING%' THEN 'REVIEW_FUNCTIONAL_COMPLETENESS'
    ELSE 'REVIEW_FUNCTIONAL_COMPLETENESS'
  END AS scope_status,
  'Functional rule: standalone metal/hardware piece is out; complete filtration/separation unit is in. Wording alone is not sufficient to exclude a housing/assembly.'::text AS scope_rule
FROM elimfilters_catalog
WHERE sku like 'ET9%';
