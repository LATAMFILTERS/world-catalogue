import {writeFileSync,mkdirSync} from 'node:fs';
import {htmlToMarkdown} from './index.mjs';

const ORIGIN='https://elimfilters.com';
const CAP=Number(process.env.MARKDOWN_AUDIT_LIMIT||300);
const CONCURRENCY=Number(process.env.MARKDOWN_AUDIT_CONCURRENCY||6);
const OUTPUT='out/markdown-audit';
const escapeXml=s=>s.replace(/&amp;/g,'&');
const get=async(url,accept='text/html')=>{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
  try {
    const response=await fetch(url,{signal:ctrl.signal,headers:{Accept:accept,'User-Agent':'ELIMFILTERS-markdown-batch-audit/1.0'}});
    return {status:response.status,ct:response.headers.get('content-type')||'',vary:response.headers.get('vary')||'',body:await response.text()};
  } finally {clearTimeout(timer);}
};
const mainContent=html=>(html.match(/<main\\b[^>]*>([\\s\\S]*?)<\\/main>/i)||[])[1]||'';
const scrub=s=>s.replace(/<(script|style|svg|noscript|template)\\b[^>]*>[\\s\\S]*?<\\/\\1>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ');
const units=['kPa','ISO 8573','bar','°C','micron','µm','psi','mm'];
async function discover(){
  const queue=[ORIGIN+'/sitemap.xml'],seen=new Set(),pages=new Set(),errors=[];
  while(queue.length&&seen.size<75&&pages.size<CAP){
    const url=queue.shift();if(seen.has(url))continue;seen.add(url);
    try{
      const r=await get(url,'application/xml');if(r.status!==200){errors.push({url,status:r.status});continue;}
      const locs=[...r.body.matchAll(/<loc[^>]*>([\\s\\S]*?)<\\/loc>/gi)].map(m=>escapeXml(m[1].trim()));
      for(const loc of locs){
        if(!loc.startsWith(ORIGIN+'/'))continue;
        if(/\\.xml(?:\\?|$)/i.test(loc)){if(!seen.has(loc))queue.push(loc);}
        else if(/\\/(?:es\\/|pt\\/)?knowledge-center\\//i.test(loc))pages.add(loc);
        if(pages.size>=CAP)break;
      }
    }catch(e){errors.push({url,error:String(e)});}
  }
  return {urls:[...pages],sitemaps:[...seen],errors};
}
async function audit(url){
  const result={url,locale:url.includes('/pt/')?'pt':url.includes('/es/')?'es':'en',status:'FAIL',issues:[],tables:0};
  try {
    const html=await get(url);result.http=html.status;
    if(html.status!==200||!html.ct.includes('text/html')){result.issues.push('HTML_NOT_200');return result;}
    const main=mainContent(html.body);
    const md=htmlToMarkdown(html.body,url);
    result.htmlBytes=html.body.length;result.markdownBytes=md.length;
    result.tables=(main.match(/<table\\b/gi)||[]).length;
    if(!md.includes('Source: '+url))result.issues.push('NON_CANONICAL_SOURCE');
    if(md.includes('elimfilters-frontend.onrender.com'))result.issues.push('RENDER_HOST_LEAK');
    if(md.length<150)result.issues.push('SHORT_MARKDOWN');
    if(result.tables&&!(md.match(/^\\|.*\\|$/gm)||[]).length)result.issues.push('MISSING_TABLE');
    const visible=scrub(main);
    result.units=units.filter(u=>visible.includes(u)).map(u=>({unit:u,retained:md.includes(u)}));
    for(const {unit,retained} of result.units)if(!retained)result.issues.push('UNIT_MISSING:'+unit);
    // Test deployed Markdown only when the zone route actually returns Markdown.
    if(url.includes('/knowledge-center/')){
      const pub=await get(url,'text/markdown');
      result.publicHttp=pub.status;result.publicContentType=pub.ct;
      if(pub.ct.includes('text/markdown')){
        result.publicMarkdown=true;
        if(!pub.body.includes('Source: '+url))result.issues.push('PUBLIC_SOURCE_INVALID');
      }else result.publicMarkdown=false; // Not necessarily a configured Cloudflare route.
    }
    result.status=result.issues.length?'FAIL':'PASS';
  }catch(e){result.issues.push('FETCH_ERROR:'+String(e));}
  return result;
}
async function main(){
  const found=await discover();
  const urlSet=new Set(found.urls);
  // Explicit anchors guarantee ES/EN/PT checks even if sitemap omits a locale.
  for(const p of ['/es/knowledge-center/','/knowledge-center/','/pt/knowledge-center/'])urlSet.add(ORIGIN+p);
  const urls=[...urlSet].slice(0,CAP);
  const results=new Array(urls.length);
  let next=0;
  await Promise.all(Array.from({length:CONCURRENCY},async()=>{
    while(next<urls.length){const i=next++;results[i]=await audit(urls[i]);}
  }));
  const counts={total:results.length,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length,htmlTables:results.reduce((s,r)=>s+r.tables,0),publicMarkdown:results.filter(r=>r.publicMarkdown).length};
  const report={generatedAt:new Date().toISOString(),scope:'Public Knowledge Center, ES/EN/PT; bounded sitemap discovery',counts,sitemaps:found.sitemaps,sitemapErrors:found.errors,results};
  mkdirSync(OUTPUT,{recursive:true});
  writeFileSync(OUTPUT+'/report.json',JSON.stringify(report,null,2));
  writeFileSync(OUTPUT+'/summary.md',[
    '# ELIMFILTERS Markdown batch audit','',
    '| Metric | Count |','|---|---:|',
    ...Object.entries(counts).map(([key,v])=>`| ${key} | ${v} |`),'',
    '## Failures',...results.filter(r=>r.issues.length).map(r=>`- ${r.url}: ${r.issues.join(', ')}`),
    '',found.errors.length?'## Sitemap errors':'',
    ...found.errors.map(e=>'- '+JSON.stringify(e)),
    '',counts.htmlTables===0?'Coverage gap: no real HTML tables were found in scanned pages.':''
  ].join('\\n'));
  console.log(JSON.stringify({counts,examples:results.filter(r=>r.issues.length).slice(0,12),sitemapErrors:found.errors.slice(0,5)},null,2));
  // Findings are reported, not swept into false PASS. Fail on missing page availability;
  // content findings are a remediation queue for one grouped PR review.
  if(!counts.total||results.some(r=>r.issues.includes('HTML_NOT_200')))process.exitCode=1;
}
await main();
