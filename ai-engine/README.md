# 🧠 ELIMFILTERS AI Engine v1.0

**Enterprise-Grade Industrial Intelligence System**

> RAG + Tool Calling + Vector Embeddings + Intent Classification

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                      │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────────┐          ┌────────▼──────┐
    │Search Server │          │  AI Engine    │  (THIS SERVICE)
    │(port 8080)   │          │  (port 3001)  │
    └────┬─────────┘          └────────┬──────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                ┌────────▼────────────┐
                │   PostgreSQL        │
                │ with pgvector       │
                └─────────────────────┘
```

## What This Does

AI Engine is a **modular, scalable industrial intelligence layer** that handles:

### 1. **Intent Detection**
Classifies user queries into 5 industrial intent types:
- CROSS_REFERENCE_SEARCH
- MACHINE_LOOKUP  
- PRODUCT_SEARCH
- TECHNICAL_SPEC_REQUEST
- INVENTORY_REQUEST

### 2. **Entity Extraction**
Pulls out technical entities from queries:
- OEM/part codes
- Machine models
- Filter technologies
- Specifications

### 3. **RAG Pipeline**
Retrieval-Augmented Generation with:
- Semantic search using OpenAI embeddings
- Vector similarity (pgvector + HNSW)
- Hybrid SQL + vector search
- Context ranking

### 4. **Tool Calling**
LLM can invoke isolated tools:
- `searchProducts()` - Product search
- `findCrossReference()` - Find equivalents
- `getProductSpecs()` - Get specs
- `searchByMachine()` - Machine compatibility
- `getInventory()` - Availability

### 5. **LLM Reasoning**
GROQ mixtral-8x7b processes queries with:
- Retrieved context injection
- Tool orchestration
- Structured responses

## Architecture Principles

✅ **Modular** - Each component isolated  
✅ **RAG-First** - Always retrieves context first  
✅ **Tool-Driven** - LLM decides which tools to use  
✅ **Production-Ready** - Error handling, logging, validation  
✅ **Scalable** - Microservice pattern  
✅ **Read-Only** - Never modifies production data  

## Folder Structure

```
ai-engine/
├── src/
│   ├── agents/              # Intent classification
│   │   └── intent-classifier.agent.js
│   │
│   ├── tools/               # Isolated tool functions
│   │   ├── search-products.tool.js
│   │   ├── find-cross-reference.tool.js
│   │   ├── get-product-specs.tool.js
│   │   ├── search-by-machine.tool.js
│   │   ├── get-inventory.tool.js
│   │   └── tools.registry.js
│   │
│   ├── rag/                 # RAG pipeline
│   │   └── rag.service.js
│   │
│   ├── embeddings/          # OpenAI embeddings
│   │   └── embedding.service.js
│   │
│   ├── vector-search/       # Vector similarity search
│   │   └── vector-search.service.js
│   │
│   ├── db/                  # Database access
│   │   └── database.service.js
│   │
│   ├── routes/              # REST endpoints
│   │   ├── query.routes.js
│   │   ├── intent.routes.js
│   │   ├── search.routes.js
│   │   └── crossref.routes.js
│   │
│   ├── config/              # Configuration
│   │   └── app.config.js
│   │
│   └── utils/               # Utilities
│       └── logger.js
│
├── migrations/              # Database migrations
│   ├── init-pgvector.sql
│   └── run-migration.js
│
├── server.js                # Entry point
├── package.json
├── .env.example
└── README.md
```

## Setup

### 1. Install Dependencies
```bash
cd ai-engine
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env

# Edit .env with:
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk_...
```

### 3. Initialize pgvector (One-time)
```bash
npm run migrate:embeddings
```

### 4. Start Service
```bash
npm start
# Server runs on port 3001
```

## REST API Endpoints

### POST /ai/query
Full RAG pipeline with tool calling.

```bash
curl -X POST http://localhost:3001/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "equivalent to LF9009 for Caterpillar"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "...",
    "intent": "CROSS_REFERENCE_SEARCH",
    "confidence": 0.94,
    "entities": {...},
    "retrievedContext": {...},
    "llmResponse": "...",
    "toolCalls": ["findCrossReference"],
    "products": [...],
    "timestamp": "..."
  }
}
```

### POST /ai/intent
Intent classification only.

```bash
curl -X POST http://localhost:3001/ai/intent \
  -H "Content-Type: application/json" \
  -d '{"query": "need oil filter for Caterpillar 320D"}'
```

### POST /ai/search
AI-powered semantic search with hybrid SQL+vector.

```bash
curl -X POST http://localhost:3001/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "fuel water separator diesel"}'
```

### POST /ai/cross-reference
Find equivalent filters by OEM code.

```bash
curl -X POST http://localhost:3001/ai/cross-reference \
  -H "Content-Type: application/json" \
  -d '{"code": "LF9009"}'
