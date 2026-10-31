#!/usr/bin/env node
// Read-only product identity recheck of quarantined MANN pages using exact legal Product field.
// Reinstatement is restricted to matching source product code, URL slug and full file hash.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const file=path.join(dir,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const changed=[],blocked=[];
for(const row of Object.values(ledger)){
 if(row.candidate||!row.quarantined_candidates?.length)continue;
 for(const q of row.quarantined_candidates){
  const filename=path.basename(q.file||'');
  const filepath=path.join(dir,filename);
  if(!filename||!fs.existsSync(filepath)){blocked.push({sku:row.sku,reason:'MISSING_CAPTURE'});continue;}
  const body=fs.readFileSync(filepath,'utf8');
  if(sha(body)!==q.sha256){blocked.push({sku:row.sku,reason:'HASH_MISMATCH'});continue;}
  const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
  const matches=[...visible.matchAll(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/gi)].map(m=>m[1]);
  const urlCode=decodeURIComponent(new URL(q.url).pathname.split('/product.html/')[1]?.replace(/_mann-filter\.html$/,'')||'');
  const claims=matches.filter(x=>norm(x)===norm(row.mann_code_claim)&&norm(x)===norm(urlCode));
  if(claims.length!==1){blocked.push({sku:row.sku,reason:'NO_UNAMBIGUOUS_OFFICIAL_IDENTITY',legal_fields:matches.slice(-5)});continue;}
  row.candidate={...q,declared_product_code:claims[0],status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
  row.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';
  changed.push({sku:row.sku,mann_code:claims[0],sha256:q.sha256});
  break;
 }
}
if(changed.length)fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
const output={reconfirmed:changed,not_reconfirmed:blocked,identities_confirmed:Object.values(ledger).filter(r=>r.candidate).length,remaining:Object.values(ledger).filter(r=>!r.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(dir,'quarantine-recheck-summary.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
