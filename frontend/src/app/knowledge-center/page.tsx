import Link from 'next/link';
import { Footer } from '@/components/Footer';
import styles from './KnowledgeCenter.module.css';

const HUBS=[
 ['01','Industrial Standards','ISO / TEST METHODS','Measurement frameworks, cleanliness codes and filtration test methods used to support technical decisions.','/knowledge-center/standards'],
 ['02','Contamination & Failure Modes','DIAGNOSTICS / ROOT CAUSE','Root-cause knowledge for particle wear, water contamination, restriction, degradation and system failure mechanisms.','/knowledge-center/problems'],
 ['03','Protection Technologies','FILTRATION ENGINEERING','ELIMFILTERS technology architectures organized by contamination domain, protection objective and operating environment.','/knowledge-center/technologies'],
 ['04','Asset Protection Systems','SYSTEM ARCHITECTURE','Relationships between air intake, fuel, lubrication, hydraulic and cooling systems across critical equipment.','/knowledge-center/systems'],
 ['05','Fleet Optimization','RELIABILITY / TCO','Reliability, service-life and total-cost strategies for fleets, maintenance organizations and critical assets.','/knowledge-center/fleet-optimization'],
 ['06','Technical Glossary','ENGINEERING REFERENCE','Consistent terminology for filtration, contamination control, maintenance, reliability and asset protection.','/knowledge-center/glossary'],
 ['07','Technical FAQ','QUESTIONS / ANSWERS','Direct technical answers to recurring questions about filtration, contamination, standards and maintenance.','/knowledge-center/faq'],
 ['08','Knowledge Search','TECHNICAL DISCOVERY','Search the Knowledge Center when the question is known but the correct technical domain or document is not.','/knowledge-center/search'],
] as const;

const SCALE=[
 ['12,000+','Primary catalog products','12,192 unique ELIMFILTERS SKUs in the database-audited primary catalog.'],
 ['1,000,000+','Cross-reference relationships','1,044,939 unique relationships across the primary and LD catalog intelligence layers.'],
 ['37,000+','Equipment models','37,751 models connected through the curated equipment knowledge graph.'],
 ['123,000+','Vehicle configurations','123,357 distinct LD vehicle configurations derived from 282,252 application records.'],
 ['423','Active equipment makes','Curated equipment-make coverage supporting application and asset-protection reasoning.'],
] as const;

const DECISION=[
 ['01','Identify the condition','Operating symptoms, duty cycle, environment and service history define the starting point.'],
 ['02','Define the mechanism','Determine whether the issue is particles, water, restriction, degradation, bypass or another failure mechanism.'],
 ['03','Reference the framework','Use the applicable standard, cleanliness code or validated engineering method.'],
 ['04','Select the protection layer','Connect the failure mechanism to the correct system and ELIMFILTERS technology architecture.'],
 ['05','Validate the application','Confirm the actual part, geometry, duty and product-level data before selection.'],
] as const;

const PATHS=[
 ['Start with a problem','When the symptom is known but the cause is not, begin with contamination and failure modes.','/knowledge-center/problems','DIAGNOSE A PROBLEM'],
 ['Start with a system','When the protected asset or circuit is known, begin with the corresponding protection system.','/knowledge-center/systems','EXPLORE SYSTEMS'],
 ['Start with a technology','When the filtration architecture is already known, go directly to the technology reference.','/knowledge-center/technologies','EXPLORE TECHNOLOGIES'],
 ['Start with a standard','When a decision depends on test methodology, cleanliness or performance evidence, begin with standards.','/knowledge-center/standards','BROWSE STANDARDS'],
 ['Start with a known part','When the application is already identified, move directly into product intelligence and cross-reference.','https://part-search.elimfilters.com','OPEN PART SEARCH'],
 ['Start with an engineering question','When the issue spans multiple systems or repeated failures, request an application review.','mailto:applications@elimfilters.com?subject=ELIMFILTERS%20Knowledge%20Center%20Technical%20Review','REQUEST TECHNICAL REVIEW'],
] as const;

