# Staging Activation Checklist

## Infrastructure

- [ ] Dedicated staging PostgreSQL database exists.
- [ ] Backup schedule is active.
- [ ] Restore test completed and evidence recorded.
- [ ] Staging hostnames and TLS are valid.
- [ ] Identity gateway protects Knowledge Review.
- [ ] Service roles follow least privilege.

## Migrations

- [ ] Phase 2 migration applied and validated.
- [ ] Phase 5 migration applied and validated.
- [ ] Phase 6 migration applied and validated.
- [ ] Phase 7 migration applied and validated.
- [ ] Rollback commands reviewed and rehearsed outside production.

## Services

- [ ] Knowledge Center API build passes.
- [ ] Knowledge Channel Gateway build passes.
- [ ] Knowledge Engine Runtime build passes.
- [ ] Knowledge Review build passes.
- [ ] All health endpoints pass.
- [ ] Graceful shutdown verified.

## Security

- [ ] No secrets are committed.
- [ ] Invalid API keys are rejected.
- [ ] Anonymous Review access is rejected or redirected.
- [ ] Meta signature validation passes positive and negative tests.
- [ ] Internal worker secret validation passes.
- [ ] Logs redact sensitive headers and tokens.
- [ ] Actor mapping is verified.

## Governed behavior

- [ ] Draft knowledge is excluded from runtime retrieval.
- [ ] Missing approved evidence returns ESCALATE.
- [ ] Contradictory evidence returns VERIFY.
- [ ] Governance bypass returns STOP.
- [ ] Candidate Cases cannot approve or publish knowledge.
- [ ] Email replies cannot perform approval.

## Channels

- [ ] WhatsApp fixture accepted once.
- [ ] Instagram fixture accepted once.
- [ ] Facebook Messenger fixture accepted once.
- [ ] LinkedIn fixture accepted once.
- [ ] YouTube fixture accepted once.
- [ ] Web-chat fixture accepted once.
- [ ] Microsoft Graph email fixture accepted once.
- [ ] Duplicate deliveries create no duplicate Candidate Cases.
- [ ] Failed deliveries enter dead-letter handling.

## Evidence and decision

- [ ] Smoke-test output attached to readiness evidence.
- [ ] End-to-end traces contain source, version, actor, channel, and correlation ID.
- [ ] Open incidents reviewed.
- [ ] Rollback owner identified.
- [ ] Technical staging activation approval recorded.
- [ ] Business staging activation approval recorded.

Completion of this checklist authorizes staging testing only. It does not authorize production deployment or customer traffic.
