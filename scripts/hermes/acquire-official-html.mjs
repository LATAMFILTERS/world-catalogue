// Acquire official HTML evidence from operator-curated HTTPS URLs.
// Does not discover URLs, parse PDFs, call LLMs, or access databases.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const MAX_RAW_BYTES = 4 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 50000;
const cleanHost = value => String(value||'').trim().toLowerCase();
function validateUrl(raw, hosts) {
  const u = new URL(raw);
  const host = cleanHost(u.hostname);
  if (u.protocol !== 'https:' || u.username || u.password || u.port ||
      !hosts.some(h => host === h || host.endsWith('.' + h)))
    throw new Error('UNAPPROVED_EVIDENCE_URL');
  return u.href;
}
export async function acquireOfficialHtml({sku, urls, directory, allowedHosts, splitOversizedText = false, preserveHtml = false, fetcher = fetch}) {
  if (!/^[A-Z0-9_-]{2,45}$/.test(String(sku||''))) throw new Error('INVALID_SKU');
  if (!directory || !path.isAbsolute(directory)) throw new Error('ABSOLUTE_OUTPUT_DIRECTORY_REQUIRED');
  const hosts=String(allowedHosts||'').split(',').map(cleanHost).filter(h => /^[a-z0-9.-]+$/.test(h));
  if (!hosts.length) throw new Error('OFFICIAL_SOURCE_ALLOWLIST_REQUIRED');
  if (!Array.isArray(urls) || !urls.length || urls.length > 12) throw new Error('INVALID_URL_COUNT');
  const sources=[];
  const rawDocuments=[];
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
    if (size>MAX_RAW_BYTES) throw new Error('EVIDENCE_TOO_LARGE');
    // Consume with a strict byte budget, including when Content-Length is absent.
    let rawText;
    if (response.body && typeof response.body.getReader === 'function') {
      const reader=response.body.getReader();
      const chunks=[];let total=0;
      try {
        while (true) {
          const {done,value}=await reader.read();
          if(done)break;
          total+=value.byteLength;
          if(total>MAX_RAW_BYTES) throw new Error('EVIDENCE_TOO_LARGE');
          chunks.push(value);
        }
      } finally {await reader.cancel().catch(()=>{});}
      rawText=new TextDecoder().decode(Buffer.concat(chunks.map(c=>Buffer.from(c))));
    } else {
      // Compatibility with injected test fetchers without a streamed body.
      rawText=await response.text();
      if(Buffer.byteLength(rawText,'utf8')>MAX_RAW_BYTES)throw new Error('EVIDENCE_TOO_LARGE');
    }
    if (preserveHtml && !/^text\/html(?:;|$)/.test(mime)) throw new Error('RAW_EVIDENCE_REQUIRES_HTML');
    if (preserveHtml) rawDocuments.push({url:response.url||target, html:rawText,
      sha256:crypto.createHash('sha256').update(rawText,'utf8').digest('hex')});
    const cleaned=rawText.replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    if (!cleaned) throw new Error('EVIDENCE_CONTENT_INVALID');
    if (cleaned.length > MAX_EXTRACTED_CHARS && !splitOversizedText)
      throw new Error('EVIDENCE_CONTENT_INVALID');
    const parts = [];
    if (splitOversizedText) {
      let remaining = cleaned;
      while (remaining.length) {
        if (parts.length + sources.length >= 12) throw new Error('EVIDENCE_TOO_MANY_PARTS');
        if (remaining.length <= MAX_EXTRACTED_CHARS) {
          parts.push(remaining); break;
        }
        const cut = remaining.lastIndexOf(' ', MAX_EXTRACTED_CHARS);
        if (cut < Math.floor(MAX_EXTRACTED_CHARS / 2)) throw new Error('EVIDENCE_NO_SAFE_SPLIT');
        parts.push(remaining.slice(0,cut));
        remaining = remaining.slice(cut+1);
      }
    } else parts.push(cleaned);
    const fullTextSha256 = crypto.createHash('sha256').update(cleaned,'utf8').digest('hex');
    for (const [index,part] of parts.entries()) {
      sources.push({url:response.url||target,source_type:'official_product_page',
        content:part,sha256:crypto.createHash('sha256').update(part,'utf8').digest('hex'),
        part_index:index+1,part_count:parts.length,full_text_sha256:fullTextSha256});
    }
  }
  const destination=path.join(directory,sku+'.json');
  await fs.mkdir(directory,{recursive:true});
  // New capture directories only: never overwrite existing evidence bundles or HTML.
  const manifest={sku,sources};
  if (preserveHtml) {
    const rawFiles=rawDocuments.map((doc,i)=>({
      url:doc.url, file:sku+'.source-'+(i+1)+'.html',
      sha256:doc.sha256,
      byte_length:Buffer.byteLength(doc.html,'utf8')
    }));
    manifest.raw_html_sources=rawFiles;
    const written=[];
    try {
      for (const [i,doc] of rawDocuments.entries()) {
        const dest=path.join(directory,rawFiles[i].file);
        await fs.writeFile(dest,doc.html,{flag:'wx',mode:0o600});
        written.push(dest);
      }
      await fs.writeFile(destination,JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
    } catch(error) {
      for (const dest of written) await fs.rm(dest,{force:true});
      throw error;
    }
  } else {
    await fs.writeFile(destination,JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
  }
  return {sku,source_count:sources.length,file:destination,
    ...(preserveHtml?{raw_html_sources:manifest.raw_html_sources}: {})};
}
