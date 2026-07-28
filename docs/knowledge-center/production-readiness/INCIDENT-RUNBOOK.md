# Incident and Rollback Runbook

## Severity

- SEV1: unauthorized publication, governance bypass, data corruption, credential compromise, or widespread production outage.
- SEV2: major channel, review, or reasoning failure with no safe automated workaround.
- SEV3: partial degradation, growing queues, repeated provider failures, or elevated latency.
- SEV4: minor defect with limited operational impact.

## Immediate controls

For SEV1 or suspected governance failure:

1. Disable outbound channel responses and publication workers.
2. Revoke or rotate affected API keys and provider tokens.
3. Preserve logs, reasoning traces, channel events, audit records, and database snapshots.
4. Restrict the internal review application to incident responders.
5. Stop the affected service if continued execution could publish, mutate, or expose unsafe data.
6. Open an incident record with correlation IDs and affected services.
7. Notify the technical owner and business approver.

## Component isolation

- Channel gateway: disable provider webhook route or worker; preserve inbound payloads for replay.
- Knowledge Runtime: remove from channel routing; channels must return a controlled escalation message.
- Review application: block access through the identity gateway if actor mapping is uncertain.
- Backend API: disable mutating routes at the gateway if authorization behavior is suspect.
- Publication worker: stop immediately when approval integrity is uncertain.
- Notification worker: pause if duplicate or sensitive messages are being sent.

## Rollback order

1. Stop traffic to the affected release.
2. Verify backup and current database state.
3. Roll back application containers to the last approved commit.
4. Roll back schema only when the migration is explicitly reversible and immutable history is preserved.
5. Re-run migration validation and governance tests.
6. Restore traffic gradually.
7. Confirm queues, dead letters, notifications, and channel subscriptions.

## Recovery verification

- Health and readiness PASS.
- Authentication and role checks PASS.
- No draft or rejected knowledge is retrievable.
- STOP, VERIFY, and ESCALATE controls PASS.
- Provider duplicate replay creates no duplicate Candidate Case.
- Publication remains impossible without matching approval.
- Correlation IDs and traces are complete.

## Closure

Incident closure requires root cause, impact, timeline, corrective actions, control changes, owner, due dates, and evidence that recurrence tests have been added.
