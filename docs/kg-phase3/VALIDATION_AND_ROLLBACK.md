# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 3: Cross-Reference Normalization
# Validation Checklist + Rollback Strategy

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## 1. VALIDATION CHECKLIST

Run `validate.sql` after all Phase 3 scripts (001–003) complete. All checks must pass.

### A. Schema Integrity
- [ ] `kg_crossrefs` table exists with all 7 columns
- [ ] UNIQUE constraint present on `(product_sku, ref_type, brand, part_number)`
- [ ] CHECK constraint present on `ref_type` (values: oem, competitor, brand, aftermarket)
- [ ] All 4 indexes created
- [ ] No trigger required (no updated_at column)

### B. OEM Cross-References
- [ ] `ref_type = 'oem'` row count: BETWEEN 3,000 AND 50,000
- [ ] No NULL or empty brands in oem rows
- [ ] No NULL or empty part_numbers in oem rows

### C. Competitor/Brand Cross-References
- [ ] `ref_type = 'competitor'` row count: BETWEEN 1,000 AND 30,000
- [ ] `ref_type = 'brand'` row count: BETWEEN 0 AND 10,000 (0 is valid if brand_crossrefs sparsely populated)
- [ ] All competitor brands are in known COMPETITOR_BRANDS set or match filter pattern

### D. Part Number Format
- [ ] No part numbers with leading or trailing spaces (TRIM enforced)
- [ ] All part numbers are UPPERCASE
- [ ] No part numbers < 2 characters
- [ ] Part number count with length > 80 is < 10 (flag for investigation if higher)

### E. Orphan Check
- [ ] Zero orphan rows (product_sku values not in elimfilters_catalog.sku)
- [ ] elimfilters_catalog row count unchanged (~4622)

### F. Summary Counts
Pass criteria:
```
kg_crossrefs total:           5,000 ≤ count ≤ 100,000
ref_type = 'oem':             3,000 ≤ count ≤ 50,000
ref_type = 'competitor':      1,000 ≤ count ≤ 30,000
ref_type = 'brand':               0 ≤ count ≤ 10,000
elimfilters_catalog: unchanged from pre-Phase 3 baseline
```

---

## 2. SQL VALIDATION QUERIES

### Section A: Schema Integrity

```sql
-- A1: Table exists
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs';
-- Expected: 1 row

-- A2: Indexes created
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs'
ORDER BY indexname;
-- Expected: minimum 4 indexes including the UNIQUE constraint index

-- A3: Constraints
SELECT
  tc.constraint_type,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'kg_crossrefs'
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY', 'CHECK')
GROUP BY tc.constraint_type, tc.constraint_name
ORDER BY tc.constraint_type;
-- Expected: PK(id), UNIQUE(product_sku, ref_type, brand, part_number), CHECK(ref_type)
```

### Section B: OEM Cross-References

```sql
-- B1: OEM count (PASS range: 3,000–50,000)
SELECT COUNT(*) AS oem_count
FROM kg_crossrefs
WHERE ref_type = 'oem';
-- Expected: BETWEEN 3,000 AND 50,000

-- B2: NULL/empty check for OEM rows
SELECT
  COUNT(*) FILTER (WHERE brand IS NULL OR brand = '')       AS null_empty_brands,
  COUNT(*) FILTER (WHERE part_number IS NULL OR part_number = '') AS null_empty_parts
FROM kg_crossrefs
WHERE ref_type = 'oem';
-- Expected: 0, 0

-- B3: Top OEM brands (distribution — informational)
SELECT brand, COUNT(*) AS ref_count
FROM kg_crossrefs
WHERE ref_type = 'oem'
GROUP BY brand
ORDER BY ref_count DESC
LIMIT 20;
-- Expected: CUMMINS, CATERPILLAR, JOHN DEERE, VOLVO, KOMATSU near top

-- B4: Sample OEM entries
SELECT product_sku, brand, part_number, ref_type, notes
FROM kg_crossrefs
WHERE ref_type = 'oem'
ORDER BY created_at DESC
LIMIT 10;
```

### Section C: Competitor/Brand Cross-References

