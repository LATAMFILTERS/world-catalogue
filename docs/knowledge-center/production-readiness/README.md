# Phase 7 — Validation, Observability, and Production Readiness

## Purpose

Phase 7 defines the release controls required before any Knowledge Center component can be activated in production.

## Scope

- Database migration validation.
- Service build and contract validation.
- Authentication and authorization tests.
- Governance-control tests.
- Channel webhook signature and idempotency tests.
- Knowledge Runtime ANSWER, VERIFY, ESCALATE, and STOP tests.
- Structured logging and correlation IDs.
- Health, readiness, latency, error, queue-depth, and decision metrics.
- Incident severity and response procedures.
- Backup, restore, rollback, and disaster-recovery verification.
- Controlled go/no-go decision.

## Required production checks

A production release is blocked until all required checks are PASS. A WAIVED check requires a named approver, written rationale, expiration date, and compensating control.

1. Phase 2–7 migrations validated on a non-production database.
2. Database backup and restore exercise completed.
3. Least-privilege database roles verified.
4. API keys and provider secrets stored outside the repository.
5. Cloudflare Access or equivalent identity gateway validated for the internal review application.
6. Human actor mapping validated end to end.
7. Meta webhook signatures validated with positive and negative fixtures.
8. Web-chat and internal-worker shared secrets validated.
9. Duplicate provider events confirmed not to create duplicate Candidate Cases.
10. Candidate Case creation, assignment, notification, review, approval, and publication boundaries verified.
11. Draft, rejected, retired, and non-production-eligible knowledge excluded from runtime retrieval.
12. Contradiction tests force VERIFY.
13. Missing approved evidence forces ESCALATE.
14. Governance-bypass attempts force STOP.
15. Customer-facing confidence threshold is not lower than the internal threshold.
16. Reasoning traces contain correlation ID, retrieved versions, sources, action, and confidence.
17. Logs redact API keys, authorization headers, provider tokens, and sensitive payload fields.
18. Service health endpoints and dependency readiness checks operate correctly.
19. Alert routes and incident ownership are configured.
20. Rollback and channel-disable procedures are rehearsed.

## Core service-level objectives

Initial objectives are release targets, not claims of measured production performance:

- API availability target: 99.9% monthly.
- Internal review application availability target: 99.5% monthly.
- Candidate Case creation p95 target: under 2 seconds, excluding provider delivery latency.
- Knowledge Runtime p95 target: under 3 seconds without an external synthesis model.
- Duplicate Candidate Case rate from repeated provider events: 0.
- Unauthorized approval or publication events: 0.
- Untraceable production answers: 0.

## Required metrics

- Request count, duration, and status by service and route.
- Authentication and authorization failures.
- Candidate Cases created by channel.
- Duplicate channel events suppressed.
- Dead-letter queue depth and oldest-item age.
- Notification queue depth and delivery failures.
- Review queue depth and overdue assignments.
- Runtime actions by ANSWER, VERIFY, ESCALATE, and STOP.
- Runtime confidence distribution by audience.
- Retrieval result count and contradiction count.
- Database connection saturation and query latency.
- Incident count and time to acknowledge, mitigate, and resolve.

## Release decision

The production-readiness record must include:

- target environment;
- release commit SHA;
- migration versions;
- evidence for every required check;
- unresolved risks;
- rollback owner;
- technical approver;
- business approver;
- final GO or NO-GO decision.

Source code and migration packages in this repository do not constitute production activation.
