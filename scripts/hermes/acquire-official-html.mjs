// Acquire official HTML evidence from operator-curated HTTPS URLs.
// Does not discover URLs, parse PDFs, call LLMs, or access databases.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const cleanHost = value => String(value||'').trim().toLowerCase();
function validateUrl(raw, hosts) {
  const u = new URL(raw);
  const host = cleanHost(u.hostname);
  if (u.protocol !== 'https:' || u.username || u.password || u.port ||
      !hosts.some(h => host === h || host.endsWith('.' + h)))
    throw new Error('UNAPPROVED_EVIDENCE_URL');
  return u.href;
}
export async function acquireOfficialHtml({sku, urls, directory, allowedHosts, fetcher = fetch}) {
  if (!/^[A-Z0-9_-]{2,45}$/.test(String(sku||''))) throw new Error('INVALID_SKU');
  if (!directory || !path.isAbsolute(directory)) throw new Error('ABSOLUTE_OUTPUT_DIRECTORY_REQUIRED');
  const hosts=String(allowedHosts||'').split(',').map(cleanHost).filter(h => /^[a-z0-9.-]+$/.test(h));
  if (!hosts.length) throw new Error('OFFICIAL_SOURCE_ALLOWLIST_REQUIRED');
  if (!Array.isArray(urls) || !urls.length || urls.length > 12) throw new Error('INVALID_URL_COUNT');
  const sources=[];
  for (const raw of urls) {
    const target=validateUrl(raw,hosts);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    let response;
    try { response=await fetcher(target,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'ELIMFILTERS-HERMES-Evidence-Acquisition/1.0'}}); }
    finally { clearTimeout(timeout); }
    // Never follow an uninspected redirect or accept opaque PDF bytes as text.
    if (!response.ok || response.redirected || response.status>=300 && response.status<400)
      throw new Error('EVIDENCE_FETCH_UNAVAILABLE_'+response.status);
    validateUrl(response.url||target,hosts);
    const mime=(response.headers.get('content-type')||'').toLowerCase();
    if (!/^text\/(html|plain)(?:;|$)/.test(mime)) throw new Error('EVIDENCE_NOT_TEXT_HTML');
    const size=Number(response.headers.get('content-length')||'0');
    if (size>250000) throw new Error('EVIDENCE_TOO_LARGE');
    const rawText=await response.text();
    if (rawText.length>250000) throw new Error('EVIDENCE_TOO_LARGE');
    const cleaned=rawText.replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    if (!cleaned || cleaned.length>50000) throw new Error('EVIDENCE_CONTENT_INVALID');
    sources.push({url:response.url||target,source_type:'official_product_page',content:cleaned,
      sha256:crypto.createHash('sha256').update(cleaned,'utf8').digest('hex')});
  }
  const destination=path.join(directory,sku+'.json');
  await fs.mkdir(directory,{recursive:true});
  await fs.writeFile(destination,JSON.stringify({sku,sources},null,2)+'\n',{flag:'wx',mode:0o600});
  return {sku,source_count:sources.length,file:destination};
}
