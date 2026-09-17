const q = `query($p:Int!){products(search:"",pageSize:500,currentPage:$p){total_count items{sku name categories{name}}}}`;
let all=[]; let total=0;
for(let p=1;;p++){
  const r=await fetch('https://www.fram.com/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,variables:{p}})});
  const j=await r.json();
  if(j.errors){ console.error('ERR',p,j.errors[0]); process.exit(2); }
  total=j.data.products.total_count; const a=j.data.products.items; all.push(...a);
  console.log('PAGE',p,'+',a.length,'=',all.length,'/',total);
  if(all.length>=total||!a.length) break;
}
const fs=await import('fs');
fs.mkdirSync('elimfilters-vault/91-private-evidence/fram-full-catalog',{recursive:true});
fs.writeFileSync('elimfilters-vault/91-private-evidence/fram-full-catalog/fram-magento-full-2026-09-11.json',JSON.stringify({source:'FRAM Magento GraphQL',captured_at:new Date().toISOString(),reported_total:total,items:all},null,2));
const pref={}; for(const x of all){ const m=(x.sku||'').match(/^[A-Za-z]+/); const k=m?m[0].toUpperCase():'OTHER'; pref[k]=(pref[k]||0)+1; }
console.log('UNIQUE',new Set(all.map(x=>x.sku)).size);
console.log(JSON.stringify(Object.entries(pref).sort((a,b)=>b[1]-a[1]).slice(0,60)));
