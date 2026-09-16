'use client';

import { useSearchParams } from 'next/navigation';

export function DistributorBriefLinks(){
 const params=useSearchParams(); const raw=(params.get('ref')||'').trim().toUpperCase();
 const ref=/^PY-00000[1-5]$/.test(raw)?raw:'';
 const technical='/assets/distributor/elimfilters-technical-value-brief-v2.pdf';
 const opportunity=ref?`/assets/distributor/elimfilters-distributor-opportunity-${ref}-v2.pdf`:'';
 return <div style={{display:'flex',flexWrap:'wrap',gap:'.8rem',marginTop:'1.5rem'}}>
  <a href={technical} data-analytics-label="Technical Value Brief" style={{padding:'.9rem 1rem',border:'1px solid #555',color:'#fff',textDecoration:'none',fontWeight:700}}>Technical Value Brief (PDF)</a>
  {opportunity&&<a href={opportunity} data-analytics-label="Distributor Opportunity Brief" style={{padding:'.9rem 1rem',border:'1px solid #FFF12D',color:'#FFF12D',textDecoration:'none',fontWeight:700}}>Distributor Opportunity Brief (PDF)</a>}
 </div>;
}
