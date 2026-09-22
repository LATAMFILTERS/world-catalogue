'use client';

import Link from 'next/link';
import { useTranslation, type TFunction } from 'react-i18next';
import '@/i18n';
import styles from './MacrocoreTechnologyPage.module.css';
import {
  type IndustrialProcessPlatform,
  type IndustrialProcessTechnology,
  industrialProcessPlatformUrl,
  industrialProcessTechnologyUrl,
} from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

function coreLabel(core: string | readonly string[]) {
  return typeof core === 'string' ? core : core.join(' / ');
}

function technologyName(name: string, branded: boolean) {
  return branded ? <span className={styles.technologyName}>{name}</span> : name;
}

function faqItems(
  t: TFunction,
  p: string,
  platform: IndustrialProcessPlatform,
  technology: IndustrialProcessTechnology,
) {
  const familyWord = technology.branded ? t(`${p}.faq.wordTechnology`) : t(`${p}.faq.wordTreatmentFamily`);
  const base: (readonly [string, string])[] = [
    [
      t(`${p}.faq.q1`, { name: technology.name }),
      t(`${p}.faq.a1`, { name: technology.name, familyWord, title: technology.title.toLowerCase(), function: technology.treatmentFunction.charAt(0).toLowerCase() + technology.treatmentFunction.slice(1) }),
    ],
    [
      t(`${p}.faq.q2`, { name: technology.name }),
      t(`${p}.faq.a2`, { name: technology.name, platformName: platform.name, platformDescriptor: platform.descriptor }),
    ],
    [
      t(`${p}.faq.q3`, { name: technology.name }),
      t(`${p}.faq.a3`),
    ],
    [
      t(`${p}.faq.q4`, { name: technology.name }),
      t(`${p}.faq.a4`),
    ],
  ];
  return [...base, ...(technology.customFaqs ?? [])];
}

