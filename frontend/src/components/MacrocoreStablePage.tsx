import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

const faqs = [
  ['What is MACROCORE™?', 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control and sealing integrity according to airflow demand and operating conditions.'],
  ['What is the difference between primary and secondary engine air filtration?', 'The primary element normally carries the contamination load. A secondary or safety element is used only where the intake architecture specifies an additional downstream protection layer.'],
  ['What is surface loading in air filtration?', 'Surface-oriented loading keeps a greater share of contamination near the upstream face of the media. Its value depends on media structure, airflow, contaminant characteristics and available filtration area.'],
  ['What is depth loading in air filtration?', 'Depth loading distributes more contamination through the thickness of the filtration structure. It can provide useful contaminant capacity in some duties, but restriction behavior depends on the specific media and application.'],
  ['What causes dust downstream of an engine air filter?', 'Possible causes include damaged or incorrectly seated elements, compromised seals, housing defects, incorrect part selection or contamination introduced during service.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods for engine air cleaners and filter elements. Numeric performance claims remain tied to validated data for the specific element or assembly.'],
] as const;

const positions = ['Primary engine air filtration','Secondary / safety air filtration where specified','Heavy-duty air-cleaner assemblies in dusty environments','Applications where airflow, restriction and sealing must be evaluated together'];
const conditions = ['High airborne dust concentration','Fine particulate and mixed particle-size environments','High engine load and sustained airflow demand','Remote or severe-duty service','Repeated idle-to-load cycles','Housing, seal and maintenance conditions'];
const parameters = ['Filtration efficiency for the validated product','Contaminant-holding capacity','Airflow requirement','Restriction development','Media configuration and filtration area','Seal geometry and housing interface'];
const errors = ['Choosing by dimensions alone','Treating every dusty environment as the same duty','Replacing only because the element looks dirty','Ignoring clean-side dust or damaged seals','Applying one universal micron or service-life value'];

export function MacrocoreStablePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://elimfilters.com/technologies/macrocore/#article',
    headline: 'MACROCORE™ Engine Air Filtration Technology',
    name: 'MACROCORE™',
    url: 'https://elimfilters.com/technologies/macrocore/',
    description: 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake protection, integrating media configuration, contaminant-holding capacity, restriction control and sealing integrity according to airflow demand and operating conditions.',
    author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    reviewedBy: TECHNICAL_REVIEWER,
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    about: ['engine air intake filtration', 'primary air filtration', 'secondary air filtration', 'surface loading filtration', 'depth loading filtration', 'air filter restriction'].map((name) => ({ '@type': 'Thing', name })),
    mentions: ['turbocharger', 'combustion air', 'air cleaner housing', 'dust holding capacity', 'ISO 5011'].map((name) => ({ '@type': 'Thing', name })),
    isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS', url: 'https://elimfilters.com/' },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Technologies', item: 'https://elimfilters.com/technologies/' },
      { '@type': 'ListItem', position: 3, name: 'MACROCORE™', item: 'https://elimfilters.com/technologies/macrocore/' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  };

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className={styles.hero} aria-labelledby="macrocore-title">
        <img className={styles.heroBackground} src="/images/mecanica-air.avif" alt="Engine air-intake service environment" />
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="macrocore-title" className={styles.srOnly}>MACROCORE™ Engine Air Filtration Technology</h1>
        <div className="macrocoreHeroWordmark" aria-hidden="true">MACROCORE™</div>
      </section>

      <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
        <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}>
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span>
          <Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>TECHNOLOGIES</Link><span>→</span>
          <span style={{color:'#fff12d'}}>MACROCORE™</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>FILTRATION TECHNOLOGY</p>
          <h2 className={styles.displayTitle}>MACROCORE™</h2>
          <p className={styles.applicationLine}><strong>Primary and secondary engine air filtration</strong></p>
          <p className={styles.lead}>An engine air-intake filtration architecture for controlling airborne particulate while managing airflow demand, restriction development and sealing integrity.</p>
          <p className={styles.bodyWide}>Applied across approved primary and secondary / safety engine-air filtration positions upstream of turbocharger, cylinder and combustion-air components.</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>Technology:</span> MACROCORE™</p>
                <p><span>Application:</span> Primary and secondary engine air filtration</p>
                <p><span>Technical review:</span> <Link href="/about/leadership/">Víctor Abreu — Founder &amp; CEO</Link></p>
              </div>
              <p className={styles.eyebrow}>DESCRIPTION</p>
              <h3 className={styles.featureTitle}>Airflow Management and Particle Control</h3>
              <p className={styles.lead}>MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src="/images/MACROCORE-media.png" alt="Conceptual fibrous filtration structure illustrating MACROCORE media architecture" />
              <figcaption>Microscopic visualization of filtration media structure used for technical illustration.</figcaption>
            </figure>
          </div>

          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}><h3 className={styles.h3}>Fine-fiber capture</h3><p className={styles.body}>Finer fiber structures can increase interception opportunities for small airborne particles. Specific MACROCORE™ media construction must be confirmed from validated product data.</p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}>Surface-oriented loading</h3><p className={styles.body}>Keeping more contamination near the upstream surface can reduce deep particle penetration. Its value depends on airflow, dust characteristics and available filtration area.</p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}>Depth loading</h3><p className={styles.body}>Depth-oriented media distributes contamination through more of the media thickness. Restriction behavior depends on fiber structure, contaminant distribution and airflow.</p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}>Restriction control</h3><p className={styles.body}>Capture efficiency alone does not define a successful engine-air filter. Particle control, contaminant capacity and airflow resistance must remain balanced through the service cycle.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>OPERATING REALITY</p><h2 className={styles.h2}>Engine air systems do not tolerate uncontrolled dust ingestion.</h2>
        <p className={styles.lead}>Airborne particulate that crosses the clean-air boundary can contribute to abrasive and erosive wear at turbocharger, cylinder, ring and combustion-air surfaces.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>A useful distinction</h3><p className={styles.body}>“Air filter” describes a category. Position, housing, airflow requirement and protection strategy determine what the element is actually being asked to do.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Primary contaminant: airborne particulate</h3><p className={styles.body}>Dust, soot, fibers and mixed debris can enter the intake stream. Protection depends on the element, seal, housing and clean-air path acting as one boundary.</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p><h2 className={styles.h2}>Where MACROCORE™ belongs</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Application positions</h3><ul className={styles.list}>{positions.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Operating conditions that change filter duty</h3><ul className={styles.list}>{conditions.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Operational risk environments</h3><ul className={styles.list}>{['Mining','Construction','Agriculture','Truck fleets','Power generation','Waste & municipal','Bus & coach'].map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p><h2 className={styles.h2}>Questions before selecting an engine air filter</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Key engineering parameters</h3><ul className={styles.list}>{parameters.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Common selection errors</h3><ul className={styles.list}>{errors.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Application validation</h3><ul className={styles.list}>{['Equipment and engine','Housing and element position','Airflow and restriction limits','Dust / duty environment','Current element and service history'].map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className={styles.inlineCta}><p><strong>Known part number?</strong> Use Part Search. <strong>Uncertain application or failure pattern?</strong> Use the engineering review path.</p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW</a></div></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p><h2 className={styles.h2}>Different intake stages do different work.</h2>
        <p className={styles.lead}>The primary element carries the normal contamination burden. Where specified, a secondary / safety element provides an additional clean-side protection layer. Selection must resolve airflow, restriction, sealing and housing requirements together.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Primary stage</h3><p className={styles.body}>Carries the normal contamination load while supporting required engine airflow.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Secondary protection</h3><p className={styles.body}>Adds downstream protection during service or abnormal primary-element conditions where specified.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Clean-air boundary</h3><p className={styles.body}>Element fit, housing condition and seal integrity keep contamination on the dirty side.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Protected assets</h3><p className={styles.body}>Turbocharger compressor surfaces, cylinder walls, piston rings and combustion-air passages depend on clean-air integrity.</p></article>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p><h2 className={styles.h2}>What early restriction or dust downstream may be telling you</h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{['Premature restriction or repeated short intervals','Dust tracks downstream of the element','Damaged or displaced seals','Housing, clamp or retention problems','Restriction that does not match expected duty','Contamination introduced during service'].map(x=><li key={x}>{x}</li>)}</ul>
        <div className={styles.inlineCta}><p>Dust downstream, premature restriction or repeated filter changes?</p><a href="mailto:applications@elimfilters.com?subject=MACROCORE%20Intake%20System%20Review" data-conversion-action="application-support">REQUEST INTAKE SYSTEM REVIEW</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p><h2 className={styles.h2}>Direct answers to common engine-air filtration questions.</h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>TECHNICAL BASIS</p><h2 className={styles.h2}>Technical reference</h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>ISO 5011 context</h3><p className={styles.body}>Engine air-cleaner performance is commonly evaluated using ISO 5011 methods. Published efficiency, dust-capacity and restriction values should remain tied to validated product data.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Claim governance</h3><p className={styles.body}>No universal micron rating, fiber diameter, efficiency percentage, manufacturing process or service-life multiplier is assigned across MACROCORE™ without validated product evidence.</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p><h2 className={styles.h2}>When engine air filtration becomes a fleet-level problem</h2>
        <p className={styles.lead}>Repeated dust downstream, short filter intervals, recurring seal failures, unexplained restriction or accelerated wear justify reviewing the complete intake boundary, operating environment and maintenance strategy.</p>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>SYSTEM INTEGRATION</p><h2 className={styles.h2}>Air Intake &amp; Airflow Protection</h2>
        <div className={styles.systemGrid}><div><p className={styles.lead}>Air Intake &amp; Airflow Protection controls contamination entering the engine and manages the clean-air path required to support equipment performance and component life.</p><Link className={styles.systemButton} href="/systems/air-intake/">EXPLORE PROTECTION SYSTEM</Link></div><p className={styles.bodyWide}>MACROCORE™ provides primary and secondary engine-air filtration within this architecture. Final selection resolves the protected asset, contamination mechanism, airflow requirement, duty cycle, housing interface and validated product evidence.</p></div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION SUPPORT</p><h2 className={styles.h2}>Bring us the application, duty cycle and failure pattern — not just the part number.</h2>
        <p className={styles.lead}>Use Part Search when the application is already known. When the issue is repeated contamination, short service life, uncertain restriction behavior, component exposure or an unclear intake architecture, use the technical review path.</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>EXPLORE RELATED TECHNOLOGIES</p><h2 className={styles.h2}>Explore related protection technologies and principles.</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}><Link href="/systems/" style={{color:'#fff',textDecoration:'none'}}>Protection Systems</Link></h3><p className={styles.body}>Move from the current topic to the contamination-control architecture protecting the asset.</p></div>
          <div><h3 className={styles.h3}><Link href="/industries/" style={{color:'#fff',textDecoration:'none'}}>Industries</Link></h3><p className={styles.body}>See how operating environment, duty cycle and downtime risk change the protection requirement.</p></div>
          <div><h3 className={styles.h3}><Link href="/knowledge-center/" style={{color:'#fff',textDecoration:'none'}}>Knowledge System</Link></h3><p className={styles.body}>Continue into standards, contamination mechanisms, engineering principles and reliability guidance.</p></div>
        </div>
      </div></section>
    </main>
  );
}
