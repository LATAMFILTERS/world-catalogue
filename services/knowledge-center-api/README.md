# ELIMFILTERS Knowledge Center API

Phase 3 backend service for the governed Knowledge Center.

## Responsibilities

- Candidate Case intake and review queue.
- Governed status transitions and review decisions.
- Knowledge record and immutable version creation.
- Publication queue creation only when the database approval constraints permit it.
- Notification delivery queue for Microsoft Graph workers.
- Role-based API access and PostgreSQL transactions.

## Base route

`/api/knowledge-center/v1`

## Main endpoints

- `POST /candidate-cases`
- `GET /candidate-cases`
- `GET /candidate-cases/:id`
- `POST /candidate-cases/:id/transitions`
- `POST /candidate-cases/:id/decisions`
- `POST /knowledge-records`
- `POST /knowledge-versions/:id/publications`
- `GET /notifications/queued`
- `PATCH /notifications/:id`

## Authentication contract

Every request requires:

- `x-api-key`
- `x-actor-id` containing an active `knowledge_center.actors.id`
- `x-actor-role`

Production must place the service behind the ELIMFILTERS identity layer or API gateway. Static API keys are an initial service-to-service control, not the final human authentication design.

## Roles

`SUPPORT_REVIEWER`, `ENGINEERING_REVIEWER`, `APPROVER`, `PUBLISHER`, `NOTIFICATION_WORKER`, `SYSTEM`, and `ADMIN`.

## Local execution

```bash
npm install
npm run typecheck
npm run dev
```

The Phase 2 migrations must exist before startup. The service checks the `knowledge_center.architecture_versions` table and fails closed if the schema is unavailable.

## Production boundary

This package is executable source code, but it is not deployed by this PR. Deployment requires Phase 2 migrations, secrets, actor provisioning, gateway authentication, Microsoft Graph worker credentials, smoke tests, and rollback approval.
