import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CommercialRefLink } from '@/components/CommercialRefLink';
import { DistributorBriefLinks } from '@/components/DistributorBriefLinks';

export const metadata: Metadata = {
  title: 'Distributor Opportunity | ELIMFILTERS',
  description: 'Explore the ELIMFILTERS country distribution model for industrial, heavy-duty and fleet asset protection systems.',
  alternates: { canonical: 'https://elimfilters.com/distributor-opportunity/' },
};

const pillars = [
  ['Technical platform', 'Five protection systems covering air intake, fuel cleanliness, cooling, lubrication and hydraulic applications.'],
  ['Market development', 'A distributor-first model built around local coverage, recurring demand and disciplined territory development.'],
  ['Commercial enablement', 'Product intelligence, technical knowledge, digital assets and structured support for qualified partners.'],
  ['Long-term relationship', 'The objective is sustainable local distribution capacity, not isolated transactional orders.'],
];

export default function DistributorOpportunityPage() {
  return <main style={{background:'#000',color:'#fff',minHeight:'100vh',fontFamily:'Barlow,Arial,sans-serif'}}>
    <PageHeader breadcrumbs={[{label:'Distributors',href:'/distributors/'}]} currentPage="Distributor Opportunity" />
    <section style={{padding:'8rem clamp(1.25rem,6vw,6rem) 6rem',borderBottom:'1px solid #222'}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <p style={{color:'#FFF12D',letterSpacing:'.2em',fontWeight:800,textTransform:'uppercase'}}>ELIMFILTERS / Distribution Development</p>
        <h1 style={{fontFamily:'Chakra Petch,Arial Narrow,sans-serif',fontSize:'clamp(3rem,8vw,7rem)',lineHeight:.9,textTransform:'uppercase',margin:'1rem 0'}}>Build a stronger filtration market.</h1>
        <p style={{maxWidth:820,fontSize:'1.25rem',lineHeight:1.7,color:'#bbb'}}>ELIMFILTERS develops regional distribution relationships around asset protection, technical intelligence and disciplined market coverage. Qualified companies can evaluate the opportunity before entering a formal commercial discussion.</p>
        <Suspense fallback={null}><DistributorBriefLinks /></Suspense>
        <Suspense fallback={null}><CommercialRefLink href="/distributor-fit-assessment/" data-analytics-event="distributor_assessment_opened" style={{display:'inline-block',marginTop:'2rem',padding:'1rem 1.3rem',background:'#FFF12D',color:'#000',fontWeight:800,textDecoration:'none',textTransform:'uppercase'}}>Evaluate distributor fit</CommercialRefLink></Suspense>
      </div>
    </section>
    <section style={{padding:'5rem clamp(1.25rem,6vw,6rem)'}}>
      <div style={{maxWidth:1180,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem'}}>
        {pillars.map(([title,body],i)=><article key={title} style={{padding:'1.6rem',border:'1px solid #222',background:'#050505'}}>
          <span style={{color:'#FFF12D',fontWeight:800}}>{String(i+1).padStart(2,'0')}</span>
          <h2 style={{fontFamily:'Chakra Petch,Arial Narrow,sans-serif',textTransform:'uppercase'}}>{title}</h2>
          <p style={{color:'#999',lineHeight:1.7}}>{body}</p>
        </article>)}
      </div>
    </section>
    <section style={{padding:'5rem clamp(1.25rem,6vw,6rem)',background:'#070707',textAlign:'center'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <h2 style={{fontFamily:'Chakra Petch,Arial Narrow,sans-serif',fontSize:'clamp(2rem,5vw,4rem)',textTransform:'uppercase'}}>Is there a fit?</h2>
        <p style={{color:'#aaa',lineHeight:1.7}}>The assessment takes a few minutes. Submission starts an internal review only. It does not create exclusivity, pricing commitments or an automatic commercial agreement.</p>
        <Suspense fallback={null}><DistributorBriefLinks /></Suspense>
        <Suspense fallback={null}><CommercialRefLink href="/distributor-fit-assessment/" data-conversion-action="partner-application" style={{display:'inline-block',marginTop:'1rem',padding:'1rem 1.3rem',border:'1px solid #FFF12D',color:'#FFF12D',fontWeight:800,textDecoration:'none',textTransform:'uppercase'}}>Start assessment</CommercialRefLink></Suspense>
      </div>
    </section>
  </main>;
}
