# ELIMFILTERS Knowledge Graph v2 — Phase 1

## Purpose

Phase 1 creates the canonical knowledge layer that sits between Obsidian, Graphify, PostgreSQL, the website, and Claude Code.

This phase does not alter production catalogue data. It establishes the structures and governance required before automated synchronization is enabled.

## Deliverables

1. `knowledge/` becomes the canonical repository for governed business and engineering entities.
2. Every entity has a stable ID, type, authority level, lifecycle status, source, and evidence state.
3. Obsidian notes can be created from approved templates without inventing new structures.
4. A local and CI validator rejects incomplete canonical entities.
5. Graphify may index canonical entities, but generated Graphify outputs never become sources of truth.

## Authority order

When two sources disagree, the following order applies:

1. Approved canonical entity under `knowledge/entities/`.
2. Brand governance registries under `docs/brand/`.
3. Validated PostgreSQL operational data.
4. Current source code and production page data.
5. Obsidian working notes.
6. Historical reports and implementation summaries.
7. Generated Graphify reports and inferred relationships.

## Phase 1 entity classes

The initial controlled classes are:

- `Technology`
- `ProtectionSystem`
- `Industry`
- `ProductFamily`
- `SKU`
- `Standard`
- `FailureMode`
- `Contaminant`
- `EvidenceRecord`
- `SourceDocument`

Additional classes require an ontology change before use.

## Required identity fields

Every canonical entity must define:

- `id`
- `type`
- `name`
- `status`
- `authority`
- `owner`
- `source`
- `last_reviewed`
- `evidence_status`

## Stable ID convention

IDs are lowercase and namespace-prefixed:

- `technology:macrocore`
- `system:air-intake`
- `industry:mining`
- `standard:iso-16889`
- `failure-mode:abrasive-wear`
- `evidence:field-test-2026-001`

An ID must never be reused for another concept.

## Relationship governance

Canonical relations use controlled predicates only. Initial predicates:

- `protects`
- `belongs_to_system`
- `applies_to_industry`
- `mitigates`
- `validated_by`
- `supported_by`
- `implemented_in`
- `published_at`
- `cross_references`
- `supersedes`
- `depends_on`

Inferred relationships must include `confidence` and may not be promoted to canonical without review.

## Evidence policy

No engineering or performance claim may be marked `approved` unless it links to at least one `EvidenceRecord` or authoritative standard.

Allowed evidence states:

- `unverified`
- `under_review`
- `validated`
- `rejected`
- `not_required`

## Obsidian role

Obsidian remains the human editing environment. Canonical notes must follow the templates in `knowledge/templates/` and be stored under `knowledge/entities/` before they are treated as approved knowledge.

Working notes may remain outside `knowledge/entities/`, but they are not authoritative.

## Graphify role

Graphify indexes and connects the repository. It may suggest paths and relationships, but:

- `graphify-out/` is generated output.
- Graphify community names are navigation aids.
- `INFERRED` edges are hypotheses.
- Generated reports cannot override canonical entities.

## PostgreSQL role

PostgreSQL remains authoritative for operational catalogue records, live SKUs, cross references, and application data. Phase 1 only defines how those records will later map to canonical entity IDs.

## Acceptance criteria

Phase 1 is complete when:

- schemas exist and are versioned;
- templates exist for the initial entity classes;
- the validator runs without external dependencies;
- CI validates canonical knowledge changes;
- no production database mutation is introduced;
- canonical source authority is documented and enforced.
