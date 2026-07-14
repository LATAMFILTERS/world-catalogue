# ELIMFILTERS Business Platform — Implementation Master Index

## Active sprint

- Sprint: Foundational 72-hour MVP
- Branch: `feature/ebp-foundation`
- Active phase: Phase 0 — Governance and architecture
- Production changes allowed: No

## Delivery phases

| Phase | Module | Status | Dependency |
|---|---|---|---|
| 0 | Governance, architecture, security and documentation standards | In progress | None |
| 1 | Product Engineering Passport (PEP) | Not started | Phase 0 |
| 2 | Manufacturer Registry and confidential EFM codes | Not started | Phase 0 |
| 3 | Manufacturer intake batches and Excel workflow | Not started | Phases 1–2 |
| 4 | Engineering validation and deviations | Not started | Phase 3 |
| 5 | Manufacturer Selection Engine | Not started | Phase 4 |
| 6 | Cost and pricing foundation | Deferred | Phase 5 |
| 7 | Private Distributor Portal | Deferred | Phase 6 |

## Mandatory documentation per module

- `README.md`
- `architecture.md`
- `business-rules.md`
- `database.md`
- `api.md`
- `permissions.md`
- `workflow.md`
- `validation.md`
- `testing.md`
- `audit.md`
- `decisions.md`
- `changelog.md`
- `implementation-status.md`

## Current approved business decisions

- The system is private and belongs under the EBP portal boundary.
- Preferred deployment is `portal.elimfilters.com`.
- The public website may expose only login or access-request entry points.
- Every SKU has one canonical PEP with revision history.
- Every manufacturer receives a permanent confidential EFM code.
- Manufacturer responses are stored separately from ELIMFILTERS requirements.
- The system recommends the primary, secondary, and backup manufacturer per SKU; ELIMFILTERS gives final approval.
- Automotive products use individual branded packaging; industrial products do not use individual boxes by default.
- Industrial master-carton targets may be 6, 12, or 24 units, with documented manufacturer deviations allowed.

## Phase gate

No implementation phase may begin until its documentation package and acceptance criteria are complete and audited.
