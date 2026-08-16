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

const wrap: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8rem',
  width: 'calc(100% + clamp(360px, 34vw, 500px))',
  marginLeft: 'calc(-1 * clamp(360px, 34vw, 500px))',
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

/**
 * Conceptual air-path diagram for MACROCORE™: ambient air -> filtration/seal
 * boundary -> protected engine components. Intentionally omits layer counts,
 * particle-size ranges, efficiency, restriction, pressure and temperature —
 * none of that is approved for public claim on this technology.
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
          A simple left-to-right flow of three stages: ambient air, the MACROCORE filtration media and
          housing seal boundary, and the protected engine components downstream. No layer counts, particle
          sizes, efficiency figures, restriction values, pressure or temperature ratings are represented.
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

      {/* Accessible text-equivalent of the diagram above, always present in the DOM */}
      <ol style={{ ...textAlt, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {STEPS.map((step, i) => (
          <li key={step.label}>
            {i + 1}. {step.label} — {step.detail}
          </li>
        ))}
      </ol>

      <style>{`
        @media (max-width: 860px) {
          .macrocore-diagram-wrap {
            width: 100% !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
