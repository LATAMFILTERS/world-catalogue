#!/usr/bin/env node
'use strict';
// Detect source-level hero-image reuse between different site pages.
// EN, ES and PT wrappers that render the same canonical page are one owner.
// This is an inventory check, not a pixel-resolution or visual-similarity test.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../frontend/src/app');
const uses=new Map();
function walk(dir){
 for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const f=path.join(dir,d.name);
  if(d.isDirectory())walk(f);
  else if(/\.(tsx|jsx)$/.test(d.name)){
   const rel=path.relative(root,f).replace(/\\/g,'/');
   const text=fs.readFileSync(f,'utf8');
   const re=/heroBackgroundImage\(\s*['"]([^'"]+)['"]\s*\)/g;
   for(const m of text.matchAll(re)){
    const owner=rel.replace(/^(es|pt)\//,'').replace(/\/page\.tsx$/, '').replace(/\/index\.(tsx|jsx)$/,'');
    const asset=m[1].toLowerCase();
    if(!uses.has(asset))uses.set(asset,new Set());
    uses.get(asset).add(owner);
   }
  }
 }
}
walk(root);
const duplicates=[...uses.entries()].filter(([,owners])=>owners.size>1).map(([asset,owners])=>({asset,pages:[...owners].sort()}));
const report={scannedAssets:uses.size,duplicates,limitations:['Inspects literal heroBackgroundImage usages; dynamic CSS, inline style URLs, videos, child components and visually identical copies with different filenames require further inspection','Does not assess intrinsic image resolution or crop quality']};
const out=process.argv.find(x=>x.startsWith('--out='))?.slice(6);
if(out){fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&duplicates.length)process.exitCode=1;
