#!/usr/bin/env node
// Knowledge Center inventory and three-language structural review.
// Non-destructive: reports warnings separately from hard locale coverage failures.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'frontend/src/lib/knowledge-center-data/i18n');
const titles=fs.readFileSync(path.join(source,'titles.ts'),'utf8');
const families=[
 ['ARTICLE','TRANSLATED_ARTICLE_SLUGS',''],
 ['STANDARD','TRANSLATED_STANDARD_SLUGS','standards'],
 ['GLOSSARY','TRANSLATED_GLOSSARY_SLUGS','glossary'],
 ['TECHNOLOGY','TRANSLATED_TECHNOLOGY_SLUGS','technologies'],
 ['SYSTEM','TRANSLATED_SYSTEM_SLUGS','systems'],
 ['INDUSTRY','TRANSLATED_INDUSTRY_SLUGS','industries'],
 ['PROBLEM','TRANSLATED_PROBLEM_SLUGS','problems'],
 ['COMPARISON','TRANSLATED_COMPARISON_SLUGS','comparisons'],
 ['DIAGRAM','TRANSLATED_DIAGRAM_SLUGS','diagrams'],
];
const findings=[];const inventory=[];let checked=0;
const routeFiles = {
 ARTICLE:'engineering/[topic]/page.tsx',STANDARD:'standards/[standard]/page.tsx',GLOSSARY:'glossary/[term]/page.tsx',TECHNOLOGY:'technologies/[slug]/page.tsx',SYSTEM:'systems/[slug]/page.tsx',INDUSTRY:'industries/[slug]/page.tsx',PROBLEM:'problems/[slug]/page.tsx',COMPARISON:'comparisons/[slug]/page.tsx',DIAGRAM:'diagrams/[slug]/page.tsx'
};
function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){return {__error:String(e.message)}}}
function issue(severity,kind,url,detail){findings.push({severity,kind,url,detail})}
function flatten(value,prefix='',acc={}){if(value===null||typeof value!=='object'){acc[prefix]=value;return acc}if(Array.isArray(value)){value.forEach((v,i)=>flatten(v,`${prefix}[${i}]`,acc));return acc}for(const [k,v] of Object.entries(value))flatten(v,prefix?prefix+'.'+k:k,acc);return acc}
function shape(v){if(Array.isArray(v))return v.length ? [shape(v[0])] : [];if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shape(x)]));return typeof v}
function diffShape(a,b,p='',out=[]){if(typeof a!==typeof b||Array.isArray(a)!==Array.isArray(b)){out.push(p||'{const match=titles.match(new RegExp('(?:export\\s+)?const\\s+'+constName+'\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s+const'));return match?[...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]):null}
for(const [family,name,folder] of families){
 const slugs=getSlugs(name);
 if(!slugs){issue('WARN','UNRESOLVED_REGISTRY',name,'Registry not parsed; cannot claim full route coverage');continue}
 for(const slug of slugs){
  const base='/knowledge-center/'+(family==='ARTICLE'?'engineering':folder||family.toLowerCase())+'/'+slug+'/';
  const row={family,slug,urls:[base,'/es'+base,'/pt'+base],locales:{}};
  const snapshots={};
  for(const lang of ['es','pt']){
   const file=path.join(source,lang,folder,slug+'.json');
   if(!fs.existsSync(file)){issue('ERROR','MISSING_LOCALIZED_FILE','/'+lang+base,file.replace(root+path.sep,''));row.locales[lang]='MISSING';continue}
   const data=readJson(file);checked++;
   if(data.__error){issue('ERROR','INVALID_JSON','/'+lang+base,data.__error);row.locales[lang]='INVALID';continue}
   row.locales[lang]='EXISTS';
   snapshots[lang]=data;
   if(data.slug&&data.slug!==slug)issue('ERROR','SLUG_MISMATCH','/'+lang+base,String(data.slug));
   for(const field of ['title','description','scope','intro','metaDescription']){
    if(field in data&&(!String(data[field]).trim()))issue('ERROR','EMPTY_COPY','/'+lang+base,field)
   }
   const flat=flatten(data);
   const englishMarkers=Object.entries(flat).filter(([k,v])=>typeof v==='string'&&/^(?:How it works|Primary contamination risks|Engineering applications|Technical overview|Selection criteria|Common engineering mistakes)$/i.test(v.trim()));
   for(const [key,value] of englishMarkers)issue('WARN','POSSIBLE_ENGLISH_COPY','/'+lang+base,key+': '+value);
   if(typeof data.title==='string'&&data.title.length>105)issue('WARN','LONG_HERO_TITLE','/'+lang+base,'Length '+data.title.length+' characters; check rendered wrap');
  }
  if(snapshots.es&&snapshots.pt){for(const field of diffShape(shape(snapshots.es),shape(snapshots.pt)).slice(0,30))issue('WARN','LOCALE_STRUCTURE_MISMATCH',base,field)}
  inventory.push(row)
 }
}
for(const [family,template] of Object.entries(routeFiles)){
 const file=path.join(root,'frontend/src/app/knowledge-center',template);
 if(!fs.existsSync(file))issue('WARN','ROUTE_TEMPLATE_NOT_FOUND',family,template+' (may use a different route parameter)');
}
const components=[
 'frontend/src/components/knowledge-center/ArticleHero.tsx',
 'frontend/src/components/knowledge-center/ArticleLayout.tsx',
 'frontend/src/components/knowledge-center/RelatedArticles.tsx',
 'frontend/src/app/knowledge-center/technologies/[slug]/TechContent.tsx',
 'frontend/src/app/knowledge-center/technologies/[slug]/HowItWorks.tsx',
 'frontend/src/app/knowledge-center/engineering/[topic]/ArticleContent.tsx',
 'frontend/src/app/knowledge-center/industries/[slug]/IndustryContent.tsx',
 'frontend/src/app/knowledge-center/systems/[slug]/SystemContent.tsx'
];
for(const rel of components){
 const file=path.join(root,rel);
 if(!fs.existsSync(file)){issue('ERROR','MISSING_SHARED_COMPONENT',rel,'Cannot assess shared layout');continue}
 const code=fs.readFileSync(file,'utf8');
 if(/(?:setLang\\(|LANG_LABELS\\[l\\]|aria-label=\\{ui\\.language\\})/.test(code))issue('WARN','IN_PAGE_LANGUAGE_CONTROL',rel,'Review in-content language switching');
 if(code.includes("maxWidth: '1200px'")||code.includes("maxWidth: '1100px'")||code.includes("maxWidth: '860px'"))issue('WARN','NARROW_LAYOUT',rel,'Inspect rendered widths; style may be intentional');
 if(/textAlign:\\s*['"]justify['"]/.test(code))issue('WARN','JUSTIFIED_TEXT',rel,'Potential awkward word spacing');
}
// Pass --strict to make missing translations fail CI; advisory mode always writes a report.
const strict=process.argv.includes('--strict');
const summary={generatedAt:new Date().toISOString(),scope:'Knowledge Center localized static content and shared structure',familySlugs:inventory.length,localizedFilesRead:checked,urlsRepresented:inventory.length*3,errors:findings.filter(x=>x.severity==='ERROR').length,warnings:findings.filter(x=>x.severity==='WARN').length,limitations:['Not a browser render or accessibility audit','Not a scientific validation of engineering claims','Source registries not parsed are explicitly warned; route inventory may be incomplete','English source pages and connection graph require separate checks']};
const report={summary,inventory,findings};
const output=process.argv.find(x=>x.startsWith('--out='))?.slice(6)||path.join(root,'artifacts/kc-audit-report.json');
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(summary,null,2));console.log('Report: '+output);
if(strict&&summary.errors)process.exitCode=1;
);return out}if(a&&b&&typeof a==='object'){const aa=Object.keys(a),bb=Object.keys(b);for(const k of new Set([...aa,...bb])){if(!(k in a)||!(k in b))out.push(p?p+'.'+k:k);else diffShape(a[k],b[k],p?p+'.'+k:k,out)}}return out}
function getSlugs(constName){const match=titles.match(new RegExp('(?:export\\s+)?const\\s+'+constName+'\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s+const'));return match?[...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]):null}
for(const [family,name,folder] of families){
 const slugs=getSlugs(name);
 if(!slugs){issue('WARN','UNRESOLVED_REGISTRY',name,'Registry not parsed; cannot claim full route coverage');continue}
 for(const slug of slugs){
  const base='/knowledge-center/'+(family==='ARTICLE'?'engineering':folder||family.toLowerCase())+'/'+slug+'/';
  const row={family,slug,urls:[base,'/es'+base,'/pt'+base],locales:{}};
  for(const lang of ['es','pt']){
   const file=path.join(source,lang,folder,slug+'.json');
   if(!fs.existsSync(file)){issue('ERROR','MISSING_LOCALIZED_FILE','/'+lang+base,file.replace(root+path.sep,''));row.locales[lang]='MISSING';continue}
   const data=readJson(file);checked++;
   if(data.__error){issue('ERROR','INVALID_JSON','/'+lang+base,data.__error);row.locales[lang]='INVALID';continue}
   row.locales[lang]='EXISTS';
   if(data.slug&&data.slug!==slug)issue('ERROR','SLUG_MISMATCH','/'+lang+base,String(data.slug));
   for(const field of ['title','description','scope','intro','metaDescription']){
    if(field in data&&(!String(data[field]).trim()))issue('ERROR','EMPTY_COPY','/'+lang+base,field)
   }
   const flat=flatten(data);
   const englishMarkers=Object.entries(flat).filter(([k,v])=>typeof v==='string'&&/^(?:How it works|Primary contamination risks|Engineering applications|Technical overview|Selection criteria|Common engineering mistakes)$/i.test(v.trim()));
   for(const [key,value] of englishMarkers)issue('WARN','POSSIBLE_ENGLISH_COPY','/'+lang+base,key+': '+value);
   if(typeof data.title==='string'&&data.title.length>105)issue('WARN','LONG_HERO_TITLE','/'+lang+base,'Length '+data.title.length+' characters; check rendered wrap');
  }
  inventory.push(row)
 }
}
const components=[
 'frontend/src/components/knowledge-center/ArticleHero.tsx',
 'frontend/src/components/knowledge-center/ArticleLayout.tsx',
 'frontend/src/components/knowledge-center/RelatedArticles.tsx',
 'frontend/src/app/knowledge-center/technologies/[slug]/TechContent.tsx',
 'frontend/src/app/knowledge-center/technologies/[slug]/HowItWorks.tsx',
 'frontend/src/app/knowledge-center/engineering/[topic]/ArticleContent.tsx',
 'frontend/src/app/knowledge-center/industries/[slug]/IndustryContent.tsx',
 'frontend/src/app/knowledge-center/systems/[slug]/SystemContent.tsx'
];
for(const rel of components){
 const file=path.join(root,rel);
 if(!fs.existsSync(file)){issue('ERROR','MISSING_SHARED_COMPONENT',rel,'Cannot assess shared layout');continue}
 const code=fs.readFileSync(file,'utf8');
 if(/(?:setLang\\(|LANG_LABELS\\[l\\]|aria-label=\\{ui\\.language\\})/.test(code))issue('WARN','IN_PAGE_LANGUAGE_CONTROL',rel,'Review in-content language switching');
 if(code.includes("maxWidth: '1200px'")||code.includes("maxWidth: '1100px'")||code.includes("maxWidth: '860px'"))issue('WARN','NARROW_LAYOUT',rel,'Inspect rendered widths; style may be intentional');
 if(/textAlign:\\s*['"]justify['"]/.test(code))issue('WARN','JUSTIFIED_TEXT',rel,'Potential awkward word spacing');
}
const summary={generatedAt:new Date().toISOString(),scope:'Knowledge Center localized static content and shared structure',familySlugs:inventory.length,localizedFilesRead:checked,urlsRepresented:inventory.length*3,errors:findings.filter(x=>x.severity==='ERROR').length,warnings:findings.filter(x=>x.severity==='WARN').length,limitations:['Not a browser render or accessibility audit','Not a scientific validation of engineering claims','Source registries not parsed are explicitly warned; route inventory may be incomplete','English source pages and connection graph require separate checks']};
const report={summary,inventory,findings};
const output=process.argv.find(x=>x.startsWith('--out='))?.slice(6)||path.join(root,'artifacts/kc-audit-report.json');
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(summary,null,2));console.log('Report: '+output);
if(summary.errors)process.exitCode=1;
