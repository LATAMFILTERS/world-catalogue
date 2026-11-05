'use strict';
/**
 * ET90010 controlled registration, never a blanket catalog importer.
 * Default: SERIALIZABLE transaction rolled back.
 * --execute: insert inactive candidate ONLY, never certify or publish.
 */
require('dotenv').config();
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const crypto = require('crypto');

const SKU='ET90010';
const ELEMENT='ES90674';
const EXECUTE=process.argv.includes('--execute');
const SOURCE='https://github.com/LATAMFILTERS/world-catalogue/pull/1221';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const now=new Date().toISOString();
const jFields=new Set(['oem_codes','competitor_codes','equipment_applications','vehicle_applications','alternative_products','brand_crossrefs','alternatives','specs','enrichment_data','canonical_evidence','duty_evidence']);
function makeRow(){
  const identity={identity_type:'ELIMFILTERS_OEM_PRODUCT',internal_product_identity_verified:true,primary_manufacturer_verified:true,
    approved_manufacturer:'ELIMFILTERS',approved_codigo_base:SKU,current_codigo_base:SKU,approved_source_column:'INTERNAL_PRODUCT_IDENTITY',
    policy_version:'2026-10-14-v4.3',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
    required_authority:'VERIFIED_ELIMFILTERS_OEM_PRODUCT',evidence_url:SOURCE,
    verification_method:'ELIMFILTERS_OPERATOR_BRANDED_PRODUCT_DEFINITION',verified_at:now};
  return {
    sku:SKU,codigo_base:SKU,catalog_active:false,filter_type:'fuel',sub_type:'Assembly',
    technology:'TURBOCORE™',duty:'HEAVY_DUTY',
    name:'ELIMFILTERS® ET90010 Bulk Fuel Filter / Water Separator Assembly',
    description:'Complete fuel filtration and water collection assembly for bulk storage tanks and transfer pumps. Aluminium head, transparent amber drainable bowl, replaceable ELIMFILTERS ES90674 element. Verify installation and fluid compatibility before operation.',
    installation_type:'Bulk fuel storage / dispensing assembly',
    thread_size:'1 NPT',height_mm:248.4,outer_diameter_mm:105.6,
    gasket_od_mm:null,gasket_id_mm:null,micron_rating:null,nominal_efficiency:null,filter_media:null,
    // OEM CODE is operator-assigned product reference. It is NOT our canonical codigo_base.
    oem_codes:[{manufacturer:'BALDWIN',code:'B10AL',classification:'OEM',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'OPERATOR_ASSIGNED'}],
    competitor_codes:[
      {manufacturer:'WIX',code:'24380',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'REVIEW'},
      {manufacturer:'WIX',code:'24389',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'PHYSICAL_VERIFICATION_REQUIRED'},
      {manufacturer:'HASTINGS',code:'KF10AL',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'PHYSICAL_VERIFICATION_REQUIRED'}
    ],
    equipment_applications:[],vehicle_applications:[],alternative_products:[],brand_crossrefs:{},alternatives:[],
    specs:{
      product_scope:'COMPLETE_ASSEMBLY',system:'BULK_FUEL_STORAGE_AND_DISPENSING',
      service_element_sku:ELEMENT,service_element_technology:'HYDROCORE™',
      head_material:'Aluminium',bowl_material:'Transparent amber polymer',drain:'Manual',
      input_port:'1 in NPT',output_port:'1 in NPT',
      max_pressure_reference_psi:150,max_pump_flow_reference_gpm:25,
      gravity_flow_reference_gpm:10,gravity_head_reference_inches:30,
      rated_performance_approved_for_elimfilters:false,
      nominal_micron_reference_only:4,absolute_micron_reference_only:15,
      fuel_compatibility_verified:false,
      fuel_candidates:['diesel','gasoline','biodiesel','gasohol'],
      assembly_element_relation:'SERVICE_ELEMENT',
      no_vehicle_fitments_asserted:true,
      identity_note:'Whole assembly references only; FF246 / PF10 / P550674 belong exclusively to ES90674.'
    },
    enrichment_data:{
      codigo_base_governance:identity,
      product_identity:{manufacturer:'ELIMFILTERS',canonical_source_brand:'ELIMFILTERS',canonical_source_part:SKU,
        product_type:'BULK_FUEL_FILTER_ASSEMBLY',service_element_sku:ELEMENT},
      identity_separation:{assembly_sku:SKU,service_element_sku:ELEMENT,prohibited_element_only_references_on_assembly:['FF246','PF10','P550674','24043']},
      publication_review:{status:'NOT_APPROVED',technical_performance:'PENDING',image_upload:'PENDING',technology_scope:'PENDING'}
    },
    canonical_source_brand:'ELIMFILTERS',canonical_source_code:SKU,canonical_source_url:SOURCE,
    canonical_source_status:'VERIFIED',canonical_verified_at:now,
    canonical_evidence:{authority:'ELIMFILTERS_INTERNAL_PRODUCT_IDENTITY',product_scope:'COMPLETE_ASSEMBLY',source_url:SOURCE,evidence_hash:hash({sku:SKU,element:ELEMENT})},
    duty_source_brand:'ELIMFILTERS',duty_source_url:SOURCE,duty_validation_status:'PENDING',
    duty_verified_at:null,duty_evidence:{duty:'HEAVY_DUTY',source:'OPERATOR_CLASSIFICATION',product_scope:'COMPLETE_ASSEMBLY'}
  };
}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.SEARCH_DB_URL||process.env.DATABASE_URL;
  if(!url)throw Error('DATABASE_URL_MISSING — configure the existing local catalogue connection; no credentials are printed');
  const local=/@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db=new Client({connectionString:url,ssl:local?false:{rejectUnauthorized:false}});
  await db.connect();
  const log={mode:EXECUTE?'INSERT_INACTIVE':'DRY_RUN_ROLLBACK',sku:SKU,service_element:ELEMENT};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout='5s'");
    await db.query("SET LOCAL statement_timeout='45s'");
    const policy=(await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS v")).rows[0].v;
    if(!policy.includes('ELIMFILTERS_OEM_PRODUCT_AUTHORITY_V43'))throw Error('ELIMFILTERS_POLICY_AUTHORITY_NOT_INSTALLED');
    const clash=await db.query(
      "SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(sku,''),'[^A-Z0-9]','','g'))=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$1 FOR UPDATE",[SKU]);
    if(clash.rowCount)throw Error('ET90010_IDENTITY_COLLISION '+JSON.stringify(clash.rows));
    const service=await db.query("SELECT sku,codigo_base,sub_type,technology FROM public.elimfilters_catalog WHERE sku=$1",[ELEMENT]);
    if(service.rowCount!==1)throw Error('SERVICE_ELEMENT_NOT_FOUND');
    log.service_existing=service.rows[0];
    const row=makeRow();
    log.gateway=assertCanonicalWrite(row,{validateApplications:false});
    const evaluated=evaluateCodigoBase(row);
    if(!evaluated.valid||evaluated.authority!=='VERIFIED_ELIMFILTERS_OEM_PRODUCT')throw Error('CODIGO_BASE_POLICY_BLOCKED '+JSON.stringify(evaluated));
    log.policy=evaluated;
    const cols=Object.keys(row);
    const q=`INSERT INTO public.elimfilters_catalog (${cols.map(x=>'"'+x+'"').join(',')}) VALUES (${cols.map((x,i)=>'$'+(i+1)+(jFields.has(x)?'::jsonb':'')).join(',')}) RETURNING sku,codigo_base,filter_type,sub_type,technology,duty,catalog_active`;
    const values=cols.map(k=>jFields.has(k)?JSON.stringify(row[k]):row[k]);
    const inserted=await db.query(q,values);
    if(inserted.rowCount!==1||inserted.rows[0].catalog_active!==false)throw Error('INSERT_CHECK_FAILED');
    log.inserted=inserted.rows[0];
    const saved=await db.query("SELECT oem_codes,competitor_codes,specs->>'service_element_sku' AS service_element FROM public.elimfilters_catalog WHERE sku=$1",[SKU]);
    if(saved.rowCount!==1||saved.rows[0].service_element!==ELEMENT||JSON.stringify(saved.rows[0].competitor_codes).includes('FF246'))throw Error('CROSSREF_SCOPE_CHECK_FAILED');
    log.references=saved.rows[0];
    await db.query(EXECUTE?'COMMIT':'ROLLBACK');
    log.transaction=EXECUTE?'COMMITTED_INACTIVE_NOT_PUBLISHED':'ROLLED_BACK';
    console.log(JSON.stringify(log,null,2));
  }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e}finally{await db.end()}
}
if(require.main===module)main().catch(e=>{console.error('BLOCKED:',e.message);process.exitCode=1});
module.exports={makeRow,main};
