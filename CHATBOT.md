# ELIMFILTERS Chatbot Service

AI-powered technical support chatbot for filter inquiries. Supports **3 channels**: web widget, WhatsApp, distributor API. **3 languages**: Spanish, English, Portuguese.

## Architecture

```
User Input
    ↓
┌─ Web Widget ──→ POST /api/chat
├─ WhatsApp ────→ POST /webhook/whatsapp (Twilio)
└─ Dist. API ───→ POST /api/chat/distributor (API key auth)
    ↓
ChatbotService (Groq LLM + PostgreSQL lookup)
    ↓
Response (format adapted by channel)
```

## Features

- **Groq LLM** — Llama 3.3 70B for intelligent responses
- **Database Context** — Queries ELIMFILTERS catalog (SKU, OEM codes, specs)
- **Multilingual** — Auto-detects language (ES/EN/PT)
- **Multi-channel** — Web, WhatsApp, REST API
- **Smart Responses** — Returns matching filters with specs

## Setup

### 1. Environment Variables

Add to `.env`:

```env
GROQ_API_KEY=gsk_...
TWILIO_ACCOUNT_SID=ACa...
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 2. Install Dependencies

```bash
npm install twilio groq-sdk dotenv
```

### 3. Start Server

```bash
npm start
```

## API Endpoints

### Chat (Web & Distributor)

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "¿Qué filtro de aceite para Caterpillar?",
  "language": "es",
  "userId": "user123"
}
```

Response:

```json
{
  "message": "Para Caterpillar, recomendamos...",
  "language": "es",
  "filters": [
    {
      "sku": "EL81808",
      "codigo_base": "1R1808",
      "filter_type": "OIL",
      "duty": "HEAVY_DUTY"
    }
  ],
  "timestamp": "2025-04-13T12:00:00Z"
}
```

### Distributor API (Authenticated)

```bash
POST /api/chat/distributor
Content-Type: application/json
X-API-Key: elim_distributor_001

{
  "message": "Cross-reference for Donaldson P502090?",
  "language": "en"
}
```

**Header:** `X-API-Key: elim_<distributor_id>`

### WhatsApp Webhook

Configured in Twilio sandbox:

```
POST https://your-server/webhook/whatsapp
```

When user sends WhatsApp message to `+14155238886`, chatbot responds automatically.

## Web Widget Embed

Add to website:

```html
<script 
  src="https://elimfilters-api.railway.app/assets/chatbot-widget.js"
  data-language="es"
></script>
```

Auto-initializes floating chatbot button. Configuration:

```javascript
new ElimfiltersChatbot({
  apiUrl: 'https://elimfilters-api.railway.app',
  position: 'bottom-right',
  language: 'es'
});
```

## Language Detection

Automatic based on keywords:

| Language | Keywords | Default |
|----------|----------|---------|
| Spanish | olá, oi, qué, filtro de | Yes |
| English | hello, hi, what, filter | |
| Portuguese | olá, oi, qual, filtro de | |

Override with `language` param in request.

## Troubleshooting

### "Invalid API key"

Check `.env` GROQ_API_KEY is set correctly.

### WhatsApp not responding

1. Verify Twilio webhook URL in console
2. Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env`
3. Test: `curl -X GET https://your-server/webhook/whatsapp`

### Distributor API 401

Check `X-API-Key` header format: `elim_<id>`

## Testing

**Chat endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What oil filter for Caterpillar?"}'
```

**WhatsApp (requires Twilio):**
```
Message +14155238886: "EL81808 specs?"
```

**Health check:**
```bash
curl http://localhost:3000/api/chat/health
curl http://localhost:3000/webhook/whatsapp
```

## Files

| File | Purpose |
|------|---------|
| `services/chatbot.service.js` | Core service (Groq + DB) |
| `routes/chat.routes.js` | Web/Distributor API endpoints |
| `routes/whatsapp.routes.js` | Twilio WhatsApp webhook |
| `assets/chatbot-widget.js` | Embeddable web widget |
| `.env` | Environment config |

## Future

- [ ] Conversation history per user
- [ ] Caching frequent queries
- [ ] Meta Cloud API (replace Twilio)
- [ ] PDF documentation generation
- [ ] Multilingual system prompt improvements
