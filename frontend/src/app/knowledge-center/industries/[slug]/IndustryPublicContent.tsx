import Link from 'next/link';
import type { KCIndustryDetail } from '@/lib/knowledge-center-data';

type PublicIndustry = { slug:string; title:string; description:string; dust:string };

export default function IndustryPublicContent({industry,detail}:{industry:PublicIndustry;detail:KCIndustryDetail|null}) {
  return <main style={{background:'#000',color:'#fff',minHeight:'100vh',padding:'4rem 2rem'}}>
    <section style={{maxWidth:960,margin:'0 auto'}}>
      <Link href="/knowledge-center/industries/" style={{color:'rgba(255,255,255,.45)'}}>← INDUSTRIES</Link>
      <p style={{color:'#FFF12D',marginTop:'2rem'}}>INDUSTRIAL APPLICATION</p>
      <h1>{industry.title}</h1>
      <p style={{color:'rgba(255,255,255,.65)',lineHeight:1.8}}>{industry.description}</p>
    </section>
    <section style={{maxWidth:960,margin:'2.5rem auto 0',borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:'1.5rem'}}>
      <h2>Engineering Context</h2>
      <p style={{color:'rgba(255,255,255,.65)',lineHeight:1.8}}>{detail?.contaminationEnvironment || 'Operating environment, contamination exposure and duty cycle determine the protection strategy for this application.'}</p>
    </section>
    <section style={{maxWidth:960,margin:'2.5rem auto 0'}}>
      <h2>Protection Systems</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:'.7rem'}}>
        <Link href="/knowledge-center/systems/air-intake-protection/">Air Intake</Link>
        <Link href="/knowledge-center/systems/fuel-cleanliness-protection/">Fuel</Link>
        <Link href="/knowledge-center/systems/lubrication-protection/">Lubrication</Link>
        <Link href="/knowledge-center/systems/hydraulic-protection/">Hydraulic</Link>
        <Link href="/knowledge-center/systems/cooling-system-protection/">Cooling</Link>
      </div>
    </section>
    <section style={{maxWidth:960,margin:'2.5rem auto 0'}}><Link href="/knowledge-center/search/" style={{color:'#FFF12D'}}>Search technical knowledge →</Link></section>
  </main>;
}
