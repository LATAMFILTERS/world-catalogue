// Read-only A/B comparison using existing local official evidence bundles.
// No database, network access except local Ollama, or catalogue writes.
import {execFileSync} from 'node:child_process';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {interpretLocalEvidence as candidate} from './local-evidence-ollama.mjs';

const [directory, ...skus] = process.argv.slice(2);
if (!directory || !skus.length || skus.length > 6 || skus.some(s=>!/^[A-Z0-9_-]{2,45}$/.test(s))) {
  throw Error('Usage: node scripts/hermes/controlled-language-ab.mjs BUNDLE_DIR SKU [SKU...] (max 6)');
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
  for (const sku of skus) {
    // Copy each original bundle once so both variants see identical bytes.
    try {
      await writeFile(join(temp,sku+'.json'),await readFile(join(resolve(directory),sku+'.json')));
    } catch(e) {
      errors++;
      for (const model of ['qwen3:1.7b','qwen3:8b']) {
        for (const variant of ['baseline','controlled']) {
          console.log(JSON.stringify({sku,model,variant,error:e.code || String(e.message),assessment:'BLOCKED'}));
        }
      }
      continue;
    }
    for (const model of ['qwen3:1.7b','qwen3:8b']) {
      for (const [variant,run] of [['baseline',baseline],['controlled',candidate]]) {
        const started=Date.now();
        try {
          const result=await run({sku},{},{directory:temp,allowedHosts:hosts,model,compactMode:true,factsOnly:true,timeoutMs:180000});
          console.log(JSON.stringify({sku,model,variant,elapsed_ms:Date.now()-started,result,assessment:'HUMAN_REVIEW_REQUIRED'}));
        } catch(e) {
          errors++;
          console.log(JSON.stringify({sku,model,variant,elapsed_ms:Date.now()-started,error:String(e.message),assessment:'BLOCKED'}));
        }
      }
    }
  }
} finally { await rm(temp,{recursive:true,force:true}); }
process.exitCode=errors?1:0;
