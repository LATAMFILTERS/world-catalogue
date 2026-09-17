import axios from 'axios';
const base='https://www.fram.com/rest/all/V1/api';
const endpoints=['commercial/aceslookup/','commercial/enginelookup/','commercial/partlookup/'];
const known={year:'2013',make:'5079',model:'5482',engine:'V8~5.7L~345~',radio:'car-truck'};
const vals=['1','true','year','make','model','engine','part','parts','search'];
for(const ep of endpoints){
  for(let id=0;id<=20;id++) for(const lookup of vals){
    const p=new URLSearchParams();
    for(const [k,v] of Object.entries(known)) p.set(`lookup[${k}]`,v);
    p.set('lookup[endpointId]',String(id)); p.set('lookup[lookup]',lookup);
    const url=`${base}/${ep}?${p}`;
    try{
      const r=await axios.get(url,{timeout:8000,validateStatus:()=>true,headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
      const txt=typeof r.data==='string'?r.data:JSON.stringify(r.data);
      if(r.status===200 || !/required|incorrect|invalid/i.test(txt)) console.log(ep,'id',id,'lookup',lookup,'status',r.status,'body',txt.slice(0,600));
    }catch(e){ console.log('ERR',ep,id,lookup,e.code||e.message); }
  }
}