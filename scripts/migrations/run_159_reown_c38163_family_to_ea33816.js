'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const TARGET='EA33816';
const CURRENT='C38163/1';
const PREDECESSOR='C38163/2';
const EXPECTED_CURRENT=5;
const EXPECTED_PREDECESSOR=7;
const CURRENT_SOURCE='EA31631';
const PREDECESSOR_SOURCE='EA31632';
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c38163/1_mann-filter.html';
const MANN_OLD_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c38163/2_mann-filter.html';

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',target:TARGET,current:CURRENT,predecessor:PREDECESSOR,pre:{},mutations:{},post:{}};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const collisions=await db.query(
      "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku",
      [['EA31631','EA38163']]
    );
    const c=new Map(collisions.rows.map(r=>[r.sku,r]));
    if(!c.get('EA31631')||!c.get('EA38163')) throw new Error('COLLISION_BASELINE_MISSING');
    if(c.get('EA31631').codigo_base!=='1631'||c.get('EA38163').codigo_base!=='8163'){
      throw new Error('COLLISION_WINDOWS_CHANGED '+JSON.stringify(collisions.rows));
    }
    const targetConflict=await db.query(
      "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2)",
      [TARGET,CURRENT]
    );
    if(targetConflict.rowCount) throw new Error('TARGET_CONFLICT '+JSON.stringify(targetConflict.rows));

    const parentConflict=await db.query(
      "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
      [TARGET,CURRENT]
    );
    if(parentConflict.rowCount) throw new Error('PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));

    const curRows=await db.query(
      "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
      [CURRENT_SOURCE,CURRENT]
    );
    const oldRows=await db.query(
      "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
      [PREDECESSOR_SOURCE,PREDECESSOR]
    );
    if(curRows.rowCount!==EXPECTED_CURRENT) throw new Error(`CURRENT_ROWS_${curRows.rowCount}_EXPECTED_${EXPECTED_CURRENT}`);
    if(oldRows.rowCount!==EXPECTED_PREDECESSOR) throw new Error(`PREDECESSOR_ROWS_${oldRows.rowCount}_EXPECTED_${EXPECTED_PREDECESSOR}`);
    const gov={
      policy_version:'2026-10-03-v4.1',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'EUROPEAN',
      required_authority:'MANN_FILTER_REGIONAL_CANONICAL',
      primary_manufacturer_verified:true,
      approved_manufacturer:'MANN-FILTER',
      approved_codigo_base:CURRENT,
      current_codigo_base:CURRENT,
      approved_source_column:'CANONICAL_POLICY',
      supersedes:[PREDECESSOR],
      sku_collision_resolution:{
        normalized_digits:'381631',
        attempted_windows:[
          {suffix:'1631',sku:'EA31631',occupied_by:'C15163/1 family'},
          {suffix:'8163',sku:'EA38163',occupied_by:'8163'},
          {suffix:'3816',sku:TARGET,status:'FREE'}
        ]
      },
      verification_method:'MANN_OFFICIAL_SUCCESSOR',
      evidence_url:MANN_URL,
      predecessor_evidence_url:MANN_OLD_URL,
      evidence_note:'MANN-FILTER C38163/2 is officially replaced by C38163/1. Both are 380 x 171 x 58/50 mm air filters. C38163/1 becomes the canonical identity; C38163/2 remains a predecessor alias.'
    };
    const candidate={
      sku:TARGET,codigo_base:CURRENT,duty:'LIGHT_DUTY',filter_type:'air',technology:'MACROCORE™',
      canonical_source_brand:'MANN-FILTER',canonical_source_code:CURRENT,
      oem_codes:[],competitor_codes:[],
      enrichment_data:{codigo_base_governance:gov}
    };
    report.pre.gateway=assertCanonicalWrite(candidate);
    report.pre.current_rows=curRows.rowCount;
    report.pre.predecessor_rows=oldRows.rowCount;
    report.pre.collision_windows=collisions.rows;
    const product=await db.query(`
      INSERT INTO public.elimfilters_catalog(
        sku,codigo_base,name,description,duty,filter_type,technology,installation_type,
        height_mm,outer_diameter_mm,gasket_od_mm,
        canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,
        duty_source_brand,duty_validation_status,duty_verified_at,
        oem_codes,competitor_codes,vehicle_applications,equipment_applications,
        catalog_active,enrichment_data
      ) VALUES(
        $1,$2::text,'ELIMFILTERS Air Filter C38163/1',
        'ELIMFILTERS® light-duty air filter for MANN-FILTER C38163/1 and predecessor C38163/2 applications. MACROCORE™.',
        'LIGHT_DUTY','air','MACROCORE™','Panel',
        50,380,171,
        'MANN-FILTER',$2::text,$3,'VERIFIED',now(),
        'MANN-FILTER','VERIFIED',now(),
        '[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,
        true,$4::jsonb
      ) RETURNING sku
    `,[TARGET,CURRENT,MANN_URL,JSON.stringify({codigo_base_governance:gov})]);
    if(product.rowCount!==1) throw new Error('PRODUCT_INSERT_FAILED');
    report.mutations.product_inserted=1;

    const parent=await db.query(
      "INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",
      [TARGET,CURRENT]
    );
    if(parent.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
    report.mutations.parent_inserted=1;
    const identity=await db.query(
      "INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_159_C38163_SUCCESSOR',now(),now()) RETURNING elimfilters_sku",
      [TARGET,CURRENT]
    );
    if(identity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
    report.mutations.identity_inserted=1;

    const alias=await db.query(
      "INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",
      [TARGET,CURRENT,PREDECESSOR]
    );
    if(alias.rowCount!==1) throw new Error('PREDECESSOR_ALIAS_INSERT_FAILED');
    report.mutations.predecessor_alias_inserted=1;

    const moveCurrent=await db.query(
      "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
      [TARGET,CURRENT_SOURCE,curRows.rows.map(r=>r.id),CURRENT]
    );
    const moveOld=await db.query(
      "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
      [TARGET,PREDECESSOR_SOURCE,oldRows.rows.map(r=>r.id),PREDECESSOR]
    );
    if(moveCurrent.rowCount!==EXPECTED_CURRENT||moveOld.rowCount!==EXPECTED_PREDECESSOR) throw new Error('APPLICATION_MOVE_FAILED');
    report.mutations.current_reowned=moveCurrent.rowCount;
    report.mutations.predecessor_reowned=moveOld.rowCount;
    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) current_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) predecessor_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$4 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) old_current_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$5 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) old_predecessor_rows,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku=$1) current_resolves,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) predecessor_resolves
    `,[TARGET,CURRENT,PREDECESSOR,CURRENT_SOURCE,PREDECESSOR_SOURCE]);
    report.post=post.rows[0];

    if(report.post.current_rows!==EXPECTED_CURRENT||report.post.predecessor_rows!==EXPECTED_PREDECESSOR||
       report.post.old_current_rows!==0||report.post.old_predecessor_rows!==0||
       report.post.current_resolves!==1||report.post.predecessor_resolves!==1){
      throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
    }

    if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
    else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{await db.end();}
}
if(require.main===module) main();
