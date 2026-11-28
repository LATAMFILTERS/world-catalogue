'use strict';
// Operator 2026-11-27: EF37291 (Mopar 68157291AA) and EF37867 (Mopar 68197867AB) are a Ram 6.7L diesel pickup kit, Light Duty, not made by FRAM / MANN.
// Approved exception (option A): both keep their verified ELIMFILTERS OEM product identity (base = own SKU, Mopar numbers stay as OEM references); this records the approval that
// recertify_ld_skus_list.js accepts instead of the FRAM / MANN regional policy and identity checks. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const SKUS = ['EF37291', 'EF37867'];
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT sku, duty, codigo_base, enrichment_data FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [SKUS])).rows;
    if (rows.length !== 2) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      const g = r.enrichment_data?.codigo_base_governance || {};
      if (r.duty !== 'LIGHT_DUTY' || r.codigo_base !== r.sku || g.identity_type !== 'ELIMFILTERS_OEM_PRODUCT' || g.approved_manual_exception) throw new Error('SOURCE_CHANGED ' + r.sku);
      const approval = { approval_id: 'LD_MOPAR_KIT_OPERATOR_EXCEPTION_20261127', authorized_by: 'OPERATOR', authorized_on: '2026-11-27', evidence_url: g.evidence_url,
        reason: 'Ram 6.7L Cummins diesel pickup kit, Light Duty; Mopar OEM reference, no FRAM / MANN base' };
      const u = await db.query(`UPDATE public.elimfilters_catalog SET enrichment_data=jsonb_set(enrichment_data,'{codigo_base_governance,approved_manual_exception}',$2::jsonb) WHERE sku=$1`, [r.sku, JSON.stringify(approval)]);
      if (u.rowCount !== 1) throw new Error('NO_UPDATE ' + r.sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ transaction: APPLY ? 'COMMIT' : 'ROLLBACK', skus: SKUS }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
