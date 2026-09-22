'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import styles from './MacrocoreTechnologyPage.module.css';
import {
  type IndustrialProcessPlatform,
  industrialProcessTechnologyUrl,
  localizeIndustrialProcessPlatform,
} from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

const DEFAULT_QUALIFICATION_GROUP_KEYS = ['process', 'contamination', 'integration'] as const;
const DEFAULT_QUALIFICATION_ITEM_KEYS: Record<(typeof DEFAULT_QUALIFICATION_GROUP_KEYS)[number], string[]> = {
  process: ['fluidComposition', 'flowRate', 'operatingPressure', 'temperatureRange'],
  contamination: ['contaminantType', 'loadingPattern', 'treatmentObjective', 'processSensitivity'],
  integration: ['materialsCompatibility', 'existingHousing', 'connections', 'outletQuality'],
};

export function IndustrialProcessPlatformStablePage({ platform: rawPlatform }: { platform: IndustrialProcessPlatform }) {
  const { t, i18n } = useTranslation();
  const platform = localizeIndustrialProcessPlatform(rawPlatform, i18n.language);
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${platform.name} Industrial & Process Platform Review`)}`;
  const canonicalKnowledge = platform.knowledgeCenterSlug ? getCanonicalKnowledgeBySlug(platform.knowledgeCenterSlug) : null;
  const standards = canonicalKnowledge?.standards ?? [];
  const p = 'industrialProcess.platformPage';

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="industrial-platform-title">
        {platform.heroVideo ? (
          <video
            className={styles.heroBackground}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src={platform.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img className={styles.heroBackground} src={platform.heroImage} alt="" aria-hidden="true" />
        )}
        <div className={styles.heroShade} aria-hidden="true" />
        <h1 id="industrial-platform-title" className={styles.srOnly}>{platform.name} {platform.descriptor}</h1>
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            zIndex: 3,
            width: 'min(980px, 86vw)',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 750,
            fontSize: 'clamp(3.4rem, 9vw, 7.6rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.055em',
            color: '#fff',
            textTransform: 'uppercase',
            textShadow: '0 8px 28px rgba(0,0,0,.5)',
          }}
        >
          {platform.name}
        </div>
      </section>

      <nav aria-label="Breadcrumb" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
        <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em',flexWrap:'wrap'}}>
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{t(`${p}.breadcrumbHome`)}</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{t(`${p}.breadcrumbIndustrialProcess`)}</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{platform.name}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{t(`${p}.commercialTechnologyPlatform`)}</p>
          <h2 className={styles.displayTitle}>{platform.name}</h2>
          <p className={styles.applicationLine}><strong>{platform.descriptor}</strong></p>
          <p className={styles.lead}>{platform.summary}</p>
          <p className={styles.bodyWide}>{platform.positioning ?? t(`${p}.defaultPositioning`)}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>{t(`${p}.platformLabel`)}:</span> {platform.name}</p>
                <p><span>{t(`${p}.domainLabel`)}:</span> {platform.descriptor}</p>
                <p><span>{t(`${p}.divisionLabel`)}:</span> {t(`${p}.divisionValue`)}</p>
              </div>
              <p className={styles.eyebrow}>{t(`${p}.platformRole`)}</p>
              <h3 className={styles.featureTitle}>{t(`${p}.navigateByTreatmentFunction`)}</h3>
              <p className={styles.lead}>{platform.summary}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src={platform.mediaImage ?? platform.heroImage} alt={`${platform.descriptor} industrial application context`} />
              <figcaption>{t(`${p}.mediaCaption`)}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {platform.selectionGuide?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{platform.selectionContext?.eyebrow ?? t(`${p}.defaultTreatmentScope`)}</p>
          <h2 className={styles.h2}>{platform.selectionContext?.title ?? t(`${p}.defaultTreatmentScopeTitle`)}</h2>
          <p className={styles.lead}>{platform.selectionContext?.lead ?? t(`${p}.defaultTreatmentScopeLead`, { name: platform.name })}</p>
          <div className={styles.editorialColumns}>
            {platform.selectionGuide.map((item) => (
              <div key={item.technologySlug}>
                <h3 className={styles.h3}>{item.title}</h3>
                <p className={styles.body}>{item.body}</p>
                <div className={styles.textLinks}>
                  <Link href={industrialProcessTechnologyUrl(platform.slug, item.technologySlug)}>{t(`${p}.exploreTreatmentPath`)} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div></section>
      ) : null}

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.technologyFamilies`)}</p>
        <h2 className={styles.h2}>{t(`${p}.selectTreatmentMechanism`)}</h2>
        <div className={styles.editorialColumns}>
          {platform.technologies.map((technology) => (
            <div key={technology.slug}>
              <h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)} style={{color:'#fff',textDecoration:'none'}}>{technology.name}</Link></h3>
              <p className={styles.body}><strong style={{color:'#fff'}}>{technology.title}</strong></p>
              <p className={styles.body}>{technology.summary}</p>
              <div className={styles.textLinks}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)}>{t(`${p}.exploreTechnology`)} →</Link></div>
            </div>
          ))}
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.operatingReality`)}</p>
        <h2 className={styles.h2}>{t(`${p}.operatingRealityTitle`)}</h2>
        <p className={styles.lead}>{t(`${p}.operatingRealityLead`)}</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.platformFirst`)}</h3><p className={styles.body}>{t(`${p}.platformFirstBody`, { name: platform.name })}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{t(`${p}.technologySecond`)}</h3><p className={styles.body}>{t(`${p}.technologySecondBody`)}</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.engineeringQualification`)}</p>
        <h2 className={styles.h2}>{t(`${p}.engineeringQualificationTitle`)}</h2>
        <div className={styles.editorialColumns}>
          {platform.qualificationGroups
            ? platform.qualificationGroups.map((group) => (
                <div key={group.title}>
                  <h3 className={styles.h3}>{group.title}</h3>
                  <ul className={styles.list}>{group.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))
            : DEFAULT_QUALIFICATION_GROUP_KEYS.map((groupKey) => (
                <div key={groupKey}>
                  <h3 className={styles.h3}>{t(`${p}.defaultQualification.${groupKey}.title`)}</h3>
                  <ul className={styles.list}>
                    {DEFAULT_QUALIFICATION_ITEM_KEYS[groupKey].map((itemKey) => (
                      <li key={itemKey}>{t(`${p}.defaultQualification.${groupKey}.items.${itemKey}`)}</li>
                    ))}
                  </ul>
                </div>
              ))}
        </div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{t(`${p}.standardsAndTestGovernance`)}</p>
          <h2 className={styles.h2}>{t(`${p}.standardsThatGovernPlatform`)}</h2>
          <p className={styles.lead}>{t(`${p}.standardsLead`)}</p>
          <ul className={styles.list}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>{t(`${p}.standardsFootnote`)}</p>
        </div></section>
      ) : null}

      {platform.knowledgeCenterSlug ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>{t(`${p}.technicalBasis`)}</p>
          <h2 className={styles.h2}>{t(`${p}.governedPlatformEngineeringReference`)}</h2>
          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{t(`${p}.canonicalKnowledgeCenterReference`)}</h3>
              <p className={styles.body}>{t(`${p}.canonicalKnowledgeCenterReferenceBody`, { name: platform.name })}</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${platform.knowledgeCenterSlug}/`}>{t(`${p}.openEngineeringReference`)} →</Link></div>
            </article>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{t(`${p}.evidenceBeforeClaims`)}</h3>
              <p className={styles.body}>{t(`${p}.evidenceBeforeClaimsBody`)}</p>
            </article>
          </div>
        </div></section>
      ) : null}

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.applicationSupport`)}</p>
        <h2 className={styles.h2}>{t(`${p}.applicationSupportTitle`)}</h2>
        <p className={styles.lead}>{t(`${p}.applicationSupportLead`)}</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{t(`${p}.technicalReviewPath`)}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{t(`${p}.exploreIndustrialProcess`)}</p>
        <h2 className={styles.h2}>{t(`${p}.returnToFivePlatforms`)}</h2>
        <div className={styles.textLinks}><Link href="/industrial-process/">{t(`${p}.industrialProcessHome`)} →</Link></div>
      </div></section>
    </main>
  );
}
