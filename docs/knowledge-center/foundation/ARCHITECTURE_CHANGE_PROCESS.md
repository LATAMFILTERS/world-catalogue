# Architecture Change Process

## Purpose

This process controls changes to the frozen Knowledge Center architecture after v1.0.

## Change request lifecycle

```text
PROPOSED
  ↓
IMPACT_ANALYSIS
  ↓
TECHNICAL_REVIEW
  ↓
APPROVED | REJECTED | RETURNED
  ↓
IMPLEMENTED
  ↓
VERIFIED
  ↓
RELEASED
```

## Required change request fields

Every Architecture Change Request must include:

- Change request ID.
- Requester.
- Date.
- Affected layer or layers.
- Current behavior.
- Proposed behavior.
- Business reason.
- Technical reason.
- Data impact.
- API impact.
- UI impact.
- Security and authorization impact.
- Evidence and source impact.
- Migration requirements.
- Backward compatibility impact.
- Rollback plan.
- Acceptance criteria.
- Reviewer and approver.

## Change classes

### PATCH

Clarification or correction that does not alter approved behavior, taxonomy, authority, state transitions, or production rules.

### MINOR

Backward-compatible architectural extension, such as an optional field, additional supported evidence type, or new implementation profile.

### MAJOR

Any incompatible change to layer responsibility, taxonomy, approval authority, evidence policy, state machine, publication gate, or source-of-truth rule.

## Approval authority

- PATCH: technical reviewer plus repository approval.
- MINOR: engineering reviewer and architecture owner.
- MAJOR: architecture owner and explicit executive approval.

No model, bot, workflow, or code-generation agent may approve an Architecture Change Request.

## Emergency changes

Emergency implementation changes may be deployed only to contain an active production risk. They must:

- Preserve the frozen safety and approval boundaries.
- Be documented immediately.
- Receive retrospective review.
- Be reverted if they cannot be brought into conformity.

Emergency status cannot be used to bypass human approval for knowledge publication.

## Versioning

The Knowledge Center architecture follows semantic versioning:

- PATCH: `1.0.x`
- MINOR: `1.x.0`
- MAJOR: `x.0.0`

Each approved change must update the architecture registry and changelog.

## Repository controls

Architecture changes must be delivered through a pull request that:

- References the Architecture Change Request ID.
- Identifies affected contracts.
- Includes migration and rollback notes when applicable.
- Includes updated acceptance criteria.
- Preserves traceability to the approval decision.

Direct unreviewed changes to frozen architecture are nonconformant.