import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/PageHeader';
import AssessmentForm from './AssessmentForm';

export const metadata: Metadata={
 title:'Distributor Fit Assessment | ELIMFILTERS',
 description:'Submit company, territory and distribution capability information for internal ELIMFILTERS partner review.',
 alternates:{canonical:'https://elimfilters.com/distributor-fit-assessment/'},
 robots:{index:false,follow:true},
};

export default function DistributorFitAssessmentPage(){return <main style={{background:'#000',color:'#fff',minHeight:'100vh',fontFamily:'Barlow,Arial,sans-serif'}}>
 <PageHeader breadcrumbs={[{label:'Distributor Opportunity',href:'/distributor-opportunity/'}]} currentPage="Distributor Fit Assessment"/>
 <section style={{padding:'7rem clamp(1.25rem,6vw,6rem)'}}><div style={{maxWidth:900,margin:'0 auto'}}>
  <p style={{color:'#FFF12D',letterSpacing:'.18em',fontWeight:800,textTransform:'uppercase'}}>Distributor Fit Assessment</p>
  <h1 style={{fontFamily:'Chakra Petch,Arial Narrow,sans-serif',fontSize:'clamp(2.7rem,7vw,5.8rem)',lineHeight:.95,textTransform:'uppercase'}}>Tell us about your market capability.</h1>
  <p style={{color:'#aaa',lineHeight:1.7,fontSize:'1.08rem'}}>This information is used for internal partner evaluation. Submission does not authorize outreach, grant territory rights, establish pricing or create a distribution agreement.</p>
  <div style={{marginTop:'2.5rem',padding:'clamp(1rem,4vw,2.2rem)',border:'1px solid #292929',background:'#050505'}}><Suspense fallback={<p>Loading assessment...</p>}><AssessmentForm/></Suspense></div>
 </div></section>
 </main>}
