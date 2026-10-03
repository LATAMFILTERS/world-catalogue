'use strict';

const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

const TARGETS=[
  {
    sku:'EL31428',
    source:'W1428',
    current_filter_type:'oil',
    target_filter_type:'hydraulic',
    target_technology:'NANOFORCE™',
    url:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/w1428_mann-filter.html',
    patch:{
      height_mm:170,
      product_length_mm:null,
      outer_diameter_mm:138,
      inner_diameter_mm:100,
      gasket_od_mm:null,
      gasket_id_mm:null,
      thread_size:'M42x2',
      filter_type:'hydraulic',
      technology:'NANOFORCE™',
      canonical_source_status:'EXCEPTION_CONFIRMED'
    },
    specs:[
      ['Product type','Hydraulics'],
      ['Outer diameter','138 mm'],
      ['Inner diameter 1','100 mm'],
      ['Inner diameter 2','111 mm'],
      ['Thread Size','M42x2'],
      ['Height','170 mm'],
      ['Governance exception','Legacy EL Light Duty SKU retained; authoritative product family is hydraulic']
    ]
  },
  {
    sku:'EA31461',
    source:'C18146/1',
    current_filter_type:'air',
    target_filter_type:'air',
    target_technology:'MACROCORE™',
    url:null,
    patch:{
      height_mm:null,
      product_length_mm:null,
      outer_diameter_mm:null,
      inner_diameter_mm:null,
      gasket_od_mm:null,
      gasket_id_mm:null,
      thread_size:null,
      filter_type:'air',
      technology:'MACROCORE™',
      canonical_source_status:'EXCEPTION_CONFIRMED'
    },
    specs:[
      ['Identity status','Historical MANN identity retained'],
      ['Official source status','Current MANN product page not available (HTTP 404 verified 2026-10-03)'],
      ['Specification status','Historical dimensions cleared because live values matched off-canonical C21461 collision'],
      ['Known OEM reference','RENAULT TRUCKS (RVI) 50 00 809 894']
    ]
  }
];

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function n(v){return v==null?null:Number(v);}
function sameNum(a,b){return a==null&&b==null?true:n(a)===n(b);}

