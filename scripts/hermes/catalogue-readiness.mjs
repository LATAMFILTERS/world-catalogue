#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js';
import { assessSku, buildBacklog, buildOrganizationIndex, stableId } from './catalogue-readiness-core.mjs';

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sync = process.argv.includes('--sync');
const targetSkus = new Set(String(process.env.HERMES_CATALOGUE_TARGET_SKUS || '').split(',').map(v=>v.trim().toUpperCase()).filter(Boolean));
const targeted = targetSkus.size > 0;
const expectedTargetCountRaw = String(process.env.HERMES_CATALOGUE_EXPECTED_TARGET_COUNT || '').trim();
const expectedTargetCount = expectedTargetCountRaw ? Number(expectedTargetCountRaw) : null;
if (expectedTargetCount !== null && (!Number.isInteger(expectedTargetCount) || expectedTargetCount < 1)) throw new Error('HERMES_CATALOGUE_EXPECTED_TARGET_COUNT must be a positive integer');
const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL/CATALOG_DATABASE_URL is required');
if (sync && String(process.env.HERMES_CATALOGUE_QUALITY_SYNC || '').toLowerCase() !== 'true') {
  throw new Error('HERMES_CATALOGUE_QUALITY_SYNC=true is required for --sync metadata writes');
}
const sha = v => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const batches = (a,n=500) => Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));
const db = new Client({ connectionString:url });
await db.connect();

