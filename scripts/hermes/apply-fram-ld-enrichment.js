'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const REPO = path.resolve(__dirname, '../..');
const EXECUTE = process.argv.includes('--execute');
const MAP_FILE = process.env.FRAM_LD_MATCH_MAP || path.join(REPO, 'tmp_fram_ld_match_map.json');
const REPORT_DIR = path.join(REPO, 'elimfilters-vault/91-private-evidence/fram-ld-load-reports');
const ACCEPTED_RULES = new Set(['DIRECT_FRAM_UNIQUE', 'EXACT_MULTI_CROSS_UNIQUE']);
const EXPECTED_TYPE = { AIR:'air', CABIN:'cabin', FUEL:'fuel', LUBE:'oil' };
const norm = (v='') => String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
const clean = (v, max=100) => v == null ? null : String(v).trim().slice(0, max);

function unique(rows, makeKey) {
  const seen = new Set();
  return rows.filter(r => { const k=makeKey(r); if(seen.has(k)) return false; seen.add(k); return true; });
}
function unitFor(key) {
  if (/_mm$/.test(key)) return 'mm'; if (/_in$/.test(key)) return 'in';
  if (/_psi$/.test(key)) return 'psi'; return null;
}
function acceptedMatches() {
  const all = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  return all.filter(m => m.sku && ACCEPTED_RULES.has(m.rule));
}function buildPlan(matches) {
  const comp=[], oem=[], apps=[], specs=[];
  for (const m of matches) {
    const j = JSON.parse(fs.readFileSync(m.file, 'utf8'));
    const p = j.public_catalog_proposal || {};
    const source = clean(j.authority?.part_number || m.authority, 50);
    for (const code of [source, ...(p.alternatives||[])].filter(Boolean)) comp.push({sku:m.sku,source,brand:'FRAM',part:clean(code)});
    for (const r of p.competitor_cross_reference_candidates||[]) comp.push({sku:m.sku,source,brand:clean(r.manufacturer),part:clean(r.part_number)});
    for (const r of p.oem_cross_reference_candidates||[]) oem.push({sku:m.sku,source,brand:clean(r.manufacturer),part:clean(r.part_number)});
    for (const r of p.vehicle_application_candidates||[]) apps.push({sku:m.sku,source,make:clean(r.make),model:clean(r.model),year:clean(r.year,50),engine:clean(r.engine),source_origin:'FRAM_LD_MULTI_REGION'});
    for (const [k,v] of Object.entries(p.technical_specifications||{})) if(v!=null&&v!=='') specs.push({sku:m.sku,source,key:clean(k),value:clean(v,255),unit:unitFor(k)});
  }
  return {
    comp:unique(comp,r=>[r.sku,norm(r.brand),norm(r.part)].join('|')),
    oem:unique(oem,r=>[r.sku,norm(r.brand),norm(r.part)].join('|')),
    apps:unique(apps,r=>[r.sku,norm(r.make),norm(r.model),r.year||'',norm(r.engine)].join('|')),
    specs:unique(specs,r=>[r.sku,r.key].join('|'))
  };
}

