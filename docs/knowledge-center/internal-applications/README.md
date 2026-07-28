# Phase 4 — Internal Applications

## Delivered application

`apps/knowledge-review/` is the governed internal workspace for Candidate Case review.

## Capabilities

- Review Queue dashboard with open, critical, technical-review, and incomplete counts.
- Candidate Case table with status, priority, protection system, source channel, and creation date.
- Case-detail workspace with the canonical case record, evidence, events, assignments, and decisions returned by the Phase 3 API.
- Controlled status transitions with mandatory reasons.
- Engineering decisions with mandatory rationale and optional target record linkage.
- Explicit separation between review, approval, and publication.
- Server-only API credentials; browser clients never receive the Knowledge Center API key.
- Production identity-gateway enforcement through Cloudflare Access or equivalent authenticated headers.
- No-store data access to prevent stale review state.

## Security boundary

The application is internal. In production it must be placed behind an identity-aware gateway. The middleware rejects requests without both an authenticated-user identity and gateway token. The gateway remains responsible for validating token signatures, audience, expiration, and authorized group membership before forwarding requests.

The Phase 3 API independently enforces actor role permissions. UI visibility is not an authorization control.

## Deployment contract

Required variables:

- `KNOWLEDGE_CENTER_API_URL`
- `KNOWLEDGE_CENTER_API_KEY`
- `KNOWLEDGE_CENTER_ACTOR_ID`
- `KNOWLEDGE_CENTER_ACTOR_ROLE`

Recommended production route:

`knowledge-review.elimfilters.com`

Recommended access policy:

- allow only approved ELIMFILTERS Microsoft 365 identities;
- require multifactor authentication;
- deny public indexing and anonymous access;
- keep API credentials server-side;
- log identity-gateway access separately from Knowledge Center audit events.

## Implementation boundary

The application source is executable but is not claimed as deployed. Production activation requires Phase 2 migrations, Phase 3 API deployment, secret provisioning, actor mapping, identity-gateway configuration, build validation, accessibility checks, browser smoke tests, and authorized deployment.
