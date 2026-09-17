# World Catalogue Agency Boundary

Status: implementation baseline for `agency-integration-phase0`.

`world-catalogue` is the ELIMFILTERS technical-intelligence and technical-authority domain. It is not the commercial system of record and it is not the enterprise-wide orchestrator.

## Technical authority

World Catalogue owns product/catalog truth, SKU validation, cross-reference technical authority, application authority, technical facts, OEM intervals, engineering reasoning, technical recommendations, HERMES research, Obsidian/Nodal knowledge governance, and canonical technical knowledge.

PostgreSQL remains the authority for product/SKU/catalog records. Obsidian/Nodal remains the approval/promotion authority for canonical technical knowledge. HERMES researches and proposes; it cannot authorize SKU truth or canonical publication on its own.

## Commercial boundary

Commercial accounts, contacts, opportunities, RFQs, outreach, supplier commercial state, finance/risk decisions, commercial approvals, and commercial execution remain owned by `elimfilters-crm`.

World Catalogue may request commercial context or emit a commercial-intelligence proposal, but it must not write CRM commercial state directly.

## Cross-repository rule

Direct cross-repository writes are denied by default. Requests crossing the domain boundary require request and correlation identifiers. The owning repository executes any eventual write through its own governance, approval, and audit path.

## Engines are not agents by default

The Engineering Decision Engine, deterministic catalog routing, compatibility, coverage, maintenance intelligence, recommendation services, catalog governance, and other specialized technical modules remain engines/skills/tools unless a separate runtime responsibility is demonstrated.

## Write enforcement

Catalog writes must converge on the evidence-governed catalog write path. Legacy direct writers are technical debt and must not be used as precedent for new code. Prohibited application inheritance based only on shared cross-references remains blocked.

Canonical knowledge promotion must remain fail-closed and separate from HERMES research/candidate generation.

## Autonomy

HERMES may retain scheduled research autonomy within its approved research scope. Broader catalog writes, canonical publication, external/write actions, or cross-domain mutations require their corresponding governance and approval gates before autonomy is expanded.
