'use strict';

/**
 * Verifies REVIEW_DONALDSON_CANDIDATE rows against official Donaldson Shop pages.
 * Default mode is audit-only. --apply writes ONLY rows with one verified candidate.
 * No LLM and no inferred manufacturer absence.
 */

require('dotenv').config();
const { Pool } = require('pg');
const { pageSupportsCrossReference, normalizeCode } = require('../../lib/donaldson-official-evidence');

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find((v) => v.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 682) : 682;
const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOfficialCandidate(code) {
  const encoded = encodeURIComponent(String(code).trim());
  const urls = [
    `https://shop.donaldson.com/store/en-us/product/${encoded}`,
    `https://shop.donaldson.com/store/fr-us/product/${encoded}`,
  ];

  for (const url of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'ELIMFILTERS-Catalog-Governance/1.0 (+https://elimfilters.com)',
          'accept-language': 'en-US,en;q=0.9',
        },
      });
      if (!response.ok) continue;
      const html = await response.text();
      if (normalizeCode(html).includes(normalizeCode(code))) {
        return { ok: true, url: response.url || url, html, status: response.status };
      }
    } catch (_) {
      // Try next locale; network failures never become evidence.
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, url: null, html: '', status: null };
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT sku, codigo_base, duty, enrichment_data
      FROM elimfilters_catalog
      WHERE enrichment_data->'codigo_base_governance'->>'state' = 'REVIEW_DONALDSON_CANDIDATE'
      ORDER BY sku
      LIMIT $1
    `, [LIMIT]);

    const verified = [];
    const unresolved = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const gov = row.enrichment_data?.codigo_base_governance || {};
      const candidates = Array.isArray(gov.observed_preferred_candidates)
        ? [...new Set(gov.observed_preferred_candidates.map(String).filter(Boolean))]
        : [];
      const matches = [];

      for (const candidate of candidates) {
        const page = await fetchOfficialCandidate(candidate);
        if (page.ok && pageSupportsCrossReference(page.html, candidate, row.codigo_base)) {
          matches.push({ candidate, url: page.url });
        }
        await sleep(250);
      }

      if (matches.length === 1) {
        verified.push({
          sku: row.sku,
          from: row.codigo_base,
          to: matches[0].candidate,
          evidence_url: matches[0].url,
        });
      } else {
        unresolved.push({
          sku: row.sku,
          codigo_base: row.codigo_base,
          candidates,
          verified_matches: matches.map((m) => m.candidate),
          reason: matches.length === 0 ? 'NO_OFFICIAL_CROSS_REFERENCE_MATCH' : 'MULTIPLE_OFFICIAL_MATCHES',
        });
      }

      if ((i + 1) % 25 === 0 || i + 1 === rows.length) {
        console.log(`[run_071] checked ${i + 1}/${rows.length} | verified=${verified.length} | unresolved=${unresolved.length}`);
      }
    }

    console.log(JSON.stringify({
      mode: APPLY ? 'APPLY' : 'DRY_RUN',
      selected_rows: rows.length,
      verified_single_candidate: verified.length,
      unresolved: unresolved.length,
      evidence_authority: 'OFFICIAL_DONALDSON_SHOP_CROSS_REFERENCE',
    }, null, 2));

    if (verified.length) console.table(verified.slice(0, 100));
    if (unresolved.length) console.table(unresolved.slice(0, 50));

    if (!APPLY) {
      console.log('\nDry run only. Use --apply only after reviewing verified count and examples.');
      return;
    }

    await client.query('BEGIN');
    for (const item of verified) {
      const evidence = {
        replacement_verified: true,
        approved_codigo_base: item.to,
        approved_authority: 'DONALDSON',
        evidence_authority: 'OFFICIAL_DONALDSON_SHOP_CROSS_REFERENCE',
        evidence_url: item.evidence_url,
        verified_at: new Date().toISOString(),
      };
      await client.query(`
        UPDATE elimfilters_catalog
        SET enrichment_data = jsonb_set(
              coalesce(enrichment_data, '{}'::jsonb),
              '{codigo_base_governance}',
              coalesce(enrichment_data->'codigo_base_governance', '{}'::jsonb) || $1::jsonb,
              true
            ),
            codigo_base = $2
        WHERE sku = $3
          AND enrichment_data->'codigo_base_governance'->>'state' = 'REVIEW_DONALDSON_CANDIDATE'
      `, [JSON.stringify(evidence), item.to, item.sku]);
    }
    await client.query('COMMIT');

    const verify = await client.query(`
      SELECT
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'state' = 'REVIEW_DONALDSON_CANDIDATE')::int AS remaining_candidates,
        count(*) FILTER (
          WHERE enrichment_data->'codigo_base_governance'->>'approved_authority' = 'DONALDSON'
            AND enrichment_data->'codigo_base_governance'->>'replacement_verified' = 'true'
        )::int AS verified_donaldson_approvals
      FROM elimfilters_catalog
    `);

    console.log(JSON.stringify({
      applied: verified.length,
      ...verify.rows[0],
    }, null, 2));
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
