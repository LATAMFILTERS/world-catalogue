# Integration Guide: AI Engine + Search Server

## Architecture Overview

```
┌─────────────────┐
│  Frontend       │
│  (Next.js)      │
└────────┬────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌─────────────┐
│Search Server│  │ AI Engine   │
│ (port 8080) │  │ (port 3001) │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  PostgreSQL   │
        │ (read-only)   │
        └───────────────┘
```

## How They Work Together

### Search Server (Existing)
- **Purpose:** Fast, simple product lookups
- **Endpoints:** `/api/search`, `/api/filter/:sku`, `/api/cross-reference`
- **Response:** Direct database results
- **Use When:** Quick SKU/code search, exact matches

### AI Engine (New)
- **Purpose:** Intelligent, context-aware search
- **Endpoints:** `/ai/query`, `/ai/search`, `/ai/intent`, `/ai/cross-reference`
- **Response:** AI-ranked results with reasoning
- **Use When:** Natural language queries, complex intent, recommendations

## Frontend Decision Logic

```javascript
// Smart routing based on query type
async function searchFilter(userQuery) {
  // Simple queries → Use Search Server (fast)
  if (userQuery.length < 3) {
    return fetch('/api/search?q=' + userQuery);
  }

  // Complex queries → Use AI Engine (smart)
  if (isComplexQuery(userQuery)) {
    return fetch('http://ai-engine:3001/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query: userQuery })
    });
  }

  // Default → Try both, merge results
  const [simple, ai] = await Promise.all([
    fetch('/api/search?q=' + userQuery),
    fetch('http://ai-engine:3001/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query: userQuery })
    })
  ]);

  return mergeResults(simple, ai);
}

function isComplexQuery(q) {
  return q.includes('equivalent') || 
         q.includes('compatible') ||
         q.includes('for') ||
         q.includes('machine') ||
         q.includes('vehicle');
}

function mergeResults(simpleRes, aiRes) {
  // AI Engine results ranked higher for complex queries
  return {
    simple: simpleRes,
    ai: aiRes,
    merged: [
      ...aiRes.data.products,
      ...simpleRes.filter(r => !aiRes.data.products.find(a => a.sku === r.sku))
    ]
  };
}
```

## Response Format Compatibility

### Search Server Response
```json
{
  "products": [
    {
      "sku": "EL8-001",
      "base_code": "LF9009",
      "technology": "oil",
      "description": "...",
      "competitor_codes": [...],
      "oem_codes": [...]
    }
  ],
  "count": 1
}
```

### AI Engine Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "sku": "EL8-001",
        "base_code": "LF9009",
        "technology": "oil",
        "description": "...",
        "competitor_codes": [...],
        "oem_codes": [...]
      }
    ],
    "count": 1,
    "llmResponse": "Based on your query, I found...",
    "intent": "CROSS_REFERENCE",
    "entities": { ... }
  }
}
```

**Note:** Both return same product schema, AI Engine just adds reasoning.

## Deployment on Railway

### Step 1: Create AI Engine Service in Railway

1. Go to Railway dashboard
2. Create new service
3. Configure:
   ```
   Name: elimfilters-ai-engine
   Build command: npm install
   Start command: npm start
   Port: 3001
   ```

### Step 2: Set Environment Variables

```
DATABASE_URL=postgresql://...  (same as Search Server)
GROQ_API_KEY=gsk_...
AI_ENGINE_PORT=3001
NODE_ENV=production
```

### Step 3: Link Services

In Railway, add to your deployment:
```yaml
services:
  search-server:
    command: node server.js
    port: 8080
  
  ai-engine:
    command: npm start
    port: 3001
    env:
      DATABASE_URL: ${{ DATABASE_URL }}
      GROQ_API_KEY: ${{ GROQ_API_KEY }}
