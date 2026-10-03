'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const TARGET='EA15702';
const SOURCE='EA31365';
const BASE='P145702';
const MANN='C381365';
const EXPECTED_ROWS=13;
const DONALDSON_URL='https://shop.donaldson.com/store/en-us/product/P145702/15616';

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',target:TARGET,source:SOURCE,base:BASE,mann:MANN,pre:{},mutations:{},post:{}};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const q=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[TARGET]);
    if(q.rowCount!==1) throw new Error('TARGET_NOT_UNIQUE');
    const row=q.rows[0];
    if(row.codigo_base!==BASE||row.duty!=='HEAVY_DUTY'||row.filter_type!=='air'||row.technology!=='MACROCORE™'){
      throw new Error('TARGET_IDENTITY_CHANGED');
    }

    const owners=await db.query(
      'SELECT count(*)::int n FROM public.elimfilters_catalog WHERE ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($1) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($1)',
      [BASE]
    );
    if(owners.rows[0].n!==1) throw new Error('P145702_NOT_UNIQUE');
    const apps=await db.query(
      'SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id',
      [SOURCE,MANN]
    );
    if(apps.rowCount!==EXPECTED_ROWS) throw new Error('C381365_ROW_COUNT_CHANGED');

    const targetApps=await db.query(
      'SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1',
      [TARGET]
    );
    if(targetApps.rows[0].n!==0) throw new Error('TARGET_APPLICATIONS_CHANGED');

    const parent=await db.query(
      "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
      [TARGET,BASE]
    );
    if(parent.rowCount>0 && !(parent.rowCount===1&&parent.rows[0].elimfilters_sku===TARGET&&parent.rows[0].source_sku===BASE)){
      throw new Error('P145702_PARENT_CONFLICT');
    }
    const xref=await db.query(
      "SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",
      [MANN]
    );
    if(xref.rowCount>0 && !(xref.rowCount===1&&xref.rows[0].elimfilters_sku===TARGET)){
      throw new Error('C381365_XREF_CONFLICT');
    }

    const gov={
      ...(row.enrichment_data?.codigo_base_governance||{}),
      policy_version:'2026-10-03-v4.1',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      required_authority:'VERIFIED_DONALDSON',
      approved_codigo_base:BASE,
      current_codigo_base:BASE,
      approved_manufacturer:'DONALDSON',
      approved_source_column:'DONALDSON_OFFICIAL',
      primary_manufacturer_verified:true,
      verification_method:'DONALDSON_OFFICIAL_PLUS_VERIFIED_MANN_CROSSREF',
      evidence_url:DONALDSON_URL,
      verified_at:new Date().toISOString(),
      evidence_note:'P145702 is the unique Donaldson air-filter identity. Existing catalogue cross-reference evidence maps MANN C381365 to P145702, with matching 457.2 x ~307 mm geometry.'
    };
    const enrichment={...(row.enrichment_data||{}),codigo_base_governance:gov};
    report.pre.gateway=assertGovernedCatalogPatch(row,{enrichment_data:enrichment});
    report.pre.applications=apps.rowCount;
    report.pre.p145702_owners=owners.rows[0].n;
    report.pre.existing_parent=parent.rowCount;
    report.pre.existing_xref=xref.rowCount;

    if(EXECUTE){
      if(parent.rowCount===0){
        const p=await db.query(
          "INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",
          [TARGET,BASE]
        );
        if(p.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
        report.mutations.parent_inserted=1;
      }else report.mutations.parent_inserted=0;

      const upd=await db.query(
        `UPDATE public.elimfilters_catalog
         SET canonical_source_brand='DONALDSON',
             canonical_source_code=$2,
             canonical_source_url=$3,
             canonical_source_status='VERIFIED',
             canonical_verified_at=now(),
             enrichment_data=$4::jsonb
         WHERE sku=$1 RETURNING sku`,
        [TARGET,BASE,DONALDSON_URL,JSON.stringify(enrichment)]
      );
      if(upd.rowCount!==1) throw new Error('GOVERNANCE_UPDATE_FAILED');
      report.mutations.governance_updated=1;

      if(xref.rowCount===0){
        const x=await db.query(
          `INSERT INTO ld_catalog.ld_competitor_cross_references
           (elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
           VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id`,
          [TARGET,BASE,MANN]
        );
        if(x.rowCount!==1) throw new Error('XREF_INSERT_FAILED');
        report.mutations.xref_inserted=1;
      }else report.mutations.xref_inserted=0;

      const moved=await db.query(
        'UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE id=ANY($2::bigint[]) AND elimfilters_sku=$3 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)',
        [TARGET,apps.rows.map(r=>r.id),SOURCE,MANN]
      );
      if(moved.rowCount!==EXPECTED_ROWS) throw new Error('APPLICATION_MOVE_FAILED');
      report.mutations.applications_reowned=moved.rowCount;
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[TARGET]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
      report.mutations.cache_refreshed=1;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) base_resolves,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) mann_other,
        (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) governance_state
    `,[TARGET,SOURCE,MANN,BASE]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.target_rows!==EXPECTED_ROWS||report.post.source_rows!==0||
         report.post.base_resolves!==1||report.post.mann_resolves!==1||report.post.mann_other!==0||
         report.post.governance_state!=='CANONICAL_VERIFIED'){
        throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
      }
      await db.query('COMMIT');report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{await db.end();}
}
if(require.main===module) main();
