-- kg_verify_prerun.sql
-- Pre-execution verification for KG Phase 1
-- Run BEFORE any migration scripts
-- All results printed by run_sql.py

-- 1.1 Technology distribution
SELECT technology, COUNT(*) AS cnt
FROM elimfilters_catalog
GROUP BY technology
ORDER BY cnt DESC;

-- 1.2 Filter type distribution
SELECT filter_type, COUNT(*) AS cnt
FROM elimfilters_catalog
GROUP BY filter_type
ORDER BY cnt DESC;

-- 1.3 Total product count (expect 4622)
SELECT COUNT(*) AS total_products FROM elimfilters_catalog;

-- 1.4 NULL field check (expect 0 | 0 | 0)
SELECT
  COUNT(*) FILTER (WHERE technology IS NULL)   AS null_technology,
  COUNT(*) FILTER (WHERE filter_type IS NULL)  AS null_filter_type,
  COUNT(*) FILTER (WHERE sku IS NULL)          AS null_sku
FROM elimfilters_catalog;

-- 1.5 KG tables must NOT exist yet (expect 0 rows)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'kg_%';

-- 1.8 Equipment coverage
SELECT
  COUNT(*) AS total,
  COUNT(equipment_applications) FILTER (
    WHERE equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0
  ) AS has_equipment,
  ROUND(
    100.0 * COUNT(equipment_applications) FILTER (
      WHERE equipment_applications IS NOT NULL
        AND jsonb_array_length(equipment_applications) > 0
    ) / COUNT(*), 1
  ) AS pct_with_equipment
FROM elimfilters_catalog;
