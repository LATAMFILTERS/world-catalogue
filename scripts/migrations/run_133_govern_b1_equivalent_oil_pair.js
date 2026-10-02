'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const A='EL30250';
const B='EL31033';

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try{
    const products=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,technology,height_mm,outer_diameter_mm,
             oem_codes,alternatives,enrichment_data
      FROM public.elimfilters_catalog
      WHERE sku=ANY($1::text[])
      ORDER BY sku
      FOR UPDATE
    `,[[A,B]]);
    if(products.rowCount!==2) throw new Error('B1 products missing');
    const bySku=new Map(products.rows.map(r=>[r.sku,r]));
    const a=bySku.get(A),b=bySku.get(B);

    if(a.filter_type!=='oil'||b.filter_type!=='oil'
      ||a.duty!==b.duty||a.technology!==b.technology
      ||Number(a.height_mm)!==264||Number(b.height_mm)!==264
      ||Number(a.outer_diameter_mm)!==108||Number(b.outer_diameter_mm)!==108){
      throw new Error(`B1 functional/dimensional mismatch ${JSON.stringify({a,b})}`);
    }

    const appStats=await db.query(`
      WITH aa AS (
        SELECT DISTINCT
          upper(coalesce(make,''))||'|'||
          upper(coalesce(model_family,''))||'|'||
          upper(coalesce(model_type,''))||'|'||
          coalesce(year,'')||'|'||
          upper(coalesce(engine_code,'')) k
        FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1
      ),
      bb AS (
        SELECT DISTINCT
          upper(coalesce(make,''))||'|'||
          upper(coalesce(model_family,''))||'|'||
          upper(coalesce(model_type,''))||'|'||
          coalesce(year,'')||'|'||
          upper(coalesce(engine_code,'')) k
        FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2
      )
      SELECT
        (SELECT count(*)::int FROM aa) a_groups,
        (SELECT count(*)::int FROM bb) b_groups,
        (SELECT count(*)::int FROM aa JOIN bb USING(k)) shared_groups
    `,[A,B]);
    const apps=appStats.rows[0];
    if(apps.a_groups!==791||apps.b_groups!==791||apps.shared_groups!==791){
      throw new Error(`B1 application contract changed ${JSON.stringify(apps)}`);
    }

    const oemStats=await db.query(`
      WITH a AS (
        SELECT DISTINCT ld_catalog.norm_part(coalesce(e->>'code',e->>'oem_code',e->>'part_number','')) code
        FROM public.elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(c.oem_codes)='array' THEN c.oem_codes ELSE '[]'::jsonb END
        ) e WHERE c.sku=$1
      ),
      b AS (
        SELECT DISTINCT ld_catalog.norm_part(coalesce(e->>'code',e->>'oem_code',e->>'part_number','')) code
        FROM public.elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(c.oem_codes)='array' THEN c.oem_codes ELSE '[]'::jsonb END
        ) e WHERE c.sku=$2
      )
      SELECT
        (SELECT count(*)::int FROM a) a_oem,
        (SELECT count(*)::int FROM b) b_oem,
        (SELECT count(*)::int FROM a JOIN b USING(code)) shared_oem,
        (SELECT count(*)::int FROM (SELECT code FROM a EXCEPT SELECT code FROM b) x) a_only,
        (SELECT count(*)::int FROM (SELECT code FROM b EXCEPT SELECT code FROM a) x) b_only
    `,[A,B]);
    const oem=oemStats.rows[0];
    if(oem.a_oem!==7||oem.b_oem!==7||oem.shared_oem!==7||oem.a_only!==0||oem.b_only!==0){
      throw new Error(`B1 OEM contract changed ${JSON.stringify(oem)}`);
    }

    const altSku=value=>{
      if(!value) return null;
      if(typeof value==='string') return value.toUpperCase();
      return String(value.sku||value.elimfilters_sku||value.code||'').toUpperCase()||null;
    };
    const aAlts=Array.isArray(a.alternatives)?a.alternatives:[];
    const bAlts=Array.isArray(b.alternatives)?b.alternatives:[];
    const nextA=[...aAlts];
    const nextB=[...bAlts];
    if(!nextA.some(x=>altSku(x)===B)) nextA.push({sku:B});
    if(!nextB.some(x=>altSku(x)===A)) nextB.push({sku:A});

    const report={
      mode:EXECUTE?'execute':'dry-run',
      pair:[A,B],
      applications:apps,
      oem,
      dimensions:{height_mm:264,outer_diameter_mm:108},
      planned_alternatives:{[A]:nextA,[B]:nextB},
      mutations:{products_updated:0}
    };

    if(EXECUTE){
      const evidence={
        phase:'B1',
        relationship:'MUTUAL_FUNCTIONAL_ALTERNATIVE',
        authority:'MANN-FILTER',
        source_codes:['W11102/50','W11033'],
        source_urls:[
          'https://www.mann-filter.com/en/catalog/search-results/product.html/w11102/50_mann-filter.html',
          'https://www.mann-filter.com/ph-en/catalog/search-results/product.html/w11033_mann-filter.html'
        ],
        shared_oem_count:7,
        shared_application_groups:791
      };
      for(const [sku,next] of [[A,nextA],[B,nextB]]){
        const row=bySku.get(sku);
        const oldData=row.enrichment_data&&typeof row.enrichment_data==='object'&&!Array.isArray(row.enrichment_data)
          ? row.enrichment_data:{};
        const updated=await db.query(`
          UPDATE public.elimfilters_catalog
          SET alternatives=$1::jsonb,
              enrichment_data=$2::jsonb
          WHERE sku=$3
          RETURNING sku
        `,[
          JSON.stringify(next),
          JSON.stringify({...oldData,alternative_governance:evidence}),
          sku
        ]);
        report.mutations.products_updated+=updated.rowCount;
      }
      if(report.mutations.products_updated!==2) throw new Error('B1 update count mismatch');
      await db.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    }else{
      await db.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  }catch(error){
    try{await db.query('ROLLBACK');}catch{}
    throw error;
  }finally{
    await db.end();
  }
}

main().catch(error=>{console.error(error.stack||error.message);process.exit(1);});
