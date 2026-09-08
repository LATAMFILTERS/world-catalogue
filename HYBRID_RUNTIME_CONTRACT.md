# ELIMFILTERS Hybrid Runtime Contract

`world-catalogue` is part of a hybrid ELIMFILTERS platform. Lenovo and cloud are complementary nodes; neither is automatically a replacement for the other.

## Topology

| Layer | Primary purpose |
|---|---|
| Lenovo | preferred primary node for continuous/private catalogue, Part Search and technical HERMES execution |
| GitHub | source control, audit, selected CI/manual workflows |
| Render | retained cloud runtime/failover where justified |
| Cloudflare | public routing, TLS and access/security controls |
| R2 | object storage/evidence/archive/backup where configured |

## Domain ownership

This repository is authoritative for:

- canonical product/catalogue knowledge and migrations
- Part Search canonicalization, certification and search governance
- technical evidence and Knowledge Center publication
- technical/catalogue HERMES research and validation
- catalogue-facing automation

`LATAMFILTERS/elimfilters-crm` is authoritative for commercial/operational state: distributors, suppliers, requisitions, approvals, governed communications and CRM workflow execution.

Do not create or mutate CRM commercial records from this repository except through an explicit authenticated interface/event contract. Do not duplicate commercial HERMES loops already owned by the CRM.

## Runtime invariant

A recurring production capability has exactly one ACTIVE execution owner at a time. Lenovo is preferred for continuous jobs; Render or GitHub may remain standby, CI, manual trigger or failover.

Use these labels in new runtime definitions:

```text
ELIM_RUNTIME_NODE=LENOVO|RENDER|GITHUB
ELIM_RUNTIME_ROLE=PRIMARY|STANDBY|CI
ELIM_DOMAIN=WORLD_CATALOGUE
ELIM_SCHEDULER_ENABLED=true|false
```

`STANDBY` and `CI` must not run recurring production schedulers.

## HERMES split

HERMES remains one logical system with domain boundaries:

- Technical HERMES here: catalogue research, evidence, product/application knowledge, Part Search governance, Knowledge Center proposals/publication.
- Operational HERMES in CRM: distributor/supplier/commercial research, approvals, recommendations, communications and Command Center operations.

Cross-domain exchange must be explicit and idempotent. A technical finding may be consumed by CRM; a commercial observation may request technical research. Neither side silently takes ownership of the other's source-of-truth tables or scheduler.

## Failover

Cloud services are not to be removed merely because Lenovo is active. Promotion of a standby node to primary must ensure the former primary recurring scheduler is stopped or fenced. All mutation paths remain idempotent.
