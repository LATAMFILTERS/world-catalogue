# Phase 7 Test Matrix

## Governance tests

| ID | Test | Expected result |
|---|---|---|
| GOV-001 | Attempt to update an immutable knowledge version | Database rejects the update |
| GOV-002 | Attempt to delete an audit or reasoning trace | Database rejects the deletion |
| GOV-003 | Attempt production publication without matching approval | Database rejects publication |
| GOV-004 | Attempt runtime retrieval of DRAFT knowledge | No draft record is returned |
| GOV-005 | Attempt channel-driven approval or publication | Request is rejected |
| GOV-006 | Submit instruction to bypass approval | Runtime returns STOP |

## Runtime tests

| ID | Test | Expected result |
|---|---|---|
| RUN-001 | Approved current record with sufficient evidence and confidence | ANSWER |
| RUN-002 | Conflicting approved sources | VERIFY |
| RUN-003 | No approved evidence | ESCALATE |
| RUN-004 | Missing asset identifiers or measurements | VERIFY |
| RUN-005 | Customer-facing confidence below configured threshold | VERIFY or ESCALATE; never ANSWER |
| RUN-006 | Trace inspection | Exact versions, sources, action, confidence, audience, and correlation ID present |

## Channel tests

| ID | Test | Expected result |
|---|---|---|
| CHN-001 | Valid Meta signature | Event accepted |
| CHN-002 | Invalid Meta signature | HTTP 401/403 and no event persisted |
| CHN-003 | Repeat identical provider event | One channel event and at most one Candidate Case |
| CHN-004 | Invalid web-chat shared secret | Request rejected |
| CHN-005 | Invalid internal-worker secret | Request rejected |
| CHN-006 | Processing failure | Event quarantined in dead-letter records |
| CHN-007 | Attachment before malware-scan clearance | Attachment unavailable to reasoning and review workflows |

## Review application tests

| ID | Test | Expected result |
|---|---|---|
| APP-001 | Anonymous production access | Blocked by identity gateway |
| APP-002 | Reviewer attempts publisher-only action | API rejects action |
| APP-003 | Status transition without reason | Validation rejects submission |
| APP-004 | Decision without rationale | Validation rejects submission |
| APP-005 | Browser refresh after mutation | Current no-store data displayed |
| APP-006 | Keyboard-only review workflow | All controls reachable and operable |

## Operational tests

| ID | Test | Expected result |
|---|---|---|
| OPS-001 | Database unavailable | Readiness fails; service does not report ready |
| OPS-002 | SIGTERM during traffic | Service stops accepting traffic and exits gracefully |
| OPS-003 | Secret appears in structured log input | Secret is redacted |
| OPS-004 | Alert threshold breach | Alert reaches assigned operational route |
| OPS-005 | Backup restore exercise | Schema, records, constraints, and migration history verified |
| OPS-006 | Rollback rehearsal | Documented rollback completes without modifying immutable historical records |

## Exit rule

All critical tests must pass. No failed GOV, RUN, CHN security, or backup/restore test may be waived for a production GO decision.
