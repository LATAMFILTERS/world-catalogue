'use strict';
/**
 * EF98960: scoped reconciliation of validated WIX WF10624 evidence.
 * Dry-run by default; --execute commits only if existing governance + V7 agree.
 * Does not alter SKU identity, applications, global resolver or certification ledger.
 */
require('dotenv').config();
const {Client}=require('pg');
const {deriveCodigoBaseGovernance}=require('../../lib/catalog-codigo-base-governance');
const {normalizeCode,normalizeManufacturer}=require('../../lib/catalog-codigo-base-policy');
const APPLY=process.argv.includes('--execute'), SKU='EF98960';
const WIX_URL='https://www.wixfilters.com/en-ap/catalog/results/product.html/wf10624_wix.html';
const matches=(r,brand,code)=>normalizeManufacturer(r.manufacturer)===normalizeManufacturer(brand)&&normalizeCode(r.code)===normalizeCode(code);
const fail=s=>{throw new Error('BLOCKED: '+s)};
(async()=>{
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url)fail('DB URL missing');
 const local=url.includes('@127.0.0.1:')||url.includes('@localhost:')||url.includes('@127.0.0.1/')||url.includes('@localhost/');
 const db=new Client({connectionString:url,ssl:local?false:{rejectUnauthorized:false}});
 await db.connect();
 try{
  await db.query('BEGIN');
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',[SKU]);
  const found=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[SKU]);
  if(found.rowCount!==1)fail('EF98960 record missing');
  const row=found.rows[0],g=row.enrichment_data?.codigo_base_governance||{};
  if(row.codigo_base!=='3608960'||row.duty!=='HEAVY_DUTY')fail('Unexpected identity/duty');
  if(g.donaldson_absence_verified!==true||g.fleetguard_absence_verified!==true||
    g.fallback_manufacturer_verified!==true||g.fallback_commercial_code_verified!==true||
    normalizeCode(g.approved_codigo_base)!=='3608960'||
    normalizeManufacturer(g.approved_manufacturer)!=='CATERPILLAR'||
    g.approved_source_column!=='OEM_CODES')fail('Historical OEM authority incomplete');
  const oldComp=Array.isArray(row.competitor_codes)?row.competitor_codes:[];
  const oldOem=Array.isArray(row.oem_codes)?row.oem_codes:[];
  if(oldComp.filter(r=>matches(r,'DONALDSON','P506132')).length!==1)fail('Unverified P506132 count unexpected');
  const other=await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1
    AND (upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=ANY($2::text[])
      OR competitor_codes::text ILIKE '%WF10624%') LIMIT 20`,
    [SKU,['3608960','WF10624']]);
  if(other.rowCount)fail('Other SKU already owns source: '+other.rows.map(x=>x.sku).join(','));
  const comp=oldComp.filter(r=>!matches(r,'DONALDSON','P506132'));
  if(!comp.some(r=>matches(r,'WIX','WF10624')))
    comp.push({manufacturer:'WIX',code:'WF10624',classification:'AFTERMARKET',
      classification_source:'WIX_OFFICIAL_WF10624',source_url:WIX_URL});
  const oem=[...oldOem];
  if(!oem.some(r=>matches(r,'CATERPILLAR','360-8960')))
    oem.push({manufacturer:'CATERPILLAR',code:'360-8960',classification:'OEM',
      classification_source:'WIX_OFFICIAL_WF10624',source_url:WIX_URL});
  const enrichment={...(row.enrichment_data||{})};
  const baseGov={...g,primary_manufacturer_verified:true,
    reconciliation_source_url:WIX_URL,
    reconciliation_note:'Retain CAT OEM base; WIX WF10624 is documented. Donaldson P506132 was unverified, excluded from active codes but retained in historical governance.',
    removed_unverified_candidate:'DONALDSON P506132'};
  const derived=deriveCodigoBaseGovernance({...row,competitor_codes:comp,oem_codes:oem,
    enrichment_data:{...enrichment,codigo_base_governance:baseGov}});
  if(derived.state!=='CANONICAL_VERIFIED'||derived.required_authority!=='VERIFIED_OEM_FALLBACK')
    fail('Governance policy refuses OEM fallback: '+JSON.stringify(derived));
  enrichment.codigo_base_governance={...baseGov,...derived,state:'CANONICAL_VERIFIED',
    governance_state:'CANONICAL_VERIFIED'};
  const oldApplications=JSON.stringify([row.equipment_applications,row.vehicle_applications]);
  await db.query(`UPDATE public.elimfilters_catalog
    SET competitor_codes=$2::jsonb,oem_codes=$3::jsonb,enrichment_data=$4::jsonb
    WHERE sku=$1`,[SKU,JSON.stringify(comp),JSON.stringify(oem),JSON.stringify(enrichment)]);
  const after=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1',[SKU])).rows[0];
  if(JSON.stringify([after.equipment_applications,after.vehicle_applications])!==oldApplications)
    fail('Applications changed');
  const v7=await db.query(`SELECT DISTINCT sku FROM public.v_api_resolver_v7
     WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`,[row.codigo_base]);
  if(v7.rowCount!==1||v7.rows[0].sku!==SKU)fail('Resolver V7 not uniquely aligned: '+JSON.stringify(v7.rows));
  const ledger=(await db.query('SELECT certification_state FROM public.catalog_sku_certification WHERE sku=$1',[SKU])).rows[0];
  if(!ledger)fail('Certification ledger missing');
  const report={sku:SKU,mode:APPLY?'EXECUTE':'DRY_RUN',wix:'WF10624',
    removed_candidate:'DONALDSON P506132',governance:derived.state,
    resolver_v7:v7.rows,certification:ledger.certification_state,
    certification_updated:false,applications_unchanged:true};
  await db.query(APPLY?'COMMIT':'ROLLBACK');
  console.log(JSON.stringify({...report,transaction:APPLY?'COMMIT':'ROLLBACK'},null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch(_){} console.error(e.message);process.exitCode=1}
 finally{await db.end()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
