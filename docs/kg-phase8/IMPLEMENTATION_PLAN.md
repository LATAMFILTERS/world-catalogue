# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 8: GEO Implementation Plan
# Machine-Readable Endpoints for AI Crawlers

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — awaiting Phases 4 and 6 completion
**Estimated execution time:** 2–3 hours

---

## 1. DEPENDENCY GRAPH

```
Phase 4 (REQUIRED)
  kg_canonical_blocks ──────────────────────────────────────┐
  kg_concept_links ─────────────────────────────────────────┤
                                                            │
Phase 6 (REQUIRED)                                         │
  routes/knowledge.routes.js ───────────────────────────────┼──► Phase 8
  app.use('/api/kg', knowledgeRoutes) registered ───────────┘   GEO layer

Phases 1–3, 5 (OPTIONAL for Phase 8)
  kg_technologies, kg_systems, kg_product_* ── Not queried by Phase 8 directly
  (Phase 8 reads only kg_canonical_blocks)
```

### Minimum viable Phase 8:

Phase 8 can proceed even if kg_canonical_blocks has only partial data (some concepts seeded).
`/api/knowledge` will return whatever is in the table — an empty array is a valid (degraded) response.
`sitemap-ai.xml`, `llm.txt`, and `robots.txt` are static files — no database dependency.

### Verification before starting Phase 8:

```sql
-- Verify canonical blocks exist:
SELECT concept_type, COUNT(*) FROM kg_canonical_blocks GROUP BY concept_type;
-- At minimum, expect rows for 'technology' and 'system' types

-- Verify Phase 6 is active:
-- curl http://localhost:3000/api/kg/systems | jq '.success'
-- Expected: true
```

---

## 2. FILE CREATION LIST

```
server.js                  ← ADD /api/knowledge and /api/knowledge/:type endpoints
                              ADD /sitemap-ai.xml dynamic route (optional)

public/
├── robots.txt             ← CREATE/UPDATE with AI crawler directives
├── llm.txt                ← CREATE (new machine-readable index)
└── sitemap-ai.xml         ← CREATE (static or dynamic)
```

### File notes:

- `public/robots.txt`: Check if this file already exists. If yes, ADD the AI crawler
  directives; do NOT replace the existing content.
- `public/llm.txt`: New file — create from scratch using template in ARCHITECTURE.md.
- `public/sitemap-ai.xml`: Static file preferred for Phase 8. Can be made dynamic
  in a future phase to auto-update from kg_canonical_blocks.
- `server.js`: Two new routes added. NEVER modify existing routes.

---

## 3. IMPLEMENTATION SEQUENCE

### Step 1: Create public/llm.txt

Copy the llm.txt content from ARCHITECTURE.md Section 4 verbatim.
Update the `Generated:` date to current date.

```bash
# Verify public/ directory exists:
ls /home/user/world-catalogue/public/
# Create file:
# (copy content from ARCHITECTURE.md Section 4)
```

Verify accessibility:
```bash
# After server start:
curl -s http://localhost:3000/llm.txt | head -5
# Expected: # ELIMFILTERS Knowledge System
```

### Step 2: Create/update public/robots.txt

Check if robots.txt already exists:
```bash
ls /home/user/world-catalogue/public/robots.txt
```

If exists: ADD the AI crawler directives from ARCHITECTURE.md Section 5.
Preserve existing content — only append new User-agent blocks and Sitemap directives.

If not exists: Create from scratch using ARCHITECTURE.md Section 5 template.

### Step 3: Create public/sitemap-ai.xml

Copy the sitemap XML from ARCHITECTURE.md Section 3 verbatim.
Update `<lastmod>` dates to current date.

**Important:** Before deploying, verify that every `<loc>` URL corresponds to an
actual page that exists in the Next.js frontend build output (`frontend/out/`).

```bash
# Verify URL paths exist in frontend build:
ls frontend/out/knowledge-system/
ls frontend/out/knowledge-system/standards/
ls frontend/out/knowledge-system/technologies/
# Each subdirectory should have an index.html
```

If a page doesn't exist yet (e.g., technology detail pages not yet built), remove
that URL from sitemap-ai.xml until the page is created.

### Step 4: Add /api/knowledge endpoint to server.js

Add AFTER all existing endpoint definitions and BEFORE the 404 catch-all or port listen:

