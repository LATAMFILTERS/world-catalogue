# Phase 6 — Failure Intelligence Graph Index

## Governing document

- `docs/knowledge-graph/PHASE_6_FAILURE_INTELLIGENCE_GRAPH.md`

## Canonical templates

- `knowledge/templates/symptom.md`
- `knowledge/templates/failure-scenario.md`
- `knowledge/templates/recommendation-rule.md`

## Canonical entity folders

```text
knowledge/entities/
├── symptoms/
├── failure-scenarios/
└── recommendation-rules/
```

These folders are populated only after evidence review. Generated candidates remain outside the canonical layer.

## Pipeline

- Builder: `scripts/build-failure-intelligence.mjs`
- Validator: `scripts/validate-failure-intelligence.mjs`
- Canonical validator: `scripts/validate-knowledge-v2.mjs`
- Workflow: `.github/workflows/failure-intelligence-graph.yml`

## Generated artifact

```text
knowledge/generated/failure-intelligence/
├── scenarios/
├── recommendations/
├── matrix.json
├── summary.json
└── unresolved.json
```

## Governing rules

1. An observation is not a confirmed cause.
2. A failure scenario must identify confidence, severity, system and failure mode.
3. A recommendation rule must identify its scenario and action level.
4. SKU-level recommendations require `validated_recommendation` plus canonical evidence.
5. Missing or incompatible relationships are reported, never inferred silently.
6. Generated output is review material and is not committed as canonical knowledge.

## Phase status

Structural implementation complete. Population begins from reviewed field observations, inspection records, laboratory results and product-specific evidence.
