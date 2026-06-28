# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 2: Equipment Normalization
# Industrial Knowledge Graph — Schema Design

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — awaiting Phase 1 execution before Phase 2 runs
**Depends on:** Phase 1 (kg_systems, kg_technologies must exist)

---

## 1. SCOPE

Phase 2 normalizes the `equipment_applications` JSONB column from `elimfilters_catalog`
into three relational tables:

| Table | Purpose | Expected Rows |
|-------|---------|---------------|
| `kg_equipment_makes` | Normalized manufacturer names (Cummins, Caterpillar, etc.) | 50–80 |
| `kg_equipment_models` | Normalized model identifiers per make | 500–1,500 |
| `kg_product_equipment` | Product-to-model join table | 2,000–5,000 |

**Scope boundary:**
- Creates new tables only
- Reads `equipment_applications` JSONB from `elimfilters_catalog` (no writes to source table)
- Does NOT modify any API response (equipment_applications JSONB stays in place until Phase 7+)
- Does NOT involve cross-references (Phase 3)

---

## 2. TABLE SCHEMAS

### 2.1 `kg_equipment_makes`

```sql
CREATE TABLE IF NOT EXISTS kg_equipment_makes (
  id               SERIAL       PRIMARY KEY,
  slug             VARCHAR(80)  NOT NULL UNIQUE,   -- 'cummins', 'john-deere', 'new-holland'
  display_name     VARCHAR(120) NOT NULL,           -- 'Cummins Inc.', 'John Deere', 'New Holland'
  country_of_origin VARCHAR(60),                   -- 'United States', 'Germany', null if unknown
  industry_type    VARCHAR(120),                   -- 'construction,mining,marine,power-generation'
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Design decisions:**

- `slug`: URL-safe, lowercase, hyphen-separated. Canonical identifier — survives display_name
  corrections. Multi-word brands use hyphens: `john-deere`, `new-holland`, `massey-ferguson`.
- `display_name`: The public-facing name. Corrected title case (not the raw JSONB input).
- `country_of_origin`: ISO 3166-1 country name (not code). NULL if genuinely unknown.
  Not required for normalization — fills in progressively.
- `industry_type`: Comma-separated list derived from make-to-industry mapping
  (see EQUIPMENT_NORMALIZATION_REPORT.md Section 5). Denormalized for query convenience.
  Example: `'construction,mining'` for Caterpillar. NULL if unclassified.
- `is_active`: FALSE for makes that no longer appear in active catalog but have historical records.
- `updated_at`: Maintained by trigger `trg_kg_equipment_makes_updated_at` (reuses `kg_set_updated_at()`).

**Seed strategy:** Auto-extracted from JSONB by `002_extract_makes.sql`. Manual corrections
applied via ON CONFLICT DO UPDATE for display_name and country_of_origin. ~50–80 rows expected.

---

### 2.2 `kg_equipment_models`

```sql
CREATE TABLE IF NOT EXISTS kg_equipment_models (
  id               SERIAL       PRIMARY KEY,
  make_id          INTEGER      NOT NULL REFERENCES kg_equipment_makes(id) ON DELETE RESTRICT,
  slug             VARCHAR(120) NOT NULL,            -- 'isx-15-0l', '6r-4024'
  display_name     VARCHAR(200) NOT NULL,            -- 'ISX 15.0L', '6R 4024'
  year_from        SMALLINT,                        -- 2010 (null if unknown)
  year_to          SMALLINT,                        -- 2020 (null = current)
  engine_type      VARCHAR(100),                    -- 'On-Highway', 'Tractor', 'Marine'
  displacement_cc  INTEGER,                         -- engine displacement in cc (null if N/A)
  notes            TEXT,                            -- free-form: known aliases, data quality flags
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_make_model_slug UNIQUE (make_id, slug)
);
```

**Design decisions:**

- `make_id → kg_equipment_makes.id` with ON DELETE RESTRICT: prevents orphaned models if a make
  is incorrectly deleted. Makes are reference data — they should be deactivated, not deleted.
- `slug`: Scoped to make_id (UNIQUE constraint is composite). Two makes can both have
  slug `'6090'` (e.g., John Deere 6090, Fendt 6090). Slug generated from display_name:
  lowercase, replace spaces/dots/slashes with hyphens, remove non-alphanumeric chars.
  Examples: `'ISX 15.0L'` → `'isx-15-0l'`, `'6R 4024'` → `'6r-4024'`.
- `year_from` / `year_to`: Parsed from JSONB `year` field. `'2010-2020'` → (2010, 2020).
  `'2015'` → (2015, NULL). `'All Years'` or NULL → (NULL, NULL).
- `engine_type`: Populated from JSONB `type` or `machine` field (whichever is present).
  Not normalized to a controlled vocabulary in Phase 2 — stored as-is for now.
- `displacement_cc`: NULL for most records. Populated only when explicitly in JSONB data.
- `notes`: Stores data quality flags from extraction (e.g., "extracted from plain string fallback"),
  known aliases, or ambiguous make/model splits that need manual review.
- `updated_at`: Maintained by trigger `trg_kg_equipment_models_updated_at`.

**Expected row count:** 500–1,500 unique make+model combinations from ~50–80 makes.

---

### 2.3 `kg_product_equipment`

```sql
CREATE TABLE IF NOT EXISTS kg_product_equipment (
  id           SERIAL      PRIMARY KEY,
  product_sku  VARCHAR(50) NOT NULL,
  model_id     INTEGER     NOT NULL REFERENCES kg_equipment_models(id) ON DELETE CASCADE,
  fit_type     VARCHAR(50),                         -- 'direct', 'aftermarket', 'oem-spec', null
  notes        TEXT,                               -- source notes, ambiguity flags
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_model UNIQUE (product_sku, model_id)
);
```

**Design decisions:**

- `product_sku → elimfilters_catalog.sku`: No FK defined (same rationale as Phase 1 join tables).
  Allows catalog updates without cascade complications. Validated via application logic.
- `model_id → kg_equipment_models.id` with ON DELETE CASCADE: If a model is removed (e.g.,
  duplicate detected and merged), product links are cleaned up automatically.
- `fit_type`: Not reliably available from current JSONB data. Reserved for future population.
  NULL is the default. Values: `'direct'` (direct OEM replacement), `'aftermarket'`
  (confirmed aftermarket fit), `'oem-spec'` (meets OEM spec, not verified direct fit).
- UNIQUE constraint `(product_sku, model_id)`: Prevents duplicate rows when JSONB contains
  the same equipment entry multiple times (observed in some records).
- No `updated_at` — this is a join table. If a link needs correcting, DELETE + INSERT.

**Expected row count:** 2,000–5,000 rows (≥1 per product with equipment data;
  many products fit multiple models → multiple rows per product).

---

## 3. INDEX DESIGN

```
-- kg_equipment_makes
idx_kg_makes_slug              ON kg_equipment_makes(slug)             — lookup by slug
idx_kg_makes_is_active         ON kg_equipment_makes(is_active)        — filter active/inactive
idx_kg_makes_industry_type     ON kg_equipment_makes USING gin (...)   — NOTE: industry_type is
                                                                           VARCHAR, not JSONB.
                                                                           Use trigram or LIKE index
                                                                           if full-text needed later.

