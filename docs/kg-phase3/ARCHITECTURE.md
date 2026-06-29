# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 3: Cross-Reference Normalization
# Industrial Knowledge Graph — Schema Design

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — can run in parallel with Phase 2
**Depends on:** Phase 1 only (kg_systems, kg_technologies must exist)

---

## 1. SCOPE

Phase 3 normalizes the three cross-reference JSONB columns from `elimfilters_catalog`
(`oem_codes`, `competitor_codes`, `brand_crossrefs`) into a single unified relational table:

| Table | Purpose | Expected Rows |
|-------|---------|---------------|
| `kg_crossrefs` | Unified cross-reference table (OEM + competitor + brand) | 15,000–50,000 |

**Scope boundary:**
- Creates one new table only
- Reads from `oem_codes`, `competitor_codes`, `brand_crossrefs` JSONB columns
- Does NOT read `codigo_base`, `BASE`, or `MATCHED BY` (SECURITY — see Section 4)
- Does NOT modify `elimfilters_catalog` (zero risk to source data)
- Does NOT modify any API response (JSONB columns stay in place until Phase 7+)
- Can run in parallel with Phase 2 on Render Shell (no Phase 2 dependency)

---

## 2. TABLE SCHEMA: `kg_crossrefs`

```sql
CREATE TABLE IF NOT EXISTS kg_crossrefs (
  id           SERIAL      PRIMARY KEY,
  product_sku  VARCHAR(50) NOT NULL,
  ref_type     VARCHAR(20) NOT NULL,               -- enum: 'oem', 'competitor', 'brand', 'aftermarket'
  brand        VARCHAR(100) NOT NULL,              -- UPPER normalized: 'CUMMINS', 'DONALDSON', 'MANN'
  part_number  VARCHAR(100) NOT NULL,              -- UPPER, trimmed: '3315476', 'P552100', 'W940/25'
  notes        TEXT,                              -- source format, confidence flags
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_crossref UNIQUE (product_sku, ref_type, brand, part_number),
  CONSTRAINT chk_ref_type CHECK (ref_type IN ('oem', 'competitor', 'brand', 'aftermarket'))
);
```

### Column Design Decisions

**`product_sku`**: References `elimfilters_catalog.sku`. No FK defined (same rationale
as Phase 1/2 join tables) — allows catalog updates without cascade issues.
Validated by query (orphan check in validate.sql).

**`ref_type`**: Controlled vocabulary enum via CHECK constraint:
- `'oem'` — original equipment manufacturer part number (CUMMINS 3315476, CAT 1R0716)
- `'competitor'` — competitor filter brand cross-reference (DONALDSON P552100, MANN W940/25)
- `'brand'` — from brand_crossrefs JSONB (less consistently populated)
- `'aftermarket'` — reserved for future use (not populated in Phase 3)

Classification logic mirrors `buildFilterData()` / `splitRefs()` in server.js:
any brand in the COMPETITOR_BRANDS set → `ref_type = 'competitor'`, otherwise `ref_type = 'oem'`.
For brand_crossrefs source → `ref_type = 'brand'`.

**`brand`**: Stored UPPERCASE, trimmed. Canonical brand names (see Section 5).
The COMPETITOR_BRANDS Set from server.js is the authoritative classifier.

**`part_number`**: Stored UPPERCASE, trimmed, no leading/trailing whitespace.
Retains internal punctuation and slashes: `'W940/25'`, `'600-211-1231'`, `'1R0716'`.
See Section 6 for cleaning rules.

**UNIQUE constraint `(product_sku, ref_type, brand, part_number)`**: Prevents duplicates
that arise from the multi-source extraction (oem_codes, competitor_codes, brand_crossrefs
may contain the same cross-reference through different ingestion paths).

**No `updated_at`**: This is an extraction table. If a cross-reference changes,
the row is deleted and re-inserted. Use `created_at` for audit purposes.

