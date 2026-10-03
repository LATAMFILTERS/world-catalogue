'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EL30003';
const TARGET='EL83852';
const MANN='WP10003';
const FLEETGUARD='LF3852';
const OEM='MD086786';
const EXPECTED_ROWS=2;
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,fleetguard:FLEETGUARD,oem:OEM,pre:{},mutations:{target_governance_updated:0,parent_inserted:0,crossref_inserted:0,applications_reowned:0},post:{}};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const products=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,height_mm,outer_diameter_mm,thread_size,
             canonical_source_brand,canonical_source_code,canonical_source_status,
             oem_codes,competitor_codes,enrichment_data,catalog_active
      FROM public.elimfilters_catalog
      WHERE sku=ANY($1::text[])
      ORDER BY sku FOR UPDATE
    `,[[SOURCE,TARGET]]);
    if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING');
    const by=new Map(products.rows.map(r=>[r.sku,r]));
    const source=by.get(SOURCE),target=by.get(TARGET);

    if(source.filter_type!=='oil'||source.duty!=='LIGHT_DUTY'||norm(source.codigo_base)!=='0003') throw new Error('SOURCE_IDENTITY_CHANGED');
    if(Math.abs(Number(source.height_mm)-82)>0.5||Math.abs(Number(source.outer_diameter_mm)-102)>0.5||norm(source.thread_size)!=='M26X15MM') throw new Error('SOURCE_GEOMETRY_CHANGED');

    if(target.filter_type!=='oil'||target.duty!=='HEAVY_DUTY'||norm(target.codigo_base)!==norm(FLEETGUARD)||norm(target.canonical_source_code)!==norm(FLEETGUARD)||target.catalog_active!==true) {
      throw new Error(`TARGET_BASELINE_CHANGED ${JSON.stringify({codigo_base:target.codigo_base,duty:target.duty,canonical_source_code:target.canonical_source_code})}`);
    }

    const targetOem=(Array.isArray(target.oem_codes)?target.oem_codes:[]).filter(x=>norm(x&&x.code)===norm(OEM));
    if(targetOem.length!==1) throw new Error(`TARGET_OEM_EVIDENCE_CHANGED_${targetOem.length}`);

    const donaldsonByOem=await db.query(`
      SELECT sku,codigo_base
      FROM public.elimfilters_catalog c
      WHERE duty='HEAVY_DUTY'
        AND upper(coalesce(canonical_source_brand,''))='DONALDSON'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes)='array' THEN c.oem_codes ELSE '[]'::jsonb END) e
          WHERE ld_catalog.norm_part(e->>'code')=ld_catalog.norm_part($1)
        )
    `,[OEM]);
    if(donaldsonByOem.rowCount!==0) throw new Error(`DONALDSON_OEM_MATCH_NOW_EXISTS ${JSON.stringify(donaldsonByOem.rows)}`);

    const sourceRows=await db.query(`
      SELECT id
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      ORDER BY id
    `,[SOURCE,MANN]);
    if(sourceRows.rowCount!==EXPECTED_ROWS) throw new Error(`WP10003 rows ${sourceRows.rowCount} != ${EXPECTED_ROWS}`);

    const sourceOther=await db.query(`
      SELECT source_sku,count(*)::int n
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)
      GROUP BY source_sku
    `,[SOURCE,MANN]);
    if(sourceOther.rowCount!==0) throw new Error(`SOURCE_HAS_OTHER_APPLICATIONS ${JSON.stringify(sourceOther.rows)}`);

    const targetParent=await db.query(`
      SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
    `,[TARGET,FLEETGUARD]);
    if(targetParent.rowCount!==0) throw new Error(`TARGET_PARENT_OR_LF3852_ALREADY_OWNED ${JSON.stringify(targetParent.rows)}`);

    const targetApps=await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`,[TARGET]);
    if(targetApps.rows[0].n!==0) throw new Error(`TARGET_APPLICATIONS_CHANGED_${targetApps.rows[0].n}`);

    const mannClaim=await db.query(`
      SELECT elimfilters_sku,competitor_brand
      FROM ld_catalog.ld_competitor_cross_references
      WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='MANNFILTER'
        AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)
    `,[MANN]);
    if(mannClaim.rowCount!==0) throw new Error(`MANN_WP10003_ALREADY_CLAIMED ${JSON.stringify(mannClaim.rows)}`);

    report.pre={
      source_rows:sourceRows.rowCount,
      source_other_application_groups:sourceOther.rowCount,
      target_application_rows:targetApps.rows[0].n,
      target_oem_match:targetOem[0],
      donaldson_oem_matches:donaldsonByOem.rowCount,
      mann_claimants:mannClaim.rowCount,
      target_parent_absent:true
    };

    if(EXECUTE){
      const gov={
        ...(target.enrichment_data&&target.enrichment_data.codigo_base_governance||{}),
        policy_version:'2026-08-19-v3.1',
        state:'CANONICAL_VERIFIED_FALLBACK',
        governance_state:'CANONICAL_VERIFIED_FALLBACK',
        required_authority:'DONALDSON_THEN_FALLBACK',
        approved_manufacturer:'FLEETGUARD',
        approved_codigo_base:FLEETGUARD,
        current_codigo_base:FLEETGUARD,
        approved_source_column:'COMPETITOR_CODES',
        primary_manufacturer_verified:false,
        donaldson_absence_verified:true,
        fallback_manufacturer_verified:true,
        fallback_commercial_code_verified:true,
        verification_method:'DONALDSON_REPO_OEM_ABSENCE__FLEETGUARD_LF3852_OEM_MD086786',
        evidence_authority:'FLEETGUARD_OEM_MATCH',
        evidence_oem:OEM,
        verified_at:new Date().toISOString(),
        evidence_note:'run_150: Mitsubishi Fuso WP10003 uses OEM MD086786; governed Donaldson catalog has no HD OEM match; existing Fleetguard LF3852 target contains MD086786.'
      };

      const updated=await db.query(`
        UPDATE public.elimfilters_catalog
        SET canonical_source_brand='FLEETGUARD',
            canonical_source_code=$2::text,
            canonical_source_status='VERIFIED',
            canonical_verified_at=now(),
            duty_source_brand='FLEETGUARD',
            duty_validation_status='VERIFIED',
            duty_verified_at=now(),
            enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{codigo_base_governance}',$3::jsonb,true)
        WHERE sku=$1
          AND duty='HEAVY_DUTY'
          AND ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2)
        RETURNING sku
      `,[TARGET,FLEETGUARD,JSON.stringify(gov)]);
      if(updated.rowCount!==1) throw new Error('TARGET_GOVERNANCE_UPDATE_FAILED');
      report.mutations.target_governance_updated=1;

      const parent=await db.query(`
        INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at)
        VALUES($1::varchar,$2::varchar,'Oil Filter',now(),now())
        RETURNING elimfilters_sku
      `,[TARGET,FLEETGUARD]);
      if(parent.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
      report.mutations.parent_inserted=1;

      const xref=await db.query(`
        INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
        VALUES($1::varchar,$2::varchar,'MANN-FILTER',$3::varchar,now())
        RETURNING id
      `,[TARGET,FLEETGUARD,MANN]);
      if(xref.rowCount!==1) throw new Error('MANN_WP10003_CROSSREF_INSERT_FAILED');
      report.mutations.crossref_inserted=1;

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku=$1
        WHERE elimfilters_sku=$2
          AND id=ANY($3::bigint[])
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)
      `,[TARGET,SOURCE,sourceRows.rows.map(r=>r.id),MANN]);
      if(moved.rowCount!==EXPECTED_ROWS) throw new Error(`WP10003 moved ${moved.rowCount} != ${EXPECTED_ROWS}`);
      report.mutations.applications_reowned=moved.rowCount;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1 AND canonical_source_brand='FLEETGUARD' AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($3) AND canonical_source_status='VERIFIED' AND coalesce((enrichment_data->'codigo_base_governance'->>'donaldson_absence_verified')::boolean,false)=true) target_verified,
        (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_parent,
        (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1 AND upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='MANNFILTER' AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($4)) target_mann_xref,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
    `,[TARGET,SOURCE,FLEETGUARD,MANN]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.target_verified!==1||report.post.target_parent!==1||report.post.target_mann_xref!==1||report.post.source_rows!==0||report.post.target_rows!==EXPECTED_ROWS) {
        throw new Error(`POSTCHECK_FAILED ${JSON.stringify(report.post)}`);
      }
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{await db.end();}
}
if(require.main===module) main();
module.exports={SOURCE,TARGET,MANN,FLEETGUARD,OEM,EXPECTED_ROWS};
