import Link from '@/components/LocalizedLink';
import { PageHeader } from '@/components/PageHeader';
import { AIR_TECHNOLOGIES, AIR_FAMILIES, AIR_CHECKS, airCopy, localAir } from '@/lib/air-intake-expert-i18n';
import type { PageLang } from '@/lib/localized-routes';
import styles from './AirIntakeSystemPage.module.css';

const BASE_URL = 'https://elimfilters.com';
const STANDARDS = [
  { title: 'ISO 5011', key: 'standardsEngine' },
  { title: 'ISO 11155-1', key: 'standardsCabin' },
  { title: 'ISO 8573-1', key: 'standardsPneumatic' }
] as const;
const FAQ = [
  ['faqQ1','faqA1'], ['faqQ2','faqA2'], ['faqQ3','faqA3'], ['faqQ4','faqA4']
] as const;

export function AirIntakeSystemPage({ lang = 'en' }: { lang?: PageLang }) {
  const t = (key: Parameters<typeof airCopy>[1]) => airCopy(lang, key);
  const url = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/systems/air-intake/`;
  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
    { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'Systems' : 'Sistemas', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/systems/` },
    { '@type': 'ListItem', position: 3, name: t('title'), item: url }
  ];
  const faqSchema = FAQ.map(([question, answer]) => ({
    '@type': 'Question',
    name: t(question),
    acceptedAnswer: { '@type': 'Answer', text: t(answer) }
  }));
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url}#webpage`,
      url, name: t('title'), description: t('heroBody'),
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: AIR_TECHNOLOGIES.map(tech => ({ '@type': 'Thing', name: tech.name }))
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#technologies`,
      name: t('architecturesTitle'), numberOfItems: AIR_TECHNOLOGIES.length,
      itemListElement: AIR_TECHNOLOGIES.map((tech, i) => ({
        '@type': 'ListItem', position: i + 1, name: tech.name,
        url: `${BASE_URL}${tech.href}`
      }))
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchema }
  ];

  return (
    <main id="main-content" className={styles.page}>
      {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage={t('title')} />

      <section className={styles.hero} aria-labelledby="air-intake-page-title">
        <img className={styles.heroPhoto} src="/images/carcasa.jd.avif" alt={lang === 'es' ? 'Conjunto de admisión de aire y carcasa filtrante' : lang === 'pt' ? 'Conjunto de admissão de ar e carcaça filtrante' : 'Engine air-cleaner assembly and intake housing'} />
        <div className={styles.heroOverlay} />
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h1 className={styles.heroTitle} id="air-intake-page-title">{t('title')}</h1>
          <div className={styles.heroBottom}>
            <div>
              <p className={styles.heroPromise}>{t('promise')}</p>
              <p className={styles.heroText}>{t('heroBody')}</p>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.buttonYellow} href="#technologies">{t('explore')}</a>
              <a className={styles.buttonGhost} href="https://part-search.elimfilters.com/" target="_blank" rel="noopener noreferrer">{t('partSearch')}</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="air-framework-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('framework')}</p>
          <div className={styles.editorialGrid}>
            <div>
              <h2 className={styles.h2} id="air-framework-title">{t('frameworkHeading')}</h2>
              <p className={styles.bodyLarge}>{t('frameworkLeft')}</p>
            </div>
            <div className={styles.frameworkRight}>
              <p className={styles.bodyLarge}>{t('frameworkRight')}</p>
              <div className={styles.technicalRule}>
                <strong>{t('criticalRule')}</strong>
                <p>{t('criticalValue')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionDark} id="technologies" aria-labelledby="air-tech-heading">
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{t('architectures')}</p>
            <h2 className={styles.h2} id="air-tech-heading">{t('architecturesTitle')}</h2>
            <p className={styles.bodyLarge}>{t('architecturesIntro')}</p>
          </div>
          <div className={styles.technologyGrid}>
            {AIR_TECHNOLOGIES.map((tech, i) =>
              <article className={styles.technologyCard} key={tech.key}>
                <div className={styles.technologyMedia}>
                  <img src={tech.image} alt={tech.name} loading="lazy" />
                  <span className={styles.cardNumber}>0{i + 1} / 04</span>
                </div>
                <div className={styles.technologyBody}>
                  <p className={styles.technicalDomain}>{localAir(lang, tech.domain)}</p>
                  <h3>{tech.name}</h3>
                  <dl className={styles.technicalData}>
                    <div><dt>{t('exposure')}</dt><dd>{localAir(lang, tech.exposure)}</dd></div>
                    <div><dt>{t('principle')}</dt><dd>{localAir(lang, tech.principle)}</dd></div>
                    <div><dt>{t('validation')}</dt><dd>{localAir(lang, tech.verification)}</dd></div>
                  </dl>
                  <Link href={tech.href} className={styles.link}>{t('exploreTech')} <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="air-family-heading">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('family')}</p>
          <h2 id="air-family-heading" className={styles.h2}>{t('familyTitle')}</h2>
          <p className={styles.sectionIntro}>{t('familyLead')}</p>
          <div className={styles.familiesGrid}>
            {AIR_FAMILIES.map((fam, i) => (
              <Link href={`/families/${fam.slug}/`} className={styles.familyCard} key={fam.slug}>
                <span className={styles.familyNumber}>0{i + 1}</span>
                <h3>{localAir(lang, fam.name)}</h3>
                <p>{localAir(lang, fam.note)}</p>
                <span className={styles.link}>{t('viewFamily')} <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionDark} aria-labelledby="air-checks-heading">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('requirements')}</p>
          <h2 id="air-checks-heading" className={styles.h2}>{t('requirementsTitle')}</h2>
          <p className={styles.sectionIntro}>{t('requirementsLead')}</p>
          <div className={styles.checkGrid}>
            {AIR_CHECKS.map((step, i) => <article className={styles.checkCard} key={step[0]}>
              <p className={styles.checkNumber}>0{i + 1}</p>
              <h3>{localAir(lang, [step[0],step[1],step[2]])}</h3>
              <p>{localAir(lang, [step[3],step[4],step[5]])}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="air-standards-heading">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('standards')}</p>
          <div className={styles.standardHeading}>
            <h2 id="air-standards-heading" className={styles.h2}>{t('standardsTitle')}</h2>
            <p className={styles.bodyLarge}>{t('standardsIntro')}</p>
          </div>
          <div className={styles.standardsGrid}>
            {STANDARDS.map(std => <article key={std.title} className={styles.standardCard}>
              <h3>{std.title}</h3>
              <p>{t(std.key)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.sectionDark} aria-labelledby="air-faq-heading">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{t('faq')}</p>
          <h2 id="air-faq-heading" className={styles.h2}>{t('faqTitle')}</h2>
          <div className={styles.faqGrid}>
            {FAQ.map(([question, answer]) => <article key={question} className={styles.faqCard}>
              <h3>{t(question)}</h3>
              <p>{t(answer)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="air-contact-title">
        <div className={styles.shell}>
          <div className={styles.contactGrid}>
            <div>
              <p className={styles.eyebrow}>{t('return')}</p>
              <h2 id="air-contact-title" className={styles.h2}>{t('returnTitle')}</h2>
              <p className={styles.bodyLarge}>{t('returnLead')}</p>
            </div>
            <div className={styles.contactActions}>
              <Link href="/contact/?intent=application-support" className={styles.buttonYellow}>{t('engineeringSupport')}</Link>
              <a className={styles.buttonGhost} href="https://part-search.elimfilters.com/" target="_blank" rel="noopener noreferrer">{t('partSearch')}</a>
              <Link href="/systems/" className={styles.link}>{t('viewParent')} <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
