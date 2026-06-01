# OEM_JSONB_AUDIT.md
# ELIMFILTERS — OEM/Competitor JSONB Column History and Format Analysis
# KG Phase 0 Readiness Audit

**Sources analyzed:**
- `/home/user/world-catalogue/scripts/consolidate-oem-codes.js`
- `/home/user/world-catalogue/scripts/recover-competitor-codes.js`
- `/home/user/world-catalogue/server.js` (lines 492–584, 659–698, 1561–1598)
- `/home/user/world-catalogue/scripts/audit-catalog.js` (sections 6–7)

---

## 1. HISTORICAL MIGRATION TIMELINE

Understanding the history is essential before any KG normalization.

### Stage 1 — Initial Donaldson Scraper
The Python scraper (`import_donaldson_v2.py`) scraped Donaldson's website and created:
- `oem_codes` = OEM equipment manufacturer codes (CUMMINS 3315476, CAT 1R0716, etc.)
- `competitor_codes` = competitor filter brand codes (FLEETGUARD LF670, MANN W940/25, etc.)

**Problem discovered:** The scraper classified codes by brand type — but this was wrong.
All codes from Donaldson's website are Donaldson cross-references, regardless of brand type.
The split created a data integrity issue where competitor codes were in the wrong column.

### Stage 2 — consolidate-oem-codes.js Migration
**Action:** Merged ALL competitor_codes → oem_codes, then cleared competitor_codes to `[]`.
```sql
UPDATE elimfilters_catalog
SET oem_codes = COALESCE(oem_codes, '[]') || COALESCE(competitor_codes, '[]'),
    competitor_codes = '[]'::jsonb
WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0;
```
**Result:** oem_codes now contains BOTH equipment OEM codes AND competitor filter brand codes mixed together.

### Stage 3 — recover-competitor-codes.js Re-population
**Action:** Scraped `oilfilter-crossreference.com` to re-populate competitor_codes from a third-party source.
This script fetched cross-reference data for each Donaldson P-number with empty competitor_codes.

### Stage 4 — buildFilterData() Runtime Re-classification
**Current permanent fix:** On EVERY API response, `splitRefs()` merges both columns and re-classifies:
```javascript
const refs = splitRefs([...parseRefs(row.oem_codes), ...parseRefs(row.competitor_codes)]);
```
- Any manufacturer in `COMPETITOR_BRANDS` Set → goes to `competitor_codes` response field
- Everything else → goes to `oem_codes` response field

**This means:** The DB columns are not reliable for classification. The API response IS reliable.

---

## 2. CURRENT JSONB FORMAT INVENTORY

### `oem_codes` — Format Types Observed

**Format A — Standard object (most common, from scraper):**
```json
[
  {"manufacturer": "CUMMINS", "code": "3315476"},
  {"manufacturer": "CATERPILLAR", "code": "1R0716"},
  {"manufacturer": "JOHN DEERE", "code": "RE504836"}
]
```

**Format B — With partNumber field (legacy scraper variant):**
```json
[
  {"manufacturer": "VOLVO", "code": "466634", "partNumber": "466634"},
  {"manufacturer": "KOMATSU", "code": "600-211-1231", "partNumber": "600-211-1231"}
]
```

**Format C — String with pipe separator (legacy):**
```json
["CUMMINS | 3315476", "CAT | 1R0716"]
```
Found in older records, handled by `parseRefs()` fallback:
```javascript
const code = parts.length >= 2 ? parts.slice(1).join(':').trim() : ref.trim();
const brand = parts.length >= 2 ? parts[0].trim() : '';
```

**Format D — Competitor brands mixed in (post-consolidation):**
After the consolidation migration, oem_codes may also contain:
```json
[
  {"manufacturer": "DONALDSON", "code": "P552100"},
  {"manufacturer": "FLEETGUARD", "code": "LF670"},
  {"manufacturer": "CUMMINS", "code": "3315476"}
]
```
The `buildFilterData()` re-classifier handles this at query time.

---

### `competitor_codes` — Format Types Observed

