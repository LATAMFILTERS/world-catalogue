# ELIMFILTERS AI Engine 🧠

Industrial Intelligence Layer for complex filter queries.

## Architecture

```
Frontend (Next.js)
    ↓
Search Server (Railway port 8080)
    ↓
AI Engine (Railway port 3001) ← THIS SERVICE
    ↓
PostgreSQL (postgres-production-2529.up.railway.app)
```

**Key Rule:** AI Engine is INDEPENDENT from Search Server. It reads from PostgreSQL but never modifies it.

## What This Service Does

1. **Intent Detection** - Understands what user really wants (cross-ref? machine lookup?)
2. **Entity Extraction** - Pulls out technical codes, machine names, technologies
3. **RAG Pipeline** - Retrieves relevant context from PostgreSQL
4. **Tool-Based Search** - Intelligently uses tools to find best matches
5. **LLM Reasoning** - GPT-4 or GROQ processes everything
6. **Result Ranking** - Orders results by relevance

## Example Flow

### Query: "equivalente a LF9009 para Caterpillar en Texas"

1. **Intent Detection**: CROSS_REFERENCE
2. **Entity Extraction**: `codes: ["LF9009"]`, `machines: ["Caterpillar"]`
3. **RAG Retrieval**: Search cross_references table for LF9009
4. **Tool Calling**: `findCrossReference("LF9009")`
5. **LLM Reasoning**: Filter results for Caterpillar compatibility
6. **Result Ranking**: Most relevant equivalents first

## Endpoints

### POST /ai/query
Full RAG pipeline with tool calling.
```json
{
  "query": "equivalente a LF9009 para Caterpillar"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "query": "...",
    "intent": "CROSS_REFERENCE",
    "entities": { "codes": [...], "machines": [...] },
    "llmResponse": "...",
    "products": [...],
    "timestamp": "..."
  }
}
```

### POST /ai/intent
Just classify intent, no tools.
```json
{
  "query": "need oil filter for diesel truck"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "intent": "PRODUCT_SEARCH",
    "entities": { "machines": ["truck"], "technologies": ["oil"] },
    "confidence": 0.95
  }
}
```

### POST /ai/search
AI-powered search with ranking.
```json
{
  "query": "fuel filter water separator"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "products": [...],
    "count": 12,
    "intent": "PRODUCT_SEARCH",
    "entities": { "technologies": ["fuel", "water"] }
  }
}
```

### POST /ai/cross-reference
Find equivalents for a code.
```json
{
  "code": "LF9009"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "code": "LF9009",
    "equivalents": [...],
    "count": 5
  }
}
```

### GET /health
Check service health.
```json
{
  "status": "healthy",
  "service": "ai-engine",
  "timestamp": "..."
}
```

## Tools Available to LLM

The AI can automatically use these tools:

1. **searchProducts(query, limit)**
   - Search filters by SKU, code, or specs

2. **findCrossReference(code, limit)**
   - Find equivalents and alternatives

3. **getProductSpecs(sku)**
   - Get full specs for a filter

4. **searchByTechnology(technology, limit)**
   - Find filters by type (oil, air, fuel, etc)

5. **getFilterStats()**
   - Get catalog statistics

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your keys:
# - DATABASE_URL (same as Search Server)
# - GROQ_API_KEY or OPENAI_API_KEY
```

### 3. Start Service
```bash
npm start
```

Should print:
```
✓ AI Engine running on port 3001
✓ OpenAI API: configured
✓ Database: configured
```

## Folder Structure

```
ai-engine/
├── server.js                  # Entry point
├── package.json
├── .env.example
├── README.md
└── src/
    ├── services/
    │   ├── database.service.js    # PostgreSQL queries (read-only)
    │   ├── llm.service.js         # OpenAI/GROQ integration
    │   ├── rag.service.js         # RAG orchestration
    │   └── tools.service.js       # Tool definitions & execution
    ├── routes/
    │   ├── query.routes.js        # /ai/query
    │   ├── intent.routes.js       # /ai/intent
    │   ├── search.routes.js       # /ai/search
    │   └── crossref.routes.js     # /ai/cross-reference
    ├── models/                    # (placeholder for schemas)
    ├── utils/                     # (placeholder for helpers)
    └── config/                    # (placeholder for config)
```

## Key Design Decisions

### 1. Separation from Search Server
- AI Engine has its OWN database pool
- Read-only access to PostgreSQL
- Independent from existing Search Server
- Can be scaled independently

### 2. Tool-Based Architecture
- LLM decides which database queries to run
- Tools are REST-like functions
- Supports tool_use in both GPT-4 and GROQ

### 3. Intent-First Approach
- Classifies query intent first
- Routes to appropriate tools
- Ranks results by relevance

### 4. Microservice Pattern
- Single responsibility principle
- Stateless request handling
- Horizontal scalability

## Deployment (Railway)

### 1. Create New Service in Railway
- Service name: `elimfilters-ai-engine`
- Build command: `npm install`
- Start command: `npm start`

### 2. Environment Variables
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
AI_ENGINE_PORT=3001
NODE_ENV=production
```

### 3. Connect to PostgreSQL
- Point to same DATABASE_URL as Search Server
- No schema modifications needed
- Read-only queries only

## Security

- ✅ CORS whitelisted to elimfilters.com
- ✅ Rate limiting (100 req/15min on /ai/*)
- ✅ Helmet.js security headers
- ✅ Input validation on all endpoints
- ✅ Read-only database access
- ✅ No modifications to production data

## Performance

- Intent classification: ~500ms
- Cross-reference lookup: ~200ms  
- Full RAG query with tools: ~2-3s
- Result ranking: ~300ms

Optimize with:
- Caching intent results
- Pre-computing embeddings
- Database connection pooling

## Limitations & Future Work

- [ ] pgvector embeddings (currently using LLM for ranking)
- [ ] Semantic search on product descriptions
- [ ] Machine learning for better intent classification
- [ ] Real-time inventory integration
- [ ] Caching layer (Redis)

## Troubleshooting

### "DATABASE_URL missing"
Check `.env` file has DATABASE_URL set

### "GROQ_API_KEY is invalid"
Verify key in `.env` is correct

### "Connection timeout"
PostgreSQL might be unreachable. Check:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### "Tool execution failed"
LLM might be calling tool with wrong args. Check logs for function.arguments JSON

## API Integration Example

```javascript
// Frontend calling AI Engine
async function searchWithAI(query) {
  const response = await fetch('http://localhost:3001/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return response.json();
}

// Will return products ranked by AI reasoning
```

---

**Status:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-05-18
