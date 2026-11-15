'use strict';

/**
 * EK50928: heavy-duty air filter kit for the JAC HFC-1131KR (Cummins C230-20 8.3 L).
 * Primary EA11056 (Donaldson P181056) + secondary EA19486 (Donaldson P539486). JAC data only.
 * Same model as EK50401. The JAC OEM 1109010G1510-1 and the HFC-1131KR fitment are client/distributor supplied
 * (authority DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED); the model/engine page is the official JAC Venezuela one.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EK50928';
const PRIMARY = 'EA11056';
const SECONDARY = 'EA19486';
const AT = '2026-11-15T00:00:00.000Z';
const JAC_PAGE = 'https://jacvenezuela.com/portfolio/bufalo-12-ton/';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

const EQUIPMENT = [{ type: 'TRUCK', engine: 'CUMMINS C230-20 8.3L', equipment: 'JAC HFC-1131KR', equipment_options: 'BUFALO (JAC VENEZUELA)' }];
const OEM = [{
  manufacturer: 'JAC', code: '1109010G1510-1', classification: 'OEM', classification_source: 'CLIENT_SUPPLIED_JAC_HFC1131KR_20261115',
  verification_status: 'CLIENT_SUPPLIED', verified_at: AT, kit_components: [PRIMARY],
}].map((x) => ({ ...x, evidence_hash: sha({ sku: SKU, code: x.code }) }));

function candidate() {
  const description = `ELIMFILTERS® ${SKU} MACROCORE™ air filter kit composed of ${PRIMARY} (primary air element) and ${SECONDARY} (secondary air element). The two elements work as a matched pair: the primary captures dust, the secondary protects the engine intake if the primary is damaged or being serviced.`;
  return {
    sku: SKU, duty: 'HEAVY_DUTY', filter_type: 'air', sub_type: 'Kit', installation_type: 'Kit', technology: 'MACROCORE™',
    filter_media: 'GENUINE FILTER MEDIA', catalog_active: true, name: `${SKU} Air Filter Kit - ${PRIMARY} + ${SECONDARY}`, description,
    codigo_base: SKU, canonical_source_brand: 'ELIMFILTERS', canonical_source_code: SKU, canonical_source_status: 'VERIFIED',
    canonical_verified_at: AT, duty_validation_status: 'LEGACY_UNVERIFIED',
    canonical_evidence: { note: `Kit ${PRIMARY} (primary) + ${SECONDARY} (secondary), JAC HFC-1131KR / Cummins C230-20 8.3 L`, source: 'operator_defined_kit_ek50928_2026-11-15', kit_row: 'maintenance_kits', components: [PRIMARY, SECONDARY], equipment_ref: 'JAC HFC-1131KR / CUMMINS C230-20 8.3L / BUFALO', application_source_url: JAC_PAGE },
    alternatives: [PRIMARY, SECONDARY],
    specs: { style: 'Filter Kit', media_type: 'GENUINE FILTER MEDIA', kit_contents: `1 primary air filter element (${PRIMARY}) + 1 secondary air filter element (${SECONDARY})`, kit_components: [PRIMARY, SECONDARY] },
    oem_codes: OEM, competitor_codes: [], equipment_applications: [], vehicle_applications: [],
    enrichment_data: {
      kit: { components: [{ qty: 1, sku: PRIMARY, role: 'PRIMARY' }, { qty: 1, sku: SECONDARY, role: 'SECONDARY' }] },
      source: 'operator_defined_kit_ek50928_2026-11-15',
      sourcing_note: { date: '2026-11-15', reason: `KIT_OF_${PRIMARY}_${SECONDARY}`, visibility: 'INTERNAL', approved_by: 'Victor Abreu (CEO)' },
      operator_supplied: true,
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', verified_at: AT, identity_type: 'ELIMFILTERS_OEM_PRODUCT', policy_version: '2026-11-10-v4.3',
        governance_state: 'CANONICAL_VERIFIED', required_authority: 'VERIFIED_ELIMFILTERS_OEM_PRODUCT', current_codigo_base: SKU,
        verification_method: 'ELIMFILTERS_OPERATOR_PRODUCT_DEFINITION', approved_codigo_base: SKU, approved_manufacturer: 'ELIMFILTERS',
        approved_source_column: 'INTERNAL_PRODUCT_IDENTITY', primary_manufacturer_verified: true, internal_product_identity_verified: true,
      },
    },
  };
}

const COLS = ['sku', 'duty', 'filter_type', 'sub_type', 'installation_type', 'technology', 'filter_media', 'catalog_active', 'name', 'description',
  'codigo_base', 'canonical_source_brand', 'canonical_source_code', 'canonical_source_status', 'canonical_verified_at', 'duty_validation_status',
  'canonical_evidence', 'alternatives', 'specs', 'oem_codes', 'competitor_codes', 'vehicle_applications', 'enrichment_data'];
const JSONB = new Set(['canonical_evidence', 'alternatives', 'specs', 'oem_codes', 'competitor_codes', 'vehicle_applications', 'enrichment_data']);

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    if ((await db.query('SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rowCount) throw new Error('SKU_ALREADY_EXISTS');
    const comps = (await db.query(`SELECT c.sku, c.catalog_active, s.certification_state FROM public.elimfilters_catalog c LEFT JOIN public.catalog_sku_certification s ON s.sku=c.sku WHERE c.sku = ANY($1::text[])`, [[PRIMARY, SECONDARY]])).rows;
    if (comps.length !== 2 || comps.some((x) => !x.catalog_active || x.certification_state !== 'CERTIFIED')) throw new Error('COMPONENTS_NOT_CERTIFIED ' + JSON.stringify(comps));
    const clash = (await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE regexp_replace(upper(coalesce(x->>'code','')),'[^A-Z0-9]','','g')=$1)`, [norm('1109010G1510-1')])).rows;
    if (clash.length) throw new Error('REFERENCE_COLLISION ' + clash.map((x) => x.sku).join(','));
    const row = candidate();
    report.gateway = assertGovernedCatalogPatch({}, row, { validateApplications: false }).valid;
    await db.query(`INSERT INTO public.elimfilters_catalog (${COLS.join(',')}) VALUES (${COLS.map((c, i) => `$${i + 1}${JSONB.has(c) ? '::jsonb' : ''}`).join(',')})`,
      COLS.map((c) => (JSONB.has(c) ? JSON.stringify(row[c]) : row[c])));
    report.application = await applyVerifiedApplications(db, {
      sku: SKU, equipment_applications: EQUIPMENT,
      evidence: {
        authority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', source_url: JAC_PAGE, evidence_hash: sha({ sku: SKU, equipment: EQUIPMENT, source: JAC_PAGE }),
        metadata: { method: 'operator-pasted-distributor-page', reference_code: '1109010G1510-1', equipment_count: 1, distributor: 'Distribuidora Sircars (Web WCA-3038 listing, URL not provided)', vehicle_engine_source: 'JAC Venezuela official Bufalo page lists Cummins C230-20 8.3 L', fitment: 'distributor/client supplied, not official' },
      },
    });
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (!s || s.sub_type !== 'Kit' || s.equipment_applications.length !== 1 || !s.oem_codes.some((x) => norm(x.code) === norm('1109010G1510-1'))) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), note: 'row did not exist before; created by run_328', components: comps, row_sha256: sha(s) }, null, 2));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });

module.exports = { candidate };
