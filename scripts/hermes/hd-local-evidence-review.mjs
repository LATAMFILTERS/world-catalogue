#!/usr/bin/env node
// Read-only HERMES -> Ollama HD evidence review.
// Never writes PostgreSQL, catalogues, certification ledgers or application data.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {interpretLocalEvidence} from './local-evidence-ollama.mjs';

const normSku = value => String(value || '').trim().toUpperCase();
const SKU_RE = /^[A-Z0-9_-]{2,45}$/;
const AXES = ['identity','technical_specs','dimensions','oem_codes','cross_references','applications'];
const axisShape = () => ({status:'UNRESOLVED',records:[],source_urls:[],checked_sources:[],note:''});
const requiredShape = () => ({
  dossier_status:'DOSSIER_INCOMPLETE',
  identity:{...axisShape(),manufacturer:null,source_code:null,product_name:null,product_type:null,market_segment:null},
  technical_specs:axisShape(),dimensions:axisShape(),oem_codes:axisShape(),
  cross_references:axisShape(),applications:axisShape(),
  provenance:{sources:[]},consistency:{status:'CONFLICTING',conflicts:[],notes:[]}
});
const flags = argv => {
  const args={};
  for(let i=0;i<argv.length;i+=2){
    if(!argv[i]?.startsWith('--') || argv[i+1] == null) throw Error('USAGE: --sku-file path --bundle-dir path --out-dir path --allowed-hosts domains [--limit N]');
    args[argv[i].slice(2)]=argv[i+1];
  }
  return args;
};
async function atomicJson(filename,value){
  const tmp=filename+'.tmp-'+process.pid;
  try{
    await fs.writeFile(tmp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    await fs.rename(tmp,filename);
  }catch(err){
    await fs.rm(tmp,{force:true});
    throw err;
  }
}
export async function reviewHdEvidence({skus,bundleDir,outDir,allowedHosts,limit=20,model,interpret=interpretLocalEvidence}){
  if(!bundleDir || !outDir || !String(allowedHosts||'').trim()) throw Error('BUNDLE_DIRECTORY_OUTPUT_AND_SOURCE_ALLOWLIST_REQUIRED');
  const candidates=[...new Set(skus.map(normSku))];
  if(candidates.some(sku=>!SKU_RE.test(sku))) throw Error('INVALID_SKU_LIST');
  if(!Number.isInteger(limit) || limit<1 || limit>100) throw Error('LIMIT_MUST_BE_1_TO_100');
  await fs.mkdir(outDir,{recursive:true});
  const manifest={schema_version:1,mode:'READ_ONLY_EVIDENCE_REVIEW',model:model||'qwen3:1.7b',results:[]};
  for(const sku of candidates.slice(0,limit)){
    const bundlePath=path.join(bundleDir,sku+'.json');
    let status='NEEDS_EVIDENCE',reason='OFFICIAL_EVIDENCE_BUNDLE_MISSING',dossier=null;
    try{
      await fs.access(bundlePath);
      const item={sku,duty:'HEAVY_DUTY',discovery_hints:{}};
      const result=await interpret(item,requiredShape(),{directory:bundleDir,allowedHosts,model,compactMode:true,factsOnly:true,timeoutMs:65000});
      dossier=result.dossier;
      // A local LLM extraction is NEVER a certified catalogue record.
      status='REVIEW_REQUIRED';
      reason='OLLAMA_OUTPUT_REQUIRES_DETERMINISTIC_EVIDENCE_AND_CATALOGUE_GATES';
    }catch(error){
      if(error?.code!=='ENOENT'){
        status='REVIEW_ERROR';
        reason=String(error?.message||error).slice(0,250);
      }
    }
    const record={sku,status,reason,axes:dossier?Object.fromEntries(AXES.map(a=>[a,dossier[a]?.status||'UNRESOLVED'])):null};
    manifest.results.push(record);
    await atomicJson(path.join(outDir,sku+'.review.json'),{
      ...record,provider:'HERMES_LOCAL_OLLAMA',
      publication_allowed:false,certification_allowed:false,
      dossier
    });
  }
  manifest.counts=Object.fromEntries(['REVIEW_REQUIRED','REVIEW_ERROR','NEEDS_EVIDENCE'].map(s=>[s,manifest.results.filter(x=>x.status===s).length]));
  await atomicJson(path.join(outDir,'hd-local-review-manifest.json'),manifest);
  return manifest;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const a=flags(process.argv.slice(2));
  const n=Number(a.limit||20);
  if(!a['sku-file'] || !a['bundle-dir'] || !a['out-dir'] || !a['allowed-hosts']) throw Error('REQUIRED_ARGUMENT_MISSING');
  const skus=(await fs.readFile(a['sku-file'],'utf8')).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const report=await reviewHdEvidence({skus,bundleDir:a['bundle-dir'],outDir:a['out-dir'],allowedHosts:a['allowed-hosts'],limit:n,model:a.model});
  console.log(JSON.stringify({mode:report.mode,count:report.results.length,counts:report.counts},null,2));
}
