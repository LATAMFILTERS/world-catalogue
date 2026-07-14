---
id: product-family:air-dryer-filters
type: ProductFamily
name: Air Dryer Filters
status: approved
authority: canonical
owner: ELIMFILTERS Product Management
source:
  - docs/brand/PRODUCT_REGISTRY.md
last_reviewed: 2026-07-14
evidence_status: not_required
---

# Air Dryer Filters

Product family for moisture and contaminant control in compressed-air systems.

## Relationships

- implements: `technology:drycore`
- belongs_to_system: `system:compressed-air`
- controls: `contaminant:water`
- mitigates: `failure-mode:corrosion`
