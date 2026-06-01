# API_CONTRACT_REPORT.md
# ELIMFILTERS — Frontend API Contract
# KG Phase 0 Readiness Audit

**Sources:** `part-search/index.html`, `part-search/results.html`, `server.js`
**Security constraint:** `codigo_base` is INTERNAL — must NEVER appear in any API response.

---

## 1. ENDPOINTS CONSUMED BY FRONTEND

### 1.1 `/api/search?q={query}&lang={lang}`
**Consumers:** index.html (line 1285), results.html (line 1312)

**Request:**
```
GET /api/search?q=EL5000&lang=en
```

**Response contract (MUST NOT CHANGE):**
```json
{
  "products": [ /* array of product objects */ ],
  "count": 42,
  "total_catalog": 4622
}
```

- `data.products` — array access `data.products?.length`
- `data.count` — shown in results header
- `data.total_catalog` — shown in UI as catalog size reference

---

### 1.2 `/api/filters/search/vin?model={model}&engine={engine}&lang={lang}`
**Consumers:** index.html (line 1298), results.html (line 1337)

**Request:**
```
GET /api/filters/search/vin?model=VOLVO%20FH16&engine=16L&lang=es
```

**Response contract (MUST NOT CHANGE):**
```json
{
  "filters": [ /* array of product objects */ ]
}
```

- `data.filters` — array access `data.filters?.length`
- Renders via same `renderCard(p)` function as part search

---

### 1.3 `/api/filters/search/equipment?model={model}&type={type}&engine={engine}&lang={lang}`
**Consumers:** index.html (line 1313), results.html (line 1349)

**Request:**
```
GET /api/filters/search/equipment?model=CUMMINS%20ISX&type=engine&engine=15L
```

**Response contract (MUST NOT CHANGE):**
```json
{
  "filters": [ /* array of product objects */ ]
}
```

---

### 1.4 `/api/autocomplete?q={query}`
**Consumers:** index.html (line 1461), results.html (line ~1460)

**Response contract (MUST NOT CHANGE):**
```json
[
  { "code": "EL5000", "type": "EL SKU" },
  { "code": "P552100", "type": "OEM Code" },
  { "code": "LF3000", "type": "Cross Reference" }
]
```

**Security rule:** `codigo_base` (internal Donaldson P-code) MUST NOT appear in autocomplete suggestions. ✅ Fixed (commit 09ffd46e).

---

### 1.5 `/api/status`
**Consumer:** index.html (line 971) — background health ping only
**Response:** Any 200 OK response accepted. No field contract.

---

## 2. PRODUCT OBJECT SCHEMA — ZERO-BREAKAGE CONTRACT

Both `index.html` and `results.html` consume the same product object structure via `renderCard(p)`.

### MANDATORY FIELDS (UI breaks if missing or renamed)

| Field | Type | Used By | Example |
|-------|------|---------|---------|
| `elimfilters_sku` OR `sku` | string | `p.elimfilters_sku \|\| p.sku` | `"EL5000"` |
| `filter_type` | string | badge display | `"Air Filter"` |
| `oem_codes` | array | OEM references column | `[{manufacturer:"CUMMINS", code:"P552100"}]` |
| `competitor_codes` | array | Cross-reference column | `[{manufacturer:"DONALDSON", code:"P182068"}]` |
| `equipment_applications` | array | Equipment column | `[{equipment:"CUMMINS ISX 15.0L", year:"2010-2020"}]` |

### STRONGLY EXPECTED FIELDS (shown if present, silently omitted if null)

