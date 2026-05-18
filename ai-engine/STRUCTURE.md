# AI Engine Directory Structure

```
ai-engine/
├── server.js                          # Entry point - Express app
├── package.json                       # Dependencies
├── package-lock.json                  # Dependency lock file
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── Procfile                           # Railway deployment
├── railway.json                       # Railway config
│
├── README.md                          # Main documentation
├── STRUCTURE.md                       # This file
│
├── src/
│   ├── services/
│   │   ├── database.service.js        # PostgreSQL queries (read-only)
│   │   │   └── Methods:
│   │   │       ├── searchFilters()
│   │   │       ├── getFilterBySku()
│   │   │       ├── findCrossReferences()
│   │   │       ├── searchByTechnology()
│   │   │       ├── searchByCategory()
│   │   │       └── getFilterStats()
│   │   │
│   │   ├── llm.service.js             # GROQ/OpenAI integration
│   │   │   └── Methods:
│   │   │       ├── processQuery()     # Full LLM with tools
│   │   │       ├── intentClassification()
│   │   │       ├── extractEntities()
│   │   │       └── rankResults()
│   │   │
│   │   ├── rag.service.js             # RAG orchestration
│   │   │   └── Methods:
│   │   │       ├── queryWithRAG()     # Full pipeline
│   │   │       ├── searchWithAI()     # AI-powered search
│   │   │       ├── findCrossReferences()
│   │   │       └── classifyIntent()
│   │   │
│   │   └── tools.service.js           # Tool definitions & execution
│   │       └── Methods:
│   │           ├── getToolDefinitions()   # Available tools for LLM
│   │           └── executeTool()          # Run tool by name
│   │
│   ├── routes/
│   │   ├── query.routes.js            # POST /ai/query
│   │   │   └── Full RAG pipeline
│   │   │
│   │   ├── intent.routes.js           # POST /ai/intent
│   │   │   └── Intent classification only
│   │   │
│   │   ├── search.routes.js           # POST /ai/search
│   │   │   └── AI-powered search
│   │   │
│   │   └── crossref.routes.js         # POST /ai/cross-reference
│   │       └── Cross-reference lookup
│   │
│   ├── config/
│   │   └── llm.config.js              # LLM configuration
│   │       └── Defines:
│   │           ├── groq config
│   │           ├── openai config
│   │           └── model endpoints
│   │
│   ├── models/                        # (Placeholder for schemas)
│   │   └── (Future: Product, Filter schemas)
│   │
│   └── utils/                         # (Placeholder for helpers)
│       └── (Future: validators, formatters)
│
└── docs/
    ├── EXAMPLES.md                    # Working examples
    │   ├── Cross-reference queries
    │   ├── Machine lookup
    │   ├── Product search
    │   ├── Integration examples
    │   └── Error handling
    │
    └── INTEGRATION.md                 # Integration with Search Server
        ├── Architecture
        ├── Decision logic
        ├── Deployment steps
        ├── Fallback strategy
        ├── Monitoring
        └── Troubleshooting
```

## Data Flow

### Full RAG Query Flow
```
POST /ai/query
    ↓
query.routes.js
    ↓
RAGService.queryWithRAG()
    ├─→ LLMService.intentClassification()
    ├─→ LLMService.extractEntities()
    ├─→ DatabaseService.getFilterStats() [context]
    ├─→ LLMService.processQuery() [with tools]
    │   └─→ GROQ API (mixtral-8x7b-32768)
    │       ├─→ Tool Call: searchProducts()
    │       ├─→ Tool Call: findCrossReference()
    │       └─→ Tool Call: getProductSpecs()
    │
    ├─→ ToolService.executeTool() [run tool]
    │   └─→ DatabaseService.[method]()
    │       └─→ PostgreSQL query
    │
    ├─→ LLMService.rankResults()
    │   └─→ GROQ API (ranking)
    │
    └─→ Response with products + LLM reasoning
```

### Simple Search Flow
```
POST /ai/search
    ↓
search.routes.js
    ↓
RAGService.searchWithAI()
    ├─→ IntentClassification
    ├─→ EntityExtraction
    ├─→ Route by intent:
    │   ├─→ CROSS_REFERENCE → findCrossReferences()
    │   ├─→ PRODUCT_SEARCH → searchFilters()
    │   └─→ other → searchFilters()
    │
    ├─→ LLMService.rankResults()
    │
    └─→ Response with ranked products
```

## Service Responsibilities

### database.service.js
- ✅ PostgreSQL connection pooling
- ✅ SELECT-only queries
- ✅ No write operations
- ✅ Error handling

### llm.service.js
- ✅ GROQ API integration
- ✅ Tool calling orchestration
- ✅ Entity extraction
- ✅ Result ranking

### rag.service.js
- ✅ Coordinate all services
- ✅ Route by intent
- ✅ Handle tool results
- ✅ Format final response

### tools.service.js
- ✅ Define available tools
- ✅ Execute tool by name
- ✅ Call database methods
- ✅ Error handling

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection
- `GROQ_API_KEY` - GROQ API key

### Optional
- `AI_ENGINE_PORT` - Port (default 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level

## Dependencies

```json
{
  "cors": "CORS middleware",
  "dotenv": "Environment variables",
  "express": "Web framework",
  "express-rate-limit": "Rate limiting",
  "groq-sdk": "GROQ API client",
  "helmet": "Security headers",
  "pg": "PostgreSQL client",
  "pgvector": "Vector search (future)"
}
```

## API Endpoints Summary

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|----------------|
| `/health` | GET | Service health | 100-200ms |
| `/ai/query` | POST | Full RAG + tools | 1.5-3s |
| `/ai/intent` | POST | Intent classification | 200-400ms |
| `/ai/search` | POST | AI-ranked search | 600-1.2s |
| `/ai/cross-reference` | POST | Cross-ref lookup | 400-800ms |

## Tool Definitions

```
1. searchProducts(query, limit=10)
   └─ Returns: Product[], filtered by relevance

2. findCrossReference(code, limit=10)
   └─ Returns: Product[], all equivalents for code

3. getProductSpecs(sku)
   └─ Returns: Product (single), full specs

4. searchByTechnology(technology, limit=10)
   └─ Returns: Product[], all filters of technology type

5. getFilterStats()
   └─ Returns: {total_filters, technologies, categories, types}
```

## Performance Targets

- Intent classification: <500ms
- Entity extraction: <300ms
- Database query: <200ms
- GROQ API call: <1.5s
- Result ranking: <400ms
- **Total for full query: <3s**

## Scalability

Current limits:
- Connection pool: 5 connections to PostgreSQL
- Rate limit: 100 requests/15 minutes
- Max tokens per request: 1024

To scale:
- Increase pool.max in database.service.js
- Adjust rate limit in server.js
- Add Redis caching layer
- Implement request queueing

## Future Enhancements

- [ ] pgvector embeddings (semantic search)
- [ ] ML-based intent classification
- [ ] Real-time product availability
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] GraphQL API
- [ ] WebSocket streaming responses
- [ ] Audit logging

---

**Last Updated:** 2026-05-18  
**Status:** Production Ready  
**Version:** 1.0.0
