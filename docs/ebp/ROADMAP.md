# ELIMFILTERS Business Platform — 72-Hour Foundational Roadmap

## Goal

Deliver a documented, auditable MVP foundation for product engineering passports, manufacturer records, manufacturer intake, technical validation, and manufacturer recommendation without altering the public website or exposing private commercial data.

## Day 1 — Organize and freeze architecture

### Phase 0

- Audit current repository architecture, database access, authentication, routes, and product source of truth.
- Complete governance, documentation, database, security, audit, and naming standards.
- Complete Phase 1–5 module documentation and acceptance criteria.
- Record unresolved decisions explicitly.
- Produce the Phase 0 architecture audit.

Exit gate: architecture and documentation approved; no production code yet.

## Day 2 — Build the operational core

### Phase 1: Product Engineering Passport

- PEP data model and revisions
- ELIMFILTERS required specifications
- Packaging requirements
- Documents and status history

### Phase 2: Manufacturer Registry

- Confidential EFM code generation
- Manufacturer profile, capability, certification, and status
- Strict role-based visibility

### Phase 3: Intake foundation

- Manufacturer request batches
- Protected Excel export/import model
- Manufacturer proposals and evidence
- Audit trail and pending-review workflow

Exit gate: migrations validated, APIs tested, and no public exposure.

## Day 3 — Validate, recommend, and provide private UI

### Phase 4: Engineering Validation

- Required-versus-offered comparison
- Mandatory compliance gates
- Deviations and evidence review

### Phase 5: Manufacturer Selection

- Configurable scoring matrix
- Primary, secondary, and backup recommendation per SKU
- Human approval and decision record

### Private portal UI

- Authentication boundary
- Admin/engineering workspace
- Manufacturer batch workspace
- Import preview, errors, comparison, and approval screens

Exit gate: relevant tests, type checks, build, security audit, documentation synchronization, and final sprint report.

## Deferred after the foundational sprint

- Landed-cost engine
- Distributor price levels
- Distributor catalog publication
- Quotes, orders, payments, and logistics
- Quality performance feedback loops
- ERP/API integrations
