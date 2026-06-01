# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 6: Knowledge Graph REST API
# Industrial Knowledge Graph — API Design

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — awaiting Phases 1–5 execution
**Depends on:**
- Phase 1 (kg_systems, kg_technologies, kg_product_systems, kg_product_technologies)
- Phase 2 (kg_equipment_makes, kg_equipment_models, kg_product_equipment)
- Phase 3 (kg_crossrefs / kg_product_crossrefs — normalized oem/competitor codes)
- Phase 4 (kg_canonical_blocks, kg_concept_links)

---

## SECURITY CONSTRAINT (PERMANENT — NON-NEGOTIABLE)

The following fields are INTERNAL and MUST NEVER appear in any Phase 6 endpoint response,
request parameter, error message, log output that could be user-facing, or documentation
example that is user-visible:

```
❌ codigo_base     — internal Donaldson source code
❌ BASE            — synonym for codigo_base
❌ MATCHED BY      — internal sourcing indicator
```

Every endpoint specification in this document explicitly calls out this exclusion.
All SQL queries in this document SELECT only by product_sku or sku — NEVER by codigo_base.

---

## EXISTING API CONTRACT (IMMUTABLE)

Phase 6 adds new routes. It NEVER modifies existing routes.
The following contracts must remain byte-for-byte identical:

| Endpoint | Contract |
|----------|---------|
| GET /api/search | `{products:[], count:N, total_catalog:N}` |
| GET /api/filters/search/vin | `{filters:[]}` |
| GET /api/filters/search/equipment | `{filters:[]}` |
| GET /api/autocomplete | `[{code, type}]` |
| All product objects | All fields in API_CONTRACT_REPORT.md Section 2 |

Phase 6 endpoints are in a completely separate namespace: `/api/kg/*`
They share the database connection pool but touch only kg_* tables.

---

## 1. ROUTE FILE AND REGISTRATION

### File Path
```
routes/knowledge.routes.js
```
(Referenced in server.js since Phase 0 audit — the file stub already exists as a dummy router.)

### Registration in server.js

The server.js already loads knowledge.routes.js with fallback:

```javascript
// This code ALREADY EXISTS in server.js (lines 73-83):
let knowledgeRoutes;
try {
  knowledgeRoutes = require('./routes/knowledge.routes');
} catch (err) {
  // ... dummy fallback ...
}
```

The mount point must be added AFTER the existing `require()` block and
BEFORE the first `app.get('/api/...')` catalog endpoint:

```javascript
// Add this line in server.js — Phase 6 activation:
app.use('/api/kg', knowledgeRoutes);
```

**Placement rule:** Must appear after `app.use(express.json())` and before
the first production search endpoint. The existing dummy router already handles
the fallback if the file is absent.

---

## 2. GLOBAL RESPONSE FORMAT

