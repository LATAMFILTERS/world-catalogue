'use strict';

const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertCanonicalWrite,assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications,applyVerifiedRelationalVehicleApplications}=require('../../lib/catalog-application-write-service');

const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const TARGET='EL30158';
const LEGACY='EL37009';
const OTHER='EL37019';
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/hu7009z_mann-filter.html';
const MANN_HASH='04cc7d3b8b60006807f6bcf11622687ea730dfa014fc6b4a4ed02d45b2eb6cd1';
const FRAM_URL='https://www.fram.com/parts-search';

const norm=(v='')=>String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
const key=x=>norm(x.manufacturer||x.brand)+'|'+norm(x.code||x.part_number||x.reference);
function mergeRefs(current=[],incoming=[]){
  const out=[...(Array.isArray(current)?current:[])];
  const seen=new Set(out.map(key));
  for(const x of incoming||[]){const k=key(x);if(k&&!seen.has(k)){out.push(x);seen.add(k);}}
  return out;
}
function splitYear(v){
  const s=String(v||'').trim();
  const m=s.match(/^(\d{4})-(\d{4})$/);
  if(m)return {year:null,year_from:Number(m[1]),year_to:Number(m[2])};
  const y=Number(s);return Number.isFinite(y)&&y>1900?{year:y,year_from:y,year_to:y}:null;
}
function publicApps(item){
  return (item.vehicle_applications||[]).map(a=>({
    make:a.make,model:a.model,equipment:[a.make,a.model].filter(Boolean).join(' '),
    engine:a.engine,year:a.year
  })).filter(a=>a.make&&a.model);
}

