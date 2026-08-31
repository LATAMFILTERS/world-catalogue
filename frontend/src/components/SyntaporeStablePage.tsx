import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';

const applications = [
  'Primary fuel filtration without a dedicated water-separation function',
  'Secondary / final fuel filtration',
  'Cartridge fuel-filter modules',
  'Diesel fuel systems requiring particulate control upstream of precision components',
];

const conditions = [
  'Bulk-fuel cleanliness',
  'Remote fueling locations',
  'High engine load',
  'Cold-fuel viscosity',
  'Long storage periods',
  'Maintenance practices around tanks and transfer equipment',
];

const riskIndustries = ['Truck fleets','Mining','Construction','Agriculture','Power generation','Marine support applications','Bus and coach'];

const selectionQuestions = [
  'Is this a primary or secondary filtration position?',
  'Does the application require dedicated water separation instead?',
  'What are the approved fuel-flow and pressure conditions?',
  'What housing or module does the element fit?',
  'Is there a known contamination or premature-plugging history?',
];

const parameters = [
  'Filtration efficiency for the validated product',
  'Contaminant-holding capacity',
  'Fuel flow',
  'Pressure drop',
  'Media and fuel compatibility',
  'Seal and housing interface',
];

const selectionErrors = [
  'Confusing a particulate fuel filter with a dedicated water separator',
  'Choosing by thread or gasket only',
  'Using the same micron assumption for every filtration stage',
  'Ignoring upstream fuel quality and storage conditions',
  'Extending intervals despite restriction or fuel-delivery symptoms',
];

const serviceSignals = [
  'Loss of power or RPM under load',
  'Hard starting, hesitation or intermittent stalling',
  'Repeatedly short filter intervals',
  'Fuel-delivery or low-supply-pressure symptoms',
  'Visible tank debris, corrosion products or unusual sediment',
  'Evidence of microbial or sludge contamination in stored fuel',
];

const failureRisks = [
  ['High-pressure pump exposure', 'Restricted or contaminated fuel supply can increase stress on precision fuel-system components. Repeated low-supply conditions should be diagnosed before they become a pump or system-level event.'],
  ['Injector contamination', 'Fine abrasive contamination can affect precision injector surfaces and metering behavior. The filtration system must protect downstream components without creating unacceptable flow restriction.'],
  ['Fuel starvation under load', 'A restricted element can limit fuel delivery when engine demand rises, producing hesitation, RPM loss, reduced power or stalling under heavy work.'],
  ['Water and corrosion', 'Water contamination can promote corrosion and cold-weather operating problems. Applications requiring dedicated water separation should be assigned to the appropriate separation architecture rather than treated as particulate filtration alone.'],
  ['Microbial contamination', 'Stored diesel can support microbial growth at fuel/water interfaces. Biomass and sludge can plug replacement filters rapidly, so recurring early plugging may require tank and fuel-source investigation.'],
] as const;

const faqs = [
  ['What is SYNTAPORE™?', 'SYNTAPORE™ is the ELIMFILTERS architecture for particulate control in primary, secondary and cartridge diesel-fuel filtration stages. Its configuration is selected around efficiency, contaminant-holding capacity, fuel flow and pressure drop for the approved application.'],
  ['How do I know whether I need a primary or secondary fuel filter?', 'The application position determines the duty. A primary stage generally carries more contamination load, while downstream filtration protects increasingly sensitive fuel-system components.'],
  ['Is a lower micron rating always better?', 'No. Filtration efficiency, contaminant capacity, fuel flow, pressure drop and the approved filtration position must be evaluated together.'],
  ['Can SYNTAPORE™ be used where water separation is required?', 'SYNTAPORE™ is used for particulate-control fuel-filter positions. Applications requiring dedicated fuel/water separation belong to the HYDROCORE™ architecture.'],
  ['Why is my fuel filter plugging much earlier than expected?', 'Possible causes include dirty bulk fuel, tank debris or corrosion, cold-flow restriction, microbial or sludge contamination, or an incorrect filter position or specification.'],
  ['Can a restricted fuel filter cause loss of power under load?', 'Yes. If the element cannot supply the required fuel flow as engine demand rises, the application can exhibit hesitation, reduced RPM, reduced power or stalling. The complete fuel-supply path should be checked.'],
  ['Can contaminated fuel damage pumps and injectors?', 'Precision pumps and injectors are sensitive to contamination and poor fuel supply. Abrasive particles, corrosion products, water and recurring low-supply conditions can contribute to costly fuel-system damage, so repeated symptoms should be treated as a system issue rather than only a filter-replacement issue.'],
  ['What information helps with application validation?', 'Useful evidence includes engine and equipment identification, filter position, current element reference, housing or module, fuel source, service interval, flow or restriction history and any injector or pump events.'],
] as const;