**Expected row count:** 15,000–50,000 rows total:
- oem_codes: ~70–80% of 4,622 products × ~3–8 OEM codes each → ~10,000–30,000 rows
- competitor_codes: ~40–60% of 4,622 products × ~3–8 codes each → ~5,000–20,000 rows
- brand_crossrefs: ~10–20% of 4,622 products × ~2–5 brands → ~1,000–5,000 rows

---

## 3. SECURITY SECTION — PERMANENT CONSTRAINT

### Fields That MUST NEVER Be Extracted

The following columns in `elimfilters_catalog` are INTERNAL source fields:
- `codigo_base` — internal Donaldson P-number. Donaldson's part number used during import.
- `BASE` — synonym/alias for `codigo_base` in some query contexts.
- `MATCHED BY` — internal sourcing indicator for how the product was matched.

**These columns MUST NOT appear in:**
- Any SQL SELECT or INSERT targeting `kg_crossrefs`
- Any SQL VIEW or function that reads from `kg_crossrefs`
- Any API response, at any phase, ever
- Any documentation that references external-facing data

**Why this matters:** `codigo_base` is a Donaldson internal P-number. Exposing it would:
1. Reveal the source of ELIMFILTERS catalog data to competitors
2. Allow reverse-engineering of the catalog's Donaldson baseline
3. Violate the security constraint documented in API_CONTRACT_REPORT.md (Section 2)

**Verification rule:** Before executing any Phase 3 SQL, grep for these field names:
```bash
grep -i 'codigo_base\|"BASE"\|MATCHED.BY' migrations/kg-phase3/*.sql
# Expected: 0 matches
```

**Only these JSONB columns are valid Phase 3 sources:**
- `oem_codes` — OEM equipment manufacturer cross-references
- `competitor_codes` — filter brand cross-references
- `brand_crossrefs` — brand-keyed object cross-references

---

## 4. JSONB FORMAT VARIANT HANDLING

Phase 3 must handle 4 format variants across the source columns.
These are documented in detail in OEM_JSONB_AUDIT.md.

### Format A — Standard object (most common)
Source: `oem_codes`, `competitor_codes`
```json
[
  {"manufacturer": "CUMMINS", "code": "3315476"},
  {"manufacturer": "CATERPILLAR", "code": "1R0716"}
]
```
Extraction: `elem->>'manufacturer'` as brand, `elem->>'code'` as part_number.

### Format B — Object with partNumber alias
Source: `oem_codes` (legacy scraper variant)
```json
[
  {"manufacturer": "VOLVO", "code": "466634", "partNumber": "466634"},
  {"manufacturer": "KOMATSU", "code": "600-211-1231", "partNumber": "600-211-1231"}
]
```
Extraction: `COALESCE(elem->>'code', elem->>'partNumber')` as part_number.
Both `code` and `partNumber` contain the same value in this format — use `code` first.

### Format C — String with pipe separator
Source: `oem_codes` (legacy, rare)
```json
["CUMMINS | 3315476", "CAT | 1R0716"]
```
Extraction: `jsonb_typeof(elem) = 'string'` → split on `' | '` (pipe with spaces).
`SPLIT_PART(elem #>> '{}', ' | ', 1)` → brand.
`SPLIT_PART(elem #>> '{}', ' | ', 2)` → part_number (join remaining if multiple pipes).

### Format D — Competitor brands mixed into oem_codes (post-consolidation)
Source: `oem_codes` only (result of Stage 2 migration in consolidate-oem-codes.js)
```json
[
  {"manufacturer": "DONALDSON", "code": "P552100"},
  {"manufacturer": "FLEETGUARD", "code": "LF670"},
  {"manufacturer": "CUMMINS", "code": "3315476"}
]
```
Same extraction as Format A, but brand classification determines `ref_type`.
DONALDSON and FLEETGUARD are in COMPETITOR_BRANDS → `ref_type = 'competitor'`.
CUMMINS is not → `ref_type = 'oem'`.