```

### GET /health
Service health check.

```bash
curl http://localhost:3001/health
```

## How It Works

### Example: "equivalent to LF9009 for Caterpillar"

1. **Intent Classification**
   - User query → GROQ
   - Output: CROSS_REFERENCE_SEARCH (94% confidence)

2. **Entity Extraction**
   - Query → GROQ
   - Output: codes: ["LF9009"], machines: ["Caterpillar"]

3. **Context Retrieval (RAG)**
   - Semantic search: Generate embedding, search vectors
   - Keyword search: Cross-reference lookup for "LF9009"
   - Result: Top 5 matching products

4. **Tool Calling**
   - LLM sees tools + context
   - Decides to call: `findCrossReference("LF9009")`
   - Tool executes: Database query
   - Result: All products with "LF9009" code

5. **LLM Reasoning**
   - LLM gets tool results
   - Filters for "Caterpillar" compatibility
   - Generates technical explanation

6. **Response**
   - Returns products + AI reasoning
   - **NO hallucinations** - only retrieved data

## Technology Stack

- **LLM:** GROQ mixtral-8x7b (fast, tool calling)
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector DB:** PostgreSQL + pgvector
- **Framework:** Node.js + Express
- **Database:** PostgreSQL (read-only)
- **Search:** Hybrid (SQL + vector)

## Tools Architecture

Each tool is an isolated module:

```javascript
class SearchProductsTool {
    static definition = {
        type: 'function',
        function: {
            name: 'searchProducts',
            description: '...',
            parameters: {...}
        }
    };

    static async execute(params) {
        // Tool implementation
        // Always returns structured JSON
        return { success, count, results };
    }
}
```

**Tools are:**
- ✅ Reusable by any agent
- ✅ Testable in isolation
- ✅ Versioned independently
- ✅ Documented with definitions

## RAG Pipeline

```
User Query
    ↓
Intent Classification
    ↓
Entity Extraction
    ↓
Context Retrieval
    ├─ Semantic Search (vectors)
    └─ Keyword Search (SQL)
    ↓
System Prompt Building (with context)
    ↓
LLM Processing (with tools)
    ↓
Tool Execution (if needed)
    ↓
Response Generation
```

## Vector Search

Uses **pgvector with HNSW indexing** for fast similarity search:

```sql
SELECT * FROM filters
WHERE (1 - (embedding <=> query_embedding)) > threshold
ORDER BY similarity DESC
```

**Benefits:**
- Fast semantic search
- Cosine similarity
- HNSW indexes (better than IVFFLAT)
- Scalable to 100k+ products

## Security

- ✅ Read-only database access
- ✅ CORS whitelisted to elimfilters.com
- ✅ Rate limiting: 100 req/15min
- ✅ Input validation on all endpoints
- ✅ No SQL injection (parameterized queries)
- ✅ Helmet.js security headers
- ✅ Environment variable isolation

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Intent classification | 200-400ms | GROQ |
| Entity extraction | 100-200ms | GROQ |
| Semantic search | 200-400ms | pgvector |
| SQL search | 50-150ms | SQL + indexes |
| Tool execution | 100-300ms | Database |
| Full RAG query | 1.5-3s | All steps |

**Optimization:**
- Connection pooling (max 5)
- Embedding caching possible
- Vector index HNSW
- SQL query optimization

## Deployment (Railway)

### Create Service
1. New Railway service
2. Name: `elimfilters-ai-engine`
3. Build: `npm install`
4. Start: `npm start`
5. Port: 3001

### Environment Variables
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk_...
AI_ENGINE_PORT=3001
NODE_ENV=production
```

### Run Migrations
```bash
npm run migrate:embeddings
```

## Monitoring

### Logs
```bash
# Real-time logs
railway logs -f

# Check service health
curl https://ai-engine.up.railway.app/health
```

### Metrics
- LLM API usage (GROQ, OpenAI)
- Database query counts
- Vector search operations
- Intent classification accuracy

## Future Enhancements

- [ ] ML-based intent classifier
- [ ] Real-time inventory integration
- [ ] Product recommendation engine
- [ ] Multi-language support
- [ ] GraphQL API
- [ ] WebSocket streaming
- [ ] Audit logging
- [ ] A/B testing framework

## Troubleshooting

### "DATABASE_URL missing"
Check `.env` file

### "GROQ_API_KEY invalid"
Verify key in `.env`

### "Vector search returns 0 results"
Run embedding migration:
```bash
npm run migrate:embeddings
```

### "Tool execution failed"
Check function.arguments JSON syntax

### "Slow responses"
- Check GROQ API status
- Verify database indexes
- Monitor connection pool

## Support

- Review `docs/` for detailed guides
- Check logs for error messages
- Test endpoints with provided examples
- Verify environment variables

## License

Proprietary - LATAMFILTERS

---

**Status:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-05-18
