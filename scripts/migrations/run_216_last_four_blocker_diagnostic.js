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
      SELECT sku,codigo_base,canonical_source_code,canonical_source_brand,filter_type,technology,catalog_active
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
    `)).rows;

    const malformed=rows.map(r=>({...r,expected_sku:expectedSku(r)}))
      .filter(r=>r.expected_sku && r.expected_sku!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.expected_sku)) groups.set(r.expected_sku,[]);
      groups.get(r.expected_sku).push(r);
    }

    const safe=[];
    for(const [target,sources] of groups){
      const occ=rows.find(r=>String(r.sku).toUpperCase()===target)||null;
      if(sources.length===1 && !occ) safe.push({from:sources[0].sku,to:target,codigo_base:sources[0].codigo_base});
    }

    const refs=(await db.query(`
      SELECT
        tc.table_schema,tc.table_name,kcu.column_name,rc.update_rule,rc.delete_rule,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name=rc.constraint_name AND tc.table_schema=rc.constraint_schema
      JOIN information_schema.constraint_column_usage ccu
        ON rc.unique_constraint_name=ccu.constraint_name AND rc.unique_constraint_schema=ccu.constraint_schema
      WHERE tc.constraint_type='FOREIGN KEY'
        AND ccu.table_schema='public'
        AND ccu.table_name='elimfilters_catalog'
        AND ccu.column_name='sku'
      ORDER BY tc.table_schema,tc.table_name,kcu.column_name
    `)).rows;

    const blockers=[];
    for(const x of safe){
      const hits=[];
      for(const fk of refs){
        const q=`SELECT count(*)::int AS n FROM "${fk.table_schema}"."${fk.table_name}" WHERE "${fk.column_name}"=$1`;
        const n=(await db.query(q,[x.from])).rows[0].n;
        if(n>0 && fk.update_rule!=='CASCADE') hits.push({...fk,rows:n});
      }
      if(hits.length) blockers.push({...x,blockers:hits});
    }

    const reasonCounts={};
    for(const b of blockers){
      for(const h of b.blockers){
        const key=`${h.table_schema}.${h.table_name}.${h.column_name}|${h.update_rule}`;
        reasonCounts[key]=(reasonCounts[key]||0)+1;
      }
    }

    console.log(JSON.stringify({
      malformed_count:malformed.length,
      safe_candidate_count:safe.length,
      blocked_by_non_cascade_fk_count:blockers.length,
      reason_counts:reasonCounts,
      blocked_examples:blockers.slice(0,25),
      unblocked_candidates:safe.filter(s=>!blockers.some(b=>b.from===s.from)).slice(0,25)
    },null,2));
  }finally{await db.end();}
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
