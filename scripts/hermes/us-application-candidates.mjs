// Read-only extraction of candidate US MANN vehicle applications.
// Never writes catalog data or certifies compatibility.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const hash = s => crypto.createHash('sha256').update(s,'utf8').digest('hex');
const years = /\b(19\d{2}|20\d{2})\s+Model Type\s+Filter Type\s+Engine Code\s+ccm\s+kW\s+HP\s+Year of Manufacture\b/g;
const rows = /([A-Za-z0-9][A-Za-z0-9 \-]{1,65}?)\s+\(([^)]{4,95})\)\s+Oil Filter\s+([A-Z]\d[A-Z0-9, ]{3,50}?)\s+(\d{3,5}|-)\s+(\d{1,4}|-)\s+(\d{1,4}|-)(?=\s|$)/g;
const clean = s => s.replace(/\s+/g,' ').trim();

export async function extractUsApplicationCandidates({sku,directory}) {
  if (!/^[A-Z0-9_-]{2,45}$/.test(sku) || !directory) throw Error('INVALID_INPUT');
  const bundle=JSON.parse(await fs.readFile(path.join(directory,sku+'.json'),'utf8'));
  if(bundle.sku!==sku || !Array.isArray(bundle.sources) || bundle.sources.length<1 || bundle.sources.length>12)
    throw Error('INVALID_BUNDLE');
  const sources=bundle.sources;
  const u=new URL(sources[0].url);
  if(u.protocol!=='https:' || !/^([a-z0-9-]+\.)*mann-filter\.com$/i.test(u.hostname) || u.username || u.password || u.port)
    throw Error('UNTRUSTED_HOST');
  for(const [i,p] of sources.entries()) {
    if(p.url!==sources[0].url || p.part_index!==i+1 || p.part_count!==sources.length ||
       typeof p.content!=='string' || p.content.length>50000 ||
       hash(p.content)!==p.sha256 || p.full_text_sha256!==sources[0].full_text_sha256)
      throw Error('INVALID_EVIDENCE_PART');
  }
  const text=sources.map(p=>p.content).join(' ');
  if(hash(text)!==sources[0].full_text_sha256) throw Error('INVALID_FULL_TEXT_HASH');
  if(!text.includes('HU 816 x') || !text.includes('BMW (USA)')) throw Error('SOURCE_IDENTITY_NOT_FOUND');
  const boundaries=[...text.matchAll(years)];
  if(!boundaries.length) throw Error('YEAR_TABLES_NOT_FOUND');
  const candidateMap=new Map(); const skipped=[];
  for(let i=0;i<boundaries.length;i++) {
    const start=boundaries[i].index+boundaries[i][0].length;
    const end=i+1<boundaries.length?boundaries[i+1].index:text.length;
    const year=Number(boundaries[i][1]); const section=text.slice(start,end);
    // No inferred year from within rows; only the explicit year table heading.
    const hits=[...section.matchAll(rows)];
    if(!hits.length) {skipped.push({year,reason:'NO_PARSEABLE_ROWS'});continue;}
    for(const m of hits) {
      const model=clean(m[1]).replace(/^.*?\bYear of Manufacture\s*/,'').trim();
      const engineCodes=m[3].split(',').map(clean);
      const contaminated = /\b(?:Oil Filter|Engine Code|Filter Type|Year of Manufacture)\b/i.test(model) ||
        /(?:^|\s)(?:\d{3,5}|-)(?:\s+(?:\d{1,4}|-)){1,2}\s+[A-Za-z0-9]/.test(model);
      if(!model || model.length>65 || contaminated || !engineCodes.every(e=>/^[A-Z]\d[A-Z0-9]{3,15}$/.test(e))) {
        skipped.push({year,reason:'AMBIGUOUS_MODEL_OR_ENGINE'}); continue;
      }
      for(const engine_code of engineCodes) {
        const key=[year,model,engine_code].join('|');
        if(!candidateMap.has(key)) candidateMap.set(key,{
          manufacturer:'BMW',market:'US',year,model,engine_code,
          engine_description:clean(m[2]),filter_type:'Oil Filter',sku,
          status:'REVIEW_REQUIRED',evidence_url:sources[0].url,
          evidence_sha256:sources[0].full_text_sha256,
          evidence_excerpt:clean(m[0]).slice(0,250)
        });
      }
    }
  }
  return {sku,market:'US',source_url:sources[0].url,
    full_text_sha256:sources[0].full_text_sha256,
    year_sections:boundaries.length,candidates:[...candidateMap.values()],skipped,
    status:'REVIEW_REQUIRED',
    warning:'Text-only parsing is preliminary; candidates require independent row-level verification against the original MANN application table.'};
}


