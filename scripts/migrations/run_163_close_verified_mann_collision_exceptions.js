'use strict';

const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

const TARGETS=[
  {
    sku:'EA34002',filter_type:'air',source:'C24002X',
    url:'https://www.mann-filter.com/in-en/catalogue/search-results/product.html/c24002x_mann-filter.html',
    patch:{height_mm:434,product_length_mm:null,outer_diameter_mm:231,inner_diameter_mm:121,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','231 mm'],['Inner diameter','121 mm'],['Inner diameter 1','11 mm'],['Height','434 mm']]
  },
  {
    sku:'EL30066',filter_type:'oil',source:'W66',
    url:'https://www.mann-filter.com/es/catalogo/resultados-de-busqueda/producto.html/w66_mann-filter.html',
    patch:{height_mm:60,product_length_mm:null,outer_diameter_mm:66,inner_diameter_mm:null,gasket_od_mm:62,gasket_id_mm:54,thread_size:'M20x1.5'},
    specs:[['Outer diameter','66 mm'],['Inner diameter of gasket','54 mm'],['Outer diameter of gasket','62 mm'],['Thread Size','M20x1.5'],['Height','60 mm']]
  },
  {
    sku:'EF30731',filter_type:'fuel',source:'PU731X',
    url:'https://www.mann-filter.com/es-es/catalogo/resultados-de-la-busqueda/producto.html/pu731x_mann-filter.html',
    patch:{height_mm:93,product_length_mm:null,outer_diameter_mm:65,inner_diameter_mm:19,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','65 mm'],['Inner diameter','19 mm'],['Outer diameter 1','78 mm'],['Height','93 mm']]
  },
  {
    sku:'EA33240',filter_type:'air',source:'C13240',
    url:'https://www.mann-filter.com/my-en/catalog/search-results/product.html/c13240_mann-filter.html',
    patch:{height_mm:305,product_length_mm:null,outer_diameter_mm:126,inner_diameter_mm:102,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','126 mm'],['Inner diameter','102 mm'],['Inner diameter 1','54 mm'],['Outer diameter 1','88 mm'],['Height','305 mm']]
  },
  {
    sku:'EA37004',filter_type:'air',source:'C17004',
    url:'https://www.mann-filter.com/mx-es/catalogo/resultados-de-la-busqueda/producto.html/c17004_mann-filter.html',
    patch:{height_mm:288,product_length_mm:null,outer_diameter_mm:165,inner_diameter_mm:116,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','165 mm'],['Inner diameter','116 mm'],['Height','288 mm']]
  },
  {
    sku:'EA31141',filter_type:'air',source:'C12114/1',
    url:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/c12114/1_mann-filter.html',
    patch:{height_mm:279,product_length_mm:null,outer_diameter_mm:114,inner_diameter_mm:57,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','114 mm'],['Inner diameter','57 mm'],['Outer diameter 1','126 mm'],['Height','279 mm']]
  },
  {
    sku:'EA31338',filter_type:'air',source:'C1338',
    url:'https://www.mann-filter.com/ca-en/catalog/search-results/product.html/c1338_mann-filter.html',
    patch:{height_mm:97,product_length_mm:null,outer_diameter_mm:128,inner_diameter_mm:70,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','128 mm'],['Inner diameter','70 mm'],['Height','97 mm']]
  },
  {
    sku:'EL30692',filter_type:'oil',source:'HU69/2',
    url:'https://www.mann-filter.com/mx-es/catalogo/resultados-de-la-busqueda/producto.html/hu69/2_mann-filter.html',
    patch:{height_mm:89,product_length_mm:null,outer_diameter_mm:61,inner_diameter_mm:35,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','61 mm'],['Inner diameter','35 mm'],['Inner diameter 1','9.8 mm'],['Height','89 mm']]
  },
  {
    sku:'EF34213',filter_type:'fuel',source:'WK42/13',
    url:'https://www.mann-filter.com/au-en/catalog/search-results/product.html/wk42/13_mann-filter.html',
    patch:{height_mm:54,product_length_mm:null,outer_diameter_mm:44,inner_diameter_mm:null,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','44 mm'],['Outer diameter 1','52 mm'],['Inlet','8 mm'],['Outlet','8 mm'],['Height','54 mm']]
  },
  {
    sku:'EF38303',filter_type:'fuel',source:'WK830/3',
    url:'https://www.mann-filter.com/en/catalog/search-results/product.html/wk830/3_mann-filter.html',
    patch:{height_mm:148,product_length_mm:null,outer_diameter_mm:75,inner_diameter_mm:null,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','75 mm'],['Outer diameter 1','80 mm'],['Thread size entry','M12x1.5'],['Thread size exit','M14x1.5'],['Height','148 mm']]
  },
  {
    sku:'EF38533',filter_type:'fuel',source:'WK853/3',
    url:'https://www.mann-filter.com/ar-es/catalogo/resultados-de-busqueda/producto.html/wk853/3_mann-filter.html',
    patch:{height_mm:177,product_length_mm:null,outer_diameter_mm:80,inner_diameter_mm:null,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','80 mm'],['Inlet','8 mm'],['Outlet','8 mm'],['Height','177 mm']]
  }
];

function n(v){return v==null?null:Number(v);}
function sameNum(a,b){return a==null&&b==null?true:n(a)===n(b);}
function sameText(a,b){return String(a||'')===String(b||'');}

async function resolverCheck(db,source,sku){
  const q=await db.query(
    `SELECT sku FROM public.v_api_resolver_v7
      WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
      ORDER BY sku`,
    [source]
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
        `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,
        [t.sku]
      )).rows[0];
      if(!pre) throw new Error('TARGET_MISSING '+t.sku);
      if(pre.catalog_active!==true||pre.duty!=='LIGHT_DUTY'||pre.filter_type!==t.filter_type){
        throw new Error('TARGET_SCOPE_CHANGED '+t.sku+' '+JSON.stringify({filter_type:pre.filter_type,duty:pre.duty,catalog_active:pre.catalog_active}));
      }
      if(pre.canonical_source_brand!=='MANN-FILTER'||
         String(pre.canonical_source_code||'').toUpperCase().replace(/[^A-Z0-9]/g,'')!==
         String(t.source||'').toUpperCase().replace(/[^A-Z0-9]/g,'')){
        throw new Error('CANONICAL_IDENTITY_CHANGED '+t.sku+' '+JSON.stringify({brand:pre.canonical_source_brand,code:pre.canonical_source_code}));
      }

      if(t.sku==='EF30731'){
        const conflict=await db.query(
          `SELECT elimfilters_sku
             FROM ld_catalog.ld_canonical_product_identity
            WHERE ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($1)
              AND elimfilters_sku<>$2`,
          [t.source,t.sku]
        );
        if(conflict.rowCount) throw new Error('CANONICAL_IDENTITY_CONFLICT '+t.source+' '+JSON.stringify(conflict.rows));

        await db.query(
          `INSERT INTO ld_catalog.ld_canonical_product_identity(
             elimfilters_sku,origin_group,canonical_brand,canonical_part_number,
             filter_type,status,evidence_source,created_at,updated_at
           ) VALUES($1,'EUROPEAN','MANN-FILTER',$2,$3,'ACTIVE','MIGRATION_163_VERIFIED_MANN_EXCEPTION',now(),now())
           ON CONFLICT(elimfilters_sku)
           DO UPDATE SET origin_group='EUROPEAN',
                         canonical_brand='MANN-FILTER',
                         canonical_part_number=EXCLUDED.canonical_part_number,
                         filter_type=EXCLUDED.filter_type,
                         status='ACTIVE',
                         evidence_source='MIGRATION_163_VERIFIED_MANN_EXCEPTION',
                         updated_at=now()`,
          [t.sku,t.source,t.filter_type]
        );
      }

      await resolverCheck(db,t.source,t.sku);

      const governedPatch={
        ...t.patch,
        canonical_source_url:t.url,
        canonical_source_status:'VERIFIED',
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
                canonical_source_url=$9,
                canonical_source_status='VERIFIED',
                canonical_verified_at=now()
          WHERE sku=$1
            AND canonical_source_brand='MANN-FILTER'
            AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($10)
        RETURNING sku,filter_type,canonical_source_code,height_mm,product_length_mm,
                  outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
                  thread_size,canonical_source_url,canonical_source_status,catalog_active`,
        [t.sku,t.patch.height_mm,t.patch.product_length_mm,t.patch.outer_diameter_mm,
         t.patch.inner_diameter_mm,t.patch.gasket_od_mm,t.patch.gasket_id_mm,
         t.patch.thread_size,t.url,t.source]
      );
      if(q.rowCount!==1) throw new Error('UPDATE_CARDINALITY_INVALID '+t.sku);

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
      if(!sameText(post.thread_size,t.patch.thread_size)) throw new Error('POSTCHECK_thread_size_FAILED '+t.sku);
      if(String(post.canonical_source_code||'').toUpperCase().replace(/[^A-Z0-9]/g,'')!==
           String(t.source||'').toUpperCase().replace(/[^A-Z0-9]/g,'')||
         post.canonical_source_status!=='VERIFIED'||post.catalog_active!==true){
        throw new Error('POSTCHECK_IDENTITY_FAILED '+t.sku);
      }
      await resolverCheck(db,t.source,t.sku);

      const specs=await db.query(
        `SELECT source_sku,spec_key,spec_value
           FROM ld_catalog.ld_product_specifications
          WHERE elimfilters_sku=$1 AND spec_key=ANY($2::text[])
          ORDER BY spec_key`,
        [t.sku,t.specs.map(([key])=>key)]
      );
      if(specs.rowCount!==t.specs.length||specs.rows.some(r=>r.source_sku!==t.source)){
        throw new Error('SPEC_POSTCHECK_FAILED '+t.sku+' '+JSON.stringify(specs.rows));
      }

      report.targets.push({
        sku:t.sku,source:t.source,filter_type:t.filter_type,
        gateway_scope:gateway.scope,
        pre:{
          height_mm:pre.height_mm,product_length_mm:pre.product_length_mm,
          outer_diameter_mm:pre.outer_diameter_mm,inner_diameter_mm:pre.inner_diameter_mm,
          gasket_od_mm:pre.gasket_od_mm,gasket_id_mm:pre.gasket_id_mm,thread_size:pre.thread_size
        },
        post,
        semantic_specs:specs.rows
      });
    }

    if(EXECUTE){
      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }
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
