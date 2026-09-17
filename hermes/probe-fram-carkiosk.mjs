import axios from 'axios';
const base='https://www.fram.com/rest/all/V1/api/carkiosk/skulookup/';
const known={year:'2013',make:'5079',model:'5482',engine:'V8~5.7L~345~',radio:'car-truck'};
const lookups=['year','make','model','engine','product','part','parts','search','1','true'];
const ids=['','0','1','2','3','4','5','6','7','8','9','10'];
for(const lookup of lookups){
  for(const id of ids){
    const p=new URLSearchParams();
    for(const [k,v] of Object.entries(known)) p.set(`lookup[${k}]`,v);
    p.set('lookup[lookup]',lookup); if(id) p.set('lookup[endpointId]',id);
    const url=`${base}?${p}`;
    const r=await axios.get(url,{timeout:10000,validateStatus:()=>true,headers:{Accept:'application/json','User-Agent':'Mozilla/5.0'}}).catch(e=>({status:0,data:e.message}));
    const txt=typeof r.data==='string'?r.data:JSON.stringify(r.data);
    if(r.status===200 || (!/application run|required/i.test(txt) && r.status!==0)) console.log({lookup,id,status:r.status,body:txt.slice(0,1000)});
  }
}