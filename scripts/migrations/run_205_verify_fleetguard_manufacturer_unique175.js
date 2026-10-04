'use strict';

require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const EXPECTED = 175;
const SITEMAP_URL = 'https://www.fleetguard.com/sitemap-product-1.xml';
const EVIDENCE_AUTHORITY = 'FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP';

function norm(v) {
  return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function sha(v) {
  return crypto.createHash('sha256').update(v).digest('hex');
}

function runtimeUrl() {
  const direct = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (direct) return direct;
  const runner = fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1', 'utf8');
  const m = runner.match(/\$env:DATABASE_URL='([^']+)'/);
  if (!m) throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}

async function fetchSitemap() {
  const r = await fetch(SITEMAP_URL, { redirect: 'follow' });
  if (!r.ok) throw new Error('FLEETGUARD_SITEMAP_HTTP_' + r.status);
  const xml = await r.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const byCode = new Map();
  for (const url of urls) {
    const m = url.match(/\/product\/([^/?#<]+)/i);
    if (m) byCode.set(norm(decodeURIComponent(m[1])), url);
  }
  return { xml, hash: sha(xml), urls, byCode };
}

async function main() {
  const url = runtimeUrl();
  const u = new URL(url);
  if (!['127.0.0.1', 'localhost'].includes(u.hostname) || !['5432', '5441'].includes(u.port) || u.pathname !== '/catalogo_elimfilters') {
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const sitemap = await fetchSitemap();
  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const report = {
    migration: '205_VERIFY_FLEETGUARD_MANUFACTURER_UNIQUE175',
    mode: EXECUTE ? 'execute' : 'dry-run',
    selected: 0,
    verified: 0,
    unresolved: 0,
    sitemap_url_count: sitemap.urls.length,
    mutations: {
      sku: 0,
      codigo_base: 0,
      alternates: 0,
      governance: 0,
      evidence: 0
    },
    details: []
  };

  try {
    const q = await db.query(
      "SELECT q.sku,q.current_codigo_base,c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' AS candidates " +
      "FROM public.catalog_codigo_base_sanitation_queue q " +
      "JOIN public.elimfilters_catalog c ON c.sku=q.sku " +
      "WHERE q.status='PENDING' AND q.attempts<3 " +
      "AND q.governance_state='REVIEW_PRIMARY_CANDIDATE' " +
      "AND coalesce(q.last_error,'') NOT IN ('CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY','CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY') " +
      "AND c.duty='HEAVY_DUTY' " +
      "AND jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb))=1 " +
      "ORDER BY q.sku"
    );

    report.selected = q.rowCount;
    if (q.rowCount !== EXPECTED) {
      throw new Error('EXPECTED_' + EXPECTED + '_UNIQUE_ROWS_GOT_' + q.rowCount);
    }

    for (const row of q.rows) {
      const current = row.current_codigo_base;
      const productUrl = sitemap.byCode.get(norm(current));
      if (!productUrl) {
        report.unresolved++;
        report.details.push({ sku: row.sku, current, status: 'UNRESOLVED', reason: 'NOT_IN_FLEETGUARD_SITEMAP' });
        continue;
      }

      const now = new Date().toISOString();
      const evidenceHash = sha(JSON.stringify({
        sitemap_hash: sitemap.hash,
        product_url: productUrl,
        code: current
      }));
      const candidate = Array.isArray(row.candidates) ? row.candidates[0] : null;

      report.verified++;
      report.details.push({
        sku: row.sku,
        current,
        candidate,
        product_url: productUrl,
        status: 'FLEETGUARD_MANUFACTURER_AND_CODE_VERIFIED'
      });

      if (!EXECUTE) continue;

      const ev = await db.query(
        "INSERT INTO public.catalog_codigo_base_evidence " +
        "(sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) " +
        "VALUES ($1,'OFFICIAL_PRODUCT_SITEMAP',$2,'FLEETGUARD',$3,$4,$5,$6,$7,$8::jsonb) " +
        "ON CONFLICT DO NOTHING RETURNING id",
        [
          row.sku,
          EVIDENCE_AUTHORITY,
          current,
          norm(current),
          productUrl,
          evidenceHash,
          now,
          JSON.stringify({
            sitemap_url: SITEMAP_URL,
            sitemap_hash: sitemap.hash,
            product_url: productUrl,
            purpose: 'MANUFACTURER_AND_COMMERCIAL_CODE_VERIFICATION_ONLY',
            candidate_primary_reference: candidate,
            canonical_promotion_allowed: false,
            donaldson_absence_verified: false
          })
        ]
      );

      report.mutations.evidence += ev.rowCount;
    }

    if (report.unresolved !== 0) throw new Error('UNRESOLVED_ROWS_' + report.unresolved);
    return report;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().then(r => console.log(JSON.stringify(r, null, 2))).catch(e => {
    console.error(e.stack || e.message);
    process.exit(1);
  });
}

module.exports = { main };
