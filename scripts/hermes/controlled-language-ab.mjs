// Read-only A/B comparison using existing local official evidence bundles.
// No database, network access except local Ollama, or catalogue writes.
import {execFileSync} from 'node:child_process';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {interpretLocalEvidence as candidate,boundedExcerpt} from './local-evidence-ollama.mjs';

const [directory, ...args] = process.argv.slice(2);
// Each argument is SKU or SKU=CODE. CODE overrides the code inferred from the bundle source URL.
const targets = args.map(a => { const [sku, code] = a.split('='); return {sku, code}; });
if (!directory || !targets.length || targets.length > 6 ||
    targets.some(t => !/^[A-Z0-9_-]{2,45}$/.test(t.sku) || (t.code !== undefined && !/^[A-Za-z0-9][A-Za-z0-9 .\/_-]{0,79}$/.test(t.code)))) {
  throw Error('Usage: node scripts/hermes/controlled-language-ab.mjs BUNDLE_DIR SKU[=CODE] [SKU[=CODE]...] (max 6)');
}
// Without the target code the compact excerpt is chosen by generic English keywords and
// can miss the product row entirely, which makes the comparison meaningless.
function inferCode(bundle) {
  for (const s of bundle.sources || []) {
    try {
      const u = new URL(s.url);
      const q = u.searchParams.get('Ntt');
      if (q) return q;
      const last = u.pathname.split('/').filter(Boolean).pop();
      if (last && /^[A-Za-z0-9][A-Za-z0-9-]{3,}$/.test(last) && /\d/.test(last)) return last;
    } catch { /* unparsable URL: no inference from it */ }
  }
  return null;
}
// Mirrors the factsOnly prompt budget (1150 chars shared across sources).
function excerptHasCode(bundle, code) {
  const escaped = code.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
  const pattern = new RegExp('(?<![A-Za-z0-9])' + escaped + '(?![A-Za-z0-9])', 'i');
  let remaining = 1150;
  for (const s of bundle.sources || []) {
    const excerpt = boundedExcerpt(s.content, code).slice(0, Math.max(0, remaining));
    remaining -= excerpt.length;
    if (pattern.test(excerpt)) return true;
  }
  return false;
}
const hosts = process.env.HERMES_OFFICIAL_SOURCE_HOSTS;
if (!hosts) throw Error('OFFICIAL_SOURCE_ALLOWLIST_REQUIRED');
const baselineCommit='db8b8ea9905b50782dfd8d5b915c6ad5e939523d';
const temp=await mkdtemp(join(tmpdir(),'hermes-ab-'));
let errors=0;
try {
  const baselinePath=join(temp,'baseline.mjs');
  await writeFile(baselinePath,execFileSync('git',['show',baselineCommit+':scripts/hermes/local-evidence-ollama.mjs'],{encoding:'utf8'}));
  const {interpretLocalEvidence:baseline}=await import(pathToFileURL(baselinePath).href);
  for (const {sku, code: explicitCode} of targets) {
    // Copy each original bundle once so both variants see identical bytes.
    let raw;
    try {
      raw = await readFile(join(resolve(directory),sku+'.json'));
      await writeFile(join(temp,sku+'.json'),raw);
    } catch(e) {
      errors++;
      for (const model of ['qwen3:1.7b','qwen3:8b']) {
        for (const variant of ['baseline','controlled']) {
          console.log(JSON.stringify({sku,model,variant,error:e.code || String(e.message),assessment:'BLOCKED'}));
        }
      }
      continue;
    }
    let bundle;
    try { bundle = JSON.parse(raw.toString('utf8')); } catch { bundle = {}; }
    const code = explicitCode || inferCode(bundle);
    if (!code) {
      errors++;
      console.log(JSON.stringify({sku,error:'SOURCE_CANDIDATE_CODE_UNRESOLVED',assessment:'BLOCKED'}));
      continue;
    }
    if (!excerptHasCode(bundle, code)) {
      errors++;
      console.log(JSON.stringify({sku,source_candidate_code:code,excerpt_contains_code:false,error:'CODE_NOT_IN_PROMPT_EXCERPT',assessment:'BLOCKED'}));
      continue;
    }
    for (const model of ['qwen3:1.7b','qwen3:8b']) {
      for (const [variant,run] of [['baseline',baseline],['controlled',candidate]]) {
        const started=Date.now();
        try {
          const result=await run({sku,discovery_hints:{source_candidate_code:code}},{},{directory:temp,allowedHosts:hosts,model,compactMode:true,factsOnly:true,timeoutMs:180000});
          console.log(JSON.stringify({sku,model,variant,source_candidate_code:code,excerpt_contains_code:true,elapsed_ms:Date.now()-started,result,assessment:'HUMAN_REVIEW_REQUIRED'}));
        } catch(e) {
          errors++;
          console.log(JSON.stringify({sku,model,variant,elapsed_ms:Date.now()-started,error:String(e.message),assessment:'BLOCKED'}));
        }
      }
    }
  }
} finally { await rm(temp,{recursive:true,force:true}); }
process.exitCode=errors?1:0;
