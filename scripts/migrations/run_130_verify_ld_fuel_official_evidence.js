'use strict';
// Applies COMPLETE_VERIFIED records from an LD-E fuel evidence manifest through the catalog gateway.
// Usage: node run_130_verify_ld_fuel_official_evidence.js <manifest.json> [--apply]
const path = require('path');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { POLICY_VERSION } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--apply');
const MANIFEST = process.argv.slice(2).find((a) => !a.startsWith('--'));
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const refCode = (x) => x?.code || x?.part_number || x?.reference;
const isBrand = (x, brand) => norm(x?.manufacturer || x?.brand).startsWith(norm(brand).slice(0, 4));

async function applyRecord(db, rec, manifestName) {
  const { sku } = rec;
  const a = rec.approved;
  const row = (await db.query('select * from public.elimfilters_catalog where sku=$1 for update', [sku])).rows[0];
  if (!row || row.duty !== 'LIGHT_DUTY' || String(row.filter_type).toLowerCase() !== 'fuel') throw new Error('SCOPE_MISMATCH');
  if (row.canonical_source_status === 'VERIFIED') throw new Error('ALREADY_VERIFIED');
  if (norm(row.codigo_base) !== norm(rec.current_codigo_base)) throw new Error('CODIGO_BASE_DRIFT');
  const owners = await db.query('select sku from public.elimfilters_catalog where upper(regexp_replace(codigo_base,$3,$4,$5))=$1 and sku<>$2',
    [norm(a.codigo_base), sku, '[^A-Za-z0-9]', '', 'g']);
  if (owners.rowCount) throw new Error('CANONICAL_COLLISION:' + owners.rows.map((r) => r.sku).join(','));
  const identity = await db.query("select elimfilters_sku from ld_catalog.ld_canonical_product_identity where status='ACTIVE' and ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($1) and elimfilters_sku<>$2", [a.codigo_base, sku]);
  if (identity.rowCount) throw new Error('IDENTITY_COLLISION');
  const traceable = [...(row.competitor_codes || []), ...(row.oem_codes || [])].some((x) => norm(refCode(x)) === norm(a.codigo_base) && isBrand(x, a.manufacturer));
  // OE-search candidates are traceable through the official MANN OE search plus OE numbers confirmed on the product page.
  const oeTraceable = a.evidence?.oe_search_sourced === true && (a.evidence.oe_matches || []).length > 0;
  if (!traceable && !oeTraceable) throw new Error('TRACEABLE_REFERENCE_MISSING');

  const mann = a.manufacturer === 'MANN-FILTER';
  const old = row.enrichment_data || {};
  const governance = {
    ...(old.codigo_base_governance || {}),
    policy_version: POLICY_VERSION,
    state: 'CANONICAL_VERIFIED',
    governance_state: 'CANONICAL_VERIFIED',
    origin_group: a.origin_group,
    approved_manufacturer: a.manufacturer,
    approved_codigo_base: a.codigo_base,
    approved_source_column: mann ? 'CANONICAL_POLICY' : 'COMPETITOR_CODES',
    current_codigo_base: a.codigo_base,
    promoted_from: row.codigo_base,
    primary_manufacturer_verified: true,
    required_authority: mann ? 'VERIFIED_MANN_FILTER' : 'VERIFIED_FRAM',
    verification_method: a.evidence.method,
    evidence_url: a.source_url,
    evidence_hash: a.evidence_hash,
    evidence_manifest: manifestName,
    evidence_note: `${a.manufacturer} ${a.codigo_base} official product page confirms fuel filter identity for ${a.origin_group} applications (${a.evidence.method}).`,
    verified_at: new Date().toISOString(),
  };
  const enrichment_data = { ...old, codigo_base_governance: governance };
  const competitor_codes = (row.competitor_codes || []).filter((x) => norm(refCode(x)) !== norm(a.codigo_base));
  const oem_codes = (row.oem_codes || []).filter((x) => norm(refCode(x)) !== norm(a.codigo_base));
  const gateway = assertGovernedCatalogPatch(row, { codigo_base: a.codigo_base, competitor_codes, oem_codes, enrichment_data });

  await db.query(`update public.elimfilters_catalog set
      codigo_base=$1::varchar, competitor_codes=$2::jsonb, oem_codes=$3::jsonb, enrichment_data=$4::jsonb,
      canonical_source_brand=$5, canonical_source_code=$1, canonical_source_url=$6,
      canonical_source_status='VERIFIED', canonical_verified_at=now(), canonical_evidence=$7::jsonb
    where sku=$8`,
  [a.codigo_base, JSON.stringify(competitor_codes), JSON.stringify(oem_codes), JSON.stringify(enrichment_data), a.manufacturer, a.source_url,
    JSON.stringify({ authority: governance.required_authority, code: a.codigo_base, source_url: a.source_url, origin_group: a.origin_group,
      evidence: a.evidence, evidence_hash: a.evidence_hash, manifest: manifestName, policy_version: POLICY_VERSION }), sku]);
  await db.query(`insert into ld_catalog.ld_canonical_product_identity
      (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at)
      values($1,$2,$3,$4,'fuel','ACTIVE',$5,now(),now())
    on conflict(elimfilters_sku) do update set origin_group=excluded.origin_group, canonical_brand=excluded.canonical_brand,
      canonical_part_number=excluded.canonical_part_number, filter_type='fuel', status='ACTIVE', evidence_source=excluded.evidence_source, updated_at=now()`,
  [sku, a.origin_group, a.manufacturer, a.codigo_base, manifestName]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1', [sku]);
  await db.query('select refresh_crossref_cache_sku($1)', [sku]);

  const audit = (await db.query('select codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1', [sku])).rows[0];
  if (audit.codigo_base !== a.codigo_base || audit.canonical_source_brand !== a.manufacturer || audit.canonical_source_status !== 'VERIFIED') throw new Error('POST_WRITE_ROW_MISMATCH');
  return { sku, from: row.codigo_base, to: a.codigo_base, brand: a.manufacturer, gateway_valid: gateway.valid };
}

(async () => {
  if (!MANIFEST) throw new Error('MANIFEST_REQUIRED');
  const manifest = require(path.resolve(MANIFEST));
  const manifestName = path.basename(MANIFEST);
  const records = manifest.records.filter((r) => r.state === 'COMPLETE_VERIFIED');
  const db = new Client({ connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL, ssl: false });
  await db.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', manifest: manifestName, candidates: records.length, applied: [], blocked: [] };
  try {
    await db.query('BEGIN');
    for (const rec of records) {
      await db.query('SAVEPOINT rec');
      try { report.applied.push(await applyRecord(db, rec, manifestName)); await db.query('RELEASE SAVEPOINT rec'); }
      catch (e) { await db.query('ROLLBACK TO SAVEPOINT rec'); report.blocked.push({ sku: rec.sku, reason: e.validation?.reasons || e.message }); }
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) { /* ignore */ }
    report.transaction = 'ROLLBACK'; report.error = e.message; process.exitCode = 1;
  } finally { await db.end(); }
  console.log(JSON.stringify(report, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
