# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 2: Equipment Normalization
# Validation Checklist + Rollback Strategy

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## 1. VALIDATION CHECKLIST

Run `validate.sql` after all 4 Phase 2 scripts complete. All checks must pass.

### A. Schema Integrity
- [ ] `kg_equipment_makes` table exists with all 7 columns
- [ ] `kg_equipment_models` table exists with all 11 columns
- [ ] `kg_product_equipment` table exists with all 7 columns
- [ ] All indexes created (6 minimum)
- [ ] UNIQUE constraints present on makes.slug, (models.make_id, models.slug), (pe.product_sku, pe.model_id)
- [ ] FK constraint: kg_equipment_models.make_id → kg_equipment_makes.id
- [ ] FK constraint: kg_product_equipment.model_id → kg_equipment_models.id
- [ ] Triggers: trg_kg_equipment_makes_updated_at and trg_kg_equipment_models_updated_at active

### B. Make Data Integrity
- [ ] kg_equipment_makes row count: BETWEEN 20 AND 120
- [ ] No NULL slugs in kg_equipment_makes
- [ ] No duplicate slugs in kg_equipment_makes
- [ ] All slugs match pattern `^[a-z][a-z0-9-]*$` (lowercase, hyphen-separated)
- [ ] No NULL display_names

### C. Model Data Integrity
- [ ] kg_equipment_models row count: BETWEEN 100 AND 2,500
- [ ] No NULL slugs in kg_equipment_models
- [ ] All make_id values reference valid kg_equipment_makes rows (zero orphans)
- [ ] All (make_id, slug) pairs are unique
- [ ] Year range validity: all year_from/year_to values NULL or BETWEEN 1950 AND 2030
- [ ] No year inversion: year_from <= year_to where both non-NULL

### D. Product Coverage
- [ ] kg_product_equipment row count: BETWEEN 500 AND 8,000
- [ ] Products linked to equipment / total catalog: BETWEEN 15% AND 75%
- [ ] Expected coverage pct is consistent with equipment_applications column coverage
- [ ] All product_sku values in kg_product_equipment exist in elimfilters_catalog.sku
- [ ] No duplicate (product_sku, model_id) pairs (UNIQUE constraint enforces this)

### E. Consistency Checks
- [ ] Zero orphan kg_product_equipment rows (product_sku not in elimfilters_catalog)
- [ ] Zero orphan kg_equipment_models rows (make_id not in kg_equipment_makes)
- [ ] Zero duplicate slugs within same make_id (covered by UNIQUE constraint, verify via query)
- [ ] elimfilters_catalog row count unchanged at ~4,622 (Phase 2 must not modify source)

### F. Row Count Summary
Pass criteria (all four conditions):
```
kg_equipment_makes:     20 ≤ count ≤ 120
kg_equipment_models:   100 ≤ count ≤ 2,500
kg_product_equipment:  500 ≤ count ≤ 8,000
elimfilters_catalog: count unchanged from pre-Phase 2 baseline
```

---

## 2. SQL VALIDATION QUERIES WITH EXPECTED RANGES

### Section A: Schema Integrity

```sql
-- A1: All Phase 2 tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
ORDER BY tablename;
-- Expected: 3 rows

-- A2: Indexes created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
ORDER BY tablename, indexname;
-- Expected: minimum 6 rows (at least 2 per table)

-- A3: UNIQUE constraints and FK constraints
SELECT
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
GROUP BY tc.table_name, tc.constraint_type, tc.constraint_name
ORDER BY tc.table_name, tc.constraint_type;
-- Expected: PK on each table, UNIQUE on makes.slug, UNIQUE on (models.make_id, models.slug),
--           UNIQUE on (pe.product_sku, pe.model_id), FK on models.make_id, FK on pe.model_id

-- A4: Triggers active
SELECT tgname, tgrelid::regclass AS table_name, tgenabled
FROM pg_trigger
WHERE tgname IN ('trg_kg_equipment_makes_updated_at', 'trg_kg_equipment_models_updated_at');
-- Expected: 2 rows, tgenabled = 'O' (enabled on origin)
```

