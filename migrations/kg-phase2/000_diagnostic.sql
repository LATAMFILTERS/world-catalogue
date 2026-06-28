-- =============================================================================
-- KG PHASE 2 — DIAGNOSTIC
-- File: 000_diagnostic.sql
-- Purpose: Understand equipment_applications JSONB structure before migration
-- Run BEFORE any Phase 2 scripts
-- Safe: read-only
-- =============================================================================

-- D1: Products with equipment
SELECT
  COUNT(*) FILTER (WHERE equipment_applications IS NOT NULL
    AND jsonb_array_length(equipment_applications) > 0) AS products_with_equipment,
  COUNT(*) FILTER (WHERE equipment_applications IS NULL
    OR jsonb_array_length(equipment_applications) = 0) AS products_without_equipment,
  COUNT(*) AS total_products
FROM elimfilters_catalog;

-- D2: Total individual equipment entries (rows in JSONB arrays)
SELECT COUNT(*) AS total_equipment_entries
FROM elimfilters_catalog,
     jsonb_array_elements(equipment_applications) AS entry
WHERE equipment_applications IS NOT NULL
  AND jsonb_array_length(equipment_applications) > 0;

-- D3: All JSONB field names present across all entries
SELECT DISTINCT jsonb_object_keys(entry) AS field_name
FROM elimfilters_catalog,
     jsonb_array_elements(equipment_applications) AS entry
WHERE equipment_applications IS NOT NULL
ORDER BY field_name;

-- D4: Sample 10 entries (verify field names and values)
SELECT entry
FROM elimfilters_catalog,
     jsonb_array_elements(equipment_applications) AS entry
WHERE equipment_applications IS NOT NULL
  AND jsonb_array_length(equipment_applications) > 0
LIMIT 10;

-- D5: Unique makes (equipment field)
SELECT COUNT(DISTINCT UPPER(TRIM(entry->>'equipment'))) AS unique_makes
FROM elimfilters_catalog,
     jsonb_array_elements(equipment_applications) AS entry
WHERE equipment_applications IS NOT NULL
  AND NULLIF(TRIM(entry->>'equipment'), '') IS NOT NULL;

-- D6: Unique make+model+engine combos (= future kg_equipment_models rows)
SELECT COUNT(*) AS unique_models
FROM (
  SELECT DISTINCT
    UPPER(TRIM(entry->>'equipment')) AS make,
    UPPER(TRIM(COALESCE(entry->>'type', '')))   AS model,
    UPPER(TRIM(COALESCE(entry->>'engine', ''))) AS engine
  FROM elimfilters_catalog,
       jsonb_array_elements(equipment_applications) AS entry
  WHERE equipment_applications IS NOT NULL
    AND NULLIF(TRIM(entry->>'equipment'), '') IS NOT NULL
) uniq;

-- D7: Top 15 makes by product count
SELECT
  UPPER(TRIM(entry->>'equipment')) AS make,
  COUNT(DISTINCT ec.sku) AS product_count
FROM elimfilters_catalog ec,
     jsonb_array_elements(ec.equipment_applications) AS entry
WHERE ec.equipment_applications IS NOT NULL
  AND NULLIF(TRIM(entry->>'equipment'), '') IS NOT NULL
GROUP BY UPPER(TRIM(entry->>'equipment'))
ORDER BY product_count DESC
LIMIT 15;

-- D8: Entries with empty equipment field (cannot be mapped)
SELECT COUNT(*) AS entries_with_empty_make
FROM elimfilters_catalog,
     jsonb_array_elements(equipment_applications) AS entry
WHERE equipment_applications IS NOT NULL
  AND NULLIF(TRIM(entry->>'equipment'), '') IS NULL;
