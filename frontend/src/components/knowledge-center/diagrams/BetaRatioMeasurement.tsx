interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BetaRatioMeasurement({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="brm-title brm-desc"
      viewBox="0 0 780 420"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="brm-title">Beta Ratio Measurement — ISO 16889</title>
      <desc id="brm-desc">
        Schematic showing upstream particle count (Nᵤ) before the filter element and downstream
        particle count (Nd) after, with the beta ratio formula β = Nᵤ/Nd and efficiency
        equation E(%) = (1 − 1/β) × 100.
      </desc>

      <defs>
        <marker id="brm-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <pattern id="brm-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,241,45,0.35)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ── Upstream zone ──────────────────────────────────────────────── */}
      <rect x="30" y="80" width="190" height="220"
        fill="rgba(255,128,64,0.05)" stroke="rgba(255,128,64,0.4)" strokeWidth="1.5" />
      <text x="125" y="68" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,128,64,0.8)" letterSpacing="0.08em">
        UPSTREAM
      </text>

      {/* Upstream particles — various sizes */}
      {/* Large particles */}
      <circle cx="70"  cy="115" r="8" fill="rgba(255,100,40,0.6)" />
      <circle cx="140" cy="140" r="9" fill="rgba(255,100,40,0.6)" />
      <circle cx="95"  cy="200" r="7" fill="rgba(255,100,40,0.6)" />
      <circle cx="165" cy="175" r="8" fill="rgba(255,100,40,0.6)" />
      <circle cx="60"  cy="270" r="9" fill="rgba(255,100,40,0.6)" />
      <circle cx="185" cy="255" r="7" fill="rgba(255,100,40,0.6)" />
      {/* Medium particles */}
      <circle cx="110" cy="105" r="4.5" fill="rgba(255,150,80,0.7)" />
      <circle cx="50"  cy="165" r="5"   fill="rgba(255,150,80,0.7)" />
      <circle cx="195" cy="120" r="4"   fill="rgba(255,150,80,0.7)" />
      <circle cx="130" cy="230" r="5"   fill="rgba(255,150,80,0.7)" />
      <circle cx="75"  cy="290" r="4.5" fill="rgba(255,150,80,0.7)" />
      <circle cx="160" cy="280" r="5"   fill="rgba(255,150,80,0.7)" />
      <circle cx="45"  cy="240" r="4"   fill="rgba(255,150,80,0.7)" />
      <circle cx="200" cy="200" r="4.5" fill="rgba(255,150,80,0.7)" />
      {/* Small particles */}
      <circle cx="85"  cy="145" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="155" cy="115" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="40"  cy="130" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="120" cy="165" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="180" cy="215" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="55"  cy="215" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="105" cy="255" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="175" cy="300" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="135" cy="290" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="65"  cy="305" r="2"   fill="rgba(255,200,140,0.8)" />

      {/* Nᵤ label */}
      <text x="125" y="330" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="rgba(255,255,255,0.9)">
        N
      </text>
      <text x="134" y="333" textAnchor="start"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.9)">
        u
      </text>
      <text x="125" y="348" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.45)">
        upstream count
      </text>

      {/* ── Flow arrows ────────────────────────────────────────────────── */}
      <line x1="220" y1="190" x2="290" y2="190"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#brm-ay)" />

      {/* ── Filter element ─────────────────────────────────────────────── */}
      <rect x="295" y="80" width="110" height="220"
        fill="url(#brm-hatch)" stroke="rgba(255,241,45,0.6)" strokeWidth="2" />
      {/* Filter media vertical lines */}
      <line x1="315" y1="80" x2="315" y2="300" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="335" y1="80" x2="335" y2="300" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="355" y1="80" x2="355" y2="300" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="375" y1="80" x2="375" y2="300" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="395" y1="80" x2="395" y2="300" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <text x="350" y="340" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.7)" letterSpacing="0.06em">
        FILTER
      </text>
      <text x="350" y="352" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.7)" letterSpacing="0.06em">
        ELEMENT
      </text>

      <line x1="405" y1="190" x2="475" y2="190"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#brm-ay)" />

      {/* ── Downstream zone ────────────────────────────────────────────── */}
      <rect x="480" y="80" width="190" height="220"
        fill="rgba(100,200,100,0.04)" stroke="rgba(100,200,100,0.35)" strokeWidth="1.5" />
      <text x="575" y="68" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(100,200,100,0.8)" letterSpacing="0.08em">
        DOWNSTREAM
      </text>

      {/* Downstream particles — only small ones (mostly captured) */}
      <circle cx="520" cy="130" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="610" cy="165" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="550" cy="230" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="650" cy="200" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="590" cy="270" r="2.5" fill="rgba(255,200,140,0.8)" />
      <circle cx="660" cy="120" r="2"   fill="rgba(255,200,140,0.8)" />
      <circle cx="500" cy="290" r="2"   fill="rgba(255,200,140,0.8)" />

      {/* Nd label */}
      <text x="575" y="330" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="rgba(255,255,255,0.9)">
        N
      </text>
      <text x="584" y="333" textAnchor="start"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.9)">
        d
      </text>
      <text x="575" y="348" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.45)">
        downstream count
      </text>

      {/* ── Formula box ────────────────────────────────────────────────── */}
      <rect x="220" y="370" width="340" height="42"
        fill="rgba(255,241,45,0.06)" stroke="rgba(255,241,45,0.25)" strokeWidth="1" rx="3" />
      <text x="390" y="388" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="#FFF12D">
        β = Nᵤ / Nd
      </text>
      <text x="390" y="404" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
        E(%) = (1 − 1/β) × 100
      </text>

      {/* ── Standard label ─────────────────────────────────────────────── */}
      <text x="700" y="400" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889
      </text>
    </svg>
  );
}
