# Product Catalog Import Pipeline
## For: product_family / product_model / product_element / alternative_groups

---

## Overview

The import pipeline describes how product data moves from source documents
(manufacturer datasheets, OEM service catalogs, internal engineering records)
into the PostgreSQL product catalog tables.

Three distinct phases:

```
SOURCE DOCUMENTS
      ↓
EXTRACTION + STAGING
      ↓
IMPORT + VALIDATION
      ↓
SKU LINKAGE (elimfilters_catalog)
```

---

## Phase 1: Source Document Collection

### Required source documents per product family

| Document Type | Purpose | Example |
|---|---|---|
| Manufacturer product datasheet | Housing model specs, element interchange table | Parker Racor 900/1000 FH Datasheet |
| Element interchange table | Which elements fit which housings | Racor Datasheet Table 2 |
| Media specification sheet | Micron rating, water separation %, beta ratio | Racor Element Specifications |
| Competitor cross-reference | OEM equivalent part numbers | Racor → Fleetguard → Baldwin mapping |
| ELIMFILTERS engineering review | Internal validation, SKU assignment | ER-2026-xxx |

### Traceability requirement

Every row in `model_element_compatibility` and `alternative_group` requires
`compatibility_source` documenting the primary source.

If a source document cannot be named, `compatibility_confidence` must be
set to `'INFERRED'` or `'PENDING'` — never `'CONFIRMED'`.

---

## Phase 2: Extraction + Staging

### 2a. Manual extraction template (for datasheet-based import)

Fill this JSON structure from the source document before running any SQL:

```json
{
  "family": {
    "family_code": "HYDROCORE/SERIES",
    "family_name": "HYDROCORE/SERIES™",
    "technology": "HYDROCORE",
    "system": "Fuel Cleanliness",
    "source_doc": "Parker Racor 900/1000 FH Series Datasheet"
  },
  "models": [
    {
      "model_code": "1000FH",
      "racor_equivalent": "1000FH",
      "model_type": "durable",
      "accepts_elements": true,
      "compatibility_class": "2040",
      "has_heater": false,
      "heater_voltage_v": null
    }
  ],
  "elements": [
    {
      "element_code": "2040SM-OR",
      "racor_equivalent": "2040SM-OR",
      "compatibility_class": "2040",
      "media_grade": "SM",
      "seal_type": "OR",
      "protection_spec": {
        "micron_nominal": 30,
        "water_sep_free_pct": 95.0
      }
    }
  ],
  "compatibility": [
    {
      "model_code": "1000FH",
      "element_code": "2040SM-OR",
      "is_primary": true,
      "compatibility_source": "Parker Racor Datasheet Table 2",
      "compatibility_method": "datasheet",
      "compatibility_confidence": "CONFIRMED"
    }
  ],
  "alternative_groups": [
    {
      "group_code": "HYDROCORE-2040",
      "compatibility_class": "2040",
      "differentiation_axis": "micron_rating + water_separation_efficiency",
      "compatibility_basis": "compatibility_class_match",
      "compatibility_source": "Parker Racor Datasheet element interchange table",
      "members": [
        { "element_code": "2040SM-OR", "is_baseline": true,  "protection_level": 1, "operational_objective": "oem_equivalent",     "rank": 1 },
        { "element_code": "2040TM-OR", "is_baseline": false, "protection_level": 3, "operational_objective": "enhanced_protection", "rank": 2 },
        { "element_code": "2040PM-OR", "is_baseline": false, "protection_level": 5, "operational_objective": "maximum_protection",  "rank": 3 }
      ]
    }
  ]
}
```

### 2b. Validation before import (pre-flight checks)

Run these checks BEFORE executing any INSERT:

```
[ ] All compatibility_class values in models match their elements
[ ] Each alternative_group has exactly one is_baseline = TRUE member
[ ] No duplicate model_code values
[ ] No duplicate element_code values
[ ] No duplicate group_code values
[ ] All compatibility_confidence = 'CONFIRMED' rows have a compatibility_source
[ ] protection_level values are between 1 and 5
[ ] operational_objective values are in the allowed set
[ ] media_grade vocabulary is appropriate for the technology family
```

If any check fails: fix the staging data before running SQL.

---

## Phase 3: Import + Validation

### Import sequence (strict order)

