# 🚀 Production Launch Checklist

## Pre-Launch (1 Week Before)

### Code & Infrastructure
- [ ] All tests passing (`npm test`)
- [ ] No console errors in browser
- [ ] API endpoints responding correctly
- [ ] Database backups automated
- [ ] SSL/TLS certificates valid
- [ ] Domain DNS pointing to servers

### Database
- [ ] PostgreSQL cluster created (RDS/Railway)
- [ ] `filters` table populated with data
- [ ] Indexes created for performance:
  - `idx_sku ON filters(UPPER(sku))`
  - `idx_base_code ON filters(UPPER(base_code))`
  - `idx_competitor_codes ON filters(competitor_codes)`
- [ ] Connection pooling tested (pool size: 10)
- [ ] Backup & restore tested

### Environment
- [ ] `DATABASE_URL` set in Railway secrets
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`, `API_PORT=5000`
- [ ] No hardcoded secrets in code
- [ ] All env vars documented in `.env.example`

### Frontend (elimfilters.com)
- [ ] Next.js build successful: `npm run build`
- [ ] All 44 pages render: `/`, `/search`, `/about`, etc.
- [ ] All links functional
- [ ] Images load from `cdn.elimfilters.com`
- [ ] SearchButton detects country correctly
- [ ] No 404 errors in logs

### API Server (api.elimfilters.com)
- [ ] `/api/search?q=fuel` returns results
- [ ] `/api/filter/ABC123` returns SKU data
- [ ] `/api/cross-reference/FRAM` finds matches
- [ ] `/api/get-country` detects IP correctly
- [ ] Rate limiting: 200 requests/15 min
- [ ] CORS allows: elimfilters.com, www.elimfilters.com
- [ ] Response times < 200ms

### Security Audit
- [ ] Helmet headers enabled
- [ ] CORS whitelist verified
- [ ] No PII in API responses
- [ ] SQL injection prevention: parameterized queries
- [ ] XSS prevention: CSP headers
- [ ] Rate limiting active
- [ ] Database credentials not in git
- [ ] No console.log of sensitive data

### Monitoring & Logging
- [ ] Health check endpoint: `GET /health`
- [ ] Error tracking enabled (Sentry/DataDog)
- [ ] Log aggregation set up (CloudWatch/Papertrail)
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Alert rules configured for:
  - API errors (500+)
  - Database connection failures
  - High response times (> 1s)

### Performance
- [ ] Frontend DCP (Domcontentloaded) < 3s
- [ ] API response time < 200ms (p95)
- [ ] Database query time < 100ms (p95)
- [ ] Lighthouse score > 80
- [ ] No memory leaks in production logs

---

## Launch Day (Go-Live)

### 1 Hour Before
- [ ] All team members notified
- [ ] Staging environment matches production
- [ ] Rollback plan documented
- [ ] Support team briefed

### 30 Minutes Before
- [ ] Database backup created
- [ ] Monitoring dashboard open
- [ ] Status page updated: "Maintenance mode"
- [ ] Test critical paths:
  - Frontend homepage loads
  - API search works
  - Country detection works

### At Launch
- [ ] DNS switch completed (or Railway deploy clicked)
- [ ] Monitor error logs for 5 minutes
- [ ] Test from external browser
- [ ] Announce availability: "ELIMFILTERS is live!"

### Post-Launch (First 2 Hours)
- [ ] Monitor error rate (target: < 0.1%)
- [ ] Monitor response time (target: p95 < 500ms)
- [ ] Monitor database connections (target: < 5 connections)
- [ ] Check support inbox for issues
- [ ] Verify user search functionality
- [ ] Verify API rate limiting working

---

## Post-Launch (First Week)

### Daily Checks
- [ ] Zero critical errors
- [ ] API response times stable
- [ ] Database size growing as expected
- [ ] No resource exhaustion
- [ ] All features working as expected

### Weekly Checks
- [ ] Database optimization run
- [ ] Log analysis for patterns
- [ ] Performance trend analysis
- [ ] Security scan
- [ ] User feedback review

---

## Rollback Triggers

Stop and rollback if any of these occur:

1. **API Availability**: Error rate > 5%
2. **Response Time**: p95 > 2 seconds
3. **Database**: Connection errors > 10
4. **Security**: CORS violations, SQL errors in logs
5. **Frontend**: Cannot access homepage or search page

### Rollback Process
```bash
# View recent deployments
railway deployments list

# Rollback to previous working version
railway deployments rollback <deployment_id>

# Verify
railway logs --follow
```

---

## Success Metrics (Target)

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.9% | Setup monitoring |
| Search response | < 200ms | TBD |
| Page load | < 3s | TBD |
| Error rate | < 0.1% | TBD |
| DB connections | < 5 | TBD |
| API rate limit | 200/15min | ✓ Configured |

---

## Post-Launch (Week 2+)

### Database Optimization
```sql
-- Analyze query performance
ANALYZE filters;

-- Create additional indexes if needed
CREATE INDEX idx_technology ON filters(technology);
```

### Scaling Assessment
- Is API getting hit hard? Consider read replicas
- Is frontend slow? Consider CDN edge caching
- Are connection pools exhausting? Increase pool size

### Feature Enhancements
- Add Redis caching for frequent searches
- Implement search autocomplete
- Add analytics tracking
- Build admin dashboard

---

## Emergency Contacts

- **Developer:** [Your Name] - [Email]
- **DevOps:** Railway Support - support@railway.app
- **Database:** PostgreSQL DBA - [Contact]
- **Security:** Security Team - [Email]

---

## Documentation References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [README.md](./README.md) - Quick start guide
- Railway Docs: https://docs.railway.app

---

**Created:** 2026-05-11  
**Status:** Ready for Production Launch  
**Version:** 1.0
