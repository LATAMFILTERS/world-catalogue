# PHASE1_RENDER_CHECKLIST.md
# ELIMFILTERS — Phase 1 Render Shell Execution Checklist
# KG Phase 1 — Pre-Execution Verification + Step-by-Step Run Guide

**Estimated total time:** 20–30 minutes  
**Risk to elimfilters_catalog:** ZERO — Phase 1 creates new tables only  
**Rollback:** `psql $DATABASE_URL -f migrations/kg-phase1/rollback.sql`

---

## PART 1 — PRE-EXECUTION VERIFICATION (Run First)

Run these queries BEFORE executing any migration scripts.
Expected outputs are provided — stop if any result doesn't match.

---

### 1.1 — Technology Distribution

```sql
SELECT technology, COUNT(*) AS cnt
FROM elimfilters_catalog
GROUP BY technology
ORDER BY cnt DESC;
```

**Expected output:**
```
technology    | cnt
--------------+------
NANOFORCE™    | 1962
MACROCORE™    | 1366
SYNTAPORE™    |  500
SYNTRAX™      |  351
INTAKCORE™    |  243
MICROKAPPA™   |  122
COOLTECH™     |   59
AQUAGUARD™    |   16
DRYCORE™      |    3
(9 rows)     Total: 4622
```

**If rows differ from expected:**
- New technology values present → add normalization case to `005_populate_product_technologies.sql` before running
- Count ≠ 4622 → catalog was modified since audit; document new total, update expected counts in validate.sql

---

### 1.2 — Filter Type Distribution

```sql
SELECT filter_type, COUNT(*) AS cnt
FROM elimfilters_catalog
GROUP BY filter_type
ORDER BY cnt DESC;
```

**Expected output:**
```
filter_type  | cnt
-------------+------
hydraulic    | 1962
air          | 1366
fuel         |  500
lube         |  351
air-intake   |  243
cabin        |  122
coolant      |   59
turbine      |   16
air-dryer    |    3
(9 rows)     Total: 4622
```

**If new filter_type values present:**
→ Add mapping to `004_populate_product_systems.sql` WITH filter_type_map section before running

---

### 1.3 — Total Product Count

```sql
SELECT COUNT(*) AS total_products FROM elimfilters_catalog;
```

**Expected:** `4622`

---

### 1.4 — NULL Field Check

```sql
SELECT
  COUNT(*) FILTER (WHERE technology IS NULL)   AS null_technology,
  COUNT(*) FILTER (WHERE filter_type IS NULL)  AS null_filter_type,
  COUNT(*) FILTER (WHERE sku IS NULL)           AS null_sku
FROM elimfilters_catalog;
```

**Expected:** `0 | 0 | 0`  
If any non-zero → document and proceed; those products will be unmapped in KG.

---

### 1.5 — Existing KG Tables (should not exist before Phase 1)

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'kg_%';
```

**Expected:** `(0 rows)` — if rows appear, Phase 1 was partially run before.  
If tables exist → run `rollback.sql` first to clean up, then proceed fresh.

---

### 1.6 — pgvector Status (needed for Phase 6 only, check now)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

**If `(1 row)`:** pgvector available → Phase 6 can use embeddings as designed.  
**If `(0 rows)`:** pgvector not available → Phase 6 will use Option D (full-text search fallback).  
Note result but DO NOT BLOCK Phase 1 execution.

---

### 1.7 — Run Full Audit Script (Optional but Recommended)

```bash
node scripts/audit-catalog.js
```

Review output for any anomalies vs. Phase 0 audit baseline.

---

### 1.8 — Equipment Coverage Check

```sql
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
```

**Expected:** ~53% (2,455 of 4,622 products)  
Document actual value — needed for Phase 4 planning.

---

## PART 2 — MIGRATION EXECUTION (In Order)

⚠️ **Run scripts in exact order. Do not skip steps.**  
⚠️ **Each script is idempotent — safe to re-run if interrupted.**

Use psql or Render's DB console. All scripts are in `migrations/kg-phase1/`.

---

### Step 1 — Create Schema

```bash
psql $DATABASE_URL -f migrations/kg-phase1/001_schema.sql
```

**Success indicators:**
```
CREATE TABLE   ← kg_systems created
CREATE TABLE   ← kg_technologies created
CREATE TABLE   ← kg_product_systems created
CREATE TABLE   ← kg_product_technologies created
CREATE INDEX   ← (multiple index lines)
CREATE FUNCTION
DO             ← triggers created
```

**Quick verify:**
```sql
SELECT tablename FROM pg_tables WHERE tablename LIKE 'kg_%' ORDER BY tablename;
-- Expected: 4 rows: kg_product_systems, kg_product_technologies, kg_systems, kg_technologies
```

---

### Step 2 — Seed Systems (6 rows)

```bash
psql $DATABASE_URL -f migrations/kg-phase1/002_seed_systems.sql
```

**Success indicators:**
```
INSERT 0 6   (or UPDATE 6 if re-run)
id | slug           | name                      | sort_order
 1 | air-intake     | Air Intake Filtration     | 1
 2 | fuel           | Fuel Filtration           | 2
 3 | hydraulic      | Hydraulic Systems         | 3
 4 | lube-oil       | Lube / Oil Filtration     | 4
 5 | cabin          | Cabin / Operator Safety   | 5
 6 | compressed-air | Compressed Air Systems    | 6
