import Link from '@/components/LocalizedLink';
import { PageHeader } from '@/components/PageHeader';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';
import { SYSTEM_ES } from '@/lib/families-es';
import { SYSTEM_PT } from '@/lib/families-pt';
import { SYSTEM_DETAILS, systemsText } from '@/lib/systems-i18n';
import type { PageLang } from '@/lib/localized-routes';
import styles from './SystemsLanding.module.css';

const BASE_URL = 'https://elimfilters.com';

const images: Record<string, string> = {
  'air-intake': '/images/air-filters-lab.avif',
  'fuel-cleanliness': '/images/syntapore_mecanico_camion.avif',
  lubrication: '/images/oil-hand.avif',
  hydraulic: '/images/hidraulic.avif',
  'cooling-system': '/images/coolant-filters.avif'
};

const selectionSteps = [
  ['Identify the asset', 'Confirm the machine, vehicle, engine, equipment configuration and actual filter position.'],
  ['Define the exposure', 'Establish dust or particle source, water exposure, fuel or fluid condition and duty cycle.'],
  ['Verify the system', 'Identify sensitive components, OEM cleanliness or service requirements and relevant measurements.'],
  ['Match the architecture', 'Choose the applicable technology and product family; do not substitute across different system functions.'],
  ['Confirm the part', 'Reconcile OEM evidence, dimensions, interfaces, ratings and documented application before installation.']
] as const;

const levels = [
  ['01 / SYSTEM', 'What needs protecting', 'The engine intake, fuel injection circuit, lubricated interfaces, hydraulic controls or cooling passages—and the consequences of contamination in each.'],
  ['02 / TECHNOLOGY', 'How contamination is controlled', 'Media architecture, separation stages, sealing, element construction and restriction behavior must suit the protected flow path and operating conditions.'],
  ['03 / APPLICATION', 'Which part actually fits', 'Product family, OEM reference, interfaces, dimensions, pressure or flow limits and documented equipment fitment determine whether a specific part is suitable.']
] as const;

const questions = [
  ['Are the five systems individual filter products?', 'No. They are five operating protection domains. Several technologies or product families may belong to one system, and only those compatible with the equipment should be used.'],
  ['Why are cabin air and air-dryer elements in the air system?', 'They address different airflow paths within the air-and-airflow domain. An engine air filter, an HVAC cabin filter and a pneumatic dryer are not interchangeable or equivalent safety devices.'],
  ['Are HYDROCORE™ and TURBOCORE™ the same fuel/water separator?', 'No. HYDROCORE™ covers approved conventional spin-on and cartridge fuel/water separator designs; TURBOCORE™ covers specified turbine-style housings. SYNTAPORE™ controls particulate in approved diesel-fuel filtration positions.'],
  ['Can I choose a part using only the OEM cross-reference?', 'A known reference is useful for finding candidates, but final selection must confirm the protected system, equipment variant, interfaces and documented fitment.']
] as const;

