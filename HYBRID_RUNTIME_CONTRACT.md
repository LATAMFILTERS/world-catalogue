# ELIMFILTERS Hybrid Runtime Contract

`world-catalogue` is part of the ELIMFILTERS hybrid platform. Lenovo/ELIMSERVER is the production execution primary; cloud components provide routing, source control and stateless bridge capacity.

## Topology

| Layer | Primary purpose |
|---|---|
| Lenovo / ELIMSERVER | PRIMARY runtime for catalogue, Part Search, technical HERMES, Knowledge services and local PostgreSQL |
| Cloudflare | public TLS/routing directly to Lenovo localhost services through the managed tunnel |
| Render | STANDBY bridge-only proxy; no production database, scheduler, catalogue writer or application secrets |
| GitHub | source control, audit, selected CI/manual workflows |
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

A recurring production capability has exactly one ACTIVE execution owner at a time. In the current production topology Lenovo is that owner. Render is transport-only STANDBY and GitHub is CI/manual automation; neither may start production schedulers or writers.

Current production labels are `LENOVO / PRIMARY / ELIM_SCHEDULER_ENABLED=true` for the active runtime and `RENDER / STANDBY / ELIM_SCHEDULER_ENABLED=false` for the bridge.

Use these labels in runtime definitions:

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

Render bridge availability is not compute failover: it remains a stateless proxy to Lenovo and must fail closed if the upstream is unavailable. Any future promotion of another node to PRIMARY is an explicit operational action and must first fence Lenovo writers/schedulers. All mutation paths remain idempotent.
