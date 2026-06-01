# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 3: Cross-Reference Normalization
# Execution Guide

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Depends on:** Phase 1 COMPLETE
**Phase 2 dependency:** NONE — Phase 3 is independent of Phase 2
**Estimated execution time:** 10–20 minutes

---

## 1. DEPENDENCIES

### Phase 1 Required (Not Phase 2)

Phase 3 only needs `elimfilters_catalog` to exist and be populated. It does not
reference any Phase 2 tables. On Render Shell, Phase 3 can be run immediately
after Phase 1 completes, in parallel with Phase 2 if needed.

**Pre-flight check:**
```sql
-- Must return ~4622 before Phase 3 starts
SELECT COUNT(*) FROM elimfilters_catalog;

-- Sanity check: JSONB columns accessible
SELECT COUNT(*) FROM elimfilters_catalog
WHERE oem_codes IS NOT NULL
  AND jsonb_array_length(oem_codes) > 0;
-- Expected: 70–80% of catalog (~3,000–3,700 products)
```

### Phase 3 Is Independent of Phase 2

Phase 3 reads from `oem_codes`, `competitor_codes`, `brand_crossrefs` JSONB columns.
These columns have no relationship to the `equipment_applications` column used in Phase 2.
The two phases touch completely different data sources and can be executed in any order.

---

## 2. IMPLEMENTATION SEQUENCE

```
┌──────────────────────────────────────────────────────────────┐
│ PRE-EXECUTION VERIFICATION                                   │
│   Run: pre-execution queries below                          │
│   Confirm: Phase 1 complete, oem_codes format distribution  │
│   SECURITY CHECK: grep for prohibited field names in SQL    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: 001_schema.sql                                       │
│   Creates: kg_crossrefs                                      │
│   + All indexes + CHECK constraint                          │
│   Idempotent: yes                                           │
│   Time: ~2 seconds                                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: 002_populate_oem_crossrefs.sql                      │
│   Reads: elimfilters_catalog.oem_codes JSONB               │
│   Handles: all 4 format variants (A, B, C, D)              │
│   Classifies: oem vs competitor using COMPETITOR_BRANDS     │
│   Inserts: kg_crossrefs with ref_type='oem' or 'competitor' │
│   Idempotent: yes (ON CONFLICT DO NOTHING)                  │
│   SECURITY: does NOT read codigo_base, BASE, MATCHED BY     │
│   Time: ~5–10 seconds                                       │
│   DIAGNOSTIC: count inserted, skipped, NULL, ref_type split │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: 003_populate_competitor_crossrefs.sql               │
│   Reads: competitor_codes JSONB + brand_crossrefs JSONB    │
│   competitor_codes → ref_type='competitor'                  │
│   brand_crossrefs → ref_type='brand'                       │
│   Idempotent: yes (ON CONFLICT DO NOTHING)                  │
│   SECURITY: does NOT read codigo_base, BASE, MATCHED BY     │
│   Time: ~3–8 seconds                                        │
│   DIAGNOSTIC: count by source and ref_type                  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ VALIDATION: validate.sql                                     │
│   Sections: A (schema) B (oem) C (competitor/brand)         │
│             D (part number format) E (orphans) F (summary)  │
│   Time: ~3–5 seconds                                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                      Phase 3 COMPLETE ✅
```

---

## 3. PRE-EXECUTION VERIFICATION QUERIES

Run on Render Shell before executing Phase 3 SQL:

