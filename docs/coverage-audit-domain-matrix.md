# Coverage Audit Domain Matrix

## Root-cause matrix

| Symptom | Root cause | Domain correction |
|---|---|---|
| A page contains only EA products | SKU ordering was treated as coverage sampling | Pagination remains deterministic; classification occurs after application normalization and reporting is segmented by asset domain |
| Industrial equipment appears in LIGHT_DUTY | Product-level `duty` was applied to every application | Segment is assigned to each application: LIGHT_DUTY, HEAVY_DUTY, INDUSTRIAL, or UNKNOWN |
| Compressors are marked incomplete without cabin filters | A universal `oil + air + cabin` rule was applied | Coverage requirements are policy-driven by segment |
| Null year is always considered invalid | Imported application data mixes structured and free-text evidence | Year normalization records confidence and evidence source; only LD requires year for confirmed fitment |
| Fuel and market are broadly unknown | Raw JSON fields are incomplete | Fuel and market are normalized with confidence and remain unresolved when evidence is insufficient |
| Product prefix controls the entire audit | SKU prefix substituted for canonical taxonomy | Canonical category uses filter type/subtype/technology first, with prefix only as a fallback |
| Patch scripts break later deploys | Route code was rewritten through chained text replacements | Legacy v1/v2/v3 patch scripts are removed; domain logic is isolated under `src/audit/coverage/` |

## Domain modules

- `normalization.js`: canonical make/model/year/fuel/market/segment/category.
- `policies.js`: segment-specific required and conditional systems.
- `repository.js`: read-only PostgreSQL access.
- `service.js`: grouping, quality metrics, coverage evaluation, prioritization.
- `route.js`: HTTP validation and response contract.
- `src/coverage-audit-engine.js`: compatibility adapter only; contains no audit logic.

## Acceptance matrix

| Fixture | Expected segment | Expected policy result |
|---|---|---|
| Toyota Corolla 2017 1.8 VVT-i USA with air/oil/cabin | LIGHT_DUTY | complete |
| AGCO tractor with only engine air | HEAVY_DUTY | partial; oil and fuel missing |
| Becker rotary-vane compressor | INDUSTRIAL | no universal cabin requirement |
| Unknown free-text equipment | UNKNOWN | unresolved_segment, never forced into LD |

## Response contract

The endpoint must return:

```json
{
  "engine_version": "coverage-audit-domain-v1",
  "summary": {
    "segment_counts": {},
    "status_counts": {},
    "category_unit_counts": {}
  }
}
```

The engine is read-only. It audits applications already stored in PostgreSQL and does not claim coverage for assets absent from the catalogue.
