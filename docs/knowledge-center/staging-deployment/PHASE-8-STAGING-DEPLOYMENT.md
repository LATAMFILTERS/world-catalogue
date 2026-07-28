# Phase 8 — Staging Deployment and Controlled Activation

## Objective

Deploy the Knowledge Center stack into an isolated staging environment, validate service-to-service connectivity, exercise governed workflows, and produce evidence for a later production GO/NO-GO decision.

This phase does not authorize production traffic.

## Staging services

- Knowledge Center API
- Knowledge Channel Gateway
- Knowledge Engine Runtime
- Knowledge Review application
- Dedicated staging PostgreSQL database
- Identity gateway protecting the Review application

## Required isolation

Staging must use separate:

- database credentials;
- API keys;
- Meta verification tokens and app secrets;
- web-chat and internal-worker secrets;
- Microsoft Graph application or test mailbox configuration;
- hostnames;
- logs and alert routing;
- object-storage namespace.

Production secrets must never be copied into staging.

## Deployment order

1. Create and verify the staging database backup policy.
2. Apply Phase 2–7 migrations in order.
3. Run each migration validation script.
4. Deploy Knowledge Center API.
5. Deploy Knowledge Engine Runtime.
6. Deploy Knowledge Channel Gateway with provider delivery disabled.
7. Deploy Knowledge Review behind the identity gateway.
8. Run health and smoke tests.
9. Seed controlled test records.
10. Execute end-to-end acceptance scenarios.
11. Record all evidence in `production_readiness_checks`.

## Controlled activation stages

### Stage 0 — Dark deployment

All services run, but no external provider sends traffic.

### Stage 1 — Internal synthetic traffic

Use signed fixtures and internal test clients. No customer data.

### Stage 2 — Test accounts and test mailbox

Enable only approved sandbox or test identities for Meta, Microsoft Graph, LinkedIn, and YouTube workers.

### Stage 3 — Internal staff pilot

Permit authorized ELIMFILTERS staff to use the Review application and internal runtime endpoints. External automated publication remains disabled.

### Stage 4 — Production readiness review

Review evidence, unresolved incidents, rollback readiness, backup restoration, authorization tests, and channel idempotency. A separate documented GO decision is required before any production deployment.

## Mandatory smoke tests

- Every service health endpoint responds.
- Review application redirects or rejects anonymous access.
- Database readiness checks pass.
- API authentication rejects missing and invalid credentials.
- Runtime returns STOP for governance bypass attempts.
- Runtime returns VERIFY for contradictory evidence.
- Runtime returns ESCALATE when approved knowledge is absent.
- Duplicate provider events create at most one Candidate Case.
- Failed channel events enter the dead-letter workflow.
- Candidate Case creation produces a complete audit trail.

## Rollback trigger

Rollback staging immediately when:

- a migration validation fails;
- immutable records can be modified;
- unauthorized publication is possible;
- channel idempotency fails;
- credentials appear in logs;
- actor mapping cannot be verified;
- backup restoration cannot be demonstrated;
- STOP, VERIFY, or ESCALATE controls are bypassed.

## Completion boundary

Phase 8 is complete at source and deployment-contract level when manifests, environment contracts, smoke tests, rollout stages, rollback steps, and evidence requirements exist in the repository.

Phase 8 is operationally complete only after an authorized operator deploys the isolated staging environment and records passing evidence. Repository changes alone do not constitute a deployment.
