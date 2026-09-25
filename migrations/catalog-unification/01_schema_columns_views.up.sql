-- 01 up: columnas e índices que 5432 no tiene y vistas de catálogo desplegadas en 5441/5440.
-- Solo esquema. Fuentes: scripts/catalog_et9_scope_correction_20260918.sql (columnas + vista ET9),
-- scripts/migrations/run_112_vehicle_application_normalization.js (columnas/índices LD; su backfill NO se aplica aquí),
-- DDL de 5440 para evidence_authority/evidence_source_hash/evidence_payload_hash.

CREATE TABLE IF NOT EXISTS public.catalog_migration_log (
  id text PRIMARY KEY,
  sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  reverted_at timestamptz,
  notes jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE SCHEMA IF NOT EXISTS catalog_unification;

ALTER TABLE public.elimfilters_catalog
  ADD COLUMN IF NOT EXISTS catalog_scope_reason text,
  ADD COLUMN IF NOT EXISTS catalog_scope_verified_at timestamptz;

ALTER TABLE ld_catalog.ld_vehicle_applications
  ADD COLUMN IF NOT EXISTS market_code varchar(8),
  ADD COLUMN IF NOT EXISTS platform_code varchar(80),
  ADD COLUMN IF NOT EXISTS canonical_make varchar(100),
  ADD COLUMN IF NOT EXISTS canonical_model varchar(100),
  ADD COLUMN IF NOT EXISTS model_variant varchar(100),
  ADD COLUMN IF NOT EXISTS year_from smallint,
  ADD COLUMN IF NOT EXISTS year_to smallint,
  ADD COLUMN IF NOT EXISTS engine_displacement varchar(50),
  ADD COLUMN IF NOT EXISTS fuel_type varchar(30),
  ADD COLUMN IF NOT EXISTS filter_position varchar(50),
  ADD COLUMN IF NOT EXISTS evidence_status varchar(20) NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS evidence_source_url text,
  ADD COLUMN IF NOT EXISTS evidence_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_authority varchar(160),
  ADD COLUMN IF NOT EXISTS evidence_source_hash varchar(128),
  ADD COLUMN IF NOT EXISTS evidence_payload_hash varchar(128);

CREATE INDEX IF NOT EXISTS idx_ld_vehicle_canonical_make_model
  ON ld_catalog.ld_vehicle_applications (canonical_make, canonical_model);
CREATE INDEX IF NOT EXISTS idx_ld_vehicle_year_range
  ON ld_catalog.ld_vehicle_applications (year_from, year_to);
CREATE INDEX IF NOT EXISTS idx_ld_vehicle_engine_code_norm
  ON ld_catalog.ld_vehicle_applications (upper(regexp_replace(coalesce(engine_code, ''), '[^A-Z0-9]', '', 'g')));
CREATE INDEX IF NOT EXISTS idx_ld_vehicle_verified_resolution
  ON ld_catalog.ld_vehicle_applications (evidence_status, canonical_make, canonical_model, year_from, year_to, engine_displacement);

-- Vistas tal como están desplegadas en 5441.
\ir ../../scripts/catalog_customer_readiness_view_20260918.sql
\ir ../../scripts/catalog_reference_payload_conflicts_view_20260918.sql
CREATE OR REPLACE VIEW public.catalog_et9_scope_review_v AS
SELECT
 sku,codigo_base,technology,filter_type,sub_type,description,canonical_source_brand,canonical_source_code,
 CASE WHEN catalog_active THEN 'IN_SCOPE' ELSE 'EXCLUDED_HARDWARE_ONLY' END AS scope_status,
 'Functional rule: standalone metal/hardware piece is out; complete filtration/separation unit and replacement element are in.'::text AS scope_rule,
 catalog_active,catalog_scope_reason,catalog_scope_verified_at
FROM public.elimfilters_catalog
WHERE sku LIKE 'ET9%';

INSERT INTO public.catalog_migration_log (id, sha256) VALUES (:'migration_id', :'migration_sha')
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, applied_at = now(), reverted_at = NULL;
