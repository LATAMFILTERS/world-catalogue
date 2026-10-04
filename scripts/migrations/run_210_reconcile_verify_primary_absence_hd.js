'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const EXPECTED_TOTAL=5458;
const EXPECTED_ALREADY_VERIFIED=4;
const EXPECTED_DONALDSON_EXACT=3426;
const EXPECTED_FLEETGUARD_EXACT=1904;
const EXPECTED_RESIDUAL=124;
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const DONALDSON_AUTH='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';
const FLEETGUARD_AUTH='FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP';
const FLEETGUARD_SITEMAP='https://www.fleetguard.com/sitemap-product-1.xml';

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');}
function runtimeUrl(){
  const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(direct)return direct;
  const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
  const m=runner.match(/\$env:DATABASE_URL='([^']+)'/);
  if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}
function loadDonaldson(){
  const dir=ROOT+'/scripts', exact=new Map();
  const files=fs.readdirSync(dir).filter(f=>/^donaldson_.*_results\.json$/i.test(f));
  for(const file of files){
    const rel='scripts/'+file, raw=fs.readFileSync(dir+'/'+file,'utf8'), fileHash=sha(raw);
    for(const record of JSON.parse(raw)){
      const k=norm(record.part_number);
      if(k&&!exact.has(k))exact.set(k,{rel,file_hash:fileHash,record,record_hash:sha(record)});
    }
  }
  return exact;
}
async function loadFleetguard(){
  const r=await fetch(FLEETGUARD_SITEMAP,{redirect:'follow'});
  if(!r.ok)throw new Error('FLEETGUARD_SITEMAP_HTTP_'+r.status);
  const xml=await r.text(), map=new Map();
  for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
    const url=m[1], p=url.match(/\/product\/([^/?#<]+)/i);
    if(p)map.set(norm(decodeURIComponent(p[1])),url);
  }
  return {map,hash:sha(xml),count:map.size};
}

async function main(){
  const url=runtimeUrl(),u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||u.port!=='5432'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_RUNTIME_5432_DB');
  }
  const donaldson=loadDonaldson(),fleetguard=await loadFleetguard();
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={
    migration:'210_RECONCILE_VERIFY_PRIMARY_ABSENCE_HD',
    mode:EXECUTE?'execute':'dry-run',
    selected:0,
    classified:{already_donaldson_verified:0,donaldson_exact_current:0,fleetguard_exact_current:0,residual_requires_explicit_absence:0},
    mutations:{sku:0,codigo_base:0,alternates:0,canonical_authority:0,governance:0,evidence:0,queue_resolved:0,queue_blocked:0},
    fleetguard_sitemap_count:fleetguard.count
  };
  try{
    const q=await db.query(
      "SELECT q.status AS queue_status,q.governance_state AS queue_governance_state,q.last_error AS queue_last_error,q.attempts AS queue_attempts,c.* "+
      "FROM public.catalog_codigo_base_sanitation_queue q "+
      "JOIN public.elimfilters_catalog c ON c.sku=q.sku "+
      "WHERE q.status='PENDING' AND q.attempts<3 AND q.governance_state='VERIFY_PRIMARY_ABSENCE' "+
      "AND c.duty='HEAVY_DUTY' ORDER BY q.sku"
    );
    report.selected=q.rowCount;
    if(q.rowCount!==EXPECTED_TOTAL)throw new Error('EXPECTED_TOTAL_'+EXPECTED_TOTAL+'_GOT_'+q.rowCount);

    const plans=[];
    for(const joined of q.rows){
      const before={...joined};
      delete before.queue_status; delete before.queue_governance_state; delete before.queue_last_error; delete before.queue_attempts;
      const gatewayBefore={...before,
        oem_codes:Array.isArray(before.oem_codes)?before.oem_codes:[],
        competitor_codes:Array.isArray(before.competitor_codes)?before.competitor_codes:[],
        vehicle_applications:Array.isArray(before.vehicle_applications)?before.vehicle_applications:[],
        equipment_applications:Array.isArray(before.equipment_applications)?before.equipment_applications:[]
      };
      const current=before.codigo_base;
      const currentNorm=norm(current);
      const gov=before.enrichment_data?.codigo_base_governance||{};
      const already=String(before.canonical_source_brand||'').toUpperCase()==='DONALDSON'&&String(before.canonical_source_status||'').toUpperCase()==='VERIFIED';
      const dsrc=donaldson.get(currentNorm)||null;
      const fgUrl=fleetguard.map.get(currentNorm)||null;

      if(already){
        report.classified.already_donaldson_verified++;
        const now=new Date().toISOString();
        const nextGov={...gov,policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',required_authority:'VERIFIED_DONALDSON',primary_manufacturer_verified:true,approved_manufacturer:'DONALDSON',approved_codigo_base:current,approved_source_column:'CODIGO_BASE',verified_at:gov.verified_at||before.canonical_verified_at||now};
        const nextData={...(before.enrichment_data||{}),codigo_base_governance:nextGov};
        assertGovernedCatalogPatch(gatewayBefore,{enrichment_data:nextData});
        plans.push({kind:'ALREADY_VERIFIED',before,nextData});
        continue;
      }

      if(dsrc){
        report.classified.donaldson_exact_current++;
        const now=new Date().toISOString();
        const evidenceUrl='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(current);
        const nextGov={...gov,policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',required_authority:'VERIFIED_DONALDSON',primary_manufacturer_verified:true,approved_manufacturer:'DONALDSON',approved_codigo_base:current,approved_source_column:'CODIGO_BASE',evidence_authority:DONALDSON_AUTH,evidence_kind:'OFFICIAL_AUTHENTICATED_CAPTURE',evidence_url:evidenceUrl,evidence_hash:dsrc.record_hash,verified_at:now};
        const nextData={...(before.enrichment_data||{}),codigo_base_governance:nextGov};
        const canonicalEvidence={source:DONALDSON_AUTH,source_file:dsrc.rel,source_file_hash:dsrc.file_hash,record_hash:dsrc.record_hash,reference_code:current,classification:'VERIFY_PRIMARY_ABSENCE_FALSE_POSITIVE_PRIMARY_EXISTS'};
        const patch={enrichment_data:nextData,canonical_source_brand:'DONALDSON',canonical_source_code:current,canonical_source_url:evidenceUrl,canonical_source_status:'VERIFIED',canonical_verified_at:now,canonical_evidence:canonicalEvidence};
        assertGovernedCatalogPatch(gatewayBefore,patch);
        plans.push({kind:'DONALDSON_EXACT',before,nextData,patch,now,evidenceUrl,dsrc,canonicalEvidence});
        continue;
      }

      if(fgUrl){
        report.classified.fleetguard_exact_current++;
        plans.push({kind:'FLEETGUARD_EXACT',before,fgUrl});
        continue;
      }

      report.classified.residual_requires_explicit_absence++;
      plans.push({kind:'RESIDUAL',before});
    }

    const c=report.classified;
    if(c.already_donaldson_verified!==EXPECTED_ALREADY_VERIFIED||c.donaldson_exact_current!==EXPECTED_DONALDSON_EXACT||c.fleetguard_exact_current!==EXPECTED_FLEETGUARD_EXACT||c.residual_requires_explicit_absence!==EXPECTED_RESIDUAL){
      throw new Error('CLASSIFICATION_DRIFT '+JSON.stringify(c));
    }

    if(!EXECUTE)return report;

    for(const p of plans){
      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try{
        const lock=(await db.query(
          "SELECT q.status AS queue_status,q.governance_state AS queue_state,q.last_error AS queue_last_error,c.* "+
          "FROM public.catalog_codigo_base_sanitation_queue q JOIN public.elimfilters_catalog c ON c.sku=q.sku "+
          "WHERE c.sku=$1 FOR UPDATE",
          [p.before.sku]
        )).rows[0];
        if(!lock||lock.queue_status!=='PENDING'||lock.queue_state!=='VERIFY_PRIMARY_ABSENCE'||norm(lock.codigo_base)!==norm(p.before.codigo_base)){
          throw new Error('EXECUTION_BASELINE_CHANGED:'+p.before.sku);
        }

        if(p.kind==='ALREADY_VERIFIED'){
          const lockedBefore={...lock};delete lockedBefore.queue_status;delete lockedBefore.queue_state;delete lockedBefore.queue_last_error;
          const lockedGateway={...lockedBefore,oem_codes:Array.isArray(lockedBefore.oem_codes)?lockedBefore.oem_codes:[],competitor_codes:Array.isArray(lockedBefore.competitor_codes)?lockedBefore.competitor_codes:[],vehicle_applications:Array.isArray(lockedBefore.vehicle_applications)?lockedBefore.vehicle_applications:[],equipment_applications:Array.isArray(lockedBefore.equipment_applications)?lockedBefore.equipment_applications:[]};
          assertGovernedCatalogPatch(lockedGateway,{enrichment_data:p.nextData});
          const upd=await db.query("UPDATE public.elimfilters_catalog SET enrichment_data=$1::jsonb WHERE sku=$2 RETURNING sku",[JSON.stringify(p.nextData),p.before.sku]);
          if(upd.rowCount!==1)throw new Error('CATALOG_UPDATE_FAILED:'+p.before.sku);
          const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET governance_state='CANONICAL_VERIFIED',required_authority='DONALDSON',status='RESOLVED',last_error=NULL,updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='VERIFY_PRIMARY_ABSENCE' RETURNING sku",[p.before.sku]);
          if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+p.before.sku);
          report.mutations.governance++;report.mutations.queue_resolved++;
        }else if(p.kind==='DONALDSON_EXACT'){
          const lockedBefore={...lock};delete lockedBefore.queue_status;delete lockedBefore.queue_state;delete lockedBefore.queue_last_error;
          const lockedGateway={...lockedBefore,oem_codes:Array.isArray(lockedBefore.oem_codes)?lockedBefore.oem_codes:[],competitor_codes:Array.isArray(lockedBefore.competitor_codes)?lockedBefore.competitor_codes:[],vehicle_applications:Array.isArray(lockedBefore.vehicle_applications)?lockedBefore.vehicle_applications:[],equipment_applications:Array.isArray(lockedBefore.equipment_applications)?lockedBefore.equipment_applications:[]};
          assertGovernedCatalogPatch(lockedGateway,p.patch);
          const ev=await db.query(
            "INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
            "VALUES ($1,'OFFICIAL_AUTHENTICATED_CAPTURE',$2,'DONALDSON',$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT DO NOTHING RETURNING id",
            [p.before.sku,DONALDSON_AUTH,p.before.codigo_base,norm(p.before.codigo_base),p.evidenceUrl,p.dsrc.record_hash,p.now,JSON.stringify(p.canonicalEvidence)]
          );
          const upd=await db.query(
            "UPDATE public.elimfilters_catalog SET enrichment_data=$1::jsonb,canonical_source_brand='DONALDSON',canonical_source_code=$2,canonical_source_url=$3,canonical_source_status='VERIFIED',canonical_verified_at=$4,canonical_evidence=$5::jsonb "+
            "WHERE sku=$6 AND codigo_base IS NOT DISTINCT FROM $7 AND canonical_source_status='UNVERIFIED' RETURNING sku",
            [JSON.stringify(p.nextData),p.before.codigo_base,p.evidenceUrl,p.now,JSON.stringify(p.canonicalEvidence),p.before.sku,lock.codigo_base]
          );
          if(upd.rowCount!==1)throw new Error('CATALOG_CAS_FAILED:'+p.before.sku);
          const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET governance_state='CANONICAL_VERIFIED',required_authority='DONALDSON',status='RESOLVED',last_error=NULL,updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='VERIFY_PRIMARY_ABSENCE' RETURNING sku",[p.before.sku]);
          if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+p.before.sku);
          report.mutations.canonical_authority++;report.mutations.governance++;report.mutations.evidence+=ev.rowCount;report.mutations.queue_resolved++;
        }else if(p.kind==='FLEETGUARD_EXACT'){
          const evidenceHash=sha({sitemap_hash:fleetguard.hash,product_url:p.fgUrl,code:p.before.codigo_base});
          const ev=await db.query(
            "INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
            "VALUES ($1,'OFFICIAL_PRODUCT_SITEMAP',$2,'FLEETGUARD',$3,$4,$5,$6,now(),$7::jsonb) ON CONFLICT DO NOTHING RETURNING id",
            [p.before.sku,FLEETGUARD_AUTH,p.before.codigo_base,norm(p.before.codigo_base),p.fgUrl,evidenceHash,JSON.stringify({sitemap_url:FLEETGUARD_SITEMAP,sitemap_hash:fleetguard.hash,purpose:'FALLBACK_MANUFACTURER_AND_CODE_VERIFICATION_ONLY',donaldson_absence_verified:false,canonical_promotion_allowed:false})]
          );
          const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET last_error='PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE',updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='VERIFY_PRIMARY_ABSENCE' RETURNING sku",[p.before.sku]);
          if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+p.before.sku);
          report.mutations.evidence+=ev.rowCount;report.mutations.queue_blocked++;
        }else{
          const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET last_error='PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE',updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='VERIFY_PRIMARY_ABSENCE' RETURNING sku",[p.before.sku]);
          if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+p.before.sku);
          report.mutations.queue_blocked++;
        }
        await db.query('COMMIT');
      }catch(e){await db.query('ROLLBACK');throw e;}
    }
    return report;
  }finally{await db.end();}
}

if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={main};
