import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/knowledge-center/engineering/surface-loading-vs-depth-loading/`;

const faq = [
  ['What is surface loading in filtration?', 'Surface-oriented loading describes a media behavior in which a greater share of captured particulate remains near the upstream face or a fine upstream layer instead of penetrating deeply into the supporting structure.'],
  ['What is depth loading in filtration?', 'Depth loading distributes captured contaminant through a meaningful portion of the media thickness. The resulting capacity and pressure-drop behavior depend on fiber structure, pore geometry, flow and contaminant characteristics.'],
  ['Is surface loading always better than depth loading?', 'No. They are different contaminant-management behaviors. The correct media architecture depends on the fluid, particle distribution, filtration area, flow, pressure-drop limits, service strategy and whether the system is designed for regenerative cleaning.'],
  ['Why does pressure drop increase as a filter loads?', 'Captured contaminant changes the available flow paths through or across the media. The rate of pressure-drop increase depends on media permeability, available area, contaminant distribution, velocity and the loading mechanism.'],
  ['Can pulse-cleaning benefits be applied to every filter?', 'No. Pulse cleaning is relevant only to filtration systems specifically designed for regenerative cleaning. It should not be generalized to engine intake, fuel, hydraulic, lubrication or other elements that are serviced by replacement rather than regeneration.'],
  ['How should engineers compare different media architectures?', 'Compare validated efficiency, contaminant capacity, pressure-drop development, flow capability, structural integrity, compatibility and the actual service strategy for the specific application.'],
] as const;

export const metadata: Metadata = {
  title: 'Surface Loading vs Depth Loading in Filtration | ELIMFILTERS',
  description: 'Engineering reference explaining surface-oriented loading, depth loading, pressure-drop development, contaminant capacity and application limits across filtration systems.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Surface Loading vs Depth Loading in Filtration | ELIMFILTERS',
    description: 'How media architecture changes contaminant retention, differential pressure and service behavior.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
  },
};

export default function SurfaceVsDepthLoadingPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${PAGE_URL}#article`,
        headline: 'Surface Loading vs. Depth Loading in Filtration',
        description: 'Engineering reference explaining how surface-oriented and depth-loading media manage particulate, contaminant capacity and differential pressure.',
        url: PAGE_URL,
        author: { '@id': `${BASE_URL}/#organization` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Surface loading filtration' },
          { '@type': 'Thing', name: 'Depth loading filtration' },
          { '@type': 'Thing', name: 'Filter media architecture' },
          { '@type': 'Thing', name: 'Differential pressure' },
          { '@type': 'Thing', name: 'Contaminant-holding capacity' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: `${BASE_URL}/knowledge-center/` },
          { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${BASE_URL}/knowledge-center/engineering/` },
          { '@type': 'ListItem', position: 3, name: 'Surface Loading vs Depth Loading', item: PAGE_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
      },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section style={hero}>
        <div style={wide}>
          <Link href="/knowledge-center/engineering/" style={back}>← ENGINEERING</Link>
          <p style={eyebrow}>FILTRATION SCIENCE</p>
          <h1 style={heroTitle}>Surface Loading<br/><span style={accent}>vs. Depth Loading</span></h1>
          <p style={heroLead}>Two media architectures can capture the same contaminant in very different ways. The engineering decision is not which label sounds better, but how the loading behavior affects efficiency, contaminant capacity, differential pressure and the actual service strategy.</p>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div><p style={eyebrow}>THE DISTINCTION</p><h2 style={h2}>Where the contaminant is retained changes how the filter behaves.</h2></div>
          <div>
            <p style={lead}>Depth loading distributes captured particulate through more of the media thickness. Surface-oriented loading keeps a greater share of contamination near the upstream face or a fine upstream layer.</p>
            <div style={points}>
              <article style={point}><span style={num}>01</span><div><h3 style={h3}>Depth loading</h3><p style={body}>Contaminant penetrates into available media depth and occupies internal flow paths. Capacity can benefit from distributed storage, while pressure drop develops according to pore structure, fiber arrangement, particle distribution and flow.</p></div></article>
              <article style={point}><span style={num}>02</span><div><h3 style={h3}>Surface-oriented loading</h3><p style={body}>A larger share of particulate remains near the upstream surface. This can limit deep penetration and create a different restriction curve, but the outcome depends on media structure, velocity, contaminant and available filtration area.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <div style={twoCol}>
          <div><p style={eyebrow}>PRESSURE DROP</p><h2 style={h2}>Loading mechanism is only one part of restriction development.</h2></div>
          <div>
            <p style={lead}>Differential pressure is influenced by media permeability, fiber diameter, basis weight, pleat geometry, available area, fluid properties, velocity and the amount and type of contaminant already retained.</p>
            <div style={points}>
              <article style={point}><span style={num}>01</span><div><h3 style={h3}>Clean-element resistance</h3><p style={body}>Every media structure begins with an inherent resistance to flow. A finer or denser structure can increase capture opportunities while also changing clean-element pressure drop.</p></div></article>
              <article style={point}><span style={num}>02</span><div><h3 style={h3}>Loading curve</h3><p style={body}>As particles accumulate, the available flow paths change. Two media with similar initial pressure drop can develop very different restriction curves during service.</p></div></article>
              <article style={point}><span style={num}>03</span><div><h3 style={h3}>System energy</h3><p style={body}>In fan-driven air systems, additional resistance can increase energy demand depending on fan controls and system design. That relationship should not be generalized to fuel, hydraulic or lubrication circuits without circuit-specific analysis.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div><p style={eyebrow}>CLEANING &amp; SERVICE</p><h2 style={h2}>Regenerative cleaning changes the value of surface retention.</h2></div>
          <div>
            <p style={lead}>When a dust-collection system is specifically designed to clean the filter in service, keeping contaminant near the surface can make deposited dust easier to remove. That principle is application-specific.</p>
            <div style={warning}>
              <strong style={{...h3,color:'#FFF12D'}}>APPLICATION BOUNDARY</strong>
              <p style={{...body,marginTop:'.65rem'}}>Pulse-cleaning behavior must not be projected onto engine-air elements, fuel filters, hydraulic elements, lube filters or cabin filters that are not engineered as regenerating dust-collector elements. Those circuits have different fluids, pressures, media structures and service strategies.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <div style={twoCol}>
          <div><p style={eyebrow}>ENGINEERING DECISION</p><h2 style={h2}>Compare performance at the application level, not by media label alone.</h2></div>
          <div>
            <div style={points}>
              {[
                ['Efficiency','Use validated product-level efficiency for the relevant particle range and test method.'],
                ['Contaminant capacity','Determine how much contaminant can be retained before the application reaches its service limit.'],
                ['Differential pressure','Evaluate both clean-element resistance and how restriction develops through loading.'],
                ['Flow capability','Confirm the media and element can support the required airflow or fluid flow.'],
                ['Structural integrity','Account for pulsation, vibration, pressure cycles, support layers and pleat stability.'],
                ['Service strategy','Distinguish replaceable elements from systems designed for cleaning or regeneration.'],
              ].map(([title,text],i)=><article key={title} style={point}><span style={num}>{String(i+1).padStart(2,'0')}</span><div><h3 style={h3}>{title}</h3><p style={body}>{text}</p></div></article>)}
            </div>
          </div>
        </div>
      </section>

      <section style={faqSection}>
        <div style={wide}>
          <p style={eyebrow}>TECHNICAL QUESTIONS</p><h2 style={h2}>Questions engineers ask about loading behavior.</h2>
          <div style={faqList}>{faq.map(([q,a],i)=><article key={q} style={faqItem}><span style={num}>{String(i+1).padStart(2,'0')}</span><div><h3 style={faqQ}>{q}</h3><p style={body}>{a}</p></div></article>)}</div>
        </div>
      </section>

      <section style={relatedSection}>
        <div style={wide}>
          <p style={eyebrow}>CONTINUE THROUGH THE KNOWLEDGE SYSTEM</p><h2 style={h2}>Connect loading behavior to the protected circuit.</h2>
          <div style={relatedGrid}>
            <Link href="/knowledge-center/engineering-reference/filtration-science/" style={card}><strong style={cardTitle}>Filtration Science</strong><span style={cardText}>Continue into capture mechanisms, particle behavior and media engineering.</span></Link>
            <Link href="/technologies/macrocore/" style={card}><strong style={cardTitle}>MACROCORE™</strong><span style={cardText}>See how media configuration, airflow and restriction are evaluated in engine-air protection.</span></Link>
            <Link href="/technologies/syntapore/" style={card}><strong style={cardTitle}>SYNTAPORE™</strong><span style={cardText}>See how media configuration, contaminant capacity, flow and pressure drop are evaluated in diesel-fuel particulate filtration.</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main = { background:'#000',color:'#fff',minHeight:'100vh',fontFamily:'var(--font-body)',overflowX:'hidden' } as const;
const wide = { maxWidth:'1180px',margin:'0 auto' } as const;
const hero = { padding:'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.08)',background:'radial-gradient(circle at 82% 12%, rgba(255,241,45,.13), transparent 34%), #020202' } as const;
const back = { display:'inline-block',color:'rgba(255,255,255,.5)',textDecoration:'none',fontFamily:'var(--font-display)',fontSize:'.7rem',letterSpacing:'.12em',marginBottom:'2rem' } as const;
const eyebrow = { fontFamily:'var(--font-display)',color:'#FFF12D',fontSize:'.7rem',letterSpacing:'.18em',fontWeight:700,margin:'0 0 1rem',textTransform:'uppercase' as const };
const heroTitle = { fontFamily:'var(--font-display)',fontSize:'clamp(2.9rem,6.7vw,6.2rem)',lineHeight:.91,letterSpacing:'-.05em',textTransform:'uppercase' as const,margin:0,maxWidth:'1080px' };
const accent = { color:'#FFF12D' } as const;
const heroLead = { fontSize:'clamp(1.08rem,2vw,1.42rem)',lineHeight:1.65,color:'rgba(255,255,255,.8)',maxWidth:'880px',margin:'1.8rem 0 0' } as const;
const section = { padding:'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.06)' } as const;
const sectionAlt = { ...section,background:'#050505' } as const;
const twoCol = { ...wide,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(320px,100%),1fr))',gap:'clamp(2.5rem,7vw,6rem)',alignItems:'start' } as const;
const h2 = { fontFamily:'var(--font-display)',fontSize:'clamp(2.1rem,4.5vw,4rem)',lineHeight:.98,letterSpacing:'-.04em',textTransform:'uppercase' as const,margin:0 };
const lead = { fontSize:'clamp(1.05rem,1.7vw,1.32rem)',lineHeight:1.68,fontWeight:600,color:'rgba(255,255,255,.84)',margin:'0 0 1.4rem' } as const;
const points = { borderTop:'1px solid rgba(255,255,255,.13)' } as const;
const point = { display:'grid',gridTemplateColumns:'46px minmax(0,1fr)',gap:'1rem',padding:'1.35rem 0',borderBottom:'1px solid rgba(255,255,255,.13)' } as const;
const num = { fontFamily:'var(--font-display)',color:'#FFF12D',fontSize:'.66rem',letterSpacing:'.1em',paddingTop:'.2rem' } as const;
const h3 = { fontFamily:'var(--font-display)',fontSize:'1.08rem',textTransform:'uppercase' as const,margin:'0 0 .55rem' };
const body = { fontSize:'.97rem',lineHeight:1.75,color:'rgba(255,255,255,.65)',margin:0,textAlign:'left' as const };
const warning = { marginTop:'2rem',padding:'1.4rem',border:'1px solid rgba(255,241,45,.25)',background:'rgba(255,241,45,.035)' } as const;
const faqSection = { ...section,background:'#070707' } as const;
const faqList = { marginTop:'2rem',borderTop:'1px solid rgba(255,255,255,.13)' } as const;
const faqItem = { ...point,gridTemplateColumns:'52px minmax(0,1fr)' } as const;
const faqQ = { fontFamily:'var(--font-display)',fontSize:'clamp(1.02rem,1.8vw,1.28rem)',lineHeight:1.25,margin:'0 0 .65rem' } as const;
const relatedSection = { padding:'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)',background:'linear-gradient(180deg,#050505,#020202)' } as const;
const relatedGrid = { marginTop:'2rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(250px,100%),1fr))',gap:'1px',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.1)' } as const;
const card = { background:'#050505',padding:'1.6rem',minHeight:'170px',textDecoration:'none',color:'#fff',display:'flex',flexDirection:'column' as const };
const cardTitle = { fontFamily:'var(--font-display)',color:'#FFF12D',fontSize:'1.05rem',textTransform:'uppercase' as const };
const cardText = { color:'rgba(255,255,255,.62)',lineHeight:1.55,marginTop:'.8rem',fontSize:'.9rem' } as const;