async function insertBatches(client, table, columns, conflict, rows, batch=400) {
  let inserted=0;
  for(let i=0;i<rows.length;i+=batch){
    const part=rows.slice(i,i+batch), vals=[], params=[]; let n=1;
    for(const r of part){ const ps=[]; for(const c of columns){params.push(r[c]);ps.push(`$${n++}`);} vals.push(`(${ps.join(',')})`); }
    const q=`INSERT INTO ${table} (${columns.join(',')}) VALUES ${vals.join(',')} ${conflict} RETURNING 1`;
    inserted += (await client.query(q,params)).rowCount;
  }
  return inserted;
}async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL missing');
  const candidates = acceptedMatches();
  if (candidates.length !== 179) throw new Error(`Expected 179 accepted authorities, got ${candidates.length}`);
  const client = new Client({ connectionString:url, ssl:{rejectUnauthorized:false} });
  await client.connect();
  const existingComp = (await client.query('SELECT elimfilters_sku,competitor_brand,competitor_part_number FROM ld_catalog.ld_competitor_cross_references')).rows;
  const compOwner = new Map();
  for (const r of existingComp) { const k=norm(r.competitor_brand)+'|'+norm(r.competitor_part_number); if(!compOwner.has(k)) compOwner.set(k,new Set()); compOwner.get(k).add(r.elimfilters_sku); }
  const authorityConflicts=[];
  const matches=candidates.filter(m=>{ const owners=compOwner.get('FRAM|'+norm(m.authority))||new Set(); const bad=[...owners].filter(s=>s!==m.sku); if(bad.length){authorityConflicts.push({authority:m.authority,proposed_sku:m.sku,existing_skus:bad}); return false;} return true; });
  const plan = buildPlan(matches);
  const skus = [...new Set(matches.map(m => m.sku))];
  const sources = [...new Set(matches.map(m => clean(m.authority,50)))];
  const report = { mode:EXECUTE?'execute':'dry-run', candidate_authorities:candidates.length, excluded_authority_conflicts:authorityConflicts, matched_authorities:matches.length, matched_skus:skus.length, planned:{comp:plan.comp.length,oem:plan.oem.length,apps:plan.apps.length,specs:plan.specs.length}, inserted:{}, audit:{} };
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const target = await client.query(`SELECT sku,duty,filter_type FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus]);
    if (target.rowCount !== skus.length) throw new Error(`Missing target SKUs: expected ${skus.length}, found ${target.rowCount}`);
    const bad = target.rows.filter(r => r.duty !== 'LIGHT_DUTY');
    if (bad.length) throw new Error(`HD/non-LD target blocked: ${bad.map(r=>r.sku).join(',')}`);
    const bySku = new Map(target.rows.map(r=>[r.sku,r]));
    for (const m of matches) if (bySku.get(m.sku)?.filter_type !== EXPECTED_TYPE[m.family]) throw new Error(`Family mismatch ${m.authority}->${m.sku}`);
    const segmentName={AIR:'Air Filter',CABIN:'Cabin Filter',FUEL:'Fuel Filter',LUBE:'Oil Filter'};
    const parentBySku=new Map();
    for(const m of matches) if(!parentBySku.has(m.sku)) parentBySku.set(m.sku,{elimfilters_sku:m.sku,source_sku:clean(m.authority,50),segment:segmentName[m.family]});
    const parentRows=[...parentBySku.values()];
    report.inserted.parents = await insertBatches(client,'ld_catalog.ld_product_catalog',['elimfilters_sku','source_sku','segment'],'ON CONFLICT (elimfilters_sku) DO NOTHING',parentRows);
    const readinessRows=parentRows.map(r=>({elimfilters_sku:r.elimfilters_sku,source_sku:r.source_sku,segment:r.segment,has_oem:false,has_competitor:false,has_applications:false,has_specifications:false,production_tier:'FRAM_ENRICHED'}));
    report.inserted.readiness_created = await insertBatches(client,'ld_catalog.ld_production_readiness',['elimfilters_sku','source_sku','segment','has_oem','has_competitor','has_applications','has_specifications','production_tier'],'ON CONFLICT (elimfilters_sku) DO NOTHING',readinessRows);
    const rawCompRows = plan.comp.map(r=>({elimfilters_sku:r.sku,source_sku:r.source,competitor_brand:r.brand,competitor_part_number:r.part})).filter(r=>r.competitor_brand&&r.competitor_part_number);
    const proposedOwners=new Map();
    for(const r of rawCompRows){const k=norm(r.competitor_brand)+'|'+norm(r.competitor_part_number);if(!proposedOwners.has(k))proposedOwners.set(k,new Set());proposedOwners.get(k).add(r.elimfilters_sku);}
    const skippedCompConflicts=[];
    const compRows = rawCompRows.filter(r=>{ const k=norm(r.competitor_brand)+'|'+norm(r.competitor_part_number); const owners=compOwner.get(k)||new Set(); const proposed=proposedOwners.get(k)||new Set(); const bad=[...owners].filter(s=>s!==r.elimfilters_sku); if(bad.length){skippedCompConflicts.push({...r,reason:'EXISTING_OWNER',existing_skus:bad}); return false;} if(proposed.size>1 && !(owners.size===1&&owners.has(r.elimfilters_sku))){skippedCompConflicts.push({...r,reason:'PLANNED_MULTI_SKU',proposed_skus:[...proposed]}); return false;} return true; });
    report.planned.skipped_competitor_conflicts=skippedCompConflicts.length;
    const oemRows = plan.oem.map(r=>({elimfilters_sku:r.sku,source_sku:r.source,oem_brand:r.brand,oem_part_number:r.part})).filter(r=>r.oem_brand&&r.oem_part_number);
    const appRows = plan.apps.filter(r=>r.make&&r.model&&r.year).map(r=>({elimfilters_sku:r.sku,source_sku:r.source,make:r.make,model_family:r.model,model_type:r.engine||'',year:r.year,engine_code:r.engine||null,ccm:null,kw:null,hp:null,source_origin:r.source_origin}));
    const specRows = plan.specs.map(r=>({elimfilters_sku:r.sku,source_sku:r.source,spec_key:r.key,spec_value:r.value,spec_unit:r.unit})).filter(r=>r.spec_key&&r.spec_value);
    report.planned.valid_apps = appRows.length;

    report.inserted.competitor = await insertBatches(client,'ld_catalog.ld_competitor_cross_references',['elimfilters_sku','source_sku','competitor_brand','competitor_part_number'],'ON CONFLICT (elimfilters_sku,competitor_brand,competitor_part_number) DO NOTHING',compRows);
    report.inserted.oem = await insertBatches(client,'ld_catalog.ld_oem_cross_references',['elimfilters_sku','source_sku','oem_brand','oem_part_number'],'ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING',oemRows);
    report.inserted.applications = await insertBatches(client,'ld_catalog.ld_vehicle_applications',['elimfilters_sku','source_sku','make','model_family','model_type','year','engine_code','ccm','kw','hp','source_origin'],'ON CONFLICT (elimfilters_sku,make,model_family,model_type,year) DO NOTHING',appRows);
    report.inserted.specifications = await insertBatches(client,'ld_catalog.ld_product_specifications',['elimfilters_sku','source_sku','spec_key','spec_value','spec_unit'],'ON CONFLICT (elimfilters_sku,spec_key) DO NOTHING',specRows);

    const readiness = await client.query(`UPDATE ld_catalog.ld_production_readiness r SET has_oem = r.has_oem OR EXISTS (SELECT 1 FROM ld_catalog.ld_oem_cross_references o WHERE o.elimfilters_sku=r.elimfilters_sku), has_competitor = r.has_competitor OR EXISTS (SELECT 1 FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=r.elimfilters_sku), has_applications = r.has_applications OR EXISTS (SELECT 1 FROM ld_catalog.ld_vehicle_applications a WHERE a.elimfilters_sku=r.elimfilters_sku), has_specifications = r.has_specifications OR EXISTS (SELECT 1 FROM ld_catalog.ld_product_specifications s WHERE s.elimfilters_sku=r.elimfilters_sku), updated_at=now() WHERE r.elimfilters_sku=ANY($1::text[])`,[skus]);
    report.inserted.readiness_updated = readiness.rowCount;
    const contamination = await client.query(`
      SELECT count(*)::int AS n
      FROM public.elimfilters_catalog c
      WHERE c.sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY'
    `,[skus]);
    report.audit.heavy_duty_targets = contamination.rows[0].n;
    if (report.audit.heavy_duty_targets !== 0) throw new Error('HEAVY_DUTY_CONTAMINATION_DETECTED');

    const familyAudit = await client.query(`SELECT filter_type,count(*)::int AS n FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) GROUP BY filter_type ORDER BY filter_type`,[skus]);
    report.audit.target_filter_types = familyAudit.rows;
    const sourceAudit = await client.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') AS competitor_hd,
        (SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') AS oem_hd,
        (SELECT count(*)::int FROM ld_catalog.ld_product_specifications x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') AS specs_hd,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_origin='FRAM_LD_MULTI_REGION' AND x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') AS apps_hd
    `,[sources]);
    report.audit.preexisting_or_external_source_rows_on_hd = sourceAudit.rows[0];

    if (EXECUTE) await client.query('COMMIT'); else await client.query('ROLLBACK');
    report.transaction = EXECUTE ? 'COMMIT' : 'ROLLBACK';
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    report.error = e.message;
    throw Object.assign(e,{report});
  } finally {
    await client.end();
    fs.mkdirSync(REPORT_DIR,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    const out=path.join(REPORT_DIR,`fram-ld-load-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:out,...report},null,2));
  }
}

main().catch(e=>{ if(!e.report) console.error(e.stack||e.message); process.exit(1); });
