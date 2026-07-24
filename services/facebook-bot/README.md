# ELIMFILTERS Facebook Bot

Facebook Page connector for the ELIMFILTERS multichannel knowledge platform.

## Implemented flow

- Meta webhook verification at `GET /webhook`
- `X-Hub-Signature-256` validation for incoming events
- Facebook Page comment events from the `feed` webhook field
- Facebook Messenger text events
- Canonical knowledge service request through `KNOWLEDGE_BASE_URL`
- Real comment replies through `/{comment-id}/comments`
- Real Messenger replies through `/me/messages`
- PostgreSQL event deduplication and audit log
- `DRY_RUN`, `/health`, and `/ready`

## Render

Create a Blueprint from this repository and select:

```text
services/facebook-bot/render.yaml
```

The service root directory is already set to:

```text
services/facebook-bot
```

Load the secrets listed in `.env.example`. Keep `DRY_RUN=true` until the Page webhook and a real test event have been confirmed.

## Meta configuration

Use the deployed callback URL:

```text
https://elimfilters-facebook-bot.onrender.com/webhook
```

Subscribe the Facebook Page to the `feed` field for comment replies. For Messenger support, subscribe the Page messaging events required by the Meta application.
