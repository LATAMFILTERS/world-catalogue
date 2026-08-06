# TECHNOLOGY_AUDIT.md
# ELIMFILTERS — Technology Column Audit
# KG Phase 0 Readiness Audit

**Sources:** server.js (lines 633–657), knowledge-architecture.ts, update-lube-descriptions endpoint

> ⚠️ Live DB counts not available (Railway not accessible locally).
> Run `SELECT technology, COUNT(*) FROM elimfilters_catalog GROUP BY technology ORDER BY cnt DESC`
> on Render Shell to get exact distribution.

---

## AUTHORITATIVE TECHNOLOGY LIST

From `TECH_LOGO_MAP` (server.js lines 633–647) — these are the technologies with logos:

| DB Value | Normalized Name | Logo File | Category |
|----------|----------------|-----------|----------|
| SYNTRAX | SYNTRAX™ | logo-sintrax.png | Lube / Oil |
| SINTRAX | SYNTRAX™ | logo-sintrax.png | Lube / Oil (alias) |
| NANOFORCE | NANOFORCE™ | logo-nanoforce.png | Hydraulic |
| MACROCORE | MACROCORE™ | logo-macrocore.png | Air Intake |
| INTEKCORE | INTEKCORE™ | logo-intekcore.png | Air Housing |
| DRYCORE | DRYCORE™ | logo-drycore.png | Compressed Air |
| DURATECH | DURATECH™ | logo-duratech.png | Lube (heavy duty) |
| SYNTEPORE | SYNTEPORE™ | logo-syntepore.png | Fuel |
| MICROKAPPA | MICROKAPPA™ | logo-microkappa.png | Cabin Air |
| GASULTRA | GASULTRA™ | logo-gasultra.png | Compressed Air |
| MARINECLEAN | MARINECLEAN™ | logo-marineclean.png | Marine |
| BLUECLEAN | BLUECLEAN™ | logo-blueclean.png | Specialty |

**Total: 14 technologies** (13 distinct, SINTRAX is alias for SYNTRAX)

---

## KNOWN INVALID / DEPRECATED VALUES

### `SYNTAPORE` → corrected to `SYNTEPORE`
Defined in `TECH_NAME_FIXES` (server.js line 657):
```javascript
const TECH_NAME_FIXES = { 'SYNTAPORE': 'SYNTEPORE', 'SYNTAPORE™': 'SYNTEPORE™' };
```
Any DB row with `technology = 'SYNTAPORE'` is corrected at query time.
**KG Action:** When seeding kg_product_technologies, apply this correction.

### `SINTRAX` → alias for `SYNTRAX`
Defined in `TECH_LOGO_MAP`:
```javascript
'syntrax': 'sintrax', 'sintrax': 'sintrax',
```
Both map to `logo-sintrax.png`. The canonical name is SYNTRAX.
**KG Action:** All 'SINTRAX' values should map to kg_technologies.slug = 'syntrax'.

---

## TECHNOLOGY → FILTER_TYPE MAPPING

From `update-lube-descriptions` endpoint (lines 36–406):

| technology | filter_type | sub_type / variant |
|-----------|-------------|-------------------|
| MACROCORE | Air Filter | Primary, Secondary, Radial, Axial, Tetramax, Powercore |
| INTEKCORE | Air Filter | Housing, Precleaner |
| DRYCORE | Air Filter | Dryer |
| SYNTRAX | Lube Filter, Oil Filter | Spin-On, Cartridge |
| SYNTRAX | Lube Filter | Centrifuge |
| MICROKAPPA | Cabin Air Filter | — |
| NANOFORCE | Hydraulic Filter | Spin-On, Cartridge |
| SYNTEPORE | Fuel Filter | Inline, Spin-On, Cartridge |
| DURATECH | (heavy duty lube variants) | Spin-On |
| MARINECLEAN | (marine filters) | — |
| GASULTRA | (compressed air) | — |
| BLUECLEAN | (specialty) | — |

---

## TECHNOLOGY → KG_SYSTEMS MAPPING

| technology slug | kg_systems slug(s) | Primary |
|----------------|-------------------|---------|
| macrocore | air-intake | Yes |
| intekcore | air-intake | Yes (housings) |
| drycore | compressed-air | Yes |
| gasultra | compressed-air | Yes |
| syntrax | lube-oil | Yes |
| duratech | lube-oil | Yes |
| nanoforce | hydraulic | Yes |
| syntepore | fuel | Yes |
| microkappa | cabin | Yes |
| marineclean | lube-oil, fuel | Marine context |
| blueclean | lube-oil | Specialty |

---

## TECHNOLOGY → KG_INDUSTRIES MAPPING

| technology slug | primary industries |
|----------------|-------------------|
| macrocore | agriculture, mining, construction |
| intekcore | agriculture, mining, construction |
| drycore | manufacturing, mining, construction |
| gasultra | manufacturing, mining |
| syntrax | agriculture, mining, construction, marine, automotive |
| duratech | mining, construction (extreme duty) |
| nanoforce | construction, mining, manufacturing |
| syntepore | agriculture, automotive, marine |
| microkappa | agriculture, mining, construction, automotive |
| marineclean | marine |
| blueclean | specialty |

---

## ALIGNMENT WITH knowledge-architecture.ts

The TypeScript file lists these technologies with full metadata:
- SYNTEPORE, GASULTRA, MARINECLEAN, BLUECLEAN (in TECH_LOGO_MAP)

**Gap:** knowledge-architecture.ts may only document 6-9 technologies but DB has 14. The KG must document ALL 14.

---

## DB QUERIES TO RUN ON RENDER SHELL

```sql
-- Technology distribution
SELECT technology, COUNT(*) as cnt 
FROM elimfilters_catalog 
GROUP BY technology 
ORDER BY cnt DESC;

-- Technology + filter_type cross-tab
SELECT filter_type, technology, COUNT(*) as cnt 
FROM elimfilters_catalog 
GROUP BY filter_type, technology 
ORDER BY filter_type, cnt DESC;

-- Invalid technology values
SELECT technology, COUNT(*) FROM elimfilters_catalog 
WHERE technology NOT IN (
  'MACROCORE', 'INTEKCORE', 'DRYCORE', 'GASULTRA',
  'MICROKAPPA', 'MARINECLEAN', 'BLUECLEAN'
) AND technology IS NOT NULL
GROUP BY technology;

-- Products with NULL technology
SELECT COUNT(*) FROM elimfilters_catalog WHERE technology IS NULL;
```

---

## KG SEEDING STRATEGY

1. Create `kg_technologies` with 13 rows (14 minus SINTRAX alias)
2. Populate `kg_product_technologies` join table:
```sql
INSERT INTO kg_product_technologies (product_sku, technology_id)
SELECT 
  ec.sku,
  kt.id
FROM elimfilters_catalog ec
JOIN kg_technologies kt ON 
  LOWER(COALESCE(
    CASE ec.technology WHEN 'SYNTAPORE' THEN 'SYNTEPORE' 
                       WHEN 'SINTRAX' THEN 'SYNTRAX' 
                       ELSE ec.technology END,
    ''
  )) = kt.slug
WHERE ec.technology IS NOT NULL;
```
3. Verify: count of populated rows vs. expected (should be ~4000+ products)
4. Products with NULL technology → investigate (likely newer imports or cabin filters with missing field)
