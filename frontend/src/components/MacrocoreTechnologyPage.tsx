import Link from 'next/link';
import { MACROCORE_APPLICATIONS } from '@/lib/macrocore-applications';
import { PageHeader } from './PageHeader';
import styles from './MacrocoreTechnologyPage.module.css';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/macrocore/`;

const protectionPath = [
  ['AMBIENT AIR', 'Dust, soot, fibers and airborne debris enter through the intake environment.'],
  ['PRIMARY FILTRATION', 'The primary element carries the normal contamination load while supporting the airflow required by the engine application.'],
  ['SECONDARY PROTECTION', 'Where specified, a safety element provides an additional clean-side protection layer during service or abnormal primary-element conditions.'],
  ['SEALED CLEAN-AIR PATH', 'Element fit, housing condition and sealing geometry preserve the contamination boundary downstream of the filter.'],
  ['ENGINE', 'Controlled intake contamination helps protect turbocharger compressor surfaces, cylinder walls, piston rings and the combustion-air path.'],
] as const;

const decisionFactors = [
  ['Airflow Demand', 'Engine displacement, operating load and intake-system design determine the airflow that the filter and housing must support.'],
  ['Restriction', 'The selected configuration must remain compatible with the restriction limits defined by the equipment application.'],
  ['Dust Loading', 'Contaminant concentration, particle distribution and duty environment influence media loading and service behavior.'],
  ['Media Configuration', 'Fiber structure, media depth and available filtration area influence contaminant retention and restriction development.'],
  ['Housing + Seal', 'Dimensions alone do not prove fit. Retention, gasket geometry, housing condition and clean-side sealing are part of the protection decision.'],
  ['Service Strategy', 'Restriction indication, inspection history and operating environment should guide maintenance rather than visual appearance alone.'],
] as const;

const loadingLogic = [
  ['01', 'Contaminant Exposure', 'The operating environment determines the concentration and character of airborne material presented to the intake system.'],
  ['02', 'Media Utilization', 'Particles are distributed through the available filtration structure according to media design, airflow and loading conditions.'],
  ['03', 'Restriction Development', 'As contaminant accumulates, resistance to airflow changes. The rate of change depends on the application and media configuration.'],
  ['04', 'Service Limit', 'The maintenance decision should follow the validated restriction and service strategy for the equipment, not appearance alone.'],
] as const;

const protectedAssets = [
  ['Turbocharger Compressor', 'Airborne particulate reaching compressor surfaces can contribute to erosive wear and loss of surface integrity.'],
  ['Cylinder Walls', 'Fine particulate entering the combustion-air path can contribute to abrasive contact at the cylinder interface.'],
  ['Piston Rings', 'Dust ingestion can increase abrasive exposure at ring and liner surfaces.'],
  ['Combustion Air Path', 'The intake system must deliver required air while preserving the clean-air boundary.'],
] as const;

const fieldSignals = [
  ['Premature Restriction', 'Repeated short filter intervals can indicate a mismatch between contamination exposure, media capacity, airflow demand or service strategy.'],
  ['Dust Downstream', 'Dust tracks on the clean side require inspection of element fit, sealing surfaces, housing condition and service practices.'],
  ['Recurring Seal Problems', 'Repeated gasket, clamp or housing issues should be treated as an intake-system integrity problem, not only a filter replacement problem.'],
  ['Selection by Dimensions Alone', 'Visual similarity and dimensions are useful evidence, but they do not establish airflow, seal, housing or application compatibility.'],
] as const;

const families = [
  ['Primary Air Filters', '/families/primary-air/', 'Main engine-intake contamination barrier for the normal service load.'],
  ['Secondary / Safety Air Elements', '/families/secondary-air/', 'Additional downstream protection where the intake architecture specifies a secondary element.'],
] as const;

const faqs = [
  ['What is MACROCORE™?', 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake filtration. It combines media configuration, contaminant-holding capacity, restriction control and sealing integrity according to airflow demand and operating conditions.'],
  ['How does MACROCORE™ manage particle control and airflow?', 'The engineering objective is to keep airborne contamination on the dirty side while maintaining the airflow and restriction behavior required by the validated intake application.'],
  ['What causes dust downstream of an engine air filter?', 'Possible causes include damaged or incorrectly seated elements, compromised seals, housing defects, incorrect part selection or contamination introduced during service. The complete intake path should be inspected.'],
  ['Why can an engine air filter plug earlier than expected?', 'Premature restriction can be influenced by severe dust loading, contaminant characteristics, insufficient filtration area, airflow demand, media configuration, housing conditions or a service strategy that does not match the duty cycle.'],
  ['Should an engine air filter be replaced because it looks dirty?', 'Not by appearance alone. Restriction condition, the equipment maintenance strategy, service history and inspection of the complete intake system should guide replacement decisions.'],
  ['What is the difference between primary and secondary air filtration?', 'The primary element carries the normal contamination load. A secondary or safety element, where specified by the intake architecture, provides an additional protection layer downstream of the primary element.'],
  ['Can an engine air filter be selected only by dimensions?', 'No. Dimensions are useful evidence, but airflow demand, restriction, seal geometry, housing fit, element position and validated application compatibility also matter.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods used to evaluate engine air cleaners and filter elements. Any numeric product-performance claim should remain tied to validated data for the specific element or assembly rather than treated as a universal MACROCORE™ value.'],
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
        { '@type': 'Thing', name: 'Primary air filtration' },
        { '@type': 'Thing', name: 'Secondary air filtration' },
        { '@type': 'Thing', name: 'Air intake contamination control' },
        { '@type': 'Thing', name: 'Airflow restriction' },
        { '@type': 'Thing', name: 'Dust loading' },
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
    <main className={styles.page}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Technologies', href: '/technologies/' }]} currentPage="MACROCORE™" />

      <section className={styles.hero} aria-labelledby="macrocore-title">
        <img className={styles.heroBackground} src="/images/mecanica-air.avif" alt="Engine air-intake application" />
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="macrocore-title" className={styles.srOnly}>MACROCORE™ Engine Air Filtration Technology</h1>
        <img className={styles.heroMark} src="/assets/MACROCORE_final.avif" alt="MACROCORE™" />
      </section>

      <section className={styles.section}>
        <div className={`${styles.inner} ${styles.answerGrid}`}>
          <div>
            <p className={styles.eyebrow}>WHY MACROCORE EXISTS</p>
            <h2 className={styles.h2}>The filter is one boundary inside a complete engine air-intake system.</h2>
          </div>
          <div className={styles.answerCopy}>
            <p className={styles.lead}>Engine air protection depends on more than particle capture. The intake system has to control contamination while supporting the airflow demanded by the engine and preserving sealing integrity from the dirty side to the clean side.</p>
            <p className={styles.body}>MACROCORE™ connects media configuration, contaminant-holding capacity, restriction behavior, element fit and operating conditions before a final filter reference is accepted.</p>
          </div>
        </div>
      </section>

      <section className={styles.sectionFeature}>
        <div className={`${styles.inner} ${styles.mediaGrid}`}>
          <div className={styles.mediaCopy}>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}><span className={styles.metaLabel}>Technology:</span> MACROCORE™</span>
              <span className={styles.metaItem}><span className={styles.metaLabel}>Application:</span> Primary and secondary engine air filtration</span>
            </div>
            <p className={styles.eyebrow}>MEDIA ARCHITECTURE</p>
            <h2 className={styles.h2}>Airflow Management and Particle Control</h2>
            <p className={styles.lead} style={{ marginTop: '1.4rem' }}>MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.</p>
          </div>
          <figure className={styles.mediaFigure}>
            <img className={styles.mediaImage} src="/images/MACROCORE-media.png" alt="Conceptual fibrous filtration structure used to explain MACROCORE media architecture" />
            <figcaption className={styles.mediaCaption}>Conceptual visualization of a fibrous filtration structure. It does not represent an actual MACROCORE™ laboratory micrograph.</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>HOW THE PROTECTION PATH WORKS</p>
          <h2 className={styles.h2}>Follow the air from ambient contamination to the engine.</h2>
          <div className={styles.flow}>
            {protectionPath.map(([title, text], index) => (
              <article className={styles.flowCard} key={title}>
                <span className={styles.stepNo}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>CONTAMINANT LOADING VS. RESTRICTION</p>
          <h2 className={styles.h2}>Particle capture has to be evaluated together with restriction development.</h2>
          <p className={styles.lead} style={{ maxWidth: 900, marginTop: '1.3rem' }}>A useful engine-air filtration decision is not based on efficiency alone. Media structure, available filtration area, airflow and the contamination environment influence how loading develops through the service cycle.</p>
          <div className={styles.loadingGrid}>
            {loadingLogic.map(([no, title, text]) => (
              <article className={styles.loadingStep} key={title}>
                <span className={styles.stepNo}>{no}</span>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="selection" className={styles.sectionAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>ENGINEERING PARAMETERS</p>
          <h2 className={styles.h2}>Six variables define whether the air-filter decision is technically complete.</h2>
          <div className={styles.factorGrid}>
            {decisionFactors.map(([title, text]) => (
              <article className={styles.factorCard} key={title}>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>PROTECTED ASSETS</p>
          <h2 className={styles.h2}>The protected asset begins after the clean-air seal.</h2>
          <div className={styles.assetGrid}>
            {protectedAssets.map(([title, text]) => (
              <article className={styles.assetCard} key={title}>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>FAILURE DIAGNOSIS</p>
          <h2 className={styles.h2}>Some air-filter problems are really intake-system problems.</h2>
          <div className={styles.signalGrid}>
            {fieldSignals.map(([title, text]) => (
              <article className={styles.signalCard} key={title}>
                <h3 className={styles.h3}>{title}</h3>
                <p className={styles.body}>{text}</p>
              </article>
            ))}
          </div>
          <div className={styles.microCta}>
            <p className={styles.microCtaText}>Experiencing premature restriction, dust downstream or recurring seal problems?</p>
            <a className={styles.primaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Intake%20System%20Review" data-conversion-action="application-support">REQUEST INTAKE SYSTEM REVIEW</a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>OPERATING ENVIRONMENTS</p>
          <h2 className={styles.h2}>MACROCORE™ follows the intake duty, not an industry label alone.</h2>
          <p className={styles.lead} style={{ maxWidth: 900, marginTop: '1.3rem' }}>Selection still depends on equipment, engine, housing, airflow requirement, contamination exposure, duty cycle and validated application evidence.</p>
          <div className={styles.applicationGrid}>
            {MACROCORE_APPLICATIONS.map((application) => {
              const content = (
                <>
                  <h3 className={styles.h3}>{application.label}</h3>
                  {application.description ? <p className={styles.body}>{application.description}</p> : null}
                  {application.route ? <span className={styles.applicationLink}>VIEW INDUSTRY →</span> : null}
                </>
              );

              return application.route ? (
                <Link className={styles.applicationCard} href={application.route} key={application.id}>{content}</Link>
              ) : (
                <article className={styles.applicationCard} key={application.id}>{content}</article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>PRODUCT ARCHITECTURE</p>
          <h2 className={styles.h2}>Technology first. Product family second. Validated part number last.</h2>
          <div className={styles.familyGrid}>
            {families.map(([name, href, description]) => (
              <Link className={styles.familyCard} href={href} key={name}>
                <h3 className={styles.h3}>{name}</h3>
                <p className={styles.body}>{description}</p>
                <span className={styles.applicationLink}>VIEW PRODUCT FAMILY →</span>
              </Link>
            ))}
          </div>
          <div className={styles.decisionPath}>
            {['AIR INTAKE & AIRFLOW PROTECTION', 'MACROCORE™', 'PRIMARY / SECONDARY AIR FAMILY', 'VALIDATED PART NUMBER'].map((item) => (
              <div className={styles.decisionStep} key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.inner} ${styles.isoGrid}`}>
          <div>
            <p className={styles.eyebrow}>TECHNICAL BASIS</p>
            <h2 className={styles.h2}>ISO 5011 is a test framework, not a universal MACROCORE™ performance claim.</h2>
          </div>
          <div className={styles.answerCopy}>
            <p className={styles.lead}>Engine air-cleaner performance is commonly evaluated using ISO 5011 methods. The standard provides a controlled basis for evaluating relevant filter or air-cleaner performance characteristics.</p>
            <p className={styles.body}>Published efficiency, dust-capacity, restriction or durability values should remain tied to validated test data for the specific element or assembly. MACROCORE™ should not be assigned a single universal numeric performance value across every product and application.</p>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>QUESTIONS ENGINEERS ASK</p>
          <h2 className={styles.h2}>Engine air filtration questions that should be resolved before selection.</h2>
          <div className={styles.faqGrid}>
            {faqs.map(([question, answer]) => (
              <article className={styles.faqCard} key={question}>
                <h3 className={styles.h3}>{question}</h3>
                <p className={styles.body}>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>MACROCORE™ AT A GLANCE</p>
          <h2 className={styles.h2}>A compact engineering definition for the technology.</h2>
          <div className={styles.atGlance}>
            <div className={styles.atGlanceItem}><span className={styles.atGlanceLabel}>Technology</span><span className={styles.atGlanceValue}>MACROCORE™</span></div>
            <div className={styles.atGlanceItem}><span className={styles.atGlanceLabel}>Application</span><span className={styles.atGlanceValue}>Primary and secondary engine air filtration</span></div>
            <div className={styles.atGlanceItem}><span className={styles.atGlanceLabel}>System</span><span className={styles.atGlanceValue}>Air Intake & Airflow Protection</span></div>
            <div className={styles.atGlanceItem}><span className={styles.atGlanceLabel}>Primary Variables</span><span className={styles.atGlanceValue}>Airflow, loading, restriction, media and sealing</span></div>
            <div className={styles.atGlanceItem}><span className={styles.atGlanceLabel}>Test Context</span><span className={styles.atGlanceValue}>ISO 5011 at validated product level</span></div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`${styles.inner} ${styles.ctaGrid}`}>
          <div>
            <p className={styles.eyebrow}>APPLICATION SUPPORT</p>
            <h2 className={styles.h2}>Resolve the intake requirement before accepting the part number.</h2>
          </div>
          <div>
            <p className={styles.lead}>Provide the equipment, engine, current element reference, housing information, duty environment and any restriction or dust-bypass history. ELIMFILTERS can use that evidence to identify the appropriate protection path.</p>
            <div className={styles.buttonRow}>
              <a className={styles.primaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support">REQUEST ENGINEERING ASSESSMENT</a>
              <a className={styles.secondaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">FIND AN OEM EQUIVALENT</a>
              <Link className={styles.secondaryButton} href="/systems/air-intake/">AIR INTAKE SYSTEM</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
