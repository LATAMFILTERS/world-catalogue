import type { CSSProperties } from 'react';

const STEPS = [
  {
    label: 'Ambient Air',
    detail: 'Air entering the intake system, carrying airborne particulate contamination.',
  },
  {
    label: 'Filtration Media & Seal Boundary',
    detail: 'MACROCORE™ media and the housing seal work together to control what passes through the intake boundary.',
  },
  {
    label: 'Protected Engine Components',
    detail: 'Cylinders, piston rings, turbocharger surfaces and the combustion-system air path downstream of the intake boundary.',
  },
] as const;

const ENGINEERING_VALUES = [
  {
    label: 'Media Configuration',
    detail: 'The media pack has to support the required contamination-control role while remaining compatible with the airflow demand of the application.',
  },
  {
    label: 'Contaminant Holding',
    detail: 'Dust loading changes restriction over time. Holding capacity therefore matters together with the actual concentration and type of airborne contamination.',
  },
  {
    label: 'Restriction Control',
    detail: 'Initial and terminal restriction limits belong to the equipment application. Filter selection must respect those limits rather than relying on dimensions alone.',
  },
  {
    label: 'Seal Integrity',
    detail: 'A technically capable media pack cannot protect the engine if gasket geometry, housing condition or clean-side sealing allows contamination to bypass the element.',
  },
] as const;

const wrap: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8rem',
  width: '100%',
};

const svgWrap: CSSProperties = {
  width: '100%',
  maxWidth: 'none',
};

const BOX_WIDTH = 300;
const BOX_GAP = 120;
const MARGIN_X = 24;
const DIAGRAM_WIDTH = MARGIN_X * 2 + STEPS.length * BOX_WIDTH + (STEPS.length - 1) * BOX_GAP;

const textAlt: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'clamp(0.98rem, 1.25vw, 1.08rem)',
  lineHeight: 1.8,
  letterSpacing: '0.01em',
  color: 'rgba(255,255,255,0.68)',
  width: '100%',
};

const valueGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
  width: '100%',
};

const valueCard: CSSProperties = {
  minHeight: '190px',
  padding: '1.45rem',
  border: '1px solid rgba(255,255,255,0.1)',
  borderTop: '1px solid rgba(255,241,45,0.42)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012))',
};

const valueLabel: CSSProperties = {
  margin: 0,
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const valueBody: CSSProperties = {
  margin: '.8rem 0 0',
  color: 'rgba(255,255,255,0.64)',
  fontFamily: 'var(--font-body)',
  fontSize: '.92rem',
  lineHeight: 1.68,
};

const operatingNote: CSSProperties = {
  padding: '1.35rem 1.5rem',
  borderLeft: '2px solid #FFF12D',
  background: 'rgba(255,241,45,0.035)',
  color: 'rgba(255,255,255,0.78)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  lineHeight: 1.7,
};

/**
 * Conceptual air-path diagram for MACROCORE™. The public technology page
 * intentionally avoids universal numeric efficiency, particle-size,
 * restriction, pressure or temperature claims. Product-level values remain
 * tied to validated evidence for the specific element or assembly.
 */
export default function MacrocoreConceptDiagram() {
  return (
    <div style={wrap} className="macrocore-diagram-wrap">
      <svg
        role="img"
        aria-labelledby="macrocore-diagram-title macrocore-diagram-desc"
        viewBox={`0 0 ${DIAGRAM_WIDTH} 240`}
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        style={svgWrap}
        className="macrocore-concept-diagram"
      >
        <title id="macrocore-diagram-title">MACROCORE™ air path, conceptual</title>
        <desc id="macrocore-diagram-desc">
          A left-to-right flow of ambient air, the MACROCORE filtration media and housing seal boundary,
          and protected engine components downstream. No universal product-level performance values are represented.
        </desc>

        <defs>
          <marker id="macrocore-arrow" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0 0L8 3L0 6Z" fill="rgba(255,241,45,0.65)" />
          </marker>
        </defs>

        {STEPS.map((step, i) => {
          const x = MARGIN_X + i * (BOX_WIDTH + BOX_GAP);
          return (
            <g key={step.label}>
              <rect
                x={x}
                y={56}
                width={BOX_WIDTH}
                height={112}
                rx={2}
                fill="rgba(255,255,255,0.03)"
                stroke={i === 1 ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.16)'}
                strokeWidth={1}
              />
              <foreignObject x={x + 18} y={80} width={BOX_WIDTH - 36} height={70}>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    lineHeight: 1.35,
                    color: i === 1 ? '#FFF12D' : 'rgba(255,255,255,0.88)',
                    fontWeight: i === 1 ? 700 : 600,
                    textAlign: 'center',
                  }}
                >
                  {step.label}
                </div>
              </foreignObject>
              {i < STEPS.length - 1 && (
                <line
                  x1={x + BOX_WIDTH}
                  y1={112}
                  x2={x + BOX_WIDTH + BOX_GAP - 6}
                  y2={112}
                  stroke="rgba(255,241,45,0.45)"
                  strokeWidth={1.5}
                  markerEnd="url(#macrocore-arrow)"
                />
              )}
            </g>
          );
        })}
      </svg>

      <ol style={{ ...textAlt, listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
        {STEPS.map((step, i) => (
          <li key={step.label} style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '1rem' }}>
            <strong style={{ color: '#fff' }}>{i + 1}. {step.label}</strong><br />{step.detail}
          </li>
        ))}
      </ol>

      <div style={valueGrid}>
        {ENGINEERING_VALUES.map((item) => (
          <article key={item.label} style={valueCard}>
            <h3 style={valueLabel}>{item.label}</h3>
            <p style={valueBody}>{item.detail}</p>
          </article>
        ))}
      </div>

      <div style={operatingNote}>
        <strong style={{ color: '#FFF12D' }}>Engineering note:</strong> a longer service interval is not automatically a better filtration outcome. The correct objective is controlled contamination at an acceptable restriction level, with sealing integrity preserved for the real engine and operating environment.
      </div>
    </div>
  );
}