```sql
-- V1: JSONB data availability — oem_codes
SELECT
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE oem_codes IS NOT NULL
    AND jsonb_array_length(oem_codes) > 0) AS with_oem_codes,
  COUNT(*) FILTER (WHERE competitor_codes IS NOT NULL
    AND jsonb_array_length(competitor_codes) > 0) AS with_competitor_codes,
  COUNT(*) FILTER (WHERE brand_crossrefs IS NOT NULL
    AND brand_crossrefs != '{}'::jsonb
    AND brand_crossrefs != 'null'::jsonb) AS with_brand_crossrefs
FROM elimfilters_catalog;
-- Expected:
--   with_oem_codes:        70–80% of total (~3,200–3,700)
--   with_competitor_codes: 40–60% of total (~1,800–2,800)
--   with_brand_crossrefs:  10–20% of total (~450–920)

-- V2: Format distribution for oem_codes
SELECT
  CASE
    WHEN oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0
      THEN 'null_or_empty'
    WHEN jsonb_typeof(oem_codes->0) = 'string'
      THEN 'format_C_strings'
    WHEN (oem_codes->0)->>'manufacturer' IS NOT NULL
      THEN 'format_A_or_B_or_D_objects'
    ELSE 'unknown'
  END AS format_type,
  COUNT(*) AS product_count
FROM elimfilters_catalog
GROUP BY 1
ORDER BY 2 DESC;
-- Expected: format_A_or_B_or_D_objects dominant; format_C_strings rare (<50 products)

-- V3: Sample mixed (post-consolidation) oem_codes to verify Format D presence
SELECT sku, oem_codes
FROM elimfilters_catalog
WHERE oem_codes IS NOT NULL
  AND jsonb_array_length(oem_codes) > 3  -- products with many cross-refs
  AND oem_codes::text LIKE '%DONALDSON%'  -- filter brands in oem_codes
LIMIT 5;
-- Expected: some products have DONALDSON, FLEETGUARD in oem_codes (Format D)

-- V4: Sample competitor_codes
SELECT sku, competitor_codes
FROM elimfilters_catalog
WHERE competitor_codes IS NOT NULL
  AND jsonb_array_length(competitor_codes) > 0
LIMIT 5;
-- Expected: objects with manufacturer/code fields (Formats A or B)

-- V5: Sample brand_crossrefs
SELECT sku, brand_crossrefs
FROM elimfilters_catalog
WHERE brand_crossrefs IS NOT NULL
  AND brand_crossrefs != '{}'::jsonb
LIMIT 5;
-- Expected: object with brand keys mapping to arrays of part numbers

-- V6: Verify Phase 3 table does NOT already exist (should return 0)
SELECT COUNT(*) AS phase3_tables_exist
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs';
-- Expected: 0

-- V7: SECURITY — verify no accidental reference to prohibited fields
-- Run on Render Shell or locally:
-- grep -i 'codigo_base\|"BASE"\|MATCHED.BY' migrations/kg-phase3/*.sql
-- Expected: 0 matches
```

---

## 4. JSONB PARSING APPROACH PER FORMAT

### Format A (Standard Object) — Most Common

```sql
-- oem_codes and competitor_codes — standard scraper output
SELECT
  ec.sku AS product_sku,
  UPPER(TRIM(elem->>'manufacturer')) AS brand_raw,
  UPPER(TRIM(COALESCE(elem->>'code', elem->>'partNumber'))) AS part_number_raw
FROM elimfilters_catalog ec,
     jsonb_array_elements(ec.oem_codes) AS elem
WHERE jsonb_typeof(elem) = 'object'
  AND elem->>'manufacturer' IS NOT NULL
  AND (elem->>'code' IS NOT NULL OR elem->>'partNumber' IS NOT NULL)
```

### Format B (partNumber alias) — Legacy Scraper Variant

Handled by same query as Format A via `COALESCE(elem->>'code', elem->>'partNumber')`.
Both `code` and `partNumber` contain identical values in Format B — prefer `code`.

### Format C (Pipe-Separated String) — Rare Legacy

```sql
-- Detect and parse pipe-separated string elements
SELECT
  ec.sku AS product_sku,
  UPPER(TRIM(SPLIT_PART(elem #>> '{}', ' | ', 1))) AS brand_raw,
  UPPER(TRIM(
    -- Join remaining parts in case part number itself contains ' | '
    ARRAY_TO_STRING(
      ARRAY(
        SELECT SPLIT_PART(elem #>> '{}', ' | ', s)
        FROM generate_series(2, ARRAY_LENGTH(STRING_TO_ARRAY(elem #>> '{}', ' | '), 1)) AS s
      ), ' | '
    )
  )) AS part_number_raw
FROM elimfilters_catalog ec,
     jsonb_array_elements(ec.oem_codes) AS elem
WHERE jsonb_typeof(elem) = 'string'
  AND elem #>> '{}' LIKE '% | %'  -- only pipe-separated strings
```

### Format D (Mixed Filter Brands in oem_codes) — Post-Consolidation

Same extraction as Format A, but classification uses COMPETITOR_BRANDS set:

```sql
-- After extracting brand from oem_codes:
CASE
  WHEN brand_normalized IN (
    'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL',
    'WIX','FRAM','PUROLATOR','NAPA','AC DELCO','BOSCH','MAHLE','HENGST',
    -- ... full list in 002_populate_oem_crossrefs.sql
  )
  OR brand_normalized LIKE '%FILTER%'
  OR brand_normalized LIKE '%FILTR%'
  OR brand_normalized LIKE '%FILTRO%'
  THEN 'competitor'
  ELSE 'oem'
END AS ref_type
```

### brand_crossrefs Object Format

