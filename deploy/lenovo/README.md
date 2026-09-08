# ELIMFILTERS world-catalogue — Lenovo hybrid node

This deployment makes the Lenovo the preferred primary node for continuous/private `world-catalogue`, Part Search and technical HERMES workloads while preserving the cloud layer. GitHub remains source control/audit, Render may remain runtime/failover where required, and Cloudflare remains the public routing/security layer.

Read `../../HYBRID_RUNTIME_CONTRACT.md` and the repository `CLAUDE.md` before changing schedulers, HERMES ownership, catalogue jobs or deployment behavior.

## First deployment

```bash
cd /srv/elimfilters/world-catalogue
git pull origin main
cd deploy/lenovo
cp .env.example .env
nano .env

docker compose up -d --build
docker compose ps
```

The Lenovo container validates its hybrid runtime role before starting. Default Lenovo identity is:

```text
ELIM_RUNTIME_NODE=LENOVO
ELIM_RUNTIME_ROLE=PRIMARY
ELIM_DOMAIN=WORLD_CATALOGUE
ELIM_SCHEDULER_ENABLED=true
```

A Render/GitHub standby copy must not run recurring production schedulers.

## Health check

```bash
curl -I http://127.0.0.1:3100
```

## Update

```bash
cd /srv/elimfilters/world-catalogue
git pull origin main
cd deploy/lenovo
docker compose up -d --build
```

## Separation and failover

The service binds only to localhost on port 3100 and should be published through the Lenovo reverse proxy/Cloudflare Tunnel. Do not share CRM runtime volumes or turn `world-catalogue` into a writer of CRM commercial state. Keep cloud continuity available, but never run the same recurring technical/catalogue mutation job actively on Lenovo and cloud at the same time.
