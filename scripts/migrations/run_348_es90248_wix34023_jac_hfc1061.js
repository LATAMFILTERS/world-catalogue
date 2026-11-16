'use strict';

/**
 * ES90248 (Donaldson P550248): (1) add WIX 34023 as an aftermarket alternate reference and (2) add JAC HFC1061 (CY4102BZLQ 4L 3.9L,
 * 4.5 and 4.7 ton) as an equipment application. Sources, by operator decision 2026-11-15: the Petroil Venezuela pages (product 34023 and
 * the HFC1061 application page) and the O'Reilly listing the operator pasted (34023 = P550248 = BF9821 = FS19587 = F4023). They are
 * distributor/retailer pages, not official sheets. Only WIX 34023 is added as a code (BF9821, FS19587, F4023 are not loaded).
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const JAC_PAGE = 'https://petroil.net/productos/aplicaciones/jac/trucks/80552=Camiones-JAC-Modelo-HFC1061-Motor-CY4102BZLQ-4L-3.9L-4.5-y-4.7-Ton';
const SKUS = ['ES90248'];
const WIX_PAGE = 'https://www.petroil.net/productos/filtros-separadores-de-agua/62999=34023-filtro-wix-combustible-separador-agua-camion-jac-hfc1061';
const WIX_REF = { code: '34023', manufacturer: 'WIX', classification: 'AFTERMARKET', classification_source: 'PETROIL_VENEZUELA_AND_OREILLY_LISTINGS_OPERATOR_DIRECTED_20261115', source_url: WIX_PAGE };
const ENTRY = { type: 'TRUCK', engine: 'CY4102BZLQ 4L 3.9L', equipment: 'JAC HFC1061', equipment_options: '4.5 Y 4.7 TON; VENEZUELA' };
const key = (x) => `${x.equipment}|${x.engine}`;

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;

  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [SKUS])).rows;
    if (rows.length !== SKUS.length) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    for (const cur of rows) {
      const codes = [...cur.oem_codes, ...cur.competitor_codes].map((x) => String(x.code).toUpperCase().replace(/[^A-Z0-9]/g, ''));
      if (!codes.includes('34023')) {
        const other = (await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE sku<>$1 AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Za-z0-9]','','g'))='34023')`, [cur.sku])).rows;
        if (other.length) throw new Error('REFERENCE_COLLISION ' + other.map((r) => r.sku).join(','));
        const patch = { oem_codes: cur.oem_codes, competitor_codes: [...cur.competitor_codes, WIX_REF] };
        report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
        await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(patch.competitor_codes)]);
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [cur.sku]);
        report.wix_34023_added = true;
      }
    }
    for (const row of rows) {
      const current = row.equipment_applications || [];
      if (current.some((x) => key(x) === key(ENTRY))) { report.skus[row.sku] = 'already'; continue; }
      const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [row.sku])).rows[0];
      const gov = row.enrichment_data?.application_governance || {};
      const authority = ev?.evidence_authority || gov.evidence_authority;
      const source = ev?.source_url || gov.evidence_url;
      if (!authority || !source) throw new Error('NO_PREVIOUS_EVIDENCE ' + row.sku);
      const list = [...current, ENTRY];
      await applyVerifiedApplications(db, { sku: row.sku, equipment_applications: list,
        evidence: { authority, source_url: source, evidence_hash: ev?.evidence_hash || gov.evidence_hash || sha({ sku: row.sku, source }), metadata: { method: 'kept-from-previous-evidence' } } });
      const payloadHash = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku: row.sku, ENTRY, JAC_PAGE }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela', model: 'JAC HFC1061', engine: 'CY4102BZLQ 4L 3.9L (as stated by the distributor)', fitment: 'distributor stated, not an official JAC sheet' } });
      }
      const s = (await db.query('SELECT jsonb_array_length(equipment_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [row.sku])).rows[0];
      if (s.n !== list.length) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + row.sku);
      report.skus[row.sku] = { before: current.length, after: s.n };
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
