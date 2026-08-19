BEGIN;

-- Parker Racor Turbine Series compatibility authority:
-- 500FG/500FH -> 2010 element family
-- 900FG/900FH -> 2040 element family
-- 1000FG/1000FH -> 2020 element family
--
-- This migration corrects any legacy description-derived value and stores the
-- compatibility as structured catalog data. The bot reads this field before
-- using any transitional text fallback.

UPDATE elimfilters_catalog
SET specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object(
  'compatible_element_series', '2010',
  'compatibility_authority', 'Parker Racor'
)
WHERE upper(codigo_base) IN ('500FG', '500FH')
   OR upper(sku) = 'ET90500';

UPDATE elimfilters_catalog
SET specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object(
  'compatible_element_series', '2040',
  'compatibility_authority', 'Parker Racor'
)
WHERE upper(codigo_base) IN ('900FG', '900FH')
   OR upper(sku) = 'ET90900';

UPDATE elimfilters_catalog
SET specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object(
  'compatible_element_series', '2020',
  'compatibility_authority', 'Parker Racor'
)
WHERE upper(codigo_base) IN ('1000FG', '1000FH')
   OR upper(sku) = 'ET91000';

COMMIT;
