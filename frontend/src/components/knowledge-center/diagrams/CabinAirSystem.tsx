interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function CabinAirSystem({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="cas-title cas-desc"
      viewBox="0 0 860 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="cas-title">Cabin Air Filtration System — ISO 11155</title>
      <desc id="cas-desc">
        ISO 11155 cabin air filtration system flow diagram. Outside air enters fresh air inlet,
        passes through coarse particulate pre-filter (PM10 stage), activated carbon adsorber
        (gas-phase contaminants and odours), fine particulate filter (PM2.5/HEPA, greater than
        95% efficiency at 0.3 µm per ISO 29463), then delivers to cabin HVAC zone.
        A recirculation mode damper returns cabin air back through the carbon and fine filter
        stages when external contamination levels are high.
      </desc>

      <defs>
        <pattern id="cas-carbon" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.5" fill="rgba(150,100,255,0.4)" />
        </pattern>
        <pattern id="cas-fine" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="5" x2="5" y2="0" stroke="rgba(100,200,255,0.35)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="5" y2="5" stroke="rgba(100,200,255,0.2)" strokeWidth="0.5" />
        </pattern>
        <pattern id="cas-coarse" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
          <line x1="0" y1="9" x2="9" y2="0" stroke="rgba(255,200,80,0.35)" strokeWidth="1.2" />
        </pattern>
        <marker id="cas-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="cas-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.7)" />
        </marker>
        <marker id="cas-ad" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>

      {/* ── TITLE BAR ─────────────────────────────────────────────────────── */}
      <text x="430" y="20" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,255,255,0.55)"
        letterSpacing="0.08em">
        CABIN AIR FILTRATION SYSTEM — ISO 11155
      </text>

      {/* ── FRESH AIR MODE label ───────────────────────────────────────────── */}
      <text x="430" y="48" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.35)"
        letterSpacing="0.06em">
        FRESH AIR MODE (primary) ──────────────────────────────────────────────────
      </text>

      {/* ── OUTSIDE AIR INLET ─────────────────────────────────────────────── */}
      <rect x="20" y="130" width="80" height="140"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" rx="3" />
      <text x="60" y="185" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.55)">
        OUTSIDE
      </text>
      <text x="60" y="197" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.55)">
        AIR
      </text>
      <text x="60" y="209" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.55)">
        INLET
      </text>
      {/* Air flow lines into inlet */}
      {[148, 165, 182, 199, 216, 233].map((y, i) => (
        <line key={i} x1="8" y1={y} x2="18" y2={y}
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      ))}

      {/* Connector: inlet → pre-filter */}
      <line x1="100" y1="200" x2="128" y2="200"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cas-ay)" />

      {/* ── STAGE 1: PRE-FILTER ───────────────────────────────────────────── */}
      <rect x="130" y="120" width="130" height="160"
        fill="url(#cas-coarse)" stroke="rgba(255,200,80,0.55)" strokeWidth="1.5" rx="2" />
      <rect x="130" y="120" width="130" height="160"
        fill="rgba(255,200,80,0.04)" />

      <text x="195" y="95" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,200,80,0.75)"
        letterSpacing="0.04em">
        STAGE 1
      </text>
      <text x="195" y="107" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,200,80,0.6)">
        PRE-FILTER (PM10)
      </text>
      <text x="195" y="118" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,200,80,0.4)">
        ISO 11155
      </text>

      {/* Large particles blocked at pre-filter — left face */}
      <circle cx="138" cy="155" r="6"   fill="rgba(255,120,40,0.6)" />
      <circle cx="138" cy="185" r="5.5" fill="rgba(255,120,40,0.55)" />
      <circle cx="138" cy="215" r="6"   fill="rgba(255,120,40,0.58)" />
      <circle cx="138" cy="245" r="5"   fill="rgba(255,120,40,0.5)" />

      {/* Connector: pre-filter → carbon */}
      <line x1="260" y1="200" x2="288" y2="200"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cas-ay)" />

      {/* ── STAGE 2: ACTIVATED CARBON ─────────────────────────────────────── */}
      <rect x="290" y="120" width="130" height="160"
        fill="url(#cas-carbon)" stroke="rgba(150,100,255,0.55)" strokeWidth="1.5" rx="2" />
      <rect x="290" y="120" width="130" height="160"
        fill="rgba(150,100,255,0.04)" />

      <text x="355" y="95" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(180,140,255,0.75)"
        letterSpacing="0.04em">
        STAGE 2
      </text>
      <text x="355" y="107" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(180,140,255,0.6)">
        ACTIVATED CARBON
      </text>
      <text x="355" y="118" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(180,140,255,0.4)">
        VOCs · odours
      </text>

      {/* Gas molecule symbols */}
      <text x="298" y="162" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(180,140,255,0.5)">NH₃</text>
      <text x="298" y="195" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(180,140,255,0.45)">SO₂</text>
      <text x="298" y="228" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(180,140,255,0.45)">VOC</text>
      <text x="298" y="261" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(180,140,255,0.4)">H₂S</text>

      {/* Connector: carbon → fine filter */}
      <line x1="420" y1="200" x2="448" y2="200"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cas-ay)" />

      {/* ── STAGE 3: FINE FILTER / HEPA ───────────────────────────────────── */}
      <rect x="450" y="120" width="130" height="160"
        fill="url(#cas-fine)" stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" rx="2" />
      <rect x="450" y="120" width="130" height="160"
        fill="rgba(100,200,255,0.04)" />

      <text x="515" y="95" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,200,255,0.75)"
        letterSpacing="0.04em">
        STAGE 3
      </text>
      <text x="515" y="107" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.6)">
        FINE / HEPA FILTER
      </text>
      <text x="515" y="118" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(100,200,255,0.4)">
        ISO 29463 · &gt;95% @ 0.3 µm
      </text>

      {/* Very fine particles blocked */}
      <circle cx="458" cy="150" r="3"   fill="rgba(255,120,40,0.45)" />
      <circle cx="458" cy="173" r="2.5" fill="rgba(255,120,40,0.42)" />
      <circle cx="458" cy="196" r="2.5" fill="rgba(255,120,40,0.4)" />
      <circle cx="458" cy="219" r="2"   fill="rgba(255,120,40,0.38)" />
      <circle cx="458" cy="242" r="3"   fill="rgba(255,120,40,0.4)" />
      <circle cx="458" cy="265" r="2"   fill="rgba(255,120,40,0.35)" />

      {/* PM2.5 label */}
      <text x="515" y="310" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.45)">
        PM2.5 · 0.3 µm particles captured
      </text>

      {/* Connector: fine filter → cabin */}
      <line x1="580" y1="200" x2="608" y2="200"
        stroke="rgba(100,200,255,0.7)" strokeWidth="2" markerEnd="url(#cas-ab)" />

      {/* ── CABIN HVAC ZONE ───────────────────────────────────────────────── */}
      <rect x="610" y="120" width="130" height="160"
        fill="rgba(100,200,255,0.04)" stroke="rgba(100,200,255,0.35)" strokeWidth="1.5" rx="3"
        strokeDasharray="8,4" />
      <text x="675" y="185" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.55)">
        CABIN
      </text>
      <text x="675" y="198" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.55)">
        HVAC ZONE
      </text>
      <text x="675" y="215" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(100,200,255,0.35)">
        operator breathing zone
      </text>

      {/* Clean air indicators inside cabin */}
      <circle cx="650" cy="155" r="1.2" fill="rgba(100,200,255,0.3)" />
      <circle cx="680" cy="168" r="1"   fill="rgba(100,200,255,0.28)" />
      <circle cx="660" cy="245" r="1.2" fill="rgba(100,200,255,0.3)" />
      <circle cx="695" cy="235" r="1"   fill="rgba(100,200,255,0.25)" />

      {/* ── RECIRCULATION MODE ─────────────────────────────────────────────── */}
      <text x="430" y="345" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.2)"
        letterSpacing="0.06em">
        ─────────────────── RECIRCULATION MODE (high external contamination) ───────────────────
      </text>

      {/* Recirculation path: cabin → back to carbon + fine filter */}
      {/* Down from cabin */}
      <line x1="675" y1="280" x2="675" y2="370"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="6,3" />
      {/* Across to left */}
      <line x1="675" y1="370" x2="290" y2="370"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="6,3" />
      {/* Up into carbon stage */}
      <line x1="290" y1="370" x2="290" y2="282"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="6,3"
        markerEnd="url(#cas-ad)" />

      {/* Damper symbol at cabin exit */}
      <line x1="660" y1="295" x2="690" y2="315"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="690" y1="295" x2="660" y2="315"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <rect x="655" y="290" width="40" height="30"
        fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" rx="2" />
      <text x="730" y="308" fontFamily="'JetBrains Mono', monospace" fontSize="7"
        fill="rgba(255,255,255,0.35)">
        DAMPER
      </text>

      <text x="430" y="388" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">
        Cabin return air recirculates through carbon + fine filter stages when external PM or gas exceeds threshold
      </text>

      {/* Efficiency stats */}
      <rect x="20" y="410" width="820" height="52"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" rx="2" />
      {[
        { x: 80,  label: 'PRE-FILTER',         spec: 'PM10 removal' },
        { x: 280, label: 'ACTIVATED CARBON',    spec: '>90% VOC removal' },
        { x: 490, label: 'FINE / HEPA',         spec: '>95% @ 0.3 µm' },
        { x: 700, label: 'SYSTEM',              spec: 'ISO 11155 compliant' },
      ].map(col => (
        <g key={col.x}>
          <text x={col.x} y="430" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.5)">
            {col.label}
          </text>
          <text x={col.x} y="447" textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
            {col.spec}
          </text>
        </g>
      ))}

      {/* Standard label */}
      <text x="850" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)"
        letterSpacing="0.06em">
        ISO 11155 · ISO 29463 · DIN 71460
      </text>
    </svg>
  );
}