```sql
-- Different structure: object with brand keys → array of part numbers
SELECT
  ec.sku AS product_sku,
  UPPER(TRIM(kv.key)) AS brand_raw,
  UPPER(TRIM(part_val #>> '{}')) AS part_number_raw,
  'brand' AS ref_type
FROM elimfilters_catalog ec,
     jsonb_each(ec.brand_crossrefs) AS kv,
     jsonb_array_elements(kv.value) AS part_val
WHERE ec.brand_crossrefs IS NOT NULL
  AND ec.brand_crossrefs != '{}'::jsonb
  AND ec.brand_crossrefs != 'null'::jsonb
  AND jsonb_typeof(kv.value) = 'array'  -- value should be array of part numbers
  AND part_val #>> '{}' IS NOT NULL
  AND TRIM(part_val #>> '{}') != ''
```

---

## 5. PART NUMBER NORMALIZATION FUNCTION DESIGN

Part numbers are normalized at extraction time in the SQL (no stored function needed):

```sql
-- Part number cleaning expression (applied in SELECT):
UPPER(
  TRIM(
    REPLACE(
      COALESCE(elem->>'code', elem->>'partNumber', ''),
      '"', ''   -- remove stray quote characters
    )
  )
) AS part_number_cleaned
```

**Validation in WHERE clause:**
```sql
WHERE LENGTH(TRIM(REPLACE(part_raw, '"', ''))) >= 2  -- minimum 2 chars after clean
  AND TRIM(REPLACE(part_raw, '"', '')) != ''           -- not blank after clean
```

**Notes flag for long part numbers:**
```sql
CASE
  WHEN LENGTH(part_number_cleaned) > 80
    THEN 'part_number length >80 — possible data corruption'
  ELSE NULL
END AS notes
```

---

## 6. EXPECTED ROW COUNTS

Based on CATALOG_COMPLETENESS_REPORT.md coverage estimates:

| Source | Products with data | Avg refs per product | Expected rows |
|--------|-------------------|---------------------|---------------|
| oem_codes (OEM refs) | ~70–80% of 4,622 | ~3–8 | ~10,000–30,000 |
| oem_codes (filter brands mixed in) | subset of above | ~1–3 | ~2,000–5,000 |
| competitor_codes | ~40–60% of 4,622 | ~3–8 | ~5,000–20,000 |
| brand_crossrefs | ~10–20% of 4,622 | ~2–5 | ~1,000–5,000 |
| **Total (after deduplication)** | | | **15,000–50,000** |

**Deduplication note:** The UNIQUE constraint on `(product_sku, ref_type, brand, part_number)`
will eliminate overlaps between oem_codes and competitor_codes for the same cross-reference.
Actual row count will be 10–20% below the sum of individual source counts.

**Validation thresholds** (fail Phase 3 if outside these ranges):
- Total kg_crossrefs row count: must be BETWEEN 5,000 AND 100,000
- `ref_type = 'oem'` count: must be BETWEEN 3,000 AND 50,000
- `ref_type = 'competitor'` count: must be BETWEEN 1,000 AND 30,000

---

## 7. EXECUTION ON RENDER SHELL

```bash
# 1. SECURITY CHECK before execution (must return 0 matches)
grep -i 'codigo_base\|"BASE"\|MATCHED.BY' migrations/kg-phase3/*.sql
# Expected: no output (0 matches)

# 2. Run Phase 3 scripts in order
psql $DATABASE_URL -f migrations/kg-phase3/001_schema.sql
psql $DATABASE_URL -f migrations/kg-phase3/002_populate_oem_crossrefs.sql
psql $DATABASE_URL -f migrations/kg-phase3/003_populate_competitor_crossrefs.sql

# 3. Run validation
psql $DATABASE_URL -f migrations/kg-phase3/validate.sql

# 4. If validation fails:
#    a. Review diagnostic output from NOTICE messages
#    b. Investigate specific failure (orphan check, count out of range, etc.)
#    c. Rollback if needed: psql $DATABASE_URL -f migrations/kg-phase3/rollback.sql
#    d. Fix and re-run (all scripts are idempotent)
```

---

## 8. RELATIONSHIP TO EXISTING API

Phase 3 is ADDITIVE ONLY. The `buildFilterData()` function in server.js continues to read
from `oem_codes` and `competitor_codes` JSONB columns as before. No API changes occur in Phase 3.

The Phase 7 API migration will switch cross-reference lookups to read from `kg_crossrefs`
instead of re-parsing JSONB on every request. That is a separate, later phase.

The `kg_crossrefs` table is designed to produce exactly the same output as `buildFilterData()`
would produce — same brand classifications, same part numbers, same deduplication.
This makes the Phase 7 migration a drop-in replacement.
