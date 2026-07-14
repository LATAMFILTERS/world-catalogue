---
id: failure-mode:flow-restriction
type: FailureMode
name: Flow Restriction
status: approved
authority: canonical
owner: ELIMFILTERS Engineering
source:
  - docs/brand/CLAIM_REGISTRY.md
last_reviewed: 2026-07-14
evidence_status: validated
---

# Flow Restriction

Loss of available airflow or fluid flow caused by contaminant loading, sludge, icing or excessive pressure drop.

## Relationships

- caused_by: `contaminant:solid-particles`
- may_be_caused_by: `contaminant:microbial-growth`
- mitigated_by: `technology:macrocore`
- mitigated_by: `technology:drycore`
