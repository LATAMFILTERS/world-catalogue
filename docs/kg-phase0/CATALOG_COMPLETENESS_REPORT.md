# CATALOG_COMPLETENESS_REPORT.md
# ELIMFILTERS — Catalog Data Completeness
# KG Phase 0 Readiness Audit

> ⚠️ **NOTE:** Direct DB connection not available from local environment.
> Railway PostgreSQL only accessible from Render production server.
> **Run `node scripts/audit-catalog.js` on Render Shell to get live numbers.**
> Structural analysis below is based on code review + migration history.

---

## HOW TO GET LIVE NUMBERS

On Render Shell:
```bash
node scripts/audit-catalog.js
```

Or via API (admin key required):
```
GET https://part-search.elimfilters.com/api/audit/report?key=elim2026
GET https://part-search.elimfilters.com/api/catalog/stats?key=elim2026
```

---

## KNOWN APPROXIMATE NUMBERS (from server logs and autovacuum)

From Railway PostgreSQL autovacuum logs observed during session:
- **Total products: ~4,622** (confirmed from autovacuum log: "4622 products")

---

## COMPLETENESS DIMENSIONS

### What the audit script measures (from audit-catalog.js):

**Donaldson products (codigo_base ~ '^P[0-9]'):**
- No OEM codes: `oem_codes IS NULL OR jsonb_array_length = 0`
- No competitor codes: `competitor_codes IS NULL OR jsonb_array_length = 0`
- No equipment applications: `equipment_applications IS NULL OR jsonb_array_length = 0`
- No OEM + no equip: both missing simultaneously
- No description: `description IS NULL OR description = 'null'`

**Recheck queue (has physical specs but missing crossrefs):**
- Has specs + missing OEM + missing equip → Priority recheck
- Has specs + missing OEM only
- Has specs + missing equip only
- Fully empty (likely obsolete): no specs, no OEM, no equip

---

## COMPLETENESS EXPECTATIONS BY FIELD

### High Coverage Expected
These were systematically populated by the Python scrapers:

| Field | Expected Coverage | Source |
|-------|------------------|--------|
| sku | 100% | Generated on import |
| filter_type | ~95%+ | Donaldson scraper |
| technology | ~90%+ | Assigned from filter_type mapping |
| duty | ~85%+ | Assigned from codigo_base prefix + filter_type |
| installation_type | ~85%+ | From scraper or filter_type inference |

### Medium Coverage Expected
Populated by scraper but may have gaps:

| Field | Expected Coverage | Source |
|-------|------------------|--------|
| oem_codes | ~70-80% | Donaldson website + consolidation |
| description | ~70%+ | update-lube-descriptions + scraper |
| outer_diameter_mm | ~60-70% | Donaldson scraper |
| height_mm | ~60-70% | Donaldson scraper |
| thread_size | ~50-60% | Donaldson scraper (spin-on filters) |

### Lower Coverage Expected
These were partially populated:

| Field | Expected Coverage | Source |
|-------|------------------|--------|
| competitor_codes | ~40-60% | recover-competitor-codes.js (partial run) |
| equipment_applications | ~50-70% | scrape_equipment.py (still running) |
| iso_test_method | ~40-50% | Donaldson scraper |
| burst_pressure_psi | ~30-40% | Donaldson scraper |
| collapse_pressure_psi | ~30-40% | Donaldson scraper |
| nominal_efficiency | ~40-50% | Donaldson scraper |
| micron_rating | ~30-40% | Donaldson scraper |

### Minimal Coverage Expected
Rarely populated:

| Field | Expected Coverage | Source |
|-------|------------------|--------|
| gasket_od_mm | ~20-30% | Only for spin-on filters |
| gasket_id_mm | ~20-30% | Only for spin-on filters |
| alternatives | ~5-15% | Manually created, resolve-alternatives.js |
| brand_crossrefs | ~10-20% | add-cross-ref.js (partial) |

---

## COVERAGE BY FILTER TYPE (estimated)

| Filter Type | Est. SKU Count | OEM Coverage | Equipment Coverage | Tech Coverage |
|-------------|---------------|-------------|-------------------|---------------|
| Air Filter | ~800-1000 | High | High | ~100% MACROCORE |
| Lube Filter | ~1500-2000 | High | Medium | ~100% SYNTRAX |
| Hydraulic Filter | ~400-600 | Medium | Medium | ~100% NANOFORCE |
| Fuel Filter | ~300-500 | Medium | Low | ~100% SYNTEPORE/AQUAGUARD |
| Cabin Air Filter | ~100-200 | Medium | Low | ~100% MICROKAPPA |
| Fuel/Water Sep. | ~200-300 | Medium | Low | ~100% AQUAGUARD |
| Air Housing | ~50-100 | Low | Low | ~100% INTEKCORE |
| Coolant Filter | ~50-100 | Medium | Low | ~100% COOLTECH |
| Air Dryer | ~50-100 | Low | Low | ~100% DRYCORE |
| Crankcase Vent. | ~50-100 | Low | Low | Varies |

---

## RECHECK QUEUE ESTIMATE

Based on scrape_equipment.py run logs showing ~1,996 products in queue:
- **Products needing equipment scrape: ~1,500-2,000**
- **Products with has_specs but missing OEM + equip: likely 200-500**
- **Fully empty products (obsolete): likely 50-150**

---

## DESCRIPTION QUALITY

The `update-lube-descriptions` admin endpoint (line 36) batch-updated descriptions for:
- Lube Filter Spin-On → SYNTRAX™ description (EN + ES)
- Lube Filter Cartridge → SYNTRAX™ description (EN + ES)
- Lube Filter Centrifuge → SYNTRAX™ description (EN + ES)
- Cabin Air Filter → MICROKAPPA™ description (EN + ES)
- Air Filter Housing → INTEKCORE™ description (EN + ES)
- Air Precleaner → INTEKCORE™ description (EN + ES)
- Air Filter Primary (radial, axial, tetramax, powercore) → MACROCORE™ (EN + ES)
- Air Filter Secondary → MACROCORE™ (EN + ES)
- Air Dryer → DRYCORE™ description (EN + ES)
- Coolant Filter → COOLTECH™ description (EN + ES)
- Hydraulic Filter Spin-On → NANOFORCE™ description (EN + ES)
- Hydraulic Filter Cartridge → NANOFORCE™ description (EN + ES)
- Fuel/Water Separator (spinon, cartridge) → AQUAGUARD™ description (EN + ES)
- Fuel Filter (inline, spinon, cartridge) → SYNTEPORE™ description (EN + ES)
- Crankcase Ventilation → description applied

**Format:** JSONB `{"en": "...", "es": "..."}` for most products.

---

## ACTIONS REQUIRED BEFORE KG PHASE 1

1. **RUN ON RENDER SHELL**: `node scripts/audit-catalog.js` → Get exact numbers
2. **CHECK** filter brands still in oem_codes (audit section 7)
3. **CHECK** equipment makes in competitor_codes (audit section 6)
4. **VERIFY** scrape_equipment.py is complete or note remaining count
5. **CHECK** alternatives[] format: how many still have P-codes vs. EL-SKUs
