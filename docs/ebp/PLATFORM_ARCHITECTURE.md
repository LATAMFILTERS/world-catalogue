# ELIMFILTERS Business Platform — Platform Architecture

## System boundary

EBP is a private authenticated platform separate from the public corporate experience.

Preferred deployment:

- Public website: `elimfilters.com`
- Private platform: `portal.elimfilters.com`

An initial protected `/portal` route is acceptable only if it remains excluded from public navigation, sitemap, indexing, anonymous APIs, and public search results.

## Workspaces

### ELIMFILTERS Admin / Engineering

Controls PEP requirements, engineering revisions, manufacturer registry, batches, compliance review, approvals, packaging policy, selection logic, and access.

### Manufacturer Workspace

Sees only assigned request batches and products. Submits manufacturing capability, offered specifications, evidence, FOB cost, MOQ, lead time, capacity, and packaging recommendations.

### Distributor Workspace

Receives only approved and published products, assigned pricing, documents, availability, quotes, and orders in later phases.

## Architectural rules

- Reuse the existing canonical product/SKU source of truth through foreign keys.
- Keep required engineering values separate from manufacturer-offered or actual values.
- Enforce authorization on the server for every private resource.
- Use append-only audit records for approvals, imports, revisions, selection decisions, and sensitive changes.
- Store files through controlled attachment metadata and access policies; do not expose raw private file URLs publicly.
- Migrations must be reversible where practical and must never silently destroy existing catalog data.
- Portal modules must not alter public SEO, Knowledge Center, part-search, or corporate navigation behavior.

## Initial module flow

Canonical Product → PEP Revision → Manufacturer Request Batch → Manufacturer Proposal → Engineering Validation → Selection Recommendation → ELIMFILTERS Approval

Cost, pricing, distributor publication, quotes, and orders depend on this approved foundation and are not part of the first implementation phase.
