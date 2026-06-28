# FILTER_TYPE_MAPPING.md
# ELIMFILTERS — filter_type Values and KG Systems Mapping
# KG Phase 0 Readiness Audit

**Sources:** server.js (update-lube-descriptions, lines 36–406), audit-catalog.js, knowledge-architecture.ts

> ⚠️ Exact counts require DB query on Render Shell.
> Run: `SELECT filter_type, COUNT(*) FROM elimfilters_catalog GROUP BY filter_type ORDER BY cnt DESC`

---

## FILTER_TYPE DISTINCT VALUES

From `update-lube-descriptions` endpoint, the following filter_type values are explicitly known:

| filter_type (DB value) | Technology | Sub-types |
|------------------------|-----------|-----------|
| Air Filter | MACROCORE | Primary Radial, Primary Axial, Primary Tetramax, Primary Powercore, Secondary |
| Air Housing | INTEKCORE | Housing |
| Air Precleaner | INTEKCORE | Precleaner |
| Air Dryer | DRYCORE | Desiccant, Coalescing |
| Lube Filter | SYNTRAX / DURATECH | Spin-On, Cartridge, Centrifuge |
| Oil Filter | SYNTRAX | Spin-On (alternate label for Lube Filter) |
| Hydraulic Filter | NANOFORCE | Spin-On, Cartridge |
| Fuel Filter | SYNTEPORE | Inline, Spin-On, Cartridge |
| Fuel/Water Separator | AQUAGUARD | Spin-On, Cartridge |
| Cabin Air Filter | MICROKAPPA | — |
| Coolant Filter | COOLTECH | Spin-On |
| Crankcase Ventilation Filter | (varies) | — |

**Additional types likely in DB:**
- Marine Filter (MARINECLEAN)
- Compressed Air Filter (GASULTRA)
- Turbine Filter (from SKU prefix ET9xxx, server.js line 759)

---

## PROPOSED MAPPING TO kg_systems

| filter_type (DB) | kg_systems.slug | Notes |
|-----------------|----------------|-------|
| Air Filter | `air-intake` | Primary filtration system |
| Air Housing | `air-intake` | Housing component of air system |
| Air Precleaner | `air-intake` | Pre-stage of air system |
| Air Dryer | `compressed-air` | Serves compressed air systems |
| Lube Filter | `lube-oil` | Engine lubrication |
| Oil Filter | `lube-oil` | Same as Lube Filter |
| Hydraulic Filter | `hydraulic` | Hydraulic power systems |
| Fuel Filter | `fuel` | Fuel delivery system |
| Fuel/Water Separator | `fuel` | Fuel system + water removal |
| Cabin Air Filter | `cabin` | Operator health protection |
| Coolant Filter | `lube-oil` | Adjacent — thermal management |
| Crankcase Ventilation | `air-intake` | Adjacent — feeds into air system |
| Marine Filter | `lube-oil` | Marine lube context |
| Compressed Air Filter | `compressed-air` | Compressed air purity |
| Turbine Filter | `fuel` | Fuel system (turbine application) |

---

## SKU PREFIX → FILTER_TYPE INFERENCE

From `analyze/sku-correctness` endpoint (server.js lines 750–770):

| SKU Prefix | filter_type | Notes |
|-----------|-------------|-------|
| EA1xxx | Air Filter | Primary |
| EA2xxx | Air Housing | Housing |
| ED4xxx | Air Dryer | Dryer |
| EH6xxx | Hydraulic Filter | Hydraulic |
| EL8xxx | Lube Filter / Oil Filter | Engine oil |
| EM9xxx | Marine Filter | Marine application |
| ES9xxx | Fuel/Water Separator | FWS |
| ET9xxx | Turbine Filter | Turbine |
| EC1xxx | Cabin Air Filter | Cabin |
| EF9xxx | Fuel Filter | Fuel |
| EW7xxx | Coolant Filter | Coolant |

**Note:** Some prefixes overlap or are used inconsistently.

---

## FILTER_TYPE AS JSONB (multilingual variant)

Some products have `filter_type` as JSONB:
```json
{"en": "Air Filter", "es": "Filtro de Aire"}
```
Handled by `extractText(val, lang)` in buildFilterData.
**KG Action:** When seeding kg_product_systems from filter_type, must handle both plain string AND JSONB. Use `extractText` equivalent in SQL or Node script.

---

## SQL MAPPING IMPLEMENTATION

```sql
-- Map filter_type → system_id
-- Assumes kg_systems already seeded with slugs as listed above

WITH type_system_map AS (
  SELECT * FROM (VALUES
    ('Air Filter',                  'air-intake'),
    ('Air Housing',                 'air-intake'),
    ('Air Precleaner',              'air-intake'),
    ('Air Dryer',                   'compressed-air'),
    ('Lube Filter',                 'lube-oil'),
    ('Oil Filter',                  'lube-oil'),
    ('Hydraulic Filter',            'hydraulic'),
    ('Fuel Filter',                 'fuel'),
    ('Fuel/Water Separator',        'fuel'),
    ('Cabin Air Filter',            'cabin'),
    ('Coolant Filter',              'lube-oil'),
    ('Crankcase Ventilation Filter','air-intake'),
    ('Marine Filter',               'lube-oil'),
    ('Compressed Air Filter',       'compressed-air'),
    ('Turbine Filter',              'fuel')
  ) AS t(filter_type_val, system_slug)
)
INSERT INTO kg_product_systems (product_sku, system_id)
SELECT 
  ec.sku,
  ks.id
FROM elimfilters_catalog ec
JOIN type_system_map tsm ON 
  LOWER(TRIM(
    CASE WHEN ec.filter_type::text LIKE '{%' THEN
      (ec.filter_type::jsonb)->>'en'
    ELSE ec.filter_type
    END
  )) = LOWER(tsm.filter_type_val)
JOIN kg_systems ks ON ks.slug = tsm.system_slug
ON CONFLICT (product_sku, system_id) DO NOTHING;
```

---

## UNKNOWN / EDGE CASES

Products that may not map cleanly:
- `filter_type = NULL` → no system assignment
- `filter_type` contains proprietary Donaldson names ("Synteq XP", "PowerCore")
- `filter_type` = miscellaneous values from early scraper runs

**Action:** Query `SELECT DISTINCT filter_type FROM elimfilters_catalog` on Render Shell to find all edge cases before running migration.

---

## DB QUERIES TO RUN ON RENDER SHELL

```sql
-- All distinct filter_type values with counts
SELECT filter_type, COUNT(*) as cnt 
FROM elimfilters_catalog 
GROUP BY filter_type 
ORDER BY cnt DESC;

-- Filter types with sub_type breakdown
SELECT filter_type, sub_type, COUNT(*) as cnt
FROM elimfilters_catalog
GROUP BY filter_type, sub_type
ORDER BY filter_type, cnt DESC;

-- JSONB filter_type detection
SELECT COUNT(*) FROM elimfilters_catalog 
WHERE filter_type::text LIKE '{%';

-- NULL filter_type
SELECT COUNT(*) FROM elimfilters_catalog WHERE filter_type IS NULL;
```