// Independent row-level proof from original MANN application-link metadata.
// Deliberately does NOT promote any application into the catalogue.
export async function extractUsStructuredApplications({sku,directory}) {
  if(!/^[A-Z0-9_-]{2,45}$/.test(sku) || !directory) throw Error('INVALID_INPUT');
  const manifest=JSON.parse(await fs.readFile(path.join(directory,sku+'.json'),'utf8'));
  if(manifest.sku!==sku || !Array.isArray(manifest.raw_html_sources) || manifest.raw_html_sources.length!==1)
    throw Error('RAW_HTML_REQUIRED');
  const source=manifest.raw_html_sources[0];
  const u=new URL(source.url);
  if(u.protocol!=='https:' || !/^([a-z0-9-]+\.)*mann-filter\.com$/i.test(u.hostname) ||
    u.username || u.password || u.port) throw Error('UNTRUSTED_HOST');
  if(!/^EL[A-Z0-9_-]*\.source-1\.html$/.test(source.file) || source.file!==sku+'.source-1.html')
    throw Error('INVALID_HTML_PATH');
  const html=await fs.readFile(path.join(directory,source.file),'utf8');
  if(Buffer.byteLength(html,'utf8')!==source.byte_length || hash(html)!==source.sha256)
    throw Error('INVALID_RAW_HTML_HASH');
  const candidates=new Map(), partialCandidates=new Map(), skipped=[];
  const links=/<a\b([^>]*data-g-binding-params="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/gi;
  const decode=s=>s.replace(/&amp;/gi,'&').replace(/&#38;/g,'&');
  for(const match of html.matchAll(links)) {
    const attrs=match[1];
    if(!/data-g-binding-application-link\b/.test(attrs)) continue;
    const params=new URLSearchParams(decodeURIComponent(decode(match[2])).replace(/^\?/,''));
    if(params.get('mode')!=='application' || params.get('vehicleMake')!=='BMW (USA)') continue;
    const yearText=params.get('vehicleModel');
    const name=params.get('vehicleName');
    const engineText=params.get('engineCode');
    const id=params.get('vehicleTypeId');
    const renderedName=match[3].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const year=Number(yearText);
    const engines=(engineText || '').split(',').map(e=>e.trim()).filter(Boolean);
    if(!/^(19|20)\d{2}$/.test(yearText||'') || !Number.isSafeInteger(year) ||
      !name || name!==renderedName || name.length>75 ||
      !/^\d{8,20}$/.test(id||'')) {
      skipped.push({year:yearText||null,vehicle_name:name||null,reason:'INVALID_STRUCTURED_ROW'});
      continue;
    }
    if (!engines.length || !engines.every(e=>/^[A-Z][A-Z0-9]{3,16}$/.test(e))) {
      const key=[year,name,id,engineText||''].join('|');
      if(!partialCandidates.has(key)) partialCandidates.set(key,{
        sku,manufacturer:'BMW',market:'US',year,model:name,vehicle_type_id:id,
        engine_code:null,engine_code_literal:engineText || null,
        evidence_class:engines.length?'ENGINE_CODE_PARTIAL':'ENGINE_NOT_PUBLISHED',
        status:'REVIEW_REQUIRED',evidence_url:source.url,evidence_sha256:source.sha256,
        evidence_binding_params:match[2]
      });
      continue;
    }
    for(const engine_code of engines) {
      const key=[year,name,engine_code,id].join('|');
      if(!candidates.has(key)) candidates.set(key,{
        sku,manufacturer:'BMW',market:'US',year,model:name,engine_code,vehicle_type_id:id,
        status:'REVIEW_REQUIRED',evidence_url:source.url,evidence_sha256:source.sha256,
        evidence_binding_params:match[2]
      });
    }
  }
  return {sku,market:'US',source_url:source.url,raw_html_sha256:source.sha256,
    candidates:[...candidates.values()],partial_candidates:[...partialCandidates.values()],skipped,status:'REVIEW_REQUIRED',
    warning:'A source-side binding is evidence of the listed row, not approval for an ELIMFILTERS application.'};
}
