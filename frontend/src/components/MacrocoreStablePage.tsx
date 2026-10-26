import { ReviewedImage, ReviewedBreadcrumb } from '@/components/ReviewedMedia';
import { ReviewedText } from '@/components/ReviewedText';
import { PublicUiText } from '@/components/PublicUiText';
import Link from '@/components/LocalizedLink';
import styles from './MacrocoreTechnologyPage.module.css';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

const faqs = [
  ['What is MACROCORE™?', 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control and sealing integrity according to airflow demand and operating conditions.'],
  ['What is the difference between primary and secondary engine air filtration?', 'The primary element normally carries the contamination load. A secondary or safety element is used only where the intake architecture specifies an additional downstream protection layer.'],
  ['What is surface loading in air filtration?', 'Surface-oriented loading keeps a greater share of contamination near the upstream face of the media. Its value depends on media structure, airflow, contaminant characteristics and available filtration area.'],
  ['What is depth loading in air filtration?', 'Depth loading distributes more contamination through the thickness of the filtration structure. It can provide useful contaminant capacity in some duties, but restriction behavior depends on the specific media and application.'],
  ['What causes dust downstream of an engine air filter?', 'Possible causes include damaged or incorrectly seated elements, compromised seals, housing defects, incorrect part selection or contamination introduced during service.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods for engine air cleaners and filter elements.'],
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
    image: 'https://elimfilters.com/images/mecanica-air.avif',
    datePublished: '2026-08-31',
    dateModified: '2026-09-01',
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
        <ReviewedImage className={styles.heroBackground} src="/images/mecanica-air.avif" alt="Engine air-intake service environment" />
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="macrocore-title" className={styles.srOnly}><ReviewedText text={"MACROCORE™ Engine Air Filtration Technology"} /></h1>
        <div className="macrocoreHeroWordmark" aria-hidden="true">MACROCORE™</div>
      </section>

      <ReviewedBreadcrumb style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
        <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}>
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}><PublicUiText textKey="publicUi.text0">{"HOME"}</PublicUiText></Link><span>→</span>
          <Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}><PublicUiText textKey="publicUi.text1">{"TECHNOLOGIES"}</PublicUiText></Link><span>→</span>
          <span style={{color:'#fff12d'}}>MACROCORE™</span>
        </div>
      </ReviewedBreadcrumb>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}><ReviewedText text={"FILTRATION TECHNOLOGY"} /></p>
          <h2 className={styles.displayTitle}>MACROCORE™</h2>
          <p className={styles.applicationLine}><strong><ReviewedText text={"Primary and secondary engine air filtration"} /></strong></p>
          <p className={styles.lead}><ReviewedText text={"MACROCORE™ protects the engine air-intake boundary by controlling particulate exposure while respecting airflow demand, restriction limits, filter capacity and sealing integrity."} /></p>
          <p className={styles.bodyWide}><ReviewedText text={"Applied across approved primary and secondary / safety engine-air filtration positions upstream of turbocharger, cylinder and combustion-air components."} /></p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span><PublicUiText textKey="publicUi.text8">{"Technology:"}</PublicUiText></span> MACROCORE™</p>
                <p><span><ReviewedText text={"Application:"} /></span>{' '}<ReviewedText text={"Primary and secondary engine air filtration"} /></p>
                <p><span><ReviewedText text={"Technical review:"} /></span> <Link href="/about/leadership/"><ReviewedText text={"Víctor Abreu — Founder & CEO"} /></Link></p>
              </div>
              <p className={styles.eyebrow}><ReviewedText text={"DESCRIPTION"} /></p>
              <h3 className={styles.featureTitle}><ReviewedText text={"Protecting engines begins at the clean-air boundary"} /></h3>
              <p className={styles.lead}><ReviewedText text={"MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions."} /></p>
            </div>
            <figure className={styles.mediaFigure}>
              <ReviewedImage className={styles.mediaImage} src="/images/MACROCORE-media.png" alt="Conceptual fibrous filtration structure illustrating MACROCORE media architecture" />
              <figcaption><ReviewedText text={"Microscopic visualization of filtration media structure used for technical illustration."} /></figcaption>
            </figure>
          </div>

          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Fine-fiber capture"} /></h3><p className={styles.body}><ReviewedText text={"Finer fiber structures can increase interception opportunities for small airborne particles."} /></p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Surface-oriented loading"} /></h3><p className={styles.body}><ReviewedText text={"Keeping more contamination near the upstream surface can reduce deep particle penetration. Its value depends on airflow, dust characteristics and available filtration area."} /></p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Depth loading"} /></h3><p className={styles.body}><ReviewedText text={"Depth-oriented media distributes contamination through more of the media thickness. Restriction behavior depends on fiber structure, contaminant distribution and airflow."} /></p></article>
            <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Restriction control"} /></h3><p className={styles.body}><ReviewedText text={"Capture efficiency alone does not define a successful engine-air filter. Particle control, contaminant capacity and airflow resistance must remain balanced through the service cycle."} /></p></article>
          </div>
        </div>
      </section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"OPERATING REALITY"} /></p><h2 className={styles.h2}><ReviewedText text={"Dust ingestion is an asset-protection risk, not just a filter-maintenance issue."} /></h2>
        <p className={styles.lead}><ReviewedText text={"Airborne particulate that crosses the clean-air boundary can contribute to abrasive and erosive wear at turbocharger, cylinder, ring and combustion-air surfaces."} /></p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"A useful distinction"} /></h3><p className={styles.body}><ReviewedText text={"“Air filter” describes a category. Position, housing, airflow requirement and protection strategy determine what the element is actually being asked to do."} /></p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Primary contaminant: airborne particulate"} /></h3><p className={styles.body}><ReviewedText text={"Dust, soot, fibers and mixed debris can enter the intake stream. Protection depends on the element, seal, housing and clean-air path acting as one boundary."} /></p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"APPLICATION ENVIRONMENT"} /></p><h2 className={styles.h2}><ReviewedText text={"Where intake contamination threatens equipment availability"} /></h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}><ReviewedText text={"Application positions"} /></h3><ul className={styles.list}>{positions.map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
          <div><h3 className={styles.h3}><ReviewedText text={"Operating conditions that change filter duty"} /></h3><ul className={styles.list}>{conditions.map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
          <div><h3 className={styles.h3}><ReviewedText text={"Operational risk environments"} /></h3><ul className={styles.list}>{['Mining','Construction','Agriculture','Truck fleets','Power generation','Waste & municipal','Bus & coach'].map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"SPECIFICATION & SELECTION"} /></p><h2 className={styles.h2}><ReviewedText text={"Engineering checks before approving an engine-air filter"} /></h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}><ReviewedText text={"Key engineering parameters"} /></h3><ul className={styles.list}>{parameters.map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
          <div><h3 className={styles.h3}><ReviewedText text={"Common selection errors"} /></h3><ul className={styles.list}>{errors.map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
          <div><h3 className={styles.h3}><ReviewedText text={"Application validation"} /></h3><ul className={styles.list}>{['Equipment and engine','Housing and element position','Airflow and restriction limits','Dust / duty environment','Current element and service history'].map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul></div>
        </div>
        <div className={styles.inlineCta}><p><strong><ReviewedText text={"Known part number?"} /></strong>{' '}<ReviewedText text={"Use Part Search."} />{' '}<strong><ReviewedText text={"Uncertain application or failure pattern?"} /></strong>{' '}<ReviewedText text={"Use the engineering review path."} /></p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence"><ReviewedText text={"FIND MY PART"} /></a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support"><ReviewedText text={"TECHNICAL REVIEW"} /></a></div></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"HOW THE SYSTEM BEHAVES"} /></p><h2 className={styles.h2}><ReviewedText text={"Primary filtration, safety elements and housing integrity form one protection boundary."} /></h2>
        <p className={styles.lead}><ReviewedText text={"The primary element carries the normal contamination burden. Where specified, a secondary / safety element provides an additional clean-side protection layer. Selection must resolve airflow, restriction, sealing and housing requirements together."} /></p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Primary stage"} /></h3><p className={styles.body}><ReviewedText text={"Carries the normal contamination load while supporting required engine airflow."} /></p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Secondary protection"} /></h3><p className={styles.body}><ReviewedText text={"Adds downstream protection during service or abnormal primary-element conditions where specified."} /></p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Clean-air boundary"} /></h3><p className={styles.body}><ReviewedText text={"Element fit, housing condition and seal integrity keep contamination on the dirty side."} /></p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"Protected assets"} /></h3><p className={styles.body}><ReviewedText text={"Turbocharger compressor surfaces, cylinder walls, piston rings and combustion-air passages depend on clean-air integrity."} /></p></article>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"SERVICE & DIAGNOSIS"} /></p><h2 className={styles.h2}><ReviewedText text={"Diagnose the intake system before replacing filters repeatedly"} /></h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{['Premature restriction or repeated short intervals','Dust tracks downstream of the element','Damaged or displaced seals','Housing, clamp or retention problems','Restriction that does not match expected duty','Contamination introduced during service'].map(x=><li key={x}><ReviewedText text={x} /></li>)}</ul>
        <div className={styles.inlineCta}><p><ReviewedText text={"Dust downstream, premature restriction or repeated filter changes?"} /></p><a href="mailto:applications@elimfilters.com?subject=MACROCORE%20Intake%20System%20Review" data-conversion-action="application-support"><ReviewedText text={"REQUEST INTAKE SYSTEM REVIEW"} /></a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"QUESTIONS FROM THE FIELD"} /></p><h2 className={styles.h2}><ReviewedText text={"Direct answers to common engine-air filtration questions."} /></h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary><ReviewedText text={q} /></summary><p><ReviewedText text={a} /></p></details>)}</div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"TECHNICAL BASIS"} /></p><h2 className={styles.h2}><ReviewedText text={"Technical reference"} /></h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}><ReviewedText text={"ISO 5011 context"} /></h3><p className={styles.body}><ReviewedText text={"Engine air-cleaner performance is commonly evaluated using ISO 5011 methods."} /></p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"WHEN A TECHNICAL REVIEW MAKES SENSE"} /></p><h2 className={styles.h2}><ReviewedText text={"When intake contamination becomes a fleet reliability problem"} /></h2>
        <p className={styles.lead}><ReviewedText text={"Repeated dust downstream, short filter intervals, recurring seal failures, unexplained restriction or accelerated wear justify reviewing the complete intake boundary, operating environment and maintenance strategy."} /></p>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"SYSTEM INTEGRATION"} /></p><h2 className={styles.h2}><ReviewedText text={"Air Intake & Airflow Protection"} /></h2>
        <div className={styles.systemGrid}><div><p className={styles.lead}><ReviewedText text={"Air Intake & Airflow Protection controls contamination entering the engine and manages the clean-air path required to support equipment performance and component life."} /></p><Link className={styles.systemButton} href="/systems/air-intake/"><ReviewedText text={"EXPLORE PROTECTION SYSTEM"} /></Link></div><p className={styles.bodyWide}><ReviewedText text={"MACROCORE™ provides primary and secondary engine-air filtration within this architecture. Final selection resolves the protected asset, contamination mechanism, airflow requirement, duty cycle and housing interface."} /></p></div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"APPLICATION SUPPORT"} /></p><h2 className={styles.h2}><ReviewedText text={"Specify the operating duty and protection requirement—not only the filter reference."} /></h2>
        <p className={styles.lead}><ReviewedText text={"Use Part Search when the application is already known. When the issue is repeated contamination, short service life, uncertain restriction behavior, component exposure or an unclear intake architecture, use the technical review path."} /></p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence"><ReviewedText text={"FIND MY PART"} /></a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Assessment" data-conversion-action="application-support"><ReviewedText text={"TECHNICAL REVIEW PATH"} /></a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}><ReviewedText text={"EXPLORE RELATED TECHNOLOGIES"} /></p><h2 className={styles.h2}><ReviewedText text={"Explore related protection technologies and principles."} /></h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}><Link href="/systems/" style={{color:'#fff',textDecoration:'none'}}><ReviewedText text={"Protection Systems"} /></Link></h3><p className={styles.body}><ReviewedText text={"Move from the current topic to the contamination-control architecture protecting the asset."} /></p></div>
          <div><h3 className={styles.h3}><Link href="/industries/" style={{color:'#fff',textDecoration:'none'}}><ReviewedText text={"Industries"} /></Link></h3><p className={styles.body}><ReviewedText text={"See how operating environment, duty cycle and downtime risk change the protection requirement."} /></p></div>
          <div><h3 className={styles.h3}><Link href="/knowledge-center/" style={{color:'#fff',textDecoration:'none'}}><ReviewedText text={"Knowledge System"} /></Link></h3><p className={styles.body}><ReviewedText text={"Continue into standards, contamination mechanisms, engineering principles and reliability guidance."} /></p></div>
        </div>
      </div></section>
    </main>
  );
}
