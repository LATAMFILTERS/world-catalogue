# EQUIPMENT_NORMALIZATION_REPORT.md
# ELIMFILTERS — Equipment Applications JSONB Analysis
# KG Phase 0 Readiness Audit

> ⚠️ Live DB not accessible from local environment.
> Run queries on Render Shell or via `/api/audit/report` endpoint.
> Report below is based on: code analysis, audit-catalog.js logic, scraper output format.

---

## JSONB FIELD STRUCTURE

Equipment applications are stored in `equipment_applications` JSONB column.
Each element can have these fields (not all always present):

```json
{
  "equipment": "CUMMINS ISX 15.0L",   // Full equipment name (most common)
  "model":     "ISX 15.0L",           // Alternate model field
  "machine":   "On-Highway Truck",    // Equipment category
  "engine":    "ISX 15.0L",          // Engine designation
  "year":      "2010-2020",           // Year range
  "type":      "On-Highway"           // Application type
}
```

**results.html parser logic** (the canonical consumer):
```javascript
const fullName = a.equipment || a.model || a.machine || '';
let eng = a.engine || '';
const yearType = [a.year, a.type].filter(Boolean).join(' · ');
```

**String fallback** (some entries are plain strings, not objects):
```javascript
const simpleStr = String(a);  // "CUMMINS ISX 2010-2020"
```

---

## MANUFACTURER NORMALIZATION CANDIDATES

Based on the EQUIPMENT_MAKERS list in audit-catalog.js and known equipment brands
from JSONB entries across the catalog:

### Tier 1 — Major OEM Equipment Manufacturers

| Raw name variants | Proposed slug | Count (est.) |
|-------------------|--------------|--------------|
| CUMMINS, Cummins, Cummins Inc. | `cummins` | ~2000+ |
| CATERPILLAR, CAT, Cat, Caterpillar Inc. | `caterpillar` | ~1500+ |
| JOHN DEERE, John Deere, JOHNDEERE, JD | `john-deere` | ~800+ |
| VOLVO, Volvo Trucks, VOLVO TRUCKS | `volvo` | ~600+ |
| KOMATSU, Komatsu Ltd. | `komatsu` | ~400+ |
| KENWORTH, Kenworth Truck | `kenworth` | ~300+ |
| PETERBILT, Peterbilt Motors | `peterbilt` | ~300+ |
| FREIGHTLINER, Freightliner LLC | `freightliner` | ~300+ |
| MACK, Mack Trucks | `mack` | ~250+ |
| MERCEDES-BENZ, Mercedes Benz, MERCEDES | `mercedes-benz` | ~200+ |

### Tier 2 — Construction & Mining Equipment

| Raw name variants | Proposed slug | Count (est.) |
|-------------------|--------------|--------------|
| LIEBHERR, Liebherr Group | `liebherr` | ~150+ |
| CASE, Case IH, CASE IH | `case` | ~200+ |
| NEW HOLLAND, New Holland Agriculture | `new-holland` | ~200+ |
| JCB, J.C. Bamford Excavators | `jcb` | ~150+ |
| HITACHI, Hitachi Construction | `hitachi` | ~150+ |
| DOOSAN, Doosan Infracore | `doosan` | ~100+ |
| KOBELCO, Kobelco Construction | `kobelco` | ~100+ |
| HYUNDAI, Hyundai Construction Equip. | `hyundai` | ~150+ |
| INTERNATIONAL, International Harvester, NAVISTAR | `navistar` | ~200+ |

### Tier 3 — Agriculture Equipment

| Raw name variants | Proposed slug | Count (est.) |
|-------------------|--------------|--------------|
| FENDT, Fendt GmbH | `fendt` | ~100+ |
| CLAAS, CLAAS KGaA | `claas` | ~100+ |
| MASSEY FERGUSON, Massey Ferguson, MF | `massey-ferguson` | ~150+ |
| DEUTZ, Deutz AG, DEUTZ-FAHR | `deutz` | ~100+ |
| SAME, SAME Deutz-Fahr | `same` | ~50+ |
| KUBOTA, Kubota Corporation | `kubota` | ~150+ |
| YANMAR, Yanmar Co. | `yanmar` | ~100+ |

### Tier 4 — Engine Manufacturers (appear in equipment context)

| Raw name variants | Proposed slug | Count (est.) |
|-------------------|--------------|--------------|
| PERKINS, Perkins Engines | `perkins` | ~200+ |
| DETROIT, Detroit Diesel | `detroit` | ~150+ |
| ISUZU, Isuzu Motors | `isuzu` | ~150+ |
| HINO, Hino Motors | `hino` | ~100+ |
| MITSUBISHI, Mitsubishi Motors | `mitsubishi` | ~100+ |
| FORD, Ford Motor Company | `ford` | ~200+ |

### Tier 5 — Marine & Power Equipment

| Raw name variants | Proposed slug | Count (est.) |
|-------------------|--------------|--------------|
| MTU, MTU Friedrichshafen | `mtu` | ~50+ |
| BAUDOUIN | `baudouin` | ~30+ |
| SCANIA | `scania` | ~100+ |
| DAF | `daf` | ~100+ |
| IVECO | `iveco` | ~100+ |
| MAN, MAN Truck & Bus | `man` | ~100+ |

