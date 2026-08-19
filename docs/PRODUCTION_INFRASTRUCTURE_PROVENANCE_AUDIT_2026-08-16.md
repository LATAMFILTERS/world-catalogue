# ELIMFILTERS Production Infrastructure & Provenance Audit — Final Report

**Date:** 2026-08-16  
**Repository:** `LATAMFILTERS/world-catalogue`  
**Audit mode:** Read-only  
**Final status:** CLOSED

## Executive conclusion

Phase 0 of the production infrastructure/provenance audit is closed.

The current public ELIMFILTERS surfaces are served through Cloudflare in front of Render. The production frontend and part-search service both trace to `LATAMFILTERS/world-catalogue`, branch `main`. GitHub Actions performs validation/gating work but is not the production deployment mechanism for the Next.js frontend or part-search service. A live production PostgreSQL instance exists in Render, but the contents of its `technologies` table and whether `database/seeds/001_technologies.sql` was applied remain unconfirmed because no database credentials were accessed and no production queries were executed.

## Final status matrix

| Layer | Status |
|---|---|
| Production infrastructure (Render services, Cloudflare DNS/proxy, GitHub Actions role) | **PROVEN** |
| Production repo/branch/routing (`LATAMFILTERS/world-catalogue`, branch `main`, both services) | **PROVEN** |
| Production Postgres existence/activity (`Catalogo-Elimfilters`) | **PROVEN** |
| `technologies` table contents (existence, schema, row data) | **UNCONFIRMED** |
| `database/seeds/001_technologies.sql` applied to production | **UNCONFIRMED** |

## Production surface map

- `elimfilters.com` → Cloudflare proxied DNS → `elimfilters-frontend.onrender.com` → Render Static Site `elimfilters-frontend` → repo `LATAMFILTERS/world-catalogue` → branch `main` → publish directory `frontend/out`.
- `www.elimfilters.com` → same origin chain as the apex domain.
- `part-search.elimfilters.com` → Cloudflare proxied DNS → `elimfilters-search-pro.onrender.com` → Render Web Service `elimfilters-search-pro` → same repo and branch.
- `/api/citation/**` is generated at build time and served as static output from the frontend deployment.

## Render

### Production services

**Project:** `KLEO TECH` → `Production`

- `elimfilters-frontend` — Static Site — **Live**
- `elimfilters-search-pro` — Node Web Service — **Live**
- `Catalogo-Elimfilters` — PostgreSQL 18 — **Available**
- `elimfilters-bot-memory` — Valkey 8

### Frontend service

- Service: `elimfilters-frontend`
- Repo: `LATAMFILTERS/world-catalogue`
- Branch: `main`
- Build command: `npm run build`
- Publish directory: `frontend/out`
- Custom domain: `elimfilters.com`
- Auto-deploy: **Off**
- Production deploys are manually/human-triggered with a specific commit.

### Part Search service

- Service: `elimfilters-search-pro`
- Repo: `LATAMFILTERS/world-catalogue`
- Branch: `main`
- Build command: `npm install`
- Root directory: repository root
- Custom domain: `part-search.elimfilters.com`
- Auto-deploy: **Off**

### Production database

`Catalogo-Elimfilters` is a live PostgreSQL 18 instance in the same production project.

Observed non-secret metadata during the audit:

- Status: **Available**
- Storage use: **14.81% of 5 GB**
- Active open connections at time of check: **1**
- Non-trivial data is therefore present in the database.

No connection credentials, passwords, database URLs, or environment-variable values were accessed or exposed.

## Cloudflare / DNS

The production hostnames are proxied through Cloudflare and resolve to Render origins.

| Hostname | DNS target | Proxy |
|---|---|---|
| `elimfilters.com` | `elimfilters-frontend.onrender.com` | Cloudflare proxied |
| `www.elimfilters.com` | `elimfilters-frontend.onrender.com` | Cloudflare proxied |
| `part-search.elimfilters.com` | `elimfilters-search-pro.onrender.com` | Cloudflare proxied |

Additional infrastructure observed during the audit included `cdn.elimfilters.com`, `command.elimfilters.com`, Microsoft 365 mail routing, and legacy GoDaddy/SecureServer records. These were outside the core production-surface scope.

No Cloudflare Pages project was found serving the three primary production hostnames. No active Worker route was found diverting those hostnames away from their Render origins.

## GitHub Actions / deployment provenance

GitHub Actions runs validation and governance workflows on `main`, including examples such as:

- Chatbot safety gate
- Repository Guardian
- Search Engine
- Bot Protocol Validation

These workflows are not the production deployment mechanism for the main Next.js frontend or the part-search Render service.

Production deployment is performed through Render's manual deploy mechanism. Render auto-deploy is disabled on the production services.

## Railway

The authenticated Railway workspace `elimfilters` was checked and ruled out as the current production host for this workspace.

Observed state:

- 0 active projects
- 0 services
- 0 deployments
- 0 custom domains
- trial ended
- one unpublished `Catalogo PostgreSql` template remained

This rules out that specific Railway workspace as the active production environment. It does not rule out a different Railway account/team/workspace.

## P1.2 — production technology seed status

### Final status: **UNCONFIRMED**

The audit did not establish whether `database/seeds/001_technologies.sql` was applied to `Catalogo-Elimfilters`.

What is proven:

- A real production PostgreSQL instance exists.
- It is active and contains non-trivial data.
- It resides in the same Render production project as the live frontend and part-search services.

What remains unconfirmed:

- Whether a `technologies` table exists in that instance.
- Its schema, row count, or current data.
- Whether HYDROCORE, TURBOCORE, SYNTAPORE, or other canonical technology rows match the current codebase.
- Whether `database/seeds/001_technologies.sql` was ever applied to this database.

Render's managed Postgres UI does not provide a secret-free SQL console/schema browser for this instance. Inspecting table-level contents would require database connection credentials and an external client such as `psql`. This audit explicitly did not access those credentials or run production database queries.

## Live-production content finding retained from the audit

Separate from P1.2, the audit confirmed that some Knowledge Center pages in live production expose contradictory or ungoverned technical claims while canonical technology pages use more conservative language. Examples observed during the audit included conflicting MACROCORE and NANOFORCE performance references across live pages.

These live-page findings remain valid independently of the unconfirmed database-seed question and should be handled under the separate Knowledge Center/content-governance remediation track.

## Audit boundary and actions not performed

This audit was read-only.

No files were modified as part of the infrastructure inspection itself. No deployments, merges, restarts, DNS changes, environment-variable changes, database credential retrieval, or production SQL queries were performed.

The only deliberate boundary left open is P1.2 at table level.

## Final conclusion

- Production infrastructure: **PROVEN**
- Production repo/branch/routing: **PROVEN**
- Production PostgreSQL existence/activity: **PROVEN**
- `technologies` table contents: **UNCONFIRMED**
- `database/seeds/001_technologies.sql` applied: **UNCONFIRMED**

**Audit closed at this boundary.**
