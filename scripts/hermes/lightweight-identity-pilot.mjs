// Small, read-only technical extraction pilot. Never certifies or writes catalogue data.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const normalize = x => String(x ?? '').toUpperCase().replace(/[^A-Z0-9]/g,'');
export async function extractTechnicalIdentity({sku, sourceCode, directory, allowedHost = 'mann-filter.com', model = 'qwen3:1.7b', fetcher = fetch}) {
  if (!/^[A-Z0-9_-]{2,45}$/.test(String(sku))) throw Error('INVALID_SKU');
  if (!sourceCode || !directory) throw Error('MISSING_INPUT');
  const bundle = JSON.parse(await fs.readFile(path.join(directory,sku+'.json'),'utf8'));
  if(bundle.sku !== sku || bundle.sources?.length !== 1) throw Error('INVALID_BUNDLE');
  const source = bundle.sources[0];
  const url = new URL(source.url);
  if (url.protocol !== 'https:' || !(url.hostname === allowedHost || url.hostname.endsWith('.'+allowedHost))) throw Error('UNTRUSTED_HOST');
  if (crypto.createHash('sha256').update(source.content).digest('hex') !== source.sha256) throw Error('INVALID_SHA256');
  const code = normalize(sourceCode);
  const content = String(source.content);
  if (!normalize(content).includes(code)) throw Error('SOURCE_CODE_NOT_VISIBLE');
  // Select a small window around the exact candidate, then any dimensions observed in that window.
  const flat = content.replace(/\s+/g,' ');
  const index = normalize(flat).indexOf(code);
  // Use the source string as-is, rather than normalized offsets, when locating the anchor.
  const pattern = sourceCode.trim().split(/\s+/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s*');
  const match = new RegExp(pattern,'i').exec(flat);
  const anchor = match?.index ?? 0;
  const snippet = flat.slice(Math.max(0,anchor-300),Math.min(flat.length,anchor+2700));
  const request = {model,stream:false,think:false,format:'json',options:{temperature:0,num_ctx:2048,num_predict:250},
    messages:[
      {role:'system',content:'Extract only explicit facts from supplied product text. JSON fields: source_code, product_type, outer_diameter_mm, inner_diameter_mm, height_mm. Use null for absent facts. Do not infer or certify.'},
      {role:'user',content:snippet}
    ]};
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(),120000);
  let response;
  try {response=await fetcher('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request),signal:ctrl.signal});}
  finally {clearTimeout(timer);}
  if(!response.ok) throw Error('OLLAMA_HTTP_'+response.status);
  const output = JSON.parse((await response.json()).message?.content ?? '{}');
  const observedCode = normalize(output.source_code);
  const codeValid = observedCode === code;
  const attributes = ['outer_diameter_mm','inner_diameter_mm','height_mm'];
  const checked = {};
  for (const key of attributes) {
    const value=output[key];
    // A number's presence somewhere in a page does not establish that it represents this dimension.
    checked[key]={value:typeof value==='number'&&Number.isFinite(value)?value:null,status:'REVIEW_REQUIRED'};
  }
  return {sku,expected_source_code:sourceCode,model,code_observed:output.source_code ?? null,
    code_exact:codeValid,product_type:output.product_type ?? null,dimensions:checked,
    evidence_url:source.url,evidence_sha256:source.sha256,status:'REVIEW_REQUIRED',
    warning:'A product-page mention and LLM extraction do not certify fitment or any dimension.'};
}