```sql
-- C1: Competitor count (PASS range: 1,000–30,000)
SELECT COUNT(*) AS competitor_count
FROM kg_crossrefs
WHERE ref_type = 'competitor';
-- Expected: BETWEEN 1,000 AND 30,000

-- C2: Brand count (PASS range: 0–10,000)
SELECT COUNT(*) AS brand_count
FROM kg_crossrefs
WHERE ref_type = 'brand';
-- Expected: BETWEEN 0 AND 10,000
-- 0 is valid if brand_crossrefs column is sparsely populated in the catalog

-- C3: Top competitor brands
SELECT brand, COUNT(*) AS ref_count
FROM kg_crossrefs
WHERE ref_type = 'competitor'
GROUP BY brand
ORDER BY ref_count DESC
LIMIT 20;
-- Expected: DONALDSON, BALDWIN, FLEETGUARD, MANN, WIX near top

-- C4: Unexpected brands in competitor refs (brands NOT in COMPETITOR_BRANDS set)
-- These would indicate a classification error
SELECT DISTINCT brand
FROM kg_crossrefs
WHERE ref_type = 'competitor'
  AND brand NOT IN (
    'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL','WIX','FRAM',
    'PUROLATOR','NAPA','AC DELCO','BOSCH','MAHLE','HENGST','SAKURA',
    'HASTINGS','LUBER-FINER','PARKER','PALL','HYDAC','MP FILTRI','UFI',
    'CHAMPION','COOPERS FILTERS','MOTORCRAFT','KNECHT','SOGEFI','FILTRON',
    'SOFIMA','FIAAM','NIPPARTS','STARLINE','CHAMPION LABS','CARQUEST',
    'PRONTO','EUROPART','DINEX','TRUCKTEC','FEBI','SWAG','MEYLE','VALEO',
    'ELOFIC','WABCO','KNORR','ALLISON','ZF'
  )
  AND brand NOT LIKE '%FILTER%'
  AND brand NOT LIKE '%FILTR%'
  AND brand NOT LIKE '%FILTRO%'
ORDER BY brand;
-- Expected: 0 rows (all competitor brands should match COMPETITOR_BRANDS set or filter pattern)
-- If rows appear: classification logic may need updating
```

### Section D: Part Number Format Check

```sql
-- D1: Part numbers with leading/trailing spaces (should be 0 after TRIM)
SELECT COUNT(*) AS parts_with_spaces
FROM kg_crossrefs
WHERE part_number != TRIM(part_number);
-- Expected: 0

-- D2: Lowercase part numbers (should be 0 after UPPER)
SELECT COUNT(*) AS lowercase_parts
FROM kg_crossrefs
WHERE part_number != UPPER(part_number);
-- Expected: 0

-- D3: Very short part numbers (< 2 chars, should be filtered out)
SELECT product_sku, brand, part_number, ref_type
FROM kg_crossrefs
WHERE LENGTH(part_number) < 2;
-- Expected: 0 rows

-- D4: Suspiciously long part numbers (>80 chars, possible corruption)
SELECT COUNT(*) AS long_part_numbers
FROM kg_crossrefs
WHERE LENGTH(part_number) > 80;
-- Expected: 0 rows ideally; <10 is acceptable (flagged in notes)

-- D5: Part number format sample by brand (spot check)
SELECT brand, part_number
FROM kg_crossrefs
WHERE brand IN ('CUMMINS', 'DONALDSON', 'MANN', 'JOHN DEERE')
ORDER BY brand, part_number
LIMIT 20;
-- Expected: uppercase, trimmed, reasonable lengths (4–20 chars for most brands)
```

### Section E: Orphan Check

```sql
-- E1: Orphan cross-references (product_sku not in catalog)
SELECT COUNT(*) AS orphan_crossrefs
FROM kg_crossrefs cr
LEFT JOIN elimfilters_catalog ec ON ec.sku = cr.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0

-- E2: CRITICAL — catalog must not be modified
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: ~4622 (same as pre-Phase 3 baseline)
-- CRITICAL: if this changes, Phase 3 has a bug — rollback immediately

-- E3: Duplicate crossrefs (UNIQUE constraint prevents, but verify)
SELECT product_sku, ref_type, brand, part_number, COUNT(*) AS dupes
FROM kg_crossrefs
GROUP BY product_sku, ref_type, brand, part_number
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- E4: Products with cross-reference data in catalog but not linked in KG
-- Indicates extraction gap (acceptable for empty/null JSONB, not for populated JSONB)
SELECT COUNT(*) AS products_with_oem_but_not_linked
FROM elimfilters_catalog
WHERE oem_codes IS NOT NULL
  AND jsonb_array_length(oem_codes) > 0
  AND sku NOT IN (SELECT DISTINCT product_sku FROM kg_crossrefs WHERE ref_type = 'oem');
-- Expected: BETWEEN 0 AND 300 (some gap is acceptable for malformed JSONB)
-- If >500: investigate oem_codes parsing
```

