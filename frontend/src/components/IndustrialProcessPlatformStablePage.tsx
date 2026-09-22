'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import styles from './MacrocoreTechnologyPage.module.css';
import {
  type IndustrialProcessPlatform,
  industrialProcessTechnologyUrl,
} from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

export function IndustrialProcessPlatformStablePage({ platform }: { platform: IndustrialProcessPlatform }) {
  const { t } = useTranslation();
  const tt = (key: string, en: string) => t(`industrialProcess.ui.${key}`, en);
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${platform.name} Industrial & Process Platform Review`)}`;
  const canonicalKnowledge = platform.knowledgeCenterSlug ? getCanonicalKnowledgeBySlug(platform.knowledgeCenterSlug) : null;
  const standards = canonicalKnowledge?.standards ?? [];
  const defaultQualificationGroups = [
    { title: tt('qual.process.title', 'Process'), items: [tt('qual.process.i0','Fluid, gas, air or water composition'), tt('qual.process.i1','Flow rate and duty profile'), tt('qual.process.i2','Operating and design pressure'), tt('qual.process.i3','Temperature range')] },
    { title: tt('qual.contamination.title', 'Contamination'), items: [tt('qual.contamination.i0','Contaminant type and concentration'), tt('qual.contamination.i1','Loading pattern and variability'), tt('qual.contamination.i2','Required removal or treatment objective'), tt('qual.contamination.i3','Upstream and downstream process sensitivity')] },
    { title: tt('qual.integration.title', 'Integration'), items: [tt('qual.integration.i0','Materials and chemical compatibility'), tt('qual.integration.i1','Existing housing, vessel or skid'), tt('qual.integration.i2','Connections and installation envelope'), tt('qual.integration.i3','Required outlet quality and verification method')] },
  ];

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
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{tt('breadcrumb.home','HOME')}</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{tt('breadcrumb.industrialProcess','INDUSTRIAL & PROCESS')}</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{platform.name}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('platform.eyebrow','COMMERCIAL TECHNOLOGY PLATFORM')}</p>
          <h2 className={styles.displayTitle}>{platform.name}</h2>
          <p className={styles.applicationLine}><strong>{platform.descriptor}</strong></p>
          <p className={styles.lead}>{platform.summary}</p>
          <p className={styles.bodyWide}>{platform.positioning ?? tt('platform.defaultPositioning','The platform groups validated Industrial & Process treatment families by engineering function. Select the treatment mechanism first; product and system configuration follow the operating conditions and required outcome.')}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>{tt('meta.platform','Platform:')}</span> {platform.name}</p>
                <p><span>{tt('meta.domain','Domain:')}</span> {platform.descriptor}</p>
                <p><span>{tt('meta.division','Division:')}</span> {tt('meta.divisionValue','Industrial & Process')}</p>
              </div>
              <p className={styles.eyebrow}>{tt('platform.roleEyebrow','PLATFORM ROLE')}</p>
              <h3 className={styles.featureTitle}>{tt('platform.roleTitle','Navigate by treatment function.')}</h3>
              <p className={styles.lead}>{platform.summary}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src={platform.mediaImage ?? platform.heroImage} alt={`${platform.descriptor} industrial application context`} />
              <figcaption>{tt('platform.mediaCaption','Representative industrial application context. Final solution remains project-specific.')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {platform.selectionGuide?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{platform.selectionContext?.eyebrow ?? tt('platform.treatmentScope','TREATMENT SCOPE')}</p>
          <h2 className={styles.h2}>{platform.selectionContext?.title ?? tt('platform.matchProblem','Match the process problem to the treatment path.')}</h2>
          <p className={styles.lead}>{platform.selectionContext?.lead ?? t('industrialProcess.ui.platform.defaultSelectionLead', { name: platform.name, defaultValue: '{{name}} organizes the available treatment mechanisms so selection begins with the actual process condition, contaminant behavior and required outcome.' })}</p>
          <div className={styles.editorialColumns}>
            {platform.selectionGuide.map((item) => (
              <div key={item.technologySlug}>
                <h3 className={styles.h3}>{item.title}</h3>
                <p className={styles.body}>{item.body}</p>
                <div className={styles.textLinks}>
                  <Link href={industrialProcessTechnologyUrl(platform.slug, item.technologySlug)}>{tt('cta.exploreTreatmentPath','EXPLORE TREATMENT PATH →')}</Link>
                </div>
              </div>
            ))}
          </div>
        </div></section>
      ) : null}

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('platform.familiesEyebrow','TECHNOLOGY FAMILIES')}</p>
        <h2 className={styles.h2}>{tt('platform.familiesTitle','Select the treatment mechanism.')}</h2>
        <div className={styles.editorialColumns}>
          {platform.technologies.map((technology) => (
            <div key={technology.slug}>
              <h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)} style={{color:'#fff',textDecoration:'none'}}>{technology.name}</Link></h3>
              <p className={styles.body}><strong style={{color:'#fff'}}>{technology.title}</strong></p>
              <p className={styles.body}>{technology.summary}</p>
              <div className={styles.textLinks}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)}>{tt('cta.exploreTechnology','EXPLORE TECHNOLOGY →')}</Link></div>
            </div>
          ))}
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.operatingRealityEyebrow','OPERATING REALITY')}</p>
        <h2 className={styles.h2}>{tt('platform.operatingRealityTitle','Industrial treatment starts with the process problem.')}</h2>
        <p className={styles.lead}>{tt('platform.operatingRealityLead','Flow, pressure, temperature, chemistry, contaminant form, duty cycle, compatibility, existing equipment and required outlet condition determine which treatment family and physical configuration belong in the project.')}</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('platform.platformFirstTitle','Platform first')}</h3><p className={styles.body}>{t('industrialProcess.ui.platform.platformFirstBody', { name: platform.name, defaultValue: '{{name}} narrows the project to the correct treatment universe without forcing an early product choice.' })}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('platform.technologySecondTitle','Technology second')}</h3><p className={styles.body}>{tt('platform.technologySecondBody','The family page defines the mechanism, application context and evidence required before product or system specification.')}</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.engineeringQualificationEyebrow','ENGINEERING QUALIFICATION')}</p>
        <h2 className={styles.h2}>{tt('platform.qualificationTitle','What must be known before a treatment architecture is selected.')}</h2>
        <div className={styles.editorialColumns}>
          {(platform.qualificationGroups ?? defaultQualificationGroups).map((group) => (
            <div key={group.title}>
              <h3 className={styles.h3}>{group.title}</h3>
              <ul className={styles.list}>{group.items.map((x)=><li key={x}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('shared.standardsEyebrow','STANDARDS & TEST GOVERNANCE')}</p>
          <h2 className={styles.h2}>{tt('platform.standardsTitle','Standards that govern this platform')}</h2>
          <p className={styles.lead}>{tt('platform.standardsLead','This platform inherits the applicable ISO, ASTM and other validated test methods maintained in its canonical Knowledge Center record. Individual family pages narrow the list to the actual element or treatment mechanism.')}</p>
          <ul className={styles.list}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>{tt('platform.standardsDisclaimer','A standard is applied only within its published scope and the validated product duty. Listing it here is not a blanket certification claim for every ELIMFILTERS element in the platform.')}</p>
        </div></section>
      ) : null}

      {platform.knowledgeCenterSlug ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('shared.technicalBasisEyebrow','TECHNICAL BASIS')}</p>
          <h2 className={styles.h2}>{tt('platform.governedReferenceTitle','Governed platform engineering reference')}</h2>
          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{tt('shared.canonicalReferenceTitle','Canonical Knowledge Center reference')}</h3>
              <p className={styles.body}>{t('industrialProcess.ui.platform.canonicalReferenceBody', { name: platform.name, defaultValue: 'Approved treatment relationships, operating conditions and diagnostic guidance for {{name}} are maintained in the governed ELIMFILTERS Knowledge Center.' })}</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${platform.knowledgeCenterSlug}/`}>{tt('cta.openEngineeringReference','OPEN ENGINEERING REFERENCE →')}</Link></div>
            </article>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{tt('shared.evidenceBeforeClaimsTitle','Evidence before claims')}</h3>
              <p className={styles.body}>{tt('platform.evidenceBeforeClaimsBody','Numeric performance, capacity, pressure-drop, service-life and outlet-condition claims remain tied to validated product or project evidence.')}</p>
            </article>
          </div>
        </div></section>
      ) : null}

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.applicationSupportEyebrow','APPLICATION SUPPORT')}</p>
        <h2 className={styles.h2}>{tt('platform.ctaTitle','Bring us the operating conditions. We resolve the treatment architecture.')}</h2>
        <p className={styles.lead}>{tt('platform.ctaLead','Industrial & Process projects are qualified by duty, operating envelope, contamination mechanism, process risk and compatibility before the physical solution is selected.')}</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{tt('cta.technicalReviewPath','TECHNICAL REVIEW PATH')}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('platform.exploreEyebrow','EXPLORE INDUSTRIAL & PROCESS')}</p>
        <h2 className={styles.h2}>{tt('platform.exploreTitle','Return to the five commercial technology platforms.')}</h2>
        <div className={styles.textLinks}><Link href="/industrial-process/">{tt('cta.industrialProcessHome','INDUSTRIAL & PROCESS HOME →')}</Link></div>
      </div></section>
    </main>
  );
}
