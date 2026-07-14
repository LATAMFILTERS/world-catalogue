# Phase 5 — OEM Knowledge Graph Index

## Status

Structural implementation complete.

## Canonical model

- `OEMManufacturer`
- `OEMCode`
- `CompetitorCode`
- `CrossReferenceAssertion`

## Core files

- `docs/knowledge-graph/PHASE_5_OEM_KNOWLEDGE_GRAPH.md`
- `knowledge/templates/oem-code.md`
- `knowledge/templates/cross-reference-assertion.md`
- `scripts/export-oem-graph.mjs`
- `scripts/promote-oem-assertion.mjs`
- `scripts/validate-oem-graph.mjs`
- `.github/workflows/oem-knowledge-graph.yml`

## Generated output

`knowledge/generated/oem-graph/`

- manufacturers
- OEM codes
- competitor codes
- assertions
- summary report
- unresolved namespace report

Generated output is review material, not canonical knowledge.

## Safety rule

A source catalogue match is not automatically a technical equivalence. Only an assertion explicitly promoted as `validated_equivalent` with a canonical evidence record may be treated as approved equivalence.

## Completion criteria

- deterministic code identity;
- manufacturer namespace preservation;
- original spelling retained;
- assertion confidence represented explicitly;
- unresolved manufacturer namespaces isolated;
- validation and controlled promotion available;
- generated bulk output stored as workflow artifact instead of thousands of commits.
