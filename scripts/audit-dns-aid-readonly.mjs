#!/usr/bin/env node
// Read-only DNS-AID discovery preflight. No credentials, no writes or submissions.
const origin = 'https://elimfilters.com';
const checks = [];
async function dns(name, type) {
  const url = new URL('https://dns.google/resolve');
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);
  url.searchParams.set('do', 'true');
  const response = await fetch(url, {headers:{accept:'application/dns-json'},signal:AbortSignal.timeout(12000)});
  if (!response.ok) throw new Error('DNS query HTTP '+response.status);
  return response.json();
}
async function checkHttps(path, contentType) {
  try {
    const r=await fetch(origin+path,{headers:{accept:contentType},redirect:'follow',signal:AbortSignal.timeout(12000)});
    const body=await r.text();
    const ok=r.ok && r.url.startsWith(origin+'/') && r.headers.get('content-type')?.includes(contentType) && body.length>0;
    checks.push({check:'https '+path,pass:!!ok,status:r.status,type:r.headers.get('content-type'),finalUrl:r.url,bytes:body.length});
  } catch(e) {checks.push({check:'https '+path,pass:false,error:String(e)});}
}
for(const [name,type] of [['elimfilters.com','DS'],['elimfilters.com','DNSKEY'],['_index._agents.elimfilters.com','SVCB'],['_index._agents.elimfilters.com','HTTPS']]){
  try{
    const r=await dns(name,type);
    checks.push({check:'dns '+type+' '+name,pass:r.Status===0 && !!r.Answer?.length,status:r.Status,ad:r.AD===true,answers:r.Answer?.map(x=>({type:x.type,data:x.data}))??[]});
  }catch(e){checks.push({check:'dns '+type+' '+name,pass:false,error:String(e)});}
}
await checkHttps('/llms.txt','text/plain');
await checkHttps('/robots.txt','text/plain');
await checkHttps('/sitemap-index.xml','application/xml');
await checkHttps('/.well-known/ai-catalog.json','application/json');
const ds=checks.find(x=>x.check==='dns DS elimfilters.com');
const key=checks.find(x=>x.check==='dns DNSKEY elimfilters.com');
const manifest=checks.find(x=>x.check==='https /.well-known/ai-catalog.json');
const verdict=ds?.pass && key?.pass && manifest?.pass ? 'PENDING_MANUAL_SPEC_AND_SECURITY_REVIEW' : 'NO_GO_DNS_AID';
console.log(JSON.stringify({timestamp:new Date().toISOString(),verdict,checks},null,2));
process.exitCode=verdict==='NO_GO_DNS_AID'?1:0;
