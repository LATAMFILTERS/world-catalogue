import {loadPublicCatalogConfig,queryCatalog} from './lib/fram-usa-smtp-client.mjs';
const c=await loadPublicCatalogConfig();
const r=await queryCatalog('lookup=OtherCatalog',{config:c,limit:500});
const out=[];
for(const m of r.xml.matchAll(/<Catalog><id>(.*?)<\/id><data>(.*?)<\/data><\/Catalog>/g)) if(/Fram Filters/i.test(m[2])) out.push({id:m[1],data:m[2]});
console.log('FRAM_CATALOGS='+out.length); console.log(JSON.stringify(out,null,2));