# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 2: Equipment Normalization
# Execution Guide

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Depends on:** Phase 1 COMPLETE (kg_systems, kg_technologies populated)
**Estimated execution time:** 15–25 minutes

---

## 1. DEPENDENCIES

### Required Before Phase 2

Phase 2 depends on Phase 1 tables existing (for future cross-linking) but does not
directly JOIN to them in Phase 2 SQL. The dependency is architectural:
- `kg_equipment_makes.industry_type` will later link to `kg_systems.slug`
- `kg_product_equipment` will later join to `kg_product_systems` for full graph traversal

**Pre-flight check:**
```sql
-- Must return 6 before Phase 2 starts
SELECT COUNT(*) FROM kg_systems;

-- Must return 13 before Phase 2 starts
SELECT COUNT(*) FROM kg_technologies;

-- Must return ~4622 before Phase 2 starts
SELECT COUNT(*) FROM elimfilters_catalog;
```

### Phase 2 Can Run In Parallel With Phase 3

Phase 3 (cross-references) does not depend on Phase 2. Both phases can be designed
and SQL-written in parallel. On Render Shell, run Phase 2 first simply because
equipment data is more complex and benefits from early validation.

---

## 2. IMPLEMENTATION SEQUENCE

```
┌──────────────────────────────────────────────────────────────┐
│ PRE-EXECUTION VERIFICATION                                   │
│   Run: pre-execution queries below                          │
│   Confirm: Phase 1 complete, ~4622 products, JSONB formats  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: 001_schema.sql                                       │
│   Creates: kg_equipment_makes, kg_equipment_models,          │
│            kg_product_equipment                              │
│   + All indexes + Triggers                                   │
│   Idempotent: yes                                           │
│   Time: ~2–5 seconds                                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: 002_extract_makes.sql                                │
│   Reads: elimfilters_catalog.equipment_applications JSONB   │
│   Extracts: all unique manufacturer names                    │
│   Normalizes: via embedded normalization CTE                 │
│   Inserts: kg_equipment_makes (50–80 rows expected)         │
│   Idempotent: yes (ON CONFLICT DO UPDATE)                   │
│   Time: ~5–10 seconds                                       │
│   DIAGNOSTIC: prints make count + raw unmapped count        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: 003_extract_models.sql                               │
│   Reads: elimfilters_catalog.equipment_applications JSONB   │
│   Links: to kg_equipment_makes via slug lookup              │
│   Inserts: kg_equipment_models (500–1,500 rows expected)    │
│   Handles: year range parsing, engine_type extraction       │
│   Idempotent: yes (ON CONFLICT DO UPDATE year range merge)  │
│   Time: ~5–15 seconds                                       │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: 004_populate_product_equipment.sql                   │
│   Reads: elimfilters_catalog.equipment_applications JSONB   │
│   Joins: to kg_equipment_models via make+model slugs        │
│   Inserts: kg_product_equipment (2,000–5,000 rows expected) │
│   Idempotent: yes (ON CONFLICT DO NOTHING)                  │
│   Time: ~10–20 seconds                                      │
│   DIAGNOSTIC: unmapped products count, NULL equipment count │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ VALIDATION: validate.sql                                     │
│   Sections: A (schema) B (makes) C (models) D (coverage)    │
│             E (consistency) F (summary)                     │
│   Pass criteria: see VALIDATION_AND_ROLLBACK.md             │
│   Time: ~5 seconds                                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                      Phase 2 COMPLETE ✅
```

---

## 3. PRE-EXECUTION VERIFICATION QUERIES

Run these on Render Shell before executing any Phase 2 SQL:

```sql
-- V1: Phase 1 foundation exists
SELECT COUNT(*) AS system_count  FROM kg_systems;    -- Expected: 6
SELECT COUNT(*) AS tech_count    FROM kg_technologies; -- Expected: 13

-- V2: Catalog row count (should be ~4622)
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;

-- V3: Equipment data coverage — how many products have non-empty equipment_applications
SELECT
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE equipment_applications IS NOT NULL
    AND jsonb_array_length(equipment_applications) > 0) AS with_equipment,
  ROUND(100.0 * COUNT(*) FILTER (WHERE equipment_applications IS NOT NULL
    AND jsonb_array_length(equipment_applications) > 0) / COUNT(*), 1) AS coverage_pct
FROM elimfilters_catalog;
-- Expected: coverage_pct between 40% and 70%
-- If <30%, equipment scraper may have stalled. Run scraper first.

-- V4: JSONB format distribution — understand which formats are present
SELECT
  CASE
    WHEN equipment_applications IS NULL                          THEN 'null'
    WHEN jsonb_array_length(equipment_applications) = 0         THEN 'empty_array'
    WHEN jsonb_typeof(equipment_applications->0) = 'string'     THEN 'format_4_strings'
    WHEN (equipment_applications->0)->>'equipment' IS NOT NULL  THEN 'format_1_or_3_equipment'
    WHEN (equipment_applications->0)->>'model' IS NOT NULL      THEN 'format_2_model_machine'
    ELSE 'unknown'
  END AS format_type,
  COUNT(*) AS product_count
FROM elimfilters_catalog
GROUP BY 1
ORDER BY 2 DESC;
-- Expected: format_1_or_3_equipment is dominant; format_4_strings is rare

-- V5: Sample 10 products with equipment data to visually inspect
SELECT sku, equipment_applications
FROM elimfilters_catalog
WHERE equipment_applications IS NOT NULL
  AND jsonb_array_length(equipment_applications) > 0
LIMIT 10;

-- V6: Top raw make strings (first word of equipment field, UPPER+TRIM)
SELECT
  UPPER(TRIM(SPLIT_PART(elem->>'equipment', ' ', 1))) AS make_word,
  COUNT(*) AS cnt
FROM elimfilters_catalog,
  jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb)) AS elem
WHERE elem->>'equipment' IS NOT NULL
  AND jsonb_typeof(elem) = 'object'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 30;
-- Expected: CUMMINS, CATERPILLAR, JOHN, VOLVO, KOMATSU as top entries
-- Note "JOHN" should be caught by multi-word prefix matching in migration

-- V7: Verify Phase 2 tables do NOT already exist (should return 0)
SELECT COUNT(*) AS phase2_tables_exist
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment');
-- Expected: 0 (if re-running after rollback, expect 0 again)
```