```
Step 1  INSERT product_family
        ON CONFLICT (family_code) DO NOTHING

Step 2  INSERT product_model (for each model)
        Subquery: SELECT id FROM product_family WHERE family_code = ?
        ON CONFLICT (model_code) DO NOTHING

Step 3  INSERT product_element (for each element)
        Subquery: SELECT id FROM product_family WHERE family_code = ?
        ON CONFLICT (element_code) DO NOTHING

Step 4  INSERT model_element_compatibility (for each model↔element pair)
        Validate: product_model.compatibility_class = product_element.compatibility_class
        ON CONFLICT (product_model_id, product_element_id) DO NOTHING

Step 5  INSERT alternative_group
        ON CONFLICT (group_code) DO NOTHING

Step 6  INSERT alternative_group_member (for each element in each group)
        Validate: exactly one is_baseline = TRUE per group
        ON CONFLICT (group_id, element_id) DO NOTHING
```

Order is mandatory. Steps 4 and 6 depend on IDs created in previous steps.

### Running the import

```bash
# Schema only (first time):
DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js

# Schema + seed data:
DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js --seed

# Schema + seed + validation:
DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js --all

# Via HTTP (after server.js integration):
GET /api/migrate/product-catalog?key=elim2026admin
GET /api/migrate/product-catalog-seed?key=elim2026admin
GET /api/migrate/product-catalog-validate?key=elim2026admin
```

### Post-import validation

Run validation queries from `003_validation_queries.sql`.

Expected results for HYDROCORE/SERIES™ seed:

| Check | Expected |
|---|---|
| product_family rows | 1 |
| product_model rows | 4 |
| product_element rows | 6 |
| model_element_compatibility rows | 12 |
| alternative_group rows | 2 |
| alternative_group_member rows | 6 |
| Baseline per group | 1 each |
| Compatibility class mismatches | 0 |
| Orphan elements | 0 |

---

## Phase 4: SKU Linkage

After import, each housing and element must be linked to an ELIMFILTERS SKU
in `elimfilters_catalog`. This is the last step because SKU assignment
may occur separately from data extraction.

### SKU assignment process

```sql
-- 1. Create product entries in elimfilters_catalog
--    (populate brand_crossrefs with Racor codes for search resolution)
INSERT INTO elimfilters_catalog (sku, codigo_base, technology, filter_type, brand_crossrefs, ...)
VALUES ('EL-HC-1000FH', null, 'HYDROCORE', 'Fuel Housing', '{"RACOR": ["1000FH"]}', ...);

-- 2. Link product_model to its SKU
UPDATE product_model
SET elimfilters_sku = 'EL-HC-1000FH'
WHERE model_code = '1000FH';

-- 3. Link product_element to its SKU
UPDATE product_element
SET elimfilters_sku = 'EL-HC-2040SM'
WHERE element_code = '2040SM-OR';
```

### After SKU linkage

- `GET /api/tools/cross-reference/1000FH` routes via `brand_crossrefs["RACOR"]`
  in `elimfilters_catalog` → returns housing SKU
- `GET /api/product-catalog/housing/1000FH` returns full housing + element list
- `GET /api/product-catalog/alternatives/2020SM-OR` returns alternatives with TYPE_A/TYPE_B
- `POST /api/ai/v2/consult-grounded` with housing query triggers `findCrossReference()`
  + alternative group lookup to ground the AI response

---

## Future Technology Families

When adding a new technology family (NANOFORCE/SERIES™, SYNTRAX/SERIES™, etc.):

1. Prepare extraction JSON using the template in Phase 2a
2. Define the `compatibility_class` vocabulary for the new family
   (e.g., `'NF-HF-400'`, `'SX-CART-12'`)
3. Define the `media_grade` vocabulary for the new family
   (e.g., `'B6'`, `'B10'`, `'B25'` for NANOFORCE beta ratios)
4. Add `protection_spec` JSONB keys appropriate to the technology
   (e.g., `iso_4406_target`, `collapse_pressure_bar` for NANOFORCE)
5. Run Steps 1-6 in Phase 3 for the new family data
6. No schema changes required — all tables are generic

---

## Error Recovery

| Error | Cause | Fix |
|---|---|---|
| `fk_product_model_family` FK violation | product_family row missing | Run Step 1 first |
| `fk_mec_model` FK violation | product_model row missing | Run Step 2 before Step 4 |
| `idx_agm_one_baseline_per_group` unique violation | Two is_baseline=TRUE for same group | Fix staging data; ensure exactly one |
| `chk_accepts_elements_requires_durable` | accepts_elements=TRUE on standalone model | Set model_type='durable' or accepts_elements=FALSE |
| `chk_compat_class_required_for_durable` | compatibility_class NULL on durable model | Add compatibility_class value |
| `chk_heater_voltage` | has_heater=TRUE with NULL voltage | Set heater_voltage_v to 12 or 24 |
| Compatibility class mismatch (V4 fails) | Wrong element linked to wrong housing | Check model and element compatibility_class values |
