# Deployment Guide — Production

## Prerequisites

- Node.js 20.x
- PostgreSQL 14+
- Docker (for containerized deployment)
- Railway CLI (for Railway deployment)
- Git

## Local Development

### 1. Install Dependencies
```bash
npm install
cd motor-de-busqueda && npm install && npm run build
cd ..
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your PostgreSQL details
```

### 3. Start Both Servers
```bash
npm run dev
# Alternatively:
# Terminal 1: npm start
# Terminal 2: npm run api
```

### 4. Verify
```bash
# Frontend
curl http://localhost:3000

# API
curl http://localhost:5000/health
```

---

## Docker Local Development

### 1. Build Services
```bash
docker-compose build
```

### 2. Start All Services
```bash
docker-compose up
```

### 3. Access Services
- Frontend: http://localhost:3000
- API: http://localhost:5000
- PostgreSQL: localhost:5432

### 4. Stop Services
```bash
docker-compose down
```

---

## Production Deployment (Railway)

### Current Setup (Single Container)

#### 1. Connect Repository
```bash
railway link
# Select your project
```

#### 2. Set Environment Variables
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set NODE_ENV=production
```

#### 3. Deploy
```bash
git push origin main
# Railway auto-deploys when it detects changes
```

#### 4. Verify Deployment
```bash
railway logs

# Expected output:
# ✓ ELIMFILTERS Frontend running on port 3000
# ✓ API Server should run on 5000
```

---

## Production Checklist

### Before Going Live

- [ ] **Database**
  - [ ] PostgreSQL instance created (AWS RDS/Railway)
  - [ ] Automated backups enabled
  - [ ] SSL/TLS connection enforced
  - [ ] `filters` table created with proper indexes

- [ ] **Environment**
  - [ ] `DATABASE_URL` set as Railway secret
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`, `API_PORT=5000`
  - [ ] All secrets removed from git

- [ ] **Frontend**
  - [ ] Next.js build successful (`npm run build`)
  - [ ] All 44 pages render correctly
  - [ ] CDN URLs point to cdn.elimfilters.com
  - [ ] API routes point to correct API server

- [ ] **API**
  - [ ] `/api/search` working with sample queries
  - [ ] `/api/filter/:sku` returns correct data
  - [ ] `/api/cross-reference/:code` finds matches
  - [ ] `/api/get-country` detects IP correctly
  - [ ] Rate limiting active
  - [ ] CORS allows production origins

- [ ] **Security**
  - [ ] Helmet headers enabled
  - [ ] CORS whitelist configured
  - [ ] Rate limiting set to 200 req/15min
  - [ ] Database credentials not in logs

- [ ] **Monitoring**
  - [ ] Health endpoint accessible
  - [ ] Logs being collected
  - [ ] Error tracking enabled
  - [ ] Database connection pooling configured

- [ ] **DNS & CDN**
  - [ ] `elimfilters.com` → Frontend (Port 3000)
  - [ ] `api.elimfilters.com` → API (Port 5000)
  - [ ] `cdn.elimfilters.com` → Cloudflare R2
  - [ ] HTTPS/SSL enabled

---

## Monitoring Production

### Health Checks
```bash
# From your monitoring service (UptimeRobot, Datadog, etc.)

# Frontend health
GET https://elimfilters.com/health

# API health
GET https://api.elimfilters.com/health
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| API returns 500 | DB connection failed | Check `DATABASE_URL` env var |
| Country detection fails | geoip database outdated | `npm update geoip-lite` |
| CORS errors | Origin not whitelisted | Add to `allowedOrigins` in api-server.js |
| Search returns empty | Database has no data | Load filter data into PostgreSQL |

### Log Monitoring
```bash
# Watch production logs
railway logs --follow

# Search for errors
railway logs | grep ERROR
```

---

## Scaling to Multiple Instances

### Current Limitation
- Single container runs both servers
- Can't scale independently

### Future: Multi-Container Setup

#### Option 1: Railway Services
```yaml
services:
  - name: frontend
    dockerfile: Dockerfile.frontend
    port: 3000
    replicas: 2
    
  - name: api
    dockerfile: Dockerfile.api
    port: 5000
    replicas: 3
    env:
      DATABASE_URL: $DATABASE_URL
```

#### Option 2: Docker Swarm/Kubernetes
```bash
docker stack deploy -c docker-compose.prod.yml elimfilters

# Or with Kubernetes
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/api-deployment.yaml
```

---

## Database Maintenance

### Backup PostgreSQL
```bash
# Using pg_dump
pg_dump -h postgres-host -U username database_name > backup.sql

# Restore
psql -h postgres-host -U username database_name < backup.sql
```

### Monitor Connections
```sql
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### Create Indexes for Performance
```sql
CREATE INDEX idx_sku ON filters(UPPER(sku));
CREATE INDEX idx_base_code ON filters(UPPER(base_code));
CREATE INDEX idx_competitor_codes ON filters(competitor_codes);
```

---

## Rollback Procedure

### If Deployment Breaks Production

```bash
# 1. View recent deployments
railway deployments list

# 2. Rollback to previous version
railway deployments rollback <deployment_id>

# 3. Verify
railway logs
```

---

## Performance Optimization

### API Response Times
- Target: <200ms for search queries
- Current pool size: 10 connections
- Optimize: Add Redis caching for frequent queries

### Frontend Load Time
- Target: <3s DCP (Domcontentloaded)
- Current: Next.js optimized production build
- Optimize: Add image optimization, code splitting

### Database Queries
- All searches use LIMIT 20
- All cross-references ILIKE with wildcards
- Consider: Trigram indexes for text search

---

## Support & Contact

- **Issues:** GitHub Issues
- **Status:** Railway Dashboard
- **Logs:** `railway logs --follow`
- **Database:** PostgreSQL admin panel

---

**Document Version:** 2.0  
**Last Updated:** 2026-05-11  
**Status:** Production-Ready