### Section F: Summary Counts by ref_type

```sql
SELECT
  ref_type,
  COUNT(*) AS crossref_count,
  COUNT(DISTINCT product_sku) AS products_covered
FROM kg_crossrefs
GROUP BY ref_type
ORDER BY crossref_count DESC;
-- Expected (approximate):
--   ref_type='oem':        3,000–50,000 rows, 2,500–3,500 products
--   ref_type='competitor': 1,000–30,000 rows, 1,500–2,800 products
--   ref_type='brand':          0–10,000 rows, 0–920 products

SELECT 'kg_crossrefs total'        AS metric, COUNT(*)                       AS value FROM kg_crossrefs
UNION ALL
SELECT 'distinct products covered', COUNT(DISTINCT product_sku)              FROM kg_crossrefs
UNION ALL
SELECT 'distinct brands',           COUNT(DISTINCT brand)                    FROM kg_crossrefs
UNION ALL
SELECT 'elimfilters_catalog (source, must be unchanged)', COUNT(*)           FROM elimfilters_catalog;

-- Phase 3 COMPLETE if:
--   kg_crossrefs total:    5,000 ≤ count ≤ 100,000
--   ref_type='oem':        3,000 ≤ count ≤ 50,000
--   ref_type='competitor': 1,000 ≤ count ≤ 30,000
--   elimfilters_catalog:   unchanged from baseline (~4622)
```

---

## 3. ROLLBACK STRATEGY

### 3.1 Full Rollback

`kg_crossrefs` has no FK dependencies from any other Phase table. It can be dropped
at any time without affecting Phase 1 or Phase 2 tables.

```sql
-- Full Phase 3 rollback
DROP TABLE IF EXISTS kg_crossrefs;
-- Expected: table dropped, no cascade effects

-- Verify
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'kg_crossrefs';
-- Expected: 0

-- Verify Phase 1/2 tables intact
SELECT COUNT(*) FROM kg_systems;          -- Expected: 6
SELECT COUNT(*) FROM kg_technologies;     -- Expected: 13
SELECT COUNT(*) FROM elimfilters_catalog; -- Expected: ~4622
```

See `rollback.sql` for full script with all verification queries.

### 3.2 Partial Rollback by ref_type

If only one source of cross-references has an issue:

```sql
-- Remove only OEM cross-references (from oem_codes JSONB), keep competitor/brand
DELETE FROM kg_crossrefs WHERE ref_type = 'oem';
-- Then re-run: migrations/kg-phase3/002_populate_oem_crossrefs.sql

-- Remove only competitor cross-references (from competitor_codes), keep oem/brand
DELETE FROM kg_crossrefs WHERE ref_type = 'competitor';
-- Then re-run: migrations/kg-phase3/003_populate_competitor_crossrefs.sql

-- Remove only brand cross-references (from brand_crossrefs JSONB), keep oem/competitor
DELETE FROM kg_crossrefs WHERE ref_type = 'brand';
-- Then re-run: migrations/kg-phase3/003_populate_competitor_crossrefs.sql (handles both)
```

### 3.3 Full Truncate (Keep Schema)

```sql
-- Remove all data, keep table structure for fresh re-extraction
TRUNCATE TABLE kg_crossrefs RESTART IDENTITY;
-- Then re-run: scripts 002 and 003
```

---

## 4. KNOWN LIMITATIONS

1. **Post-consolidation mixing:** `oem_codes` contains filter brands after the Stage 2
   consolidation migration. Phase 3 handles this via COMPETITOR_BRANDS classification —
   the same approach as server.js `buildFilterData()`. The result should match the API output.

2. **Sparse competitor_codes:** Many products have `competitor_codes = []` because the
   `recover-competitor-codes.js` script was not run for all products. Expected gap:
   ~40–60% of products have competitor data. This is not a Phase 3 bug.

3. **Sparse brand_crossrefs:** The `add-cross-ref.js` script was partially run.
   `ref_type = 'brand'` count may be low (potentially 0). This is not a Phase 3 bug.

4. **No deduplication between oem_codes and brand_crossrefs:** The same cross-reference
   may appear in both oem_codes (as an object) and brand_crossrefs (as a brand key→array).
   The UNIQUE constraint prevents duplicate rows — the second insert is silently skipped.
