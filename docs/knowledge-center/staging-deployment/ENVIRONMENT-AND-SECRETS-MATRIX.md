# Environment and Secrets Matrix

## General rules

- Secrets are injected by the hosting platform and are never committed.
- Staging and production use different values and principals.
- Every credential has an owner, purpose, rotation date, and revocation procedure.
- Logs must redact authorization headers, cookies, tokens, signatures, connection strings, and email access tokens.

## Knowledge Center API

| Variable | Classification | Staging requirement |
|---|---|---|
| `DATABASE_URL` | Secret | Dedicated staging database role with least privilege |
| `API_KEYS_JSON` | Secret | Staging-only keys mapped to named actors and roles |
| `LOG_LEVEL` | Configuration | `info` unless troubleshooting is approved |

## Channel Gateway

| Variable | Classification | Staging requirement |
|---|---|---|
| `DATABASE_URL` | Secret | Dedicated staging role |
| `KNOWLEDGE_CENTER_API_URL` | Configuration | Staging API hostname only |
| `KNOWLEDGE_CENTER_API_KEY` | Secret | Candidate-intake role only |
| `META_APP_SECRET` | Secret | Test Meta application |
| `META_VERIFY_TOKEN` | Secret | Staging-specific verification token |
| `WEB_CHAT_SHARED_SECRET` | Secret | Staging web-chat producer only |
| `INTERNAL_WORKER_SHARED_SECRET` | Secret | Staging LinkedIn, YouTube, and email workers only |

## Knowledge Engine Runtime

| Variable | Classification | Staging requirement |
|---|---|---|
| `DATABASE_URL` | Secret | Read access to approved knowledge plus append access to reasoning traces |
| `API_KEYS_JSON` | Secret | Staging-only caller identities |
| `CUSTOMER_CONFIDENCE_THRESHOLD` | Configuration | Minimum `0.90` |
| `INTERNAL_CONFIDENCE_THRESHOLD` | Configuration | Minimum `0.75` |

## Knowledge Review

| Variable | Classification | Staging requirement |
|---|---|---|
| `KNOWLEDGE_CENTER_API_URL` | Configuration | Staging API hostname only |
| `KNOWLEDGE_CENTER_API_KEY` | Secret | Server-side only; never exposed to the browser |
| `IDENTITY_GATEWAY_REQUIRED` | Configuration | Must be `true` |

## Rotation evidence

For every secret, record:

- secret name;
- owning service;
- authorized owner;
- creation date;
- last rotation date;
- next rotation date;
- revocation test result;
- evidence reference.
