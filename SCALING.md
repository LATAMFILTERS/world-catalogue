# ELIMFILTERS API — Scaling Runbook

## Current Architecture (after perf commit fa45ff6)

| Component | Config |
|---|---|
| Node.js | Single process, Express |
| PostgreSQL pool | max: 20 connections, statement_timeout: 8s |
| Cache | In-memory Map (per-process, lost on restart) |
| Rate limit | 60 req/min per IP (search), 30/min (chat) |

---

## Capacity Estimates

| Concurrent Users | Status | Bottleneck |
|---|---|---|
| 0–150 | ✅ Current config handles this | — |
| 150–300 | ⚠️ Pool pressure at peak | Need Redis + pool to 30 |
| 300–600 | ❌ Single process saturates | Need PM2 cluster (2–4 workers) |
| 600–2000 | ❌ PG connections exhausted | Need PgBouncer or Render Pro PG |
| 2000+ | ❌ Single Render instance limits | Need horizontal scaling |

---

## Stage 1 — Up to 300 Users (Redis only)

**Cost**: ~$0/month (Upstash free tier: 10k commands/day)  
**Render changes**: Add env var only, no plan upgrade needed

### Steps

1. Create Redis on [Upstash](https://upstash.com) (free tier) or Render Redis addon
2. Add env var in Render dashboard:
   ```
   REDIS_URL=redis://default:<password>@<host>:<port>
   ```
3. Increase pool size in `server.js` (line ~342):
   ```js
   max: 30,
   ```
4. Deploy — server auto-detects REDIS_URL and connects

### What changes
- Cache is now shared across restarts (Redis persists TTL entries)
- Catalog count, search results, stats survive server restarts
- Cold start no longer causes DB flood

---

## Stage 2 — Up to 600 Users (PM2 Cluster)

**Cost**: ~$7/month (Render Standard plan for PostgreSQL: 97 connections)  
**Requires**: Stage 1 (Redis) already active

### Steps

1. Upgrade Render PostgreSQL to **Standard plan** ($7/month, 97 connections)
2. Update `server.js` pool:
   ```js
   max: 20,  // per worker — 4 workers × 20 = 80 total (under 97 PG limit)
   ```
3. Add pm2 dependency:
   ```bash
   npm install pm2
   ```
4. In Render dashboard, change **Start Command**:
   ```
   npx pm2-runtime ecosystem.config.js
   ```
5. Set env var:
   ```
   PM2_WORKERS=4
   ```

### Connection math
```
4 workers × 20 pool connections = 80 total PG connections
PostgreSQL Standard plan allows 97 → safe headroom
```

---

## Stage 3 — Up to 2000 Users (PgBouncer)

**Cost**: ~$25/month (Render Pro PostgreSQL: 400 connections)  
**Requires**: Stage 2 already active

### Steps

1. Upgrade Render PostgreSQL to **Pro plan** ($95/month, 400 connections)  
   OR add PgBouncer as a sidecar (connection pooler between Node and PG)
2. With PgBouncer in transaction mode, 8 workers × 20 pool = 160 app connections  
   → PgBouncer multiplexes into 20–40 actual PG connections
3. Set env var:
   ```
   PM2_WORKERS=8
   ```

---

## Stage 4 — 2000+ Users (Horizontal Scaling)

At this point the architecture needs:
- Multiple Render instances behind a load balancer
- PostgreSQL read replica for search queries (writes still go to primary)
- Redis Cluster or Upstash Pro

This is beyond a single Render deployment. Options:
- Migrate to Railway/Fly.io with horizontal scaling
- Move search to a dedicated service (Meilisearch or ElasticSearch)
- Implement CDN-level caching for the most common search queries

---

## Quick Reference — What to Change at Each Stage

### Stage 1 (Redis): add env var REDIS_URL, server auto-activates
### Stage 2 (PM2): change start command + set PM2_WORKERS + upgrade PG plan
### Stage 3 (PgBouncer): upgrade PG plan + add PgBouncer config
### Stage 4: architectural discussion needed

---

## Monitoring

Check current pool pressure by adding to healthcheck:
```
GET /api/status
```
Response includes: `{ status: 'ok', version: '3.8.0' }`

To monitor pool usage, add to Render logs filter: `[pool]`
