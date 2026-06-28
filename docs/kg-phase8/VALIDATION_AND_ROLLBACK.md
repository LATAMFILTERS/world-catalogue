# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 8: GEO Validation and Rollback Procedures
# Machine-Readable Endpoints for AI Crawlers

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## SECURITY CONSTRAINT REMINDER

`/api/knowledge` queries ONLY `kg_canonical_blocks` — it has no join to `elimfilters_catalog`.
There is zero path by which `codigo_base`, `BASE`, or `MATCHED BY` could appear in responses.
Verify this with a grep before commit:

```bash
grep -n 'codigo_base\|MATCHED BY\|elimfilters_catalog' server.js | grep -A5 'api/knowledge'
# Must show zero matches in the /api/knowledge handler block
```

---

## 1. PRE-DEPLOYMENT CHECKLIST

- [ ] Phase 4 (kg_canonical_blocks) has at least some rows seeded
- [ ] Phase 6 (/api/kg/* routes) is active and `/api/kg/systems` returns success=true
- [ ] `public/` directory exists at `/home/user/world-catalogue/public/`
- [ ] `express.static('public')` is in server.js (line 29 — confirmed in audit)
- [ ] All sitemap-ai.xml URLs verified against `frontend/out/` directory structure

### Verify all sitemap URLs exist in build output:

```bash
cd /home/user/world-catalogue

# Check knowledge-system pages exist:
test -f frontend/out/knowledge-system/index.html && echo "HUB OK" || echo "HUB MISSING"
test -d frontend/out/knowledge-system/standards && echo "STANDARDS DIR OK" || echo "STANDARDS MISSING"
test -d frontend/out/knowledge-system/contamination && echo "CONTAMINATION DIR OK" || echo "CONTAMINATION MISSING"
test -d frontend/out/knowledge-system/fleet && echo "FLEET DIR OK" || echo "FLEET MISSING"
test -d frontend/out/knowledge-system/technologies && echo "TECH DIR OK" || echo "TECH MISSING"

# List available standards pages:
ls frontend/out/knowledge-system/standards/ 2>/dev/null || echo "Standards directory not found"

# List available technology pages:
ls frontend/out/knowledge-system/technologies/ 2>/dev/null || echo "Technologies directory not found"
```

Remove any URLs from `sitemap-ai.xml` that correspond to pages not yet built.

---

## 2. VALIDATION TEST SUITE

Run all tests with server at `http://localhost:3000`.

### Test A: /api/knowledge endpoint

#### A1: Returns valid JSON
```bash
curl -s http://localhost:3000/api/knowledge | jq '{version, hasGenerated: (.generated != null), totalConcepts}'
```
**Expected:**
```json
{
  "version": "1.0",
  "hasGenerated": true,
  "totalConcepts": 42
}
```
(totalConcepts reflects actual number of seeded canonical blocks — any non-negative integer is valid)

#### A2: Response has required top-level fields
```bash
curl -s http://localhost:3000/api/knowledge | jq 'keys'
```
**Expected output contains all of:**
```json
["concepts", "generated", "source", "totalConcepts", "version"]
```

#### A3: Each concept has all required fields
```bash
curl -s http://localhost:3000/api/knowledge | jq '.concepts[0] | keys'
```
**Expected output contains all of:**
```json
[
  "citationUrl", "definition", "displayName", "failureMechanism",
  "industrialImpact", "industrialRole", "lastUpdated", "relatedStandards",
  "relatedTechnologies", "slug", "systemContext", "type", "version"
]
```

#### A4: Type filter — technologies only
```bash
curl -s "http://localhost:3000/api/knowledge?type=technology" | jq '{
  totalConcepts,
  allAreTechnology: ([.concepts[].type] | unique == ["technology"])
}'
```
**Expected:** totalConcepts >= 1, allAreTechnology = true

#### A5: Type filter — systems only
```bash
curl -s "http://localhost:3000/api/knowledge?type=system" | jq '{
  totalConcepts,
  allAreSystem: ([.concepts[].type] | unique == ["system"])
}'
```
**Expected:** totalConcepts between 1 and 6

#### A6: Invalid type filter returns 400
```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/knowledge?type=invalid"
```
**Expected:** `400`

#### A7: GET /api/knowledge/:type path-based filter
```bash
curl -s http://localhost:3000/api/knowledge/technology | jq '.totalConcepts'
```
**Expected:** same as `?type=technology` result (>= 1)

#### A8: Citation URLs are absolute (include https://elimfilters.com)
```bash
curl -s http://localhost:3000/api/knowledge | jq '[.concepts[].citationUrl | select(. != null) | startswith("https://elimfilters.com")] | all'
```
**Expected:** `true`

#### A9: Security — no internal fields in response
```bash
curl -s http://localhost:3000/api/knowledge | grep -i 'codigo_base\|\"BASE\"\|matched_by'
```
**Expected:** No output

#### A10: Caching — second request faster
```bash
time curl -s http://localhost:3000/api/knowledge > /dev/null  # first request
time curl -s http://localhost:3000/api/knowledge > /dev/null  # second (cached)
```
**Expected:** Second request is significantly faster than first
(Note: time measurement requires server cold start for meaningful comparison)

---

### Test B: llm.txt

#### B1: Accessible at /llm.txt
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/llm.txt
```
**Expected:** `200`

#### B2: Has correct content-type
```bash
curl -s -I http://localhost:3000/llm.txt | grep -i content-type
```
**Expected:** `content-type: text/plain`

#### B3: Contains required sections
```bash
CONTENT=$(curl -s http://localhost:3000/llm.txt)
echo "ABOUT: $(echo "$CONTENT" | grep -c 'ABOUT:')"
echo "KNOWLEDGE_BASE: $(echo "$CONTENT" | grep -c 'KNOWLEDGE_BASE:')"
echo "API_ENDPOINT: $(echo "$CONTENT" | grep -c 'API_ENDPOINT:')"
echo "TECHNOLOGIES: $(echo "$CONTENT" | grep -c 'TECHNOLOGIES')"
echo "FILTRATION_SYSTEMS: $(echo "$CONTENT" | grep -c 'FILTRATION_SYSTEMS')"
echo "CITATION_POLICY: $(echo "$CONTENT" | grep -c 'CITATION_POLICY:')"
```
**Expected:** All counts = 1 (each section present once)

#### B4: Technology count
```bash
curl -s http://localhost:3000/llm.txt | grep -c '™'
```
**Expected:** >= 13 (one per technology, plus possibly mentions in descriptions)

---

### Test C: sitemap-ai.xml

#### C1: Accessible at /sitemap-ai.xml
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap-ai.xml
```
**Expected:** `200`

#### C2: Well-formed XML
```bash
curl -s http://localhost:3000/sitemap-ai.xml | python3 -c "
import sys, xml.etree.ElementTree as ET
try:
    ET.parse(sys.stdin)
    print('XML VALID')
except ET.ParseError as e:
    print(f'XML INVALID: {e}')
"
```
**Expected:** `XML VALID`

#### C3: Contains required namespace
```bash
curl -s http://localhost:3000/sitemap-ai.xml | grep -c 'sitemaps.org/schemas/sitemap'
```
**Expected:** >= 1

#### C4: All URLs are HTTPS elimfilters.com
```bash
curl -s http://localhost:3000/sitemap-ai.xml | grep '<loc>' | grep -v 'https://elimfilters.com'
```
**Expected:** No output (all locs are https://elimfilters.com)

#### C5: All priorities are 1.0
```bash
curl -s http://localhost:3000/sitemap-ai.xml | grep '<priority>' | sort | uniq
```
**Expected:** `    <priority>1.0</priority>` only (single unique value)

#### C6: Expected URL count
```bash
curl -s http://localhost:3000/sitemap-ai.xml | grep -c '<url>'
```
**Expected:** >= 20 (may be lower if not all knowledge pages have been built yet)

#### C7: Validate XML sitemap structure manually

Check that each `<url>` block has: `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`.
```bash
curl -s http://localhost:3000/sitemap-ai.xml | python3 -c "
import sys, xml.etree.ElementTree as ET
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
tree = ET.parse(sys.stdin)
urls = tree.findall('sm:url', ns)
issues = []
for url in urls:
    loc = url.find('sm:loc', ns)
    priority = url.find('sm:priority', ns)
    if loc is None: issues.append('Missing loc')
    if priority is None: issues.append(f'Missing priority for {loc.text if loc is not None else \"unknown\"}')
    elif priority.text != '1.0': issues.append(f'Priority != 1.0 for {loc.text}')
print(f'URLs: {len(urls)}, Issues: {len(issues)}')
for i in issues[:5]: print(f'  - {i}')
"
```
**Expected:** `URLs: [N], Issues: 0`

---

### Test D: robots.txt

#### D1: Accessible
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/robots.txt
```
**Expected:** `200`

#### D2: AI crawler directives present
```bash
ROBOTS=$(curl -s http://localhost:3000/robots.txt)
echo "GPTBot: $(echo "$ROBOTS" | grep -c 'GPTBot')"
echo "ClaudeBot: $(echo "$ROBOTS" | grep -c 'ClaudeBot')"
echo "PerplexityBot: $(echo "$ROBOTS" | grep -c 'PerplexityBot')"
echo "sitemap-ai: $(echo "$ROBOTS" | grep -c 'sitemap-ai.xml')"
```
**Expected:** All counts >= 1

#### D3: Knowledge system allowed for AI crawlers
```bash
curl -s http://localhost:3000/robots.txt | grep -A3 'GPTBot'
```
**Expected:** Block contains `Allow: /knowledge-system/` and `Allow: /api/knowledge`

#### D4: Admin endpoints blocked for AI crawlers
```bash
curl -s http://localhost:3000/robots.txt | grep -A5 'GPTBot' | grep 'Disallow'
```
**Expected:** Contains `Disallow: /api/admin/`

#### D5: Sitemap declarations at end of file
```bash
curl -s http://localhost:3000/robots.txt | grep 'Sitemap:'
```
**Expected:** Contains both `Sitemap: https://elimfilters.com/sitemap.xml`
and `Sitemap: https://elimfilters.com/sitemap-ai.xml`

---

### Test E: JSON-LD validation (if dynamic JSON-LD implemented)

#### E1: Knowledge system page includes JSON-LD
```bash
# Requires frontend to be rebuilt and served:
curl -s http://localhost:3000/knowledge-system/standards/hydraulic-systems | grep 'application/ld+json' | wc -l
```
**Expected:** >= 1

#### E2: JSON-LD is valid JSON
```bash
curl -s http://localhost:3000/knowledge-system/standards/hydraulic-systems \
  | grep -o 'application/ld+json">[^<]*<' \
  | sed 's/application\/ld+json">//' | sed 's/<$//' \
  | python3 -c "import sys,json; json.load(sys.stdin); print('VALID JSON')"
```
**Expected:** `VALID JSON`

---

### Test F: Existing API non-regression

#### F1: /api/search still works
```bash
curl -s "http://localhost:3000/api/search?q=EL82100" | jq '{hasProducts: (.products != null), hasCount: (.count != null)}'
```
**Expected:** `{"hasProducts": true, "hasCount": true}`

#### F2: /api/kg/systems still works (Phase 6 not broken)
```bash
curl -s http://localhost:3000/api/kg/systems | jq '.success'
```
**Expected:** `true`

#### F3: /api/status still works
```bash
curl -s http://localhost:3000/api/status | jq '.status'
```
**Expected:** `"ok"`

---

## 3. GRACEFUL DEGRADATION TESTS

Test behavior when Phase 4 is not yet complete:

#### G1: /api/knowledge with empty kg_canonical_blocks
```bash
# Simulate by running against empty table:
# (Only run in dev — do NOT run on production)
# Expected: returns {version:"1.0", totalConcepts:0, concepts:[]}
curl -s http://localhost:3000/api/knowledge | jq '{totalConcepts, isArray: (.concepts | type == "array")}'
```
**Expected:** `{"totalConcepts": 0, "isArray": true}` (graceful empty response)

#### G2: /api/knowledge if kg_canonical_blocks table doesn't exist
The endpoint uses `SELECT to_regclass('kg_canonical_blocks')` check before querying.
```bash
# Expected response when table doesn't exist:
# {version:"1.0", generated:"...", status:"initializing", totalConcepts:0, concepts:[]}
# HTTP status: 200 (not a 500 error)
```

---

## 4. ROLLBACK PROCEDURE

Phase 8 consists entirely of additive changes. All rollbacks are safe and independent.

### Rollback A: Remove /api/knowledge endpoint

1. Comment out or remove the `/api/knowledge` and `/api/knowledge/:type` handlers in server.js
2. Remove the `_knowledgeCache` and `_knowledgeCacheExpiry` variables
3. Restart server

```javascript
// Comment out in server.js:
// app.get('/api/knowledge', ...);
// app.get('/api/knowledge/:type', ...);
```

**Effect:** 404 for `/api/knowledge`. All other endpoints unchanged.

### Rollback B: Revert robots.txt

```bash
# If using git:
git checkout public/robots.txt
# Or manually remove the AI crawler blocks added in Phase 8
```

**Effect:** AI crawlers no longer have explicit Allow/Disallow rules.
They default to the global `User-agent: *` policy (allow all).

### Rollback C: Remove sitemap-ai.xml

```bash
rm /home/user/world-catalogue/public/sitemap-ai.xml
```

**Effect:** `/sitemap-ai.xml` returns 404. AI crawlers lose explicit knowledge page index.
Main sitemap.xml (if it exists) is unaffected.

### Rollback D: Remove llm.txt

```bash
rm /home/user/world-catalogue/public/llm.txt
```

**Effect:** `/llm.txt` returns 404. No functional impact — llm.txt is advisory only.

### Rollback E: Revert dynamic JSON-LD (if implemented)

If Knowledge System React pages were updated to fetch JSON-LD from `/api/knowledge`:

1. Revert the page component to the previous version with hardcoded JSON-LD
2. Rebuild frontend: `cd frontend && npm run build`

**Effect:** Pages revert to static hardcoded JSON-LD. No functional regression.

### Database Rollback

**None required.** Phase 8 adds no new database tables, indexes, or data.
The `/api/knowledge` endpoint only reads from `kg_canonical_blocks` (Phase 4 table).
Removing the endpoint does not affect the table.

---

## 5. PERFORMANCE BENCHMARKS

Record baseline timings after deployment:

```bash
# First request (cold — database hit):
time curl -s http://localhost:3000/api/knowledge > /dev/null

# Second request (warm — from cache):
time curl -s http://localhost:3000/api/knowledge > /dev/null

# Static files (should be immediate):
time curl -s http://localhost:3000/llm.txt > /dev/null
time curl -s http://localhost:3000/sitemap-ai.xml > /dev/null
time curl -s http://localhost:3000/robots.txt > /dev/null
```

**Target timings:**

| Endpoint | First Request | Cached |
|----------|-------------|--------|
| /api/knowledge | < 200ms | < 10ms |
| /api/knowledge?type=technology | < 100ms | < 10ms |
| /llm.txt | < 20ms | < 5ms |
| /sitemap-ai.xml | < 20ms | < 5ms |
| /robots.txt | < 20ms | < 5ms |

---

## 6. AI CRAWLER MONITORING

After Phase 8 deployment, verify AI crawlers are actually visiting:

```bash
# Search production logs for AI crawler user-agents:
# On Railway/Render — view log stream and search for:
grep -E 'GPTBot|ClaudeBot|PerplexityBot|anthropic-ai' /var/log/app.log 2>/dev/null || \
  echo "Check platform log viewer for AI crawler mentions"
```

**Expected within 30 days of deployment:**
- At least one GPTBot or ClaudeBot visit to `/knowledge-system/` pages
- At least one request to `/sitemap-ai.xml`
- At least one request to `/api/knowledge` or `/llm.txt`

If no AI crawler activity after 30 days, verify:
1. robots.txt is accessible and correctly formatted
2. sitemap-ai.xml URL is correct in robots.txt Sitemap declaration
3. Knowledge system pages have valid JSON-LD (discoverable by crawlers)

---

## 7. KNOWN LIMITATIONS AT LAUNCH

| Limitation | Impact | Resolution |
|-----------|--------|-----------|
| sitemap-ai.xml is static (manually maintained) | Must update when new knowledge pages are added | Future: dynamic generation from kg_canonical_blocks |
| llm.txt format is not officially standardized | Some AI crawlers may not recognize format | Conservative format degrades gracefully |
| JSON-LD on pages is still hardcoded (if dynamic step skipped) | Canonical blocks not reflected in JSON-LD until pages are manually updated | Implement dynamic JSON-LD fetching in a future iteration |
| No analytics on which concepts are most cited by LLMs | Cannot optimize canonical definitions without usage data | Future: crawler event logging |
| robots.txt AI crawler directives are advisory, not enforced | Some crawlers may ignore directives | Accepted tradeoff — all knowledge pages are public anyway |
