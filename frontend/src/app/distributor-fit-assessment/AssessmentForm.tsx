'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL=(process.env.NEXT_PUBLIC_API_URL||'https://api.elimfilters.com').replace(/\/$/,'');
const initial={companyName:'',contactName:'',email:'',country:'',yearsInBusiness:'',employees:'',branches:'',warehouseCapacity:'',importCapability:'',industriesServed:'',territoryCoverage:'',salesTeamSize:'',annualPurchaseRange:'',notes:''};

export default function AssessmentForm(){
 const params=useSearchParams(); const raw=(params.get('ref')||'').toUpperCase();
 const commercialAccountCode=/^[A-Z]{2}-[0-9]{6}$/.test(raw)?raw:undefined;
 const [data,setData]=useState(initial); const [status,setStatus]=useState<'idle'|'sending'|'done'|'error'>('idle');
 const change=(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setData(v=>({...v,[e.target.name]:e.target.value}));
 async function submit(e:React.FormEvent){e.preventDefault();setStatus('sending');
  const eventId=crypto.randomUUID();
  const payload={eventName:'distributor_fit_assessment_submit',eventId,pagePath:location.pathname,pageLocation:location.href,pageTitle:document.title,commercialAccountCode,conversionAction:'distributor_fit_assessment',metadata:{...data,source:'distributor_fit_assessment_v1'}};
  try{const r=await fetch(`${API_URL}/api/conversion-event`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':eventId},body:JSON.stringify(payload)});if(!r.ok)throw new Error('submit_failed');setStatus('done');setData(initial);}catch{setStatus('error');}
 }
 const input={width:'100%',padding:'.9rem',background:'#080808',border:'1px solid #333',color:'#fff',boxSizing:'border-box' as const};
 return <form onSubmit={submit} style={{display:'grid',gap:'1rem'}}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1rem'}}>
   <input required name="companyName" value={data.companyName} onChange={change} placeholder="Company name *" style={input}/>
   <input required name="contactName" value={data.contactName} onChange={change} placeholder="Contact name *" style={input}/>
   <input required type="email" name="email" value={data.email} onChange={change} placeholder="Business email *" style={input}/>
   <input required name="country" value={data.country} onChange={change} placeholder="Country *" style={input}/>
   <input name="yearsInBusiness" value={data.yearsInBusiness} onChange={change} placeholder="Years in business" style={input}/>
   <input name="employees" value={data.employees} onChange={change} placeholder="Employees" style={input}/>
   <input name="branches" value={data.branches} onChange={change} placeholder="Branches / locations" style={input}/>
   <input name="salesTeamSize" value={data.salesTeamSize} onChange={change} placeholder="Sales team size" style={input}/>
  </div>
  <select required name="importCapability" value={data.importCapability} onChange={change} style={input}><option value="">Import capability *</option><option>Direct importer</option><option>Imports through third party</option><option>Not currently importing</option></select>
  <select required name="warehouseCapacity" value={data.warehouseCapacity} onChange={change} style={input}><option value="">Warehouse capability *</option><option>Own warehouse</option><option>Third-party warehouse</option><option>Limited / no warehouse</option></select>
  <textarea required name="industriesServed" value={data.industriesServed} onChange={change} placeholder="Industries and customer segments served *" rows={3} style={input}/>
  <textarea required name="territoryCoverage" value={data.territoryCoverage} onChange={change} placeholder="Territory, reseller network and geographic coverage *" rows={3} style={input}/>
  <input name="annualPurchaseRange" value={data.annualPurchaseRange} onChange={change} placeholder="Approximate annual filtration purchasing range" style={input}/>
  <textarea name="notes" value={data.notes} onChange={change} placeholder="Additional information" rows={3} style={input}/>
  {commercialAccountCode&&<p style={{fontSize:'.78rem',color:'#777'}}>Reference: {commercialAccountCode}</p>}
  {status==='done'&&<div style={{padding:'1rem',border:'1px solid #395',color:'#9dba9d'}}>Assessment received. Our commercial team will review the information.</div>}
  {status==='error'&&<div style={{padding:'1rem',border:'1px solid #933',color:'#e99'}}>We could not submit the assessment. Please try again.</div>}
  <button disabled={status==='sending'} style={{padding:'1rem',background:'#FFF12D',border:0,fontWeight:900,textTransform:'uppercase',cursor:'pointer'}}>{status==='sending'?'Submitting...':'Submit for internal review'}</button>
 </form>;
}
