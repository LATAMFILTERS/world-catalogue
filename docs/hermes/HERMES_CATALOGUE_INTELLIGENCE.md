# HERMES Catalogue Intelligence

## Purpose

HERMES converts verified industry intelligence into governed catalogue-update candidates for ELIMFILTERS. It never writes directly to the production catalogue.

## Controlled flow

1. Detect a new product, application, cross-reference, supersession, discontinuation, technical change, catalogue conflict, coverage gap, or environmental improvement.
2. Preserve official source URLs, source date, evidence, and environmental impact.
3. Compare the discovery with a read-only catalogue snapshot.
4. Generate a structured candidate.
5. Require human review and explicit approval before publication.
6. Use the existing HERMES publication, audit, backup, and rollback controls for any approved downstream change.

## Command

```bash
npm run hermes:catalogue -- <discoveries.json> <catalog.json> [output-directory]
```

Default output directory:

```text
hermes/catalogue-candidates
```

The command is permanently dry-run and reports `publication_enabled: false`.

## Candidate statuses

- `VERIFIED_OFFICIAL`
- `VERIFIED_MULTI_SOURCE`
- `REVIEW_REQUIRED`
- `CONFLICTING_DATA`
- `INSUFFICIENT_DATA`
- `REJECTED`
- `APPROVED_FOR_PUBLICATION`
- `PUBLISHED`

`APPROVED_FOR_PUBLICATION` requires approval metadata with `approved_by`.

## Environmental intelligence

Each candidate can carry environmental evidence for carbon, energy, water, waste, recyclability, hazardous materials, resource efficiency, equipment-life extension, fluid-life extension, fuel efficiency, circular economy, regulatory risk, and severity.

## Safety guarantees

- No PostgreSQL writes.
- No pgvector writes.
- No unified-data writes.
- No production catalogue writes.
- No automatic publication.
- No silent overwrites.
- Source and decision traceability are mandatory.

## Tests

```bash
npm run test:hermes-phase6
```
