import axios from 'axios';
const cats={AIR:'OQ==',CABIN:'MTQ=',LUBE:'MTU=',FUEL:'NQ==',HD_OIL:'OA==',HD_AIR1:'MTA=',HD_AIR2:'MTE=',HD_CABIN:'MTI='};
async function skus(uid){let out=[]; let page=1,total=1; while(page<=total){const q=`query { products(filter:{category_uid:{eq:"${uid}"}}, pageSize:100, currentPage:${page}){total_count page_info{total_pages} items{sku name}}}`; const r=await axios.post('https://www.fram.com/graphql',{query:q},{headers:{'content-type':'application/json','user-agent':'Mozilla/5.0'}}); const p=r.data.data.products; total=p.page_info.total_pages; out.push(...p.items); page++;} return out;}
const data={}; for(const [k,u] of Object.entries(cats)){data[k]=await skus(u); console.log(k,data[k].length)}
const ldKeys=['AIR','CABIN','LUBE','FUEL']; const hdKeys=['HD_OIL','HD_AIR1','HD_AIR2','HD_CABIN'];
const ldMap=new Map(); for(const k of ldKeys) for(const x of data[k]) {const r=ldMap.get(x.sku)||{sku:x.sku,name:x.name,families:[]}; if(!r.families.includes(k))r.families.push(k); ldMap.set(x.sku,r)}
const hd=new Set(hdKeys.flatMap(k=>data[k].map(x=>x.sku)));
const overlaps=[...ldMap.values()].filter(x=>x.families.length>1); const hdOverlap=[...ldMap.values()].filter(x=>hd.has(x.sku));
console.log(JSON.stringify({ld_unique:ldMap.size, multi_family:overlaps.length, hd_overlap:hdOverlap.length, clean_ld_unique:ldMap.size-hdOverlap.length, sample_hd_overlap:hdOverlap.slice(0,20), sample_multi:overlaps.slice(0,20)},null,2));
