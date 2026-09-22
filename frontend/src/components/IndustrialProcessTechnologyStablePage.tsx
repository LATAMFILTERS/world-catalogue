'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
  platform: IndustrialProcessPlatform,
  technology: IndustrialProcessTechnology,
  t: (key: string, opts: Record<string, unknown>) => string,
) {
  const familyWord = technology.branded
    ? t('industrialProcess.ui.shared.wordTechnology', { defaultValue: 'technology' })
    : t('industrialProcess.ui.shared.wordTreatmentFamily', { defaultValue: 'treatment family' });
  const vars = {
    name: technology.name,
    title: technology.title,
    titleLower: technology.title.toLowerCase(),
    functionLower: technology.treatmentFunction.charAt(0).toLowerCase() + technology.treatmentFunction.slice(1),
    platform: platform.name,
    descriptor: platform.descriptor,
    family: familyWord,
  };
  const base = [
    [
      t('industrialProcess.ui.faq.whatIsTitle', { ...vars, defaultValue: `What is {{name}}?` }),
      t('industrialProcess.ui.faq.whatIsBody', { ...vars, defaultValue: `{{name}} is the ELIMFILTERS Industrial & Process {{family}} for {{titleLower}}. Its role is to {{functionLower}}` }),
    ],
    [
      t('industrialProcess.ui.faq.whereFitsTitle', { ...vars, defaultValue: `Where does {{name}} fit within ELIMFILTERS Industrial & Process?` }),
      t('industrialProcess.ui.faq.whereFitsBody', { ...vars, defaultValue: `{{name}} belongs to {{platform}} — {{descriptor}}. The platform defines the commercial treatment universe while the family identifies the specific mechanism or treatment function.` }),
    ],
    [
      t('industrialProcess.ui.faq.partNumberTitle', { ...vars, defaultValue: `Can {{name}} be selected from a part number alone?` }),
      t('industrialProcess.ui.faq.partNumberBody', { defaultValue: 'No. Industrial & Process selection starts with the operating problem, process conditions, contaminant, flow, pressure, temperature, compatibility requirements and required outcome. Product configuration follows the validated application.' }),
    ],
    [
      t('industrialProcess.ui.faq.universalClaimTitle', { ...vars, defaultValue: `Does {{name}} have one universal efficiency or service-life claim?` }),
      t('industrialProcess.ui.faq.universalClaimBody', { defaultValue: 'No universal performance value is assigned across the family. Numeric efficiency, capacity, pressure-drop, service-life or outlet-quality claims must remain tied to validated product or project evidence.' }),
    ],
  ] as const;
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
  const tt = (key: string, en: string) => t(`industrialProcess.ui.${key}`, en);
  const url = `https://elimfilters.com${industrialProcessTechnologyUrl(platform.slug, technology.slug)}`;
  const faqs = faqItems(platform, technology, t);
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
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{tt('breadcrumb.home','HOME')}</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{tt('breadcrumb.industrialProcess','INDUSTRIAL & PROCESS')}</Link><span>→</span>
          <Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{platform.name}</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{technologyName(technology.name, technology.branded)}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{technology.branded ? tt('tech.filtrationTechnology','FILTRATION TECHNOLOGY') : tt('tech.treatmentFamily','TREATMENT FAMILY')}</p>
          <h2 className={styles.displayTitle}>{technologyName(technology.name, technology.branded)}</h2>
          <p className={styles.applicationLine}><strong>{technology.title}</strong></p>
          <p className={styles.lead}>{technology.summary}</p>
          <p className={styles.bodyWide}>{technology.treatmentFunction}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>{technology.branded ? tt('meta.technologyLabel','Technology:') : tt('meta.treatmentFamilyLabel','Treatment family:')}</span> {technologyName(technology.name, technology.branded)}</p>
                <p><span>{tt('meta.platform','Platform:')}</span> {platform.name} — {platform.descriptor}</p>
                <p><span>{tt('meta.engineeringCore','Engineering core:')}</span> {coreLabel(technology.technologyCore)}</p>
              </div>
              <p className={styles.eyebrow}>{tt('tech.descriptionEyebrow','DESCRIPTION')}</p>
              <h3 className={styles.featureTitle}>{technology.title}</h3>
              <p className={styles.lead}>{technology.treatmentFunction}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src={technology.mediaImage} alt={`${technology.title} industrial treatment context`} />
              <figcaption>{tt('tech.mediaCaption','Representative industrial treatment context. Final configuration remains application-specific.')}</figcaption>
            </figure>
          </div>

          <div className={styles.twoColumnNotes}>
            {technology.mechanisms.map((item, index) => (
              <article className={styles.noteBlock} key={item}>
                <h3 className={styles.h3}>{String(index + 1).padStart(2, '0')} / {item}</h3>
                <p className={styles.body}>{tt('tech.mechanismNote','This mechanism is evaluated together with the operating envelope, contamination load, compatibility and required treatment outcome.')}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.operatingRealityEyebrow','OPERATING REALITY')}</p>
        <h2 className={styles.h2}>{tt('tech.performanceBoundaryTitle','Treatment performance depends on the complete process boundary.')}</h2>
        <p className={styles.lead}>{tt('tech.performanceBoundaryLead','The filter, element, media, vessel or treatment device is only one part of the result. Flow, contaminant loading, pressure, temperature, chemistry, housing condition, drainage, sealing and upstream/downstream process behavior can materially change performance.')}</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('tech.usefulDistinctionTitle','A useful distinction')}</h3><p className={styles.body}>{t('industrialProcess.ui.tech.usefulDistinctionBody', { name: technology.name, defaultValue: '{{name}} identifies a treatment function. It does not make every product or system inside that category technically interchangeable.' })}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('shared.evidenceBeforeClaimsTitle','Evidence before claims')}</h3><p className={styles.body}>{tt('tech.evidenceBeforeClaimsBody','Efficiency, capacity, pressure drop, outlet quality, service interval and compatibility remain tied to validated product or project evidence.')}</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.applicationEnvironmentEyebrow','APPLICATION ENVIRONMENT')}</p>
        <h2 className={styles.h2}>{t('industrialProcess.ui.tech.whereBelongsTitle', { name: technology.name, defaultValue: 'Where {{name}} belongs' })}</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>{tt('tech.applicationPositionsTitle','Application positions')}</h3><ul className={styles.list}>{technology.applications.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{tt('tech.conditionsTitle','Conditions that change treatment duty')}</h3><ul className={styles.list}>{technology.conditions.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{tt('tech.platformContextTitle','Platform context')}</h3><ul className={styles.list}><li>{platform.name}</li><li>{platform.descriptor}</li><li>{tt('meta.divisionValue','Industrial & Process')}</li><li>{tt('tech.applicationSpecificValidation','Application-specific engineering validation')}</li></ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.specSelectionEyebrow','SPECIFICATION & SELECTION')}</p>
        <h2 className={styles.h2}>{t('industrialProcess.ui.tech.questionsBeforeSpecifying', { title: technology.title.toLowerCase(), defaultValue: 'Questions before specifying {{title}}' })}</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>{tt('tech.keyEngineeringInputsTitle','Key engineering inputs')}</h3><ul className={styles.list}>{technology.selectionInputs.slice(0,4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{tt('tech.systemCompatibilityTitle','System compatibility')}</h3><ul className={styles.list}>{technology.selectionInputs.slice(4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>{tt('tech.commonErrorsTitle','Common selection errors')}</h3><ul className={styles.list}>{[tt('tech.commonErrors.0','Choosing by nominal category alone'),tt('tech.commonErrors.1','Ignoring operating-envelope limits'),tt('tech.commonErrors.2','Using unvalidated performance claims'),tt('tech.commonErrors.3','Treating cross-reference as complete application validation')].map((x)=><li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className={styles.inlineCta}>
          <p><strong>{tt('tech.knownConditionsQ','Known project conditions?')}</strong> {tt('tech.knownConditionsA','Send the operating data.')} <strong>{tt('tech.uncertainPathQ','Uncertain process or treatment path?')}</strong> {tt('tech.uncertainPathA','Use the engineering review.')}</p>
          <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{tt('cta.technicalReview','TECHNICAL REVIEW')}</a></div>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.systemBehavesEyebrow','HOW THE SYSTEM BEHAVES')}</p>
        <h2 className={styles.h2}>{tt('tech.systemBehavesTitle','Mechanism, loading and process conditions have to be resolved together.')}</h2>
        <p className={styles.lead}>{technology.treatmentFunction}</p>
        <div className={styles.twoColumnNotes}>
          {technology.mechanisms.map((item) => (
            <article className={styles.noteBlock} key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>{tt('tech.finalDesignNote','Final design depends on the project operating window and the validated configuration selected for the application.')}</p></article>
          ))}
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('tech.protectedOutcomeTitle','Protected process outcome')}</h3><p className={styles.body}>{tt('tech.protectedOutcomeBody','The objective is controlled contamination or conditioning performance at the required process boundary—not simply installation of a familiar filter form.')}</p></article>
        </div>
      </div></section>

      {technology.subfamilies?.length ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('tech.subfamiliesEyebrow','DESCRIPTIVE SUBFAMILIES')}</p>
          <h2 className={styles.h2}>{t('industrialProcess.ui.tech.subfamiliesTitle', { name: technology.name, defaultValue: '{{name}} includes distinct engineering paths.' })}</h2>
          <div className={styles.editorialColumns}>
            {technology.subfamilies.map((item) => <div key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>{t('industrialProcess.ui.tech.subfamilyBody', { name: technology.name, defaultValue: 'Descriptive engineering subfamily beneath {{name}}; it does not create an additional independent ELIMFILTERS technology mark.' })}</p></div>)}
          </div>
        </div></section>
      ) : null}

      {technology.engineeringNotes?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('tech.engineeringGuidanceEyebrow','ENGINEERING GUIDANCE')}</p>
          <h2 className={styles.h2}>{t('industrialProcess.ui.tech.whatMattersTitle', { title: technology.title.toLowerCase(), defaultValue: 'What matters in {{title}}' })}</h2>
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
        <p className={styles.eyebrow}>{tt('tech.serviceDiagnosisEyebrow','SERVICE & DIAGNOSIS')}</p>
        <h2 className={styles.h2}>{tt('tech.abnormalBehaviorTitle','What abnormal treatment behavior may be telling you')}</h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{technology.serviceSignals.map((x)=><li key={x}>{x}</li>)}</ul>
        <div className={styles.inlineCta}><p>{tt('tech.abnormalBehaviorNote','Repeated breakthrough, pressure-drop problems, unstable outlet quality or short service intervals justify reviewing the whole process boundary.')}</p><a href={inquiryHref} data-conversion-action="application-support">{tt('cta.requestProcessReview','REQUEST PROCESS REVIEW')}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.fieldQuestionsEyebrow','QUESTIONS FROM THE FIELD')}</p>
        <h2 className={styles.h2}>{tt('tech.fieldQuestionsTitle','Direct answers before an Industrial & Process selection.')}</h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{tt('shared.standardsEyebrow','STANDARDS & TEST GOVERNANCE')}</p>
          <h2 className={styles.h2}>{tt('tech.applicableStandardsTitle','Applicable standards and test methods')}</h2>
          <p className={styles.lead}>{tt('tech.applicableStandardsLead','The standards below are resolved from the governed ELIMFILTERS Knowledge Center for this treatment family. Applicability remains product-, fluid-, contaminant- and duty-specific.')}</p>
          <ul className={`${styles.list} ${styles.serviceList}`}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>{t('industrialProcess.ui.tech.standardsDisclaimer', { name: technology.name, defaultValue: 'A listed standard identifies a relevant engineering or verification method. It does not mean every {{name}} element is certified, qualified or tested to every listed method. Product claims require the corresponding validated test evidence.' })}</p>
          {technology.knowledgeCenterSlug ? <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>{tt('cta.openGovernedStandardContext','OPEN GOVERNED STANDARD CONTEXT →')}</Link></div> : null}
        </div></section>
      ) : null}

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.technicalBasisEyebrow','TECHNICAL BASIS')}</p>
        <h2 className={styles.h2}>{tt('tech.claimGovernanceTitle','Technical reference and claim governance')}</h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('tech.engineeringCoreTitle','Engineering core')}</h3><p className={styles.body}>{t('industrialProcess.ui.tech.engineeringCoreBody', { core: coreLabel(technology.technologyCore), defaultValue: '{{core}} remains the mechanism-level engineering identifier behind the customer-facing family.' })}</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>{tt('tech.claimGovernanceNoteTitle','Claim governance')}</h3><p className={styles.body}>{t('industrialProcess.ui.tech.claimGovernanceBody', { name: technology.name, defaultValue: 'No universal efficiency, capacity, micron rating, separation percentage, service-life multiplier or outlet-quality value is assigned across {{name}} without validated evidence for the specific product or project.' })}</p></article>
          {technology.knowledgeCenterSlug ? (
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>{tt('shared.canonicalReferenceTitle','Canonical Knowledge Center reference')}</h3>
              <p className={styles.body}>{t('industrialProcess.ui.tech.canonicalReferenceBody', { name: technology.name, defaultValue: 'Approved engineering relationships, operating conditions and diagnostic guidance for {{name}} are maintained in the governed ELIMFILTERS Knowledge Center.' })}</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>{tt('cta.openEngineeringReference','OPEN ENGINEERING REFERENCE →')}</Link></div>
            </article>
          ) : null}
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.reviewMakesSenseEyebrow','WHEN A TECHNICAL REVIEW MAKES SENSE')}</p>
        <h2 className={styles.h2}>{tt('tech.reviewMakesSenseTitle','When the treatment problem is larger than the element itself')}</h2>
        <p className={styles.lead}>{tt('tech.reviewMakesSenseLead','Repeated failures, unstable process quality, short service intervals, unexpected pressure drop, contamination breakthrough or uncertain compatibility justify reviewing the complete operating environment and treatment architecture.')}</p>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.platformIntegrationEyebrow','PLATFORM INTEGRATION')}</p>
        <h2 className={styles.h2}>{platform.name} — {platform.descriptor}</h2>
        <div className={styles.systemGrid}>
          <div><p className={styles.lead}>{platform.summary}</p><Link className={styles.systemButton} href={industrialProcessPlatformUrl(platform.slug)}>{tt('cta.explorePlatform','EXPLORE PLATFORM')}</Link></div>
          <p className={styles.bodyWide}>{t('industrialProcess.ui.tech.platformIntegrationBody', { name: technology.name, platform: platform.name, defaultValue: '{{name}} is resolved inside the {{platform}} platform. Final selection connects the treatment mechanism to operating conditions, contamination load, compatibility, required outcome and validated product evidence.' })}</p>
        </div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('shared.applicationSupportEyebrow','APPLICATION SUPPORT')}</p>
        <h2 className={styles.h2}>{tt('tech.finalCtaTitle','Bring us the process conditions and required outcome — not just a generic filter description.')}</h2>
        <p className={styles.lead}>{tt('tech.finalCtaLead','Industrial & Process projects are qualified by duty, operating envelope, contamination mechanism, process risk and system compatibility before the physical solution is selected.')}</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">{tt('cta.technicalReviewPath','TECHNICAL REVIEW PATH')}</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>{tt('tech.exploreRelatedEyebrow','EXPLORE RELATED TECHNOLOGIES')}</p>
        <h2 className={styles.h2}>{t('industrialProcess.ui.tech.continueWithinTitle', { platform: platform.name, defaultValue: 'Continue within {{platform}}.' })}</h2>
        <div className={styles.editorialColumns}>
          {related.slice(0,3).map((item) => (
            <div key={item.slug}><h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug,item.slug)} style={{color:'#fff',textDecoration:'none'}}>{technologyName(item.name, item.branded)}</Link></h3><p className={styles.body}>{item.title}</p></div>
          ))}
          {related.length === 0 ? <div><h3 className={styles.h3}><Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'#fff',textDecoration:'none'}}>{t('industrialProcess.ui.tech.backToPlatform', { platform: platform.name, defaultValue: 'Back to {{platform}}' })}</Link></h3><p className={styles.body}>{tt('tech.reviewPlatformContext','Review the platform context and engineering qualification path.')}</p></div> : null}
        </div>
      </div></section>
    </main>
  );
}
