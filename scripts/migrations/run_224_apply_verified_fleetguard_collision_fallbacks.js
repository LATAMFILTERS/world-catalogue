'use strict';

require('dotenv').config();
const {Client}=require('pg');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
  approvedHdCollisionFallbackReady,
}=require('../../lib/catalog-codigo-base-policy');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

function prefixFor(sku=''){
  const s=String(sku).toUpperCase();
  for(const p of ['EA1','EA2','EF9','EL8','EH6']) if(s.startsWith(p)) return p;
  return null;
}
function expectedSkuFromCode(sku,code){
  const p=prefixFor(sku),s=lastFourNumeric(code);
  return p&&s?p+s:null;
}
function refs(v){
  if(!Array.isArray(v))return [];
  return v.map(x=>({
    raw:x,
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||'')
  })).filter(x=>x.code);
}
function removeRef(v,manufacturer,code){
  const m=normalizeManufacturer(manufacturer),c=normalizeCode(code);
  return (Array.isArray(v)?v:[]).filter(x=>{
    const r=refs([x])[0];
    return !(r&&r.manufacturer===m&&normalizeCode(r.code)===c);
  });
}
function evidenceKey(e){return normalizeManufacturer(e.manufacturer)+'|'+normalizeCode(e.reference_code);}

async function tableExists(db,qualified){
  const r=await db.query('SELECT to_regclass($1) AS r',[qualified]);
  return Boolean(r.rows[0]?.r);
}
async function updateDerivedRefs(db,oldSku,newSku){
  const mappings=[
    ['public.exact_part_reference','sku'],
    ['public.kit_components','filter_sku'],
    ['public.product_element','elimfilters_sku'],
    ['public.product_model','elimfilters_sku'],
    ['public.kg_product_equipment','product_sku'],
    ['public.kg_crossrefs','product_sku'],
    ['public.catalog_sku_certification','sku'],
    ['public.catalog_codigo_base_evidence','sku'],
    ['public.codigo_base_review_queue','sku'],
    ['public.catalog_codigo_base_sanitation_queue','sku'],
    ['public.hermes_catalogue_backlog','sku'],
    ['public.hermes_catalogue_dossier','sku'],
    ['public.hermes_catalogue_evidence','sku'],
    ['ld_catalog.ld_product_catalog','elimfilters_sku'],
    ['ld_catalog.ld_vehicle_applications','elimfilters_sku'],
    ['ld_catalog.ld_oem_cross_references','elimfilters_sku'],
    ['ld_catalog.ld_competitor_cross_references','elimfilters_sku'],
    ['ld_catalog.ld_product_specifications','elimfilters_sku'],
    ['ld_catalog.ld_production_readiness','elimfilters_sku']
  ];
  const touched=[];
  for(const [table,col] of mappings){
    if(!(await tableExists(db,table)))continue;
    const [schema,name]=table.split('.');
    const c=await db.query(
      'SELECT 1 FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3',
      [schema,name,col]
    );
    if(!c.rowCount)continue;
    const u=await db.query(`UPDATE ${table} SET ${col}=$1 WHERE ${col}=$2`,[newSku,oldSku]);
    if(u.rowCount)touched.push({table,column:col,rows:u.rowCount});
  }
  return touched;
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'224_APPLY_VERIFIED_FLEETGUARD_COLLISION_FALLBACKS',
    mode:EXECUTE?'execute':'dry-run',
    ready:[],
    applied:[],
    blocked:[],
    transaction:null
  };

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const rows=(await db.query(`
      SELECT *
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
      FOR UPDATE
    `)).rows;

    const bySku=new Map(rows.map(r=>[String(r.sku).toUpperCase(),r]));
    const malformed=rows.map(r=>({...r,natural_target:expectedSkuFromCode(r.sku,r.codigo_base||r.canonical_source_code)}))
      .filter(r=>r.natural_target&&r.natural_target!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.natural_target))groups.set(r.natural_target,[]);
      groups.get(r.natural_target).push(r);
    }

    const collisionRows=[];
    for(const [target,sources] of groups){
      const occupied=bySku.get(target)||null;
      if(sources.length>1||occupied){
        for(const source of sources)collisionRows.push({source,target,occupied,source_count:sources.length});
      }
    }

    const skuList=collisionRows.map(x=>x.source.sku);
    const ledger=skuList.length?(await db.query(`
      SELECT sku,evidence_kind,authority,manufacturer,reference_code,source_url,verified_at,metadata
      FROM public.catalog_codigo_base_evidence
      WHERE sku=ANY($1::text[])
      ORDER BY sku,verified_at DESC,id DESC
    `,[skuList])).rows:[];

    const byEvidence=new Map();
    for(const e of ledger){
      if(!byEvidence.has(e.sku))byEvidence.set(e.sku,[]);
      byEvidence.get(e.sku).push(e);
    }

    for(const item of collisionRows){
      const r=item.source;
      if(String(r.duty||'').toUpperCase()!=='HEAVY_DUTY')continue;

      const gov=governanceFrom(r);
      const canonicalCode=normalizeCode(r.canonical_source_code);
      const donaldsonPrimary=gov.primary_manufacturer_verified===true
        && normalizeManufacturer(r.canonical_source_brand)==='DONALDSON'
        && canonicalCode;
      if(!donaldsonPrimary)continue;

      if(!item.occupied)continue;
      const occupiedDistinct=
        normalizeCode(item.occupied.codigo_base)!==normalizeCode(r.codigo_base)
        && normalizeCode(item.occupied.canonical_source_code)!==canonicalCode;
      if(!occupiedDistinct)continue;

      const official=(byEvidence.get(r.sku)||[]).filter(e=>{
        const k=String(e.evidence_kind||'').toUpperCase();
        return k.includes('OFFICIAL')||k.includes('MANUFACTURER');
      });
      const set=new Set(official.map(evidenceKey));

      const fleetguard=[...new Map(
        refs(r.competitor_codes)
          .filter(x=>x.manufacturer==='FLEETGUARD'&&set.has('FLEETGUARD|'+normalizeCode(x.code)))
          .map(x=>[normalizeCode(x.code),x])
      ).values()];

      if(fleetguard.length!==1)continue;

      const fg=fleetguard[0];
      const target=expectedSkuFromCode(r.sku,fg.code);
      if(!target)continue;
      const targetOcc=bySku.get(target)||null;
      if(targetOcc)continue;

      const nextCompetitor=removeRef(r.competitor_codes,'FLEETGUARD',fg.code);
      const nextGov={
        ...gov,
        policy_version:'2026-10-06-v4.2',
        primary_manufacturer_verified:true,
        donaldson_sku_collision_verified:true,
        collision_donaldson_code:r.canonical_source_code,
        fallback_manufacturer_verified:true,
        fallback_commercial_code_verified:true,
        approved_manufacturer:'FLEETGUARD',
        approved_codigo_base:fg.code,
        approved_source_column:'COMPETITOR_CODES',
        fleetguard_evidence_authority:'OFFICIAL_FLEETGUARD',
        fleetguard_evidence_verified:true
      };
      const nextEnrichment={...(r.enrichment_data||{}),codigo_base_governance:nextGov};

      const projected={
        ...r,
        sku:target,
        codigo_base:fg.code,
        competitor_codes:nextCompetitor,
        oem_codes:Array.isArray(r.oem_codes)?r.oem_codes:[],
        equipment_applications:Array.isArray(r.equipment_applications)?r.equipment_applications:[],
        vehicle_applications:Array.isArray(r.vehicle_applications)?r.vehicle_applications:[],
        enrichment_data:nextEnrichment
      };

      if(!approvedHdCollisionFallbackReady(projected,'FLEETGUARD')){
        report.blocked.push({from:r.sku,to:target,code:fg.code,reason:'PROJECTED_POLICY_NOT_READY'});
        continue;
      }

      try{
        assertGovernedCatalogPatch(
          {
            ...r,
            competitor_codes:Array.isArray(r.competitor_codes)?r.competitor_codes:[],
            oem_codes:Array.isArray(r.oem_codes)?r.oem_codes:[],
            equipment_applications:Array.isArray(r.equipment_applications)?r.equipment_applications:[],
            vehicle_applications:Array.isArray(r.vehicle_applications)?r.vehicle_applications:[]
          },
          {
            sku:target,
            codigo_base:fg.code,
            competitor_codes:nextCompetitor,
            enrichment_data:nextEnrichment
          },
          {validateApplications:false}
        );
      }catch(e){
        report.blocked.push({from:r.sku,to:target,code:fg.code,reason:'GATEWAY:'+e.message});
        continue;
      }

      const candidate={
        from:r.sku,
        to:target,
        old_codigo_base:r.codigo_base,
        new_codigo_base:fg.code,
        canonical_donaldson:r.canonical_source_code,
        natural_donaldson_target:item.target,
        occupied_by:{sku:item.occupied.sku,codigo_base:item.occupied.codigo_base}
      };
      report.ready.push(candidate);

      if(!EXECUTE)continue;

      await db.query('SAVEPOINT one_fallback');
      try{
        const fresh=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[r.sku])).rows[0];
        if(!fresh)throw new Error('SOURCE_MISSING');
        if(normalizeCode(fresh.codigo_base)!==normalizeCode(r.codigo_base))throw new Error('SOURCE_BASE_CHANGED');
        if(normalizeCode(fresh.canonical_source_code)!==canonicalCode)throw new Error('CANONICAL_SOURCE_CHANGED');
        const occupiedNow=(await db.query('SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1',[item.target])).rows[0];
        if(!occupiedNow)throw new Error('DONALDSON_COLLISION_DISAPPEARED');
        const targetNow=(await db.query('SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1',[target])).rows[0];
        if(targetNow)throw new Error('FLEETGUARD_TARGET_OCCUPIED');

        const u=await db.query(`
          UPDATE public.elimfilters_catalog
          SET sku=$1,
              codigo_base=$2,
              competitor_codes=$3::jsonb,
              enrichment_data=$4::jsonb
          WHERE sku=$5
          RETURNING sku,codigo_base
        `,[
          target,
          fg.code,
          JSON.stringify(nextCompetitor),
          JSON.stringify(nextEnrichment),
          r.sku
        ]);
        if(u.rowCount!==1)throw new Error('CATALOG_UPDATE_COUNT_CHANGED');

        const derived=await updateDerivedRefs(db,r.sku,target);

        if(await tableExists(db,'public.crossref_resolved_cache')){
          await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[r.sku,target]]);
        }
        try{await db.query('SELECT public.refresh_crossref_cache_sku($1)',[target]);}catch(_){}

        const after=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1',[target])).rows[0];
        if(!approvedHdCollisionFallbackReady(after,'FLEETGUARD'))throw new Error('POST_WRITE_POLICY_NOT_READY');

        report.applied.push({...candidate,derived});
        await db.query('RELEASE SAVEPOINT one_fallback');
      }catch(e){
        await db.query('ROLLBACK TO SAVEPOINT one_fallback');
        await db.query('RELEASE SAVEPOINT one_fallback');
        report.blocked.push({...candidate,reason:e.message,code:e.code||null});
      }
    }

    report.summary={
      ready_count:report.ready.length,
      applied_count:report.applied.length,
      blocked_count:report.blocked.length
    };

    if(EXECUTE){
      if(report.blocked.length)throw new Error('RUN224_BLOCKED_CANDIDATES:'+JSON.stringify(report.blocked));
      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }

    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK');}catch{}
    throw e;
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