async function resolverCheck(db,source,sku){
  const q=await db.query(
    `SELECT sku FROM public.v_api_resolver_v7
      WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
      ORDER BY sku`,[source]
  );
  if(q.rowCount!==1||q.rows[0].sku!==sku){
    throw new Error('RESOLVER_IDENTITY_CHANGED '+source+' '+JSON.stringify(q.rows));
  }
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',targets:[],transaction:null};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for(const t of TARGETS){
      const pre=(await db.query(
        `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,[t.sku]
      )).rows[0];
      if(!pre) throw new Error('TARGET_MISSING '+t.sku);
      if(pre.catalog_active!==true||pre.duty!=='LIGHT_DUTY'||pre.filter_type!==t.current_filter_type){
        throw new Error('TARGET_SCOPE_CHANGED '+t.sku);
      }
      if(pre.canonical_source_brand!=='MANN-FILTER'||norm(pre.canonical_source_code)!==norm(t.source)){
        throw new Error('CANONICAL_IDENTITY_CHANGED '+t.sku);
      }

      await resolverCheck(db,t.source,t.sku);

      if(t.sku==='EA31461'){
        if(!sameNum(pre.height_mm,294)||!sameNum(pre.outer_diameter_mm,236)||!sameNum(pre.gasket_id_mm,104)){
          throw new Error('HISTORICAL_COLLISION_SIGNATURE_CHANGED '+JSON.stringify({
            height_mm:pre.height_mm,outer_diameter_mm:pre.outer_diameter_mm,gasket_id_mm:pre.gasket_id_mm
          }));
        }
      }

      const governedPatch={
        ...t.patch,
        canonical_source_url:t.url,
        canonical_verified_at:new Date(),
      };
      const gateway=assertGovernedCatalogPatch(pre,governedPatch);

      const q=await db.query(
        `UPDATE public.elimfilters_catalog
            SET height_mm=$2,
                product_length_mm=$3,
                outer_diameter_mm=$4,
                inner_diameter_mm=$5,
                gasket_od_mm=$6,
                gasket_id_mm=$7,
                thread_size=$8,
                filter_type=$9,
                technology=$10,
                canonical_source_url=$11,
                canonical_source_status='EXCEPTION_CONFIRMED',
                canonical_verified_at=now()
          WHERE sku=$1
            AND canonical_source_brand='MANN-FILTER'
            AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($12)
        RETURNING sku,filter_type,duty,technology,canonical_source_code,
                  height_mm,product_length_mm,outer_diameter_mm,inner_diameter_mm,
                  gasket_od_mm,gasket_id_mm,thread_size,canonical_source_url,
                  canonical_source_status,catalog_active`,
        [t.sku,t.patch.height_mm,t.patch.product_length_mm,t.patch.outer_diameter_mm,
         t.patch.inner_diameter_mm,t.patch.gasket_od_mm,t.patch.gasket_id_mm,
         t.patch.thread_size,t.target_filter_type,t.target_technology,t.url,t.source]
      );
      if(q.rowCount!==1) throw new Error('UPDATE_CARDINALITY_INVALID '+t.sku);

      await db.query(
        `UPDATE ld_catalog.ld_canonical_product_identity
            SET filter_type=$2,
                status='ACTIVE',
                evidence_source='MIGRATION_173_CONFIRMED_GOVERNANCE_EXCEPTION',
                updated_at=now()
          WHERE elimfilters_sku=$1
            AND canonical_brand='MANN-FILTER'
            AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($3)`,
        [t.sku,t.target_filter_type,t.source]
      );

      for(const [key,value] of t.specs){
        await db.query(
          `INSERT INTO ld_catalog.ld_product_specifications(
             elimfilters_sku,source_sku,spec_key,spec_value,spec_unit,created_at
           ) VALUES($1,$2,$3,$4,'',now())
           ON CONFLICT(elimfilters_sku,spec_key)
           DO UPDATE SET source_sku=EXCLUDED.source_sku,
                         spec_value=EXCLUDED.spec_value,
                         spec_unit=EXCLUDED.spec_unit`,
          [t.sku,t.source,key,value]
        );
      }

      const post=q.rows[0];
      for(const key of ['height_mm','product_length_mm','outer_diameter_mm','inner_diameter_mm','gasket_od_mm','gasket_id_mm']){
        if(!sameNum(post[key],t.patch[key])) throw new Error('POSTCHECK_'+key+'_FAILED '+t.sku);
      }
      if(post.filter_type!==t.target_filter_type||post.technology!==t.target_technology||
         post.canonical_source_status!=='EXCEPTION_CONFIRMED'||post.catalog_active!==true){
        throw new Error('POSTCHECK_GOVERNANCE_FAILED '+t.sku+' '+JSON.stringify(post));
      }

      await resolverCheck(db,t.source,t.sku);

      report.targets.push({
        sku:t.sku,source:t.source,gateway_scope:gateway.scope,
        pre:{filter_type:pre.filter_type,technology:pre.technology,height_mm:pre.height_mm,
          outer_diameter_mm:pre.outer_diameter_mm,inner_diameter_mm:pre.inner_diameter_mm,
          gasket_od_mm:pre.gasket_od_mm,gasket_id_mm:pre.gasket_id_mm,thread_size:pre.thread_size},
        post
      });
    }

    if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
    else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
    console.log(JSON.stringify(report,null,2));
  }catch(error){
    try{await db.query('ROLLBACK')}catch{}
    console.error(error.stack||error);
    process.exitCode=1;
  }finally{
    await db.end();
  }
}

if(require.main===module) main();
