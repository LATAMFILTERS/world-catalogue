import Link from 'next/link';
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

function faqItems(platform: IndustrialProcessPlatform, technology: IndustrialProcessTechnology) {
  const familyWord = technology.branded ? 'technology' : 'treatment family';
  const base = [
    [
      `What is ${technology.name}?`,
      `${technology.name} is the ELIMFILTERS Industrial & Process ${familyWord} for ${technology.title.toLowerCase()}. Its role is to ${technology.treatmentFunction.charAt(0).toLowerCase() + technology.treatmentFunction.slice(1)}`,
    ],
    [
      `Where does ${technology.name} fit within ELIMFILTERS Industrial & Process?`,
      `${technology.name} belongs to ${platform.name} — ${platform.descriptor}. The platform defines the commercial treatment universe while the family identifies the specific mechanism or treatment function.`,
    ],
    [
      `Can ${technology.name} be selected from a part number alone?`,
      'No. Industrial & Process selection starts with the operating problem, process conditions, contaminant, flow, pressure, temperature, compatibility requirements and required outcome. Product configuration follows the validated application.',
    ],
    [
      `Does ${technology.name} have one universal efficiency or service-life claim?`,
      'No universal performance value is assigned across the family. Numeric efficiency, capacity, pressure-drop, service-life or outlet-quality claims must remain tied to validated product or project evidence.',
    ],
    [
      `Does this page mean ELIMFILTERS supplies the complete process equipment for ${technology.name}?`,
      'No. ELIMFILTERS Industrial & Process is centered on the validated filtration, separation or treatment media and replacement element. Housings, vessels, collectors, skids, pumps, fans, ductwork, controls and other process equipment are application context unless a separate ELIMFILTERS system scope is explicitly approved.',
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
  const url = `https://elimfilters.com${industrialProcessTechnologyUrl(platform.slug, technology.slug)}`;
  const faqs = faqItems(platform, technology);
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
    image: `https://elimfilters.com${technology.mediaImage}`,
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
  const videoSchema = technology.heroVideo ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${url}#hero-video`,
    name: `${technology.name} — ${technology.title}`,
    description: technology.summary,
    contentUrl: `https://elimfilters.com${technology.heroVideo}`,
    thumbnailUrl: [`https://elimfilters.com${technology.mediaImage}`],
    isPartOf: { '@id': `${url}#article` },
    publisher: { '@id': 'https://elimfilters.com/#organization' },
  } : null;
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${technology.name} Industrial & Process Application Assessment`)}`;
  const related = platform.technologies.filter((item) => item.slug !== technology.slug);

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {videoSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} /> : null}

      <section className={styles.hero} aria-labelledby="industrial-tech-title">
        {technology.heroVideo ? (
          <video
            className={styles.heroBackground}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
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
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>INDUSTRIAL &amp; PROCESS</Link><span>→</span>
          <Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>{platform.name}</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{technologyName(technology.name, technology.branded)}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{technology.branded ? 'FILTRATION TECHNOLOGY' : 'TREATMENT FAMILY'}</p>
          <h2 className={styles.displayTitle}>{technologyName(technology.name, technology.branded)}</h2>
          <p className={styles.applicationLine}><strong>{technology.title}</strong></p>
          <p className={styles.lead}>{technology.summary}</p>
          <p className={styles.bodyWide}>{technology.treatmentFunction}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>{technology.branded ? 'Technology:' : 'Treatment family:'}</span> {technologyName(technology.name, technology.branded)}</p>
                <p><span>Platform:</span> {platform.name} — {platform.descriptor}</p>
                <p><span>Engineering core:</span> {coreLabel(technology.technologyCore)}</p>
              </div>
              <p className={styles.eyebrow}>DESCRIPTION</p>
              <h3 className={styles.featureTitle}>{technology.title}</h3>
              <p className={styles.lead}>{technology.treatmentFunction}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img
                className={styles.mediaImage}
                src={technology.mediaImage}
                alt={`${technology.name} ${technology.title} filtration or treatment elements`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>Representative filtration, separation or treatment elements/media. Final element and media selection remains application-specific.</figcaption>
            </figure>
          </div>

          <div className={styles.twoColumnNotes}>
            {technology.mechanisms.map((item, index) => (
              <article className={styles.noteBlock} key={item}>
                <h3 className={styles.h3}>{String(index + 1).padStart(2, '0')} / {item}</h3>
                <p className={styles.body}>This mechanism is evaluated together with the operating envelope, contamination load, compatibility and required treatment outcome.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>OPERATING REALITY</p>
        <h2 className={styles.h2}>Treatment performance depends on the complete process boundary.</h2>
        <p className={styles.lead}>The filter, element, media, vessel or treatment device is only one part of the result. Flow, contaminant loading, pressure, temperature, chemistry, housing condition, drainage, sealing and upstream/downstream process behavior can materially change performance.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>A useful distinction</h3><p className={styles.body}>{technologyName(technology.name, technology.branded)} identifies a treatment function. It does not make every product or system inside that category technically interchangeable.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Evidence before claims</h3><p className={styles.body}>Efficiency, capacity, pressure drop, outlet quality, service interval and compatibility remain tied to validated product or project evidence.</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>ELIMFILTERS PRODUCT SCOPE</p>
        <h2 className={styles.h2}>Replacement treatment media and elements remain distinct from the surrounding equipment.</h2>
        <p className={styles.lead}>For this Industrial &amp; Process family, the ELIMFILTERS commercial focus is the validated filtration, separation or treatment medium and replaceable element appropriate to the application. Existing housings, vessels, collectors, skids, pumps, fans, ductwork, controls and other plant equipment define interfaces and operating conditions; they are not presented as ELIMFILTERS-manufactured equipment unless separately approved.</p>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION ENVIRONMENT</p>
        <h2 className={styles.h2}>Where {technologyName(technology.name, technology.branded)} belongs</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Application positions</h3><ul className={styles.list}>{technology.applications.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Conditions that change treatment duty</h3><ul className={styles.list}>{technology.conditions.map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Platform context</h3><ul className={styles.list}><li>{platform.name}</li><li>{platform.descriptor}</li><li>Industrial &amp; Process</li><li>Application-specific engineering validation</li></ul></div>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>SPECIFICATION &amp; SELECTION</p>
        <h2 className={styles.h2}>Questions before specifying {technology.title.toLowerCase()}</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Key engineering inputs</h3><ul className={styles.list}>{technology.selectionInputs.slice(0,4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>System compatibility</h3><ul className={styles.list}>{technology.selectionInputs.slice(4).map((x)=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Common selection errors</h3><ul className={styles.list}>{['Choosing by nominal category alone','Ignoring operating-envelope limits','Using unvalidated performance claims','Treating cross-reference as complete application validation'].map((x)=><li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className={styles.inlineCta}>
          <p><strong>Known project conditions?</strong> Send the operating data. <strong>Uncertain process or treatment path?</strong> Use the engineering review.</p>
          <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">TECHNICAL REVIEW</a></div>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>HOW THE SYSTEM BEHAVES</p>
        <h2 className={styles.h2}>Mechanism, loading and process conditions have to be resolved together.</h2>
        <p className={styles.lead}>{technology.treatmentFunction}</p>
        <div className={styles.twoColumnNotes}>
          {technology.mechanisms.map((item) => (
            <article className={styles.noteBlock} key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>Final design depends on the project operating window and the validated configuration selected for the application.</p></article>
          ))}
          <article className={styles.noteBlock}><h3 className={styles.h3}>Protected process outcome</h3><p className={styles.body}>The objective is controlled contamination or conditioning performance at the required process boundary—not simply installation of a familiar filter form.</p></article>
        </div>
      </div></section>

      {technology.subfamilies?.length ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>DESCRIPTIVE SUBFAMILIES</p>
          <h2 className={styles.h2}>{technologyName(technology.name, technology.branded)} includes distinct engineering paths.</h2>
          <div className={styles.editorialColumns}>
            {technology.subfamilies.map((item) => <div key={item}><h3 className={styles.h3}>{item}</h3><p className={styles.body}>Descriptive engineering subfamily beneath {technologyName(technology.name, technology.branded)}; it does not create an additional independent ELIMFILTERS technology mark.</p></div>)}
          </div>
        </div></section>
      ) : null}

      {technology.engineeringNotes?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>ENGINEERING GUIDANCE</p>
          <h2 className={styles.h2}>What matters in {technology.title.toLowerCase()}</h2>
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
        <p className={styles.eyebrow}>SERVICE &amp; DIAGNOSIS</p>
        <h2 className={styles.h2}>What abnormal treatment behavior may be telling you</h2>
        <ul className={`${styles.list} ${styles.serviceList}`}>{technology.serviceSignals.map((x)=><li key={x}>{x}</li>)}</ul>
        <div className={styles.inlineCta}><p>Repeated breakthrough, pressure-drop problems, unstable outlet quality or short service intervals justify reviewing the whole process boundary.</p><a href={inquiryHref} data-conversion-action="application-support">REQUEST PROCESS REVIEW</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>QUESTIONS FROM THE FIELD</p>
        <h2 className={styles.h2}>Direct answers before an Industrial &amp; Process selection.</h2>
        <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>STANDARDS &amp; TEST GOVERNANCE</p>
          <h2 className={styles.h2}>Applicable standards and test methods</h2>
          <p className={styles.lead}>The standards below are resolved from the governed ELIMFILTERS Knowledge Center for this treatment family. Applicability remains product-, fluid-, contaminant- and duty-specific.</p>
          <ul className={`${styles.list} ${styles.serviceList}`}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>A listed standard identifies a relevant engineering or verification method. It does not mean every {technology.name} element is certified, qualified or tested to every listed method. Product claims require the corresponding validated test evidence.</p>
          {technology.knowledgeCenterSlug ? <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>OPEN GOVERNED STANDARD CONTEXT →</Link></div> : null}
        </div></section>
      ) : null}

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>TECHNICAL BASIS</p>
        <h2 className={styles.h2}>Technical reference and claim governance</h2>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Engineering core</h3><p className={styles.body}>{coreLabel(technology.technologyCore)} remains the mechanism-level engineering identifier behind the customer-facing family.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Claim governance</h3><p className={styles.body}>No universal efficiency, capacity, micron rating, separation percentage, service-life multiplier or outlet-quality value is assigned across {technologyName(technology.name, technology.branded)} without validated evidence for the specific product or project.</p></article>
          {technology.knowledgeCenterSlug ? (
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>Canonical Knowledge Center reference</h3>
              <p className={styles.body}>Approved engineering relationships, operating conditions and diagnostic guidance for {technologyName(technology.name, technology.branded)} are maintained in the governed ELIMFILTERS Knowledge Center.</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${technology.knowledgeCenterSlug}/`}>OPEN ENGINEERING REFERENCE →</Link></div>
            </article>
          ) : null}
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>WHEN A TECHNICAL REVIEW MAKES SENSE</p>
        <h2 className={styles.h2}>When the treatment problem is larger than the element itself</h2>
        <p className={styles.lead}>Repeated failures, unstable process quality, short service intervals, unexpected pressure drop, contamination breakthrough or uncertain compatibility justify reviewing the complete operating environment and treatment architecture.</p>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>PLATFORM INTEGRATION</p>
        <h2 className={styles.h2}>{platform.name} — {platform.descriptor}</h2>
        <div className={styles.systemGrid}>
          <div><p className={styles.lead}>{platform.summary}</p><Link className={styles.systemButton} href={industrialProcessPlatformUrl(platform.slug)}>EXPLORE PLATFORM</Link></div>
          <p className={styles.bodyWide}>{technologyName(technology.name, technology.branded)} is resolved inside the {platform.name} platform. Final selection connects the treatment mechanism to operating conditions, contamination load, compatibility, required outcome and validated product evidence.</p>
        </div>
      </div></section>

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION SUPPORT</p>
        <h2 className={styles.h2}>Bring us the process conditions and required outcome — not just a generic filter description.</h2>
        <p className={styles.lead}>Industrial &amp; Process projects are qualified by duty, operating envelope, contamination mechanism, process risk and system compatibility before the physical solution is selected.</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>EXPLORE RELATED TECHNOLOGIES</p>
        <h2 className={styles.h2}>Continue within {platform.name}.</h2>
        <div className={styles.editorialColumns}>
          {related.slice(0,3).map((item) => (
            <div key={item.slug}><h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug,item.slug)} style={{color:'#fff',textDecoration:'none'}}>{technologyName(item.name, item.branded)}</Link></h3><p className={styles.body}>{item.title}</p></div>
          ))}
          {related.length === 0 ? <div><h3 className={styles.h3}><Link href={industrialProcessPlatformUrl(platform.slug)} style={{color:'#fff',textDecoration:'none'}}>Back to {platform.name}</Link></h3><p className={styles.body}>Review the platform context and engineering qualification path.</p></div> : null}
        </div>
      </div></section>
    </main>
  );
}
