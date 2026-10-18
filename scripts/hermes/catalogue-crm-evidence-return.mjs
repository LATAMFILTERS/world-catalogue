import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
const root=process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER';
const base=path.join(root,'state','catalogue-hermes');
const id=x=>String(x||'').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,120);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const mac=(key,v)=>crypto.createHmac('sha256',key).update(JSON.stringify(v)).digest('hex');
export async function returnVerifiedHermesEvidence({dbUrl=process.env.CATALOG_DATABASE_URL,stateRoot=base,limit=10}={}){
 if(!dbUrl)throw Error('HERMES_CANONICAL_DB_REQUIRED');
 const processing=path.join(stateRoot,'processing'),outputs=path.join(stateRoot,'evidence');
 const rawKey=(await fs.readFile(path.join(path.resolve(stateRoot,'../..'),'secrets','catalogue-hermes-transport.key'),'utf8')).trim();
 if(!/^[0-9a-f]{64,}$/i.test(rawKey)||rawKey.length%2)throw Error('HERMES_TRANSPORT_KEY_INVALID');
 const key=Buffer.from(rawKey,'hex');
 await fs.mkdir(outputs,{recursive:true});
 const client=new pg.Client({connectionString:dbUrl,connectionTimeoutMillis:5000});
 await client.connect();
 const reports=[];
 try{
  const info=(await client.query('SELECT current_database() AS db')).rows[0];
  if(info.db!=='catalogo_elimfilters')throw Error('HERMES_CANONICAL_DB_MISMATCH');
  for(const name of (await fs.readdir(processing)).filter(x=>x.endsWith('.json')).sort().slice(0,limit)){
   const p=path.join(processing,name);
   const request=JSON.parse(await fs.readFile(p,'utf8'));
   const e=request.envelope;
   if(!e||!e.requestId||!e.correlationId||name!==id(e.correlationId)+'__'+id(e.requestId)+'.json')throw Error('INVALID_PROCESSING_REQUEST');
   const skus=[...new Set((e.payload?.findings||[]).flatMap(f=>[f.proposed_sku,...(f.canonical_matches||[]).map(m=>m.sku)].filter(Boolean)))];
   if(!skus.length){reports.push({requestId:e.requestId,status:'NO_SKU_CANDIDATES'});continue;}
   const rows=(await client.query(`SELECT evidence_id,sku,source_url,source_hash,verification_status,provenance
    FROM public.hermes_catalogue_evidence WHERE sku = ANY($1::text[]) AND verification_status='VERIFIED' AND captured_at >= $2::timestamptz
    ORDER BY captured_at DESC LIMIT 101`,[skus])).rows;
   if(rows.length>100)throw Error('EVIDENCE_RESULT_TRUNCATED');
   const evidences=rows.filter(r=>r.source_url&&r.source_hash&&r.provenance);
   if(!evidences.length){reports.push({requestId:e.requestId,status:'WAITING_HERMES_EVIDENCE'});continue;}
   const output={schema_version:1,source:'HERMES_CANONICAL_DB',status:'EVIDENCE_AVAILABLE_NOT_CERTIFIED',
    requestId:e.requestId,correlationId:e.correlationId,model:e.payload.model,created_at:new Date().toISOString(),
    evidence:evidences.map(r=>({evidence_id:r.evidence_id,sku:r.sku,source_url:r.source_url,source_hash:r.source_hash,
      provenance:r.provenance})),canonical_write_performed:false,technical_certification_issued:false};
   output.evidence_manifest_sha256=hash(JSON.stringify(output.evidence));
   const dest=path.join(outputs,name);
   output.hmac_sha256=mac(key,output);
   await fs.writeFile(dest,JSON.stringify(output),{flag:'wx',mode:0o600}).catch(async er=>{
     if(er.code!=='EEXIST')throw er;
     const prior=JSON.parse(await fs.readFile(dest,'utf8'));
     if(prior.requestId!==output.requestId||prior.correlationId!==output.correlationId)throw Error('EVIDENCE_OUTPUT_COLLISION');
   });
   reports.push({requestId:e.requestId,status:'EVIDENCE_AVAILABLE_NOT_CERTIFIED',count:output.evidence.length});
  }
 }finally{await client.end();}
 return reports;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log(JSON.stringify(await returnVerifiedHermesEvidence()));
}
