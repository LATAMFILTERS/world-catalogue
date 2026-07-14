# Phase 4 — Equipment Graph Index

## Status

Structurally complete.

## Canonical types

- `Manufacturer`
- `Equipment`
- `Engine`
- `Vehicle`

## Templates

- `knowledge/templates/manufacturer.md`
- `knowledge/templates/equipment.md`
- `knowledge/templates/engine.md`
- `knowledge/templates/vehicle.md`

## Automation

- Exporter: `scripts/export-equipment-graph.mjs`
- Promotion gate: `scripts/promote-equipment-entity.mjs`
- Validation: `scripts/validate-knowledge-v2.mjs`
- Workflow: `.github/workflows/equipment-graph.yml`

## Generated output

```text
knowledge/generated/equipment-graph/
├── manufacturers/
├── equipment/
├── engines/
├── vehicles/
├── summary.json
├── unresolved.json
└── README.md
```

Generated output is excluded from Git and distributed as a workflow artifact.

## Product Intelligence linkage

Generated asset candidates contain source-backed candidate relationships to SKU entities:

- `fits_equipment`
- `fits_engine`
- `fits_vehicle`

These relationships remain under review until identity and fitment evidence are confirmed.

## Safety controls

- no compatibility is invented;
- source strings are preserved verbatim;
- ambiguous strings go to `unresolved.json`;
- generated entities cannot become canonical automatically;
- promotion requires an existing evidence entity;
- canonical validation checks manufacturer targets and required identity fields.

## Next phase

Phase 5: OEM Knowledge Graph — normalize OEM and competitor part numbers as distinct entities and connect them to reviewed ELIMFILTERS SKU relationships without treating unverified cross references as proven equivalence.
