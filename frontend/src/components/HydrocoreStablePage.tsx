import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';

const faqs = [
  ['What is HYDROCORE™?','HYDROCORE™ is the ELIMFILTERS fuel/water separation architecture for approved standard non-turbine separator filters, including drain and transparent-bowl configurations.'],
  ['Why is water in diesel fuel dangerous?','Water can contribute to corrosion, erosion, cavitation risk and accelerated wear at pumps, injectors and other precision fuel-system interfaces. Severity depends on the fuel system, contamination level and operating conditions.'],
  ['Can a restricted fuel/water separator cause power loss?','Yes. Excessive restriction can reduce fuel supply to the engine, especially under load. Reduced power, surging or fuel-starvation symptoms justify inspection of the separator, upstream fuel condition and the complete supply path.'],
  ['Why can a new separator plug early?','Severe particulate loading, microbial contamination, degraded fuel, cold-flow problems or contamination from storage tanks can shorten service life. Repeated early plugging should trigger a fuel-quality and storage review.'],
  ['What is the role of the drain or transparent bowl?','Where the approved separator uses a drain or transparent bowl, these features support inspection and removal of separated water. Service practice must follow the requirements of the specific application.'],
  ['Does HYDROCORE™ apply to FH or FG turbine systems?','No. FH and FG turbine-style fuel/water separator systems are governed by TURBOCORE™. HYDROCORE™ applies to approved standard non-turbine separator configurations.'],
  ['Does HYDROCORE™ replace particulate fuel filtration?','No. HYDROCORE™ governs standard fuel/water separation. Plain diesel-fuel particulate filtration is governed separately by SYNTAPORE™ within the ELIMFILTERS Fuel Cleanliness Protection architecture.'],
] as const;

const list=(items:string[])=><ul className={styles.list}>{items.map(x=><li key={x}>{x}</li>)}</ul>;