### Section B: Make Data Integrity

```sql
-- B1: Make count (must be within range)
SELECT COUNT(*) AS make_count FROM kg_equipment_makes;
-- Expected: BETWEEN 20 AND 120
-- If 0: make extraction script failed — re-run 002_extract_makes.sql
-- If >120: normalization table may have missed merge candidates — review unmatched makes

-- B2: Slug format validation
SELECT slug,
  CASE
    WHEN slug ~ '^[a-z][a-z0-9-]*$' THEN 'VALID'
    ELSE 'INVALID FORMAT'
  END AS slug_check
FROM kg_equipment_makes
WHERE slug !~ '^[a-z][a-z0-9-]*$';
-- Expected: 0 rows (all slugs valid)

-- B3: Duplicate slug detection
SELECT slug, COUNT(*) AS occurrences
FROM kg_equipment_makes
GROUP BY slug
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- B4: NULL field check
SELECT
  COUNT(*) FILTER (WHERE slug IS NULL)         AS null_slugs,
  COUNT(*) FILTER (WHERE display_name IS NULL) AS null_display_names
FROM kg_equipment_makes;
-- Expected: null_slugs = 0, null_display_names = 0

-- B5: Sample of unmatched makes (manual review candidates)
SELECT id, slug, display_name, country_of_origin, industry_type, notes
FROM kg_equipment_makes
WHERE notes LIKE '%UNMATCHED%' OR notes LIKE '%requires review%'
ORDER BY display_name;
-- No hard pass/fail — informational. Ideally 0 rows; <10 is acceptable.
```

### Section C: Model Data Integrity

```sql
-- C1: Model count (must be within range)
SELECT COUNT(*) AS model_count FROM kg_equipment_models;
-- Expected: BETWEEN 100 AND 2,500
-- If <100: extraction may have failed or coverage is very low
-- If >2,500: normalization may be under-deduplicating (same model, different string)

-- C2: Orphan models (make_id not in kg_equipment_makes)
SELECT COUNT(*) AS orphan_models
FROM kg_equipment_models em
LEFT JOIN kg_equipment_makes mk ON mk.id = em.make_id
WHERE mk.id IS NULL;
-- Expected: 0

-- C3: Year range validity
SELECT COUNT(*) AS invalid_year_from
FROM kg_equipment_models
WHERE year_from IS NOT NULL AND (year_from < 1950 OR year_from > 2030);
-- Expected: 0

SELECT COUNT(*) AS invalid_year_to
FROM kg_equipment_models
WHERE year_to IS NOT NULL AND (year_to < 1950 OR year_to > 2030);
-- Expected: 0

SELECT COUNT(*) AS year_inversion
FROM kg_equipment_models
WHERE year_from IS NOT NULL AND year_to IS NOT NULL AND year_from > year_to;
-- Expected: 0

-- C4: Models per make (distribution check)
SELECT
  mk.slug AS make_slug,
  mk.display_name,
  COUNT(em.id) AS model_count
FROM kg_equipment_makes mk
LEFT JOIN kg_equipment_models em ON em.make_id = mk.id
GROUP BY mk.id, mk.slug, mk.display_name
ORDER BY model_count DESC;
-- Expected: cummins, caterpillar, john-deere at top with 50+ models each
-- Any make with >200 models warrants investigation (possible deduplication failure)

-- C5: Duplicate slug detection within same make
SELECT make_id, slug, COUNT(*) AS occurrences
FROM kg_equipment_models
GROUP BY make_id, slug
HAVING COUNT(*) > 1;
-- Expected: 0 rows (UNIQUE constraint prevents this, but verify)

-- C6: Flagged models count (informational)
SELECT COUNT(*) AS flagged_models
FROM kg_equipment_models
WHERE notes IS NOT NULL;
-- Informational only. Expected: <100. More than 200 suggests systematic extraction issue.
```

