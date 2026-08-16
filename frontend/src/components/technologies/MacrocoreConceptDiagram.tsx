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
  gap: '1.25rem',
};

const svgWrap: CSSProperties = {
  width: '100%',
  maxWidth: '980px',
};

const BOX_WIDTH = 220;
const BOX_GAP = 140;
const MARGIN_X = 20;
const DIAGRAM_WIDTH = MARGIN_X * 2 + STEPS.length * BOX_WIDTH + (STEPS.length - 1) * BOX_GAP;

const textAlt: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.04em',
  color: 'rgba(255,255,255,0.4)',
};

/**
 * Conceptual air-path diagram for MACROCORE™: ambient air -> filtration/seal
 * boundary -> protected engine components. Intentionally omits layer counts,
 * particle-size ranges, efficiency, restriction, pressure and temperature —
 * none of that is approved for public claim on this technology.
 */
export default function MacrocoreConceptDiagram() {
  return (
    <div style={wrap}>
      <svg
        role="img"
        aria-labelledby="macrocore-diagram-title macrocore-diagram-desc"
        viewBox={`0 0 ${DIAGRAM_WIDTH} 200`}
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
                y={60}
                width={BOX_WIDTH}
                height={80}
                rx={2}
                fill="rgba(255,255,255,0.03)"
                stroke={i === 1 ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.16)'}
                strokeWidth={1}
              />
              <foreignObject x={x + 14} y={74} width={BOX_WIDTH - 28} height={52}>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    lineHeight: 1.25,
                    color: i === 1 ? '#FFF12D' : 'rgba(255,255,255,0.82)',
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
                  y1={100}
                  x2={x + BOX_WIDTH + BOX_GAP - 6}
                  y2={100}
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
      <ol style={{ ...textAlt, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {STEPS.map((step, i) => (
          <li key={step.label}>
            {i + 1}. {step.label} — {step.detail}
          </li>
        ))}
      </ol>
    </div>
  );
}
