import Link from 'next/link';
import type { CSSProperties } from 'react';

type Props = {
  variant?: 'about' | 'distributors';
};

const OPERATING_CHAIN = [
  {
    step: '01',
    eyebrow: 'GERMANY',
    title: 'Media Engineering & Development',
    body: 'ELIMFILTERS formulated filtration media are developed in Germany around defined performance targets, application requirements, material behavior, durability objectives, and contamination-control needs.',
  },
  {
    step: '02',
    eyebrow: 'PRC',
    title: 'Qualified Manufacturing Partners',
    body: 'Production is executed through selected manufacturing partners in the People’s Republic of China (PRC), chosen for specialized filtration capability, scalable industrial infrastructure, and integration with mature automotive and heavy-duty supply chains.',
  },
  {
    step: '03',
    eyebrow: 'PHYSICAL VALIDATION',
    title: 'Performance, Resistance & Durability',
    body: 'Validation is matched to product family and application. Where applicable, protocols may include efficiency, pressure drop, contaminant holding capacity, flow performance, media tensile strength, pleat integrity, dimensional stability, burst or collapse resistance, cyclic pressure endurance, seal integrity, temperature resistance, material compatibility, and water-separation performance.',
  },
  {
    step: '04',
    eyebrow: 'AI-ASSISTED AUDITING',
    title: 'Consistency, Deviations & Traceability',
    body: 'AI-assisted systems review production and product data for inconsistencies, deviations, anomalous patterns, traceability signals, and documentation gaps. Physical validation and accountable human quality oversight remain part of the control system.',
  },
  {
    step: '05',
    eyebrow: 'HORIZONTAL OPERATING MODEL',
    title: 'Agents Reduce Repetitive Structural Work',
    body: 'ELIMFILTERS uses AI agents for repetitive, rules-based and data-intensive operational work that would traditionally require additional administrative layers. This creates a more horizontal organization and reduces structural cost without reducing engineering, material, manufacturing, validation, or quality requirements.',
  },
  {
    step: '06',
    eyebrow: 'COMMERCIAL PARTNER',
    title: 'Efficiency Becomes Commercial Value',
    body: 'The efficiency created upstream is carried into the product economics and partner relationship. Commercial partners add local relationships, inventory strategy, technical sales, regional service, and market knowledge while ELIMFILTERS provides product architecture, quality governance, intelligence, and scalable product access.',
  },
];

const PARTNER_OUTCOMES = [
  ['Structural Efficiency', 'The economic difference is created by a more horizontal operating structure, not by positioning ELIMFILTERS as a low-price product.'],
  ['Sustainable Partner Margin', 'Lower repetitive-process and administrative burden reduces direct structural cost and helps preserve economic value for the authorized commercial partner.'],
  ['Technical Confidence', 'Engineering, validation, traceability, and product intelligence give partners a stronger technical foundation for customer decisions.'],
  ['Market Flexibility', 'Partners can serve industrial, heavy-duty, fleet, equipment, and complementary automotive / Light Duty demand according to their territory.'],
  ['Customer Continuity', 'Local relationships, availability, technical support, and asset knowledge are treated as long-term commercial assets.'],
  ['Lifecycle Value', 'Product quality, correct application, availability, technical intelligence, and sound economics work together to reduce total operating risk.'],
];

