'use strict';

require('dotenv').config();
const { Client } = require('pg');

function norm(v){ return String(v||'').replace(/[^A-Z0-9]/gi,'').toUpperCase(); }

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  try{
    const refs=['MIA12832','MIU14301','UC23657'].map(norm);

    const exact=await db.query(`
      SELECT DISTINCT
        c.sku,c.codigo_base,c.filter_type,c.technology,
        c.canonical_source_brand,c.canonical_source_code,
        x.manufacturer,x.code AS matched_code,x.source
      FROM public.elimfilters_catalog c
      CROSS JOIN LATERAL (
        SELECT e->>'manufacturer' manufacturer,e->>'code' code,'OEM' source
        FROM jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb)) e
        UNION ALL
        SELECT e->>'manufacturer',e->>'code','COMPETITOR'
        FROM jsonb_array_elements(COALESCE(c.competitor_codes,'[]'::jsonb)) e
      ) x
      WHERE upper(regexp_replace(COALESCE(x.code,''),'[^A-Z0-9]','','g'))=ANY($1)
      ORDER BY x.code,c.sku
    `,[refs]);

    const fpg=await db.query(`
      SELECT DISTINCT
        c.sku,c.codigo_base,c.filter_type,c.technology,
        c.canonical_source_brand,c.canonical_source_code,
        c.product_length_mm,c.product_width_mm,c.product_height_mm,
        c.height_mm,c.outer_diameter_mm,
        pm.model_code,
        pe.element_code,
        mec.is_primary,
        mec.compatibility_source,
        mec.compatibility_confidence
      FROM model_element_compatibility mec
      JOIN product_model pm ON pm.id=mec.product_model_id
      JOIN product_element pe ON pe.id=mec.product_element_id
      JOIN public.elimfilters_catalog c ON c.sku=pm.model_code
      WHERE pe.element_code IN ('EA121575','EA15551','EA12858')
         OR pm.model_code IN (
           'EA22544','EA22545','EA22741','EA22742','EA27511','EA27512','EA27513','EA27514',
           'EA25411','EA25424','EA25432','EA25433','EA20009','EA270017','EA20018','EA270019',
           'EA20020','EA22525','EA282526','EA282527','EA22528','EA20219','EA20225','EA20317','EA20319'
         )
      ORDER BY c.sku,pe.element_code
    `);

    const intek=await db.query(`
      SELECT count(*)::int AS live_intekcore_count
      FROM public.elimfilters_catalog
      WHERE upper(coalesce(technology,'')) LIKE '%INTEKCORE%'
         OR sku LIKE 'EA2%'
         OR lower(coalesce(filter_type,'')) LIKE '%housing%'
    `);

    console.log(JSON.stringify({
      live_intekcore_count:intek.rows[0].live_intekcore_count,
      exact_deere_refs:exact.rows,
      fpg_housing_candidates:fpg.rows
    },null,2));
  } finally {
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
