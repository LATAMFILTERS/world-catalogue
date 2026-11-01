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
for(const [name,type] of [['elimfilters.com','DS'],['elimfilters.com','DNSKEY'],['_index._agents.elimfilters.com','SVCB'],['_index._agents.elimfilters.com','TXT'],['_public-discovery._https._agents.elimfilters.com','SVCB']]){
  try{
    const r=await dns(name,type);
    checks.push({check:'dns '+type+' '+name,pass:r.Status===0 && !!r.Answer?.length,status:r.Status,ad:r.AD===true,answers:r.Answer?.map(x=>({type:x.type,data:x.data}))??[]});
  }catch(e){checks.push({check:'dns '+type+' '+name,pass:false,error:String(e)});}
}
// MCP is externally reachable, but MUST reject unauthenticated capability discovery.
// Never send bearer tokens or call MCP tools during DNS-AID preflight.
try {
  const r=await fetch('https://crm-api.elimfilters.com/mcp',{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{}}),
    redirect:'manual',
    signal:AbortSignal.timeout(12000)
  });
  checks.push({check:'mcp anonymous tools/list denied',pass:r.status===401,status:r.status});
} catch(e) {checks.push({check:'mcp anonymous tools/list denied',pass:false,error:String(e)});}

await checkHttps('/llms.txt','text/plain');
await checkHttps('/robots.txt','text/plain');
await checkHttps('/sitemap-index.xml','application/xml');
await checkHttps('/.well-known/ai-catalog.json','application/json');
await checkHttps('/.well-known/public-discovery-agent.json','application/json');
// The DNS-AID reference index is a TXT inventory, not an SVCB alias.
// A published SVCB pointer alone must never be reported as agent readiness.
try {
  const r=await fetch(origin+'/.well-known/agent-registry.json',{
    headers:{accept:'application/json'},redirect:'follow',signal:AbortSignal.timeout(12000)
  });
  const registry=r.ok && r.url===origin+'/.well-known/agent-registry.json' ? await r.json() : null;
  const active=registry?.status==='ACTIVE' && registry?.dnsAidAdvertised===true &&
    Array.isArray(registry?.agents) && registry.agents.length>0;
  checks.push({check:'public agent registry activation',pass:active,status:r.status,
    registryStatus:registry?.status??null,advertised:registry?.dnsAidAdvertised===true,
    publicAgentCount:Array.isArray(registry?.agents)?registry.agents.length:null});
} catch(e) {checks.push({check:'public agent registry activation',pass:false,error:String(e)});}

const ds=checks.find(x=>x.check==='dns DS elimfilters.com');
const key=checks.find(x=>x.check==='dns DNSKEY elimfilters.com');
const manifest=checks.find(x=>x.check==='https /.well-known/ai-catalog.json');
const mcpDeny=checks.find(x=>x.check==='mcp anonymous tools/list denied');
const dnsIndex=checks.find(x=>x.check==='dns TXT _index._agents.elimfilters.com');
const registry=checks.find(x=>x.check==='public agent registry activation');
const agentSvcb=checks.find(x=>x.check==='dns SVCB _public-discovery._https._agents.elimfilters.com');
const discoveryDoc=checks.find(x=>x.check==='https /.well-known/public-discovery-agent.json');
const agentsInIndex=dnsIndex?.answers?.some(x=>x.type===16 && x.data.includes('agents=public-discovery:https'))===true;
const expectedTarget=agentSvcb?.answers?.some(x=>x.type===64 && /^1\s+elimfilters\.com\.?\s*(?:$|\s)/i.test(x.data))===true;
// A reachable authenticated MCP service is NOT itself an approved public agent registry.
// DNSSEC AD, authorized discovery records, and public capability review are separate gates.
const verdict=ds?.pass && key?.pass && ds?.ad && key?.ad && manifest?.pass && mcpDeny?.pass && dnsIndex?.pass && dnsIndex?.ad && agentsInIndex && registry?.pass && agentSvcb?.pass && agentSvcb?.ad && expectedTarget && discoveryDoc?.pass
  ? 'PENDING_MANUAL_SPEC_AND_SECURITY_REVIEW' : 'NO_GO_DNS_AID';
console.log(JSON.stringify({timestamp:new Date().toISOString(),verdict,checks},null,2));
process.exitCode=verdict==='NO_GO_DNS_AID'?1:0;