### brand_crossrefs Object Format
Source: `brand_crossrefs` only
```json
{
  "DONALDSON": ["P552100"],
  "MANN": ["W940/25"],
  "FLEETGUARD": ["LF670"]
}
```
Extraction: `jsonb_each(brand_crossrefs)` → `key` as brand, `jsonb_array_elements(value)` as part_numbers.
`ref_type = 'brand'` for all entries from this source.
Note: keys may have inconsistent casing (DONALDSON vs Donaldson vs donaldson).
Apply UPPER(TRIM(key)) normalization.

### SQL Dispatch Pattern

```sql
-- For oem_codes and competitor_codes (array of objects or strings):
CASE
  WHEN jsonb_typeof(elem) = 'string'
    THEN -- Format C: pipe-separated string
  WHEN elem->>'manufacturer' IS NOT NULL
    THEN -- Format A or B or D: object with manufacturer field
  ELSE
    NULL  -- Skip: unrecognized structure
END
```

---

## 5. BRAND NORMALIZATION STRATEGY

### 5.1 COMPETITOR_BRANDS Classification (from server.js)

The canonical set of filter brands. Any manufacturer matching this set
receives `ref_type = 'competitor'`. All others receive `ref_type = 'oem'`.

```
DONALDSON, BALDWIN, FLEETGUARD, MANN, MANN+HUMMEL, MANN-HUMMEL,
WIX, FRAM, PUROLATOR, NAPA, AC DELCO, ACDELCO, BOSCH, MAHLE, HENGST,
SAKURA, HASTINGS, LUBER-FINER, LUBERFINER, PARKER, PALL, HYDAC,
MP FILTRI, MPFILTRI, UFI, CHAMPION, COOPERSFILTERS, MOTORCRAFT, KNECHT,
SOGEFI, FILTRON, SOFIMA, FIAAM, NIPPARTS, STARLINE, CHAMPION LABS,
CARQUEST, PRONTO, EUROPART, DINEX, TRUCKTEC, FEBI, SWAG, MEYLE, VALEO,
ELOFIC, WABCO, KNORR, ALLISON, ZF
```

Fallback rule from server.js (also applied):
`UPPER(brand) LIKE '%FILTER%' OR UPPER(brand) LIKE '%FILTR%' OR UPPER(brand) LIKE '%FILTRO%'`

### 5.2 Canonical Brand Name Normalization

All brands are stored UPPERCASE with trimming. Known variants are normalized:

```
Raw input          → Stored as
─────────────────────────────────
MANN+HUMMEL        → MANN+HUMMEL  (keep + sign)
MANN-HUMMEL        → MANN+HUMMEL  (normalize to canonical)
AC DELCO           → AC DELCO
ACDELCO            → AC DELCO     (normalize to spaced form)
LUBER-FINER        → LUBER-FINER
LUBERFINER         → LUBER-FINER  (normalize to hyphenated)
MP FILTRI          → MP FILTRI
MPFILTRI           → MP FILTRI    (normalize to spaced form)
CHAMPION LABS      → CHAMPION LABS
COOPERSFILTERS     → COOPERS FILTERS (normalize)
```

### 5.3 Brand Alias Table (embedded in migration SQL)

```sql
WITH brand_aliases (raw_upper, canonical_brand) AS (
  VALUES
    ('MANN-HUMMEL',     'MANN+HUMMEL'),
    ('MANN HUMMEL',     'MANN+HUMMEL'),
    ('ACDELCO',         'AC DELCO'),
    ('LUBERFINER',      'LUBER-FINER'),
    ('MPFILTRI',        'MP FILTRI'),
    ('COOPERSFILTERS',  'COOPERS FILTERS'),
    ('CHAMPION LABS',   'CHAMPION LABS'),
    -- identity mappings for common brands (for documentation):
    ('DONALDSON',       'DONALDSON'),
    ('BALDWIN',         'BALDWIN'),
    ('FLEETGUARD',      'FLEETGUARD'),
    ('MANN',            'MANN'),
    ('WIX',             'WIX'),
    ('FRAM',            'FRAM'),
    ('PUROLATOR',       'PUROLATOR'),
    ('CUMMINS',         'CUMMINS'),
    ('CATERPILLAR',     'CATERPILLAR'),
    ('JOHN DEERE',      'JOHN DEERE')
)
```