### Section D: Product Coverage

```sql
-- D1: kg_product_equipment row count
SELECT COUNT(*) AS total_product_equipment_rows FROM kg_product_equipment;
-- Expected: BETWEEN 500 AND 8,000

-- D2: Products with at least one equipment link
SELECT
  COUNT(DISTINCT product_sku) AS products_linked,
  (SELECT COUNT(*) FROM elimfilters_catalog) AS total_catalog,
  ROUND(100.0 * COUNT(DISTINCT product_sku) /
    (SELECT COUNT(*) FROM elimfilters_catalog), 1) AS coverage_pct
FROM kg_product_equipment;
-- Expected: coverage_pct BETWEEN 15.0 AND 75.0
-- If <15%: extraction may have failed or equipment scraper very incomplete
-- If >75%: unexpectedly high — verify no phantom products inserted

-- D3: Orphan product_equipment rows (sku not in catalog)
SELECT COUNT(*) AS orphan_product_equipment
FROM kg_product_equipment pe
LEFT JOIN elimfilters_catalog ec ON ec.sku = pe.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0

-- D4: Products with equipment data in JSONB but NOT in kg_product_equipment
-- (indicates extraction gap)
SELECT COUNT(*) AS products_with_jsonb_but_not_linked
FROM elimfilters_catalog
WHERE equipment_applications IS NOT NULL
  AND jsonb_array_length(equipment_applications) > 0
  AND sku NOT IN (SELECT DISTINCT product_sku FROM kg_product_equipment);
-- Expected: BETWEEN 0 AND 500 (some gap is acceptable due to unresolvable makes/models)
-- If >500: investigate whether normalization table is missing common makes

-- D5: Products per model (distribution)
SELECT
  mk.slug AS make_slug,
  em.display_name AS model_name,
  COUNT(pe.product_sku) AS product_count
FROM kg_product_equipment pe
JOIN kg_equipment_models em ON em.id = pe.model_id
JOIN kg_equipment_makes mk ON mk.id = em.make_id
GROUP BY mk.slug, em.display_name
ORDER BY product_count DESC
LIMIT 20;
-- Expected: high-volume models (ISX 15.0L, CAT C15, etc.) at top with 50–300 products each
```

### Section E: Consistency Checks

```sql
-- E1: elimfilters_catalog must not be modified
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: same value as pre-Phase 2 baseline (~4622)
-- CRITICAL: if this changes, Phase 2 has a serious bug — roll back immediately

-- E2: Duplicate (product_sku, model_id) pairs (UNIQUE constraint handles, but verify)
SELECT product_sku, model_id, COUNT(*) AS dupes
FROM kg_product_equipment
GROUP BY product_sku, model_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- E3: Models with no product links (informational — valid for less-common makes)
SELECT em.id, mk.slug AS make_slug, em.slug AS model_slug, em.display_name
FROM kg_equipment_models em
JOIN kg_equipment_makes mk ON mk.id = em.make_id
LEFT JOIN kg_product_equipment pe ON pe.model_id = em.id
WHERE pe.model_id IS NULL;
-- Informational. Some models may exist with no current product links
-- (e.g., model extracted from JSONB but product<->model link failed to resolve)
-- Expected: <50 rows ideally; >200 rows suggests link population gap

-- E4: Makes with no models (should not exist)
SELECT mk.slug, mk.display_name
FROM kg_equipment_makes mk
LEFT JOIN kg_equipment_models em ON em.make_id = mk.id
WHERE em.make_id IS NULL;
-- Expected: 0 rows (every make should have at least one model)
-- If rows exist: make was inserted but model extraction failed for those makes
```

### Section F: Row Count Summary

