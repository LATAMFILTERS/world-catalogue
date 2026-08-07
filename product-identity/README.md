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
- `ai-media/` — deterministic image/video transformation rules

## Release rule

A SKU may not be marked `factory_ready` until required technical dimensions, printable area, artwork template, QR destination, applicable standards and approved OEM equivalences are verified.