Brands not in the alias table are stored as-is after UPPER(TRIM()).

---

## 6. PART NUMBER CLEANING

All part numbers are normalized before storage:

1. UPPER(part_number_raw)
2. TRIM(both sides)
3. Remove leading/trailing quote characters if present: `REPLACE(part_number, '"', '')`
4. Do NOT remove internal punctuation: slashes, hyphens, dots are retained
   - `W940/25` stays as `W940/25`
   - `600-211-1231` stays as `600-211-1231`
   - `P552100` stays as `P552100`
5. Do NOT pad or truncate

**Reject conditions** (do not insert):
- part_number after cleaning is NULL or empty string `''`
- part_number length after cleaning < 2 characters
- part_number is purely whitespace

**Flag conditions** (insert with notes):
- part_number length > 80 characters (likely data corruption)
- part_number contains only non-alphanumeric characters after cleaning

---

## 7. INDEX DESIGN

```
-- kg_crossrefs
idx_kg_cr_product_sku          ON kg_crossrefs(product_sku)              — lookup by SKU
idx_kg_cr_part_number          ON kg_crossrefs(part_number)              — reverse lookup (find by part#)
idx_kg_cr_brand_part_number    ON kg_crossrefs(brand, part_number)       — brand-scoped part# lookup
idx_kg_cr_ref_type             ON kg_crossrefs(ref_type)                 — filter by type
-- UNIQUE (product_sku, ref_type, brand, part_number) creates composite index automatically
```

**Rationale for `idx_kg_cr_part_number`:** The autocomplete endpoint
(`/api/autocomplete?q=3315476`) searches by cross-reference part numbers.
After KG migration, this index enables <10ms reverse lookup by part number
across the full 15,000–50,000 row table.

**Rationale for `idx_kg_cr_brand_part_number`:** Enables queries like
"find ELIMFILTERS SKU matching DONALDSON P552100" — a common filter selection flow.

---

## 8. BACKWARD COMPATIBILITY

The `oem_codes` and `competitor_codes` JSONB columns in `elimfilters_catalog` MUST NOT be
cleared during Phase 3. They remain the authoritative source for all current API responses.

**Migration order** (same as OEM_JSONB_AUDIT.md Section 6):
1. Phase 3: Create `kg_crossrefs` (additive only)
2. Phase 3: Populate `kg_crossrefs` from JSONB (additive, no JSONB deletion)
3. Phase 7+: Switch API endpoints to read from `kg_crossrefs`
4. Post-Phase 7: Keep JSONB as backup (storage is cheap; removing it is risky)

---

## 9. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Post-consolidation contamination (filter brands in oem_codes) | CERTAIN | LOW | COMPETITOR_BRANDS classification handles this at insertion — ref_type assigned correctly |
| Format C pipe-separated strings (rare) | LOW | LOW | jsonb_typeof = 'string' dispatch handles these; flag in notes |
| brand_crossrefs key casing inconsistency | MEDIUM | LOW | UPPER(TRIM(key)) normalization in extraction |
| Empty competitor_codes (scraper not run for all SKUs) | CERTAIN | LOW | NULL/empty arrays silently skipped — expected, not a bug |
| Duplicate rows from multi-source extraction | CERTAIN | LOW | UNIQUE constraint (product_sku, ref_type, brand, part_number) prevents duplicates |
| codigo_base accidentally included | LOW | CRITICAL | SQL security rule enforced; grep check in CI; never SELECT from codigo_base |
| Part number length >80 chars (corruption) | VERY LOW | LOW | Flag in notes; insert anyway (data still useful for search) |
| Ambiguous brand classification (ATLAS COPCO, DENSO) | MEDIUM | LOW | server.js COMPETITOR_BRANDS is the authoritative classifier; follow it exactly |
| Phase 1 not executed (function kg_set_updated_at missing) | LOW | LOW | Phase 3 has no trigger — no dependency on that function for the table itself |
| Railway storage limit | LOW | LOW | ~15,000–50,000 rows × ~200 bytes ≈ 3–10 MB; well within limits |