All Phase 6 endpoints use the same envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success with pagination:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Technology 'unknown-slug' not found"
}
```

**HTTP status codes:**
- 200: success
- 400: invalid parameter (bad page number, unknown type value, etc.)
- 404: resource not found (SKU not in kg tables, slug not found)
- 500: internal server error (logged, generic message to client)

---

## 3. AUTHENTICATION AND RATE LIMITING

**Authentication:** None. All Phase 6 endpoints are read-only public APIs,
consistent with the existing catalog search endpoints.

**Rate limiting:** Inherit from existing express-rate-limit configuration in server.js.
No separate rate limit configuration needed for Phase 6 routes. The `/api/kg/*` prefix
falls under the same global rate limiter applied to `/api/*`.

---

## 4. PAGINATION STANDARD

All list endpoints support:

| Parameter | Default | Maximum | Notes |
|-----------|---------|---------|-------|
| `page` | 1 | — | 1-indexed |
| `limit` | 20 | 100 | Values above 100 are clamped to 100 |

Validation in route handler:
```javascript
const page  = Math.max(1, parseInt(req.query.page)  || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
const offset = (page - 1) * limit;
```

---

## 5. ENDPOINT SPECIFICATIONS

---

### 5.1 GET /api/kg/products/:sku

Returns the full Knowledge Graph context for one product SKU.

**HTTP Method:** GET
**Path:** `/api/kg/products/:sku`
**Auth:** None

**Path Parameters:**
| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| sku | string | YES | Case-insensitive; normalized to UPPER internally |

**Query Parameters:** None

**Security:** Response NEVER includes `codigo_base`, `BASE`, or `MATCHED BY`.
The SKU lookup uses `WHERE sku = $1` — `codigo_base` is not queried, not selected.

**SQL Approach:**

```sql
-- Query 1: Verify SKU exists in catalog
SELECT sku FROM elimfilters_catalog WHERE UPPER(sku) = $1;

-- Query 2: Technology context
SELECT
  t.slug,
  t.display_name,
  t.category,
  t.description,
  cb.definition        AS canonical_definition,
  cb.system_context    AS canonical_system_context,
  cb.failure_mechanism AS canonical_failure_mechanism,
  cb.industrial_impact AS canonical_industrial_impact,
  cb.version           AS canonical_version,
  cb.last_updated      AS canonical_last_updated,
  cb.citation_url      AS canonical_citation_url
FROM kg_product_technologies pt
JOIN kg_technologies t ON t.id = pt.technology_id
LEFT JOIN kg_canonical_blocks cb
  ON cb.concept_slug = t.slug AND cb.concept_type = 'technology'
WHERE pt.product_sku = $1;

-- Query 3: System context
SELECT
  s.slug,
  s.name,
  s.description,
  cb.definition        AS canonical_definition,
  cb.system_context    AS canonical_system_context,
  cb.version           AS canonical_version,
  cb.citation_url      AS canonical_citation_url
FROM kg_product_systems ps
JOIN kg_systems s ON s.id = ps.system_id
LEFT JOIN kg_canonical_blocks cb
  ON cb.concept_slug = s.slug AND cb.concept_type = 'system'
WHERE ps.product_sku = $1;

-- Query 4: Equipment applications
SELECT
  m.slug               AS model_slug,
  m.display_name       AS model_name,
  m.year_from,
  m.year_to,
  m.engine_type,
  mk.slug              AS make_slug,
  mk.display_name      AS make_name,
  pe.fit_type
FROM kg_product_equipment pe
JOIN kg_equipment_models m  ON m.id  = pe.model_id
JOIN kg_equipment_makes  mk ON mk.id = m.make_id
WHERE pe.product_sku = $1
ORDER BY mk.display_name, m.display_name;

-- Query 5: Cross-references  (Phase 3 table name — confirm at execution time)
-- NEVER SELECT codigo_base or BASE
SELECT
  cr.ref_type,       -- 'oem' | 'competitor' | 'brand'
  cr.manufacturer,
  cr.ref_code
FROM kg_product_crossrefs cr
WHERE cr.product_sku = $1
ORDER BY cr.ref_type, cr.manufacturer;

-- Query 6: Related products (same system + technology, limit 6)
SELECT DISTINCT
  ec.sku,
  ec.description,
  ec.filter_type,
  ec.technology
FROM elimfilters_catalog ec
JOIN kg_product_technologies pt2 ON pt2.product_sku = ec.sku
JOIN kg_product_technologies pt1 ON pt1.technology_id = pt2.technology_id
WHERE pt1.product_sku = $1
  AND ec.sku != $1
LIMIT 6;
```

**Indexes used:**
- `idx_kg_product_technologies_sku` ON kg_product_technologies(product_sku)
- `idx_kg_product_systems_sku` ON kg_product_systems(product_sku)
- `idx_kg_pe_sku` ON kg_product_equipment(product_sku)
- `uq_canonical_slug_type` ON kg_canonical_blocks(concept_slug, concept_type)

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "sku": "EL82100",
    "technology": {
      "slug": "nanoforce",
      "displayName": "NANOFORCE™",
      "category": "Hydraulic Filtration",
      "description": "High-efficiency synthetic media for hydraulic contamination control at sub-micron particle sizes.",
      "canonicalBlock": {
        "definition": "NANOFORCE™ controls hydraulic system contamination through synthetic multi-layer media targeting particles at 1µm absolute efficiency, maintaining ISO 4406 cleanliness codes at 17/15/12 or tighter.",
        "systemContext": "Hydraulic systems, proportional valve circuits, high-pressure lines where ISO 17/15/12 cleanliness is required.",
        "failureMechanism": "Particulate contamination in hydraulic fluid → abrasive wear of valve spool surfaces → spool clearance reduction → valve stiction → system response degradation → unplanned downtime.",
        "industrialImpact": "Achieving ISO 17/15/12 vs. 20/18/15 extends proportional valve service life 3–5x (5,000 hrs → 15,000–25,000 hrs). Reduces unplanned hydraulic maintenance from 1–2 per 500 hours to <0.5 per 500 hours.",
        "version": 1,
        "lastUpdated": "2026-06-01",
        "citationUrl": "/knowledge-system/technologies/nanoforce"
      }
    },
    "system": {
      "slug": "hydraulic",
      "name": "Hydraulic Systems",
      "canonicalBlock": {
        "definition": "Hydraulic filtration systems maintain ISO 4406 particle cleanliness codes in hydraulic fluid circuits to prevent abrasive wear of precision valve and pump components.",
        "systemContext": "All hydraulic circuits: mobile equipment (excavators, loaders), industrial presses, proportional valve systems, high-pressure circuits above 200 bar.",
        "version": 1,
        "citationUrl": "/knowledge-system/standards/hydraulic"
      }
    },
    "equipment": [
      {
        "makeSlug": "caterpillar",
        "makeName": "Caterpillar Inc.",
        "modelSlug": "320d",
        "modelName": "320D",
        "yearFrom": 2008,
        "yearTo": 2016,
        "engineType": "Construction",
        "fitType": null
      }
    ],
    "crossrefs": {
      "oem": [
        { "manufacturer": "CATERPILLAR", "code": "1R-0750" }
      ],
      "competitor": [
        { "manufacturer": "DONALDSON", "code": "P550750" }
      ],
      "brand": []
    },
    "relatedProducts": [
      {
        "sku": "EL82101",
        "description": "Hydraulic filter spin-on, high-pressure circuit",
        "filterType": "hydraulic",
        "technology": "NANOFORCE™"
      }
    ]
  }
}
```

**Error responses:**
```json
{ "success": false, "error": "Product SKU 'XXXXX' not found" }   // 404
```

---

### 5.2 GET /api/kg/technologies

Returns the complete list of all active filtration technologies with product counts.

**HTTP Method:** GET
**Path:** `/api/kg/technologies`
**Auth:** None

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| includeInactive | boolean | false | Pass `?includeInactive=true` to include inactive technologies |

**Security:** No restricted fields exist on kg_technologies table.

**SQL Approach:**

```sql
SELECT
  t.id,
  t.slug,
  t.display_name,
  t.category,
  s.slug          AS primary_system_slug,
  s.name          AS primary_system_name,
  t.logo_file,
  t.is_active,
  COUNT(pt.product_sku) AS product_count
FROM kg_technologies t
LEFT JOIN kg_systems s ON s.id = t.primary_system_id
LEFT JOIN kg_product_technologies pt ON pt.technology_id = t.id
WHERE ($1 = TRUE OR t.is_active = TRUE)
GROUP BY t.id, t.slug, t.display_name, t.category, s.slug, s.name, t.logo_file, t.is_active
ORDER BY t.category, t.display_name;
```

**Indexes used:**
- `idx_kg_technologies_slug` (PK covers this)
- `idx_kg_product_technologies_tech_id` ON kg_product_technologies(technology_id)

**Response Schema:**

```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "slug": "nanoforce",
      "displayName": "NANOFORCE™",
      "category": "Hydraulic Filtration",
      "primarySystem": {
        "slug": "hydraulic",
        "name": "Hydraulic Systems"
      },
      "logoFile": "/assets/logo-nanoforce.png",
      "isActive": true,
      "productCount": 1962
    },
    {
      "id": 1,
      "slug": "macrocore",
      "displayName": "MACROCORE™",
      "category": "Air Intake Filtration",
      "primarySystem": {
        "slug": "air-intake",
        "name": "Air Intake Filtration"
      },
      "logoFile": "/assets/logo-macrocore.png",
      "isActive": true,
      "productCount": 1366
    }
  ]
}
```

**Performance note:** This endpoint is a candidate for server-side caching (TTL: 1 hour).
Technologies change rarely — only when new products are added or categorized.

---

### 5.3 GET /api/kg/technologies/:slug

Returns full technology detail, its canonical block, and a paginated list of products.

**HTTP Method:** GET
**Path:** `/api/kg/technologies/:slug`
**Auth:** None

**Path Parameters:**
| Parameter | Type | Notes |
|-----------|------|-------|
| slug | string | e.g. `nanoforce`, `macrocore` — must match kg_technologies.slug |

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| page | integer | 1 | Pagination page |
| limit | integer | 20 | Max 100 |
| system | string | — | Filter products to a system slug (e.g. `?system=hydraulic`) |

**Security:** Product list excludes `codigo_base`, `BASE`. Only `sku`, `description`, `filter_type` returned for related products.

**SQL Approach:**

```sql
-- Query 1: Technology detail + canonical block
SELECT
  t.id, t.slug, t.display_name, t.category, t.description, t.logo_file, t.is_active,
  s.slug           AS primary_system_slug,
  s.name           AS primary_system_name,
  cb.definition,
  cb.system_context,
  cb.failure_mechanism,
  cb.industrial_impact,
  cb.related_standards,
  cb.related_technologies,
  cb.industrial_role,
  cb.version,
  cb.last_updated,
  cb.citation_url
FROM kg_technologies t
LEFT JOIN kg_systems s ON s.id = t.primary_system_id
LEFT JOIN kg_canonical_blocks cb
  ON cb.concept_slug = t.slug AND cb.concept_type = 'technology'
WHERE t.slug = $1;

-- Query 2: Product count for this technology (with optional system filter)
SELECT COUNT(*) AS total
FROM kg_product_technologies pt
JOIN kg_product_systems ps ON ps.product_sku = pt.product_sku
JOIN kg_systems s ON s.id = ps.system_id
JOIN kg_technologies t ON t.id = pt.technology_id
WHERE t.slug = $1
  AND ($4::text IS NULL OR s.slug = $4);

-- Query 3: Paginated product list (sku, description, filter_type only — no codigo_base)
SELECT
  ec.sku,
  ec.description,
  ec.filter_type
FROM elimfilters_catalog ec
JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
JOIN kg_technologies t ON t.id = pt.technology_id
LEFT JOIN kg_product_systems ps ON ps.product_sku = ec.sku
LEFT JOIN kg_systems s ON s.id = ps.system_id
WHERE t.slug = $1
  AND ($4::text IS NULL OR s.slug = $4)
ORDER BY ec.sku
LIMIT $2 OFFSET $3;
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "id": 6,
    "slug": "nanoforce",
    "displayName": "NANOFORCE™",
    "category": "Hydraulic Filtration",
    "description": "High-efficiency synthetic media for hydraulic contamination control.",
    "logoFile": "/assets/logo-nanoforce.png",
    "isActive": true,
    "primarySystem": {
      "slug": "hydraulic",
      "name": "Hydraulic Systems"
    },
    "canonicalBlock": {
      "definition": "NANOFORCE™ controls hydraulic system contamination through synthetic multi-layer media targeting particles at 1µm absolute efficiency.",
      "systemContext": "Hydraulic systems, proportional valve circuits, high-pressure lines.",
      "failureMechanism": "Particulate contamination → abrasive wear of valve spools → spool clearance reduction → valve stiction → unplanned downtime.",
      "industrialImpact": "Achieving ISO 17/15/12 extends proportional valve service life 3–5x (5,000 hrs → 15,000–25,000 hrs).",
      "relatedStandards": [
        { "code": "ISO 16889", "scope": "Filter element beta ratio testing and classification" },
        { "code": "ISO 4406", "scope": "Hydraulic fluid particle cleanliness code" }
      ],
      "relatedTechnologies": [
        { "slug": "syntrax", "mechanism": "Lube oil particulate capture at 18µm absolute" }
      ],
      "industrialRole": "Hydraulic filtration is the primary controllable factor in proportional valve lifespan for mobile equipment operating in dusty or wet environments.",
      "version": 1,
      "lastUpdated": "2026-06-01",
      "citationUrl": "/knowledge-system/technologies/nanoforce"
    },
    "products": [
      {
        "sku": "EL82100",
        "description": "Hydraulic filter spin-on high-pressure",
        "filterType": "hydraulic"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1962,
    "totalPages": 99
  }
}
```

---

### 5.4 GET /api/kg/systems

Returns all filtration system domains with product counts.

**HTTP Method:** GET
**Path:** `/api/kg/systems`
**Auth:** None

**Query Parameters:** None

**SQL Approach:**

```sql
SELECT
  s.id,
  s.slug,
  s.name,
  s.description,
  s.sort_order,
  COUNT(ps.product_sku) AS product_count
FROM kg_systems s
LEFT JOIN kg_product_systems ps ON ps.system_id = s.id
GROUP BY s.id, s.slug, s.name, s.description, s.sort_order
ORDER BY s.sort_order, s.name;
```

**Response Schema:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "air-intake",
      "name": "Air Intake Filtration",
      "description": "Filtration of combustion air entering diesel and gas engines, targeting dust, pollen, and particulate contamination.",
      "sortOrder": 1,
      "productCount": 1609
    },
    {
      "id": 4,
      "slug": "lube-oil",
      "name": "Lube / Oil Filtration",
      "description": "Engine oil cleanliness maintenance through multi-stage filtration targeting wear particles and soot.",
      "sortOrder": 2,
      "productCount": 410
    },
    {
      "id": 3,
      "slug": "hydraulic",
      "name": "Hydraulic Systems",
      "description": "Hydraulic fluid particle control for mobile and industrial hydraulic circuits.",
      "sortOrder": 3,
      "productCount": 1962
    },
    {
      "id": 2,
      "slug": "fuel",
      "name": "Fuel Filtration",
      "description": "Diesel fuel water separation and particle removal for fuel injection systems.",
      "sortOrder": 4,
      "productCount": 516
    },
    {
      "id": 5,
      "slug": "cabin",
      "name": "Cabin / Operator Safety",
      "description": "Cabin air quality control for operator health and PM10 protection in dusty environments.",
      "sortOrder": 5,
      "productCount": 122
    },
    {
      "id": 6,
      "slug": "compressed-air",
      "name": "Compressed Air Systems",
      "description": "Compressed air purity class control for pneumatic tools and breathing air systems.",
      "sortOrder": 6,
      "productCount": 3
    }
  ]
}
```

**Performance note:** Candidate for caching (TTL: 1 hour). Systems change only when new domains are added.

---

### 5.5 GET /api/kg/systems/:slug

Returns system detail, its canonical block, linked technologies, and paginated products.

**HTTP Method:** GET
**Path:** `/api/kg/systems/:slug`
**Auth:** None

**Path Parameters:**
| Parameter | Type | Notes |
|-----------|------|-------|
| slug | string | e.g. `hydraulic`, `lube-oil`, `air-intake` |

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| page | integer | 1 | |
| limit | integer | 20 | Max 100 |
| technology | string | — | Filter to a technology slug (e.g. `?technology=nanoforce`) |

**Security:** Product list returns only `sku`, `description`, `filter_type`, `technology` — no `codigo_base`.

**SQL Approach:**

```sql
-- Query 1: System detail + canonical block
SELECT
  s.id, s.slug, s.name, s.description, s.sort_order,
  cb.definition,
  cb.system_context,
  cb.failure_mechanism,
  cb.industrial_impact,
  cb.related_standards,
  cb.related_technologies,
  cb.industrial_role,
  cb.version,
  cb.last_updated,
  cb.citation_url
FROM kg_systems s
LEFT JOIN kg_canonical_blocks cb
  ON cb.concept_slug = s.slug AND cb.concept_type = 'system'
WHERE s.slug = $1;

-- Query 2: Technologies used in this system
SELECT
  t.id, t.slug, t.display_name, t.category, t.logo_file,
  COUNT(pt.product_sku) AS product_count
FROM kg_technologies t
JOIN kg_product_technologies pt ON pt.technology_id = t.id
JOIN kg_product_systems ps ON ps.product_sku = pt.product_sku
WHERE ps.system_id = (SELECT id FROM kg_systems WHERE slug = $1)
GROUP BY t.id, t.slug, t.display_name, t.category, t.logo_file
ORDER BY COUNT(pt.product_sku) DESC;

-- Query 3: Product count (with optional technology filter)
SELECT COUNT(*) AS total
FROM kg_product_systems ps
JOIN kg_systems s ON s.id = ps.system_id
LEFT JOIN kg_product_technologies pt ON pt.product_sku = ps.product_sku
LEFT JOIN kg_technologies t ON t.id = pt.technology_id
WHERE s.slug = $1
  AND ($4::text IS NULL OR t.slug = $4);

-- Query 4: Paginated products (no codigo_base in SELECT)
SELECT
  ec.sku,
  ec.description,
  ec.filter_type,
  ec.technology
FROM elimfilters_catalog ec
JOIN kg_product_systems ps ON ps.product_sku = ec.sku
JOIN kg_systems s ON s.id = ps.system_id
LEFT JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
LEFT JOIN kg_technologies t ON t.id = pt.technology_id
WHERE s.slug = $1
  AND ($4::text IS NULL OR t.slug = $4)
ORDER BY ec.sku
LIMIT $2 OFFSET $3;
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "slug": "hydraulic",
    "name": "Hydraulic Systems",
    "description": "Hydraulic fluid particle control for mobile and industrial hydraulic circuits.",
    "sortOrder": 3,
    "canonicalBlock": {
      "definition": "Hydraulic filtration systems maintain ISO 4406 particle cleanliness codes to prevent abrasive wear of precision valve and pump components.",
      "systemContext": "All hydraulic circuits: mobile equipment, industrial presses, proportional valve systems, circuits above 200 bar.",
      "failureMechanism": "Particle contamination exceeds cleanliness target → abrasive wear of valve spool surfaces → proportional valve stiction → equipment response failure.",
      "industrialImpact": "ISO 17/15/12 extends valve life 3–5x. Poor control (20/18/15) increases unplanned hydraulic maintenance to 1–2 events per 500 operating hours.",
      "relatedStandards": [
        { "code": "ISO 16889", "scope": "Filter beta ratio testing" },
        { "code": "ISO 4406", "scope": "Hydraulic fluid particle cleanliness codes" },
        { "code": "NFPA T2.14", "scope": "Hydraulic system cleanliness requirements" },
        { "code": "DIN 51524", "scope": "Hydraulic oil specification standards" }
      ],
      "relatedTechnologies": [
        { "slug": "nanoforce", "mechanism": "Sub-micron particulate capture, 1µm absolute" }
      ],
      "industrialRole": "Hydraulic system contamination control is the single largest preventable cause of mobile equipment downtime in construction and mining industries.",
      "version": 1,
      "lastUpdated": "2026-06-01",
      "citationUrl": "/knowledge-system/standards/hydraulic"
    },
    "technologies": [
      {
        "id": 6,
        "slug": "nanoforce",
        "displayName": "NANOFORCE™",
        "category": "Hydraulic Filtration",
        "logoFile": "/assets/logo-nanoforce.png",
        "productCount": 1962
      }
    ],
    "products": [
      {
        "sku": "EL82100",
        "description": "Hydraulic filter spin-on high-pressure",
        "filterType": "hydraulic",
        "technology": "NANOFORCE™"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1962,
    "totalPages": 99
  }
}
```

---

### 5.6 GET /api/kg/canonical/:type/:slug

Returns one canonical block by concept type and slug.

**HTTP Method:** GET
**Path:** `/api/kg/canonical/:type/:slug`
**Auth:** None

**Path Parameters:**
| Parameter | Type | Valid values | Notes |
|-----------|------|-------------|-------|
| type | string | `technology`, `system`, `contamination_mode`, `standard`, `industry` | Must match `kg_canonical_blocks.concept_type` CHECK constraint |
| slug | string | e.g. `nanoforce`, `hydraulic`, `particle-wear` | Must match `kg_canonical_blocks.concept_slug` |

**Query Parameters:** None

**SQL Approach:**

```sql
SELECT
  id,
  concept_slug,
  concept_type,
  display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  version,
  last_updated,
  citation_url,
  created_at,
  updated_at
FROM kg_canonical_blocks
WHERE concept_type = $1
  AND concept_slug = $2;
```

**Indexes used:** `uq_canonical_slug_type` (composite unique index on concept_slug + concept_type)

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "conceptSlug": "hydraulic",
    "conceptType": "system",
    "displayName": "Hydraulic Systems Filtration",
    "definition": "Hydraulic filtration systems maintain ISO 4406 particle cleanliness codes in hydraulic fluid circuits to prevent abrasive wear of precision valve and pump components.",
    "systemContext": "All hydraulic circuits: mobile equipment (excavators, loaders), industrial presses, proportional valve systems, high-pressure circuits above 200 bar.",
    "failureMechanism": "Particle contamination in hydraulic fluid exceeds cleanliness target → abrasive wear of valve spool and pump plate surfaces → dimensional tolerance degradation → valve stiction → pressure instability → equipment failure.",
    "industrialImpact": "Achieving ISO 17/15/12 vs. 20/18/15 extends proportional valve service life 3–5x. Poor contamination control increases unplanned hydraulic maintenance from <0.5 to 1–2 events per 500 operating hours.",
    "relatedStandards": [
      { "code": "ISO 16889", "scope": "Filter element beta ratio testing and classification" },
      { "code": "ISO 4406", "scope": "Method for coding the level of contamination by solid particles" },
      { "code": "NFPA T2.14", "scope": "Hydraulic fluid power system cleanliness requirements" },
      { "code": "DIN 51524", "scope": "Hydraulic oils specification" }
    ],
    "relatedTechnologies": [
      { "slug": "nanoforce", "mechanism": "Sub-micron particulate capture at 1µm absolute efficiency" }
    ],
    "industrialRole": "Hydraulic contamination control is the single largest preventable cause of mobile equipment downtime; system-level approach reduces unplanned events by 60–80% vs. commodity replacement strategy.",
    "version": 1,
    "lastUpdated": "2026-06-01",
    "citationUrl": "/knowledge-system/standards/hydraulic",
    "createdAt": "2026-06-01T00:00:00Z",
    "updatedAt": "2026-06-01T00:00:00Z"
  }
}
```

**Error responses:**
```json
{ "success": false, "error": "No canonical block found for type 'system', slug 'unknown-slug'" }  // 404
{ "success": false, "error": "Invalid concept type 'widget'. Must be one of: technology, system, contamination_mode, standard, industry" }  // 400
```

---

### 5.7 GET /api/kg/canonical

Returns all canonical blocks, with optional type filter.

**HTTP Method:** GET
**Path:** `/api/kg/canonical`
**Auth:** None

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| type | string | — | Filter by concept_type: `technology`, `system`, `contamination_mode`, `standard`, `industry` |
| page | integer | 1 | |
| limit | integer | 50 | Max 100 |

**SQL Approach:**

```sql
-- Count query
SELECT COUNT(*) FROM kg_canonical_blocks
WHERE ($1::text IS NULL OR concept_type = $1);

-- Data query
SELECT
  id, concept_slug, concept_type, display_name,
  definition, system_context, failure_mechanism, industrial_impact,
  related_standards, related_technologies, industrial_role,
  version, last_updated, citation_url
FROM kg_canonical_blocks
WHERE ($1::text IS NULL OR concept_type = $1)
ORDER BY concept_type, concept_slug
LIMIT $2 OFFSET $3;
```

**Response Schema:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conceptSlug": "nanoforce",
      "conceptType": "technology",
      "displayName": "NANOFORCE™",
      "definition": "NANOFORCE™ controls hydraulic system contamination through synthetic multi-layer media...",
      "systemContext": "...",
      "failureMechanism": "...",
      "industrialImpact": "...",
      "relatedStandards": [],
      "relatedTechnologies": [],
      "industrialRole": "...",
      "version": 1,
      "lastUpdated": "2026-06-01",
      "citationUrl": "/knowledge-system/technologies/nanoforce"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42,
    "totalPages": 1
  }
}
```

**Performance note:** Candidate for caching (TTL: 24 hours). Canonical blocks change only when definitions are updated. This endpoint is also used by Phase 8 `/api/knowledge`.

---

### 5.8 GET /api/kg/graph

Returns the full Knowledge Graph as nodes and edges for visualization and AI consumption.

**HTTP Method:** GET
**Path:** `/api/kg/graph`
**Auth:** None

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| includeProducts | boolean | false | If true, includes product SKU nodes (warning: adds ~4,622 nodes) |
| types | string | all | Comma-separated node types to include: `technology,system,contamination_mode,standard,industry` |

**Security:** Product nodes (if included) contain only `sku` and `filter_type`. No `codigo_base`, `BASE`, or internal fields.

**SQL Approach:**

```sql
-- Query 1: Technology nodes
SELECT
  'technology:' || slug AS id,
  'technology'          AS type,
  slug,
  display_name          AS label,
  category
FROM kg_technologies WHERE is_active = TRUE;

-- Query 2: System nodes
SELECT
  'system:' || slug AS id,
  'system'          AS type,
  slug,
  name              AS label,
  NULL AS category
FROM kg_systems;

-- Query 3: Canonical block nodes (contamination_mode, standard, industry types)
SELECT
  concept_type || ':' || concept_slug AS id,
  concept_type                         AS type,
  concept_slug                         AS slug,
  display_name                         AS label,
  NULL AS category
FROM kg_canonical_blocks
WHERE concept_type NOT IN ('technology', 'system');

-- Query 4: Edges from kg_concept_links
SELECT
  source_type || ':' || source_concept_slug AS source,
  target_type || ':' || target_concept_slug AS target,
  link_type
FROM kg_concept_links;

-- Query 5: System-technology edges (from primary_system relationship)
SELECT
  'technology:' || t.slug       AS source,
  'system:' || s.slug           AS target,
  'applies_to'                  AS link_type
FROM kg_technologies t
JOIN kg_systems s ON s.id = t.primary_system_id
WHERE t.is_active = TRUE;
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "technology:nanoforce",
        "type": "technology",
        "slug": "nanoforce",
        "label": "NANOFORCE™",
        "category": "Hydraulic Filtration"
      },
      {
        "id": "system:hydraulic",
        "type": "system",
        "slug": "hydraulic",
        "label": "Hydraulic Systems",
        "category": null
      },
      {
        "id": "contamination_mode:particle-wear",
        "type": "contamination_mode",
        "slug": "particle-wear",
        "label": "Particle Wear in Engines",
        "category": null
      }
    ],
    "edges": [
      {
        "source": "technology:nanoforce",
        "target": "system:hydraulic",
        "linkType": "applies_to"
      },
      {
        "source": "contamination_mode:particle-wear",
        "target": "technology:nanoforce",
        "linkType": "controls"
      }
    ],
    "meta": {
      "nodeCount": 32,
      "edgeCount": 48,
      "generatedAt": "2026-06-01T00:00:00Z"
    }
  }
}
```

**Performance note:** Candidate for caching (TTL: 1 hour). Graph structure changes only when new technologies, systems, or canonical blocks are added. Without `includeProducts=true`, this query touches <100 rows across all tables.

---

### 5.9 GET /api/kg/equipment/makes

Returns all normalized equipment manufacturers with model and industry metadata.

**HTTP Method:** GET
**Path:** `/api/kg/equipment/makes`
**Auth:** None

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| industry | string | — | Filter by industry type substring (e.g. `?industry=agriculture`) |
| includeInactive | boolean | false | Include deactivated makes |

**SQL Approach:**

```sql
SELECT
  m.id,
  m.slug,
  m.display_name,
  m.country_of_origin,
  m.industry_type,
  m.is_active,
  COUNT(DISTINCT mod.id)  AS model_count,
  COUNT(DISTINCT pe.product_sku) AS product_count
FROM kg_equipment_makes m
LEFT JOIN kg_equipment_models mod ON mod.make_id = m.id
LEFT JOIN kg_product_equipment pe ON pe.model_id = mod.id
WHERE ($1::boolean = TRUE OR m.is_active = TRUE)
  AND ($2::text IS NULL OR m.industry_type ILIKE '%' || $2 || '%')
GROUP BY m.id, m.slug, m.display_name, m.country_of_origin, m.industry_type, m.is_active
ORDER BY m.display_name;
```

**Response Schema:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "caterpillar",
      "displayName": "Caterpillar Inc.",
      "countryOfOrigin": "United States",
      "industryType": "construction,mining",
      "isActive": true,
      "modelCount": 42,
      "productCount": 312
    },
    {
      "id": 4,
      "slug": "cummins",
      "displayName": "Cummins Inc.",
      "countryOfOrigin": "United States",
      "industryType": "construction,mining,marine,power-generation,agriculture",
      "isActive": true,
      "modelCount": 87,
      "productCount": 634
    }
  ]
}
```

---

### 5.10 GET /api/kg/equipment/makes/:makeSlug/models

Returns all equipment models for a given make, with optional year filtering.

**HTTP Method:** GET
**Path:** `/api/kg/equipment/makes/:makeSlug/models`
**Auth:** None

**Path Parameters:**
| Parameter | Type | Notes |
|-----------|------|-------|
| makeSlug | string | e.g. `caterpillar`, `cummins`, `john-deere` |

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| yearFrom | integer | — | Filter models where year_to >= yearFrom |
| yearTo | integer | — | Filter models where year_from <= yearTo |
| page | integer | 1 | |
| limit | integer | 20 | Max 100 |

**SQL Approach:**

```sql
-- Verify make exists
SELECT id, display_name FROM kg_equipment_makes WHERE slug = $1;

-- Count
SELECT COUNT(*) FROM kg_equipment_models mod
JOIN kg_equipment_makes m ON m.id = mod.make_id
WHERE m.slug = $1
  AND ($2::smallint IS NULL OR mod.year_to   >= $2 OR mod.year_to IS NULL)
  AND ($3::smallint IS NULL OR mod.year_from <= $3 OR mod.year_from IS NULL);

-- Data
SELECT
  mod.id,
  mod.slug,
  mod.display_name,
  mod.year_from,
  mod.year_to,
  mod.engine_type,
  mod.displacement_cc,
  COUNT(pe.product_sku) AS product_count
FROM kg_equipment_models mod
JOIN kg_equipment_makes m ON m.id = mod.make_id
LEFT JOIN kg_product_equipment pe ON pe.model_id = mod.id
WHERE m.slug = $1
  AND ($2::smallint IS NULL OR mod.year_to   >= $2 OR mod.year_to IS NULL)
  AND ($3::smallint IS NULL OR mod.year_from <= $3 OR mod.year_from IS NULL)
GROUP BY mod.id, mod.slug, mod.display_name, mod.year_from, mod.year_to,
         mod.engine_type, mod.displacement_cc
ORDER BY mod.display_name
LIMIT $4 OFFSET $5;
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "make": {
      "slug": "caterpillar",
      "displayName": "Caterpillar Inc."
    },
    "models": [
      {
        "id": 12,
        "slug": "320d",
        "displayName": "320D",
        "yearFrom": 2008,
        "yearTo": 2016,
        "engineType": "Construction",
        "displacementCc": 7200,
        "productCount": 8
      },
      {
        "id": 13,
        "slug": "336f",
        "displayName": "336F",
        "yearFrom": 2012,
        "yearTo": null,
        "engineType": "Construction",
        "displacementCc": null,
        "productCount": 12
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Error responses:**
```json
{ "success": false, "error": "Equipment make 'unknown-make' not found" }  // 404
```

---

### 5.11 GET /api/kg/search (Phase 7 Scope)

Semantic KG-enhanced search. This endpoint path is reserved here for completeness.
**Full specification is in docs/kg-phase7/ARCHITECTURE.md.**

**Path:** `/api/kg/search?q=...`
**Status:** Specified in Phase 7 — not implemented in Phase 6.

---

## 6. ENDPOINT SUMMARY TABLE

| # | Method | Path | Returns | Cache TTL |
|---|--------|------|---------|-----------|
| 1 | GET | /api/kg/products/:sku | Full KG context for one product | None |
| 2 | GET | /api/kg/technologies | All technologies with product counts | 1 hour |
| 3 | GET | /api/kg/technologies/:slug | Technology detail + canonical + products | None |
| 4 | GET | /api/kg/systems | All system domains with product counts | 1 hour |
| 5 | GET | /api/kg/systems/:slug | System detail + canonical + technologies + products | None |
| 6 | GET | /api/kg/canonical/:type/:slug | One canonical block | 1 hour |
| 7 | GET | /api/kg/canonical | All canonical blocks (filterable) | 24 hours |
| 8 | GET | /api/kg/graph | Full graph nodes + edges | 1 hour |
| 9 | GET | /api/kg/equipment/makes | All equipment makes | 1 hour |
| 10 | GET | /api/kg/equipment/makes/:makeSlug/models | Models for one make | 30 min |

---

## 7. CACHING STRATEGY

### Cacheable Endpoints (server-side in-memory cache)

The following endpoints return data that changes only when catalog imports run (rare):

| Endpoint | Suggested TTL | Reason |
|----------|--------------|--------|
| GET /api/kg/technologies | 1 hour | Technology list is stable |
| GET /api/kg/systems | 1 hour | System list never changes without migration |
| GET /api/kg/canonical (all) | 24 hours | Canonical definitions are versioned, change infrequently |
| GET /api/kg/canonical/:type/:slug | 1 hour | Single concept definition |
| GET /api/kg/graph | 1 hour | Graph structure is stable between imports |
| GET /api/kg/equipment/makes | 1 hour | Equipment makes are stable |

### Non-Cacheable Endpoints

| Endpoint | Reason |
|----------|--------|
| GET /api/kg/products/:sku | Product catalog can update; per-SKU context must be fresh |
| GET /api/kg/technologies/:slug (products list) | Product assignments can change |
| GET /api/kg/systems/:slug (products list) | Product assignments can change |
| GET /api/kg/equipment/makes/:makeSlug/models | Equipment normalization is iterative |

### Implementation Pattern (no external cache library required)

```javascript
// Minimal in-memory cache for Phase 6
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Usage in route handler:
const CACHE_TTL_1H = 60 * 60 * 1000;
const cacheKey = 'kg:technologies:all';
const cached = cacheGet(cacheKey);
if (cached) return res.json({ success: true, data: cached });
// ... query db ...
cacheSet(cacheKey, result, CACHE_TTL_1H);
```

---

## 8. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Phase dependency not met (kg tables don't exist) | HIGH (pre-execution) | BLOCKING | Route handlers check table existence; return 503 with "KG not yet initialized" |
| SQL joins produce cartesian product for multi-system products | MEDIUM | MEDIUM | Always use DISTINCT in count queries; verify with products having multiple system assignments |
| codigo_base leaks into response accidentally | LOW | CRITICAL | Code review checklist: every SELECT in knowledge.routes.js reviewed for excluded columns |
| Cache becomes stale after catalog import | LOW | LOW | Admin endpoint `/api/kg/cache/clear` (admin-key protected) to invalidate on-demand |
| Route registration order conflicts with existing routes | LOW | LOW | /api/kg/* namespace has zero overlap with existing routes |
| Equipment joins return duplicate product rows (one product, multiple models) | MEDIUM | LOW | Use DISTINCT on product_sku in count; GROUP BY in product list queries |
| Page/limit validation accepts negative numbers | LOW | LOW | Explicit clamp: `Math.max(1, ...)` for page, `Math.min(100, Math.max(1, ...))` for limit |
