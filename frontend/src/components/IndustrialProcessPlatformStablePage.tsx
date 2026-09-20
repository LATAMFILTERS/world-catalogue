import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import {
  type IndustrialProcessPlatform,
  industrialProcessTechnologyUrl,
} from '@/lib/industrial-process-architecture';

export function IndustrialProcessPlatformStablePage({ platform }: { platform: IndustrialProcessPlatform }) {
  const inquiryHref = `mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${platform.name} Industrial & Process Platform Review`)}`;

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="industrial-platform-title">
        <img className={styles.heroBackground} src={platform.heroImage} alt="" aria-hidden="true" />
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
          <p className={styles.bodyWide}>The platform groups validated Industrial &amp; Process treatment families by engineering function. Select the treatment mechanism first; product and system configuration follow the operating conditions and required outcome.</p>

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

      <section className={styles.bandAlt}><div className={styles.inner}>
        <p className={styles.eyebrow}>ENGINEERING QUALIFICATION</p>
        <h2 className={styles.h2}>What must be known before a treatment architecture is selected.</h2>
        <div className={styles.editorialColumns}>
          <div><h3 className={styles.h3}>Process</h3><ul className={styles.list}>{['Fluid, gas, air or water composition','Flow rate and duty profile','Operating and design pressure','Temperature range'].map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Contamination</h3><ul className={styles.list}>{['Contaminant type and concentration','Loading pattern and variability','Required removal or treatment objective','Upstream and downstream process sensitivity'].map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3 className={styles.h3}>Integration</h3><ul className={styles.list}>{['Materials and chemical compatibility','Existing housing, vessel or skid','Connections and installation envelope','Required outlet quality and verification method'].map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
      </div></section>

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
