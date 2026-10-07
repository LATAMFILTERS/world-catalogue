'use strict';

require('dotenv').config();
const { Client } = require('pg');

function digits(v){ return String(v||'').replace(/\D/g,''); }
function expectedSku(row){
  const sku=String(row.sku||'').toUpperCase();
  const d=digits(row.codigo_base||row.canonical_source_code);
  if(d.length<4) return null;
  const last4=d.slice(-4);
  if(sku.startsWith('EA1')) return 'EA1'+last4;
  if(sku.startsWith('EA2')) return 'EA2'+last4;
  if(sku.startsWith('EF9')) return 'EF9'+last4;
  if(sku.startsWith('EL8')) return 'EL8'+last4;
  if(sku.startsWith('EH6')) return 'EH6'+last4;
  return null;
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  try{
    const rows=(await db.query(`
      SELECT sku,codigo_base,canonical_source_code,canonical_source_brand,
             filter_type,technology,catalog_active
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
    `)).rows;

    const malformed=rows.map(r=>({...r,expected_sku:expectedSku(r)}))
      .filter(r=>r.expected_sku && r.expected_sku!==String(r.sku).toUpperCase());

    const byTarget=new Map();
    for(const r of malformed){
      if(!byTarget.has(r.expected_sku)) byTarget.set(r.expected_sku,[]);
      byTarget.get(r.expected_sku).push(r);
    }

    const targets=[...byTarget.keys()];
    const occupied=targets.length ? (await db.query(`
      SELECT sku,codigo_base,canonical_source_code,canonical_source_brand,filter_type,technology,catalog_active
      FROM public.elimfilters_catalog
      WHERE sku=ANY($1::text[])
      ORDER BY sku
    `,[targets])).rows : [];
    const occMap=new Map(occupied.map(r=>[r.sku,r]));

    const safe=[], collisions=[], coalescible=[];
    for(const [target,sources] of byTarget){
      const occ=occMap.get(target)||null;
      if(sources.length>1){
        collisions.push({target,reason:'MULTIPLE_SOURCE_ROWS_MAP_TO_ONE_TARGET',sources,occupied:occ});
        continue;
      }
      const src=sources[0];
      if(!occ){
        safe.push({from:src.sku,to:target,codigo_base:src.codigo_base,technology:src.technology});
      } else {
        const sameIdentity=String(occ.codigo_base||'').toUpperCase()===String(src.codigo_base||'').toUpperCase()
          || String(occ.canonical_source_code||'').toUpperCase()===String(src.canonical_source_code||'').toUpperCase();
        if(sameIdentity) coalescible.push({from:src.sku,to:target,source:src,occupied:occ});
        else collisions.push({target,reason:'TARGET_OCCUPIED_DISTINCT_IDENTITY',sources:[src],occupied:occ});
      }
    }

    const z900Set=new Set(['EA101280','EA135396','EA1781098','EA181039','EA181102','EA121575',
      'EA200003','EA200087','EA200088','EA200398','EA205003','EA205004','EA205006','EA2065003',
      'EA2065008','EA212001','EA21351','EA225004','EA225011','EA225017','EA230372','EA23511',
      'EA240019','EA245001','EA245002','EA245003','EA245004','EA250049','EA255002','EA255003',
      'EA255004','EA260048','EA260077','EA260376','EA265001','EA265002','EA265003','EA265008',
      'EA265015','EA270017','EA270019','EA270088','EA282526','EA282527','EA285001','EA285002',
      'EA285003','EA285005','EA285006','EA285008','EA290052','EA290055','EA292001']);
    const z900={
      safe:safe.filter(x=>z900Set.has(x.from)),
      coalescible:coalescible.filter(x=>z900Set.has(x.from)),
      collisions:collisions.filter(x=>x.sources.some(s=>z900Set.has(s.sku)))
    };

    console.log(JSON.stringify({
      malformed_count:malformed.length,
      unique_targets:targets.length,
      safe_rename_count:safe.length,
      coalescible_count:coalescible.length,
      collision_count:collisions.length,
      z900,
      safe_renames:safe,
      coalescible,
      collisions
    },null,2));
  } finally {
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