-- kg_equipment_models
idx_kg_models_make_id          ON kg_equipment_models(make_id)         — FK traversal (required)
idx_kg_models_slug             ON kg_equipment_models(make_id, slug)   — composite (covered by UNIQUE)
idx_kg_models_display_name     ON kg_equipment_models(display_name)    — search by model name
idx_kg_models_year_range       ON kg_equipment_models(year_from, year_to) — year filtering

-- kg_product_equipment
idx_kg_pe_sku                  ON kg_product_equipment(product_sku)    — lookup by SKU
idx_kg_pe_model_id             ON kg_product_equipment(model_id)       — FK traversal
-- UNIQUE (product_sku, model_id) creates composite index automatically
```

**Rationale for model display_name index:** The API equipment search endpoint
(`/api/filters/search/equipment?model=CUMMINS%20ISX`) performs text matching on
equipment names. Once KG endpoint replaces this, display_name will be the primary
query target. Index ensures <10ms lookups on 500–1,500 row table.

**Why no GIN trigram index in Phase 2:** Table is too small (max ~1,500 rows) for
GIN overhead to pay off. Add in Phase 7 when API migrates to KG data source.

---

## 4. JSONB PARSING STRATEGY

### 4.1 Format Variants (from EQUIPMENT_NORMALIZATION_REPORT.md)

The `equipment_applications` column contains arrays with four element formats:

**Format 1 — Full object (most common, from scraper):**
```json
{
  "equipment": "CUMMINS ISX 15.0L",
  "engine": "ISX 15.0L",
  "year": "2010-2020",
  "type": "On-Highway"
}
```
Extraction: `equipment` = primary name source. `engine` for model detail.
`year` → year_from/year_to split. `type` → engine_type.

**Format 2 — Model/machine variant:**
```json
{
  "model": "6R 4024",
  "machine": "Tractor"
}
```
Extraction: `model` = model name (no make embedded). `machine` → engine_type.
Make must be inferred from context — this format typically appears when the make
is in a sibling entry or is a known single-make product line. Flag for manual review.

**Format 3 — Minimal object:**
```json
{
  "equipment": "JOHN DEERE 6R 4024"
}
```
Extraction: `equipment` field only. Make must be parsed from string prefix.
Uses multi-word make prefix matching (see Section 5).

**Format 4 — Plain string fallback:**
```
"CUMMINS ISX 2010-2020"
```
Stored as a string element in the array (not an object). The `jsonb_typeof(elem)` = `'string'`
check catches these. Extraction: UPPER, trim, attempt first-word make matching.
Year pattern `YYYY-YYYY` parsed from trailing tokens. Low confidence — flag in notes.

### 4.2 SQL Dispatch Pattern

```sql
-- Dispatch per format in extraction queries:
CASE
  WHEN jsonb_typeof(elem) = 'string'
    THEN -- Format 4: plain string path
  WHEN elem->>'equipment' IS NOT NULL
    THEN -- Format 1 or 3: equipment field present
  WHEN elem->>'model' IS NOT NULL AND elem->>'machine' IS NOT NULL
    THEN -- Format 2: model+machine variant
  ELSE
    NULL  -- skip: unrecognized structure
