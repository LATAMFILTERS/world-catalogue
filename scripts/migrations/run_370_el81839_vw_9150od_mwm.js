'use strict';

/**
 * EL81839 (Donaldson P061839) has no equipment (the Donaldson sheet lists none). By operator instruction 2026-11-16 it receives the
 * Volkswagen bus 9.150 OD with engine MWM 4.10 TCA turbo (the model of the Venezuela catalogue card "Volkswagen 9-150 OD") using the
 * MANN W 962 official page as the source (it lists VW BUS Serie 9, 9.150 OD, 4.3 L 8V SOHV L4, MWM 4.10 TCA, 107 kW / 145 HP, 01/2001-12/2004).
 * MANN lists W 962 at 210 mm and P061839 is 200 mm: the fitment is applied on the operator's decision, not on a dimensional match.
 * The rest of the MANN W 962 application list is NOT loaded here. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL81839';
const MANN_URL = 'https://www.mann-filter.com/br-pt/catalogo/resultados-da-pesquisa/produto.html/w962_mann-filter.html';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ENTRY = { type: 'BUS', engine: 'MWM 4.10 TCA TURBO', equipment: 'VOLKSWAGEN 9.150 OD', equipment_options: '4.3 L 8V SOHV L4; 107 kW; 01/2001-12/2004' };

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT sku, equipment_applications FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const list = [...(cur.equipment_applications || []), ENTRY];
    report.application = await applyVerifiedApplications(db, { sku: SKU, equipment_applications: list,
      evidence: { authority: 'MANN_FILTER_OFFICIAL_PRODUCT_PAGE', source_url: MANN_URL, evidence_hash: sha({ sku: SKU, ENTRY, MANN_URL }),
        metadata: { method: 'operator-instruction-from-mann-w962-page', reference_code: 'W 962', model: 'VW BUS 9.150 OD', engine: 'MWM 4.10 TCA', fitment: 'applied to P061839 by operator decision; MANN lists W 962 at 210 mm, P061839 is 200 mm' } } });
    report.after = (await db.query('SELECT jsonb_array_length(equipment_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0].n;
    if (report.after !== list.length) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
