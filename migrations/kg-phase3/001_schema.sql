-- =============================================================================
-- KG PHASE 3 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the kg_crossrefs unified cross-reference table
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects elimfilters_catalog: NO
-- Depends on: Phase 1 must be complete (elimfilters_catalog must exist)
--
-- SECURITY: This file does NOT reference and MUST NOT reference:
--   - codigo_base
--   - BASE (internal field)
--   - MATCHED BY (internal field)
-- These are internal catalog fields and must never appear in KG tables.
-- =============================================================================

-- ─── CROSS-REFERENCES (unified table) ────────────────────────────────────────
-- Normalized replacement for oem_codes + competitor_codes + brand_crossrefs JSONB.
-- Sources:
--   oem_codes    JSONB → ref_type = 'oem' (equipment OEMs) or 'competitor' (filter brands)
--   competitor_codes JSONB → ref_type = 'competitor'
--   brand_crossrefs  JSONB → ref_type = 'brand'
--
-- The source JSONB columns in elimfilters_catalog are NOT cleared during Phase 3.
-- They remain the read source for all API responses until Phase 7 migration.

CREATE TABLE IF NOT EXISTS kg_crossrefs (
  id           SERIAL       PRIMARY KEY,
  product_sku  VARCHAR(50)  NOT NULL,
  ref_type     VARCHAR(20)  NOT NULL,   -- controlled: 'oem', 'competitor', 'brand', 'aftermarket'
  brand        VARCHAR(100) NOT NULL,   -- UPPERCASE, trimmed: 'CUMMINS', 'DONALDSON', 'MANN+HUMMEL'
  part_number  VARCHAR(100) NOT NULL,   -- UPPERCASE, trimmed: '3315476', 'P552100', 'W940/25'
  notes        TEXT,                   -- source format, confidence flags
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_crossref UNIQUE (product_sku, ref_type, brand, part_number),
  CONSTRAINT chk_ref_type CHECK (ref_type IN ('oem', 'competitor', 'brand', 'aftermarket'))
);

COMMENT ON TABLE  kg_crossrefs             IS 'Unified cross-reference table: normalizes oem_codes, competitor_codes, brand_crossrefs JSONB into relational rows';
COMMENT ON COLUMN kg_crossrefs.product_sku IS 'References elimfilters_catalog.sku — no FK to allow catalog updates without cascade';
COMMENT ON COLUMN kg_crossrefs.ref_type    IS 'oem: equipment OEM part#; competitor: filter brand cross-ref; brand: from brand_crossrefs JSONB; aftermarket: reserved';
COMMENT ON COLUMN kg_crossrefs.brand       IS 'UPPERCASE normalized brand name. Uses COMPETITOR_BRANDS classifier from server.js for oem vs competitor distinction.';
COMMENT ON COLUMN kg_crossrefs.part_number IS 'UPPERCASE, trimmed. Internal punctuation retained: W940/25, 600-211-1231. No minimum padding.';
COMMENT ON COLUMN kg_crossrefs.notes       IS 'Source format indicator (format_A, format_C_string, brand_crossrefs_source), data quality flags.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Primary lookup: find cross-references for a product SKU
CREATE INDEX IF NOT EXISTS idx_kg_cr_product_sku ON kg_crossrefs(product_sku);

-- Reverse lookup: find ELIMFILTERS SKUs matching a competitor/OEM part number
-- Critical for autocomplete endpoint and cross-reference search
CREATE INDEX IF NOT EXISTS idx_kg_cr_part_number ON kg_crossrefs(part_number);

-- Brand + part number: "find ELIMFILTERS SKU matching DONALDSON P552100"
CREATE INDEX IF NOT EXISTS idx_kg_cr_brand_part ON kg_crossrefs(brand, part_number);

-- Filter by ref_type: enumerate all OEM refs or all competitor refs
CREATE INDEX IF NOT EXISTS idx_kg_cr_ref_type ON kg_crossrefs(ref_type);

-- UNIQUE constraint (product_sku, ref_type, brand, part_number) creates its own index


-- ─── VERIFICATION ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  tbl_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tbl_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'kg_crossrefs';

  IF tbl_count != 1 THEN
    RAISE EXCEPTION 'Phase 3 schema creation failed: kg_crossrefs table not found';
  END IF;

  RAISE NOTICE '001_schema.sql complete — kg_crossrefs table created (or already existed)';
  RAISE NOTICE 'SECURITY REMINDER: Never SELECT codigo_base, BASE, or MATCHED BY in any subsequent Phase 3 SQL';
END;
$$;