END
```

### 4.3 Equipment Field Parsing (Make/Model Split)

The `equipment` field frequently embeds the make name: `"CUMMINS ISX 15.0L"`.
Simple `SPLIT_PART(' ', 1)` first-word extraction fails for multi-word makes.

**Multi-word make prefix table** (must be matched in length-descending order):
```
'JOHN DEERE'       → slug: john-deere
'CASE IH'          → slug: case-ih     (variant of 'case', agriculture division)
'NEW HOLLAND'      → slug: new-holland
'MASSEY FERGUSON'  → slug: massey-ferguson
'MANN+HUMMEL'      → slug: mann-hummel
'MERCEDES-BENZ'    → slug: mercedes-benz
'ATLAS COPCO'      → slug: atlas-copco
'INGERSOLL RAND'   → slug: ingersoll-rand
'GARDNER DENVER'   → slug: gardner-denver
'DETROIT DIESEL'   → slug: detroit
```

After matching multi-word prefixes, attempt single-word make match from the
normalization table (CUMMINS → cummins, CAT → caterpillar, JD → john-deere, etc.).

Model name = remainder after make prefix is stripped. Trim the result.

---

## 5. MAKE NAME NORMALIZATION STRATEGY

### 5.1 Normalization Table (embedded in migration SQL)

The `002_extract_makes.sql` script uses a CTE that maps raw make strings to
canonical slugs. This is the authoritative normalization:

```
Raw input (UPPER + TRIM)     → Canonical slug    → Display name
────────────────────────────────────────────────────────────────
CUMMINS                      → cummins           → Cummins Inc.
CUMMINS INC.                 → cummins           → Cummins Inc.
CATERPILLAR                  → caterpillar       → Caterpillar Inc.
CAT                          → caterpillar       → Caterpillar Inc.
JOHN DEERE                   → john-deere        → John Deere
JOHNDEERE                    → john-deere        → John Deere
JD                           → john-deere        → John Deere
VOLVO                        → volvo             → Volvo
VOLVO TRUCKS                 → volvo             → Volvo
KOMATSU                      → komatsu           → Komatsu Ltd.
KOMATSU LTD.                 → komatsu           → Komatsu Ltd.
KENWORTH                     → kenworth          → Kenworth Truck Co.
KENWORTH TRUCK               → kenworth          → Kenworth Truck Co.
PETERBILT                    → peterbilt         → Peterbilt Motors
PETERBILT MOTORS             → peterbilt         → Peterbilt Motors
FREIGHTLINER                 → freightliner      → Freightliner LLC
FREIGHTLINER LLC             → freightliner      → Freightliner LLC
MACK                         → mack              → Mack Trucks
MACK TRUCKS                  → mack              → Mack Trucks
MERCEDES-BENZ                → mercedes-benz     → Mercedes-Benz
MERCEDES BENZ                → mercedes-benz     → Mercedes-Benz
MERCEDES                     → mercedes-benz     → Mercedes-Benz
LIEBHERR                     → liebherr          → Liebherr Group
LIEBHERR GROUP               → liebherr          → Liebherr Group
CASE                         → case              → CNH Industrial / CASE
CASE IH                      → case-ih           → Case IH Agriculture
NEW HOLLAND                  → new-holland       → New Holland Agriculture
JCB                          → jcb               → JCB
J.C. BAMFORD                 → jcb               → JCB
HITACHI                      → hitachi           → Hitachi Construction
HITACHI CONSTRUCTION         → hitachi           → Hitachi Construction
DOOSAN                       → doosan            → Doosan Infracore
DOOSAN INFRACORE             → doosan            → Doosan Infracore
KOBELCO                      → kobelco           → Kobelco Construction
HYUNDAI                      → hyundai           → Hyundai Construction Equipment
INTERNATIONAL                → navistar          → Navistar International
NAVISTAR                     → navistar          → Navistar International
INTERNATIONAL HARVESTER      → navistar          → Navistar International
FENDT                        → fendt             → AGCO / Fendt
CLAAS                        → claas             → CLAAS KGaA mbH
MASSEY FERGUSON              → massey-ferguson   → Massey Ferguson
MF                           → massey-ferguson   → Massey Ferguson
DEUTZ                        → deutz             → Deutz AG
DEUTZ AG                     → deutz             → Deutz AG
DEUTZ-FAHR                   → deutz-fahr        → Deutz-Fahr
SAME                         → same              → SAME Deutz-Fahr
KUBOTA                       → kubota            → Kubota Corporation
YANMAR                       → yanmar            → Yanmar Co. Ltd.
PERKINS                      → perkins           → Perkins Engines
PERKINS ENGINES              → perkins           → Perkins Engines
DETROIT                      → detroit           → Detroit Diesel
DETROIT DIESEL               → detroit           → Detroit Diesel
ISUZU                        → isuzu             → Isuzu Motors
HINO                         → hino              → Hino Motors
MITSUBISHI                   → mitsubishi        → Mitsubishi
FORD                         → ford              → Ford Motor Company
MTU                          → mtu               → MTU Friedrichshafen
BAUDOUIN                     → baudouin          → Baudouin
SCANIA                       → scania            → Scania AB
DAF                          → daf               → DAF Trucks
IVECO                        → iveco             → Iveco
MAN                          → man               → MAN Truck & Bus
MAN TRUCK & BUS              → man               → MAN Truck & Bus
```

### 5.2 Normalization Algorithm

1. Read raw make string from JSONB
2. UPPER(TRIM(raw)) → normalized_upper
3. Apply multi-word prefix match (longest prefix first)
4. If no multi-word match: look up normalized_upper in single-word table above
5. If still no match: insert raw as-is with `slug = LOWER(REGEXP_REPLACE(normalized_upper, '[^A-Z0-9]+', '-', 'g'))`, flag in notes as 'UNMATCHED — requires manual review'
6. Store canonical slug in kg_equipment_makes

### 5.3 Unmatched Makes Handling

Makes not in the normalization table are inserted with auto-generated slugs.
They are identifiable by the absence of a country_of_origin value and the presence
of extraction notes. A post-Phase 2 review task should consolidate these.

---

## 6. MODEL SLUG GENERATION STRATEGY

### 6.1 Algorithm

Model slugs are generated from `display_name` after make prefix stripping:

```
1. Input: display_name after make removal (e.g., "ISX 15.0L", "6R 4024")
2. LOWER(display_name)
3. Replace '.' and '/' with '-' (preserve decimal structure)
4. Replace all non-alphanumeric characters (except '-') with '-'
5. Replace multiple consecutive hyphens with single '-'
6. Strip leading/trailing hyphens
7. Result: 'isx-15-0l', '6r-4024', 'c7-acert'
```

### 6.2 Collision Handling

The UNIQUE constraint is on `(make_id, slug)`. Within a make, same-slug models
represent the same physical model and should be merged (via ON CONFLICT DO NOTHING
or DO UPDATE to merge year ranges). Cross-make slug collisions are expected
and valid (UNIQUE constraint is scoped to make_id).

### 6.3 Year Range Merging

When two JSONB entries produce the same make_id + slug:
```sql
ON CONFLICT (make_id, slug) DO UPDATE SET
  year_from = LEAST(EXCLUDED.year_from, kg_equipment_models.year_from),
  year_to   = GREATEST(EXCLUDED.year_to, kg_equipment_models.year_to)
