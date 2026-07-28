# Phase 2 — Knowledge Center Data Platform

## Status

`IMPLEMENTATION_BASELINE`

This phase translates the approved Knowledge Center Layers 1–5 into a PostgreSQL data model and migration package. It establishes persistence contracts only; production deployment remains a controlled operational action.

## Objectives

- Preserve approved knowledge, drafts, evidence, relationships, reviews, notifications, and audit history.
- Support Layer 3 record versioning and Layer 4 graph/retrieval needs.
- Support Layer 5 Candidate Cases, review queues, approval ledgers, and notification delivery.
- Prevent destructive overwrites of governed records.
- Provide explicit validation and rollback procedures.

## Database boundary

The package targets PostgreSQL with optional `pgvector` support. All Knowledge Center objects use the `knowledge_center` schema to avoid collision with legacy catalogue tables and existing `kg_*` structures.

## Core domains

### Governance and identity

- `actors`
- `architecture_versions`
- `change_requests`

### Canonical knowledge

- `knowledge_records`
- `knowledge_record_versions`
- `sources`
- `record_sources`
- `evidence_items`
- `record_evidence`

### Knowledge Graph

- `knowledge_relationships`
- `knowledge_embeddings`

### Candidate Case and review workflow

- `candidate_cases`
- `candidate_case_events`
- `review_assignments`
- `review_decisions`
- `approval_records`
- `publication_records`

### Notifications and audit

- `notification_deliveries`
- `audit_log`

## Record rules

1. Stable entities have UUID primary keys and human-readable external IDs.
2. Mutable governed content is versioned through append-only version tables.
3. `knowledge_records.current_version_id` points to the active version but previous versions remain immutable.
4. Candidate Case state transitions are preserved in `candidate_case_events`.
5. Approval and publication are separate records.
6. A record cannot become production eligible without a valid approval record.
7. Notification failure cannot remove or close a review assignment.
8. Graph relationships reference stable record IDs, not mutable version IDs, while evidence and claims may point to exact versions.
9. Deletion of governed records is represented through lifecycle status, not physical deletion.
10. Audit events are append-only.

## Identifier formats

- Knowledge record: `KC-{TYPE}-{NNNNNN}`
- Candidate Case: `KCC-{YYYY}-{NNNNNN}`
- Approval: `KCA-{YYYY}-{NNNNNN}`
- Architecture change request: `ACR-{YYYY}-{NNNN}`

The database stores UUIDs as internal keys and external IDs as unique business identifiers.

## Migration package

- `migrations/knowledge-center-phase2/001_create_schema.sql`
- `migrations/knowledge-center-phase2/002_indexes_and_constraints.sql`
- `migrations/knowledge-center-phase2/validate.sql`
- `migrations/knowledge-center-phase2/rollback.sql`

## Deployment order

```text
backup
  ↓
001_create_schema.sql
  ↓
002_indexes_and_constraints.sql
  ↓
validate.sql
  ↓
application compatibility checks
  ↓
controlled activation
```

## Production gate

Phase 2 is accepted when:

- migrations execute in a transaction-capable PostgreSQL environment;
- validation reports all required objects and constraints;
- rollback has been tested outside production;
- no existing catalogue tables are modified destructively;
- application credentials use least privilege;
- backups and recovery procedures are confirmed;
- schema version is recorded in `knowledge_center.schema_migrations`.

## Explicit non-claims

This package does not claim that:

- migrations have been applied to Render production;
- Microsoft Graph credentials exist;
- the review UI or backend APIs are deployed;
- existing Layer 3 YAML records have been imported;
- embeddings have been generated;
- channel integrations are active.