---

## 4. JSONB EXTRACTION SQL APPROACH

### 4.1 Core Extraction Pattern

All three extraction scripts use the same base CTE pattern:

```sql
WITH normalized_makes AS (
  -- Embedded normalization table: raw_upper → (slug, display_name, country, industry)
  VALUES
    ('CUMMINS',      'cummins',      'Cummins Inc.',          'United States', 'construction,mining,marine,power-generation,agriculture'),
    ('CAT',          'caterpillar',  'Caterpillar Inc.',      'United States', 'construction,mining'),
    ('CATERPILLAR',  'caterpillar',  'Caterpillar Inc.',      'United States', 'construction,mining'),
    -- ... (full table in 002_extract_makes.sql)
),
equipment_elements AS (
  SELECT
    ec.sku,
    elem,
    jsonb_typeof(elem) AS elem_type,
    -- Format dispatch: extract primary name, make string, model string
    CASE
      WHEN jsonb_typeof(elem) = 'string'
        THEN UPPER(TRIM(elem #>> '{}'))          -- Format 4: plain string
      WHEN elem->>'equipment' IS NOT NULL
        THEN UPPER(TRIM(elem->>'equipment'))     -- Format 1/3: equipment field
      WHEN elem->>'model' IS NOT NULL
        THEN UPPER(TRIM(elem->>'model'))         -- Format 2: model field (no make)
      ELSE NULL
    END AS primary_name_upper,
    -- Year field (present in Format 1, absent in Format 2/3/4)
    elem->>'year' AS year_raw,
    -- Type/machine field for engine_type
    COALESCE(elem->>'type', elem->>'machine') AS engine_type_raw
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.equipment_applications, '[]'::jsonb)) AS elem
  WHERE ec.equipment_applications IS NOT NULL
    AND jsonb_array_length(ec.equipment_applications) > 0
    AND elem IS NOT NULL
)
```

### 4.2 Make Extraction from Primary Name

After extracting `primary_name_upper`, the make is identified by:

1. Try longest multi-word prefix match (in order of decreasing length):
   - `STARTS_WITH(primary_name_upper, 'JOHN DEERE')` → slug: john-deere
   - `STARTS_WITH(primary_name_upper, 'CASE IH')` → slug: case-ih
   - `STARTS_WITH(primary_name_upper, 'NEW HOLLAND')` → slug: new-holland
   - `STARTS_WITH(primary_name_upper, 'MASSEY FERGUSON')` → slug: massey-ferguson
   - `STARTS_WITH(primary_name_upper, 'MERCEDES-BENZ')` → slug: mercedes-benz
   - `STARTS_WITH(primary_name_upper, 'MERCEDES BENZ')` → slug: mercedes-benz
   - etc.

2. If no multi-word match: try `SPLIT_PART(primary_name_upper, ' ', 1)` against normalized_makes.

3. If still no match: use entire primary_name_upper as make (flag unmatched in notes).

### 4.3 Year Range Parsing

```sql
-- year_raw formats: '2010-2020', '2015', 'All Years', null
CASE
  WHEN year_raw ~ '^\d{4}-\d{4}$'
    THEN CAST(SPLIT_PART(year_raw, '-', 1) AS SMALLINT)   -- year_from
  WHEN year_raw ~ '^\d{4}$'
    THEN CAST(year_raw AS SMALLINT)                        -- year_from (single year)
  ELSE NULL                                                -- 'All Years', null → NULL
END AS year_from,
CASE
  WHEN year_raw ~ '^\d{4}-\d{4}$'
    THEN CAST(SPLIT_PART(year_raw, '-', 2) AS SMALLINT)   -- year_to
  ELSE NULL                                                -- single year or 'All Years' → NULL
END AS year_to
```

Range validation: year_from and year_to must be BETWEEN 1950 AND 2030.
Values outside this range are set to NULL and flagged.