```
This merges `2010-2015` and `2016-2020` into `2010-2020` for the same model slug.

---

## 7. INDUSTRY DERIVATION

Makes map to industry types based on equipment domain knowledge:

```
cummins           → construction,mining,marine,power-generation,agriculture
caterpillar       → construction,mining
john-deere        → agriculture,construction
komatsu           → construction,mining
kenworth          → automotive
peterbilt         → automotive
freightliner      → automotive
mack              → automotive
volvo             → automotive,construction
liebherr          → construction,mining
case              → agriculture,construction
case-ih           → agriculture
new-holland       → agriculture
massey-ferguson   → agriculture
kubota            → agriculture
yanmar            → marine,agriculture
perkins           → agriculture,construction,marine
detroit           → automotive,marine
isuzu             → automotive,agriculture
hino              → automotive
mitsubishi        → automotive,construction
ford              → automotive,agriculture
mtu               → marine,power-generation
baudouin          → marine
scania            → automotive
daf               → automotive
iveco             → automotive
man               → automotive
hitachi           → construction,mining
doosan            → construction,mining
kobelco           → construction,mining
hyundai           → construction,mining
navistar          → automotive,agriculture
fendt             → agriculture
claas             → agriculture
deutz             → agriculture,construction,power-generation
deutz-fahr        → agriculture
same              → agriculture
mercedes-benz     → automotive,construction
jcb               → construction,agriculture
```

This is seeded into `industry_type` column during `002_extract_makes.sql`.

---

## 8. DATA QUALITY RULES

### What to Extract
- JSONB elements where `equipment`, `model`, or `machine` field is non-NULL and non-empty string
- Format 4 plain strings where length > 5 characters

### What to Skip
- NULL `equipment_applications` column → skip product entirely
- `equipment_applications = '[]'::jsonb` → skip product (empty array)
- Array elements where ALL of equipment/model/machine/engine are NULL
- Array elements where the primary name field is an empty string `''`
- Array elements where `jsonb_typeof(elem) NOT IN ('object', 'string')`

### What to Flag in Notes
- Format 4 plain string extractions (low-confidence make/model split)
- Formats 2 (model+machine only) where make cannot be determined
- Display names containing only numbers (likely a product code, not a model name)
- Make prefix not found in normalization table

### What to Reject (log but do not insert)
- Make strings under 2 characters (e.g., single letter entries from malformed data)
- Model display names under 2 characters
- Year values outside 1950–2030 range

---

## 9. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Multi-word make split produces wrong model | HIGH | MEDIUM | Pre-defined multi-word prefix list; flag unmatched in notes |
| `equipment` field embeds make name (requires prefix strip) | HIGH | MEDIUM | Normalization CTE with 50+ alias mappings |
| Format 4 plain strings misparse (year in make position) | MEDIUM | LOW | Flag as 'plain string fallback' in notes; exclude from display until reviewed |
| Duplicate models inserted under different slugs (ISX vs ISX15 vs ISX-15.0L) | HIGH | MEDIUM | ON CONFLICT DO NOTHING — deduplication is a Phase 2+ cleanup task, not Phase 2 blocker |
| Equipment scraper still running, data changing | MEDIUM | LOW | Phase 2 is additive; re-run 004_populate_product_equipment.sql after scraper completes |
| Phase 1 not yet executed (dependency failure) | HIGH (pre-execution) | BLOCKING | Verify Phase 1 complete before running Phase 2 (`SELECT COUNT(*) FROM kg_systems` = 6) |
| JSONB column contains NULL for 47% of products | CERTAIN | LOW | NULL products silently skipped; expected ~53% coverage |
| Unrecognized make generates ugly auto-slug | MEDIUM | LOW | Human review task flagged in notes; is_active=TRUE until explicitly deactivated |
| Railway PostgreSQL row-level lock during bulk insert | LOW | LOW | Scripts use INSERT...SELECT (no row-level locking on source) |
| ON DELETE RESTRICT on make_id blocks accidental make deletion | INTENDED | N/A | This is correct behavior — makes must be deactivated (is_active=FALSE), not deleted |
