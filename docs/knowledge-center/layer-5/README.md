# Layer 5 — Knowledge Evolution Engine

## Purpose

Layer 5 converts operational interactions into controlled, reviewable technical knowledge without allowing any channel, model, or automation to publish engineering conclusions directly.

The official record is the Knowledge Center database. Email is a notification and routing mechanism only. Human review occurs in the internal Knowledge Review workspace.

## Operating flow

```text
WhatsApp / Web / Instagram / Email / Distributor / Support
                         ↓
                 Structured Case Intake
                         ↓
              Candidate Case in database
                         ↓
               Review Queue assignment
                         ↓
          Email notification with secure link
                         ↓
            Internal Knowledge Review page
                         ↓
 Evidence review → Engineering review → Approval record
                         ↓
       Publish to Layer 3 and refresh Layer 4 indexes
```

## Mandatory components

1. Candidate Case Registry — source of truth for all captured cases, evidence, statuses, assignments, and history.
2. Knowledge Review Queue — internal page where reviewers filter, open, assign, and decide cases.
3. Notification Service — sends event-driven email alerts containing a summary and secure deep link.
4. Review Workspace — displays the original interaction, evidence, proposed reasoning, contradictions, related cases, and allowed decisions.
5. Approval Ledger — immutable record of who approved, rejected, merged, returned, or published each revision.
6. Publishing Service — creates or updates Layer 3 records only after a valid approval record exists.
7. Measurement Loop — records usage, outcome, resolution, recurrence, escalation, and confidence calibration.

## Source-of-truth rule

Email must never be treated as the technical record. Attachments may be referenced or mirrored into governed storage, but all review decisions and evidence links must be recorded against the Candidate Case ID.

## Review states

```text
CAPTURED
INCOMPLETE
UNDER_ANALYSIS
DUPLICATE
CLUSTERED
DRAFTED
TECHNICAL_REVIEW
APPROVED
REJECTED
PUBLISHED
```

## Outcome states

```text
RESOLVED
PARTIALLY_RESOLVED
NOT_RESOLVED
MISDIAGNOSED
AWAITING_VERIFICATION
UNKNOWN
```

## Knowledge validity states

```text
CURRENT
REVIEW_DUE
UNDER_REVIEW
LIMITED_USE
SUPERSEDED
RETIRED
```

## Non-negotiable controls

- No conversation publishes itself.
- No isolated observation becomes approved technical truth.
- Claude Code and other models may classify, compare, cluster, summarize, and draft, but may not approve or publish.
- Email links must require authenticated access.
- Approval actions must be completed inside the review workspace, not by replying to the email.
- Every state change must record actor, timestamp, previous state, new state, and reason.
- Contradictions and rejected evidence remain preserved.
- Publication requires an approval record and a production-eligible target record.
- Failed email delivery must not lose the review item; the queue remains authoritative.

## Initial notification target

The default shared mailbox is configurable. Recommended production address:

```text
engineering_review@elimfilters.com
```

A separate mailbox such as `knowledge_review@elimfilters.com` may be used later without changing the workflow contract.

## Implementation boundary

This layer defines the approved data, workflow, notification, review, and publishing contracts. Provider credentials, Microsoft Graph configuration, database migrations, and the internal review UI are implementation tasks that must conform to these contracts.
