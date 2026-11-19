'use strict';

/**
 * Operator order 2026-11-18: "TODOS LOS MODELOS DE CAMIONES DEL CATALOGO VENEZUELA DEBEN APARECER TAMBIEN EN PART SEARCH", with the Catálogo Venezuela itself
 * ("información verificada por el Departamento de Marketing y Soporte Técnico de ELIMFILTERS") authorised as the evidence (operator choice 2, 2026-11-18).
 * For every ficha of the public catalogue (part-search/catalogo-venezuela/catalogo-venezuela-buses-y-camiones.html) and every Heavy Duty SKU listed in it, the model is added to
 * the SKU's equipment_applications (equipment = "<brand> <model>", engine = the ficha engine) unless an entry for that model is already there.
 * Excluded by the operator (still to be verified): FAW, JAC Motors, Sinotruk. SKUs that do not exist in the catalogue are reported, never created.
 * The write goes through the application gateway; evidence = authority ELIMFILTERS_MARKETING_CATALOGUE_VENEZUELA + the public ficha URL. When a SKU already carried
 * other application evidence, that evidence is kept in application_governance.previous_evidence.
 * Usage: node run_425... [--include-brands "JAC MOTORS"] [--only ficha-id,ficha-id] [--execute --snapshot <file>]. Dry-run by default (ROLLBACK).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const ONLY = (arg('--only') || '').split(',').map((s) => s.trim()).filter(Boolean);
const INCLUDE_BRANDS = new Set((arg('--include-brands') || '').split(',').map((x) => x.trim().toUpperCase()).filter(Boolean)); // operator lifts the exclusion per brand (JAC MOTORS: 2026-11-19)
const EXCLUDED_BRANDS = new Set(['FAW', 'JAC MOTORS', 'SINOTRUK'].filter((b) => !INCLUDE_BRANDS.has(b)));
const AUTHORITY = 'ELIMFILTERS_MARKETING_CATALOGUE_VENEZUELA_OPERATOR_AUTHORIZED_20261118';
const PAGE = 'https://part-search.elimfilters.com/catalogo_on_road_vzla/';
const sha = (v) => crypto.createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const decode = (s) => String(s || '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();

function parseFichas() {
  const html = fs.readFileSync(path.join(__dirname, '..', '..', 'part-search', 'catalogo-venezuela', 'catalogo-venezuela-buses-y-camiones.html'), 'utf8');
  return html.split('<article id="ficha-').slice(1).map((a) => {
    const id = a.slice(0, a.indexOf('"'));
    const cardBrand = decode((a.match(/card-brand">([^<]*)/) || [])[1]);
    const [brand, kind] = cardBrand.split('·').map((x) => x.trim());
    return {
      id, brand: brand || '', kind: /bus/i.test(kind || '') ? 'BUS' : 'TRUCK', model: decode((a.match(/<h3>([^<]*)<\/h3>/) || [])[1]),
      engine: decode((a.match(/<span>Motor<\/span>\s*([^<]*)/) || [])[1]),
      skus: [...new Set([...a.matchAll(/class="fcode">([A-Z0-9]+)</g)].map((m) => m[1]))],
    };
  });
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', fichas: 0, skus_updated: 0, entries_added: 0, skipped: [], per_sku: {} };
  try {
    await db.query('BEGIN');
    const fichas = parseFichas().filter((f) => !EXCLUDED_BRANDS.has(f.brand.toUpperCase()) && (!ONLY.length || ONLY.includes(f.id)));
    report.fichas = fichas.length;
    const allSkus = [...new Set(fichas.flatMap((f) => f.skus))];
    const rows = (await db.query('SELECT sku, duty, catalog_active, equipment_applications, enrichment_data FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [allSkus])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    const bySku = Object.fromEntries(rows.map((r) => [r.sku, r]));
    const additions = {}; // sku -> [entries]
    for (const f of fichas) {
      const url = `${PAGE}#ficha-${f.id}`;
      for (const sku of f.skus) {
        const r = bySku[sku];
        if (!r) { report.skipped.push(`${f.id} ${sku}: SKU_NOT_IN_CATALOGUE`); continue; }
        if (!r.catalog_active || r.duty !== 'HEAVY_DUTY') { report.skipped.push(`${f.id} ${sku}: NOT_ACTIVE_HD`); continue; }
        const equipment = `${f.brand} ${f.model}`.toUpperCase().replace(/\s+/g, ' ').trim();
        const key = norm(f.brand) + '|' + norm(f.model);
        const have = (r.equipment_applications || []).concat(additions[sku] || []).some((e) => (norm(e.equipment) + '|' + norm(e.engine)).includes(norm(f.model)) && norm(e.equipment).includes(norm(f.brand).slice(0, 5)));
        if (have) continue;
        (additions[sku] = additions[sku] || []).push({ type: f.kind, engine: f.engine.toUpperCase(), equipment, _url: url, _key: key });
      }
    }
    for (const [sku, adds] of Object.entries(additions)) {
      const cur = bySku[sku];
      const merged = (cur.equipment_applications || []).concat(adds.map(({ _url, _key, ...e }) => e));
      const urls = [...new Set(adds.map((a) => a._url))];
      const old = (cur.enrichment_data && cur.enrichment_data.application_governance) || null;
      await applyVerifiedApplications(db, {
        sku, equipment_applications: merged,
        evidence: { authority: AUTHORITY, source_url: urls[0], evidence_hash: sha({ sku, urls, adds: adds.map((a) => a.equipment) }), metadata: { method: 'operator-authorised-catalogo-venezuela', ficha_urls: urls, models_added: adds.map((a) => a.equipment) } },
      });
      if (old && old.evidence_authority && old.evidence_authority !== AUTHORITY) {
        await db.query(
          `UPDATE public.elimfilters_catalog SET enrichment_data = jsonb_set(enrichment_data, '{application_governance,previous_evidence}',
             coalesce(enrichment_data->'application_governance'->'previous_evidence','[]'::jsonb) || $2::jsonb, true) WHERE sku=$1`,
          [sku, JSON.stringify([{ authority: old.evidence_authority, source_url: old.evidence_url || null, evidence_hash: old.evidence_hash || null, verified_at: old.verified_at || null }])]);
      }
      report.skus_updated += 1; report.entries_added += adds.length;
      report.per_sku[sku] = { before: (cur.equipment_applications || []).length, added: adds.map((a) => a.equipment) };
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
