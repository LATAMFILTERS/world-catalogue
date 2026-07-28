# Phase 6 — Knowledge Engine Runtime

## Purpose

Phase 6 turns the approved Layer 4 contracts into an executable runtime. It retrieves only approved, production-eligible Knowledge Center records and returns one governed control action: `ANSWER`, `VERIFY`, `ESCALATE`, or `STOP`.

## Runtime package

`services/knowledge-engine-runtime/`

## API

`POST /api/knowledge-engine/v1/reason`

The request includes the user query, audience, channel, optional Candidate Case, explicit user evidence, and structured context.

## Retrieval boundary

The runtime may retrieve only records where:

- `production_eligible = true`
- lifecycle status is `APPROVED`, `CURRENT`, or `LIMITED_USE`
- the exact current immutable version is available

Drafts, rejected records, superseded records, and Candidate Case hypotheses are excluded from production answers.

## Control policy

- `ANSWER`: approved evidence meets the configured confidence threshold.
- `VERIFY`: evidence is incomplete, contradictory, or below the normal answer threshold.
- `ESCALATE`: no approved record supports the request or a customer-facing answer is below the higher production threshold.
- `STOP`: the request conflicts with governance or attempts to bypass approval and publication controls.

## Traceability

Every run stores an append-only reasoning trace containing:

- trace ID and correlation ID
- Candidate Case link when present
- query, audience, and channel
- retrieved immutable version IDs
- action and confidence
- complete structured response

## Current implementation boundary

The runtime provides deterministic governed retrieval and control decisions. It does not claim deployment, semantic vector ranking, external model activation, automatic diagnosis, or production channel activation. A model may later assist synthesis only after retrieval and policy enforcement, and may never override STOP, ESCALATE, VERIFY, approval, or publication rules.

## Phase 6 acceptance criteria

1. Only approved production-eligible records are retrieved.
2. Every answer identifies exact record versions and sources.
3. Contradictions force VERIFY.
4. Missing approved evidence forces ESCALATE.
5. Governance bypass attempts force STOP.
6. Customer-facing responses use the higher confidence threshold.
7. Every execution produces an immutable reasoning trace.
8. No runtime action approves or publishes knowledge.
9. Health checks fail when the Phase 2 schema is unavailable.
10. Production activation requires migration validation, secrets, load tests, adversarial tests, retrieval-quality tests, and authorized deployment.
