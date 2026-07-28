# Phase 2 — Acceptance Criteria

## Required artifacts

- [x] Data Platform architecture document.
- [x] Namespaced PostgreSQL schema.
- [x] Core tables for governance, knowledge, evidence, graph, cases, review, approval, publication, notification, and audit.
- [x] Append-only controls for knowledge versions and audit history.
- [x] Production approval and publication integrity constraints.
- [x] Review queue and current knowledge views.
- [x] Query indexes for operational paths.
- [x] Validation script.
- [x] Controlled rollback script.

## Contract-level acceptance

Phase 2 is complete at contract and migration-package level when all required artifacts are present in the reviewed branch and remain aligned with Architecture v1.0.

## Deployment-level acceptance

Production deployment is a separate gate. It requires evidence that:

1. A current database backup exists and restoration has been tested.
2. The migration was executed successfully in a non-production environment.
3. `validate.sql` returns `PASS`.
4. Existing catalogue and `kg_*` objects remain intact.
5. The application role has only required permissions.
6. The rollback procedure was tested outside production.
7. Migration execution and approver identity are recorded.
8. The production connection string and credentials are not stored in Git.
9. Monitoring exists for failed migrations, locks, storage growth, and notification backlog.
10. A maintenance and recovery decision owner is assigned.

## Phase 3 authorization

Phase 3 — Backend Services may begin against this schema contract before production deployment. Any table or state-machine change that alters the approved architecture requires an Architecture Change Request.

## Known implementation boundary

The repository package is executable SQL, but no claim is made that it has been run against the Render PostgreSQL production database. Applying it requires production credentials and an approved deployment operation.