| Field | Type | Used By | Example |
|-------|------|---------|---------|
| `description` | string OR `{en:"...",es:"..."}` JSONB | card description | `"High capacity lube filter..."` |
| `filter_subtype` | string | badge display | `"Spin-On"` |
| `installation_type` | string | badge display | `"Spin-On"` |
| `duty` | string | badge display (uppercased) | `"HEAVY"` |
| `technology` | string | badge + link to `/technologies/[slug]/` | `"SYNTRAX™"` |
| `outer_diameter_mm` | number | dimension specs | `108.0` |
| `thread_size` | string | dimension specs | `"M20x1.5"` |
| `height_mm` | number | dimension specs | `140.0` |
| `gasket_od_mm` | number | dimension specs | `65.0` |
| `gasket_id_mm` | number | dimension specs | `52.0` |
| `nominal_efficiency` | string | performance specs | `"99.9%"` or `"10 micron"` |
| `micron_rating` | string/number | performance specs | `"10"` or `"n/a"` |
| `iso_test_method` | string | performance specs | `"ISO 16889"` |
| `burst_pressure_psi` | number | performance specs | `145` |
| `collapse_pressure_psi` | number | performance specs | `120` |
| `alternatives` | array | "See Also" chips | `[{sku:"EL5001"}, "EL5002"]` |

### NEVER INCLUDE (security constraint — permanent rule)

```
❌ codigo_base     — internal Donaldson P-code, NEVER expose
❌ BASE            — synonym for codigo_base
❌ MATCHED BY      — internal sourcing indicator
```

---

## 3. FIELD-LEVEL FORMAT CONTRACTS

### `oem_codes` / `competitor_codes` Expected Formats

Both fields are consumed by `fmtRefs()` / `splitCrossReferences()` functions.
Accepted formats (both files handle both formats):

```javascript
// Object format (preferred)
[{ manufacturer: "CUMMINS", code: "P552100" }]
[{ manufacturer: "DONALDSON", code: "P182068" }]

// String format (fallback, still works)
["CUMMINS P552100", "DONALDSON P182068"]

// Alternate key names (handled in index.html fmtRefs):
{ partNumber: "P552100" }  // alias for code
```

**KG Migration Rule:** When KG produces cross-reference data, ALWAYS emit the object format `{manufacturer, code}`. Never emit the string format for new data.

---

### `equipment_applications` Expected Formats

Consumed by `renderCard()` equipment section. Accepted formats:

```javascript
// Object format (preferred - results.html lines 1209-1229)
{
  equipment: "CUMMINS ISX 15.0L",   // Full equipment name
  model:     "ISX 15.0L",           // Alternate
  machine:   "On-Highway Truck",    // Category fallback
  engine:    "ISX 15.0L",          // Engine designation
  year:      "2010-2020",          // Year range
  type:      "On-Highway"          // App type
}

// String format (fallback - results.html line 1233)
"CUMMINS ISX 15.0L"
```

Field resolution order: `equipment || model || machine || ''`
Engine field clean: strips leading `"- "` prefix.

---

### `description` Expected Formats

Consumed by `parseDesc()` in both files:

```javascript
// String (most common)
"High capacity lube filter for heavy-duty engines"

// Bilingual JSONB object
{ "en": "High capacity lube filter", "es": "Filtro de aceite de alta capacidad" }

// JSONB as string (edge case handled)
'{"en": "High capacity lube filter", "es": "..."}'
```

**Language resolution:** `p.description[currentLang] || p.description.en || p.description.es`

---

### `alternatives` Expected Formats

```javascript
// Object format (enriched by enrichAlternatives())
{ sku: "EL5001", description: "...", oem_codes: [...] }

// Code-only format
{ code: "EL5001" }

// String format (legacy)
"EL5001"
```

Field resolution: `a.sku || a.code || String(a)`

---

### `technology` Badge Behavior (results.html line 1157)