export function IndustrialProcessTechnologyStablePage({
  platform,
  technology,
}: {
  platform: IndustrialProcessPlatform;
  technology: IndustrialProcessTechnology;
}) {
  const { t } = useTranslation();
  const p = 'industrialProcess.technologyPage';
  const url = `https://elimfilters.com${industrialProcessTechnologyUrl(platform.slug, technology.slug)}`;
  const faqs = faqItems(t, p, platform, technology);
  const canonicalKnowledge = technology.knowledgeCenterSlug ? getCanonicalKnowledgeBySlug(technology.knowledgeCenterSlug) : null;
  const standards = canonicalKnowledge?.standards ?? [];
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: `${technology.name} ${technology.title}`,
    name: technology.name,
    url,
    description: technology.summary,
    image: `https://elimfilters.com${technology.heroImage}`,
    author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    about: technology.mechanisms.map((name) => ({ '@type': 'Thing', name })),
    isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS', url: 'https://elimfilters.com/' },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Industrial & Process', item: 'https://elimfilters.com/industrial-process/' },
      { '@type': 'ListItem', position: 3, name: platform.name, item: `https://elimfilters.com${industrialProcessPlatformUrl(platform.slug)}` },
      { '@type': 'ListItem', position: 4, name: technology.name, item: url },
    ],
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  };
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${technology.name} Industrial & Process Application Assessment`)}`;
  const related = platform.technologies.filter((item) => item.slug !== technology.slug);
  const commonSelectionErrors = t(`${p}.commonSelectionErrors`, { returnObjects: true }) as string[];

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className={styles.hero} aria-labelledby="industrial-tech-title">
        {technology.heroVideo ? (
          <video
            className={styles.heroBackground}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={technology.hideHeroPoster ? undefined : technology.heroImage}
            aria-hidden="true"
          >
            <source src={technology.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img className={styles.heroBackground} src={technology.heroImage} alt="" aria-hidden="true" />
        )}
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="industrial-tech-title" className={styles.srOnly}>{technology.name} {technology.title}</h1>
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            zIndex: 3,
            width: 'min(980px, 86vw)',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 750,
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.055em',
            color: '#fff',
            textTransform: 'uppercase',
            textShadow: '0 8px 28px rgba(0,0,0,.5)',
          }}
        >
          {technologyName(technology.name, technology.branded)}
        </div>
      </section>

      <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
        <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em',flexWrap:'wrap'}}>
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{t('industrialProcess.platformPage.breadcrumbHome')}</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{t('industrialProcess.platformPage.breadcrumbIndustrialProcess')}</Link><span>→</span>
          <Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{platform.name}</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{technologyName(technology.name, technology.branded)}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{technology.branded ? t(`${p}.filtrationTechnology`) : t(`${p}.treatmentFamily`)}</p>
          <h2 className={styles.displayTitle}>{technologyName(technology.name, technology.branded)}</h2>
          <p className={styles.applicationLine}><strong>{technology.title}</strong></p>
          <p className={styles.lead}>{technology.summary}</p>
          <p className={styles.bodyWide}>{technology.treatmentFunction}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>{technology.branded ? t(`${p}.technologyLabel`) : t(`${p}.treatmentFamilyLabel`)}:</span> {technologyName(technology.name, technology.branded)}</p>
                <p><span>{t(`${p}.platformLabel`)}:</span> {platform.name} — {platform.descriptor}</p>
                <p><span>{t(`${p}.engineeringCoreLabel`)}:</span> {coreLabel(technology.technologyCore)}</p>
              </div>
              <p className={styles.eyebrow}>{t(`${p}.description`)}</p>
              <h3 className={styles.featureTitle}>{technology.title}</h3>
              <p className={styles.lead}>{technology.treatmentFunction}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src={technology.mediaImage} alt={`${technology.title} industrial treatment context`} />
              <figcaption>{t(`${p}.mediaCaption`)}</figcaption>
            </figure>
          </div>

          <div className={styles.twoColumnNotes}>
            {technology.mechanisms.map((item, index) => (
              <article className={styles.noteBlock} key={item}>
                <h3 className={styles.h3}>{String(index + 1).padStart(2, '0')} / {item}</h3>
                <p className={styles.body}>{t(`${p}.mechanismNoteBody`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.operatingReality`)}</p>
        <h2 className={styles.h2}>{t(`${p}.operatingRealityTitle`)}</h2>
        <p className={styles.lead}>{t(`${p}.operatingRealityLead`)}</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.usefulDistinction`)}</h3><p className={styles.body}>{t(`${p}.usefulDistinctionBody`)}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.evidenceBeforeClaims`)}</h3><p className={styles.body}>{t(`${p}.evidenceBeforeClaimsBody`)}</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.applicationEnvironment`)}</p>
        <h2 className={styles.h2}>{t(`${p}.whereItBelongs`, { name: technology.name })}</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>{t(`${p}.applicationPositions`)}</h3><ul className={styles.list}>{technology.applications.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{t(`${p}.conditionsThatChangeDuty`)}</h3><ul className={styles.list}>{technology.conditions.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{t(`${p}.platformContext`)}</h3><ul className={styles.list}><li>{platform.name}</li><li>{platform.descriptor}</li><li>{t('industrialProcess.platformPage.divisionValue')}</li><li>{t(`${p}.applicationSpecificValidation`)}</li></ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.specificationAndSelection`)}</p>
        <h2 className={styles.h2}>{t(`${p}.questionsBeforeSpecifying`, { title: technology.title.toLowerCase() })}</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>{t(`${p}.keyEngineeringInputs`)}</h3><ul className={styles.list}>{technology.selectionInputs.slice(0,4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{t(`${p}.systemCompatibility`)}</h3><ul className={styles.list}>{technology.selectionInputs.slice(4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{t(`${p}.commonSelectionErrorsTitle`)}</h3><ul className={styles.list}>{commonSelectionErrors.map((x)=><li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className={styles.inlineCta}>
          <p><strong>{t(`${p}.knownConditionsQuestion`)}</strong> {t(`${p}.sendOperatingData`)} <strong>{t(`${p}.uncertainPathQuestion`)}</strong> {t(`${p}.useEngineeringReview`)}</p>
          <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{t(`${p}.technicalReview`)}</a></div>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.howTheSystemBehaves`)}</p>
        <h2 className={styles.h2}>{t(`${p}.mechanismLoadingTitle`)}</h2>
        <p className={styles.lead}>{technology.treatmentFunction}</p>
        <div className={styles.twoColumnNotes}>
          {technology.mechanisms.map((item) => (
            <article className={styles.noteBlock} key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>{t(`${p}.mechanismDesignBody`)}</p></article>
          ))}
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.protectedProcessOutcome`)}</h3><p className={styles.body}>{t(`${p}.protectedProcessOutcomeBody`)}</p></article>
        </div>
      </div></section>

      {technology.subfamilies?.length ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>{t(`${p}.descriptiveSubfamilies`)}</p>
          <h2 className={styles.h2}>{t(`${p}.includesDistinctPaths`, { name: technology.name })}</h2>
          <div className={styles.editorialColumns}>
            {technology.subfamilies.map((item) => <div key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>{t(`${p}.subfamilyBody`, { name: technology.name })}</p></div>)}
          </div>
        </div></section>
      ) : null}

      {technology.engineeringNotes?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{t(`${p}.engineeringGuidance`)}</p>
          <h2 className={styles.h2}>{t(`${p}.whatMattersIn`, { title: technology.title.toLowerCase() })}</h2>
          <div className={styles.twoColumnNotes}>
            {technology.engineeringNotes.map((note) => (
              <article className={styles.noteBlock} key={note.title}>
                <h3 className={styles.h3}>{note.title}</h3>
                <p className={styles.body}>{note.body}</p>
              </article>
            ))}
          </div>
        </div></section>
      ) : null}

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.serviceAndDiagnosis`)}</p>
        <h2 className={styles.h2}>{t(`${p}.abnormalBehaviorTitle`)}</h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{technology.serviceSignals.map((x)=><li key={x}>{x}</li>)}</ul>
        <div className={styles.inlineCta}><p>{t(`${p}.diagnosisCtaLead`)}</p><a href={inquiryHref} data-conversion-action="application-support">{t(`${p}.requestProcessReview`)}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.questionsFromTheField`)}</p>
        <h2 className={styles.h2}>{t(`${p}.directAnswersTitle`)}</h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{t('industrialProcess.platformPage.standardsAndTestGovernance')}</p>
          <h2 className={styles.h2}>{t(`${p}.applicableStandardsTitle`)}</h2>
          <p className={styles.lead}>{t(`${p}.applicableStandardsLead`)}</p>
          <ul className={`${styles.list} ${styles.serviceList}`}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>{t(`${p}.applicableStandardsFootnote`, { name: technology.name })}</p>
          {technology.knowledgeCenterSlug ? <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>{t(`${p}.openGovernedStandardContext`)} →</Link></div> : null}
        </div></section>
      ) : null}

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t('industrialProcess.platformPage.technicalBasis')}</p>
        <h2 className={styles.h2}>{t(`${p}.technicalReferenceTitle`)}</h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.engineeringCore`)}</h3><p className={styles.body}>{t(`${p}.engineeringCoreBody`, { core: coreLabel(technology.technologyCore) })}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.claimGovernance`)}</h3><p className={styles.body}>{t(`${p}.claimGovernanceBody`, { name: technology.name })}</p></article>
          {technology.knowledgeCenterSlug ? (
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{t('industrialProcess.platformPage.canonicalKnowledgeCenterReference')}</h3>
              <p className={styles.body}>{t(`${p}.canonicalReferenceBody`, { name: technology.name })}</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>{t('industrialProcess.platformPage.openEngineeringReference')} →</Link></div>
            </article>
          ) : null}
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.whenReviewMakesSense`)}</p>
        <h2 className={styles.h2}>{t(`${p}.whenReviewMakesSenseTitle`)}</h2>
        <p className={styles.lead}>{t(`${p}.whenReviewMakesSenseLead`)}</p>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.platformIntegration`)}</p>
        <h2 className={styles.h2}>{platform.name} — {platform.descriptor}</h2>
        <div className={styles.systemGrid}>
          <div><p className={styles.lead}>{platform.summary}</p><Link className={styles.systemButton} href={industrialProcessPlatformUrl(platform.slug)}>{t(`${p}.explorePlatform`)}</Link></div>
          <p className={styles.bodyWide}>{t(`${p}.platformIntegrationBody`, { name: technology.name, platformName: platform.name })}</p>
        </div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t('industrialProcess.platformPage.applicationSupport')}</p>
        <h2 className={styles.h2}>{t(`${p}.applicationSupportTitle`)}</h2>
        <p className={styles.lead}>{t('industrialProcess.platformPage.applicationSupportLead')}</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{t('industrialProcess.platformPage.technicalReviewPath')}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.exploreRelatedTechnologies`)}</p>
        <h2 className={styles.h2}>{t(`${p}.continueWithin`, { platformName: platform.name })}</h2>
        <div className={styles.editorialColumns}>
          {related.slice(0,3).map((item) => (
            <div key={item.slug}><h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug,item.slug)} style={{color:'#fff',textDecoration:'none'}}>{technologyName(item.name, item.branded)}</Link></h3><p className={styles.body}>{item.title}</p></div>
          ))}
          {related.length === 0 ? <div><h3 className={styles.h3}><Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'#fff',textDecoration:'none'}}>{t(`${p}.backToPlatform`, { platformName: platform.name })}</Link></h3><p className={styles.body}>{t(`${p}.reviewPlatformContext`)}</p></div> : null}
        </div>
      </div></section>
    </main>
  );
}
