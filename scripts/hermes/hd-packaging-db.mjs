import pg from 'pg';

const { Pool } = pg;

export function getCatalogueConnectionString(env = process.env) {
  return env.CATALOG_DATABASE_URL || env.DATABASE_URL || null;
}

export function getSslConfig(connectionString, env = process.env) {
  const explicit = String(env.PGSSL || env.PGSSLMODE || '').trim().toLowerCase();
  if (['disable','false','0','off','no'].includes(explicit)) return false;
  if (['require','true','1','on','yes','prefer','verify-ca','verify-full'].includes(explicit)) {
    return { rejectUnauthorized: false };
  }

  try {
    const url = new URL(connectionString);
    const sslMode = String(url.searchParams.get('sslmode') || '').toLowerCase();
    if (sslMode === 'disable') return false;
    if (['require','prefer','verify-ca','verify-full'].includes(sslMode)) return { rejectUnauthorized: false };

    const host = url.hostname.toLowerCase();
    if (['localhost','127.0.0.1','::1'].includes(host)) return false;
    if (host.endsWith('.render.com') || host.includes('render')) return { rejectUnauthorized: false };
  } catch {}

  // Remote PostgreSQL deployments used by ELIMFILTERS require TLS by default.
  return { rejectUnauthorized: false };
}

export function createCataloguePool(env = process.env) {
  const connectionString = getCatalogueConnectionString(env);
  if (!connectionString) throw new Error('CATALOG_DATABASE_URL or DATABASE_URL is required');
  return new Pool({ connectionString, ssl: getSslConfig(connectionString, env) });
}