```

### Step 4: Update Frontend

```javascript
// .env.local
NEXT_PUBLIC_SEARCH_SERVER=https://world-catalogue-production-a151.up.railway.app
NEXT_PUBLIC_AI_ENGINE=https://elimfilters-ai-engine.up.railway.app
```

## Database Configuration

Both services use same PostgreSQL but different approaches:

### Search Server
- Direct SQL queries
- Simple WHERE clauses
- No tool system

### AI Engine
- Read-only pool
- Tool-based access
- LLM decides which queries to run

**Important:** Both have read-only access. No mutations allowed.

## Fallback Strategy

If AI Engine is down, frontend falls back to Search Server:

```javascript
async function robustSearch(query) {
  try {
    // Try AI Engine first
    const aiResponse = await fetch('http://ai-engine:3001/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
      timeout: 3000  // 3 second timeout
    });
    return aiResponse.json();
  } catch (err) {
    console.warn('AI Engine failed, using Search Server');
    
    // Fallback to simple search
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return {
      success: true,
      data: {
        products: await response.json(),
        intent: 'FALLBACK',
        llmResponse: 'Using standard search (AI Engine unavailable)'
      }
    };
  }
}
```

## Monitoring & Debugging

### Check AI Engine Health
```bash
curl https://elimfilters-ai-engine.up.railway.app/health
```

Response:
```json
{
  "status": "healthy",
  "service": "ai-engine",
  "timestamp": "..."
}
```

### Check Database Connection
```bash
# From AI Engine logs
psql $DATABASE_URL -c "SELECT COUNT(*) FROM filters"
```

### Monitor GROQ API Usage
```bash
# Check GROQ dashboard for:
# - API calls/minute
# - Token usage
# - Error rates
```

### Common Issues

#### "AI Engine returns empty products"
- Check if tools are executing properly
- Look at GROQ API error logs
- Verify database connectivity

#### "Slow responses from AI Engine"
- GROQ API latency (check status.groq.com)
- Database query slowness (add indexes)
- Token limit hit (reduce max_tokens)

#### "Cross-reference not finding equivalents"
- Check if cross_references column has data
- Verify SQL syntax in DatabaseService
- Test query directly on PostgreSQL

## Load Testing

```bash
# Simple load test using Apache Bench
ab -n 100 -c 10 \
  -p test.json \
  -T "application/json" \
  http://localhost:3001/ai/search

# With authentication
ab -n 100 -c 10 \
  -H "Authorization: Bearer token" \
  http://ai-engine:3001/ai/query
```

## Performance Optimization

### Search Server
- ✅ Cached indexes on sku, base_code
- ✅ Connection pooling (max: 10)
- ✅ Rate limiting (200 req/15min)

### AI Engine
- ✅ Connection pooling (max: 5, lighter)
- ✅ GROQ caching enabled
- ✅ Tool result caching (in-memory)
- ✅ Implement Redis for distributed caching:

```javascript
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

// Cache intent classification
async function cachedIntentClassification(query) {
  const cached = await client.get(`intent:${query}`);
  if (cached) return JSON.parse(cached);
  
  const result = await LLMService.intentClassification(query);
  await client.setex(`intent:${query}`, 3600, JSON.stringify(result));
  return result;
}
```

## Migration Path

### Phase 1: Read-Only (Current)
- AI Engine reads from PostgreSQL
- Both services independent

### Phase 2: Hybrid (Next)
- Frontend routes complex queries to AI Engine
- Simple queries to Search Server
- Both serve same products

### Phase 3: AI Primary (Future)
- All queries go through AI Engine
- Search Server becomes optional
- AI caches frequent results

## Troubleshooting Checklist

- [ ] Both services running? `curl /health` on each
- [ ] Database accessible? `psql $DATABASE_URL`
- [ ] GROQ API key valid? Check logs
- [ ] Firewall allows 3001 ↔ 5432? Check Railway network
- [ ] Services on same VPC? (Railway: yes by default)
- [ ] CORS configured? (Allow each service)
- [ ] Rate limits not hit? Check logs

## Support

For integration issues:
1. Check `ai-engine/docs/EXAMPLES.md` for working examples
2. Test endpoints manually with curl
3. Review GROQ API status
4. Check PostgreSQL connection strings
5. Verify CORS headers in requests
