# ELIMFILTERS Knowledge Graph — Phase 2 Technical Entity Index

Phase 2 extends the canonical graph from brand taxonomy into engineering risk, standards, product families and evidence.

## Standards

- `standard:iso-16889`
- `standard:iso-4406`
- `standard:iso-5011`

## Contaminants

- `contaminant:solid-particles`
- `contaminant:water`
- `contaminant:soot`
- `contaminant:microbial-growth`

## Failure modes

- `failure-mode:abrasive-wear`
- `failure-mode:corrosion`
- `failure-mode:flow-restriction`
- `failure-mode:bypass-valve-failure`
- `failure-mode:seal-degradation`

## Product families

- `product-family:air-filters`
- `product-family:cabin-air-filters`
- `product-family:lube-filters`
- `product-family:fuel-filters`
- `product-family:fuel-water-separators`
- `product-family:hydraulic-filters`
- `product-family:coolant-filters`
- `product-family:air-dryer-filters`
- `product-family:filter-housings`
- `product-family:turbine-separators`

## Source documents

- `source:technology-registry`
- `source:system-registry`
- `source:industry-registry`
- `source:claim-registry`

## Evidence

- `evidence:engineering-validation-method`

## Graph traversal examples

```text
product-family:hydraulic-filters
  -> implements technology:nanoforce
  -> belongs_to_system system:hydraulic
  -> controls contaminant:solid-particles
  -> supports_standard standard:iso-16889
  -> mitigates failure-mode:abrasive-wear
```

```text
product-family:fuel-water-separators
  -> implements technology:hydrocore
  -> controls contaminant:water
  -> mitigates failure-mode:corrosion
```

These entities are canonical inputs for Obsidian, Graphify, Claude Code and future PostgreSQL synchronization.
