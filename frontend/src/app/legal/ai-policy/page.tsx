'use client';

import '@/i18n';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Purpose',
    body: `This policy governs the public use of artificial intelligence and computational methods within ELIMFILTERS engineering communications and digital platforms.

ELIMFILTERS uses artificial intelligence only as a mathematical and computational engineering tool. Its role is to support analysis of demanding or extreme operating conditions affecting protected assets and filtration media. It does not replace physical validation, documented test protocols, qualified technical review, or professional engineering judgment.`,
  },
  {
    title: '2. Permitted Engineering Use',
    body: `Permitted use includes mathematical modeling, computational analysis, predictive modeling, and engineering simulation used to study interactions among operating conditions, contamination load, flow behavior, pressure differential, temperature, material response, filtration-media characteristics, service duration, and operating severity.

These methods may support scenario analysis, sensitivity analysis, engineering evaluation, and test planning before demanding conditions are encountered in service.`,
  },
  {
    title: '3. Physical Validation Remains Required',
    body: `Computational models are not product certification and are not independent proof of performance.

Where a technical claim depends on filtration efficiency, restriction, contaminant-holding capacity, flow behavior, media strength, pleat stability, seal integrity, burst or collapse resistance, cyclic pressure endurance, thermal exposure, material compatibility, water separation, or another measurable product characteristic, the applicable evidence must come from documented product data and physical validation appropriate to the product and application.`,
  },
  {
    title: '4. Prohibited Public Representations',
    body: `ELIMFILTERS public communications must not represent artificial intelligence as:

— an autonomous product auditor or certifier
— a replacement for engineers, quality personnel, laboratories, or physical testing
— an independent source of validated product specifications
— an autonomous workforce responsible for technical or commercial accountability
— the reason engineering controls, validation requirements, or human review can be reduced
— a basis for unsupported claims of superiority, guaranteed protection, zero bypass, universal compatibility, or blanket standards compliance`,
  },
  {
    title: '5. Technical Evidence and Traceability',
    body: `Technical conclusions must remain traceable to documented ELIMFILTERS product information, validated application data, applicable standards or test methods, and qualified engineering review where required.

If available evidence does not support a product-specific conclusion, the system or communication must state the limitation rather than infer or fabricate a specification.`,
  },
  {
    title: '6. Cross-Reference and Application Guidance',
    body: `Cross-reference information supports product identification and application research. A cross-reference does not by itself establish identical construction, identical performance, or universal interchangeability.

Application suitability must be evaluated using available dimensional, functional, operating-condition, and product-specific evidence. Critical applications require appropriate technical validation before implementation.`,
  },
  {
    title: '7. Human Accountability',
    body: `Human accountability remains in engineering review, manufacturing oversight, quality governance, evidence review, application escalation, and critical technical decisions.

Digital workflows and automation may improve information handling and operational efficiency, but they do not transfer technical responsibility away from qualified people or documented processes.`,
  },
  {
    title: '8. Personal and Confidential Information',
    body: `Users should not submit unnecessary personal information, regulated data, confidential third-party information, or trade secrets to computational or automated features.

Data handling is governed by the ELIMFILTERS Privacy Policy and applicable contractual and legal requirements.`,
  },
  {
    title: '9. Transparency',
    body: `Where artificial intelligence materially participates in a user-facing computational function, ELIMFILTERS will describe its role accurately. Public descriptions will distinguish mathematical or computational support from physical testing, human review, and validated engineering evidence.`,
  },
  {
    title: '10. Updates and Contact',
    body: `This policy may be updated as ELIMFILTERS engineering methods, digital platforms, evidence governance, or applicable requirements evolve.

Questions regarding this policy may be sent to info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function AIUsePolicyPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← ELIMFILTERS</Link>
        </div>
        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem', letterSpacing:'0.18em', color:'#FFF12D', opacity:0.8, marginBottom:'1rem', textTransform:'uppercase' }}>{'// Legal · Computational Engineering'}</p>
            <h1 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'clamp(2rem, 4vw, 3rem)', color:'#fff', margin:'0 0 1rem', lineHeight:1.15 }}>AI & Computational Modeling Policy</h1>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'rgba(255,255,255,0.45)', margin:0 }}>Last updated: August 2026</p>
          </motion.div>
        </section>
        <div style={{ maxWidth:'820px', margin:'0 auto', padding:'4rem 8%' }}>
          {SECTIONS.map((s,i)=><motion.section key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:i*0.04}} style={{marginBottom:'2.5rem',paddingBottom:'2.5rem',borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h2 style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'1.05rem',color:'#FFF12D',marginBottom:'0.9rem',lineHeight:1.3}}>{s.title}</h2>{s.body.split('\n\n').map((para,j)=><p key={j} style={{fontFamily:'var(--font-body)',fontSize:'0.92rem',color:'rgba(255,255,255,0.7)',lineHeight:1.8,marginBottom:'0.75rem'}}>{para}</p>)}</motion.section>)}
          <div style={{marginTop:'3rem',paddingTop:'2rem',borderTop:'1px solid rgba(255,241,45,0.12)'}}><p style={{fontFamily:'JetBrains Mono, monospace',fontSize:'0.7rem',letterSpacing:'0.14em',color:'rgba(255,255,255,0.3)',marginBottom:'1rem',textTransform:'uppercase'}}>Related Legal Documents</p><div style={{display:'flex',flexWrap:'wrap',gap:'0.75rem'}}>{RELATED.map(r=><Link key={r.href} href={r.href} style={{fontFamily:'var(--font-body)',fontSize:'0.82rem',color:'rgba(255,255,255,0.5)',textDecoration:'none',padding:'0.4rem 0.85rem',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'4px'}}>{r.label}</Link>)}</div></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