function governance(item){
  return {
    codigo_base_governance:{
      policy_version:'2026-08-29-regional-v3.2',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'NON_EUROPEAN',
      approved_manufacturer:'FRAM',
      approved_codigo_base:item.codigo_base,
      approved_source_column:'CANONICAL_POLICY',
      current_codigo_base:item.codigo_base,
      primary_manufacturer_verified:true,
      required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
      evidence_note:'FRAM CH10158 is canonical LD non-European oil authority; MANN-FILTER HU7009Z is verified equivalent.',
    },
    sku_governance:{
      canonical_sku:TARGET,
      governing_rule:'LD_NON_EUROPEAN_FRAM_CANONICAL_BASE_SUFFIX',
      canonical_base:item.codigo_base,
      operator_confirmed:true,
      verified_at:new Date().toISOString(),
    },
  };
}
function buildRow(item){
  const s=item.specs||{};
  const extraOem=[
    {manufacturer:'Toyota',code:'04152-0R010',classification:'OEM',source_url:MANN_URL,evidence_hash:MANN_HASH,evidence_authority:'MANN_FILTER_OFFICIAL_EQUIVALENCE'},
    {manufacturer:'Toyota',code:'04152-26010',classification:'OEM',source_url:MANN_URL,evidence_hash:MANN_HASH,evidence_authority:'MANN_FILTER_OFFICIAL_EQUIVALENCE'},
    {manufacturer:'Toyota',code:'15613-YZZA2',classification:'OEM',source_url:MANN_URL,evidence_hash:MANN_HASH,evidence_authority:'MANN_FILTER_OFFICIAL_EQUIVALENCE'},
  ];
  const oem=mergeRefs(item.oem_codes,extraOem);
  return {
    sku:TARGET,codigo_base:item.codigo_base,filter_type:'oil',technology:'SYNTRAX™',
    height_mm:s.height_mm??null,outer_diameter_mm:s.outer_diameter_mm??null,
    gasket_od_mm:s.gasket_od_mm??null,gasket_id_mm:s.gasket_id_mm??null,
    thread_size:s.thread_size??null,bypass_valve_psi:s.bypass_setting_psi==null?null:String(s.bypass_setting_psi),
    burst_pressure_psi:s.burst_pressure_psi==null?null:String(s.burst_pressure_psi),
    anti_drainback_valve:s.anti_drainback_valve??null,filter_media:s.media_type||s.premium_guard_media_material||null,
    oem_codes:oem,competitor_codes:item.competitor_codes||[],equipment_applications:[],vehicle_applications:[],
    description:'ELIMFILTERS® EL30158 light-duty lube oil cartridge filter. Canonical source FRAM CH10158; MANN-FILTER HU7009Z verified equivalent.',
    enrichment_data:governance(item),specs:s,duty:'LIGHT_DUTY',alternative_products:[],brand_crossrefs:{},alternatives:[],
    canonical_source_brand:'FRAM',canonical_source_code:item.codigo_base,canonical_source_url:FRAM_URL,
    canonical_source_status:'VERIFIED',canonical_verified_at:new Date(),
    canonical_evidence:{
      authority:'FRAM',code:item.codigo_base,evidence_hash:item.canonical_evidence_hash,
      mann_equivalent:'HU7009Z',mann_evidence_url:MANN_URL,mann_evidence_hash:MANN_HASH,
      premium_guard_code:item.premium_guard_code
    },
    duty_source_brand:'FRAM',duty_validation_status:'VERIFIED',duty_verified_at:new Date(),
    duty_evidence:{duty:'LIGHT_DUTY',source:'FRAM_LD_MULTI_REGION',authority:item.codigo_base},
    sub_type:s.style??'Cartridge',installation_type:s.style??'Cartridge'
  };
}
async function insertPublic(db,row){
  const cols=[
    'sku','codigo_base','filter_type','technology','height_mm','outer_diameter_mm','gasket_od_mm','gasket_id_mm',
    'thread_size','bypass_valve_psi','burst_pressure_psi','anti_drainback_valve','filter_media',
    'oem_codes','competitor_codes','equipment_applications','vehicle_applications','description','enrichment_data','specs',
    'duty','alternative_products','brand_crossrefs','alternatives','canonical_source_brand','canonical_source_code',
    'canonical_source_url','canonical_source_status','canonical_verified_at','canonical_evidence','duty_source_brand',
    'duty_validation_status','duty_verified_at','duty_evidence','sub_type','installation_type'
  ];
  const jsonCols=new Set(['oem_codes','competitor_codes','equipment_applications','vehicle_applications','enrichment_data','specs','alternative_products','brand_crossrefs','alternatives','canonical_evidence','duty_evidence']);
  const params=[],vals=[];
  cols.forEach((c,i)=>{params.push(jsonCols.has(c)?JSON.stringify(row[c]):row[c]);vals.push('$'+(i+1)+(jsonCols.has(c)?'::jsonb':''));});
  await db.query('insert into public.elimfilters_catalog ('+cols.join(',')+') values ('+vals.join(',')+')',params);
}

async function upsertSupportRows(db,item,row){
  await db.query(`
    insert into ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment)
    values($1,$2,'Oil Filter')
    on conflict (elimfilters_sku) do update set source_sku=excluded.source_sku,segment=excluded.segment
  `,[TARGET,item.codigo_base]);
  await db.query(`
    insert into ld_catalog.ld_production_readiness
      (elimfilters_sku,source_sku,segment,has_oem,has_competitor,has_applications,has_specifications,production_tier)
    values($1,$2,'Oil Filter',$3,$4,$5,$6,'FRAM_CANON')
    on conflict (elimfilters_sku) do update set
      source_sku=excluded.source_sku,segment=excluded.segment,has_oem=excluded.has_oem,
      has_competitor=excluded.has_competitor,has_applications=excluded.has_applications,
      has_specifications=excluded.has_specifications,production_tier=excluded.production_tier,updated_at=now()
  `,[TARGET,item.codigo_base,row.oem_codes.length>0,row.competitor_codes.length>0,item.vehicle_applications.length>0,Object.keys(item.specs||{}).length>0]);
  await db.query(`
    insert into ld_catalog.ld_canonical_product_identity
      (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source)
    values($1,'NON_EUROPEAN','FRAM',$2,'oil','ACTIVE','FRAM_PLUS_MANN_PG')
    on conflict (elimfilters_sku) do update set
      origin_group='NON_EUROPEAN',canonical_brand='FRAM',canonical_part_number=excluded.canonical_part_number,
      filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()
  `,[TARGET,item.codigo_base]);
}

