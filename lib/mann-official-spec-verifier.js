'use strict';

const crypto=require('crypto');

const FETCH_HEADERS={
  'user-agent':'Mozilla/5.0 (compatible; ELIMFILTERS-MANN-Spec-Verifier/1.0; +https://elimfilters.com)',
  'accept-language':'en-US,en;q=0.9',
};

function normalizePart(v){
  return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
}

function mannSlug(code){
  return String(code||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9/()]/g,'');
}

function mannProductUrl(code){
  return `https://www.mann-filter.com/en/catalog/search-results/product.html/${mannSlug(code)}_mann-filter.html`;
}

function mannProductUrls(code,rawCode){
  const slugs=[...new Set([rawCode,code].filter(Boolean).map(mannSlug))];
  const locales=['en','us-en'];
  const urls=[];
  for(const slug of slugs){
    for(const locale of locales){
      urls.push(`https://www.mann-filter.com/${locale}/catalog/search-results/product.html/${slug}_mann-filter.html`);
    }
  }
  return [...new Set(urls)];
}

function decodeHtml(s){
  return String(s||'')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function parseMm(value){
  const m=/(-?\d+(?:[.,]\d+)?)\s*mm\b/i.exec(String(value||''));
  if(!m) return null;
  const n=Number(m[1].replace(',','.'));
  return Number.isFinite(n)?n:null;
}

const LABELS=[
  ['Inner diameter of gasket','gasket_id_mm'],
  ['Outer diameter of gasket','gasket_od_mm'],
  ['Outer diameter 1','outer_diameter_1_mm'],
  ['Outer diameter','outer_diameter_mm'],
  ['Inner diameter 1','inner_diameter_1_mm'],
  ['Inner diameter','inner_diameter_mm'],
  ['Inlet','inlet_mm'],
  ['Outlet','outlet_mm'],
  ['Height','height_mm'],
  ['Length','product_length_mm'],
  ['Width','product_width_mm'],
];

function parseMannSummary(html){
  const match=String(html||'').match(/<div class="cmp-product__summary">([\s\S]*?)<\/div>\s*<\/div>/i);
  const summary=decodeHtml(match?match[1]:'');
  const values={};
  for(const [label,key] of LABELS){
    const re=new RegExp(`${label.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')}(?:\\s+1)?(?:\\s*\\([^)]*\\))?\\s*=\\s*([^;]+)`,'i');
    const m=re.exec(summary);
    if(m){
      const mm=parseMm(m[1]);
      if(mm!=null) values[key]=mm;
    }
  }
  const thread=/Thread Size(?:\s*\([^)]*\))?\s*=\s*([^;]+)/i.exec(summary);
  if(thread) values.thread_size=thread[1].trim();
  return {summary,values};
}

function verifyProductIdentity(html,code){
  const titleMatch=String(html||'').match(/<title>([^<]+)<\/title>/i);
  const title=decodeHtml(titleMatch?titleMatch[1]:'');
  const expected=normalizePart(code);
  return {
    valid:/MANN-FILTER/i.test(title)&&normalizePart(title).includes(expected),
    title,
    expected,
  };
}

function semanticSpecs(values){
  const out=[];
  const mapping=[
    ['Outer diameter','outer_diameter_mm','mm'],
    ['Outer diameter 1','outer_diameter_1_mm','mm'],
    ['Inner diameter','inner_diameter_mm','mm'],
    ['Inner diameter 1','inner_diameter_1_mm','mm'],
    ['Inner diameter of gasket','gasket_id_mm','mm'],
    ['Outer diameter of gasket','gasket_od_mm','mm'],
    ['Inlet','inlet_mm','mm'],
    ['Outlet','outlet_mm','mm'],
    ['Length','product_length_mm','mm'],
    ['Width','product_width_mm','mm'],
    ['Height','height_mm','mm'],
    ['Thread Size','thread_size',''],
  ];
  for(const [key,field,unit] of mapping){
    if(values[field]!=null) out.push([key,unit?`${values[field]} ${unit}`:String(values[field])]);
  }
  return out;
}

async function fetchOfficialMannSpecs(code,{timeoutMs=20000,rawCode=null}={}){
  const urls=mannProductUrls(code,rawCode);
  const failures=[];
  for(const url of urls){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetch(url,{redirect:'follow',signal:controller.signal,headers:FETCH_HEADERS});
      if(!response.ok){
        failures.push({reason:'HTTP_ERROR',status:response.status,url});
        continue;
      }
      const html=await response.text();
      const identity=verifyProductIdentity(html,code);
      if(!identity.valid){
        failures.push({reason:'IDENTITY_MISMATCH',status:response.status,url:response.url||url,identity});
        continue;
      }
      const parsed=parseMannSummary(html);
      if(!Object.keys(parsed.values).length){
        failures.push({reason:'NO_DIMENSIONS',status:response.status,url:response.url||url,identity,summary:parsed.summary});
        continue;
      }
      return {
        ok:true,
        status:response.status,
        url:response.url||url,
        identity,
        summary:parsed.summary,
        values:parsed.values,
        specs:semanticSpecs(parsed.values),
        sha256:crypto.createHash('sha256').update(html).digest('hex'),
      };
    }catch(error){
      failures.push({reason:error.name==='AbortError'?'TIMEOUT':'FETCH_FAILED',error:error.message,url});
    }finally{
      clearTimeout(timer);
    }
  }
  return {ok:false,reason:'OFFICIAL_URLS_EXHAUSTED',attempts:failures,url:urls[0]||null};
}

module.exports={
  normalizePart,
  mannProductUrl,
  parseMm,
  parseMannSummary,
  verifyProductIdentity,
  semanticSpecs,
  fetchOfficialMannSpecs,
};
