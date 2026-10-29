#!/usr/bin/env node
// Read-only production verification for Cloudflare agent discovery/delivery.
// Separate optional capability checks from existing AEO and catalogue governance.
const BASE = 'https://elimfilters.com/';
const cases = [
  {name:'browser-html',headers:{Accept:'text/html'}},
  {name:'agent-markdown',headers:{Accept:'text/markdown'}},
];
const results=[];
for(const test of cases){
  try{
    const res=await fetch(BASE,{headers:{...test.headers,'Cache-Control':'no-cache'},redirect:'follow',signal:AbortSignal.timeout(25000)});
    const contentType=res.headers.get('content-type')||'';
    const links=res.headers.get('link')||'';
    results.push({name:test.name,status:res.status,contentType,hasLinkHeader:Boolean(links),linkHeader:links||null,cfCacheStatus:res.headers.get('cf-cache-status'),vary:res.headers.get('vary')});
  }catch(e){results.push({name:test.name,error:String(e)});}
}
const html=results.find(r=>r.name==='browser-html');
const md=results.find(r=>r.name==='agent-markdown');
const checks={
  html: html?.status===200&&/^text\/html\b/i.test(html.contentType||''),
  linkDiscovery:html?.status===200&&/\/llms\.txt|\/sitemap-index\.xml|\/sitemap\.xml/.test(html.linkHeader||''),
  markdownDelivery:md?.status===200&&/^text\/markdown\b/i.test(md.contentType||''),
};
const report={scope:'agent-discovery-and-content-negotiation',readOnly:true,checkedAt:new Date().toISOString(),checks,results};
console.log(JSON.stringify(report,null,2));
if(!checks.html)process.exitCode=2;
// The optional checks are advisory, not a build gate, and must not change SKU/AEO validation.
