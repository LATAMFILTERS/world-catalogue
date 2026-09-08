# ELIMFILTERS world-catalogue — Lenovo deployment

This service runs independently from the CRM on the Lenovo private server. GitHub remains source control; runtime execution stays local.

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

## Separation

The service binds only to localhost on host port 3100. Publish it externally through the Lenovo reverse proxy or Cloudflare Tunnel. Do not share the CRM Docker network or runtime volumes.

## Cutover rule

Keep the current production runtime available until this local service passes health checks and the public route has been switched successfully.
