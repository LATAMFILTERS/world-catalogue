'use strict';
/**
 * One-SKU publication gate for ET90010. Existing catalog, no duplicate SKU.
 * Default: transaction ROLLBACK. --execute COMMIT only when every check passes.
 * Technical performance remains unverified; certification here refers to canonical catalog identity,
 * cross-reference consistency and resolver uniqueness, not laboratory performance.
 */
require('dotenv').config();
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const EXECUTE=process.argv.includes('--execute');
const SKU='ET90010', ELEMENT='ES90674';
const OFFICIAL='https://www.baldwinfilters.com/content/dam/Parker-com/Literature/EMAM/EMAM_Baldwin_Fuel_Storage_Filters-Guide_Form587.pdf';
const wanted=[
 {manufacturer:'BALDWIN',code:'B10AL',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'VERIFIED_MANUFACTURER',source_url:OFFICIAL},
 {manufacturer:'WIX',code:'24380',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'CONFIRMED_REFERENCE',source_url:OFFICIAL,
  scope_note:'Reference for compatible housing, not proof that replacement element is included'}
];
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url)throw Error('CATALOG_DATABASE_URL_MISSING');
 const db=new Client({connectionString:url,ssl:/@(localhost|127\.0\.0\.1)[:/]/i.test(url)?false:{rejectUnauthorized:false}});
 await db.connect();
 const report={sku:SKU,mode:EXECUTE?'EXECUTE':'DRY_RUN',source:OFFICIAL};
 try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  await db.query("SET LOCAL lock_timeout='5s'");
  await db.query("SET LOCAL statement_timeout='60s'");
  const q=await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",[SKU]);
  if(q.rowCount!==1)throw Error('SKU_MISSING_OR_DUPLICATED');
  const c=q.rows[0];
  if(c.catalog_active!==false)throw Error('EXPECTED_INACTIVE_ET90010');
  if(c.codigo_base!==SKU||c.sub_type!=='Assembly'||c.duty!=='HEAVY_DUTY'||c.canonical_source_status!=='VERIFIED')throw Error('IDENTITY_MISMATCH');
  if(c.canonical_source_brand!=='ELIMFILTERS'||c.canonical_source_code!==SKU)throw Error('CANONICAL_IDENTITY_MISMATCH');
  if(c.specs?.service_element_sku!==ELEMENT)throw Error('SERVICE_ELEMENT_MISMATCH');
  const es=await db.query("SELECT sku,codigo_base,catalog_active FROM public.elimfilters_catalog WHERE sku=$1",[ELEMENT]);
  if(es.rowCount!==1||es.rows[0].catalog_active!==true)throw Error('SERVICE_ELEMENT_NOT_ACTIVE');
  const before=await db.query("SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE sku=$1 OR codigo_base=$1",[SKU]);
  if(before.rows[0].n!==1)throw Error('SKU_BASE_COLLISION');
  const refs=[...new Set([...(c.oem_codes||[]),...(c.competitor_codes||[])].map(x=>String(x.code||'')))];
  if(!refs.includes('B10AL'))throw Error('BALDWIN_REFERENCE_MISSING');
  report.references_removed_from_publication=refs.filter(x=>!wanted.some(w=>w.code===x));
  const updated={...c,oem_codes:[],competitor_codes:wanted,catalog_active:true};
  report.gateway=assertCanonicalWrite(updated,{validateApplications:false});
  report.codigo_base=evaluateCodigoBase(updated);
  if(!report.codigo_base.valid||report.codigo_base.authority!=='VERIFIED_ELIMFILTERS_OEM_PRODUCT')throw Error('GOVERNANCE_REJECTED');
  await db.query(`UPDATE public.elimfilters_catalog SET oem_codes='[]'::jsonb,competitor_codes=$2::jsonb,catalog_active=true,
      enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{publication_review}',
         coalesce(enrichment_data->'publication_review','{}'::jsonb)||$3::jsonb,true)
      WHERE sku=$1`,[SKU,JSON.stringify(wanted),JSON.stringify({status:'CATALOG_IDENTITY_ONLY',manufacturer_assembly_reference:OFFICIAL,
        technical_performance:'UNVERIFIED',fuel_compatibility:'UNVERIFIED',photo_source:'Cloudflare R2 public URL'})]);
  await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SKU]);
  const evidence=(await db.query(`
   SELECT
   (SELECT count(DISTINCT sku)::int FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$1) AS base_owner_count,
   (SELECT count(DISTINCT sku)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)) AS resolver_owners,
   (SELECT min(sku) FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)) AS resolver_owner,
   (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) AS exact_conflicts,
   (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) AS classification_conflicts,
   (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) AS quarantined,
   (SELECT count(DISTINCT sku)::int FROM public.crossref_resolved_cache WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('B10AL')) AS b10al_owners,
   (SELECT min(sku) FROM public.crossref_resolved_cache WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('B10AL')) AS b10al_owner
  `,[SKU])).rows[0];
  report.evidence=evidence;
  if(evidence.base_owner_count!==1||evidence.resolver_owners!==1||evidence.resolver_owner!==SKU||
     evidence.exact_conflicts!==0||evidence.classification_conflicts!==0||evidence.quarantined!==0||
     evidence.b10al_owners!==1||evidence.b10al_owner!==SKU)throw Error('CERTIFICATION_CONFLICT '+JSON.stringify(evidence));
  const pre=await db.query("SELECT sku,certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku=$1 FOR UPDATE",[SKU]);
  if(pre.rowCount&&pre.rows[0].certification_state!=='CERTIFIED')throw Error('EXISTING_LEDGER_HOLD '+JSON.stringify(pre.rows));
  await db.query(`INSERT INTO public.catalog_sku_certification AS t
      (sku,duty,filter_type,codigo_base,certification_state,policy_version,
       canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
       base_code_unique,resolver_unique,exact_reference_conflict_free,
       classification_conflict_free,quarantine_free,application_domain_consistent,
       blocker_count,blockers,evidence,certified_at,audited_at)
      VALUES ($1,'HEAVY_DUTY','fuel',$1,'CERTIFIED','2026-11-05-et90010-catalog-identity-v1',
       true,true,true,true,true,true,true,true,true,0,ARRAY[]::text[],$2::jsonb,now(),now())
      ON CONFLICT (sku) DO NOTHING`,[SKU,JSON.stringify({...evidence,scope:'CATALOG_IDENTITY_ONLY',laboratory_performance_verified:false,
        service_element_sku:ELEMENT,assembly_references:wanted.map(w=>w.code)})]);
  const post=await db.query(`SELECT c.sku,c.catalog_active,s.certification_state,s.blocker_count
     FROM public.elimfilters_catalog c JOIN public.catalog_sku_certification s ON s.sku=c.sku
     WHERE c.sku=$1`,[SKU]);
  if(post.rowCount!==1||post.rows[0].catalog_active!==true||post.rows[0].certification_state!=='CERTIFIED'||post.rows[0].blocker_count!==0)throw Error('POSTCHECK_FAILED');
  report.postcheck=post.rows[0];
  await db.query(EXECUTE?'COMMIT':'ROLLBACK');
  report.transaction=EXECUTE?'COMMITTED':'ROLLED_BACK';
  console.log(JSON.stringify(report,null,2));
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}
}
if(require.main===module)main().catch(e=>{console.error('BLOCKED:',e.message);process.exitCode=1;});
module.exports={main};