```javascript
// ─── Phase 8: GEO — Machine-readable knowledge endpoint ───────────────────────

// In-memory cache for /api/knowledge (24 hours)
let _knowledgeCache = null;
let _knowledgeCacheExpiry = 0;

app.get('/api/knowledge', async (req, res) => {
  const typeFilter = req.query.type || null;

  // Validate type filter if provided
  const VALID_TYPES = ['technology', 'system', 'contamination_mode', 'standard', 'industry'];
  if (typeFilter && !VALID_TYPES.includes(typeFilter)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type '${typeFilter}'. Valid types: ${VALID_TYPES.join(', ')}`
    });
  }

  // Check cache (24h TTL, bypass for type-filtered requests to avoid cache key collision)
  const cacheKey = `knowledge:${typeFilter || 'all'}`;
  const now = Date.now();
  if (_knowledgeCache && _knowledgeCacheExpiry > now && _knowledgeCache.key === cacheKey) {
    return res.json(_knowledgeCache.data);
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    // Check if kg_canonical_blocks table exists
    const tableCheck = await client.query(
      "SELECT to_regclass('kg_canonical_blocks') AS exists"
    );
    if (!tableCheck.rows[0].exists) {
      return res.json({
        version: '1.0',
        generated: new Date().toISOString(),
        source: 'elimfilters.com/api/knowledge',
        status: 'initializing',
        totalConcepts: 0,
        concepts: []
      });
    }

    const result = await client.query(`
      SELECT
        concept_slug,
        concept_type,
        display_name,
        definition,
        system_context,
        failure_mechanism,
        industrial_impact,
        related_standards,
        related_technologies,
        industrial_role,
        version,
        last_updated,
        citation_url
      FROM kg_canonical_blocks
      WHERE ($1::text IS NULL OR concept_type = $1)
      ORDER BY concept_type, concept_slug
    `, [typeFilter]);

    const concepts = result.rows.map(row => ({
      type:                 row.concept_type,
      slug:                 row.concept_slug,
      displayName:          row.display_name,
      definition:           row.definition,
      systemContext:        row.system_context       || null,
      failureMechanism:     row.failure_mechanism    || null,
      industrialImpact:     row.industrial_impact    || null,
      relatedStandards:     row.related_standards    || [],
      relatedTechnologies:  row.related_technologies || [],
      industrialRole:       row.industrial_role      || null,
      version:              row.version,
      lastUpdated:          row.last_updated,
      citationUrl:          row.citation_url
        ? `https://elimfilters.com${row.citation_url}`
        : null
    }));

    const responseData = {
      version:        '1.0',
      generated:      new Date().toISOString(),
      source:         'elimfilters.com/api/knowledge',
      totalConcepts:  concepts.length,
      concepts
    };

    // Cache for 24 hours
    _knowledgeCache = { key: cacheKey, data: responseData };
    _knowledgeCacheExpiry = now + (24 * 60 * 60 * 1000);

    res.json(responseData);

  } catch (err) {
    console.error('[api:knowledge]', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    await client.end();
  }
});

app.get('/api/knowledge/:type', async (req, res) => {
  // Delegate to /api/knowledge with type filter
  req.query.type = req.params.type;
  // Re-use same handler by forwarding — or duplicate the handler with type param
  // Simplest: forward with modified query
  return app.handle(
    Object.assign(req, { url: `/api/knowledge?type=${req.params.type}`, path: '/api/knowledge' }),
    res
  );
});
```

**Note:** The `/api/knowledge/:type` delegation pattern above may not work cleanly with
Express. Alternative: extract the query logic into a shared async function:

```javascript
async function queryKnowledgeBase(typeFilter, client) {
  // ... same SQL query as above ...
}

app.get('/api/knowledge', async (req, res) => {
  const typeFilter = req.query.type || null;
  // ... validation + cache check + call queryKnowledgeBase(typeFilter, client) ...
});

app.get('/api/knowledge/:type', async (req, res) => {
  const typeFilter = req.params.type;
  // ... validation + cache check + call queryKnowledgeBase(typeFilter, client) ...
});
```

This is the cleaner implementation pattern.

### Step 5: Update JSON-LD in Knowledge System pages (optional in Phase 8)

This step is optional for Phase 8. The existing hardcoded JSON-LD in page components
continues to work. Dynamic JSON-LD fetching from the API is an enhancement.

**If implementing dynamic JSON-LD:**

1. Add a `generateJsonLd(canonicalBlock)` utility to `frontend/src/lib/jsonld-utils.ts`
2. Update each Knowledge System page component to fetch from `/api/knowledge/technology/[slug]`
   or `/api/knowledge/system/[slug]` on mount
3. Update the `<script type="application/ld+json">` block with the fetched data

**Fallback behavior:** If fetch fails, use the existing hardcoded JSON-LD. No regression.

### Step 6: Rebuild Next.js frontend (if JSON-LD pages updated)

```bash
cd /home/user/world-catalogue/frontend
npm run build
```

If only server.js and public/ files were changed (no React component changes),
frontend rebuild is NOT required. The static export remains valid.

---

## 4. SQL PATTERNS

Phase 8 uses only one table: `kg_canonical_blocks`.
No joins to `elimfilters_catalog` — zero risk of `codigo_base` exposure.

```sql
-- Main query for /api/knowledge:
SELECT
  concept_slug, concept_type, display_name, definition,
  system_context, failure_mechanism, industrial_impact,
  related_standards, related_technologies, industrial_role,
  version, last_updated, citation_url
