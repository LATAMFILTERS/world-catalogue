#!/bin/bash
# Script de migración Railway → Neon
# Uso: ./migrate-to-neon.sh "postgresql://user:pass@host/db"

RAILWAY_URL="postgresql://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway"
NEON_URL="${1}"

if [ -z "$NEON_URL" ]; then
  echo "ERROR: Pasa la connection string de Neon como argumento"
  echo "Uso: ./migrate-to-neon.sh 'postgresql://user:pass@host/db'"
  exit 1
fi

echo "📦 Exportando desde Railway..."
pg_dump "$RAILWAY_URL" \
  --table=elimfilters_catalog \
  --no-owner \
  --no-acl \
  --format=plain \
  -f elimfilters_catalog_backup.sql

echo "✅ Export completo: elimfilters_catalog_backup.sql"

echo "🚀 Importando en Neon..."
psql "$NEON_URL" -f elimfilters_catalog_backup.sql

echo "✅ Migración completa"

echo "🔍 Verificando..."
psql "$NEON_URL" -c "SELECT COUNT(*) FROM elimfilters_catalog;"