(6 rows)
```

---

### Step 3 — Seed Technologies (11 rows)

```bash
psql $DATABASE_URL -f migrations/kg-phase1/003_seed_technologies.sql
```

**Success indicators:**
```
INSERT 0 11  (or UPDATE 11 if re-run)
```
9 ACTIVE + 2 PRE_LAUNCH. BLUECLEAN and GASULTRA intentionally excluded.

**Verify categories and status:**
```sql
SELECT slug, category, status FROM kg_technologies ORDER BY status DESC, slug;
```
**Expected:**
```
slug         | category                          | status
aquaguard    | Fuel/Water Separation             | ACTIVE
cooltech     | Coolant Filtration                | ACTIVE
drycore      | Air Dryer Technology              | ACTIVE
intekcore    | Air Housing & Precleaner          | ACTIVE
macrocore    | Air Intake Filtration             | ACTIVE
microkappa   | Cabin Air Filtration              | ACTIVE
nanoforce    | Hydraulic Filtration              | ACTIVE
syntepore    | Fuel Filtration                   | ACTIVE
syntrax      | Lube / Engine Oil Filtration      | ACTIVE
duratech     | Heavy-Duty Engine Oil Filtration  | PRE_LAUNCH
marineclean  | Marine Filtration                 | PRE_LAUNCH
(11 rows)
```

**Confirm exclusions:**
```sql
SELECT COUNT(*) FROM kg_technologies WHERE slug IN ('blueclean', 'gasultra');
-- Expected: 0
```

If any wrong → run `003_seed_technologies.sql` again (it uses ON CONFLICT DO UPDATE).

---

### Step 4 — Populate Product → Systems (4,622 rows)

```bash
psql $DATABASE_URL -f migrations/kg-phase1/004_populate_product_systems.sql
```

**Success indicators:**
```
INSERT 0 4622
unmapped_products_with_filter_type
0
products_with_null_filter_type
0
```

**Final count verification:**
```
system          | mapped_products
air-intake      | 1609
fuel            | 516
hydraulic       | 1962
lube-oil        | 410
cabin           | 122
compressed-air  | 3
```

**If unmapped_products > 0:**
→ Check: `SELECT filter_type FROM kg_phase1_unmapped_systems;`
→ Add missing mapping to `004_populate_product_systems.sql`
→ Re-run (idempotent)

---

### Step 5 — Populate Product → Technologies (4,622 rows)

```bash
psql $DATABASE_URL -f migrations/kg-phase1/005_populate_product_technologies.sql
```

**Success indicators:**
```
INSERT 0 4622
unmapped_product_count
0
null_technology_products
0
products_without_kg_technology
0
```

**If unmapped_product_count > 0:**
→ Check: `SELECT technology FROM kg_phase1_unmapped_technologies GROUP BY technology;`
→ Add alias case to 005 CASE expression
→ Run `TRUNCATE kg_product_technologies;` first, then re-run script

---

## PART 3 — VALIDATION (Run After All 5 Steps)

```bash
psql $DATABASE_URL -f migrations/kg-phase1/validate.sql
```

**Phase 1 PASS criteria — all must be true:**

| Check | Expected |
|-------|---------|
| A1: Table count | 4 rows |
| B1: System count | 6 rows |
| B2: Technology count | 11 rows (9 ACTIVE + 2 PRE_LAUNCH) |
| B2b: ACTIVE count | 9 |
| B2b: PRE_LAUNCH count | 2 (duratech, marineclean) |
| B2c: Excluded (blueclean, gasultra) | 0 rows |
| B3: Technologies without system | 0 |
| B4: MICROKAPPA category | `Cabin Air Filtration` |
| B4: SYNTRAX category | `Lube / Engine Oil Filtration` |
| B4: NANOFORCE category | `Hydraulic Filtration` |
| C1: Products with technology | 4,622 |
| C3: Unmapped products | 0 |
| D1: Products with system | 4,622 |
| D3: Unmapped products | 0 |
| E1: Tech/system consistency | 0 rows |
| F: kg_product_systems count | 4,622 |
| F: kg_product_technologies count | 4,622 |

**If all pass → Phase 1 COMPLETE ✅**

---

## PART 4 — ROLLBACK (Only If Needed)

To completely undo Phase 1:

```bash
psql $DATABASE_URL -f migrations/kg-phase1/rollback.sql
```

**Verify:**
```sql
SELECT tablename FROM pg_tables WHERE tablename LIKE 'kg_%';
-- Expected: 0 rows
SELECT COUNT(*) FROM elimfilters_catalog;
-- Expected: 4622 (catalog unchanged)
```

---

## PART 5 — POST-COMPLETION NOTES

After Phase 1 is confirmed complete:

1. **Update this checklist** — mark each step with completion timestamp
2. **Commit validation output** — save the output of `validate.sql` to `docs/kg-phase1/VALIDATION_OUTPUT.txt`
3. **Note for Phase 2:**
   - pgvector status (from check 1.6)
   - Equipment coverage percentage (from check 1.8)
   - Any unexpected filter_type or technology values found

---

## APPENDIX — Quick Reference

### Connect to DB from Render Shell
```bash
psql $DATABASE_URL
```

### Run single script
```bash
psql $DATABASE_URL -f migrations/kg-phase1/001_schema.sql
```

### Quick health check after migration
```sql
SELECT 'kg_systems' AS t, COUNT(*) FROM kg_systems
UNION ALL SELECT 'kg_technologies', COUNT(*) FROM kg_technologies
UNION ALL SELECT 'kg_product_systems', COUNT(*) FROM kg_product_systems
UNION ALL SELECT 'kg_product_technologies', COUNT(*) FROM kg_product_technologies;
```

### Expected final state
```
t                        | count
-------------------------+-------
kg_systems               |     6
kg_technologies          |    13
kg_product_systems       |  4622
kg_product_technologies  |  4622
```
