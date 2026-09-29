import {loadPublicCatalogConfig,queryCatalog,parseTotalRecords} from './lib/fram-usa-smtp-client.mjs';
const c=await loadPublicCatalogConfig();
const queries=[
 'lookup=partlist&partno=FRAM',
 'lookup=partlist&partno=****',
 'lookup=partlist&partno=0000*',
 'lookup=product',
 'lookup=product&supplier=FRAM',
 'lookup=parttype',
 'lookup=parttype&supplier=FRAM',
 'lookup=Catalog',
 'lookup=OtherCatalog',
 'lookup=supplier'
];
for(const q of queries){try{const r=await queryCatalog(q,{config:c,limit:50});console.log('\n### '+q+' status='+r.status+' total='+parseTotalRecords(r.xml)+' len='+r.xml.length);console.log(r.xml.slice(0,700));}catch(e){console.log('\n### '+q+' ERROR '+e.message)}}