FROM kg_canonical_blocks
WHERE ($1::text IS NULL OR concept_type = $1)
ORDER BY concept_type, concept_slug;

-- Table existence check (graceful degradation):
SELECT to_regclass('kg_canonical_blocks') AS exists;
-- Returns NULL if table doesn't exist, 'kg_canonical_blocks' if it does

-- Count by type (for monitoring):
SELECT concept_type, COUNT(*) FROM kg_canonical_blocks GROUP BY concept_type ORDER BY concept_type;
```

---

## 5. CACHING STRATEGY

### /api/knowledge

```javascript
const KNOWLEDGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

This endpoint returns all canonical definitions. Definitions change only when Phase 4
seed scripts are re-run or definitions are manually updated. 24-hour TTL is aggressive
but appropriate — AI crawlers should receive consistent content, and staleness is acceptable.

**Cache invalidation:** Add an admin-protected cache-clear endpoint:

```javascript
app.get('/api/admin/clear-knowledge-cache', (req, res) => {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY && key !== 'elim2026admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  _knowledgeCache = null;
  _knowledgeCacheExpiry = 0;
  res.json({ cleared: true });
});
```

Call this after updating canonical block definitions:
```bash
curl "http://localhost:3000/api/admin/clear-knowledge-cache?key=elim2026admin"
```

### Static files (llm.txt, sitemap-ai.xml, robots.txt)

Served by `express.static('public')` with default caching headers.
CDN (if configured) will cache these with default TTL.
No server-side cache management needed — static files are always current.

---

## 6. MONITORING AI CRAWLER ACTIVITY

After deployment, track AI crawler visits via server-side logging:

```javascript
// Add to server.js middleware (after app.use(cors())):
app.use((req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (ua.includes('GPTBot') || ua.includes('ClaudeBot') || ua.includes('PerplexityBot')
      || ua.includes('anthropic-ai') || ua.includes('Bingbot')) {
    console.log(`[ai-crawler] ${ua} — ${req.method} ${req.path}`);
  }
  next();
});
```

This logs AI crawler requests without impacting performance.
In a future phase, log to a `kg_crawler_events` table for analytics.

---

## 7. INTEGRATION CHECKLIST

- [ ] `public/llm.txt` created and accessible at `https://elimfilters.com/llm.txt`
- [ ] `public/robots.txt` updated with AI crawler directives and Sitemap declarations
- [ ] `public/sitemap-ai.xml` created — all URLs verified against actual Next.js pages
- [ ] `/api/knowledge` endpoint added to server.js
- [ ] `/api/knowledge/:type` endpoint added to server.js
- [ ] Cache-clear admin endpoint added
- [ ] 24-hour cache confirmed working (second request returns identical response faster)
- [ ] All tests in VALIDATION_AND_ROLLBACK.md pass
- [ ] No regression on existing `/api/search` (run Phase 6 test F1)

---

## 8. RELATIONSHIP TO FUTURE PHASES

```
Phase 8 (this) ──► /api/knowledge serves canonical definitions to AI crawlers

Future work:
  Dynamic sitemap-ai.xml ──► Generate from kg_canonical_blocks at runtime
                              (update when new pages are added to knowledge system)

  JSON-LD from KG ─────────► All 10-point template pages use dynamic JSON-LD
                              from /api/knowledge rather than hardcoded blocks

  AI Citation Index ───────► Dedicated page at /knowledge-system/citation-index
                              listing all citable definitions with version history

  Crawler Analytics ───────► kg_crawler_events table tracking AI crawler behavior
                              (which concepts are most cited, query patterns)
```

---

## 9. STORAGE IMPACT

| Component | Storage | Notes |
|-----------|---------|-------|
| public/llm.txt | ~4 KB | Plain text file |
| public/robots.txt | ~2 KB | Text file (updated) |
| public/sitemap-ai.xml | ~8 KB | XML file (~39 URLs) |
| server.js additions | ~4 KB | ~100 lines of code |
| DB impact | 0 bytes | No new tables; reads kg_canonical_blocks |
| In-memory cache | ~50–200 KB | Depends on number of canonical blocks |
| **Total** | **~20 KB** | Minimal footprint |
