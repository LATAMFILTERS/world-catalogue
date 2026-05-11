# ELIMFILTERS Architecture — Production-Ready Separation

## System Overview

Two-tier microservices architecture for scalability and reliability:

```
┌─────────────────────────────────────────────────────────┐
│                 cdn.elimfilters.com (Cloudflare R2)     │
│              (All media assets: images, videos)          │
└─────────────────────────────────────────────────────────┘
           ↓                                    ↓
    ┌──────────────┐                    ┌──────────────┐
    │  Frontend    │                    │  API Server  │
    │ elimfilters  │                    │ api.elimf...│
    │    .com      │←──────────────────→│    .com      │
    │              │                    │              │
    │ PORT: 3000   │                    │ PORT: 5000   │
    └──────────────┘                    └──────────────┘
         │                                      │
         │                                      ↓
         │                              ┌──────────────┐
         │                              │  PostgreSQL  │
         └─────────────────────────────→│              │
                                        └──────────────┘
```

## Server Roles

### Frontend Server (PORT 3000)
**File:** `server.js`

**Responsibilities:**
- Next.js 15 App Router rendering
- Static page generation (44 JSX pages)
- Static assets from `/public`
- Helmet security headers
- Redirect API requests to API Server

**Technology:**
- Express.js (minimal, only for Next.js handler)
- Next.js 15
- No database connection

**Routes Handled:**
- `/` - Homepage
- `/search` - Search page
- `/industries/*` - Industry pages (12 total)
- `/systems/*` - System pages (13 total)
- `/technologies/*` - Tech pages (12 total)
- `/contact/*` - Contact forms
- `/about`, `/warranty` - Info pages

---

### API Server (PORT 5000)
**File:** `api-server.js`

**Responsibilities:**
- Filter search (`/api/search`)
- SKU lookup (`/api/filter/:sku`)
- Cross-reference lookup (`/api/cross-reference/:code`)
- Country detection (`/api/get-country`)
- PostgreSQL connectivity
- Rate limiting (200 req/15min)
- CORS validation

**Technology:**
- Express.js (API-only)
- PostgreSQL client (pg)
- geoip-lite (IP→country mapping)
- helmet (security)
- express-rate-limit

**Database Connection:**
```
DATABASE_URL=postgresql://user:password@host:5432/filters
```

---

## Deployment Architecture

### Local Development
```bash
npm run dev
# Runs both servers:
# - Frontend: http://localhost:3000
# - API: http://localhost:5000
```

### Production (Railway/Docker)

#### Single Container (Current)
- `start.sh` launches both servers in same container
- PORT 3000 → Frontend
- PORT 5000 → API (internal only)

#### Multi-Container (Future Scale)
```dockerfile
# Service 1: Frontend
docker run -p 3000:3000 elimfilters:frontend

# Service 2: API
docker run -p 5000:5000 elimfilters:api \
  -e DATABASE_URL=postgresql://...
```

---

## Network & CORS Configuration

### Allowed Origins
```javascript
[
  'https://elimfilters.com',
  'https://www.elimfilters.com',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5000'
]
```

### Frontend → API Communication
**SearchButton.jsx:**
```javascript
// Detects environment and routes to correct API
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://api.elimfilters.com'

fetch(`${apiUrl}/api/get-country`)
```

---

## Database Schema
**PostgreSQL Table:** `filters`

**Safe Fields Exposed:**
- `sku`, `base_code`, `technology`, `category`
- `description`, `media_type`
- `outer_diameter`, `inner_diameter`, `length`
- `efficiency`, `type`, `style`
- `competitor_codes`, `oem_codes`, `cross_references`
- `applications`

---

## Environment Variables

### Frontend Server (server.js)
```env
PORT=3000
NODE_ENV=production
```

### API Server (api-server.js)
```env
API_PORT=5000
DATABASE_URL=postgresql://user:pass@host/filters
NODE_ENV=production
```

---

## Performance & Scaling

### Current (Single Container)
- Both servers in same process
- Shared system resources
- Simple deployment

### Target Production (Multi-Container)
- **Frontend:** 2-4 replicas (stateless)
- **API:** 2-3 replicas (stateless with pooling)
- **PostgreSQL:** Single RDS instance with backups
- **CDN:** Cloudflare R2 for all media

---

## Security Checklist

- [x] Helmet security headers
- [x] CORS whitelist validation
- [x] Rate limiting (200 req/15min)
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (helmet CSP)
- [x] Safe field exposure (no PII/credentials)
- [x] Environment variable isolation
- [x] SSL/TLS (Railway/Cloudflare)

---

## Monitoring & Logging

### Health Checks
```bash
# Frontend
curl http://localhost:3000/health
# Returns: Next.js status via Express

# API
curl http://localhost:5000/health
# Returns: {"status":"ok","time":"...","service":"api-server"}
```

### Logs to Monitor
- `SEARCH ERROR` - DB query failures
- `FILTER ERROR` - SKU lookup failures
- `GEO-IP ERROR` - IP detection failures
- `DB Pool Error` - Connection pool issues

---

## Deployment Commands

### Build Docker Image
```bash
docker build -t elimfilters:latest .
```

### Run Locally
```bash
npm install
npm run dev
```

### Deploy to Railway
```bash
git push origin main
# Railway automatically deploys via Dockerfile
# Executes: sh start.sh
# Exposes: PORT 3000 (frontend public), 5000 (internal API)
```

---

## Future Enhancements

1. **Load Balancing:** nginx/HAProxy for multi-instance API
2. **Caching:** Redis for hot search queries
3. **Async Jobs:** Bull queues for bulk imports
4. **Analytics:** PostHog tracking on frontend
5. **Observability:** OpenTelemetry tracing
6. **API Versioning:** `/api/v2/` for backward compatibility

---

**Version:** 2.0 (Bifurcated)  
**Date:** 2026-05-11  
**Status:** Production-Ready
