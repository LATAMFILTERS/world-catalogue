import Link from 'next/link';
import { PageHeader } from './PageHeader';
import { UniversalEndNavigation } from './UniversalEndNavigation';
import styles from './MacrocoreTechnologyPage.module.css';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/macrocore/`;

const applicationPositions = [
  'Primary engine air filtration',
  'Secondary / safety air filtration where specified by the intake architecture',
  'Heavy-duty engine air-cleaner assemblies operating in dusty environments',
  'Applications where airflow demand, restriction development and sealing integrity must be evaluated together',
] as const;

const operatingConditions = [
  'High airborne dust concentration',
  'Fine particulate and mixed particle-size environments',
  'High engine load and sustained airflow demand',
  'Repeated idle-to-load duty cycles',
  'Remote or severe-duty service conditions',
  'Maintenance practices around housings, seals and safety elements',
] as const;

const riskIndustries = [
  'Mining',
  'Construction',
  'Agriculture',
  'Truck fleets',
  'Power generation',
  'Waste & municipal',
  'Bus & coach',
] as const;

const selectionQuestions = [
  'Is this the primary element, secondary / safety element, or a complete air-cleaner assembly?',
  'What engine, equipment and housing does the element serve?',
  'What airflow and restriction limits apply to the validated application?',
  'What contamination environment and duty cycle does the equipment operate in?',
  'Is there a history of premature restriction, dust downstream or recurring seal issues?',
] as const;

const engineeringParameters = [
  'Filtration efficiency for the specific validated product',
  'Contaminant-holding capacity',
  'Airflow requirement',
  'Restriction development through the service cycle',
  'Media configuration and available filtration area',
  'Seal geometry, element retention and housing interface',
] as const;

const selectionErrors = [
  'Choosing by dimensions alone',
  'Treating every dusty environment as the same duty cycle',
  'Replacing an element only because it looks dirty',
  'Ignoring clean-side dust traces or damaged sealing surfaces',
  'Assuming one universal efficiency, micron or service-life value applies to every MACROCORE™ configuration',
] as const;

const protectionPath = [
  ['Primary stage', 'The primary element carries the normal contamination load while supporting the airflow required by the engine application.'],
  ['Secondary protection', 'Where specified, a safety element adds a downstream protection layer during service or abnormal primary-element conditions.'],
  ['Clean-air boundary', 'Element fit, housing condition and seal integrity keep contamination on the dirty side of the intake system.'],
] as const;

const protectedAssets = [
  'Turbocharger compressor surfaces',
  'Cylinder walls',
  'Piston rings',
  'Combustion-air passages',
] as const;

const loadingPath = [
  ['01', 'Contaminant exposure', 'Dust concentration and particle characteristics define what reaches the filter.'],
  ['02', 'Media utilization', 'Media structure, filtration area and airflow influence how contamination is distributed and retained.'],
  ['03', 'Restriction development', 'As loading increases, resistance to airflow changes according to the application and media configuration.'],
  ['04', 'Service limit', 'Replacement should follow the validated restriction and maintenance strategy rather than appearance alone.'],
] as const;

const serviceSignals = [
  'Premature restriction or repeated short filter intervals',
  'Dust tracks downstream of the element',
  'Damaged, distorted or repeatedly displaced seals',
  'Housing, clamp or retention problems',
  'Restriction symptoms that do not match the expected duty cycle',
  'Contamination introduced during element service or housing cleaning',
] as const;

const faqs = [
  ['How do I know whether I need a primary or secondary engine air filter?', 'The application architecture determines the position. The primary element normally carries the contamination load; a secondary or safety element is used only where the intake design specifies an additional downstream protection layer.'],
  ['Is a higher-efficiency engine air filter always better?', 'Not as a universal rule. Particle control must be evaluated together with airflow demand, restriction, contaminant capacity, housing design and the validated requirements of the engine application.'],
  ['Why is my engine air filter plugging much earlier than expected?', 'Early restriction can be associated with severe dust exposure, insufficient filtration area, media/application mismatch, unusual contaminant characteristics, housing conditions or a service strategy that does not match the duty cycle.'],
  ['What causes dust downstream of an engine air filter?', 'Possible causes include damaged or incorrectly seated elements, compromised seals, housing defects, incorrect part selection or contamination introduced during service. The complete intake path should be inspected.'],
  ['Should an engine air filter be replaced because it looks dirty?', 'Not by appearance alone. Restriction condition, maintenance strategy, service history and inspection of the complete intake system should guide replacement decisions.'],
  ['Can MACROCORE™ be selected only by dimensions or cross reference?', 'No. Dimensions and cross references are evidence, not complete validation. Airflow, restriction, seal geometry, housing fit, element position and application compatibility must also be resolved.'],
  ['What information helps with MACROCORE™ application validation?', 'Useful evidence includes equipment, engine, current element reference, housing information, operating environment, duty cycle, service interval, restriction history and any dust-bypass or sealing events.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods used to evaluate engine air cleaners and filter elements. Numeric performance claims should remain tied to validated data for the specific element or assembly rather than treated as a universal MACROCORE™ value.'],
] as const;

export function MacrocoreTechnologyPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${PAGE_URL}#article`,
      headline: 'MACROCORE™ Engine Air Filtration Technology',
      name: 'MACROCORE™',
      url: PAGE_URL,
      description: 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake filtration, integrating media configuration, contaminant-holding capacity, restriction control and sealing integrity according to airflow demand and operating conditions.',
      author: { '@id': `${BASE_URL}/#organization` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: {
        '@type': 'DefinedTerm',
        '@id': `${PAGE_URL}#technology`,
        name: 'MACROCORE™',
        description: 'ELIMFILTERS engine air-intake filtration architecture for primary and secondary protection.',
        inDefinedTermSet: `${BASE_URL}/technologies/`,
      },
      mentions: [
        { '@type': 'Thing', name: 'Engine air filtration' },
        { '@type': 'Thing', name: 'Primary engine air filter' },
        { '@type': 'Thing', name: 'Secondary safety air filter' },
        { '@type': 'Thing', name: 'Air intake contamination control' },
        { '@type': 'Thing', name: 'Airflow restriction' },
        { '@type': 'Thing', name: 'Dust holding capacity' },
        { '@type': 'Thing', name: 'ISO 5011' },
      ],
      isPartOf: { '@id': `${BASE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies/` },
        { '@type': 'ListItem', position: 3, name: 'MACROCORE™', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];

  return (
    <main id="main-content" className={styles.page}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className={styles.hero} aria-labelledby="macrocore-title">
        <img className={styles.heroBackground} src="/images/mecanica-air.avif" alt="Engine air-intake service environment" />
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="macrocore-title" className={styles.srOnly}>MACROCORE™ Engine Air Filtration Technology</h1>
        <img className={styles.heroMark} src="/assets/MACROCORE_final.avif" alt="MACROCORE™" />
      </section>

      <PageHeader breadcrumbs={[{ label: 'Technologies', href: '/technologies/' }]} currentPage="MACROCORE™" />

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
              </div>
              <h3 className={styles.featureTitle}>Airflow Management and Particle Control</h3>
              <p className={styles.lead}>MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src="/images/MACROCORE-media.png" alt="Conceptual fibrous filtration structure illustrating media architecture" />
              <figcaption>Conceptual visualization of a fibrous filtration structure. It does not represent an actual MACROCORE™ laboratory micrograph.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>OPERATING REALITY</p>
          <h2 className={styles.h2}>Engine air systems do not tolerate uncontrolled dust ingestion.</h2>
          <p className={styles.lead}>Airborne particulate that crosses the clean-air boundary can contribute to abrasive and erosive wear at turbocharger, cylinder, ring and combustion-air surfaces. MACROCORE™ is used where particle control and airflow management have to coexist across the service cycle.</p>
          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>A useful distinction</h3>
              <p className={styles.body}>“Air filter” describes a category. The application position, housing, airflow requirement and protection strategy determine what the element is actually being asked to do.</p>
            </article>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>Primary contaminant: airborne particulate.</h3>
              <p className={styles.body}>Dust, soot, fibers and mixed debris can enter the intake stream. Effective control depends on the element, its seal, the housing and the complete clean-air path acting as one protection boundary.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.bandAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p>
          <h2 className={styles.h2}>Where MACROCORE™ belongs</h2>
          <div className={styles.editorialColumns}>
            <div>
              <h3 className={styles.h3}>Application positions</h3>
              <ul className={styles.list}>{applicationPositions.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.h3}>Operating conditions that change the filter duty</h3>
              <ul className={styles.list}>{operatingConditions.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.h3}>Where intake cleanliness becomes operational risk</h3>
              <ul className={styles.list}>{riskIndustries.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section id="selection" className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p>
          <h2 className={styles.h2}>Questions before selecting an engine air filter</h2>
          <div className={styles.editorialColumns}>
            <div>
              <h3 className={styles.h3}>Application questions</h3>
              <ul className={styles.list}>{selectionQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.h3}>Key engineering parameters</h3>
              <ul className={styles.list}>{engineeringParameters.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.h3}>Common selection errors</h3>
              <ul className={styles.list}>{selectionErrors.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bandAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p>
          <h2 className={styles.h2}>Different intake stages do different work.</h2>
          <p className={styles.lead}>A primary element normally carries the contamination burden. Where specified, a secondary / safety element provides an additional clean-side protection layer. Neither position should be selected independently of airflow, restriction, seal and housing requirements.</p>

          <div className={styles.stageGrid}>
            {protectionPath.map(([title, text]) => (
              <article className={styles.stageItem} key={title}>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>

          <div className={styles.behaviorGrid}>
            <div>
              <h3 className={styles.h3}>What clean air is protecting</h3>
              <ul className={styles.list}>{protectedAssets.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.h3}>Contaminant loading vs. restriction</h3>
              <div className={styles.loadingPath}>
                {loadingPath.map(([number, title, text]) => (
                  <article className={styles.loadingItem} key={title}>
                    <span>{number}</span>
                    <div><strong>{title}</strong><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p>
          <h2 className={styles.h2}>What early restriction or dust downstream may be telling you</h2>
          <ul className={`${styles.list} ${styles.serviceList}`}>{serviceSignals.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className={styles.inlineCta}>
            <p>Repeated restriction, clean-side dust or sealing problems should trigger an intake-system review, not just another filter replacement.</p>
            <a href="mailto:applications@elimfilters.com?subject=MACROCORE%20Intake%20System%20Review" data-conversion-action="application-support">REQUEST INTAKE SYSTEM REVIEW</a>
          </div>
        </div>
      </section>

      <section className={styles.bandAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p>
          <h2 className={styles.h2}>What to clarify before treating every engine-air position the same way.</h2>
          <div className={styles.faqList}>
            {faqs.map(([question, answer]) => (
              <details key={question} className={styles.faqItem}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>TECHNICAL BASIS</p>
          <h2 className={styles.h2}>Technical reference</h2>
          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>ISO 5011 context</h3>
              <p className={styles.body}>Engine air-cleaner performance is commonly evaluated using ISO 5011 methods. Published efficiency, dust-capacity, restriction or durability values should remain tied to validated test data for the specific element or assembly.</p>
            </article>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>Product-family connection</h3>
              <p className={styles.body}>MACROCORE™ applies to ELIMFILTERS primary air and secondary / safety air families within the Air Intake &amp; Airflow Protection architecture. A single universal micron, efficiency or service-life claim is not assigned across every configuration.</p>
              <div className={styles.textLinks}>
                <Link href="/families/primary-air/">PRIMARY AIR FILTERS →</Link>
                <Link href="/families/secondary-air/">SECONDARY / SAFETY AIR →</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.bandAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p>
          <h2 className={styles.h2}>When engine air filtration becomes a fleet-level problem</h2>
          <p className={styles.lead}>Repeated dust downstream, short filter intervals, recurring seal failures, unexplained restriction or accelerated engine wear justify looking beyond individual part numbers. The complete intake boundary, operating environment and maintenance strategy should be reviewed together.</p>
          <p className={styles.bodyWide}>A useful air-filtration review starts with the equipment, engine, filter position, current element reference, housing, duty environment, service interval, restriction history and any evidence of dust bypass or clean-side contamination.</p>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>SYSTEM INTEGRATION</p>
          <h2 className={styles.h2}>Air Intake &amp; Airflow Protection</h2>
          <div className={styles.systemGrid}>
            <div>
              <p className={styles.lead}>Air Intake &amp; Airflow Protection controls contamination entering the engine and manages the clean-air path required to support equipment performance and component life.</p>
              <Link className={styles.systemButton} href="/systems/air-intake/">EXPLORE PROTECTION SYSTEM</Link>
            </div>
            <p className={styles.bodyWide}>MACROCORE™ provides primary and secondary engine-air filtration within this architecture. The final selection still resolves the protected asset, contamination mechanism, airflow requirement, duty cycle, housing interface and validated product evidence.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>APPLICATION SUPPORT</p>
          <h2 className={styles.h2}>Bring us the application, duty cycle and failure pattern — not just the part number.</h2>
          <p className={styles.lead}>Use Part Search when the application is already known. When the issue is repeated contamination, short service life, uncertain restriction behavior, component exposure or an unclear intake architecture, use the technical review path.</p>
          <div className={styles.buttonRow}>
            <a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND MY PART</a>
            <a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support">TECHNICAL REVIEW PATH</a>
          </div>
        </div>
      </section>

      <UniversalEndNavigation label="Explore related technologies" />
    </main>
  );
}