**Format A — Standard (from recover script):**
```json
[
  {"manufacturer": "BALDWIN", "code": "BT292"},
  {"manufacturer": "FLEETGUARD", "code": "LF3349"},
  {"manufacturer": "MANN", "code": "W940/25"}
]
```

**Format B — From oilfilter-crossreference.com parser:**
```json
[
  {"manufacturer": "WIX", "code": "51516"},
  {"manufacturer": "FRAM", "code": "PH3593A"},
  {"manufacturer": "PUROLATOR", "code": "L14459"}
]
```

**Format C — Null/empty (pre-recover-script):**
```json
null  OR  []
```
Many products still have `competitor_codes = []` because the recovery script was not run for all P-codes.

---

### `brand_crossrefs` — Format

Object keyed by brand slug:
```json
{
  "DONALDSON": ["P552100"],
  "MANN": ["W940/25"],
  "FLEETGUARD": ["LF670"],
  "LUBER-FINER": ["LFP8955"]
}
```
**Source:** `add-cross-ref.js` script. Less consistently populated than oem_codes/competitor_codes.
**API consumer:** results.html does NOT use `brand_crossrefs` directly for display — uses oem_codes/competitor_codes. `brand_crossrefs` is passed through but not rendered.

---

### `alternatives` — Format

**Format A — ELIMFILTERS SKUs (post-resolve-alternatives.js):**
```json
["EL82100", "EL81016"]
```

**Format B — P-codes before migration:**
```json
["P552100", "P551016"]
```
The `resolve-alternatives.js` script was created to migrate all P-codes to EL-SKUs.
`enrichAlternatives()` resolves any remaining P-codes at query time.

---

### `equipment_applications` — Format

**Standard format (from scraper):**
```json
[
  {
    "equipment": "CUMMINS ISX 15.0L",
    "engine": "ISX 15.0L",
    "year": "2010-2020",
    "type": "On-Highway"
  },
  {
    "equipment": "JOHN DEERE 6R 4024",
    "model": "6R 4024",
    "machine": "Tractor"
  }
]
```

**Consumer fields in results.html (lines 1209–1213):**
```javascript
const fullName = a.equipment || a.model || a.machine || '';
let eng = a.engine || '';
const yearType = [a.year, a.type].filter(Boolean).join(' · ');
```

**Format variants observed:**
- `{equipment, engine, year, type}` — standard
- `{model, machine}` — alternate
- `{equipment}` — minimal
- String fallback: `"CUMMINS ISX 2010-2020"` — handled as plain string

---

### `description` — Format

**Format A — Plain text:**
```
"ELIMFILTERS® Air Filter, Primary — Radial Seal..."
```

**Format B — JSONB multilingual object:**
```json
{"en": "ELIMFILTERS® Air Filter...", "es": "ELIMFILTERS® Filtro de aire..."}
```
Handled by `extractText(val, lang)` at line 611.

---

### `filter_type` — Format

**Format A — Plain string (most products):**
```
"Air Filter"
"Lube Filter"
"Hydraulic Filter"
```

**Format B — JSONB multilingual (some products):**
```json
{"en": "Air Filter", "es": "Filtro de Aire"}
```
Handled by `extractText(val, lang)`.

---

## 3. CLASSIFICATION LOGIC (COMPETITOR_BRANDS)

The `COMPETITOR_BRANDS` Set (60+ entries) is the authoritative classifier:

**Filter brand indicators:**
```
DONALDSON, BALDWIN, FLEETGUARD, MANN, MANN+HUMMEL, MANN-HUMMEL,
WIX, FRAM, PUROLATOR, NAPA, AC DELCO, ACDELCO, BOSCH, MAHLE, HENGST,
SAKURA, HASTINGS, LUBER-FINER, LUBERFINER, PARKER, PALL, HYDAC,
MP FILTRI, MPFILTRI, UFI, CHAMPION, COOPERSFILTERS, MOTORCRAFT, KNECHT,
SOGEFI, FILTRON, SOFIMA, FIAAM, NIPPARTS, STARLINE, CHAMPION LABS,
CARQUEST, PRONTO, EUROPART, DINEX, TRUCKTEC, FEBI, SWAG, MEYLE, VALEO,
ELOFIC, WABCO, KNORR, ALLISON, ZF
```