export function SystemsLanding({ lang = 'en' }: { lang?: PageLang }) {
  const tr = (english: string) => systemsText(lang, english);
  const url = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/systems/`;
  const systemName = (slug: string, english: string) => (lang === 'es' ? SYSTEM_ES[slug]?.name : lang === 'pt' ? SYSTEM_PT[slug]?.name : undefined) ?? english;

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'WebPage',
      '@id': `${url}#webpage`, url,
      name: tr('Five systems. One asset-protection architecture.'),
      description: tr('ELIMFILTERS structures its portfolio into five protection systems. Each connects a contamination mechanism to the correct technology, filter family and verified equipment application.'),
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
        { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Sistemas' : lang === 'pt' ? 'Sistemas' : 'Systems', item: url }
      ]
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#systems`,
      name: tr('05 PROTECTION SYSTEMS'), numberOfItems: PROTECTION_SYSTEM_LIST.length,
      itemListElement: PROTECTION_SYSTEM_LIST.map((sys, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: { '@type': 'WebPage', name: systemName(sys.slug, sys.name), url: `${BASE_URL}/systems/${sys.slug}/` }
      }))
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: questions.map(([q, a]) => ({
        '@type': 'Question', name: tr(q),
        acceptedAnswer: { '@type': 'Answer', text: tr(a) }
      }))
    }
  ];

  return (
    <main id="main-content" className={styles.page}>
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <PageHeader currentPage="Systems" />

      <section className={styles.hero} aria-labelledby="systems-page-title">
        <video className={styles.heroVideo} poster="/images/sistems-hero.avif" aria-hidden="true" autoPlay muted loop playsInline preload="metadata">
          <source src="/images/Robotic_arm_replacing_filtration_system.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{tr('SYSTEMS / ELIMFILTERS ASSET PROTECTION')}</p>
          <h1 id="systems-page-title" className={styles.heroTitle}>{tr('Five systems. One asset-protection architecture.')}</h1>
          <div className={styles.heroLower}>
            <div className={styles.heroCopy}>
              <p className={styles.heroPromise}>{tr('Filtration is not an isolated replacement part. It is a coordinated contamination-control decision made around the asset, the components at risk and the conditions in which they operate.')}</p>
              <p className={styles.heroLead}>{tr('ELIMFILTERS structures its portfolio into five protection systems. Each connects a contamination mechanism to the correct technology, filter family and verified equipment application.')}</p>
            </div>
            <div className={styles.heroActions}>
              <a href="#systems" className={styles.primaryButton}>{tr('EXPLORE THE FIVE SYSTEMS')}</a>
              <a href="https://part-search.elimfilters.com/" className={styles.secondaryButton} target="_blank" rel="noopener noreferrer">{tr('FIND MY FILTER')}</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="systems-principle-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{tr('THE ENGINEERING PRINCIPLE')}</p>
          <div className={styles.introGrid}>
            <h2 id="systems-principle-title" className={styles.sectionTitle}>{tr('The protected asset determines the filtration requirement.')}</h2>
            <div className={styles.introProse}>
              <p className={styles.lead}>{tr('Equipment working in dust, high humidity, repeated short cycles or sustained load does not face the same contamination profile. The system, its tolerances and operating duty establish the target before a filter is selected.')}</p>
              <p className={styles.body}>{tr('A protection system defines what is exposed and must be protected. A filtration technology defines how a contaminant is controlled. A product family identifies the relevant form of element or assembly. Final installation requires application evidence.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.systemsSection} id="systems" aria-labelledby="systems-five-title">
        <div className={styles.shell}>
          <div className={styles.sectionTop}>
            <p className={styles.eyebrow}>{tr('05 PROTECTION SYSTEMS')}</p>
            <h2 id="systems-five-title" className={styles.sectionTitle}>{tr('Explore the systems that safeguard equipment operation.')}</h2>
            <p className={styles.lead}>{tr('Every system has a distinct contamination pathway, sensitive components and technical selection criteria. Not every system or technology is installed on every machine.')}</p>
          </div>
          <div className={styles.systemGrid}>
            {PROTECTION_SYSTEM_LIST.map((sys, index) => {
              const detail = SYSTEM_DETAILS[sys.slug]?.[lang];
              if (!detail) return null;
              return <article key={sys.slug} className={`${styles.systemCard} ${index === 0 ? styles.featured : ''}`}>
                <div className={styles.systemMedia}>
                  <img src={images[sys.slug]} alt={systemName(sys.slug, sys.name)} loading="lazy" />
                  <span className={styles.systemNumber}>0{index + 1} / 05</span>
                </div>
                <div className={styles.systemContent}>
                  <h3 className={styles.systemTitle}>{systemName(sys.slug, sys.name)}</h3>
                  <p className={styles.systemObjective}>{detail.objective}</p>
                  <dl className={styles.facts}>
                    <div><dt>{tr('CONTAMINATION EXPOSURE')}</dt><dd>{detail.exposure}</dd></div>
                    <div><dt>{tr('TECHNOLOGIES')}</dt><dd className={styles.technologyNames}>{detail.technologies}</dd></div>
                    <div><dt>{tr('TECHNICAL VERIFICATION')}</dt><dd>{detail.verification}</dd></div>
                  </dl>
                  <Link className={styles.explore} href={`/systems/${sys.slug}/`} aria-label={`${tr('EXPLORE SYSTEM')}: ${systemName(sys.slug, sys.name)}`}>{tr('EXPLORE SYSTEM')} <span aria-hidden="true">↗</span></Link>
                </div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="systems-levels-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{tr('THREE CONNECTED LEVELS')}</p>
          <h2 id="systems-levels-title" className={styles.sectionTitle}>{tr('From the protection requirement to the correct element.')}</h2>
          <div className={styles.levelGrid}>
            {levels.map(([tag, name, content]) => <article className={styles.levelCard} key={tag}>
              <p className={styles.levelIndex}>{tr(tag)}</p>
              <h3>{tr(name)}</h3>
              <p>{tr(content)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.stepsSection} aria-labelledby="systems-decisions-title">
        <div className={styles.shell}>
          <div className={styles.stepsHeader}>
            <p className={styles.eyebrow}>{tr('SELECTION DISCIPLINE')}</p>
            <h2 id="systems-decisions-title" className={styles.sectionTitle}>{tr('Five checks before approving a filter.')}</h2>
          </div>
          <div className={styles.stepGrid}>
            {selectionSteps.map(([heading, copy], index) => <article className={styles.step} key={heading}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{tr(heading)}</h3>
              <p>{tr(copy)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.evidenceSection} aria-labelledby="systems-evidence-title">
        <div className={styles.shell}>
          <div className={styles.evidenceGrid}>
            <div className={styles.evidenceImage}><img src="/images/banco-pruebas-filtros.png" alt={lang === 'es' ? 'Banco de pruebas de filtración' : lang === 'pt' ? 'Bancada de testes de filtração' : 'Filtration test bench'} loading="lazy" /></div>
            <div className={styles.evidenceText}>
              <p className={styles.eyebrow}>{tr('ENGINEERING EVIDENCE')}</p>
              <h2 id="systems-evidence-title" className={styles.sectionTitle}>{tr('The numbers matter only in the right operating context.')}</h2>
              <p className={styles.lead}>{tr('Filtration efficiency, contaminant-holding capacity, differential pressure, sealing, flow and structural integrity are application-specific parameters—not universal guarantees. Measure or document the requirements established by the equipment manufacturer.')}</p>
              <p className={styles.body}>{tr('A plausible cross-reference does not certify compatibility. A verified application requires the correct system function, physical interfaces and the necessary technical evidence.')}</p>
              <Link className={styles.inlineLink} href="/knowledge-center/">{tr('EXPLORE THE KNOWLEDGE CENTER')} <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="systems-faq-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{tr('SYSTEMS / FREQUENT QUESTIONS')}</p>
          <h2 id="systems-faq-title" className={styles.sectionTitle}>{tr('Questions before choosing protection.')}</h2>
          <div className={styles.faqGrid}>
            {questions.map(([q, a]) => <article className={styles.faq} key={q}>
              <h3>{tr(q)}</h3><p>{tr(a)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection} aria-labelledby="systems-contact-title">
        <div className={styles.shell}>
          <div className={styles.ctaGrid}>
            <div>
              <p className={styles.eyebrow}>{tr('FROM SYSTEM TO APPLICATION')}</p>
              <h2 id="systems-contact-title" className={styles.sectionTitle}>{tr('Choose the correct protection path for your asset.')}</h2>
              <p className={styles.lead}>{tr('If you know the OEM or installed filter reference, start with Part Search. For a technical review, provide the asset, protected system, working conditions and available application evidence.')}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/contact/?intent=application-support" className={styles.primaryButton}>{tr('REQUEST APPLICATION REVIEW')}</Link>
              <a href="https://part-search.elimfilters.com/" className={styles.secondaryButton} target="_blank" rel="noopener noreferrer">{tr('FIND MY FILTER')}</a>
              <Link href="/families/" className={styles.inlineLink}>{tr('VIEW PRODUCT FAMILIES')} <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
