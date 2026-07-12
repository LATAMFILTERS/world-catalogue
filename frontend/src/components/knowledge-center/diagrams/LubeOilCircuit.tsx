interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function LubeOilCircuit({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="loc-title loc-desc"
      viewBox="0 0 800 500"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="loc-title">Engine Lube Oil Filtration Circuit — Full-Flow with Bypass</title>
      <desc id="loc-desc">
        Engine lube oil circuit showing: oil sump (reservoir), suction strainer, oil pump,
        full-flow filter with integral bypass valve (opens at ΔP typically 1.5–3.5 bar),
        main oil gallery, distribution to main bearings, big-end (rod) bearings, camshaft
        bearings, and return drain to sump. ISO 16889 defines filter performance criteria.
      </desc>

      <defs>
        <marker id="loc-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="loc-ao" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,160,40,0.8)" />
        </marker>
        <marker id="loc-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.8)" />
        </marker>
        <pattern id="loc-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,241,45,0.3)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OIL SUMP (bottom)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="80" y="400" width="640" height="70"
        fill="rgba(255,200,40,0.08)" stroke="rgba(255,200,40,0.45)" strokeWidth="1.5" rx="4" />
      {/* Oil surface */}
      <line x1="80" y1="430" x2="720" y2="430"
        stroke="rgba(255,200,40,0.35)" strokeWidth="1" strokeDasharray="6,4" />
      {/* Oil particles in sump */}
      <circle cx="180" cy="448" r="2.5" fill="rgba(255,120,40,0.4)" />
      <circle cx="320" cy="445" r="2"   fill="rgba(255,120,40,0.35)" />
      <circle cx="480" cy="450" r="3"   fill="rgba(255,120,40,0.4)" />
      <circle cx="620" cy="446" r="2"   fill="rgba(255,120,40,0.35)" />
      <text x="400" y="475" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,200,40,0.65)">
        OIL SUMP / PAN
      </text>

      {/* ── Suction strainer ─────────────────────────────────────────────── */}
      <rect x="105" y="360" width="50" height="40"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" rx="2" />
      <line x1="115" y1="360" x2="115" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="125" y1="360" x2="125" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="135" y1="360" x2="135" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="145" y1="360" x2="145" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <text x="130" y="355" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        strainer
      </text>

      {/* Suction line strainer → pump */}
      <line x1="155" y1="380" x2="210" y2="380"
        stroke="rgba(255,200,40,0.6)" strokeWidth="2" markerEnd="url(#loc-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OIL PUMP
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <circle cx="240" cy="340" r="35"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      {/* Pump gear symbol */}
      <circle cx="230" cy="340" r="12"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="252" cy="340" r="12"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <text x="240" y="385" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.55)">
        OIL PUMP
      </text>

      {/* Suction line from sump to pump */}
      <line x1="130" y1="400" x2="130" y2="380"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1.5" markerEnd="url(#loc-ay)" />

      {/* Pressure line from pump up */}
      <line x1="240" y1="305" x2="240" y2="240"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#loc-ay)" />

      {/* Pressure relief valve (branch from pump pressure to sump) */}
      <line x1="240" y1="270" x2="160" y2="270"
        stroke="rgba(255,160,40,0.5)" strokeWidth="1.5" />
      <rect x="128" y="258" width="32" height="24"
        fill="rgba(255,160,40,0.1)" stroke="rgba(255,160,40,0.5)" strokeWidth="1.5" rx="2" />
      {/* Relief valve symbol — spring */}
      <line x1="136" y1="262" x2="136" y2="278" stroke="rgba(255,160,40,0.5)" strokeWidth="1" />
      <path d="M138,262 Q144,266 138,270 Q144,274 138,278"
        fill="none" stroke="rgba(255,160,40,0.5)" strokeWidth="1" />
      <text x="144" y="295" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,160,40,0.6)">
        PRV
      </text>
      <line x1="128" y1="270" x2="110" y2="270"
        stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" markerEnd="url(#loc-ao)" />
      <line x1="110" y1="270" x2="110" y2="400"
        stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" markerEnd="url(#loc-ao)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FULL-FLOW FILTER + BYPASS VALVE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Filter housing */}
      <rect x="200" y="140" width="80" height="100"
        fill="rgba(255,241,45,0.05)" stroke="rgba(255,241,45,0.55)" strokeWidth="2" rx="4" />
      {/* Filter element */}
      <rect x="210" y="150" width="60" height="80"
        fill="url(#loc-hatch)" stroke="rgba(255,241,45,0.35)" strokeWidth="1" />
      <line x1="222" y1="150" x2="222" y2="230" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="234" y1="150" x2="234" y2="230" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="246" y1="150" x2="246" y2="230" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="258" y1="150" x2="258" y2="230" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <text x="240" y="133" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.8)">
        FULL-FLOW FILTER
      </text>
      <text x="240" y="122" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">
        ISO 16889
      </text>

      {/* Bypass valve path (around filter) */}
      <line x1="200" y1="165" x2="162" y2="165"
        stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="162" y1="165" x2="162" y2="215"
        stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="162" y1="215" x2="200" y2="215"
        stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#loc-ao)" />
      {/* Bypass valve symbol */}
      <rect x="145" y="182" width="18" height="16"
        fill="rgba(255,160,40,0.1)" stroke="rgba(255,160,40,0.5)" strokeWidth="1" rx="2" />
      <path d="M147,186 Q155,190 147,194" fill="none" stroke="rgba(255,160,40,0.5)" strokeWidth="1" />
      <text x="120" y="198" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,160,40,0.7)">
        bypass
      </text>
      <text x="120" y="208" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,160,40,0.7)">
        valve
      </text>

      {/* Filter outlet → main gallery */}
      <line x1="280" y1="190" x2="380" y2="190"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#loc-ay)" />
      <text x="320" y="180" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.35)">
        main gallery
      </text>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN OIL GALLERY (horizontal)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="380" y="178" width="280" height="24"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

      {/* ── Main bearings (downward from gallery) ──────────────────────── */}
      {[430, 500, 570, 640].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="202" x2={x} y2="270"
            stroke="rgba(100,200,255,0.6)" strokeWidth="1.5" markerEnd="url(#loc-ab)" />
          <ellipse cx={x} cy="290" rx="24" ry="14"
            fill="rgba(100,200,255,0.08)" stroke="rgba(100,200,255,0.45)" strokeWidth="1.5" />
          <text x={x} y="294" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.6)">
            MAIN
          </text>
          {/* Oil drain back to sump */}
          <line x1={x} y1="304" x2={x} y2="400"
            stroke="rgba(255,200,40,0.3)" strokeWidth="1" markerEnd="url(#loc-ay)" />
        </g>
      ))}

      {/* ── Camshaft feed (upward from gallery) ──────────────────────────── */}
      <line x1="520" y1="178" x2="520" y2="80"
        stroke="rgba(100,200,255,0.4)" strokeWidth="1.5" markerEnd="url(#loc-ab)" />
      <ellipse cx="520" cy="64" rx="50" ry="14"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1.5" />
      <text x="520" y="68" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,200,255,0.5)">
        CAMSHAFT BEARINGS
      </text>
      <line x1="520" y1="78" x2="520" y2="400"
        stroke="rgba(255,200,40,0.2)" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#loc-ay)" />

      {/* Labels */}
      <text x="560" y="310" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(100,200,255,0.5)">
        ← drain to sump
      </text>

      {/* ── Big-end / rod bearing feed note ─────────────────────────────── */}
      <rect x="590" y="36" width="190" height="55"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" rx="3" />
      <text x="685" y="54" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Big-end (rod) bearings
      </text>
      <text x="685" y="66" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        fed via drilled crankshaft
      </text>
      <text x="685" y="78" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        journals from mains
      </text>

      {/* ── Standard + bypass note ───────────────────────────────────────── */}
      <rect x="80" y="28" width="110" height="55"
        fill="rgba(255,160,40,0.05)" stroke="rgba(255,160,40,0.25)" strokeWidth="1" rx="3" />
      <text x="135" y="45" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,160,40,0.7)">
        Bypass opens at
      </text>
      <text x="135" y="57" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,160,40,0.7)">
        ΔP 1.5–3.5 bar
      </text>
      <text x="135" y="69" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        (unfiltered flow)
      </text>
      <text x="135" y="78" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.25)">
        OEM-specific
      </text>

      {/* Standard label */}
      <text x="780" y="492" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889 · ISO 4406
      </text>
    </svg>
  );
}
