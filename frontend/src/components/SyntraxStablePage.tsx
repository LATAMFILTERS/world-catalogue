import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

const faqs = [
  ['What is SYNTRAX™?', 'SYNTRAX™ is the ELIMFILTERS architecture developed to control wear debris, soot agglomerates and other contaminants present in the lubricant. Its selection balances efficiency, contaminant capacity, oil flow, pressure drop and structural integrity throughout the service interval.'],
  ['What contaminants does an engine oil filter control?', 'Typical contamination can include wear debris, soot agglomerates, assembly residue and other suspended solids.'],
  ['Is a lower micron rating always better?', 'No. Efficiency must be evaluated together with oil flow, pressure drop, contaminant capacity, cold-start behavior and the approved application.'],
  ['Why does oil-filter restriction increase?', 'As contamination accumulates, resistance to oil flow can rise. Loading rate depends on media structure, oil viscosity, temperature, flow demand and duty cycle.'],
  ['Can poor filtration contribute to engine wear?', 'A compromised filtration stage can reduce contamination control or create abnormal flow conditions. Repeated wear findings require system-level diagnosis.'],
  ['What information helps application validation?', 'Engine and equipment identification, current filter reference, oil grade, service interval, duty cycle, operating environment and oil-analysis history are useful starting points.'],
] as const;

const list = (items:string[]) => <ul className={styles.list}>{items.map(x=><li key={x}>{x}</li>)}</ul>;