try {
  const catalogAll = (await db.query("SELECT sku,codigo_base,duty,technology,filter_type,canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,canonical_evidence,vehicle_applications,equipment_applications,oem_codes,competitor_codes,brand_crossrefs,height_mm,product_length_mm,outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,product_dimensions_source,product_dimensions_validation_status,image_url,enrichment_data,units_per_case,unit_packaged_weight_kg,unit_packaged_volume_m3,master_carton_length_cm,packaging_type,packaging_source,packaging_source_url,packaging_validation_status,packaging_validated_at FROM elimfilters_catalog WHERE catalog_active=true ORDER BY sku")).rows;
  const catalog = targeted ? catalogAll.filter(row=>targetSkus.has(String(row.sku||'').toUpperCase())) : catalogAll;
  if (targeted && expectedTargetCount !== null && catalog.length !== expectedTargetCount) throw new Error(`HERMES_TARGET_COUNT_MISMATCH:${catalog.length}!=${expectedTargetCount}`);
  if (targeted && catalog.length !== targetSkus.size) {
    const found = new Set(catalog.map(row=>String(row.sku||'').toUpperCase()));
    const missing = [...targetSkus].filter(sku=>!found.has(sku));
    throw new Error(`HERMES_TARGET_SKUS_NOT_ACTIVE_OR_MISSING:${missing.join(',')}`);
  }
  const appRows = (await db.query("SELECT id,sku,application_kind,payload_hash,evidence_authority,source_url,evidence_hash,verified_at,metadata,created_at FROM catalog_application_evidence WHERE verified=true")).rows;
  const refRows = (await db.query("SELECT id,reference_type,brand,part_number,sku,source,created_at FROM exact_part_reference")).rows;
  const manufacturerIdentityRows = (await db.query("SELECT evidence_id,sku,authority,source_url,source_hash,verification_status,payload,provenance,captured_at FROM hermes_catalogue_evidence WHERE field_group='MANUFACTURER_IDENTITY' ORDER BY updated_at DESC,evidence_id")).rows;
  const manufacturerPriorityRows = (await db.query("SELECT sku,status,governance_state,required_authority,last_error FROM catalog_codigo_base_sanitation_queue WHERE status='PENDING' AND governance_state='PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY' AND required_authority='EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE' AND last_error='EXPLICIT_PRIMARY_ABSENCE_AUTHORITY_REQUIRED'")).rows;
  const sourceCandidateRows = (await db.query("SELECT elimfilters_sku,origin_group,canonical_brand,canonical_part_number,candidate_state,updated_at FROM ld_catalog.ld_canonical_backfill_candidates WHERE candidate_state IN ('READY_SOURCE_MANN','READY_SINGLE_FRAM')")).rows;
  const appBySku=new Map(), refBySku=new Map(), sourceCandidateBySku=new Map(), manufacturerIdentityBySku=new Map(), manufacturerPriorityBySku=new Map();
  for(const x of appRows){ if(!appBySku.has(x.sku)) appBySku.set(x.sku,[]); appBySku.get(x.sku).push(x); }
  for(const x of refRows){ if(!refBySku.has(x.sku)) refBySku.set(x.sku,[]); refBySku.get(x.sku).push(x); }
  for(const x of sourceCandidateRows) sourceCandidateBySku.set(x.elimfilters_sku,x);
  for(const x of manufacturerIdentityRows) if(!manufacturerIdentityBySku.has(x.sku)) manufacturerIdentityBySku.set(x.sku,x);
  for(const x of manufacturerPriorityRows) manufacturerPriorityBySku.set(x.sku,{status:'AWAITING_EXPLICIT_AUTHORITY',required_authority:x.required_authority||null,governance_state:x.governance_state,last_error:x.last_error||null});

  const orgDoc=JSON.parse(fs.readFileSync(path.join(root,'hermes/config/source-organizations.json'),'utf8'));
  const orgIndex=buildOrganizationIndex(orgDoc.organizations||[]);
  const readiness=[], backlog=[], evidence=[];

  for(const row of catalog){
    const apps=appBySku.get(row.sku)||[], refs=refBySku.get(row.sku)||[];
    const state=assessSku(row,{appVerifiedCount:apps.length,exactRefs:refs,manufacturerIdentity:manufacturerIdentityBySku.get(row.sku)||null,manufacturerPriority:manufacturerPriorityBySku.get(row.sku)||null});
    readiness.push(state);
    backlog.push(...buildBacklog(row,state,refs,orgIndex,sourceCandidateBySku.get(row.sku)||null));

    if(state.source_verified){
      const payload={brand:row.canonical_source_brand,code:row.canonical_source_code,status:row.canonical_source_status,evidence:row.canonical_evidence||{}};
      evidence.push({evidence_id:stableId('SOURCE',row.sku,row.canonical_source_brand,row.canonical_source_code,sha(payload)),sku:row.sku,field_group:'SOURCE_IDENTITY',field_name:'canonical_source',authority:row.canonical_source_brand,source_type:'CATALOG_GOVERNANCE',source_url:row.canonical_source_url||null,source_hash:sha(payload),verification_status:'VERIFIED',payload,provenance:{origin:'elimfilters_catalog',status:row.canonical_source_status},captured_at:row.canonical_verified_at||null});
    }
    for(const a of apps) evidence.push({evidence_id:stableId('APP',a.id,a.sku,a.evidence_hash||a.payload_hash),sku:a.sku,field_group:'APPLICATIONS',field_name:a.application_kind,authority:a.evidence_authority||null,source_type:'CATALOG_APPLICATION_EVIDENCE',source_url:a.source_url||null,source_hash:a.evidence_hash||a.payload_hash||null,verification_status:'VERIFIED',payload:a.metadata||{},provenance:{source_table:'catalog_application_evidence',source_id:a.id,payload_hash:a.payload_hash},captured_at:a.verified_at||a.created_at});
    for(const x of refs){ const payload={reference_type:x.reference_type,brand:x.brand,part_number:x.part_number,source:x.source}; evidence.push({evidence_id:stableId('XREF',x.id,x.sku,x.brand,x.part_number,x.source),sku:x.sku,field_group:'CROSS_REFERENCES',field_name:x.reference_type,authority:x.brand,source_type:'GOVERNED_EXACT_REFERENCE',source_url:null,source_hash:sha(payload),verification_status:'VERIFIED',payload,provenance:{source_table:'exact_part_reference',source_id:x.id,source:x.source},captured_at:x.created_at}); }
    if(state.dimensions_verified){
      const payload={height_mm:row.height_mm,product_length_mm:row.product_length_mm,outer_diameter_mm:row.outer_diameter_mm,inner_diameter_mm:row.inner_diameter_mm,gasket_od_mm:row.gasket_od_mm,gasket_id_mm:row.gasket_id_mm};
      evidence.push({evidence_id:stableId('DIM',row.sku,row.product_dimensions_source,sha(payload)),sku:row.sku,field_group:'DIMENSIONS',field_name:'product_dimensions',authority:row.product_dimensions_source||row.canonical_source_brand||null,source_type:'CATALOG_DIMENSION_GOVERNANCE',source_url:null,source_hash:sha(payload),verification_status:'VERIFIED',payload,provenance:{validation_status:row.product_dimensions_validation_status},captured_at:null});
    }
    if(state.packaging_verified){
      const payload={units_per_case:row.units_per_case,unit_packaged_weight_kg:row.unit_packaged_weight_kg,unit_packaged_volume_m3:row.unit_packaged_volume_m3,master_carton_length_cm:row.master_carton_length_cm,packaging_type:row.packaging_type};
      evidence.push({evidence_id:stableId('PACK',row.sku,row.packaging_source,sha(payload)),sku:row.sku,field_group:'PACKAGING',field_name:'packaging',authority:row.packaging_source||null,source_type:'CATALOG_PACKAGING_GOVERNANCE',source_url:row.packaging_source_url||null,source_hash:sha(payload),verification_status:'VERIFIED',payload,provenance:{validation_status:row.packaging_validation_status},captured_at:row.packaging_validated_at||null});
    }
  }

  const gapNames=['SOURCE','APPLICATIONS','CROSS_REFERENCES','DIMENSIONS','IMAGE','PACKAGING'];
  const primaryAbsenceIdentityLane={
    selected:manufacturerPriorityRows.length,
    manufacturer_priority_awaiting_explicit_authority:manufacturerPriorityRows.length,
    manufacturer_identity_verified:manufacturerIdentityRows.filter(x=>x.provenance?.queue_state==='PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY'&&x.verification_status==='VERIFIED').length,
    manufacturer_identity_review_required:manufacturerIdentityRows.filter(x=>x.provenance?.queue_state==='PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY'&&x.verification_status==='REVIEW_REQUIRED').length,
    canonical_source_identity_promotions:0,
    application_approvals:0,
    equivalence_approvals:0,
    publication_approvals:0
  };
  const summary={generated_at:new Date().toISOString(),targeted,target_sku_count:targetSkus.size,active_skus:catalog.length,source_verified:readiness.filter(x=>x.source_verified).length,source_primary_evidence:readiness.filter(x=>x.source_primary_evidence).length,manufacturer_identity_verified:readiness.filter(x=>x.manufacturer_identity_verified).length,manufacturer_priority_awaiting_explicit_authority:readiness.filter(x=>x.manufacturer_priority_status==='AWAITING_EXPLICIT_AUTHORITY').length,primary_absence_identity_lane:primaryAbsenceIdentityLane,applications_verified:readiness.filter(x=>x.applications_verified).length,crossrefs_verified:readiness.filter(x=>x.crossrefs_verified).length,dimensions_verified:readiness.filter(x=>x.dimensions_verified).length,image_verified:readiness.filter(x=>x.image_verified).length,packaging_verified:readiness.filter(x=>x.packaging_verified).length,technical_ready:readiness.filter(x=>x.technical_ready).length,fully_verified:readiness.filter(x=>x.fully_verified).length,backlog_open:backlog.length,backlog_by_gap:Object.fromEntries(gapNames.map(g=>[g,readiness.filter(x=>x.gaps.includes(g)).length])),next_action_by_gap:Object.fromEntries(gapNames.map(g=>[g,backlog.filter(x=>x.gap_type===g).length])),evidence_records:evidence.length,sync_requested:sync};

  const groups={};
  for(const r of readiness){
    const k=`${r.duty}|${r.technology}`;
    groups[k]??={duty:r.duty,technology:r.technology,total:0,manufacturer_identity_verified:0,manufacturer_priority_awaiting_explicit_authority:0,source_verified:0,applications_verified:0,crossrefs_verified:0,dimensions_verified:0,technical_ready:0,fully_verified:0};
    const g=groups[k]; g.total++;
    if(r.manufacturer_identity_verified) g.manufacturer_identity_verified++;
    if(r.manufacturer_priority_status==='AWAITING_EXPLICIT_AUTHORITY') g.manufacturer_priority_awaiting_explicit_authority++;
    for(const f of ['source_verified','applications_verified','crossrefs_verified','dimensions_verified','technical_ready','fully_verified']) if(r[f]) g[f]++;
  }
  summary.by_duty_technology=Object.values(groups).sort((a,b)=>String(a.duty).localeCompare(String(b.duty))||b.total-a.total);

  const outDir=path.join(root,'hermes/catalogue-quality');
  fs.mkdirSync(outDir,{recursive:true});
  const report=path.join(outDir,'catalogue-quality-latest.json');
  const queue=path.join(outDir,'catalogue-quality-backlog-latest.json');
  fs.writeFileSync(report,JSON.stringify({schema_version:'1.0.0',...summary},null,2)+'\n');
  fs.writeFileSync(queue,JSON.stringify({schema_version:'1.0.0',generated_at:summary.generated_at,authority:'HERMES_EVIDENCE_BACKLOG',canonical_catalogue_write:false,items:backlog},null,2)+'\n');
  fs.writeFileSync(path.join(outDir,'catalogue-quality-latest.md'),[
    '# HERMES Catalogue Quality','',
    `Generated: ${summary.generated_at}`,'',
    `- Active SKUs: **${summary.active_skus}**`,
    `- Source verified: **${summary.source_verified}**`,
    `- Source with primary/governed evidence payload: **${summary.source_primary_evidence}**`,
    `- Independently verified manufacturer-code identities: **${summary.manufacturer_identity_verified}**`,
    `- Manufacturer priority awaiting explicit authority: **${summary.manufacturer_priority_awaiting_explicit_authority}**`,
    '',
    '## Primary-absence identity and priority lane','',
    `- Selected pending rows: **${primaryAbsenceIdentityLane.selected}**`,
    `- Documented manufacturer-code identity verified: **${primaryAbsenceIdentityLane.manufacturer_identity_verified}**`,
    `- Identity evidence review required: **${primaryAbsenceIdentityLane.manufacturer_identity_review_required}**`,
    `- Donaldson priority still awaiting explicit authority: **${primaryAbsenceIdentityLane.manufacturer_priority_awaiting_explicit_authority}**`,
    '- Canonical source, equivalence, application, and publication approvals from identity verification: **0**','',
    `- Applications verified: **${summary.applications_verified}**`,
    `- Cross-references verified: **${summary.crossrefs_verified}**`,
    `- Dimensions verified: **${summary.dimensions_verified}**`,
    `- Images verified: **${summary.image_verified}**`,
    `- Packaging verified: **${summary.packaging_verified}**`,
    `- Technical ready: **${summary.technical_ready}**`,
    `- Fully verified: **${summary.fully_verified}**`,'',
    '## Open backlog by gap','',
    ...Object.entries(summary.backlog_by_gap).map(([k,v])=>`- ${k}: **${v}**`),'',
    '> HERMES quality metadata only. Canonical catalogue fields are never changed by this command.',''
  ].join('\n'));

  if(sync){
    await db.query(fs.readFileSync(path.join(root,'scripts/migrations/run_108_hermes_catalogue_quality_ledger_20260918.sql'),'utf8'));
    await db.query(fs.readFileSync(path.join(root,'scripts/migrations/run_109_hermes_catalogue_quality_dispatcher_20260918.sql'),'utf8'));
    await db.query('BEGIN');
    try{
      for(const batch of batches(evidence)) await db.query(
        "INSERT INTO hermes_catalogue_evidence(evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,verification_status,payload,provenance,captured_at,updated_at) SELECT evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,verification_status,payload,provenance,captured_at,now() FROM jsonb_to_recordset($1::jsonb) AS x(evidence_id text,sku varchar,field_group text,field_name text,authority text,source_type text,source_url text,source_hash text,verification_status text,payload jsonb,provenance jsonb,captured_at timestamptz) ON CONFLICT(evidence_id) DO UPDATE SET sku=excluded.sku,field_group=excluded.field_group,field_name=excluded.field_name,authority=excluded.authority,source_type=excluded.source_type,source_url=excluded.source_url,source_hash=excluded.source_hash,verification_status=excluded.verification_status,payload=excluded.payload,provenance=excluded.provenance,captured_at=excluded.captured_at,updated_at=now()",
        [JSON.stringify(batch)]
      );

      for(const batch of batches(readiness)) await db.query(
        "INSERT INTO hermes_catalogue_readiness(sku,duty,technology,filter_type,source_present,source_verified,source_primary_evidence,applications_present,applications_verified,crossrefs_present,crossrefs_verified,dimensions_present,dimensions_verified,image_present,image_verified,packaging_present,packaging_verified,technical_ready,fully_verified,readiness_state,gaps,evidence_counts,assessed_at) SELECT sku,duty,technology,filter_type,source_present,source_verified,source_primary_evidence,applications_present,applications_verified,crossrefs_present,crossrefs_verified,dimensions_present,dimensions_verified,image_present,image_verified,packaging_present,packaging_verified,technical_ready,fully_verified,readiness_state,gaps,evidence_counts,now() FROM jsonb_to_recordset($1::jsonb) AS x(sku varchar,duty text,technology text,filter_type text,source_present boolean,source_verified boolean,source_primary_evidence boolean,applications_present boolean,applications_verified boolean,crossrefs_present boolean,crossrefs_verified boolean,dimensions_present boolean,dimensions_verified boolean,image_present boolean,image_verified boolean,packaging_present boolean,packaging_verified boolean,technical_ready boolean,fully_verified boolean,readiness_state text,gaps jsonb,evidence_counts jsonb) ON CONFLICT(sku) DO UPDATE SET duty=excluded.duty,technology=excluded.technology,filter_type=excluded.filter_type,source_present=excluded.source_present,source_verified=excluded.source_verified,source_primary_evidence=excluded.source_primary_evidence,applications_present=excluded.applications_present,applications_verified=excluded.applications_verified,crossrefs_present=excluded.crossrefs_present,crossrefs_verified=excluded.crossrefs_verified,dimensions_present=excluded.dimensions_present,dimensions_verified=excluded.dimensions_verified,image_present=excluded.image_present,image_verified=excluded.image_verified,packaging_present=excluded.packaging_present,packaging_verified=excluded.packaging_verified,technical_ready=excluded.technical_ready,fully_verified=excluded.fully_verified,readiness_state=excluded.readiness_state,gaps=excluded.gaps,evidence_counts=excluded.evidence_counts,assessed_at=now()",
        [JSON.stringify(batch)]
      );
      for(const batch of batches(backlog)) await db.query(
        "INSERT INTO hermes_catalogue_backlog(backlog_id,sku,gap_type,priority,status,manufacturer_candidates,organization_candidates,discovery_hints,recommended_action,updated_at) SELECT backlog_id,sku,gap_type,priority,'OPEN',manufacturer_candidates,organization_candidates,discovery_hints,recommended_action,now() FROM jsonb_to_recordset($1::jsonb) AS x(backlog_id text,sku varchar,gap_type text,priority integer,manufacturer_candidates jsonb,organization_candidates jsonb,discovery_hints jsonb,recommended_action text) ON CONFLICT(backlog_id) DO UPDATE SET sku=excluded.sku,gap_type=excluded.gap_type,priority=excluded.priority,status=CASE WHEN hermes_catalogue_backlog.status IN ('EVIDENCE_FOUND','REVIEW_REQUIRED','APPROVED','BLOCKED') THEN hermes_catalogue_backlog.status ELSE 'OPEN' END,manufacturer_candidates=excluded.manufacturer_candidates,organization_candidates=excluded.organization_candidates,discovery_hints=excluded.discovery_hints,recommended_action=excluded.recommended_action,updated_at=now(),resolved_at=null",
        [JSON.stringify(batch)]
      );

      const activeIds=backlog.map(x=>x.backlog_id);
      if(activeIds.length) {
        if(targeted) await db.query(
          "UPDATE hermes_catalogue_backlog SET status='RESOLVED',resolved_at=now(),updated_at=now() WHERE sku=ANY($2::text[]) AND status NOT IN ('EVIDENCE_FOUND','REVIEW_REQUIRED','APPROVED','BLOCKED') AND NOT(backlog_id=ANY($1::text[]))",
          [activeIds,[...targetSkus]]
        );
        else await db.query(
          "UPDATE hermes_catalogue_backlog SET status='RESOLVED',resolved_at=now(),updated_at=now() WHERE status NOT IN ('EVIDENCE_FOUND','REVIEW_REQUIRED','APPROVED','BLOCKED') AND NOT(backlog_id=ANY($1::text[]))",
          [activeIds]
        );
      }
      await db.query('COMMIT');
    }catch(error){
      await db.query('ROLLBACK');
      throw error;
    }
  }

  console.log(JSON.stringify({report,backlog:queue,...summary},null,2));
} finally {
  await db.end();
}
