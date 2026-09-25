-- 01 down: quita lo que añadió 01 up. Falla si 02-05 siguen aplicadas (dependencias), a propósito.
DROP VIEW IF EXISTS public.catalog_et9_scope_review_v;
DROP VIEW IF EXISTS public.catalog_reference_payload_conflicts_v;
DROP VIEW IF EXISTS public.catalog_customer_readiness_v;

DROP INDEX IF EXISTS ld_catalog.idx_ld_vehicle_verified_resolution;
DROP INDEX IF EXISTS ld_catalog.idx_ld_vehicle_engine_code_norm;
DROP INDEX IF EXISTS ld_catalog.idx_ld_vehicle_year_range;
DROP INDEX IF EXISTS ld_catalog.idx_ld_vehicle_canonical_make_model;

ALTER TABLE ld_catalog.ld_vehicle_applications
  DROP COLUMN IF EXISTS market_code, DROP COLUMN IF EXISTS platform_code, DROP COLUMN IF EXISTS canonical_make,
  DROP COLUMN IF EXISTS canonical_model, DROP COLUMN IF EXISTS model_variant, DROP COLUMN IF EXISTS year_from,
  DROP COLUMN IF EXISTS year_to, DROP COLUMN IF EXISTS engine_displacement, DROP COLUMN IF EXISTS fuel_type,
  DROP COLUMN IF EXISTS filter_position, DROP COLUMN IF EXISTS evidence_status, DROP COLUMN IF EXISTS evidence_source_url,
  DROP COLUMN IF EXISTS evidence_checked_at, DROP COLUMN IF EXISTS evidence_authority, DROP COLUMN IF EXISTS evidence_source_hash,
  DROP COLUMN IF EXISTS evidence_payload_hash;

ALTER TABLE public.elimfilters_catalog
  DROP COLUMN IF EXISTS catalog_scope_reason, DROP COLUMN IF EXISTS catalog_scope_verified_at;

DROP SCHEMA IF EXISTS catalog_unification;  -- RESTRICT: falla si quedan tablas de otras migraciones

UPDATE public.catalog_migration_log SET reverted_at = now() WHERE id = :'migration_id';
