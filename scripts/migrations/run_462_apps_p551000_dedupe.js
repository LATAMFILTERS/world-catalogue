'use strict';

/**
 * Equipment applications cleanup (operator order 2026-11-18, "hazlo de una vez").
 *  - ES91000 (Donaldson P551000): loads the official Donaldson equipment tab (data/es91000_applications_20261118.txt), operator pasted.
 *  - ES90901 (P550901): Donaldson's own page lists no equipment; its 993 applications were a family copy (990 identical to ES98000). Cleared.
 *  - EL82637 (LF3000TP): its 919 applications are a 100% copy of EL83000 (Donaldson P553000, verified). Cleared.
 *  - ES98000 (P558000) keeps its list: official Donaldson P558000 evidence on file.
 * Writes go through the governed application write service. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
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
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P551000/20569';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const snap = (await db.query("SELECT sku, equipment_applications, enrichment_data->'application_governance' gov FROM public.elimfilters_catalog WHERE sku IN ('ES90901','EL82637','ES91000')")).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: snap }, null, 2));
    const es = snap.find((r) => r.sku === 'ES91000');
    if ((es.equipment_applications || []).length) throw new Error('ES91000_ALREADY_HAS_APPLICATIONS');

    // type lookup learned from existing verified HD rows (same Donaldson source, English type names)
    const known = new Map();
    const all = (await db.query("SELECT equipment_applications ea FROM public.elimfilters_catalog WHERE catalog_active AND duty='HEAVY_DUTY' AND jsonb_array_length(coalesce(equipment_applications,'[]'))>0")).rows;
    for (const r of all) for (const e of r.ea) if (e.type && !known.has(norm(e.equipment) + '|' + norm(e.engine))) known.set(norm(e.equipment) + '|' + norm(e.engine), e.type);

    const lines = fs.readFileSync(path.join(__dirname, 'data', 'es91000_applications_20261118.txt'), 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
    const parsed = lines.map((l) => { const [equipment, engine, es_type, year] = l.split('|'); return { equipment: equipment.trim().toUpperCase(), engine: engine.trim().toUpperCase(), es_type: es_type.trim(), year: (year || '').trim() }; });
    const es2en = new Map();
    for (const p of parsed) { const t = known.get(norm(p.equipment) + '|' + norm(p.engine)); if (t) { if (!es2en.has(p.es_type)) es2en.set(p.es_type, new Map()); const m = es2en.get(p.es_type); m.set(t, (m.get(t) || 0) + 1); } }
    const typeFor = (p) => {
      const direct = known.get(norm(p.equipment) + '|' + norm(p.engine));
      if (direct) return direct;
      const m = es2en.get(p.es_type);
      if (!m) return null;
      return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    };
    const apps = []; const unknown = []; const seen = new Set();
    for (const p of parsed) {
      const type = typeFor(p);
      if (!type) { unknown.push(`${p.equipment}|${p.engine}|${p.es_type}`); continue; }
      const e = { type, engine: p.engine, equipment: p.equipment.replace(/\s*-\s*/, ' ').replace(/\s+/g, ' ').trim() };
      if (p.year) e.equipment_options = p.year;
      const k = norm(`${e.equipment}|${e.engine}|${e.equipment_options || ''}`);
      if (seen.has(k)) continue; seen.add(k); apps.push(e);
    }
    report.es91000 = { listed: parsed.length, loaded: apps.length, type_unresolved: unknown.length ? unknown : undefined };
    if (unknown.length) throw new Error('TYPE_UNRESOLVED ' + unknown.slice(0, 10).join(' ; '));
    await applyVerifiedApplications(db, { sku: 'ES91000', equipment_applications: apps,
      evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: 'ES91000', n: apps.length, URL_DON }), metadata: { method: 'official-donaldson-equipment-list-operator-pasted', equipment_count: apps.length } } });

    for (const [sku, why] of [['ES90901', 'P550901 official page lists no equipment; list was a family copy of ES98000'], ['EL82637', 'list was a 100% copy of EL83000 (Donaldson P553000)']]) {
      await applyVerifiedApplications(db, { sku, equipment_applications: [],
        evidence: { authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-18', source_url: null, evidence_hash: sha({ sku, why }), metadata: { method: 'duplicate-application-list-cleared', reason: why } } });
    }
    report.after = (await db.query("SELECT sku, jsonb_array_length(coalesce(equipment_applications,'[]')) n FROM public.elimfilters_catalog WHERE sku IN ('ES90901','ES98000','EL82637','EL83000','ES91000') ORDER BY sku")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
