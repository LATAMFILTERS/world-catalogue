'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const REPO = path.resolve(__dirname, '../..');
const REPORT_DIR = path.join(REPO, 'elimfilters-vault/91-private-evidence/ld5-to-ld3-reports');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const dstFor = s => ({ EA5:'EA3', EC5:'EC3', EF5:'EF3', EL5:'EL3' }[s.slice(0,3)] + s.slice(3));
const add = (m,k,v) => { if(!m.has(k)) m.set(k,new Set()); m.get(k).add(v); };
const legacyRe = /^(EA5|EC5|EF5|EL5)/;

function appKey(a) {
  return [norm(a.make), norm(a.model_family || a.model), norm(a.model_type || a.engine), String(a.year || a.year_range || '').trim()].join('|');
}

async function buildPlan(client) {
  const legacy = (await client.query(`SELECT elimfilters_sku,source_sku,segment FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows;
  if (!legacy.length) return { alreadyApplied:true, safe:[], quarantine:[] };
  if (legacy.length !== 4637) throw new Error(`LD5_BASELINE_CHANGED: expected 4637 parents, got ${legacy.length}`);
  for (const r of legacy) {
    const digits = String(r.source_sku || '').replace(/[^0-9]/g,'');
    const expected = dstFor(r.elimfilters_sku);
    const canonical = expected.slice(0,3) + digits.slice(-4).padStart(4,'0');
    if (!digits || canonical !== expected) throw new Error(`LD5_NUMBERING_MISMATCH ${r.elimfilters_sku} ${r.source_sku} -> ${canonical}`);
  }
  const srcSet = new Set(legacy.map(x => x.elimfilters_sku));
  const dstSet = new Set(legacy.map(x => dstFor(x.elimfilters_sku)));
  const allSkus = [...srcSet, ...dstSet];
  const parents = (await client.query(`SELECT elimfilters_sku,source_sku,segment FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])`, [allSkus])).rows;
  const publicRows = (await client.query(`SELECT sku,codigo_base,canonical_source_code,canonical_source_status,enrichment_data,competitor_codes,oem_codes,vehicle_applications FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`, [[...dstSet]])).rows;
  const refs = (await client.query(`SELECT elimfilters_sku,competitor_brand brand,competitor_part_number part FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=ANY($1::text[]) UNION ALL SELECT elimfilters_sku,oem_brand,oem_part_number FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=ANY($1::text[])`, [allSkus])).rows;
  const parentBy = new Map(parents.map(x => [x.elimfilters_sku,x]));
  const pubBy = new Map(publicRows.map(x => [x.sku,x]));
  const codes = new Map();
  for (const r of refs) add(codes, r.elimfilters_sku, norm(r.part));
  for (const p of publicRows) {
    for (const x of [...(p.competitor_codes || []), ...(p.oem_codes || [])]) add(codes, p.sku, norm(x.code || x.reference));
    add(codes, p.sku, norm(p.codigo_base));
    add(codes, p.sku, norm(p.canonical_source_code));
  }

  const preliminary = [];
  for (const s of legacy) {
    const dst = dstFor(s.elimfilters_sku), target = parentBy.get(dst), pub = pubBy.get(dst);
    const srcBase = norm(s.source_sku), targetBase = norm(target?.source_sku || pub?.canonical_source_code || pub?.codigo_base);
    const dstCodes = codes.get(dst) || new Set(), srcCodes = codes.get(s.elimfilters_sku) || new Set();
    let status = null;
    if (!target && !pub) status = 'SAFE_EMPTY_TARGET';
    else if (srcBase && dstCodes.has(srcBase)) status = 'SAFE_TARGET_CROSSES_SOURCE';
    else if (targetBase && srcCodes.has(targetBase)) status = 'SAFE_SOURCE_CROSSES_TARGET';
    else if (srcBase && targetBase && srcBase === targetBase) status = 'SAFE_SAME_BASE';
    else {
      const body = dst.slice(3), baseNorm = norm(pub?.codigo_base), canonNorm = norm(pub?.canonical_source_code);
      const gov = pub?.enrichment_data?.codigo_base_governance || {};
      const verified = !!gov.primary_manufacturer_verified || String(pub?.canonical_source_status || '').toUpperCase() === 'VERIFIED';
      const placeholder = !!pub && !target && !verified && (!canonNorm || canonNorm === body) && baseNorm === body;
      status = placeholder ? 'SAFE_PUBLIC_PLACEHOLDER' : 'OCCUPIED_UNPROVEN';
    }
    preliminary.push({src:s.elimfilters_sku,dst,source_sku:s.source_sku,segment:s.segment,status});
  }

  const unresolved = preliminary.filter(x => x.status === 'OCCUPIED_UNPROVEN');
  const unresolvedSkus = [...new Set(unresolved.flatMap(x => [x.src,x.dst]))];
  const appRows = (await client.query(`SELECT elimfilters_sku,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])`, [unresolvedSkus])).rows;
  const appsBy = new Map();
  for (const r of appRows) { if(!appsBy.has(r.elimfilters_sku)) appsBy.set(r.elimfilters_sku,new Set()); appsBy.get(r.elimfilters_sku).add(appKey(r)); }
  for (const p of publicRows) {
    if (!unresolved.some(x => x.dst === p.sku)) continue;
    if (!appsBy.has(p.sku)) appsBy.set(p.sku,new Set());
    for (const a of p.vehicle_applications || []) appsBy.get(p.sku).add(appKey(a));
  }
  for (const x of unresolved) {
    const a = appsBy.get(x.src) || new Set(), b = appsBy.get(x.dst) || new Set();
    let inter = 0; for (const k of a) if (b.has(k)) inter++;
    const ratio = a.size ? inter / a.size : 0;
    if (inter >= 2 && (ratio >= 0.5 || inter >= 20)) x.status = 'SAFE_APPLICATION_MATCH';
    x.application_evidence = {source_count:a.size,target_count:b.size,intersection:inter,source_ratio:ratio};
  }

  const safeStatuses = new Set(['SAFE_EMPTY_TARGET','SAFE_TARGET_CROSSES_SOURCE','SAFE_SOURCE_CROSSES_TARGET','SAFE_SAME_BASE','SAFE_PUBLIC_PLACEHOLDER','SAFE_APPLICATION_MATCH']);
  const safe = preliminary.filter(x => safeStatuses.has(x.status));
  const quarantine = preliminary.filter(x => !safeStatuses.has(x.status));
  if (safe.length !== 4632 || quarantine.length !== 5) {
    const byStatus = preliminary.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
    throw new Error(`LD5_PLAN_CHANGED: safe=${safe.length} quarantine=${quarantine.length} by_status=${JSON.stringify(byStatus)} unresolved=${JSON.stringify(quarantine.map(x=>({src:x.src,dst:x.dst,source_sku:x.source_sku,evidence:x.application_evidence})))}`);
  }
  return {alreadyApplied:false,safe,quarantine};
}

async function logicalCount(client, table, keyCols) {
  const mapped = `CASE WHEN m.src IS NOT NULL THEN m.dst ELSE x.elimfilters_sku END`;
  const cols = keyCols.map(c => `x.${c}`).join(',');
  const q = `SELECT count(*)::int n FROM (SELECT DISTINCT ${mapped} mapped_sku${cols ? ','+cols : ''} FROM ${table} x LEFT JOIN tmp_ld5_map m ON m.src=x.elimfilters_sku WHERE m.src IS NOT NULL OR x.elimfilters_sku IN (SELECT dst FROM tmp_ld5_map)) z`;
  return (await client.query(q)).rows[0].n;
}

async function targetCount(client, table, keyCols=[]) {
  const cols = keyCols.map(c => `x.${c}`).join(',');
  const q = keyCols.length
    ? `SELECT count(*)::int n FROM (SELECT DISTINCT x.elimfilters_sku,${cols} FROM ${table} x WHERE x.elimfilters_sku IN (SELECT dst FROM tmp_ld5_map)) z`
    : `SELECT count(*)::int n FROM ${table} x WHERE x.elimfilters_sku IN (SELECT dst FROM tmp_ld5_map)`;
  return (await client.query(q)).rows[0].n;
}
async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL missing');
  const client = new Client({ connectionString:url, ssl:{rejectUnauthorized:false} });
  await client.connect();
  const report = {migration:'100_LD_LEGACY_PREFIX_5_TO_3',mode:EXECUTE?'execute':'dry-run',plan:{},before:{},mutations:{},audit:{}};
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await client.query(`SET LOCAL lock_timeout='30s'`);
    await client.query(`SET LOCAL statement_timeout='20min'`);
    const plan = await buildPlan(client);
    if (plan.alreadyApplied) {
      const remain = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
      report.audit.already_applied = true; report.audit.legacy_parents = remain;
      if (remain) throw new Error('ALREADY_APPLIED_STATE_INVALID');
      if (EXECUTE) await client.query('COMMIT'); else await client.query('ROLLBACK');
      report.transaction = EXECUTE ? 'COMMIT' : 'ROLLBACK'; return;
    }
    report.plan.safe = plan.safe.length; report.plan.quarantine = plan.quarantine.length;
    report.plan.by_status = [...plan.safe,...plan.quarantine].reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
    await client.query(`CREATE TEMP TABLE tmp_ld5_map(src text PRIMARY KEY,dst text UNIQUE NOT NULL,status text NOT NULL) ON COMMIT DROP`);
    await client.query(`INSERT INTO tmp_ld5_map SELECT * FROM unnest($1::text[],$2::text[],$3::text[])`,[plan.safe.map(x=>x.src),plan.safe.map(x=>x.dst),plan.safe.map(x=>x.status)]);
    await client.query(`CREATE TEMP TABLE tmp_ld5_quarantine(src text PRIMARY KEY,dst text NOT NULL,reason text NOT NULL) ON COMMIT DROP`);
    await client.query(`INSERT INTO tmp_ld5_quarantine SELECT * FROM unnest($1::text[],$2::text[],$3::text[])`,[plan.quarantine.map(x=>x.src),plan.quarantine.map(x=>x.dst),plan.quarantine.map(x=>x.status)]);
    report.before.competitor = await logicalCount(client,'ld_catalog.ld_competitor_cross_references',['competitor_brand','competitor_part_number']);
    report.before.oem = await logicalCount(client,'ld_catalog.ld_oem_cross_references',['oem_brand','oem_part_number']);
    report.before.applications = await logicalCount(client,'ld_catalog.ld_vehicle_applications',['make','model_family','model_type','year']);
    report.before.specifications = await logicalCount(client,'ld_catalog.ld_product_specifications',['spec_key']);
    report.before.safe_parents = (await client.query(`SELECT count(DISTINCT coalesce(m.dst,p.elimfilters_sku))::int n FROM ld_catalog.ld_product_catalog p LEFT JOIN tmp_ld5_map m ON m.src=p.elimfilters_sku WHERE m.src IS NOT NULL OR p.elimfilters_sku IN (SELECT dst FROM tmp_ld5_map)`)).rows[0].n;
    report.before.legacy_identity_rows = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
    if (report.before.legacy_identity_rows !== 0) throw new Error('LD5_CANONICAL_IDENTITY_UNEXPECTED');

    await client.query(`CREATE TABLE IF NOT EXISTS ld_catalog.ld_legacy_prefix_collision_quarantine (
      legacy_elimfilters_sku text PRIMARY KEY,
      proposed_canonical_sku text NOT NULL,
      source_sku text,
      segment text,
      reason text NOT NULL,
      product_row jsonb,
      readiness_row jsonb,
      backfill_row jsonb,
      competitor_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
      oem_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
      application_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
      specification_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
      quarantined_at timestamptz NOT NULL DEFAULT now()
    )`);
    const quarantined = await client.query(`INSERT INTO ld_catalog.ld_legacy_prefix_collision_quarantine
      (legacy_elimfilters_sku,proposed_canonical_sku,source_sku,segment,reason,product_row,readiness_row,backfill_row,competitor_rows,oem_rows,application_rows,specification_rows)
      SELECT q.src,q.dst,p.source_sku,p.segment,q.reason,to_jsonb(p),
        (SELECT to_jsonb(r) FROM ld_catalog.ld_production_readiness r WHERE r.elimfilters_sku=q.src),
        (SELECT to_jsonb(b) FROM ld_catalog.ld_canonical_backfill_candidates b WHERE b.elimfilters_sku=q.src),
        coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.id) FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=q.src),'[]'::jsonb),
        coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.id) FROM ld_catalog.ld_oem_cross_references x WHERE x.elimfilters_sku=q.src),'[]'::jsonb),
        coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.id) FROM ld_catalog.ld_vehicle_applications x WHERE x.elimfilters_sku=q.src),'[]'::jsonb),
        coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.id) FROM ld_catalog.ld_product_specifications x WHERE x.elimfilters_sku=q.src),'[]'::jsonb)
      FROM tmp_ld5_quarantine q JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=q.src
      ON CONFLICT (legacy_elimfilters_sku) DO UPDATE SET proposed_canonical_sku=excluded.proposed_canonical_sku,reason=excluded.reason,product_row=excluded.product_row,readiness_row=excluded.readiness_row,backfill_row=excluded.backfill_row,competitor_rows=excluded.competitor_rows,oem_rows=excluded.oem_rows,application_rows=excluded.application_rows,specification_rows=excluded.specification_rows,quarantined_at=now()`);
    report.mutations.quarantine_snapshots = quarantined.rowCount;

    const orphan = await client.query(`SELECT b.* FROM ld_catalog.ld_canonical_backfill_candidates b LEFT JOIN ld_catalog.ld_product_catalog p USING(elimfilters_sku) WHERE b.elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)' AND p.elimfilters_sku IS NULL`);
    if (orphan.rowCount !== 1 || orphan.rows[0].elimfilters_sku !== 'EL50683') throw new Error(`LD5_ORPHAN_BASELINE_CHANGED ${orphan.rowCount}`);
    const mergeTargets = (await client.query(`SELECT m.src,m.dst FROM tmp_ld5_map m JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=m.dst`)).rows;
    const mergeSrc = mergeTargets.map(x=>x.src);
    report.plan.direct_renames = plan.safe.length - mergeSrc.length;
    report.plan.merge_targets = mergeSrc.length;

    await client.query(`CREATE TABLE IF NOT EXISTS ld_catalog.ld_legacy_cross_reference_quarantine (
      source_row_id bigint PRIMARY KEY, legacy_elimfilters_sku text NOT NULL, proposed_canonical_sku text NOT NULL,
      original_row jsonb NOT NULL, reason text NOT NULL, conflicting_skus text[] NOT NULL DEFAULT '{}', quarantined_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TEMP TABLE tmp_ld5_competitor_source ON COMMIT DROP AS
      SELECT x.*,m.dst,
        upper(regexp_replace(coalesce(x.competitor_brand,''),'[^A-Z0-9]','','g')) norm_brand,
        ld_catalog.norm_part(x.competitor_part_number) norm_part
      FROM ld_catalog.ld_competitor_cross_references x JOIN tmp_ld5_map m ON m.src=x.elimfilters_sku`);
    report.before.competitor_source_rows = (await client.query(`SELECT count(*)::int n FROM tmp_ld5_competitor_source`)).rows[0].n;
    await client.query(`DELETE FROM ld_catalog.ld_competitor_cross_references x USING tmp_ld5_map m WHERE x.elimfilters_sku=m.src`);

    const direct = await client.query(`UPDATE ld_catalog.ld_product_catalog p SET elimfilters_sku=m.dst,updated_at=now()
      FROM tmp_ld5_map m
      WHERE p.elimfilters_sku=m.src AND NOT EXISTS (SELECT 1 FROM ld_catalog.ld_product_catalog d WHERE d.elimfilters_sku=m.dst)`);
    report.mutations.direct_parents_renamed = direct.rowCount;

    await client.query(`CREATE TEMP TABLE tmp_ld5_competitor_owners ON COMMIT DROP AS
      SELECT norm_brand,norm_part,sku FROM (
        SELECT norm_brand,norm_part,dst sku FROM tmp_ld5_competitor_source
        UNION
        SELECT upper(regexp_replace(coalesce(x.competitor_brand,''),'[^A-Z0-9]','','g')),
               ld_catalog.norm_part(x.competitor_part_number),x.elimfilters_sku
        FROM ld_catalog.ld_competitor_cross_references x
      ) u`);
    await client.query(`CREATE INDEX ON tmp_ld5_competitor_owners(norm_brand,norm_part)`);
    await client.query(`CREATE TEMP TABLE tmp_ld5_ambiguous_keys ON COMMIT DROP AS
      SELECT norm_brand,norm_part,array_agg(DISTINCT sku ORDER BY sku) owners
      FROM tmp_ld5_competitor_owners GROUP BY norm_brand,norm_part HAVING count(DISTINCT sku)>1`);
    const crossQ = await client.query(`INSERT INTO ld_catalog.ld_legacy_cross_reference_quarantine
      (source_row_id,legacy_elimfilters_sku,proposed_canonical_sku,original_row,reason,conflicting_skus)
      SELECT s.id,s.elimfilters_sku,s.dst,to_jsonb(s)-'dst'-'norm_brand'-'norm_part','AMBIGUOUS_CANONICAL_REFERENCE',k.owners
      FROM tmp_ld5_competitor_source s JOIN tmp_ld5_ambiguous_keys k USING(norm_brand,norm_part)
      ON CONFLICT (source_row_id) DO UPDATE SET proposed_canonical_sku=excluded.proposed_canonical_sku,original_row=excluded.original_row,reason=excluded.reason,conflicting_skus=excluded.conflicting_skus,quarantined_at=now()`);
    report.mutations.competitor_quarantined = crossQ.rowCount;

    const compSafe = await client.query(`INSERT INTO ld_catalog.ld_competitor_cross_references
      (elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
      SELECT s.dst,s.source_sku,s.competitor_brand,s.competitor_part_number,s.created_at
      FROM (SELECT DISTINCT ON (dst,norm_brand,norm_part) * FROM tmp_ld5_competitor_source ORDER BY dst,norm_brand,norm_part,id) s
      LEFT JOIN tmp_ld5_ambiguous_keys k USING(norm_brand,norm_part)
      WHERE k.norm_brand IS NULL
      ON CONFLICT (elimfilters_sku,competitor_brand,competitor_part_number) DO NOTHING`);
    report.mutations.competitor_reinserted = compSafe.rowCount;

    const oem = await client.query(`INSERT INTO ld_catalog.ld_oem_cross_references
      (elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at)
      SELECT m.dst,x.source_sku,x.oem_brand,x.oem_part_number,x.created_at
      FROM ld_catalog.ld_oem_cross_references x JOIN tmp_ld5_map m ON m.src=x.elimfilters_sku
      WHERE m.src=ANY($1::text[])
      ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING`,[mergeSrc]);
    report.mutations.oem_merged = oem.rowCount;
    const specs = await client.query(`INSERT INTO ld_catalog.ld_product_specifications
      (elimfilters_sku,source_sku,spec_key,spec_value,spec_unit,created_at)
      SELECT m.dst,x.source_sku,x.spec_key,x.spec_value,x.spec_unit,x.created_at
      FROM ld_catalog.ld_product_specifications x JOIN tmp_ld5_map m ON m.src=x.elimfilters_sku
      WHERE m.src=ANY($1::text[])
      ON CONFLICT (elimfilters_sku,spec_key) DO NOTHING`,[mergeSrc]);
    report.mutations.specifications_merged = specs.rowCount;

    const apps = await client.query(`INSERT INTO ld_catalog.ld_vehicle_applications
      (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin,created_at)
      SELECT m.dst,x.source_sku,x.make,x.model_family,x.model_type,x.year,x.engine_code,x.ccm,x.kw,x.hp,x.source_origin,x.created_at
      FROM ld_catalog.ld_vehicle_applications x JOIN tmp_ld5_map m ON m.src=x.elimfilters_sku
      WHERE m.src=ANY($1::text[])
      ON CONFLICT DO NOTHING`,[mergeSrc]);
    report.mutations.applications_merged = apps.rowCount;

    const ready = await client.query(`UPDATE ld_catalog.ld_production_readiness d SET
      has_oem=coalesce(d.has_oem,false) OR coalesce(s.has_oem,false),
      has_competitor=coalesce(d.has_competitor,false) OR coalesce(s.has_competitor,false),
      has_applications=coalesce(d.has_applications,false) OR coalesce(s.has_applications,false),
      has_specifications=coalesce(d.has_specifications,false) OR coalesce(s.has_specifications,false),
      production_tier=coalesce(d.production_tier,s.production_tier),updated_at=now()
      FROM ld_catalog.ld_production_readiness s JOIN tmp_ld5_map m ON m.src=s.elimfilters_sku
      WHERE d.elimfilters_sku=m.dst AND m.src=ANY($1::text[])`,[mergeSrc]);
    report.mutations.readiness_merged = ready.rowCount;
    await client.query(`DELETE FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_product_specifications WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_production_readiness WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_canonical_backfill_candidates WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    const mergedParents = await client.query(`DELETE FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])`,[mergeSrc]);
    report.mutations.merged_parents_removed = mergedParents.rowCount;

    const bf = await client.query(`UPDATE ld_catalog.ld_canonical_backfill_candidates b SET elimfilters_sku=m.dst,updated_at=now()
      FROM tmp_ld5_map m WHERE b.elimfilters_sku=m.src
      AND NOT EXISTS (SELECT 1 FROM ld_catalog.ld_canonical_backfill_candidates d WHERE d.elimfilters_sku=m.dst)`);
    report.mutations.backfill_renamed = bf.rowCount;
    await client.query(`DELETE FROM ld_catalog.ld_canonical_backfill_candidates b USING tmp_ld5_map m WHERE b.elimfilters_sku=m.src`);
    const qSrc = plan.quarantine.map(x=>x.src);
    report.mutations.quarantine_competitor_removed = (await client.query(`DELETE FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=ANY($1::text[])`,[qSrc])).rowCount;
    report.mutations.quarantine_oem_removed = (await client.query(`DELETE FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=ANY($1::text[])`,[qSrc])).rowCount;
    report.mutations.quarantine_applications_removed = (await client.query(`DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])`,[qSrc])).rowCount;
    report.mutations.quarantine_specifications_removed = (await client.query(`DELETE FROM ld_catalog.ld_product_specifications WHERE elimfilters_sku=ANY($1::text[])`,[qSrc])).rowCount;
    await client.query(`DELETE FROM ld_catalog.ld_production_readiness WHERE elimfilters_sku=ANY($1::text[])`,[qSrc]);
    await client.query(`DELETE FROM ld_catalog.ld_canonical_backfill_candidates WHERE elimfilters_sku=ANY($1::text[])`,[qSrc]);
    report.mutations.quarantine_parents_removed = (await client.query(`DELETE FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])`,[qSrc])).rowCount;

    report.mutations.orphan_backfill_removed = (await client.query(`DELETE FROM ld_catalog.ld_canonical_backfill_candidates WHERE elimfilters_sku='EL50683'`)).rowCount;

    report.audit.competitor = await targetCount(client,'ld_catalog.ld_competitor_cross_references',['competitor_brand','competitor_part_number']);
    report.audit.oem = await targetCount(client,'ld_catalog.ld_oem_cross_references',['oem_brand','oem_part_number']);
    report.audit.applications = await targetCount(client,'ld_catalog.ld_vehicle_applications',['make','model_family','model_type','year']);
    report.audit.specifications = await targetCount(client,'ld_catalog.ld_product_specifications',['spec_key']);
    report.audit.safe_parents = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku IN (SELECT dst FROM tmp_ld5_map)`)).rows[0].n;
    report.audit.legacy_parents = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
    report.audit.legacy_backfill = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_canonical_backfill_candidates WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
    for (const table of ['ld_competitor_cross_references','ld_oem_cross_references','ld_vehicle_applications','ld_product_specifications','ld_production_readiness']) {
      report.audit[`legacy_${table}`] = (await client.query(`SELECT count(*)::int n FROM ld_catalog.${table} WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
    }
    report.audit.quarantine_rows = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_legacy_prefix_collision_quarantine WHERE legacy_elimfilters_sku=ANY($1::text[])`,[qSrc])).rows[0].n;
    report.audit.public_legacy = (await client.query(`SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows[0].n;
    report.audit.competitor_quarantine_evidence_rows = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_legacy_cross_reference_quarantine q WHERE EXISTS (SELECT 1 FROM tmp_ld5_competitor_source s WHERE s.id=q.source_row_id)`)).rows[0].n;
    report.audit.competitor_unaccounted = (await client.query(`SELECT count(*)::int n FROM tmp_ld5_competitor_source s
      WHERE NOT EXISTS (SELECT 1 FROM ld_catalog.ld_legacy_cross_reference_quarantine q WHERE q.source_row_id=s.id)
        AND NOT EXISTS (SELECT 1 FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=s.dst AND upper(regexp_replace(coalesce(x.competitor_brand,''),'[^A-Z0-9]','','g'))=s.norm_brand AND ld_catalog.norm_part(x.competitor_part_number)=s.norm_part)`)).rows[0].n;

    const expected = ['oem','applications','specifications'];
    for (const k of expected) {
      if (report.audit[k] !== report.before[k]) throw new Error(`LD5_LOGICAL_LOSS_${k}: before=${report.before[k]} after=${report.audit[k]}`);
    }
    if (report.audit.competitor_unaccounted !== 0) throw new Error(`LD5_COMPETITOR_EVIDENCE_LOSS ${report.audit.competitor_unaccounted}`);
    if (report.audit.safe_parents !== report.before.safe_parents) throw new Error(`LD5_PARENT_LOSS: before=${report.before.safe_parents} after=${report.audit.safe_parents}`);
    if (report.audit.quarantine_rows !== 5) throw new Error(`LD5_QUARANTINE_COUNT ${report.audit.quarantine_rows}`);
    const activeLegacy = Object.entries(report.audit).filter(([k])=>k.startsWith('legacy_')).reduce((n,[,v])=>n+(Number(v)||0),0);
    if (activeLegacy !== 0 || report.audit.public_legacy !== 0) throw new Error(`LD5_ACTIVE_REMAINS ${activeLegacy}`);

    if (EXECUTE) await client.query('COMMIT'); else await client.query('ROLLBACK');
    report.transaction = EXECUTE ? 'COMMIT' : 'ROLLBACK';
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    report.transaction = 'ROLLBACK';
    report.error = err.message;
    throw err;
  } finally {
    fs.mkdirSync(REPORT_DIR,{recursive:true});
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const file = path.join(REPORT_DIR,`ld5-to-ld3-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(file,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:file,...report},null,2));
    await client.end();
  }
}

main().catch(err => { console.error(err.stack || err.message); process.exitCode=1; });