export function SyntraxStablePage() {
  const articleSchema = {
    '@context':'https://schema.org','@type':'TechArticle','@id':'https://elimfilters.com/technologies/syntrax/#article',
    headline:'SYNTRAX™ Lubrication Filtration Technology',name:'SYNTRAX™',url:'https://elimfilters.com/technologies/syntrax/',
    description:'SYNTRAX™ is the ELIMFILTERS architecture developed to control wear debris, soot agglomerates and other contaminants present in the lubricant. Its selection balances efficiency, contaminant capacity, oil flow, pressure drop and structural integrity throughout the service interval.',
    image:'https://elimfilters.com/images/syntrax.avif',datePublished:'2026-08-31',dateModified:'2026-09-01',
    author:{'@id':'https://elimfilters.com/#organization'},reviewedBy:TECHNICAL_REVIEWER,publisher:{'@id':'https://elimfilters.com/#organization'},
    about:['engine lubrication filtration','wear debris control','soot agglomerate control','oil filter pressure drop','oil flow management'].map(name=>({'@type':'Thing',name})),
    isPartOf:{'@type':'WebSite','@id':'https://elimfilters.com/#website',name:'ELIMFILTERS',url:'https://elimfilters.com/'}
  };
  const faqSchema = {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
  const breadcrumbSchema = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:'https://elimfilters.com/'},
    {'@type':'ListItem',position:2,name:'Technologies',item:'https://elimfilters.com/technologies/'},
    {'@type':'ListItem',position:3,name:'SYNTRAX™',item:'https://elimfilters.com/technologies/syntrax/'}
  ]};

  return <main id="main-content" className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}} />

    <section className={`${styles.hero} ${styles.syntraxHero}`} aria-labelledby="syntrax-title">
      <img className={styles.heroBackground} src="/images/syntrax.avif" alt="Engine lubrication filtration service environment" />
      <div className={styles.heroShade} aria-hidden="true" />
      <h1 id="syntrax-title" className={styles.srOnly}>SYNTRAX™ Lubrication Filtration Technology</h1>
      <img className={styles.heroMark} src="/assets/SYNTRAX_final.avif" alt="SYNTRAX™" />
    </section>

    <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}><div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}><Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span><Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>TECHNOLOGIES</Link><span>→</span><span style={{color:'#fff12d'}}>SYNTRAX™</span></div></nav>

    <section className={styles.introSection}><div className={styles.inner}>
      <p className={styles.eyebrow}>FILTRATION TECHNOLOGY</p>
      <h2 className={styles.displayTitle} style={{fontSize:'clamp(2.25rem,5.25vw,4.65rem)'}}>SYNTRAX™</h2>
      <p className={styles.applicationLine}><strong>Engine lubrication filtration</strong></p>
      <p className={styles.lead}>A lubrication-filtration architecture for controlling wear debris, soot agglomerates and other contaminants while maintaining oil flow and structural integrity through the service interval.</p>
      <div className={styles.mediaGrid}><div className={styles.mediaCopy}><div className={styles.metaStack}><p><span>Technology:</span> SYNTRAX™</p><p><span>Application:</span> Engine lubrication filtration</p><p><span>Technical review:</span> <Link href="/about/leadership/">Víctor Abreu — Founder &amp; CEO</Link></p></div><p className={styles.eyebrow}>DESCRIPTION</p><h3 className={styles.featureTitle}>Lubrication System Contamination Control</h3><p className={styles.lead}>SYNTRAX™ is the ELIMFILTERS architecture developed to control wear debris, soot agglomerates and other contaminants present in the lubricant. Its selection balances efficiency, contaminant capacity, oil flow, pressure drop and structural integrity throughout the service interval.</p></div><figure className={styles.mediaFigure}><img className={styles.mediaImage} src="/images/SINTRAX_media-.png.png" alt="Conceptual filtration media structure illustrating SYNTRAX lubrication contamination-control architecture" /><figcaption>Microscopic visualization of filtration media structure used for technical illustration.</figcaption></figure></div>
    </div></section>

    <section className={styles.band}><div className={styles.inner}><p className={styles.eyebrow}>OPERATING REALITY</p><h2 className={styles.h2}>Lubrication cleanliness is part of wear control.</h2><p className={styles.lead}>Engine oil carries internally generated wear debris, soot and other suspended contaminants through precision interfaces. Filtration must control contamination without creating unacceptable restriction or compromising oil delivery.</p></div></section>

    <section className={styles.bandAlt}><div className={styles.inner}><p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p><h2 className={styles.h2}>Where SYNTRAX™ belongs</h2><div className={styles.editorialColumns}><div><h3 className={styles.h3}>Application positions</h3>{list(['Full-flow engine lubrication filtration','Spin-on and cartridge lube-filter positions','Heavy-duty diesel lubrication circuits'])}</div><div><h3 className={styles.h3}>Conditions that change filter duty</h3>{list(['High soot loading','Extended operating hours','Cold-start viscosity','High engine load','Dust-intensive environments'])}</div><div><h3 className={styles.h3}>Protected assets</h3>{list(['Bearings and journals','Turbocharger lubrication interfaces','Valve-train components','Oil galleries and precision passages'])}</div></div></div></section>

    <section className={styles.band}><div className={styles.inner}><p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p><h2 className={styles.h2}>Questions before selecting a lubrication filter</h2><div className={styles.editorialColumns}><div><h3 className={styles.h3}>Key parameters</h3>{list(['Validated filtration efficiency','Contaminant capacity','Oil flow','Pressure drop','Media compatibility','Structural integrity'])}</div><div><h3 className={styles.h3}>Common errors</h3>{list(['Choosing by thread alone','Assuming lower micron is always better','Ignoring cold-oil viscosity','Extending intervals without condition evidence','Ignoring seal compatibility'])}</div><div><h3 className={styles.h3}>Validation inputs</h3>{list(['Engine and equipment','Current filter reference','Oil grade','Service interval','Oil-analysis and wear history'])}</div></div><div className={styles.inlineCta}><p><strong>Known part number?</strong> Use Part Search. <strong>Abnormal wear or uncertain application?</strong> Use technical review.</p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=SYNTRAX%20Lubrication%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW</a></div></div></div></section>

    <section className={styles.bandAlt}><div className={styles.inner}><p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p><h2 className={styles.h2}>Contamination loading and oil flow must remain in balance.</h2><p className={styles.lead}>As wear debris, soot agglomerates and other solids accumulate, pressure drop can rise. Useful service life depends on contaminant load, media configuration, oil viscosity, flow demand and structural condition together.</p></div></section>

    <section className={styles.band}><div className={styles.inner}><p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p><h2 className={styles.h2}>What abnormal loading or wear evidence may be telling you</h2>{list(['Abnormal wear debris in oil analysis','Increasing restriction','Shortened filter intervals','Unusual soot or sludge loading','Repeated wear-component events','Filter deformation or seal distress'])}<div className={styles.inlineCta}><p>Repeated wear findings or short filter intervals justify a lubrication-system review.</p><a href="mailto:applications@elimfilters.com?subject=SYNTRAX%20Lubrication%20System%20Review" data-conversion-action="application-support">REQUEST LUBRICATION SYSTEM REVIEW</a></div></div></section>

    <section className={styles.bandAlt}><div className={styles.inner}><p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p><h2 className={styles.h2}>Direct answers to common lubrication-filtration questions.</h2><div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>

    <section className={styles.band}><div className={styles.inner}><p className={styles.eyebrow}>TECHNICAL BASIS</p><h2 className={styles.h2}>Technical reference</h2><div className={styles.twoColumnNotes}><article className={styles.noteBlock}><h3 className={styles.h3}>Product-level evidence</h3><p className={styles.body}>Efficiency, capacity, restriction and durability values remain tied to validated product data and the approved application.</p></article><article className={styles.noteBlock}><h3 className={styles.h3}>Claim governance</h3><p className={styles.body}>SYNTRAX™ is not assigned one universal micron rating, efficiency percentage, media construction or service-life multiplier.</p></article></div></div></section>

    <section className={styles.bandAlt}><div className={styles.inner}><p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p><h2 className={styles.h2}>When lubrication filtration becomes a fleet-level problem</h2><p className={styles.lead}>Recurring abnormal wear, short filter intervals, contamination events or unexplained restriction justify reviewing lubricant condition, filtration duty, service strategy and operating environment together.</p></div></section>

    <section className={styles.band}><div className={styles.inner}><p className={styles.eyebrow}>SYSTEM INTEGRATION</p><h2 className={styles.h2}>Lubrication Protection</h2><div className={styles.systemGrid}><div><p className={styles.lead}>Lubrication Protection manages suspended contamination and wear debris while preserving oil flow needed to protect loaded engine surfaces.</p><Link className={styles.systemButton} href="/systems/lubrication/">EXPLORE PROTECTION SYSTEM</Link></div><p className={styles.bodyWide}>SYNTRAX™ provides the filtration architecture within this system. Final selection resolves contaminant load, oil viscosity, flow requirement, pressure-drop limits, structural interface and validated product evidence.</p></div></div></section>

    <section className={styles.ctaSection}><div className={styles.inner}><p className={styles.eyebrow}>APPLICATION SUPPORT</p><h2 className={styles.h2}>Bring us the engine, oil, duty cycle and wear pattern — not just the part number.</h2><p className={styles.lead}>Use Part Search when the application is known. For abnormal wear, short filter life, restriction or uncertain lubrication architecture, use technical review.</p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=SYNTRAX%20Lubrication%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div></div></section>

    <section className={styles.bandAlt}><div className={styles.inner}><p className={styles.eyebrow}>EXPLORE RELATED TECHNOLOGIES</p><h2 className={styles.h2}>Explore related protection technologies and principles.</h2><div className={styles.textLinks}><Link href="/systems/">Protection Systems →</Link><Link href="/industries/">Industries →</Link><Link href="/knowledge-center/">Knowledge System →</Link><a href="https://part-search.elimfilters.com">Part Search →</a></div></div></section>
  </main>;
}