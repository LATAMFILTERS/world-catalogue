# Phase 5 — Channel Integration

## Purpose

Phase 5 converts technical interactions from approved operational channels into governed Candidate Cases. It does not publish knowledge, approve conclusions, or bypass human review.

## Implemented package

- `services/knowledge-channel-gateway/`
- `migrations/knowledge-center-phase5/`

## Supported channels

| Channel | Provider boundary | Intake route |
|---|---|---|
| WhatsApp Business | Meta Graph webhook | `GET/POST /webhooks/meta` |
| Instagram Messaging | Meta Graph webhook | `POST /webhooks/meta` |
| ELIMFILTERS web chat | Shared-secret server webhook | `POST /webhooks/web-chat` |
| Email | Microsoft Graph subscription/worker | `POST /internal/email-events` |
| Controlled imports | Database contract reserved | channel value `IMPORT` |

## Processing flow

1. Verify provider signature or internal credential.
2. Normalize the provider payload.
3. Upsert the external conversation.
4. Insert the event using provider-level idempotency.
5. Ignore nontechnical events without deleting them.
6. Create a Candidate Case through the Phase 3 API when technical signals are present.
7. Link the channel event to the Candidate Case.
8. Send failures to the dead-letter queue.
9. Route review notification through `support@elimfilters.com` using the existing Phase 3/Layer 5 workflow.

## Security controls

- Meta `X-Hub-Signature-256` validation.
- Separate Meta verification token.
- Server-to-server shared secret for web chat.
- API-key restriction for the Microsoft Graph mail worker.
- Raw and normalized payload separation.
- Idempotency by channel, provider, and external event ID.
- Attachment quarantine and malware-scan status contract.
- Payload size limit.
- No direct database access from public channel clients.
- No automated technical approval or publication.

## Candidate Case boundary

The gateway uses conservative technical-signal detection. A message that does not meet the intake rule remains stored as `IGNORED`; it is not discarded. The Knowledge Engine may later replace the initial classifier, but only through a governed change.

## Microsoft Graph boundary

This phase defines the email ingestion endpoint and database contract. A production Microsoft Graph subscription worker must:

- monitor the approved mailbox;
- retrieve the message using application permissions;
- strip unsafe HTML and remote tracking content;
- submit normalized text to `/internal/email-events`;
- store attachments in approved object storage;
- renew subscriptions before expiration;
- maintain Graph delta tokens;
- never approve or publish by interpreting an email reply.

The official review mailbox remains `support@elimfilters.com`.

## Deployment acceptance criteria

- Phase 2 and Phase 5 migrations pass in nonproduction.
- Duplicate provider deliveries create one `channel_events` row.
- Invalid Meta signatures return HTTP 401.
- Invalid web-chat and internal credentials return HTTP 401.
- Technical WhatsApp, Instagram, web-chat, and email samples create Candidate Cases.
- Nontechnical samples remain traceable and do not create cases.
- Failed Candidate Case creation produces a dead-letter record.
- Attachments cannot become evidence until storage, checksum, and malware scanning are complete.
- Production secrets are held outside the repository.
- Meta webhook, Microsoft Graph subscription, DNS, and deployment activation are separately authorized.

## Implementation boundary

Source code and migrations are executable, but this repository does not claim that Meta webhook subscriptions, permanent access tokens, Microsoft Graph application permissions, mailbox subscriptions, object storage, or production secrets are active.
