interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ServiceIntervalFlow({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="sif-title sif-desc"
      viewBox="0 0 860 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="sif-title">Service Interval Planning Decision Flow</title>
      <desc id="sif-desc">
        Flowchart for filter service interval planning per ISO 3724:2007 and SAE J1299:2008.
        Four sequential steps: measure DHC from ISO 16889 multipass test; classify operating
        environment and select contamination ingestion rate; apply safety factor per environment;
        calculate service interval I_s = DHC × Sf ÷ (C_in × Q × 60). Includes field verification
        side note and formula reference.
      </desc>

      <defs>
        <marker id="sif-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="sif-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,120,0.7)" />
        </marker>
        <marker id="sif-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.7)" />
        </marker>
      </defs>

      {/* ── START oval ───────────────────────────────────────────────────── */}
      <ellipse cx="430" cy="38" rx="165" ry="24"
        fill="rgba(255,241,45,0.08)" stroke="rgba(255,241,45,0.55)" strokeWidth="1.5" />
      <text x="430" y="35" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#FFF12D" letterSpacing="0.06em">
        FILTER SERVICE INTERVAL PLANNING
      </text>
      <text x="430" y="48" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.5)">
        ISO 3724:2007 · SAE J1299:2008
      </text>

      {/* Connector */}
      <line x1="430" y1="62" x2="430" y2="78"
        stroke="#FFF12D" strokeWidth="1.5" markerEnd="url(#sif-ay)" />

      {/* ── STEP 1: DHC ───────────────────────────────────────────────────── */}
      <rect x="195" y="80" width="470" height="72"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" rx="3" />
      <rect x="195" y="80" width="470" height="18"
        fill="rgba(255,200,80,0.08)" />
      <text x="430" y="93" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,200,80,0.8)" letterSpacing="0.06em">
        STEP 1 — MEASURE DHC
      </text>
      <text x="430" y="111" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.6)">
        ISO 16889 multi-pass test — or — media area [m²] × capacity factor [g/m²]
      </text>
      <text x="430" y="126" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        Cellulose: 50–150 g/m²   ·   Synthetic: 100–300 g/m²   ·   Glass-fiber: 150–400 g/m²
      </text>
      <text x="430" y="141" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,200,80,0.55)">
        Output: DHC [g]
      </text>

      <line x1="430" y1="152" x2="430" y2="168"
        stroke="#FFF12D" strokeWidth="1.5" markerEnd="url(#sif-ay)" />

      {/* ── STEP 2: ENVIRONMENT ───────────────────────────────────────────── */}
      <rect x="145" y="170" width="570" height="84"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" rx="3" />
      <rect x="145" y="170" width="570" height="18"
        fill="rgba(100,200,255,0.07)" />
      <text x="430" y="183" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.8)" letterSpacing="0.06em">
        STEP 2 — CLASSIFY OPERATING ENVIRONMENT
      </text>
      <text x="430" y="200" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        Select typical contamination ingestion rate C_in from SAE J1299:2008 Table 2
      </text>

      {/* Environment table */}
      {[
        { env: 'CONSTRUCTION', min: '1.0', typ: '2.0', max: '3.5', x: 200 },
        { env: 'AGRICULTURE',  min: '0.3', typ: '0.8', max: '1.5', x: 410 },
        { env: 'INDUSTRIAL',   min: '0.05', typ: '0.15', max: '0.3', x: 620 },
      ].map(row => (
        <g key={row.env}>
          <text x={row.x} y="217" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.6)">
            {row.env}
          </text>
          <text x={row.x} y="230" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">
            {row.min}–{row.max} mg/L
          </text>
          <text x={row.x} y="243" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.75)">
            typical: {row.typ} mg/L
          </text>
        </g>
      ))}
      <line x1="375" y1="212" x2="375" y2="247" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="585" y1="212" x2="585" y2="247" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      <text x="430" y="246" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.2)" />

      <line x1="430" y1="254" x2="430" y2="270"
        stroke="#FFF12D" strokeWidth="1.5" markerEnd="url(#sif-ay)" />

      {/* ── STEP 3: SAFETY FACTOR ─────────────────────────────────────────── */}
      <rect x="195" y="272" width="470" height="68"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" rx="3" />
      <rect x="195" y="272" width="470" height="18"
        fill="rgba(255,120,40,0.07)" />
      <text x="430" y="285" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,180,80,0.8)" letterSpacing="0.06em">
        STEP 3 — APPLY SAFETY FACTOR
      </text>
      <text x="430" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        SAE J1299:2008 Annex D — accounts for ingestion rate uncertainty
      </text>
      <text x="295" y="318" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.65)">
        Construction: Sf = 0.65
      </text>
      <text x="430" y="318" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.65)">
        Agriculture: Sf = 0.75
      </text>
      <text x="570" y="318" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.65)">
        Industrial: Sf = 0.85
      </text>
      <text x="430" y="333" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,180,80,0.5)">
        Lower Sf → shorter (more conservative) interval
      </text>

      <line x1="430" y1="340" x2="430" y2="356"
        stroke="#FFF12D" strokeWidth="1.5" markerEnd="url(#sif-ay)" />

      {/* ── STEP 4: CALCULATE ─────────────────────────────────────────────── */}
      <rect x="165" y="358" width="530" height="68"
        fill="rgba(255,241,45,0.05)" stroke="rgba(255,241,45,0.45)" strokeWidth="1.5" rx="3" />
      <rect x="165" y="358" width="530" height="18"
        fill="rgba(255,241,45,0.08)" />
      <text x="430" y="371" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="#FFF12D" letterSpacing="0.06em">
        STEP 4 — CALCULATE SERVICE INTERVAL
      </text>
      <text x="430" y="390" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="#FFF12D" fontWeight="700">
        I_s = DHC × Sf  ÷  (C_in × Q × 60)
      </text>
      <text x="430" y="407" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">
        DHC [g] · Sf [dimensionless] · C_in [mg/L] · Q [L/min] → I_s [hours]
      </text>
      <text x="430" y="419" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,241,45,0.4)">
        ISO 3724:2007 §6
      </text>

      <line x1="430" y1="426" x2="430" y2="442"
        stroke="rgba(100,220,120,0.7)" strokeWidth="1.5" markerEnd="url(#sif-ag)" />

      {/* ── RESULT oval ───────────────────────────────────────────────────── */}
      <ellipse cx="430" cy="458" rx="130" ry="19"
        fill="rgba(100,220,120,0.08)" stroke="rgba(100,220,120,0.55)" strokeWidth="1.5" />
      <text x="430" y="455" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(100,220,120,0.8)">
        SERVICE INTERVAL I_s [hours]
      </text>
      <text x="430" y="468" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,220,120,0.5)">
        planning target — verify against field data
      </text>

      {/* ── SIDE NOTE: field verification ─────────────────────────────────── */}
      <rect x="620" y="358" width="220" height="60"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" rx="2"
        strokeDasharray="4,3" />
      <text x="730" y="374" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">
        FIELD VERIFICATION
      </text>
      <text x="730" y="388" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.3)">
        Monitor ΔP indicator or
      </text>
      <text x="730" y="400" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.3)">
        oil cleanliness code (ISO 4406)
      </text>
      <text x="730" y="412" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.3)">
        Adjust Sf if interval is short/long
      </text>
      <line x1="619" y1="385" x2="600" y2="385"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="600" y1="385" x2="600" y2="392"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3,2" />

      {/* Standard label */}
      <text x="850" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)"
        letterSpacing="0.06em">
        ISO 3724:2007 · SAE J1299:2008
      </text>
    </svg>
  );
}
