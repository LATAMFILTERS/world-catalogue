'use strict';
const { Pool } = require('pg');
const EXECUTE = process.argv.includes('--execute');
const SKU='EL30358', AUTH='CH10358';
const APPS=[
 ['LEXUS','CT200H','17-11','L4-1.8L'],['PONTIAC','VIBE','10-09','L4-1.8L'],
 ['SCION','IM','2016','L4-1.8L'],['SCION','XD','14-08','L4-1.8L'],
 ['TOYOTA','C-HR','22-18','L4-2.0L'],['TOYOTA','COROLLA','18-09','L4-1.8L'],
 ['TOYOTA','COROLLA IM','18-17','L4-1.8L'],['TOYOTA','MATRIX','14-09','L4-1.8L'],
 ['TOYOTA','PRIUS','20-10','L4-1.8L'],['TOYOTA','PRIUS PLUG-IN','15-12','L4-1.8L'],
 ['TOYOTA','PRIUS PRIME','20-17','L4-1.8L'],['TOYOTA','PRIUS V','18-12','L4-1.8L']
];
const OEM=[['General Motors','19185485'],['Toyota','04152-B1010'],['Toyota','04152-37010'],['Toyota','04152-YZZA6']];
const XREF=[['ACDelco','PF1768'],['Baldwin','P7454'],['Bosch','3313'],['Bosch','72240WS'],
 ['Champion','55064T'],['Champion','COC10358'],['Champion','CL10358'],['Hengst','E210HD228'],
 ['NAPA','7064'],['Purolator','L16311'],['Wix','57064'],['Wix','57064XP']];
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('CATALOG_DATABASE_URL missing');
 const u=new URL(url); if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const pool=new Pool({connectionString:url}); const c=await pool.connect(); const r={mode:EXECUTE?'execute':'dry-run',sku:SKU,authority:AUTH};
 try{ await c.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
 const pre=await c.query(`
  SELECT
   (SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1) public_sku,
   (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1) product_sku,
   (SELECT count(*)::int FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1) identity_sku,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1) apps_sku,
   (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1) xrefs_sku,
   (SELECT count(*)::int FROM public.v_api_resolver_v6 WHERE code='CH10358' AND sku='EL36006' AND status='RESOLVED_SINGLE') old_resolver,
   (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EL36006' AND upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)='CH10358') old_ld
 `,[SKU]);
 r.preconditions=pre.rows[0];
 if(Object.values(pre.rows[0]).slice(0,5).some(Number)) throw new Error('EL30358_ALREADY_EXISTS');
 if(Number(pre.rows[0].old_resolver)!==1||Number(pre.rows[0].old_ld)!==1) throw new Error('CH10358_OLD_AUTHORITY_NOT_EXACT');
 await c.query(`
  INSERT INTO public.elimfilters_catalog
   (sku,codigo_base,filter_type,technology,height_mm,outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
    filter_media,anti_drainback_valve,duty,sub_type,installation_type,canonical_source_brand,canonical_source_code,
    canonical_source_status,canonical_verified_at,duty_source_brand,duty_validation_status,duty_verified_at,
    description,enrichment_data,specs,brand_crossrefs,catalog_active)
  VALUES
   ($1::text,$2::text,'oil','SYNTRAX™',56.54,60.706,28.143,73.558,70.053,
    'Cellulose/Synthetic Blend','No','LIGHT_DUTY','Cartridge','Cartridge','FRAM',$2::text,
    'VERIFIED',now(),'FRAM','VERIFIED',now(),
    'Engine Oil Filter - Cartridge',
    jsonb_build_object('codigo_base_governance',jsonb_build_object(
      'origin_group','NON_EUROPEAN','approved_manufacturer','FRAM','approved_codigo_base',$2::text,
      'primary_manufacturer_verified',true,'governance_state','CANONICAL_VERIFIED',
      'policy_version','2026-08-29-regional-v3.2','evidence_note','FRAM CH10358 direct product/application evidence; internal FRAM LD evidence classified REAL_GAP_CREATE_SAFE.')),
    jsonb_build_object('height_in',2.226,'outer_diameter_in',2.390,'inner_diameter_in',1.108,'o_ring_od_in',2.896,'o_ring_id_in',2.758,'o_ring_thickness_in',0.138,'o_rings_included',true,'style','Cartridge'),
    jsonb_build_object('FRAM',jsonb_build_array('FD10358','FP10358BP','FE10358','FS10358','TG10358','XG10358')),true)
 `,[SKU,AUTH]);
 await c.query(`INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Oil Filter',now(),now())`,[SKU,AUTH]);
 const moved=await c.query(`
  DELETE FROM ld_catalog.ld_competitor_cross_references
  WHERE elimfilters_sku='EL36006'
    AND upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))='FRAM'
    AND ld_catalog.norm_part(competitor_part_number)='CH10358'
  RETURNING id`);
 if(moved.rowCount!==1) throw new Error('CH10358_OLD_LD_MOVE_COUNT_MISMATCH');
 await c.query(`INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
                 VALUES($1::varchar,$2::varchar,'FRAM',$2::varchar,now())`,[SKU,AUTH]);
 for(const [brand,part] of XREF){
   await c.query(`INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
                  SELECT $1::varchar,$2::varchar,$3::varchar,$4::varchar,now()
                  WHERE NOT EXISTS (SELECT 1 FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1::varchar AND upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))=upper(regexp_replace($3::text,'[^A-Z0-9]','','g')) AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($4::text))`,[SKU,AUTH,brand,part]);
 }
 for(const [brand,part] of OEM){
   await c.query(`INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at)
                  SELECT $1::varchar,$2::varchar,$3::varchar,$4::varchar,now()
                  WHERE NOT EXISTS (SELECT 1 FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=$1::varchar AND upper(regexp_replace(oem_brand,'[^A-Z0-9]','','g'))=upper(regexp_replace($3::text,'[^A-Z0-9]','','g')) AND ld_catalog.norm_part(oem_part_number)=ld_catalog.norm_part($4::text))`,[SKU,AUTH,brand,part]);
 }
 const specs=[['height','56.54','mm'],['outer_diameter','60.706','mm'],['inner_diameter','28.143','mm'],['o_ring_od','73.558','mm'],['o_ring_id','70.053','mm'],['o_ring_thickness','3.505','mm'],['style','Cartridge',null],['anti_drainback_valve','No',null],['bypass_relief_valve','No',null]];
 for(const [k,v,u2] of specs) await c.query(`INSERT INTO ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit,created_at) VALUES($1,$2,$3,$4,$5,now())`,[SKU,AUTH,k,v,u2]);
 for(const [make,model,year,engine] of APPS){
   await c.query(`INSERT INTO ld_catalog.ld_vehicle_applications(elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin,created_at)
                  VALUES($1,$2,$3,$4,NULL,$5,$6,NULL,NULL,NULL,'FRAM_LD_MULTI_REGION',now())`,[SKU,AUTH,make,model,year,engine]);
 }
 await c.query(`
  INSERT INTO ld_catalog.ld_canonical_product_identity
   (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at)
  VALUES($1,'NON_EUROPEAN','FRAM',$2,'oil','ACTIVE','MIGRATION_138_CH10358_REAL_GAP_CREATE_SAFE',now(),now())`,[SKU,AUTH]);
 await c.query(`
  INSERT INTO ld_catalog.ld_production_readiness
   (elimfilters_sku,source_sku,segment,has_oem,has_competitor,has_applications,has_specifications,production_tier,updated_at)
  VALUES($1,$2,'Oil Filter',true,true,true,true,'READY',now())
  ON CONFLICT (elimfilters_sku) DO UPDATE SET
   source_sku=excluded.source_sku,segment=excluded.segment,has_oem=true,has_competitor=true,
   has_applications=true,has_specifications=true,production_tier='READY',updated_at=now()`,[SKU,AUTH]);
 const post=await c.query(`
  SELECT
   (SELECT count(*)::int FROM public.v_api_resolver_v6 WHERE code='CH10358' AND sku=$1 AND manufacturer='FRAM' AND status='RESOLVED_CANONICAL') canonical_resolver,
   (SELECT count(*)::int FROM public.v_api_resolver_v6 WHERE code='CH10358' AND sku<>$1) other_resolvers,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND source_sku='CH10358') apps,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku='EL36006' AND source_sku='CH10358') old_apps,
   (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EL36006' AND ld_catalog.norm_part(competitor_part_number)='CH10358') old_ld,
   (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1) xrefs,
   (SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=$1) oems,
   (SELECT count(*)::int FROM ld_catalog.ld_product_specifications WHERE elimfilters_sku=$1) specs
 `,[SKU]);
 r.post=post.rows[0];
 if(Number(r.post.canonical_resolver)!==1||Number(r.post.other_resolvers)!==0) throw new Error('CH10358_RESOLVER_NOT_UNIQUE_CANONICAL');
 if(Number(r.post.apps)!==12||Number(r.post.old_apps)!==0||Number(r.post.old_ld)!==0) throw new Error('CH10358_APPLICATION_OR_OWNERSHIP_POSTCHECK_FAILED');
 if(Number(r.post.xrefs)<13||Number(r.post.oems)!==4||Number(r.post.specs)!==9) throw new Error('EL30358_EVIDENCE_POSTCHECK_FAILED');
 if(EXECUTE){await c.query('COMMIT');r.transaction='COMMIT';}else{await c.query('ROLLBACK');r.transaction='ROLLBACK';}
 console.log(JSON.stringify(r,null,2));
 }catch(e){try{await c.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}
 finally{c.release();await pool.end()}
}
if(require.main===module) main();
module.exports={APPS,OEM,XREF};