export function HydrocoreStablePage(){
 const article={
  '@context':'https://schema.org','@type':'TechArticle','@id':'https://elimfilters.com/technologies/hydrocore/#article',
  headline:'HYDROCORE™ Fuel/Water Separation Technology',name:'HYDROCORE™',url:'https://elimfilters.com/technologies/hydrocore/',
  description:'HYDROCORE™ is the ELIMFILTERS fuel/water separation architecture developed for approved standard diesel separator applications where water control is required before fuel reaches pumps, injectors and other precision fuel-system components.',
  author:{'@type':'Organization','@id':'https://elimfilters.com/#organization',name:'ELIMFILTERS'},
  publisher:{'@type':'Organization','@id':'https://elimfilters.com/#organization',name:'ELIMFILTERS'},
  about:['diesel fuel water separation','fuel contamination control','fuel separator drainage','fuel restriction','water in diesel fuel','fuel system corrosion'].map(name=>({'@type':'Thing',name})),
  mentions:['high-pressure fuel pump','diesel injectors','fuel starvation under load','microbial fuel contamination','fuel storage contamination','transparent separator bowl'].map(name=>({'@type':'Thing',name})),
  isPartOf:{'@type':'WebSite','@id':'https://elimfilters.com/#website',name:'ELIMFILTERS',url:'https://elimfilters.com/'}
 };
 const faq={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'https://elimfilters.com/'},{'@type':'ListItem',position:2,name:'Technologies',item:'https://elimfilters.com/technologies/'},{'@type':'ListItem',position:3,name:'HYDROCORE™',item:'https://elimfilters.com/technologies/hydrocore/'}]};

 return <main id="main-content" className={styles.page}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(article)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faq)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>

  <section className={styles.hero} aria-labelledby="hydrocore-title">
   <img className={styles.heroBackground} src="/images/fuellseparator-hero.avif" alt="Diesel fuel/water separation service environment"/>
   <div className={styles.heroShade} aria-hidden="true"/>
   <h1 id="hydrocore-title" className={styles.srOnly}>HYDROCORE™ Fuel/Water Separation Technology</h1>
   <img className={styles.heroMark} src="/assets/HYDROCORE_final.avif" alt="HYDROCORE™"/>
  </section>

  <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
   <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}>
    <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span>
    <Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>TECHNOLOGIES</Link><span>→</span>
    <span style={{color:'#fff12d'}}>HYDROCORE™</span>
   </div>
  </nav>

  <section className={styles.introSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>FILTRATION TECHNOLOGY</p>
   <h2 className={styles.displayTitle} style={{fontSize:'clamp(2.25rem,5.25vw,4.65rem)'}}>HYDROCORE™</h2>
   <p className={styles.applicationLine}><strong>Fuel/Water Separation Architecture</strong></p>
   <p className={styles.lead}>A fuel/water separation architecture developed for approved standard diesel separator applications where water control is required before fuel reaches downstream pumps, injectors and other precision fuel-system components.</p>

   <div className={styles.mediaGrid}>
    <div className={styles.mediaCopy}>
     <div className={styles.metaStack}>
      <p><span>Technology:</span> HYDROCORE™</p>
      <p><span>Application:</span> Standard non-turbine fuel/water separators</p>
     </div>
     <p className={styles.eyebrow}>DESCRIPTION</p>
     <h3 className={styles.featureTitle}>Fuel/Water Separation and Drainage Control</h3>
     <p className={styles.lead}>HYDROCORE™ is ELIMFILTERS’ fuel/water separation architecture developed for approved standard diesel fuel separator applications where water control is required before fuel reaches downstream pumps, injectors and other precision fuel-system components.</p>
     <p className={styles.bodyWide}>Its media and separator configuration are selected around fuel flow, water-separation requirements, contaminant load, pressure drop, drainage strategy and operating duty. Effective water management helps reduce downstream exposure to corrosion, erosion, cavitation and contamination-related wear while supporting consistent fuel delivery under load.</p>
     <p className={styles.bodyWide}>Water accumulation, inadequate drainage, contaminated bulk fuel and microbial growth can accelerate separator loading and contribute to premature restriction. For this reason, HYDROCORE™ is treated as part of the complete fuel-cleanliness strategy rather than as an isolated filter element.</p>
     <p className={styles.bodyWide}>HYDROCORE™ can be configured for approved standard spin-on and cartridge fuel/water separator designs, including drain and transparent-bowl arrangements. FH and FG turbine-style systems remain outside this architecture and are governed separately by TURBOCORE™.</p>
    </div>
    <figure className={styles.mediaFigure}>
     <div style={{overflow:'hidden',border:'1px solid rgba(255,255,255,.12)',background:'#707070'}}>
      <img
       className={styles.mediaImage}
       src="/images/SYNTAPORE_media.png"
       alt="Conceptual fibrous fuel/water separation media structure for HYDROCORE"
       style={{border:0,filter:'grayscale(1) contrast(1.08) brightness(.96)',transform:'scale(1.035)',transformOrigin:'center center'}}
      />
     </div>
     <figcaption>Conceptual visualization of a fibrous fuel/water separation media structure. Not an ELIMFILTERS laboratory micrograph.</figcaption>
    </figure>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>OPERATING REALITY</p>
   <h2 className={styles.h2}>Water and restriction can become component-risk mechanisms.</h2>
   <p className={styles.lead}>When water passes downstream, corrosion, erosion and wear risk increase at pumps, injectors and other precision fuel-system interfaces. When restriction rises excessively, the engine may lose power, surge or show fuel-starvation symptoms under load.</p>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Water exposure</h3><p className={styles.body}>Separated water that is not removed or water that bypasses the intended separation boundary can increase downstream corrosion and wear risk.</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Restriction exposure</h3><p className={styles.body}>A loaded or improperly serviced separator can reduce available fuel supply, with symptoms often becoming more evident as engine demand increases.</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p>
   <h2 className={styles.h2}>Where HYDROCORE™ belongs</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>Approved configurations</h3>{list(['Standard spin-on fuel/water separators','Cartridge separator configurations','Drain-equipped separators','Transparent-bowl separators where approved'])}</div>
    <div><h3 className={styles.h3}>Operating exposure</h3>{list(['Bulk-fuel storage','Condensation and water ingress','Agricultural and construction duty','Remote or severe-duty fuel handling'])}</div>
    <div><h3 className={styles.h3}>Excluded architecture</h3>{list(['FH turbine systems','FG turbine systems','Plain particulate-only diesel filtration','Applications without validated separator data'])}</div>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p>
   <h2 className={styles.h2}>Questions before selecting a fuel/water separator</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>Key parameters</h3>{list(['Approved separator geometry','Fuel flow requirement','Water-separation requirement','Pressure-drop limit','Drain and bowl configuration','Service access'])}</div>
    <div><h3 className={styles.h3}>Common errors</h3>{list(['Selecting by dimensions alone','Ignoring drain service requirements','Treating all water contamination as identical','Extending intervals despite rising restriction','Confusing HYDROCORE™ with FH/FG architecture'])}</div>
    <div><h3 className={styles.h3}>Validation inputs</h3>{list(['Engine or equipment','Current separator reference','Fuel system architecture','Flow and duty profile','Storage conditions','Water or plugging history'])}</div>
   </div>
   <div className={styles.inlineCta}><p><strong>Known application?</strong> Use Part Search. <strong>Water, restriction or repeated plugging problem?</strong> Use technical review.</p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW</a></div></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p>
   <h2 className={styles.h2}>Water loading, flow and restriction develop together.</h2>
   <p className={styles.lead}>The separator must support the required fuel supply while providing the separation behavior required by the approved application. As water and contamination accumulate, pressure drop and service demand can change.</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p>
   <h2 className={styles.h2}>What fuel starvation or repeated separator plugging may be telling you</h2>
   {list(['Water accumulation requiring drainage','High contamination load from storage','Microbial contamination or sludge','Sediment from tanks or transfer equipment','Cold-flow or degraded-fuel problems','Service interval mismatched to duty'])}
   <div className={styles.inlineCta}><p>Repeated plugging, visible water or loss of power under load justifies reviewing the complete fuel supply path.</p><a href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20System%20Review" data-conversion-action="application-support">REQUEST FUEL SYSTEM REVIEW</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p>
   <h2 className={styles.h2}>Direct answers to common fuel/water-separation questions.</h2>
   <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>TECHNICAL BASIS</p>
   <h2 className={styles.h2}>Technical reference</h2>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Product-level evidence</h3><p className={styles.body}>Water-separation efficiency, pressure drop, flow capability, water-holding capacity and service limits belong to validated individual separator data and the applicable test method.</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Claim governance</h3><p className={styles.body}>HYDROCORE™ is not assigned one universal separation efficiency, micron rating, capacity, flow limit or service interval across every application.</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p>
   <h2 className={styles.h2}>When separator maintenance becomes a fuel-quality problem</h2>
   <p className={styles.lead}>Repeated water accumulation, short separator life, microbial contamination, fuel starvation or evidence of downstream corrosion justify reviewing storage, transfer, separation, filtration and maintenance as one contamination-control chain.</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>SYSTEM INTEGRATION</p>
   <h2 className={styles.h2}>Fuel Cleanliness Protection</h2>
   <div className={styles.systemGrid}><div><p className={styles.lead}>HYDROCORE™ provides the standard non-turbine fuel/water separation layer within ELIMFILTERS Fuel Cleanliness Protection.</p><Link className={styles.systemButton} href="/systems/fuel-cleanliness/">EXPLORE PROTECTION SYSTEM</Link></div><p className={styles.bodyWide}>SYNTAPORE™ governs plain diesel-fuel particulate filtration. TURBOCORE™ governs FH/FG turbine-style fuel/water separator systems. Keeping those roles separate prevents incorrect application assignment.</p></div>
  </div></section>

  <section className={styles.ctaSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>APPLICATION SUPPORT</p>
   <h2 className={styles.h2}>Bring us the fuel-system architecture, water history and duty cycle — not just the part number.</h2>
   <p className={styles.lead}>Use Part Search when the separator is known. For repeated water, plugging, restriction or fuel-quality problems, use technical review.</p>
   <div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>EXPLORE RELATED TECHNOLOGIES</p>
   <h2 className={styles.h2}>Continue through the fuel-cleanliness architecture.</h2>
   <div className={styles.textLinks}><Link href="/technologies/syntapore/">SYNTAPORE™ →</Link><Link href="/technologies/turbocore/">TURBOCORE™ →</Link><Link href="/systems/fuel-cleanliness/">Fuel Cleanliness Protection →</Link><a href="https://part-search.elimfilters.com">Part Search →</a></div>
  </div></section>
 </main>;
}