async function writeRelationalEvidence(db,item,row){
  for(const x of row.oem_codes){
    await db.query(`
      insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number)
      values($1,$2,$3,$4)
      on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing
    `,[TARGET,item.codigo_base,x.manufacturer,x.code]);
  }
  for(const x of row.competitor_codes){
    await db.query(`
      insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
      values($1,$2,$3,$4)
      on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing
    `,[TARGET,item.codigo_base,x.manufacturer,x.code]);
  }
  for(const [k,v] of Object.entries(item.specs||{})){
    if(v==null||v==='')continue;
    const unit=/_mm$/.test(k)?'mm':/_in$/.test(k)?'in':/_psi$/.test(k)?'psi':null;
    await db.query(`
      insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit)
      values($1,$2,$3,$4,$5)
      on conflict (elimfilters_sku,spec_key) do update set
        source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit
    `,[TARGET,item.codigo_base,k,String(v),unit]);
  }
}

async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('Missing database URL');
  const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===TARGET);
  if(!item)throw new Error('EL30158_MANIFEST_MISSING');
  const row=buildRow(item);
  const db=new Client({connectionString:url,ssl:false});
  const report={mode:APPLY?'apply':'dry-run',target:TARGET,legacy:LEGACY,other:OTHER};
  await db.connect();
  try{
    await db.query('BEGIN');
    const existing=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,LEGACY,OTHER]]);
    const by=new Map(existing.rows.map(r=>[r.sku,r]));
    if(by.has(TARGET))throw new Error('TARGET_ALREADY_EXISTS');
    const legacy=by.get(LEGACY),other=by.get(OTHER);
    if(!legacy||!other)throw new Error('LEGACY_ROWS_MISSING');

    report.target_gateway=assertCanonicalWrite(row);
    report.legacy_gateway=assertGovernedCatalogPatch(legacy,{catalog_active:false});
    const relationalOther={
      sku:OTHER,codigo_base:other.codigo_base,duty:other.duty,
      oem_codes:[{manufacturer:'Toyota',code:'04152-31080',classification:'OEM'}],
      competitor_codes:[],enrichment_data:other.enrichment_data||{}
    };
    report.other_relational_gateway=assertGovernedCatalogPatch(relationalOther,{oem_codes:[]},{
      referenceCorrection:true,
      correctionEvidence:{
        authority:'MANN_FILTER_HU7009Z_OFFICIAL',
        source_url:MANN_URL,
        evidence_hash:MANN_HASH,
        reason:'Toyota 04152-31080 belongs to HU7009Z / FRAM CH10158 physical family, not HU7019Z.',
      },
    });

    report.preflight={
      target_oem:row.oem_codes.length,target_comp:row.competitor_codes.length,
      target_apps:item.vehicle_applications.length,target_specs:Object.keys(item.specs||{}).length,
      other_relational_oem_remove:'04152-31080',
    };
    if(!APPLY){
      await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;
    }

    await db.query('update public.elimfilters_catalog set catalog_active=false where sku=$1',[LEGACY]);
    await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[LEGACY]);
    await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[LEGACY]);
    await db.query('delete from public.crossref_resolved_cache where sku=$1',[LEGACY]);

    await db.query(`
      delete from ld_catalog.ld_oem_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(oem_brand,'')),'[^A-Z0-9]','','g')='TOYOTA'
        and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')='0415231080'
    `,[OTHER]);

    await insertPublic(db,row);
    await upsertSupportRows(db,item,row);
    await writeRelationalEvidence(db,item,row);

    const apps=publicApps(item);
    report.public_application_write=await applyVerifiedApplications(db,{
      sku:TARGET,vehicle_applications:apps,equipment_applications:[],
      evidence:{
        authority:'FRAM_PLUS_PREMIUM_GUARD',
        source_url:item.application_source_url,
        evidence_hash:item.application_evidence_hash,
        metadata:{canonical_brand:'FRAM',canonical_code:item.codigo_base,mann_equivalent:'HU7009Z',premium_guard_code:item.premium_guard_code},
      },
    });

    const relational=[];
    for(const a of item.vehicle_applications||[]){
      const yrs=splitYear(a.year);if(!yrs)throw new Error('INVALID_YEAR:'+a.year);
      relational.push({
        make:a.make,model:a.model,year:yrs.year,year_from:yrs.year_from,year_to:yrs.year_to,
        engine:a.engine,source_sku:item.codigo_base,source_origin:a.source||'FRAM_PLUS_PREMIUM_GUARD',
      });
    }
    report.relational_application_write=await applyVerifiedRelationalVehicleApplications(db,{
      sku:TARGET,source_sku:item.codigo_base,applications:relational,
      evidence:{
        authority:'FRAM_PLUS_PREMIUM_GUARD',
        source_url:item.application_source_url,
        evidence_hash:item.application_evidence_hash,
        metadata:{canonical_code:item.codigo_base,mann_equivalent:'HU7009Z',premium_guard_code:item.premium_guard_code},
      },
    });

    await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
    await db.query('select refresh_crossref_cache_sku($1)',[OTHER]);

    const audit=await db.query(`
      select sku,catalog_active,codigo_base,canonical_source_brand,canonical_source_code,
        jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,
        jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) comp_count,
        jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) app_count
      from public.elimfilters_catalog
      where sku=any($1::text[])
      order by sku
    `,[[TARGET,LEGACY,OTHER]]);
    report.audit=audit.rows;

    const targetAudit=audit.rows.find(r=>r.sku===TARGET);
    if(!targetAudit||targetAudit.catalog_active!==true)throw new Error('TARGET_NOT_ACTIVE');
    if(Number(targetAudit.oem_count)!==row.oem_codes.length)throw new Error('TARGET_OEM_COUNT_MISMATCH');
    if(Number(targetAudit.comp_count)!==row.competitor_codes.length)throw new Error('TARGET_COMP_COUNT_MISMATCH');
    if(Number(targetAudit.app_count)!==apps.length)throw new Error('TARGET_APP_COUNT_MISMATCH');

    const otherRel=await db.query(`
      select count(*)::int n
      from ld_catalog.ld_oem_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(oem_brand,'')),'[^A-Z0-9]','','g')='TOYOTA'
        and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')='0415231080'
    `,[OTHER]);
    report.other_relational_0415231080=otherRel.rows[0].n;
    if(otherRel.rows[0].n!==0)throw new Error('OTHER_RELATIONAL_OEM_CORRECTION_MISMATCH');

    const codes=['CH10158','HU7009Z','PG5609EX','0415231060','0415238010','0415231080','57173'];
    const v5=await db.query('select code,sku,manufacturer from public.v_api_resolver_v5 where code=any($1::text[]) order by code,sku',[codes]);
    report.v5=v5.rows;
    for(const code of ['CH10158','HU7009Z','PG5609EX','0415231060','0415238010','57173']){
      if(!v5.rows.some(r=>r.code===code&&r.sku===TARGET)&&code!=='CH10158')throw new Error('TARGET_RESOLVER_MISSING_'+code);
    }
    if(v5.rows.some(r=>r.code==='0415231080'&&r.sku===OTHER))throw new Error('CONTAMINATED_OTHER_STILL_RESOLVES');

    await db.query('COMMIT');report.transaction='COMMIT';return report;
  }catch(e){
    try{await db.query('ROLLBACK')}catch(_){}
    e.report=report;throw e;
  }finally{await db.end();}
}
if(require.main===module){
  run().then(r=>console.log('[run126]',JSON.stringify(r,null,2))).catch(e=>{
    console.error('[run126] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));
    console.error(e.stack||e.message);process.exit(1);
  });
}
module.exports={run};
