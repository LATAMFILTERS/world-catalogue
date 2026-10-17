import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validator=path.join(repo,'scripts/validate-universal-knowledge-governance.mjs');
const source=fs.readFileSync(path.join(repo,'frontend/src/app/legal/cross-reference/page.tsx'),'utf8');
const signature=/\bFRAM\b|fram\.com|fram_ld_\d+/i;
const fixtureDirs=[];
test.after(()=>{
  const tempBase=path.resolve(os.tmpdir());
  for(const dir of fixtureDirs){
    const target=path.resolve(dir);
    if(path.dirname(target)!==tempBase||!path.basename(target).startsWith('elim-legal-governance-'))throw new Error('Refusing to remove a path outside the created test fixtures');
    fs.rmSync(target,{recursive:true,force:true});
  }
});
const fixture=()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'elim-legal-governance-'));
  fixtureDirs.push(dir);
  fs.mkdirSync(path.join(dir,'frontend/src/app/legal/cross-reference'),{recursive:true});
  fs.writeFileSync(path.join(dir,'frontend/src/app/legal/cross-reference/page.tsx'),source);
  const localePaths=[];
  for(const lang of ['en','es','pt']){
    const data=JSON.parse(fs.readFileSync(path.join(repo,`frontend/public/locales/${lang}/translation.json`),'utf8'));
    const reviewedCopy=Object.fromEntries(Object.entries(data.reviewedCopy).filter(([,value])=>typeof value==='string'&&signature.test(value)));
    assert.equal(Object.keys(reviewedCopy).length,2,'Exactly the original full XR body and attribution paragraph contain the trademark');
    const file=path.join(dir,`frontend/out/locales/${lang}/translation.json`);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify({reviewedCopy}));localePaths.push(file);
  }
  return {dir,localePaths};
};
function run(dir){return spawnSync(process.execPath,[validator,'--out'],{cwd:dir,encoding:'utf8'});}
test('three legal translations pass without changing public files or brand attribution',()=>{
  const {dir,localePaths}=fixture(),before=localePaths.map(file=>fs.readFileSync(file,'utf8'));
  const result=run(dir);assert.equal(result.status,0,result.stdout+result.stderr);
  assert.deepEqual(localePaths.map(file=>fs.readFileSync(file,'utf8')),before);
});
test('a competitor evidence claim in another translation key remains blocked',()=>{
  const {dir,localePaths}=fixture(),bundle=JSON.parse(fs.readFileSync(localePaths[0],'utf8'));bundle.reviewedCopy.unrelatedTechnicalClaim='FRAM confirms technical performance';fs.writeFileSync(localePaths[0],JSON.stringify(bundle));
  const result=run(dir);assert.equal(result.status,1);assert.match(result.stderr,/external evidence signature/);
});
for(const forbidden of ['https://www.fram.com/technical-source','fram_ld_03','Additional FRAM technical evidence'])test('legal keys cannot exempt '+forbidden,()=>{
  const {dir,localePaths}=fixture(),bundle=JSON.parse(fs.readFileSync(localePaths[0],'utf8')),key=Object.keys(bundle.reviewedCopy)[0];bundle.reviewedCopy[key]+=' '+forbidden;fs.writeFileSync(localePaths[0],JSON.stringify(bundle));
  const result=run(dir);assert.equal(result.status,1);assert.match(result.stderr,/external evidence signature/);
});
test('knowledge outputs remain blocked even with the same legal content',()=>{
  const {dir,localePaths}=fixture(),target=path.join(dir,'frontend/out/knowledge-center/example.json');fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(localePaths[0],target);
  const result=run(dir);assert.equal(result.status,1);assert.equal(result.stderr.includes(path.join('knowledge-center','example.json')),true);
});