export default function KnowledgeCenterPage(){
 return <>
  <main className={styles.page} id="main-content">
   <section className={styles.hero}><div className={`${styles.inner} ${styles.heroGrid}`}>
    <div>
     <p className={styles.eyebrow}>ELIMFILTERS KNOWLEDGE SYSTEM</p>
     <h1 className={styles.title}>Engineering knowledge for better asset decisions.</h1>
     <p className={styles.lead}>Technical knowledge for filtration, contamination control, reliability and industrial asset protection — organized around the way engineers, fleet managers and maintenance teams investigate real operating problems.</p>
     <div className={styles.buttonRow}>
      <Link className={styles.primary} href="/knowledge-center/problems" data-conversion-action="knowledge-diagnostics">DIAGNOSE A PROBLEM</Link>
      <Link className={styles.secondary} href="/knowledge-center/search" data-conversion-action="knowledge-search">SEARCH KNOWLEDGE</Link>
     </div>
    </div>
    <div className={styles.signal} aria-label="Technical decision flow">
     <div className={styles.signalHead}><span className={styles.micro}>CONTAMINATION CONTROL LOGIC</span><span className={styles.micro}>CONDITION → VALIDATION</span></div>
     <svg viewBox="0 0 620 190" role="img" aria-hidden="true" style={{width:'100%',height:'auto',display:'block',marginTop:'1.6rem'}}>
      <defs><linearGradient id="signalLine" x1="0" x2="1"><stop offset="0%" stopColor="#FFF12D" stopOpacity="0.25"/><stop offset="100%" stopColor="#FFF12D" stopOpacity="1"/></linearGradient></defs>
      <line x1="40" y1="110" x2="580" y2="110" stroke="rgba(255,255,255,0.14)" strokeWidth="2"/>
      <path d="M40 110 C90 110 125 60 175 60 C225 60 260 150 310 150 C360 150 395 60 445 60 C495 60 530 110 580 110" fill="none" stroke="url(#signalLine)" strokeWidth="3"/>
      {[{x:40,y:110},{x:175,y:60},{x:310,y:150},{x:445,y:60},{x:580,y:110}].map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="9" fill="#050505" stroke="#FFF12D" strokeWidth="2"/><circle cx={p.x} cy={p.y} r="3" fill="#FFF12D"/></g>)}
      {[['CONDITION',40,140],['MECHANISM',175,45],['FRAMEWORK',310,175],['PROTECTION',445,45],['VALIDATION',580,140]].map(([label,x,y])=><text key={label as string} x={x as number} y={y as number} textAnchor={x===40?'start':x===580?'end':'middle'} fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="0.06em">{label}</text>)}
     </svg>
     <p className={styles.body} style={{marginTop:'1.6rem'}}>The Knowledge Center connects observed conditions to failure mechanisms, engineering references, protection systems, technologies and final application validation.</p>
    </div>
   </div></section>

   <section className={styles.domains}><div className={`${styles.inner} ${styles.domainRow}`}><span>REFERENCE DOMAINS</span>{['AIR INTAKE','FUEL','LUBRICATION','HYDRAULICS','COOLING','PNEUMATICS','RELIABILITY'].map(x=><span key={x}>{x}</span>)}</div></section>

   <section className={`${styles.section} ${styles.sectionAlt}`}><div className={styles.inner}>
    <p className={styles.eyebrow}>DATABASE-AUDITED APPLICATION INTELLIGENCE</p>
    <h2 className={styles.h2}>Engineering depth backed by catalog and application data.</h2>
    <p className={styles.lead}>ELIMFILTERS connects technical knowledge to a production catalog, OEM and aftermarket reference intelligence, equipment models and vehicle applications. Cross-reference data supports identification and application reasoning; product-level performance remains governed by validated technical evidence.</p>
    <div className={styles.decision} style={{marginTop:'2.4rem'}}>{SCALE.map(([value,title,text])=><article className={styles.decisionItem} key={title}><span>{value}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
   </div></section>

   <section className={styles.section}><div className={styles.inner}>
    <div className={styles.sectionHead}><h2 className={styles.h2}>Start with the technical question.</h2><p className={styles.body}>The system is organized by investigative intent, not by decorative categories. Move from the operating condition to the technical mechanism, supporting framework, protection architecture and validated application.</p></div>
    <div className={styles.hubGrid}>{HUBS.map(([n,title,label,description,href])=><Link href={href} className={styles.hub} key={title}><div className={styles.hubMeta}><span>{n}</span><span>{label}</span></div><h3>{title}</h3><p>{description}</p><b>OPEN REFERENCE →</b></Link>)}</div>
   </div></section>

   <section className={`${styles.section} ${styles.sectionAlt}`}><div className={styles.inner}>
    <p className={styles.eyebrow}>ENGINEERING DECISION PATH</p><h2 className={styles.h2}>Problem → evidence → protection → application.</h2>
    <div className={styles.decision} style={{marginTop:'2.4rem'}}>{DECISION.map(([n,title,text])=><article className={styles.decisionItem} key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
   </div></section>

   <section className={styles.section}><div className={styles.inner}>
    <div className={styles.sectionHead}><h2 className={styles.h2}>Choose the shortest technical path.</h2><p className={styles.body}>The same knowledge base supports different starting points. Use the route that matches what is already known instead of forcing every user through the same sequence.</p></div>
    <div className={styles.pathGrid}>{PATHS.map(([title,text,href,label])=><article className={styles.pathCard} key={title}><h3>{title}</h3><p>{text}</p>{href.startsWith('http')||href.startsWith('mailto:')?<a href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined} data-conversion-action={href.includes('part-search')?'product-intelligence':href.startsWith('mailto:')?'application-support':undefined}>{label} →</a>:<Link href={href}>{label} →</Link>}</article>)}</div>
   </div></section>

   <section className={`${styles.section} ${styles.sectionAlt}`}><div className={styles.inner}>
    <p className={styles.eyebrow}>SYSTEM CONNECTIONS</p><h2 className={styles.h2}>Knowledge does not stop at the article.</h2>
    <p className={styles.lead}>Technical content should lead to the next useful decision. Problems connect to systems. Systems connect to technologies. Technologies connect to validated applications and product intelligence.</p>
    <div className={styles.searchRow}><Link className={styles.searchLink} href="/systems/">PROTECTION SYSTEMS →</Link><Link className={styles.searchLink} href="/technologies/">TECHNOLOGIES →</Link><Link className={styles.searchLink} href="/industries/">INDUSTRIES →</Link><a className={styles.searchLink} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">PART SEARCH →</a></div>
   </div></section>

   <section className={styles.cta}><div className={`${styles.inner} ${styles.ctaGrid}`}><div><p className={styles.eyebrow}>APPLICATION SUPPORT</p><h2 className={styles.h2}>Bring us the operating condition — not just the part number.</h2><p className={styles.lead}>Use Part Search when the application is known. For repeated failures, contamination uncertainty, short service life or unclear protection architecture, use technical review.</p></div><div className={styles.buttonRow}><a className={styles.primary} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">Search Product Intelligence</a><a className={styles.secondary} href="mailto:applications@elimfilters.com?subject=ELIMFILTERS%20Knowledge%20Center%20Technical%20Review" data-conversion-action="application-support">TECHNICAL REVIEW</a></div></div></section>
  </main>
  <Footer/>
 </>;
}
