import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {acquireOfficialBundles,isTrustedOfficialUrl,fetchOfficialWithRedirects} from '../scripts/hermes/hd-official-bundle-acquisition.mjs';
test('allowlist rejects domains that merely contain official domain',()=>{
  assert.equal(isTrustedOfficialUrl('https://donaldson.com.bad.example/a',['donaldson.com']),false);
  assert.equal(isTrustedOfficialUrl('http://donaldson.com/a',['donaldson.com']),false);
  assert.equal(isTrustedOfficialUrl('https://shop.donaldson.com/item',['donaldson.com']),true);
});
test('verified HD source produces exact-code evidence bundle without SQL writes',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'hd-source-'));
  try{
    const db={query:async(sql,params)=>{
      assert.match(sql,/duty='HEAVY_DUTY'/);
      assert.match(sql,/catalog_active=true/);
      assert.deepEqual(params,[['EH60085']]);
      return {rows:[{sku:'EH60085',url:'https://shop.donaldson.com/example',code:'P60085'}]};
    }};
    const fetched=async()=>({ok:true,status:200,headers:{get:()=> 'text/html'},text:async()=>'<html><body>Donaldson official product catalogue P60085 Fuel Filter Dimensions and specifications</body></html>'});
    const r=await acquireOfficialBundles({skus:['EH60085'],directory:dir,allowedHosts:'donaldson.com',client:db,fetcher:fetched});
    assert.equal(r.written,1);
    const bundle=JSON.parse(await readFile(path.join(dir,'EH60085.json'),'utf8'));
    assert.equal(bundle.sku,'EH60085');
    assert.equal(bundle.sources.length,1);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('unverified code is skipped and never produces a bundle',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-source-'));
 try{
  const db={query:async()=>({rows:[{sku:'EH60085',url:'https://shop.donaldson.com/item',code:'P60085'}]})};
  const fetched=async()=>({ok:true,status:200,headers:{get:()=> 'text/html'},text:async()=>'<html>Unrelated filter with dimensions and products</html>'});
  const r=await acquireOfficialBundles({skus:['EH60085'],directory:dir,allowedHosts:'donaldson.com',client:db,fetcher:fetched});
  assert.equal(r.written,0);
  assert.equal(r.results[0].status,'EXACT_CANONICAL_CODE_NOT_ON_SOURCE');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('302 to approved official destination is followed with final source provenance',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-redirect-'));
 try{
  const client={query:async()=>({rows:[{sku:'EA10006',url:'https://shop.donaldson.com/old',code:'P10006'}]})};
  const seen=[];
  const fetcher=async(url,opts)=>{
    seen.push(url);assert.equal(opts.redirect,'manual');
    if(url.endsWith('/old'))return {status:302,ok:false,headers:{get:k=>k==='location'?'/products/P10006':null}};
    return {status:200,ok:true,headers:{get:k=>k==='content-type'?'text/html':null},text:async()=>'<html><body>Official Donaldson P10006 product dimensions and specifications and applications</body></html>'};
  };
  const result=await acquireOfficialBundles({skus:['EA10006'],directory:dir,allowedHosts:'donaldson.com',client,fetcher});
  assert.equal(result.written,1);
  assert.deepEqual(seen,['https://shop.donaldson.com/old','https://shop.donaldson.com/products/P10006']);
  const bundle=JSON.parse(await readFile(path.join(dir,'EA10006.json'),'utf8'));
  assert.equal(bundle.sources[0].url,'https://shop.donaldson.com/products/P10006');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('302 to external domain is blocked without requesting external domain',async()=>{
 let calls=0;
 const result=await fetchOfficialWithRedirects('https://shop.donaldson.com/old',['donaldson.com'],async()=>{
  calls++;return {status:302,ok:false,headers:{get:()=> 'https://evil.example/product'}};
 },new AbortController().signal);
 assert.equal(result.status,'UNTRUSTED_REDIRECT');
 assert.equal(calls,1);
});
test('redirect loops and too many hops are rejected',async()=>{
 const fetcher=async(url)=>({status:301,ok:false,headers:{get:()=>url.endsWith('/a')?'/b':'/a'}});
 const result=await fetchOfficialWithRedirects('https://shop.donaldson.com/a',['donaldson.com'],fetcher,new AbortController().signal);
 assert.equal(result.status,'REDIRECT_LOOP');
});