**Ambiguous brands (in Set but also equipment OEMs):**
```
ATLAS COPCO, SULLAIR, INGERSOLL RAND, COMPAIR, GARDNER DENVER, QUINCY,
LEROI, KOBELCO COMPRESSORS  → Compressor equipment makers, also sell filters
DEFENSE, PENNZOIL, CASTROL, MOBIL, SHELL, TOTAL  → Oil brands
DENSO  → Parts/electronics brand
TISCO, TRACTORPARTS, AGCO  → Tractor parts dealers
```

**Fallback rule:** `m.includes('FILTER') || m.includes('FILTR') || m.includes('FILTRO')`
This catches: "HIFI FILTER", "FILTRONIC", "KELTEC FILTROS", etc.

---

## 4. NORMALIZATION STRATEGY FOR KG

### Step 1 — Create kg_filter_brands from COMPETITOR_BRANDS Set
Seed table directly from the Set. Each brand gets slug + brand_type.

### Step 2 — Create kg_crossrefs table (relational replacement)
```
(product_sku, brand_id, part_number, ref_type, verified, source)
```
WHERE ref_type IN ('OEM_EQUIPMENT', 'COMPETITOR_FILTER')

### Step 3 — Migration query approach
```sql
-- For each product, call buildFilterData() equivalent logic in SQL:
INSERT INTO kg_crossrefs (product_sku, brand_id, part_number, ref_type)
SELECT 
  ec.sku,
  kb.id,
  UPPER(TRIM(elem->>'code')) as part_number,
  CASE WHEN kb.brand_type = 'COMPETITOR' THEN 'COMPETITOR_FILTER' ELSE 'OEM_EQUIPMENT' END
FROM elimfilters_catalog ec,
     jsonb_array_elements(
       COALESCE(ec.oem_codes, '[]'::jsonb) || COALESCE(ec.competitor_codes, '[]'::jsonb)
     ) as elem
JOIN kg_filter_brands kb ON UPPER(TRIM(elem->>'manufacturer')) = UPPER(kb.name)
WHERE elem->>'code' IS NOT NULL;
```

### Step 4 — Equipment makes that are NOT filter brands
Any manufacturer NOT in kg_filter_brands → classified as equipment OEM → seed kg_equipment_makes.

---

## 5. KEY RISKS FOR NORMALIZATION

| Risk | Severity | Description |
|------|----------|-------------|
| Mixed formats | HIGH | 4 different JSONB formats in oem_codes — requires parser per format |
| Post-consolidation contamination | HIGH | oem_codes contains filter brands after Stage 2 migration |
| Empty competitor_codes | MEDIUM | Many products never had recover script run |
| String-separator format | LOW | `"CUMMINS | 3315476"` format rarely encountered but must handle |
| brand_crossrefs inconsistency | LOW | Not all products have brand_crossrefs; those that do may have different key casing |
| Ambiguous brands | MEDIUM | ATLAS COPCO, DENSO could be equipment OEM or filter brand depending on context |

---

## 6. BACKWARD COMPATIBILITY CONSTRAINT

**MANDATORY:** The JSONB columns `oem_codes` and `competitor_codes` in `elimfilters_catalog` must NOT be emptied during KG migration.

**Reason:** `buildFilterData()` reads from these columns for all 3 production search endpoints. If these columns are cleared before the KG endpoints are deployed and tested, Part Search breaks.

**Migration order:**
1. Create kg_crossrefs (additive)
2. Populate kg_crossrefs from JSONB (migration script)
3. Verify kg_crossrefs accuracy (compare with JSONB-derived output)
4. Switch API to read from kg_crossrefs (Phase 7+)
5. Keep JSONB as backup indefinitely (cheap storage, high safety)
