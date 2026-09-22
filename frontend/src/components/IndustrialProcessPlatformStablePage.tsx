import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import {
  type IndustrialProcessPlatform,
  industrialProcessTechnologyUrl,
} from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

export function IndustrialProcessPlatformStablePage({ platform }: { platform: IndustrialProcessPlatform }) {
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${platform.name} Industrial & Process Platform Review`)}`;
  const canonicalKnowledge = platform.knowledgeCenterSlug ? getCanonicalKnowledgeBySlug(platform.knowledgeCenterSlug) : null;
  const standards = canonicalKnowledge?.standards ?? [];

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
          <Link href="/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>HOME</Link><span>→</span>
          <Link href="/industrial-process/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>INDUSTRIAL &amp; PROCESS</Link><span>→</span>
          <span style={{color:'#fff12d'}}>{platform.name}</span>
        </div>
      </nav>

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>COMMERCIAL TECHNOLOGY PLATFORM</p>
          <h2 className={styles.displayTitle}>{platform.name}</h2>
          <p className={styles.applicationLine}><strong>{platform.descriptor}</strong></p>
          <p className={styles.lead}>{platform.summary}</p>
          <p className={styles.bodyWide}>{platform.positioning ?? 'The platform groups validated Industrial & Process treatment families by engineering function. Select the treatment mechanism first; product and system configuration follow the operating conditions and required outcome.'}</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaCopy}>
              <div className={styles.metaStack}>
                <p><span>Platform:</span> {platform.name}</p>
                <p><span>Domain:</span> {platform.descriptor}</p>
                <p><span>Division:</span> Industrial &amp; Process</p>
              </div>
              <p className={styles.eyebrow}>PLATFORM ROLE</p>
              <h3 className={styles.featureTitle}>Navigate by treatment function.</h3>
              <p className={styles.lead}>{platform.summary}</p>
            </div>
            <figure className={styles.mediaFigure}>
              <img className={styles.mediaImage} src={platform.mediaImage ?? platform.heroImage} alt={`${platform.descriptor} industrial application context`} />
              <figcaption>Representative industrial application context. Final solution remains project-specific.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {platform.selectionGuide?.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>{platform.selectionContext?.eyebrow ?? 'TREATMENT SCOPE'}</p>
          <h2 className={styles.h2}>{platform.selectionContext?.title ?? 'Match the process problem to the treatment path.'}</h2>
          <p className={styles.lead}>{platform.selectionContext?.lead ?? `${platform.name} organizes the available treatment mechanisms so selection begins with the actual process condition, contaminant behavior and required outcome.`}</p>
          <div className={styles.editorialColumns}>
            {platform.selectionGuide.map((item) => (
              <div key={item.technologySlug}>
                <h3 className={styles.h3}>{item.title}</h3>
                <p className={styles.body}>{item.body}</p>
                <div className={styles.textLinks}>
                  <Link href={industrialProcessTechnologyUrl(platform.slug, item.technologySlug)}>EXPLORE TREATMENT PATH →</Link>
                </div>
              </div>
            ))}
          </div>
        </div></section>
      ) : null}

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>TECHNOLOGY FAMILIES</p>
        <h2 className={styles.h2}>Select the treatment mechanism.</h2>
        <div className={styles.editorialColumns}>
          {platform.technologies.map((technology) => (
            <div key={technology.slug}>
              <h3 className={styles.h3}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)} style={{color:'#fff',textDecoration:'none'}}>{technology.name}</Link></h3>
              <p className={styles.body}><strong style={{color:'#fff'}}>{technology.title}</strong></p>
              <p className={styles.body}>{technology.summary}</p>
              <div className={styles.textLinks}><Link href={industrialProcessTechnologyUrl(platform.slug, technology.slug)}>EXPLORE TECHNOLOGY →</Link></div>
            </div>
          ))}
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>OPERATING REALITY</p>
        <h2 className={styles.h2}>Industrial treatment starts with the process problem.</h2>
        <p className={styles.lead}>Flow, pressure, temperature, chemistry, contaminant form, duty cycle, compatibility, existing equipment and required outlet condition determine which treatment family and physical configuration belong in the project.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Platform first</h3><p className={styles.body}>{platform.name} narrows the project to the correct treatment universe without forcing an early product choice.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>Technology second</h3><p className={styles.body}>The family page defines the mechanism, application context and evidence required before product or system specification.</p></article>
        </div>
      </div></section>

      <section className={styles.band}><div className={styles.inner}>
        <p className={styles.eyebrow}>ELIMFILTERS PRODUCT SCOPE</p>
        <h2 className={styles.h2}>The treatment element is the product. Process equipment is the application context.</h2>
        <p className={styles.lead}>ELIMFILTERS Industrial &amp; Process is centered on validated filtration, separation and treatment media and replacement elements. Housings, pressure vessels, collectors, skids, pumps, fans, ductwork, controls and other process equipment shown or referenced on these pages remain application context unless a separate ELIMFILTERS system scope is explicitly approved.</p>
        <div className={styles.twoColumnNotes}>
          <article className={styles.noteBlock}><h3 className={styles.h3}>What ELIMFILTERS defines</h3><p className={styles.body}>The page defines the treatment mechanism, replaceable media or element function, operating inputs, interface requirements and evidence needed to qualify the application.</p></article>
          <article className={styles.noteBlock}><h3 className={styles.h3}>What is not implied</h3><p className={styles.body}>Showing or discussing a collector, vessel, skid, air handler, purifier, membrane train or other plant equipment does not represent that equipment as an ELIMFILTERS-manufactured product.</p></article>
        </div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>ENGINEERING QUALIFICATION</p>
        <h2 className={styles.h2}>What must be known before a treatment architecture is selected.</h2>
        <div className={styles.editorialColumns}>
          {(platform.qualificationGroups ?? [
            { title: 'Process', items: ['Fluid, gas, air or water composition','Flow rate and duty profile','Operating and design pressure','Temperature range'] },
            { title: 'Contamination', items: ['Contaminant type and concentration','Loading pattern and variability','Required removal or treatment objective','Upstream and downstream process sensitivity'] },
            { title: 'Integration', items: ['Materials and chemical compatibility','Existing housing, vessel or skid','Connections and installation envelope','Required outlet quality and verification method'] },
          ]).map((group) => (
            <div key={group.title}>
              <h3 className={styles.h3}>{group.title}</h3>
              <ul className={styles.list}>{group.items.map((x)=><li key={x}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div></section>

      {standards.length ? (
        <section className={styles.bandAlt}><div className={styles.inner}>
          <p className={styles.eyebrow}>STANDARDS &amp; TEST GOVERNANCE</p>
          <h2 className={styles.h2}>Standards that govern this platform</h2>
          <p className={styles.lead}>This platform inherits the applicable ISO, ASTM and other validated test methods maintained in its canonical Knowledge Center record. Individual family pages narrow the list to the actual element or treatment mechanism.</p>
          <ul className={styles.list}>{standards.map((standard)=><li key={standard}>{standard}</li>)}</ul>
          <p className={styles.bodyWide}>A standard is applied only within its published scope and the validated product duty. Listing it here is not a blanket certification claim for every ELIMFILTERS element in the platform.</p>
        </div></section>
      ) : null}

      {platform.knowledgeCenterSlug ? (
        <section className={styles.band}><div className={styles.inner}>
          <p className={styles.eyebrow}>TECHNICAL BASIS</p>
          <h2 className={styles.h2}>Governed platform engineering reference</h2>
          <div className={styles.twoColumnNotes}>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>Canonical Knowledge Center reference</h3>
              <p className={styles.body}>Approved treatment relationships, operating conditions and diagnostic guidance for {platform.name} are maintained in the governed ELIMFILTERS Knowledge Center.</p>
              <div className={styles.textLinks}><Link href={`/knowledge-center/canonical/${platform.knowledgeCenterSlug}/`}>OPEN ENGINEERING REFERENCE →</Link></div>
            </article>
            <article className={styles.noteBlock}>
              <h3 className={styles.h3}>Evidence before claims</h3>
              <p className={styles.body}>Numeric performance, capacity, pressure-drop, service-life and outlet-condition claims remain tied to validated product or project evidence.</p>
            </article>
          </div>
        </div></section>
      ) : null}

      <section className={styles.ctaSection}><div className={styles.inner}>
        <p className={styles.eyebrow}>APPLICATION SUPPORT</p>
        <h2 className={styles.h2}>Bring us the operating conditions. We resolve the treatment architecture.</h2>
        <p className={styles.lead}>Industrial &amp; Process projects are qualified by duty, operating envelope, contamination mechanism, process risk and compatibility before the physical solution is selected.</p>
        <div className={styles.buttonRow}><a className={styles.primaryButton} href={inquiryHref} data-conversion-action="application-support">TECHNICAL REVIEW PATH</a></div>
      </div></section>

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>EXPLORE INDUSTRIAL &amp; PROCESS</p>
        <h2 className={styles.h2}>Return to the five commercial technology platforms.</h2>
        <div className={styles.textLinks}><Link href="/industrial-process/">INDUSTRIAL &amp; PROCESS HOME →</Link></div>
      </div></section>
    </main>
  );
}
