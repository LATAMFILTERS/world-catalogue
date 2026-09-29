const fs=require('fs');
const s=fs.readFileSync('hermes/smtf-app.js','utf8');
for(const p of ['ResetPartGridDataStore:function','partsdata','lookup=parts']){
 const i=s.indexOf(p); console.log('\n### '+p+' '+i); if(i>=0) console.log(s.slice(Math.max(0,i-2500),i+6500));
}