```javascript
// Technology badge links to technology page:
href = `https://elimfilters.com/technologies/${p.technology.replace(/[™®\s]/g, '').toLowerCase()}/`
```

**KG Rule:** `kg_technologies.slug` must match the result of `.replace(/[™®\s]/g, '').toLowerCase()` applied to the DB technology value.

| DB Value | Resulting URL slug |
|----------|-------------------|
| `SYNTRAX™` | `syntrax` |
| `MACROCORE™` | `macrocore` |
| `NANOFORCE™` | `nanoforce` |
| `SYNTEPORE™` | `syntepore` |
| `MICROKAPPA™` | `microkappa` |

---

## 4. SEARCH RESPONSE WRAPPERS

### Part Search Response Wrapper
```json
{
  "products": [...],    // MANDATORY key — used in data.products?.length
  "count": 42,          // MANDATORY — shown in results header
  "total_catalog": 4622 // MANDATORY — shown as "X of 4,622 products"
}
```

### VIN / Equipment Search Response Wrapper
```json
{
  "filters": [...]  // MANDATORY key — used in data.filters?.length
}
```

**CRITICAL:** Changing `products` → anything else, or `filters` → anything else, BREAKS both frontend files immediately with zero fallback.

---

## 5. AUTOCOMPLETE CONTRACT

**Endpoint:** `GET /api/autocomplete?q={3+ chars}`

**Response:**
```json
[
  { "code": "EL5000",   "type": "EL SKU" },
  { "code": "P552100",  "type": "OEM Code" },
  { "code": "LF3000",   "type": "Cross Reference" }
]
```

**Rendering (results.html):**
```javascript
// Shows: [type] code
// e.g.: "[EL SKU] EL5000"
```

**Allowed `type` values in use:**
- `"EL SKU"` — ELIMFILTERS catalog SKU
- `"OEM Code"` — original equipment manufacturer code
- `"Cross Reference"` — competitor/aftermarket cross reference

**Security rule:** `codigo_base` must NEVER appear as a `code` value. ✅ Fixed.

---

## 6. TECHNOLOGY LINK CONTRACT

Technology badges in results.html link to:
```
https://elimfilters.com/technologies/[tech-slug]/
```

Where `tech-slug` = `technology_value.replace(/[™®\s]/g, '').toLowerCase()`

**Required technology pages that must exist at those URLs:**
```
/technologies/macrocore/
/technologies/nanoforce/
/technologies/syntrax/
/technologies/duratech/
/technologies/aquaguard/
/technologies/microkappa/
/technologies/intekcore/
/technologies/drycore/
/technologies/gasultra/
/technologies/syntepore/
/technologies/cooltech/
/technologies/marineclean/
/technologies/blueclean/
```

If a technology page doesn't exist, the badge link returns 404.
**KG Action:** When adding new technologies to the catalog, verify the technology page exists at the World Catalogue frontend.

---

## 7. EXTERNAL API DEPENDENCIES

| API | Used By | Purpose | Failure Mode |
|-----|---------|---------|-------------|
| `https://ipapi.co/json/` | Both files (line 885/864) | Detect user country for language | Silent fail → default lang used |
| `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{vin}` | results.html (line 1289) | Decode 17-char VIN | Silent fail → search proceeds without decode |

---

## 8. ZERO-BREAKAGE MIGRATION RULES

When migrating from `elimfilters_catalog` to KG-backed data sources:

### MUST KEEP (cannot change without frontend code update)
1. Response wrapper keys: `products`, `filters`, `count`, `total_catalog`
2. Product field names: all fields in Section 2 tables above
3. `oem_codes` and `competitor_codes` as separate arrays (not merged)
4. `equipment_applications` as array (not object map)
5. `alternatives` as array of sku-resolvable references

### CAN EXTEND (backward compatible)
- Add new fields to product objects (frontend ignores unknown fields)
- Add new response envelope fields alongside existing ones
- Add new `type` values to autocomplete (rendered generically)

### MUST NEVER ADD
- `codigo_base` in any response
- `BASE` code exposure
- Internal `MATCHED_BY` annotations

---

## 9. MIGRATION IMPACT MATRIX

| KG Phase | Endpoints Affected | Risk Level | Notes |
|----------|-------------------|-----------|-------|
| Phase 1 (schema) | None | 🟢 LOW | No API changes |
| Phase 2 (technologies) | None | 🟢 LOW | No API changes |
| Phase 3 (products join) | `/api/search`, `/api/filters/search/*` | 🟡 MEDIUM | technology field enrichment only |
| Phase 4 (equipment) | `/api/filters/search/equipment` | 🔴 HIGH | equipment_applications format must match |
| Phase 5 (cross-refs) | `/api/search`, `/api/autocomplete` | 🔴 HIGH | oem_codes/competitor_codes format must match |
| Phase 6 (embeddings) | New endpoint `/api/kg/semantic-search` | 🟢 LOW | New endpoint, no existing breakage |