export function GlobalCommercialModel({ variant = 'about' }: Props) {
  const isDistributor = variant === 'distributors';

  return (
    <>
      <section style={section}>
        <div style={wrap}>
          <p style={eyebrow}>{isDistributor ? 'THE ELIMFILTERS GLOBAL MODEL' : 'GLOBAL ENGINEERING & MANUFACTURING MODEL'}</p>
          <h2 style={title}>
            {isDistributor
              ? 'Engineering, Manufacturing, Validation and Intelligence — Structured to Create More Value for the Partner.'
              : 'German-Developed Media. Qualified PRC Manufacturing. ELIMFILTERS Quality Governance.'}
          </h2>
          <p style={lead}>
            ELIMFILTERS was built around a deliberate global architecture. Filtration-media development is carried out in Germany. Manufacturing is executed through qualified partners in the PRC. Product performance is supported through defined physical validation protocols, while AI-assisted auditing strengthens consistency, traceability, and control. A horizontal operating structure uses AI agents to reduce repetitive organizational work and the structural cost attached to it.
          </p>

          <div style={grid}>
            {OPERATING_CHAIN.map((item) => (
              <article key={item.step} style={card}>
                <div style={topline}>
                  <span style={number}>{item.step}</span>
                  <span style={cardEyebrow}>{item.eyebrow}</span>
                </div>
                <h3 style={cardTitle}>{item.title}</h3>
                <p style={body}>{item.body}</p>
              </article>
            ))}
          </div>

          <div style={prcPanel}>
            <div>
              <p style={eyebrow}>PRC MANUFACTURING STRATEGY</p>
              <h3 style={panelTitle}>Specialized capacity, scale and industrial depth.</h3>
            </div>
            <p style={{ ...body, margin: 0 }}>
              ELIMFILTERS selected qualified manufacturing partners in the People’s Republic of China for established industrial infrastructure, specialized filtration-manufacturing capability, scalable production capacity, and access to mature automotive and heavy-duty supply chains. Production operates within ELIMFILTERS-defined specifications, quality controls, validation requirements, and technical governance.
            </p>
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <p style={eyebrow}>HORIZONTAL OPERATIONS · PARTNER VALUE</p>
          <div style={twoCol}>
            <div>
              <h2 style={title}>A Different Cost Structure — Not a Low-Price Strategy.</h2>
            </div>
            <div>
              <p style={lead}>
                Traditional organizations often carry multiple vertical layers to coordinate repetitive administrative and operational work. ELIMFILTERS uses AI agents to execute a significant portion of those repeatable processes, allowing the organization to remain more horizontal while qualified personnel supervise manufacturing, quality, technical governance, and critical decisions.
              </p>
              <p style={body}>
                The result is a structurally more efficient product cost. The difference does not come from lowering engineering standards, materials, manufacturing controls, or validation requirements. It comes from reducing the organizational cost attached to repetitive work and unnecessary vertical layers — allowing more of the economics to remain in the product, the supply chain, and the commercial partnership.
              </p>
            </div>
          </div>

          <div style={outcomeGrid}>
            {PARTNER_OUTCOMES.map(([heading, description], index) => (
              <article key={heading} style={outcomeCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={outcomeTitle}>{heading}</h3>
                <p style={body}>{description}</p>
              </article>
            ))}
          </div>

          <div style={marketPanel}>
            <div>
              <p style={eyebrow}>MARKET SCOPE</p>
              <h3 style={panelTitle}>Heavy Duty leads. Automotive expands commercial reach.</h3>
            </div>
            <div>
              <p style={{ ...body, marginTop: 0 }}>
                ELIMFILTERS primarily focuses on industrial, heavy-duty, fleet, and equipment applications. Automotive / Light Duty remains an important complementary line that supports recurring demand, distributor economics, catalog breadth, regional reach, and commercial intelligence.
              </p>
              <p style={{ ...body, marginBottom: 0 }}>
                The governing commercial architecture remains unchanged: Heavy Duty receives 80% of strategic resources and Light Duty / Automotive 20%.
              </p>
            </div>
          </div>

          {isDistributor && (
            <div style={ctaRow}>
              <div>
                <p style={eyebrow}>COMMERCIAL PARTNERSHIP</p>
                <h3 style={panelTitle}>ELIMFILTERS builds the platform. Our partners build the market.</h3>
              </div>
              <Link href="/distributor-application" style={button}>APPLY FOR REVIEW</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.22)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const partnerSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,241,45,0.16)',
  background: 'rgba(255,241,45,0.02)',
};
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700,
  letterSpacing: '0.18em', margin: '0 0 1rem', textTransform: 'uppercase',
};
const title: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.7rem)', lineHeight: 0.96,
  letterSpacing: '-0.025em', margin: 0, textTransform: 'uppercase', maxWidth: '1040px',
};
const lead: CSSProperties = {
  color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)',
  lineHeight: 1.72, fontWeight: 600, maxWidth: '900px', margin: '1.7rem 0 0',
};
const body: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '0.98rem', lineHeight: 1.72 };
const grid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const card: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)',
  padding: '1.5rem', minHeight: '315px',
};
const topline: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' };
const number: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
};
const cardEyebrow: CSSProperties = {
  color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.67rem', textAlign: 'right',
};
const cardTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.45rem', lineHeight: 1.05,
  letterSpacing: '-0.03em', margin: '2.4rem 0 0', textTransform: 'uppercase',
};
const prcPanel: CSSProperties = {
  marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', border: '1px solid rgba(255,241,45,0.22)', background: 'rgba(255,241,45,0.035)', padding: '1.7rem',
};
const panelTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.7vw, 2.6rem)', lineHeight: 1,
  letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase',
};
const twoCol: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 6vw, 5rem)',
};
const outcomeGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const outcomeCard: CSSProperties = {
  borderTop: '1px solid rgba(255,241,45,0.32)', padding: '1.4rem 0.3rem 0', minHeight: '210px',
};
const outcomeTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.08,
  letterSpacing: '-0.025em', margin: '1rem 0 0', textTransform: 'uppercase',
};
const marketPanel: CSSProperties = {
  marginTop: '2.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)',
};
const ctaRow: CSSProperties = {
  marginTop: '2.4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem',
  border: '1px solid rgba(255,241,45,0.22)', padding: '1.6rem', background: 'rgba(0,0,0,0.4)',
};
const button: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
};
