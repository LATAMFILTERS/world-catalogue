# Phase 5 Social Channel Extension

## Added channels

- Facebook Messenger
- LinkedIn
- YouTube

## Facebook Messenger

Facebook Messenger shares the Meta webhook security boundary with WhatsApp and Instagram. Events are normalized using the provider message ID, sender, recipient, timestamp, text, and attachments. Production deployment must retain Meta webhook verification and `X-Hub-Signature-256` validation before processing.

## LinkedIn

LinkedIn events are accepted through a restricted internal ingestion endpoint. This accommodates the specific LinkedIn products and permissions approved for the ELIMFILTERS organization, including comments, mentions, direct messages where available, and lead events. The upstream worker must validate LinkedIn authorization and forward only verified events.

## YouTube

YouTube comments, replies, live-chat messages, and mentions are accepted through a restricted internal ingestion endpoint. The upstream worker is responsible for Google OAuth, API polling or push-notification validation, pagination, quota control, and acknowledgement.

## Common rules

All three channels use the Phase 5 normalized event, conversation, idempotency, attachment, dead-letter, technical-signal, and Candidate Case boundaries.

They may create or enrich Candidate Cases. They cannot approve conclusions, alter immutable knowledge versions, or publish knowledge.

## Added routes

- `POST /webhooks/facebook-messenger`
- `POST /internal/linkedin-events`
- `POST /internal/youtube-events`

The LinkedIn and YouTube endpoints require `x-channel-secret`. Production traffic must also be restricted by network policy or an authenticated gateway.

## Deployment boundary

Source contracts are implemented. Production activation still requires provider applications, approved permissions, tokens, subscriptions or polling workers, signature validation, quota monitoring, secrets, and authorized deployment.
