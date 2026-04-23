#!/bin/sh
# Start Express on port 3000 in background
node server.js &
# Start Caddy in foreground (Railway monitors this process)
caddy run --config /app/Caddyfile
