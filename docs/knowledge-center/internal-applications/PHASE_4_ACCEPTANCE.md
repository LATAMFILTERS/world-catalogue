# Phase 4 Acceptance Criteria

## Contract-level acceptance

- [x] Internal review application source exists.
- [x] Review queue consumes the Phase 3 API.
- [x] Case detail exposes evidence and history.
- [x] Status transitions require a reason.
- [x] Engineering decisions require a rationale.
- [x] Review and publication remain separate operations.
- [x] API credentials remain server-side.
- [x] Production requests require an identity-aware gateway.
- [x] UI authorization does not replace API role enforcement.
- [x] Deployment boundaries are documented.

## Deployment-level acceptance

- [ ] Phase 2 migrations pass `validate.sql` in the target environment.
- [ ] Phase 3 API health and authorization smoke tests pass.
- [ ] Cloudflare Access or equivalent validates identity tokens and group membership.
- [ ] Microsoft 365 reviewer identities are mapped to Knowledge Center actors and roles.
- [ ] Unauthorized and anonymous requests return 401/403.
- [ ] Queue, detail, transition, decision, and error paths pass browser tests.
- [ ] Accessibility checks cover keyboard navigation, labels, focus, contrast, and error feedback.
- [ ] Audit records identify the real human actor rather than a shared deployment actor.
- [ ] Secrets are stored in the deployment platform and absent from browser bundles and logs.
- [ ] Rollback and incident contacts are approved before activation.

Phase 4 is complete at source and contract level when the first section is satisfied. It is production complete only when every deployment-level criterion is evidenced and approved.