### 4.4 Model Name Extraction and Slug Generation

```sql
-- Model name = primary_name after make prefix is stripped
-- E.g., 'CUMMINS ISX 15.0L' → make='CUMMINS' → model='ISX 15.0L'
-- E.g., 'JOHN DEERE 6R 4024' → make='JOHN DEERE' → model='6R 4024'

-- Slug generation:
LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(model_display_name),
      '[^a-zA-Z0-9]+', '-', 'g'  -- non-alphanumeric → hyphen
    ),
    '^-|-$', '', 'g'             -- strip leading/trailing hyphens
  )
)
```

---

## 5. DATA QUALITY RULES

### Accept (Insert)
- primary_name_upper IS NOT NULL AND LENGTH(primary_name_upper) >= 3
- Make resolved to a known slug OR auto-generated slug
- Model display name >= 2 characters after make prefix removal
- Year values NULL or BETWEEN 1950 AND 2030

### Skip Silently
- `equipment_applications IS NULL`
- `jsonb_array_length(equipment_applications) = 0`
- `primary_name_upper IS NULL` (all name fields empty/null)
- `primary_name_upper = ''` (empty after trim)

### Insert with Flag in Notes
- Format 4 plain string elements (notes = 'extracted from plain string — requires review')
- Model display_name is all digits (notes = 'model name is numeric only — may be product code')
- Make not found in normalization table (notes = 'UNMATCHED MAKE — auto-slug generated')
- Model display_name after prefix strip is empty (notes = 'model name empty after make strip')

### Reject and Log (diagnostic only, no insert)
- Make string < 2 characters
- Model display_name < 2 characters after trim
- Year_from or year_to outside 1950–2030

---

## 6. EXPECTED ROW COUNTS

Based on EQUIPMENT_NORMALIZATION_REPORT.md and CATALOG_COMPLETENESS_REPORT.md:

| Metric | Low Estimate | High Estimate | Notes |
|--------|-------------|---------------|-------|
| Products with equipment data | 2,000 | 3,000 | 43–65% of 4,622 catalog |
| Unique equipment makes (raw) | 50 | 100 | Post-normalization: 40–80 |
| kg_equipment_makes rows | 40 | 80 | After deduplication |
| Unique models (make+slug) | 500 | 1,500 | High variance due to partial scrape |
| kg_equipment_models rows | 500 | 1,500 | |
| kg_product_equipment rows | 2,000 | 5,000 | Multiple models per product typical |
| Products NOT in kg_product_equipment | 1,600 | 2,600 | No equipment data yet (scraper incomplete) |

**Validation thresholds** (fail Phase 2 if outside these ranges):
- `kg_equipment_makes` row count: must be BETWEEN 20 AND 120
- `kg_equipment_models` row count: must be BETWEEN 100 AND 2,500
- `kg_product_equipment` row count: must be BETWEEN 500 AND 8,000
- Products in kg_product_equipment / total catalog: must be BETWEEN 15% AND 75%

---

## 7. EXECUTION ON RENDER SHELL

```bash
# 1. Connect to Render Shell and verify database access
psql $DATABASE_URL -c "SELECT COUNT(*) FROM elimfilters_catalog;"

# 2. Run Phase 2 scripts in order (each is idempotent)
psql $DATABASE_URL -f migrations/kg-phase2/001_schema.sql
psql $DATABASE_URL -f migrations/kg-phase2/002_extract_makes.sql
psql $DATABASE_URL -f migrations/kg-phase2/003_extract_models.sql
psql $DATABASE_URL -f migrations/kg-phase2/004_populate_product_equipment.sql

# 3. Run validation
psql $DATABASE_URL -f migrations/kg-phase2/validate.sql

# 4. If any validation fails, review diagnostic output, then either:
#    a. Fix the issue in the SQL and re-run (scripts are idempotent)
#    b. Rollback: psql $DATABASE_URL -f migrations/kg-phase2/rollback.sql
```

---

## 8. POST-PHASE 2 MANUAL REVIEW TASKS

After Phase 2 executes successfully:

1. **Review unmatched makes:** Query `SELECT * FROM kg_equipment_makes WHERE notes LIKE '%UNMATCHED%'`
   and manually correct display_name, country_of_origin, industry_type.

2. **Review flagged models:** Query `SELECT * FROM kg_equipment_models WHERE notes IS NOT NULL`
   and investigate plain-string extractions and numeric-only model names.

3. **Merge duplicate models:** Some models may appear twice under slightly different slugs
   (e.g., `isx-15` and `isx-15-0l`). Identify and merge via:
   ```sql
   -- Find potential duplicates: same make, similar slug
   SELECT make_id, slug, display_name, COUNT(*) OVER (PARTITION BY make_id) AS total_for_make
   FROM kg_equipment_models
   ORDER BY make_id, slug;
   ```

4. **Update is_active = FALSE:** For any makes that represent obsolete equipment lines
   no longer in the catalog.

5. **Re-run after scraper completes:** When `scrape_equipment.py` finishes populating
   remaining ~1,500–2,000 products, re-run scripts 002–004 (idempotent, will add new rows).
