import {loadPublicCatalogConfig,queryCatalog,parseTotalRecords} from './lib/fram-usa-smtp-client.mjs';
const c=await loadPublicCatalogConfig();
const qs=[
 'lookup=year',
 'lookup=make&year=2026',
 'lookup=model&year=2026&make=',
 'lookup=product&year=2026&make=&model=',
 'lookup=engine&year=2026&make=&model=&product=',
 'lookup=parts&engine=&year=2026&make=&model=&product=',
 'lookup=parts&engine=&year=&make=&model=&product='
];
for(const q of qs){try{const r=await queryCatalog(q,{config:c,limit:1000});console.log('\n### '+q+' total='+parseTotalRecords(r.xml)+' len='+r.xml.length);console.log(r.xml.slice(0,1200));}catch(e){console.log(q,e.message)}}