---

## NORMALIZATION CHALLENGES

### Challenge 1 — "CUMMINS" vs "Cummins" vs "Cummins Inc."
Most critical. Cummins is the most common make.
**Strategy:** Uppercase → trim → map via normalization table.

### Challenge 2 — Model name inconsistency
Same engine appears as: "ISX", "ISX 15.0L", "ISX15", "Cummins ISX 15.0L"
**Challenge:** `equipment` field often includes make name (e.g., "CUMMINS ISX")
When split: first word = make, rest = model — BUT not always accurate.
Example: "JOHN DEERE 6R 4024" → make="JOHN", model="DEERE 6R 4024" WRONG.
Needs special handling for multi-word makes.

**Multi-word makes to handle specially:**
```
JOHN DEERE, CASE IH, NEW HOLLAND, MASSEY FERGUSON, MANN+HUMMEL,
MERCEDES-BENZ, ATLAS COPCO, INGERSOLL RAND, GARDNER DENVER
```

### Challenge 3 — Machine vs. Equipment field
Some entries: `{"machine": "Tractor", "model": "6090"}` — machine is category, model is the actual model.
Others: `{"equipment": "JOHN DEERE 6090"}` — equipment is full name.
Both need to resolve to the same kg_equipment_models row.

### Challenge 4 — Engine vs. Equipment
Some products have engine entries that are standalone engines, not complete equipment:
```json
{"equipment": "Cummins ISX 15.0L Engine"}
```
This should map to: make=cummins, model="ISX 15.0L"

### Challenge 5 — Year format inconsistency
- "2010-2020" → range
- "2015" → single year
- "All Years" → null range
- null → unknown

---

## NORMALIZATION STRATEGY

### Phase A — Extract and Inventory (MANDATORY before migration)
```sql
SELECT DISTINCT 
  UPPER(TRIM(elem->>'manufacturer')) as make_raw,
  COUNT(*) as cnt
FROM elimfilters_catalog,
  jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb)) AS elem
WHERE elem->>'manufacturer' IS NOT NULL
GROUP BY make_raw
ORDER BY cnt DESC;
```
Expected: ~50-80 distinct raw manufacturer values.

Also extract the `equipment` field first word:
```sql
SELECT DISTINCT 
  UPPER(SPLIT_PART(TRIM(elem->>'equipment'), ' ', 1)) as make_word,
  COUNT(*) as cnt
FROM elimfilters_catalog,
  jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb)) AS elem
WHERE elem->>'equipment' IS NOT NULL AND elem->>'manufacturer' IS NULL
GROUP BY make_word
ORDER BY cnt DESC;
```

### Phase B — Manual Normalization Table
Create a CSV mapping: `raw_name → kg_equipment_makes.slug`
This is the ONLY part that requires human judgment. Takes ~2 hours.

```csv
raw_name,normalized_slug,display_name
CUMMINS,cummins,Cummins Inc.
Cummins,cummins,Cummins Inc.
CATERPILLAR,caterpillar,Caterpillar Inc.
CAT,caterpillar,Caterpillar Inc.
JOHN DEERE,john-deere,John Deere
John Deere,john-deere,John Deere
...
```

### Phase C — Migration Script (dry-run first)
```javascript
// Parse equipment_applications JSONB → kg_product_equipment
// WITH kg_equipment_models.slug deduplication
// Source preserved in elimfilters_catalog.equipment_applications (JSONB backup)
```

---

## INDUSTRY DERIVATION LOGIC

From equipment make → industry:

```
cummins           → construction, mining, marine, power-generation, agriculture
caterpillar       → construction, mining
john-deere        → agriculture, construction
komatsu           → construction, mining
kenworth          → automotive (transport)
peterbilt         → automotive (transport)
freightliner      → automotive (transport)
mack              → automotive (transport)
volvo             → automotive, construction
liebherr          → construction, mining
case              → agriculture, construction
new-holland       → agriculture
massey-ferguson   → agriculture
kubota            → agriculture
yanmar            → marine, agriculture
perkins           → agriculture, construction, marine
```

This mapping seeds `kg_product_industries` derived from equipment data.

---

## SCRAPER STATUS (as of session date)

From `scrape_equipment.py` output observed:
- **Products in scrape queue: ~1,996** (as of last known run)
- **Products processed per session: ~350** (limited by token/time)
- **Scrape rate: ~4-8 seconds per product**
- **Estimated completion: ~4-6 hours of uninterrupted scraping**

The scraper writes directly to `equipment_applications` JSONB column.
**KG Action needed:** After KG Phase 3, update scraper to also write to `kg_product_equipment`.

---

## SUMMARY

| Metric | Value |
|--------|-------|
| Total products with equipment data | ~2,000-2,500 (estimate) |
| Total unique equipment makes (raw) | ~50-80 |
| Total unique equipment models (raw) | ~500-1000+ |
| Products still needing equipment scrape | ~1,500-2,000 |
| Normalization effort (manual) | ~2 hours |
| Migration script effort | ~4-6 hours |
| Risk level | MEDIUM-HIGH (format inconsistency) |
