'use strict';

require('dotenv').config();
const { Client } = require('pg');

const DEERE=['MIA12832','MIU14301','UC23657'];
const FPG_HOUSINGS=[
  'EA22544','EA22545','EA22741','EA22742','EA27511','EA27512','EA27513','EA27514',
  'EA25411','EA25424','EA25432','EA25433','EA20009','EA270017','EA20018','EA270019',
  'EA20020','EA22525','EA282526','EA282527','EA22528','EA20219','EA20225','EA20317','EA20319'
];

const norm=v=>String(v||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
const digits=v=>String(v||'').replace(/\D/g,'');
const expectedHousingSku=code=>{
  const d=digits(code);
  return d.length>=4 ? 'EA2'+d.slice(-4) : null;
};

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  try{
    const exact=(await db.query(`
      SELECT DISTINCT c.sku,c.codigo_base,c.technology,c.filter_type,
             x.manufacturer,x.code,x.source
      FROM public.elimfilters_catalog c
      CROSS JOIN LATERAL (
        SELECT e->>'manufacturer' manufacturer,e->>'code' code,'OEM' source
        FROM jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb)) e
        UNION ALL
        SELECT e->>'manufacturer',e->>'code','COMPETITOR'
        FROM jsonb_array_elements(COALESCE(c.competitor_codes,'[]'::jsonb)) e
      ) x
      WHERE upper(regexp_replace(COALESCE(x.code,''),'[^A-Z0-9]','','g'))=ANY($1::text[])
      ORDER BY x.code,c.sku
    `,[DEERE.map(norm)])).rows;

    const rows=(await db.query(`
      SELECT DISTINCT c.sku,c.codigo_base,c.canonical_source_brand,c.canonical_source_code,
             c.filter_type,c.technology,pm.model_code,pe.element_code,mec.is_primary,
             mec.compatibility_source,mec.compatibility_confidence
      FROM model_element_compatibility mec
      JOIN product_model pm ON pm.id=mec.product_model_id
      JOIN product_element pe ON pe.id=mec.product_element_id
      JOIN public.elimfilters_catalog c ON c.sku=pm.model_code
      WHERE pm.model_code=ANY($1::text[])
        AND pe.element_code IN ('EA121575','EA15551','EA12858')
      ORDER BY c.sku,pe.element_code
    `,[FPG_HOUSINGS])).rows;

    const valid=[], malformed=[];
    for(const r of rows){
      const expected=expectedHousingSku(r.codigo_base||r.canonical_source_code);
      const item={...r,expected_sku:expected};
      if(expected===r.sku) valid.push(item); else malformed.push(item);
    }

    const uniqueValid=[...new Map(valid.map(r=>[r.sku,r])).values()];
    const uniqueMalformed=[...new Map(malformed.map(r=>[r.sku,r])).values()];

    console.log(JSON.stringify({
      rule:'EA2 + LAST_4_NUMERIC_DIGITS_OF_CANONICAL_BASE',
      exact_deere_refs:exact,
      valid_fpg_housings:uniqueValid,
      rejected_malformed_fpg_housings:uniqueMalformed
    },null,2));
  } finally { await db.end(); }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
