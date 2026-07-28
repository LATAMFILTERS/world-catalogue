# Phase 3 — Backend Services Acceptance

## Delivered services

1. Candidate Case Service
2. Review Service
3. Knowledge Service
4. Publishing Service
5. Notification Queue Service
6. API access layer
7. PostgreSQL transaction and health layer

## Contract-level acceptance

- All mutating operations use parameterized SQL.
- Candidate Case creation also creates an event, review assignment, and idempotent notification record.
- Review decisions require engineering, approver, or administrator roles.
- Publication creation requires publisher or administrator roles and remains subject to Phase 2 database constraints.
- Email notification records default to `support@elimfilters.com`.
- API secrets are loaded from environment variables and are not committed.
- Request validation rejects malformed payloads.
- Database unavailability causes startup failure rather than degraded ungoverned operation.
- Sensitive headers are redacted from HTTP logs.
- Historical knowledge versions and audit records remain protected by database controls.

## Deployment acceptance

Phase 3 is deployable only after all of the following are verified:

- Phase 2 migrations validated in the target environment.
- Node.js 20 or later.
- Dependency installation and TypeScript build succeed.
- Service actors exist in `knowledge_center.actors`.
- Production API keys or gateway identity are provisioned.
- Least-privilege database role is configured.
- Microsoft Graph notification worker is connected separately.
- Health, intake, queue, transition, decision, and publication smoke tests pass.
- Backup and rollback procedures are approved.

## Explicit boundary

This phase provides the governed backend runtime and queue contracts. It does not provide the Phase 4 internal review user interface, the Phase 5 channel adapters, or the Phase 6 reasoning runtime.
