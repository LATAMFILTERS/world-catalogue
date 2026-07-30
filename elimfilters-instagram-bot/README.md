# ELIMFILTERS LinkedIn Bot

Official LinkedIn AI Assistant for ELIMFILTERS Organization Page.

## Configuration Environment Variables

- `PORT`: Server port (default 10000)
- `LINKEDIN_CLIENT_ID`: LinkedIn Developer App Client ID (`866h35ln0x9989`)
- `LINKEDIN_CLIENT_SECRET`: LinkedIn Developer App Client Secret
- `LINKEDIN_ORGANIZATION_ID`: LinkedIn Company Page ID (`133064152`)
- `LINKEDIN_VERIFY_TOKEN`: Webhook verify token
- `DATABASE_URL`: PostgreSQL connection string (shared with `elimfilters-instagram-db`)
- `NVIDIA_NIM_API_KEY`: NVIDIA NIM API Key for AI responses
- `NVIDIA_MODEL`: Model name (`nvidia/nemotron-3-super-120b-a12b`)
- `DRY_RUN`: `true` to generate draft responses in database without posting directly

## Endpoints

- `GET /health` - Health check and status
- `GET /privacy` - Privacy policy
- `GET /terms` - Terms of service
- `GET /review-drafts` - Review generated AI drafts in DRY_RUN mode
- `GET /webhook` - LinkedIn Webhook verification
- `POST /webhook` - LinkedIn Webhook event handler
