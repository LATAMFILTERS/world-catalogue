#!/usr/bin/env node
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const target={make:'ISUZU',model:'NRR DERATE',equipment:'NRR DERATE',type:'TRUCK',engine:'4HK1-TC',year_from:'2025',year_to:'2026'};
const key=x=>JSON.stringify(normalizedApplication(x));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();let out;
try{
 const q=await db.query("select sku,codigo_base,duty,technology,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku in ('ES90128','EF98204') order by sku");
 const es=q.rows.find(x=>x.sku==='ES90128'),old=q.rows.find(x=>x.sku==='EF98204');
 if(!es)throw new Error('ES90128 missing');
 const apps=es.equipment_applications||[],present=new Set(apps.map(key)).has(key(target));
 const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h;
 const g=es.enrichment_data?.application_governance||{};
 const ev=await db.query("select application_kind from catalog_application_evidence where sku='ES90128' and payload_hash=$1 and verified is true",[h]);
 const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
 const ok=es.codigo_base==='FS20128'&&es.technology==='HYDROCORE™'&&es.duty==='HEAVY_DUTY'&&present&&(es.vehicle_applications||[]).length===0&&g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h&&kinds.includes('EQUIPMENT')&&kinds.includes('ENGINE')&&!old;
 out={phase:'ISUZU_V152_EF98204_CORRECTION_AUDIT',summary:{ok,es90128_present:present,ef98204_row_exists:!!old,vehicle_rows:(es.vehicle_applications||[]).length,hash_ok:g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h,evidence_kinds:kinds}};
}finally{db.release();await pool.end()}
console.log(JSON.stringify(out.summary,null,2));if(!out.summary.ok)process.exit(2);
