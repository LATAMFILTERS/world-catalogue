import Link from 'next/link';
import { PageHeader } from './PageHeader';

export type MiningEngineeringSection = {
  eyebrow: string;
  title: string;
  intro?: string;
  points?: { title: string; text: string }[];
};

export type MiningEngineeringFaq = { q: string; a: string };

export function MiningEngineeringArticle({
  title,
  accentTitle,
  lead,
  sections,
  faq,
  related,
  schema,
}: {
  title: string;
  accentTitle: string;
  lead: string;
  sections: MiningEngineeringSection[];
  faq: MiningEngineeringFaq[];
  related: { href: string; label: string; description: string }[];
  schema: Record<string, unknown>;
}) {
  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Knowledge Center" />

      <section style={hero}>
        <div style={wide}>
          <Link href="/knowledge-center/engineering/" style={backLink}>← ENGINEERING</Link>
          <p style={eyebrow}>MINING / ENGINEERING REFERENCE</p>
          <h1 style={heroTitle}>{title}<br /><span style={accent}>{accentTitle}</span></h1>
          <p style={heroLead}>{lead}</p>
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={section.title} style={index % 2 ? sectionAlt : sectionStyle}>
          <div style={twoCol}>
            <div>
              <p style={eyebrow}>{section.eyebrow}</p>
              <h2 style={sectionTitle}>{section.title}</h2>
            </div>
            <div>
              {section.intro && <p style={leadText}>{section.intro}</p>}
              {section.points && (
                <div style={pointList}>
                  {section.points.map((point, pointIndex) => (
                    <article key={point.title} style={pointRow}>
                      <span style={pointNumber}>{String(pointIndex + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 style={pointTitle}>{point.title}</h3>
                        <p style={bodyText}>{point.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      <section style={relatedSection} aria-labelledby="related-mining-engineering">
        <div style={wide}>
          <p style={eyebrow}>RELATED MINING ENGINEERING</p>
          <h2 id="related-mining-engineering" style={sectionTitle}>Continue through the contamination-control decision.</h2>
          <div style={relatedGrid}>
            {related.map((item) => (
              <Link key={item.href} href={item.href} style={relatedCard}>
                <strong style={relatedTitle}>{item.label}</strong>
                <span style={relatedDescription}>{item.description}</span>
                <span style={relatedCta}>READ ENGINEERING GUIDE →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="mining-engineering-faq">
        <div style={wide}>
          <p style={eyebrow}>TECHNICAL QUESTIONS</p>
          <h2 id="mining-engineering-faq" style={sectionTitle}>Questions maintenance and reliability teams ask.</h2>
          <div style={faqList}>
            {faq.map((item, index) => (
              <article key={item.q} style={faqItem}>
                <span style={faqNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style={faqQuestion}>{item.q}</h3>
                  <p style={bodyText}>{item.a}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <div style={ctaGrid}>
          <div>
            <p style={eyebrow}>APPLY THE ENGINEERING REFERENCE</p>
            <h2 style={ctaTitle}>Connect the failure mechanism to the protected system.</h2>
            <p style={ctaText}>Provide the machine, protected system, contamination source, duty cycle and any known OEM or filter reference.</p>
          </div>
          <div style={ctaActions}>
            <Link href="/contact/" data-conversion-action="application-support" style={yellowButton}>REQUEST APPLICATION SUPPORT</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={darkButton}>SEARCH PRODUCT INTELLIGENCE</a>
            <Link href="/industries/mining/" style={textLink}>RETURN TO MINING →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const display = 'var(--font-display)';
const body = 'var(--font-body)';
const main = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: body, overflowX: 'hidden' } as const;
const wide = { maxWidth: '1180px', margin: '0 auto' } as const;
const hero = { padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.08)', background: 'radial-gradient(circle at 82% 12%, rgba(255,241,45,.13), transparent 34%), #020202' } as const;
const backLink = { display: 'inline-block', color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontFamily: display, fontSize: '.7rem', letterSpacing: '.12em', marginBottom: '2rem' } as const;
const eyebrow = { fontFamily: display, color: '#FFF12D', fontSize: '.7rem', letterSpacing: '.18em', fontWeight: 700, margin: '0 0 1rem', textTransform: 'uppercase' } as const;
const heroTitle = { fontFamily: display, fontSize: 'clamp(2.9rem,6.7vw,6.2rem)', lineHeight: .91, letterSpacing: '-.05em', textTransform: 'uppercase', margin: 0, maxWidth: '1080px' } as const;
const accent = { color: '#FFF12D' } as const;
const heroLead = { fontSize: 'clamp(1.08rem,2vw,1.42rem)', lineHeight: 1.65, color: 'rgba(255,255,255,.8)', maxWidth: '880px', margin: '1.8rem 0 0' } as const;
const sectionStyle = { padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' } as const;
const sectionAlt = { ...sectionStyle, background: '#050505' } as const;
const twoCol = { ...wide, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 'clamp(2.5rem,7vw,6rem)', alignItems: 'start' } as const;
const sectionTitle = { fontFamily: display, fontSize: 'clamp(2.1rem,4.5vw,4rem)', lineHeight: .98, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 } as const;
const leadText = { fontSize: 'clamp(1.05rem,1.7vw,1.32rem)', lineHeight: 1.68, fontWeight: 600, color: 'rgba(255,255,255,.84)', margin: '0 0 1.4rem' } as const;
const bodyText = { fontSize: '.97rem', lineHeight: 1.75, color: 'rgba(255,255,255,.65)', margin: 0, textAlign: 'left' } as const;
const pointList = { borderTop: '1px solid rgba(255,255,255,.13)' } as const;
const pointRow = { display: 'grid', gridTemplateColumns: '46px minmax(0,1fr)', gap: '1rem', padding: '1.35rem 0', borderBottom: '1px solid rgba(255,255,255,.13)' } as const;
const pointNumber = { fontFamily: display, color: '#FFF12D', fontSize: '.66rem', letterSpacing: '.1em', paddingTop: '.2rem' } as const;
const pointTitle = { fontFamily: display, fontSize: '1.08rem', textTransform: 'uppercase', margin: '0 0 .55rem' } as const;
const relatedSection = { padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: 'linear-gradient(180deg,#050505,#020202)' } as const;
const relatedGrid = { marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' } as const;
const relatedCard = { background: '#050505', padding: '1.6rem', minHeight: '190px', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', flex: '1 1 250px', minWidth: 0 } as const;
const relatedTitle = { fontFamily: display, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase' } as const;
const relatedDescription = { color: 'rgba(255,255,255,.62)', lineHeight: 1.55, marginTop: '.8rem', fontSize: '.9rem' } as const;
const relatedCta = { marginTop: 'auto', paddingTop: '1.2rem', fontFamily: display, fontSize: '.62rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.78)' } as const;
const faqSection = { ...sectionStyle, background: '#070707' } as const;
const faqList = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.13)' } as const;
const faqItem = { display: 'grid', gridTemplateColumns: '52px minmax(0,1fr)', gap: '1.2rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.13)' } as const;
const faqNumber = { fontFamily: display, color: '#FFF12D', fontSize: '.68rem', letterSpacing: '.1em', paddingTop: '.2rem' } as const;
const faqQuestion = { fontFamily: display, fontSize: 'clamp(1.02rem,1.8vw,1.28rem)', lineHeight: 1.25, margin: '0 0 .65rem' } as const;
const ctaSection = { padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderTop: '1px solid rgba(255,241,45,.16)' } as const;
const ctaGrid = { ...wide, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 'clamp(2.5rem,7vw,6rem)', alignItems: 'center' } as const;
const ctaTitle = { ...sectionTitle, fontSize: 'clamp(2.2rem,4.8vw,4.4rem)' } as const;
const ctaText = { ...bodyText, fontSize: '1.02rem', maxWidth: '720px', marginTop: '1.3rem' } as const;
const ctaActions = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '.9rem' } as const;
const yellowButton = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: display, fontWeight: 700, letterSpacing: '.08em', fontSize: '.72rem', padding: '1rem 1.2rem' } as const;
const darkButton = { ...yellowButton, background: 'transparent', color: '#FFF12D', border: '1px solid rgba(255,241,45,.42)' } as const;
const textLink = { color: 'rgba(255,255,255,.58)', textDecoration: 'none', fontFamily: display, fontSize: '.68rem', letterSpacing: '.1em', marginTop: '.4rem' } as const;
