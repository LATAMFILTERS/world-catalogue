# ELIMFILTERS Product Identity System

This module connects World Catalogue product data to manufacturing artwork and AI media generation.

## Source-of-truth rule

World Catalogue owns technical product facts: SKU, family, construction, dimensions, thread, gasket, technology, cross references, standards and applications.

`product-identity/` owns presentation and manufacturing rules: brand identity, printable-area templates, artwork priorities, QR rules and AI transformation constraints.

AI media must consume both layers. It must never invent missing dimensions, cross references, standards or construction details.

## Current scope

Phase 1: Heavy Duty (HD). Light Duty packaging rules are intentionally excluded until HD is validated.

HD families in scope:
- Oil filters
- Fuel filters
- Fuel/water separators
- Air filters
- Cabin air filters
- Hydraulic filters
- Coolant filters
- Crankcase ventilation filters
- Air dryer / brake-system cartridges
- Special elements and housings when applicable

## Structure

- `brand-dna/` — immutable ELIMFILTERS visual identity rules
- `hd-standard/` — HD product-printing logic and physical templates
- `schemas/` — machine-readable product master contracts
- `production-master/` — one production master JSON per SKU
- `scripts/` — read-only synchronization from World Catalogue into Product Master JSON
- `ai-media/` — deterministic image/video transformation rules

## Catalogue → Product Master synchronization

The synchronization script reads verified technical fields directly from `elimfilters_catalog` and writes/updates one JSON file per HD SKU without modifying the catalogue database.

```bash
node product-identity/scripts/sync-product-master.mjs --dry-run
node product-identity/scripts/sync-product-master.mjs --sku=EL82100 --dry-run
node product-identity/scripts/sync-product-master.mjs --sku=EL82100
```

Required environment variable:

```bash
DATABASE_URL=<World Catalogue PostgreSQL connection string>
```

The sync imports available technical data including height, outer/inner diameter, thread, gasket dimensions, filter family, technology, technical test method, media, pressure specifications and verified cross references.

Manufacturing-only data such as printable area, artwork template and approved QR destination is preserved from the existing Product Master and is never invented from catalogue data.

## Factory release gate

Every generated Product Master contains a `gate.missing_for_factory_release` array and a `production.factory_ready` flag.

A SKU remains blocked from factory release while required data is missing. For spin-on filters the gate requires, at minimum:
- verified height
- verified outer diameter
- verified thread
- assigned printable-area dimensions
- assigned HD production template
- approved QR destination

This gate is intentionally conservative. Production data is not inferred when World Catalogue does not support it.

## Release rule

A SKU may not be marked `factory_ready` until required technical dimensions, printable area, artwork template, QR destination, applicable standards and approved OEM equivalences are verified.