```sql
SELECT 'kg_equipment_makes'    AS table_name, COUNT(*) AS row_count FROM kg_equipment_makes
UNION ALL
SELECT 'kg_equipment_models',                 COUNT(*) FROM kg_equipment_models
UNION ALL
SELECT 'kg_product_equipment',                COUNT(*) FROM kg_product_equipment
UNION ALL
SELECT 'elimfilters_catalog (source)',         COUNT(*) FROM elimfilters_catalog;

-- Phase 2 COMPLETE if:
--   kg_equipment_makes:     20 ≤ count ≤ 120
--   kg_equipment_models:   100 ≤ count ≤ 2,500
--   kg_product_equipment:  500 ≤ count ≤ 8,000
--   elimfilters_catalog: unchanged from baseline (~4622)
```

---

## 3. ROLLBACK STRATEGY

### 3.1 Full Rollback

Drops all Phase 2 tables in dependency order (child first, then parent):

```sql
-- Full Phase 2 rollback — see rollback.sql
-- DROP in order: product_equipment → models → makes (FK dependency order)
DROP TABLE IF EXISTS kg_product_equipment;
DROP TABLE IF EXISTS kg_equipment_models;
DROP TABLE IF EXISTS kg_equipment_makes;
```

**Safe to run:** YES — no cascade to Phase 1 tables (Phase 2 tables are not referenced by Phase 1).
**Effect on catalog:** NONE — `elimfilters_catalog` is never modified by Phase 2.
**After rollback:** Phase 1 tables remain intact. Re-run Phase 2 scripts from step 1.

### 3.2 Partial Rollback Options

**Option A: Clear product links only (re-extract without dropping schema)**
```sql
-- Remove all product-equipment links but keep makes and models
TRUNCATE TABLE kg_product_equipment;
-- Then re-run: psql $DATABASE_URL -f migrations/kg-phase2/004_populate_product_equipment.sql
```
Use case: product links are incomplete or wrong, but makes/models are correct.

**Option B: Clear models and product links (keep makes)**
```sql
-- Remove models and links (FK cascade will clear kg_product_equipment)
TRUNCATE TABLE kg_product_equipment;
TRUNCATE TABLE kg_equipment_models RESTART IDENTITY CASCADE;
-- Then re-run: scripts 003 and 004
```
Use case: model slug generation strategy changed; keeps make reference data.

**Option C: Clear everything and re-extract**
```sql
-- Full TRUNCATE (faster than DROP if schema is correct)
TRUNCATE TABLE kg_product_equipment;
TRUNCATE TABLE kg_equipment_models RESTART IDENTITY CASCADE;
TRUNCATE TABLE kg_equipment_makes RESTART IDENTITY CASCADE;
-- Then re-run: scripts 002, 003, 004
```
Use case: normalization table changed significantly; total re-extraction needed.

### 3.3 Post-Rollback Verification

After any rollback:
```sql
-- Verify Phase 2 tables are gone (or empty if only truncated)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment');

-- Verify catalog is untouched
SELECT COUNT(*) FROM elimfilters_catalog;  -- Must still be ~4622

-- Verify Phase 1 tables are intact
SELECT COUNT(*) FROM kg_systems;      -- Must be 6
SELECT COUNT(*) FROM kg_technologies; -- Must be 13
```

---

## 4. KNOWN DATA QUALITY LIMITATIONS

These limitations are documented and accepted — they do not constitute Phase 2 failures:

1. **~1,500–2,000 products have no equipment data** — scraper is still running.
   After scraper completes, re-run 002–004 to pick up new equipment records.

2. **Multi-word make split failures** — Some `equipment` field values with unusual
   formats may produce wrong make/model splits. These are flagged in `notes` and
   require manual review after Phase 2.

3. **Model name deduplication** — Same physical model appearing as two slugs
   (e.g., `isx-15` and `isx-15-0l`) is expected in initial extraction.
   Merging is a post-Phase 2 manual task, not a Phase 2 requirement.

4. **Format 4 plain strings** — These produce lower-confidence extractions.
   Expected count: <100 products. Flagged in notes for manual review.