export function SyntaporeStablePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://elimfilters.com/technologies/syntapore/#article',
    headline: 'SYNTAPORE™ Fuel Filtration Technology',
    name: 'SYNTAPORE™',
    url: 'https://elimfilters.com/technologies/syntapore/',
    description: 'SYNTAPORE™ is the ELIMFILTERS architecture for particulate control in primary, secondary and cartridge diesel-fuel filtration stages. Its configuration is selected around efficiency, contaminant-holding capacity, flow and pressure drop for each application.',
    author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    about: [
      { '@type': 'Thing', name: 'diesel fuel filtration' },
      { '@type': 'Thing', name: 'primary fuel filtration' },
      { '@type': 'Thing', name: 'secondary fuel filtration' },
      { '@type': 'Thing', name: 'particulate contamination control' },
      { '@type': 'Thing', name: 'fuel filter restriction' },
    ],
    mentions: ['diesel fuel filtration','primary fuel filtration','secondary fuel filtration','cartridge fuel filter','particulate contamination','fuel restriction','fuel starvation','injector contamination','microbial fuel contamination','fuel flow','pressure drop'].map((name) => ({ '@type': 'Thing', name })),
    isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS', url: 'https://elimfilters.com/' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Technologies', item: 'https://elimfilters.com/technologies/' },
      { '@type': 'ListItem', position: 3, name: 'SYNTAPORE™', item: 'https://elimfilters.com/technologies/syntapore/' },
    ],
  };

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className={styles.hero} aria-labelledby="syntapore-title">
        <img className={styles.heroBackground} src="/images/hero-syntapore.avif" alt="Diesel fuel filtration service environment" />
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="syntapore-title" className={styles.srOnly}>SYNTAPORE™ Fuel Filtration Technology</h1>
        <img className={styles.heroMark} src="/assets/SYNTAPORE_final.avif" alt="SYNTAPORE™" />
      </section>

      <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
        <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}>
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span>
          <Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>TECHNOLOGIES</Link><span>→</span>
          <span style={{color:'#fff12d'}}>SYNTAPORE™</span>
        </div>
      </nav>

      <section className={styles.introSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>FILTRATION TECHNOLOGY</p>
        <h2 className={styles.displayTitle} style={{fontSize:'clamp(2.25rem,5.25vw,4.65rem)'}}>SYNTAPORE™</h2>
        <p className={styles.applicationLine}><strong>Primary and secondary spin-on / cartridge fuel filtration</strong></p>
        <p className={styles.lead}>A diesel-fuel filtration architecture for primary, secondary and cartridge fuel-filter applications.</p>
        <p className={styles.bodyWide}>Applied across approved primary, secondary and cartridge diesel-fuel filtration stages upstream of precision pumps and injectors.</p>

        <div className={styles.mediaGrid}>
          <div className={styles.mediaCopy}>
            <div className={styles.metaStack}>
              <p><span>Technology:</span> SYNTAPORE™</p>
              <p><span>Application:</span> Primary, secondary and cartridge diesel-fuel particulate filtration</p>
            </div>
            <p className={styles.eyebrow}>DESCRIPTION</p>
            <h3 className={styles.featureTitle}>Advanced Particle Control in Fuel</h3>
            <p className={styles.lead}>SYNTAPORE™ is the ELIMFILTERS architecture for particulate control in primary, secondary and cartridge diesel-fuel filtration stages. Its configuration is selected around efficiency, contaminant-holding capacity, flow and pressure drop for each application.</p>
          </div>
          <figure className={styles.mediaFigure}>
            <img className={styles.mediaImage} src="/images/SYNTAPORE_media.png" alt="Conceptual filtration media structure illustrating SYNTAPORE particulate-control architecture" />
            <figcaption>Microscopic visualization of filtration media structure used for technical illustration.</figcaption>
          </figure>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>OPERATING REALITY</p>
        <h2 className={styles.h2}>Modern fuel systems do not tolerate casual contamination control.</h2>
        <p className={styles.lead}>Particles that once passed through lower-pressure fuel systems can become damaging at precision pumps and injectors. SYNTAPORE™ is used for approved primary, secondary and cartridge fuel-filter positions where particulate control is the main filtration duty.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>A useful distinction</h3><p className={styles.body}>“Fuel filter” describes a category. The application position tells us what the element is actually being asked to do.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Primary contaminant: particulate in diesel fuel</h3><p className={styles.body}>Tank debris, handling contamination, corrosion products and fine particles can reach the engine unless filtration stages are selected and serviced as a system.</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p><h2 className={styles.h2}>Where SYNTAPORE™ belongs</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Application positions</h3><ul className={styles.list}>{applications.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Operating conditions that change filter duty</h3><ul className={styles.list}>{conditions.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Where fuel cleanliness becomes operational risk</h3><ul className={styles.list}>{riskIndustries.map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p><h2 className={styles.h2}>Questions before selecting a fuel filter</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Application questions</h3><ul className={styles.list}>{selectionQuestions.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Key engineering parameters</h3><ul className={styles.list}>{parameters.map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Common selection errors</h3><ul className={styles.list}>{selectionErrors.map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p><h2 className={styles.h2}>Different stages do different work.</h2>
        <p className={styles.lead}>A primary stage is generally expected to carry a larger contamination burden; downstream filtration protects increasingly sensitive components. Exact efficiency, capacity and flow requirements must follow the approved application rather than a universal micron rule.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Primary filtration</h3><p className={styles.body}>Carries the larger upstream particulate load according to the approved fuel-system architecture.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Secondary / final filtration</h3><p className={styles.body}>Provides downstream particulate control ahead of increasingly sensitive fuel-system components.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Cartridge modules</h3><p className={styles.body}>Element selection must match the module, flow path, seal interface and validated application.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>What clean fuel protects</h3><p className={styles.body}>High-pressure fuel pumps, precision injectors, metering components and downstream fuel passages.</p></article>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>FUEL-SYSTEM DAMAGE MECHANISMS</p><h2 className={styles.h2}>A restricted or contaminated fuel supply can become a component-level failure.</h2>
        <p className={styles.lead}>Early filter plugging is not only a maintenance inconvenience. When fuel delivery, contamination control or stored-fuel quality deteriorates, the resulting operating condition can expose precision pumps and injectors to abnormal stress or contamination.</p>
        <div className={styles.twoColumnNotes}>{failureRisks.map(([title,text])=><article key={title} className={styles.noteBlock}><h3 className={styles.h3}>{title}</h3><p className={styles.body}>{text}</p></article>)}</div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p><h2 className={styles.h2}>What early plugging or fuel starvation may be telling you</h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{serviceSignals.map(x=><li key={x}>{x}</li>)}</ul>
        <div className={styles.inlineCta}><p>Repeated short filter intervals, power loss under load or contamination events should trigger a fuel-supply review, not just another filter replacement.</p><a href="mailto:applications@elimfilters.com?subject=SYNTAPORE%20Fuel%20System%20Review" data-conversion-action="application-support">REQUEST FUEL SYSTEM REVIEW</a></div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p><h2 className={styles.h2}>What to clarify before treating every fuel-filter position the same way.</h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>TECHNICAL BASIS</p><h2 className={styles.h2}>Technical reference</h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Product-level evidence</h3><p className={styles.body}>Specific filtration efficiency, contaminant capacity, flow and pressure-drop values should be backed by validated test data for the individual element and approved application.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>No universal micron claim</h3><p className={styles.body}>Primary and secondary diesel-fuel filtration positions can have different requirements. SYNTAPORE™ therefore does not assign one universal micron or efficiency value across the technology.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Water-separation boundary</h3><p className={styles.body}>Dedicated fuel/water separation is assigned to HYDROCORE™. SYNTAPORE™ remains the particulate-control architecture for approved fuel-filter positions that do not perform that separator duty.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Stored-fuel contamination</h3><p className={styles.body}>Recurring sludge or microbial loading should trigger investigation of storage tanks, water ingress and fuel handling rather than being treated as a filter-only problem.</p></article>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p><h2 className={styles.h2}>When fuel filtration becomes a fleet-level problem</h2>
        <p className={styles.lead}>Repeated injector events, short filter intervals, power loss under load or inconsistent fuel quality justify looking beyond individual filters. A useful review starts with filter position, engine and equipment, current element, fuel source, service interval, restriction or fuel-delivery history and any injector or pump events.</p>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>SYSTEM INTEGRATION</p><h2 className={styles.h2}>Fuel Cleanliness Protection</h2>
        <div className={styles.systemGrid}><div><p className={styles.lead}>Fuel Cleanliness Protection controls particulate contamination and water before fuel reaches precision pumps and injectors.</p><Link className={styles.systemButton} href="/systems/fuel-cleanliness/">EXPLORE PROTECTION SYSTEM</Link></div><p className={styles.bodyWide}>SYNTAPORE™ controls particulate contamination in approved primary, secondary and cartridge positions. HYDROCORE™ provides the dedicated fuel/water-separation function elsewhere in the Fuel Cleanliness architecture.</p></div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION SUPPORT</p><h2 className={styles.h2}>Bring us the application, fuel source and failure pattern — not just the part number.</h2>
        <p className={styles.lead}>Use Part Search when the application is already known. When the issue is repeated plugging, fuel starvation, contamination, injector exposure or uncertain filtration architecture, use the technical review path.</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=SYNTAPORE%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div>
      </div></section>
    </main>
  );
}
