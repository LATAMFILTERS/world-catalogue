#!/usr/bin/env node
import fs from 'node:fs';

const rec=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v158-exact-pending-reconciliation.json','utf8'));
const targetSkus=new Set(['EA13614','EF90390','EF92599','EF92564','EL80420','EF92427','EF91840','EA14353']);
const bases={
  EA13614:'P543614',
  EF90390:'P550390',
  EF92599:'P502599',
  EF92564:'P552564',
  EL80420:'P550420',
  EF92427:'P502427',
  EF91840:'P551840',
  EA14353:'AF4353'
};

const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const datasets=[];

if(fs.existsSync('scripts/donaldson_import_ready.jsonl')){
  const lines=fs.readFileSync('scripts/donaldson_import_ready.jsonl','utf8').split(/\r?\n/).filter(Boolean);
  for(const line of lines){
    try{
      const x=JSON.parse(line);
      if(Object.values(bases).includes(x.codigo_base) || targetSkus.has(x.sku)){
        datasets.push({source:'donaldson_import_ready',sku:x.sku,codigo_base:x.codigo_base,apps:x.equipment_applications||[]});
      }
    }catch{}
  }
}

if(fs.existsSync('scripts/donaldson_air_results.json')){
  try{
    const x=JSON.parse(fs.readFileSync('scripts/donaldson_air_results.json','utf8'));
    const arr=Array.isArray(x)?x:(x.products||x.results||[]);
    for(const r of arr){
      const code=r.codigo_base||r.part_number||r.partNumber||r.code||r.sku;
      if(Object.values(bases).includes(code)){
        datasets.push({source:'donaldson_air_results',sku:null,codigo_base:code,apps:r.equipment_applications||r.applications||[]});
      }
    }
  }catch{}
}

const byBase=new Map();
for(const d of datasets){
  if(!byBase.has(d.codigo_base))byBase.set(d.codigo_base,[]);
  byBase.get(d.codigo_base).push(d);
}

const rows=[];
for(const r of rec.rows.filter(x=>targetSkus.has(x.sku))){
  const base=bases[r.sku], sources=byBase.get(base)||[];
  let exact=0, modelEngine=0, modelOnly=0;
  const unmatched=[];
  for(const item of r.items){
    const wantModel=norm(item.model), wantEngine=norm(item.engine);
    let best=0;
    for(const s of sources){
      for(const a of s.apps||[]){
        const eq=norm(a.equipment||a.model||'');
        const eng=norm(a.engine||'');
        const hasModel=eq.includes(wantModel) || wantModel.includes(eq.replace(/^ISUZU/,''));
        const hasEngine=wantEngine && eng && (eng.includes(wantEngine)||wantEngine.includes(eng));
        if(hasModel&&hasEngine)best=Math.max(best,2);
        else if(hasModel)best=Math.max(best,1);
      }
    }
    if(best===2){exact++;modelEngine++;}
    else if(best===1){modelOnly++;unmatched.push({...item,reason:'MODEL_ONLY'});}
    else unmatched.push({...item,reason:'NO_MATCH'});
  }
  rows.push({
    sku:r.sku,codigo_base:base,pending_positions:r.exact_positions,
    source_records:sources.length,model_engine_matches:modelEngine,model_only_matches:modelOnly,
    unsupported:r.exact_positions-modelEngine,
    provisional_class:modelEngine===r.exact_positions?'READY_BATCH':'HOLD_EVIDENCE',
    unmatched
  });
}

const summary={
  skus:rows.length,
  positions:rows.reduce((n,x)=>n+x.pending_positions,0),
  ready_skus:rows.filter(x=>x.provisional_class==='READY_BATCH').length,
  ready_positions:rows.filter(x=>x.provisional_class==='READY_BATCH').reduce((n,x)=>n+x.pending_positions,0),
  hold_skus:rows.filter(x=>x.provisional_class==='HOLD_EVIDENCE').length,
  hold_positions:rows.filter(x=>x.provisional_class==='HOLD_EVIDENCE').reduce((n,x)=>n+x.pending_positions,0)
};

fs.writeFileSync('hermes/reports/isuzu-v158-application-evidence-audit.json',JSON.stringify({summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.table(rows.map(x=>({sku:x.sku,base:x.codigo_base,pending:x.pending_positions,source_records:x.source_records,model_engine:x.model_engine_matches,model_only:x.model_only_matches,unsupported:x.unsupported,class:x.provisional_class})));
