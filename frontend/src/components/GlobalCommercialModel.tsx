import Link from 'next/link';
import type { CSSProperties } from 'react';

type Props = {
  variant?: 'about' | 'distributors';
};

const OPERATING_CHAIN = [
  {
    step: '01',
    eyebrow: 'ENGINEERING',
    title: 'German-Developed Filtration Media',
    body: 'ELIMFILTERS formulated filtration media are developed in Germany around defined performance targets, application requirements, material behavior, and contamination-control objectives.',
  },
  {
    step: '02',
    eyebrow: 'MANUFACTURING',
    title: 'Qualified PRC Production Capacity',
    body: 'Production is executed through selected manufacturing partners in the People’s Republic of China (PRC), chosen for specialized filtration capability, scalable industrial infrastructure, and integration with mature automotive and heavy-duty supply chains.',
  },
  {
    step: '03',
    eyebrow: 'VALIDATION',
    title: 'Performance, Resistance & Durability',
    body: 'Validation is matched to product family and application. Where applicable, protocols may include efficiency, pressure drop, contaminant holding capacity, flow, media tensile strength, pleat integrity, dimensional stability, burst or collapse resistance, cyclic pressure endurance, seal integrity, temperature resistance, material compatibility, and water-separation performance.',
  },
  {
    step: '04',
    eyebrow: 'INTELLIGENCE',
    title: 'AI-Assisted Product Auditing',
    body: 'AI-assisted systems review production and product data for inconsistencies, deviations, anomalous patterns, traceability signals, and documentation gaps. Physical validation and accountable human quality oversight remain mandatory.',
  },
  {
    step: '05',
    eyebrow: 'EFFICIENCY',
    title: 'A Leaner Operating Structure',
    body: 'A technology-enabled, horizontal operating structure reduces unnecessary administrative layers and structural overhead so more resources can remain focused on engineering, materials, manufacturing quality, product intelligence, supply-chain efficiency, and partner value.',
  },
  {
    step: '06',
    eyebrow: 'PARTNERSHIP',
    title: 'Value Reaches the Local Market',
    body: 'Commercial partners contribute local relationships, inventory strategy, technical sales, regional service, and market knowledge. ELIMFILTERS contributes product architecture, quality governance, cross-reference intelligence, technical resources, and scalable product access.',
  },
];

const PARTNER_OUTCOMES = [
  ['Competitive Landed Economics', 'Efficiency is designed into the operating model so avoidable overhead does not unnecessarily inflate the product by the time it reaches the market.'],
  ['Sustainable Partner Margin', 'The system is designed to preserve value through the supply chain rather than optimize only factory-level product cost.'],
  ['Technical Confidence', 'Engineering, validation, traceability, and product intelligence give partners a stronger technical foundation for the sale.'],
  ['Market Flexibility', 'Partners can serve industrial, heavy-duty, fleet, equipment, and complementary automotive / Light Duty demand according to their territory.'],
  ['Customer Continuity', 'Local relationships, availability, technical support, and asset knowledge are treated as long-term commercial assets.'],
  ['Lifecycle Value', 'Product quality, correct application, availability, technical intelligence, and competitive economics work together to reduce total operating risk.'],
];

export function GlobalCommercialModel({ variant = 'about' }: Props) {
  const isDistributor = variant === 'distributors';

  return (
    <>
      <section style={section}>
        <div style={wrap}>
          <p style={eyebrow}>{isDistributor ? 'WHY THE ELIMFILTERS MODEL MATTERS TO PARTNERS' : 'A DIFFERENT INDUSTRIAL MODEL'}</p>
          <h2 style={title}>
            {isDistributor
              ? 'Built to Put More Value Into the Product — and More Opportunity Into the Partnership.'
              : 'A Global Operating Model Designed Around Product Quality, Efficiency and Partner Value.'}
          </h2>
          <p style={lead}>
            ELIMFILTERS is not organized around the idea that one manufacturing country defines product quality. The model separates each capability deliberately: media development, specialized manufacturing, physical validation, product intelligence, operational efficiency, and local commercial execution. Together, these layers are designed to create a stronger product and a stronger business proposition for our partners.
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
              <p style={eyebrow}>WHY PRC?</p>
              <h3 style={panelTitle}>Because manufacturing capability matters more than geography alone.</h3>
            </div>
            <p style={{ ...body, margin: 0 }}>
              ELIMFILTERS selected qualified manufacturing partners in the People’s Republic of China for established industrial infrastructure, specialized filtration-manufacturing capability, scalable production capacity, and access to mature automotive and heavy-duty supply chains. The intent is not to manufacture at the lowest possible cost; it is to combine capable production with ELIMFILTERS-defined specifications, quality controls, validation requirements, and technical governance.
            </p>
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <p style={eyebrow}>BUILT AROUND OUR PARTNERS</p>
          <div style={twoCol}>
            <div>
              <h2 style={title}>The Efficiency of the Company Should Become Value for the Partner.</h2>
            </div>
            <div>
              <p style={lead}>
                ELIMFILTERS uses AI-enabled processes and a lean organizational structure to reduce unnecessary administrative weight, not to remove accountability. Qualified personnel remain responsible for manufacturing oversight, quality assurance, evidence review, and critical technical decisions.
              </p>
              <p style={body}>
                The commercial intention is clear: avoidable corporate overhead should not unnecessarily increase the landed cost of the product. Resources should remain concentrated on engineering, materials, manufacturing quality, intelligence, availability, and the commercial partner’s ability to compete and grow locally.
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
