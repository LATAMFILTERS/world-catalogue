# Knowledge Channel Gateway — DISABLED

**Status**: Not deployed, not in use

**Why disabled**: This service requires 6+ environment variables that are not configured. The service will not start without them.

**Required secrets to re-enable**:
- `KNOWLEDGE_API_KEY` — API key for knowledge center
- `SYSTEM_ACTOR_ID` — UUID for system actor
- `META_APP_SECRET` — Facebook App Secret
- `META_VERIFY_TOKEN` — Facebook Webhook Verify Token
- `WEB_CHAT_SHARED_SECRET` — Shared secret for web chat webhooks
- `MICROSOFT_GRAPH_TENANT_ID`, `MICROSOFT_GRAPH_CLIENT_ID`, `MICROSOFT_GRAPH_CLIENT_SECRET` — Microsoft Graph credentials

**To re-enable**:
1. Ensure all secrets are available in Render environment variables
2. Rename `render.yaml.disabled` to `render.yaml`
3. Push to main branch
4. Render will automatically deploy the service

**Current deployment status**: ✗ DISABLED (render.yaml renamed to render.yaml.disabled to prevent auto-deployment failures)

---

The main `render.yaml` at repository root has this service commented out because it's still in Phase 2+ development.
