# HERMES Phase 1 — Intake and Review Foundation

Status: IMPLEMENTATION FOUNDATION
Owner: Victor Abreu
Agent status: DEVELOPMENT

## Objective

Create the first executable layer for HERMES without granting it permission to modify canonical Obsidian knowledge, PostgreSQL, pgvector, Part Search, or production assistants.

Phase 1 covers source registration, candidate normalization, evidence retention, deduplication keys, validation, and preparation of the weekly review package.

## Included

1. Governed source registry.
2. Candidate JSON schema matching the Obsidian YAML contract.
3. Validation rules before a candidate may enter `91-pending-review/`.
4. Weekly report data contract.
5. Explicit publication boundary: no database writes.

## Excluded

- Automatic publication into canonical vault folders.
- PostgreSQL or pgvector writes.
- Automatic approval.
- Automatic modification of `unified-data.ts`.
- Unattended competitor-claim conversion into ELIMFILTERS facts.
- Scraping sources whose terms or access rules do not permit automated collection.

## Processing pipeline

```text
Registered source
      ↓
Fetch or manual ingestion
      ↓
Normalize source record
      ↓
Create HERMES candidate
      ↓
Validate required metadata
      ↓
Calculate source hash and deduplication key
      ↓
90-hermes-inbox
      ↓
Evidence and contradiction checks
      ↓
91-pending-review
      ↓
Weekly review package
      ↓
Victor decision
```

## Initial monitoring domains

- OEM launches: trucks, passenger vehicles, engines, construction, mining, agriculture, marine and power-generation equipment.
- Competitors: new product families, references, technologies, applications, acquisitions, technical publications and claims.
- Filter media: cellulose, synthetic, glass fiber, nanofiber, membranes, coatings, resins and adhesives.
- Suppliers: filter-paper mills, media manufacturers and relevant material technology suppliers.
- Standards and patents: filtration standards, test methods, emissions-related application changes and patents.

## Promotion requirements

A candidate may move from inbox to pending review only when:

- `source_url` and `source_publisher` are present;
- publication or capture date is present;
- candidate type is allowed;
- evidence level is declared;
- confidence is between 0 and 1;
- proposed action and affected entities are specified;
- source hash and deduplication key are present;
- no matching active candidate already exists;
- unsupported claims are labeled as `SOURCE_REPORTED` or `HERMES_INFERENCE`;
- `approval_required` remains `true`.

## Weekly review contract

The weekly package must contain:

- reporting period;
- total new candidates;
- duplicates suppressed;
- candidates requiring research;
- candidates grouped by domain;
- evidence level;
- confidence;
- affected canonical entities;
- proposed target folder and entity;
- proposed field-level change;
- recommendation: approve, reject or research;
- immutable candidate code and source hash.

## Exit criteria

Phase 1 is complete only when:

1. At least one candidate from each major domain validates successfully.
2. Duplicate detection is verified.
3. Invalid candidates are rejected with explicit reasons.
4. A weekly review package is generated without database writes.
5. No candidate can bypass Victor approval.
6. Audit records preserve every state transition.

HERMES remains `development` after Phase 1. Operational status requires successful end-to-end collection, email review, approval, controlled publication and rollback testing.
