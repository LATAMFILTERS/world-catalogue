interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function FuelFiltration3Stage({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="ff3-title ff3-desc"
      viewBox="0 0 860 400"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="ff3-title">3-Stage Diesel Fuel Filtration System</title>
      <desc id="ff3-desc">
        Sequential three-stage diesel fuel filtration: Stage 1 pre-filter removes coarse particles
        (≥200µm), Stage 2 primary filter with water coalescing separator removes particles (≥10µm)
        and free water, Stage 3 secondary fine filter (≥2µm) protects HPCR injection pump and
        injectors. Return flow from injectors goes back to the fuel tank. Based on ISO 16332 and
        ASTM D6304.
      </desc>

      <defs>
        <marker id="ff3-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="ff3-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,100,0.9)" />
        </marker>
        <marker id="ff3-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,180,255,0.9)" />
        </marker>
        <pattern id="ff3-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2="10" y2="0" stroke="rgba(255,241,45,0.3)" strokeWidth="1.2" />
        </pattern>
        <pattern id="ff3-finehatch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(100,220,100,0.35)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* ── Fuel tank (left) ─────────────────────────────────────────────── */}
      {/* Tank outline */}
      <rect x="20" y="100" width="80" height="120"
        fill="rgba(255,200,40,0.06)" stroke="rgba(255,200,40,0.45)" strokeWidth="1.5" rx="4" />
      {/* Fuel level */}
      <rect x="20" y="170" width="80" height="50"
        fill="rgba(255,200,40,0.15)" rx="0" />
      <line x1="20" y1="170" x2="100" y2="170"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1" strokeDasharray="4,3" />
      {/* Tank label */}
      <text x="60" y="242" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,200,40,0.7)">
        FUEL TANK
      </text>

      {/* Feed line from tank to pre-filter */}
      <line x1="100" y1="160" x2="145" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#ff3-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 1: Pre-filter / Strainer (≥200µm)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Filter housing */}
      <rect x="145" y="110" width="85" height="100"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="4" />
      {/* Coarse filter element — wide hatching */}
      <rect x="157" y="122" width="61" height="76"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {/* Wide mesh lines (coarse filter) */}
      <line x1="157" y1="140" x2="218" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="157" y1="158" x2="218" y2="158" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="157" y1="176" x2="218" y2="176" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

      {/* Coarse particles caught in Stage 1 */}
      <circle cx="172" cy="148" r="5" fill="rgba(180,140,80,0.6)" />
      <circle cx="195" cy="165" r="4" fill="rgba(180,140,80,0.5)" />
      <circle cx="208" cy="145" r="5" fill="rgba(180,140,80,0.55)" />

      <text x="187" y="265" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">
        STAGE 1
      </text>
      <text x="187" y="277" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">
        PRE-FILTER
      </text>
      <text x="187" y="290" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.6)">
        ≥200µm
      </text>

      <line x1="230" y1="160" x2="268" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#ff3-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 2: Primary + Water Separator (≥10µm)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Filter housing — wider for dual function */}
      <rect x="268" y="100" width="120" height="120"
        fill="rgba(100,180,255,0.05)" stroke="rgba(100,180,255,0.45)" strokeWidth="1.5" rx="4" />
      {/* Filter element */}
      <rect x="278" y="112" width="100" height="96"
        fill="url(#ff3-hatch)" stroke="rgba(255,241,45,0.4)" strokeWidth="1" />
      {/* Media lines */}
      <line x1="295" y1="112" x2="295" y2="208" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="312" y1="112" x2="312" y2="208" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="329" y1="112" x2="329" y2="208" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="346" y1="112" x2="346" y2="208" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />
      <line x1="363" y1="112" x2="363" y2="208" stroke="rgba(255,241,45,0.15)" strokeWidth="1" />

      {/* Water droplets coalescing and falling */}
      <circle cx="310" cy="195" r="4" fill="rgba(100,180,255,0.5)" />
      <circle cx="330" cy="200" r="3" fill="rgba(100,180,255,0.5)" />
      <circle cx="350" cy="196" r="4" fill="rgba(100,180,255,0.5)" />

      {/* Water drain */}
      <line x1="328" y1="220" x2="328" y2="252"
        stroke="rgba(100,180,255,0.5)" strokeWidth="1.5" markerEnd="url(#ff3-ab)" />
      <text x="336" y="265" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(100,180,255,0.65)">
        water drain
      </text>

      <text x="328" y="290" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">
        STAGE 2
      </text>
      <text x="328" y="302" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">
        PRIMARY + WATER SEP.
      </text>
      <text x="328" y="315" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.6)">
        ≥10µm · coalescing
      </text>

      <line x1="388" y1="160" x2="430" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#ff3-ay)" />

      {/* Lift pump between Stage 2 and 3 */}
      <circle cx="450" cy="160" r="18"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* Pump arrow */}
      <line x1="442" y1="160" x2="456" y2="153"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" markerEnd="url(#ff3-ay)" />
      <text x="450" y="192" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">
        lift pump
      </text>

      <line x1="468" y1="160" x2="510" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#ff3-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 3: Secondary Fine Filter (≥2µm)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="510" y="105" width="100" height="110"
        fill="rgba(100,220,100,0.05)" stroke="rgba(100,220,100,0.5)" strokeWidth="1.5" rx="4" />
      <rect x="522" y="117" width="76" height="86"
        fill="url(#ff3-finehatch)" stroke="rgba(100,220,100,0.35)" strokeWidth="1" />
      {/* Fine media lines — closer spacing */}
      <line x1="533" y1="117" x2="533" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />
      <line x1="545" y1="117" x2="545" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />
      <line x1="557" y1="117" x2="557" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />
      <line x1="569" y1="117" x2="569" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />
      <line x1="581" y1="117" x2="581" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />
      <line x1="593" y1="117" x2="593" y2="203" stroke="rgba(100,220,100,0.15)" strokeWidth="1" />

      <text x="560" y="270" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,220,100,0.7)">
        STAGE 3
      </text>
      <text x="560" y="282" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,220,100,0.7)">
        SECONDARY FINE
      </text>
      <text x="560" y="295" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,220,100,0.5)">
        ≥2µm · HPCR grade
      </text>

      <line x1="610" y1="160" x2="648" y2="160"
        stroke="rgba(100,220,100,0.9)" strokeWidth="2" markerEnd="url(#ff3-ag)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HPCR Pump + Injectors
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* HPCR pump */}
      <rect x="648" y="130" width="60" height="60"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="3" />
      <text x="678" y="158" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.6)">
        HPCR
      </text>
      <text x="678" y="170" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.6)">
        PUMP
      </text>

      {/* High-pressure line to injectors */}
      <line x1="708" y1="160" x2="750" y2="160"
        stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" markerEnd="url(#ff3-ay)" />

      {/* Injectors (common rail) */}
      <rect x="750" y="90" width="40" height="140"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" rx="3" />
      {/* Injector symbols */}
      <polygon points="760,110 780,110 770,130" fill="rgba(255,255,255,0.2)" />
      <polygon points="760,148 780,148 770,168" fill="rgba(255,255,255,0.2)" />
      <polygon points="760,186 780,186 770,206" fill="rgba(255,255,255,0.2)" />
      <text x="770" y="258" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        INJECTORS
      </text>

      {/* Return fuel line back to tank */}
      <line x1="770" y1="230" x2="770" y2="315"
        stroke="rgba(255,200,40,0.4)" strokeWidth="1.5" markerEnd="url(#ff3-ay)" />
      <line x1="770" y1="315" x2="60" y2="315"
        stroke="rgba(255,200,40,0.4)" strokeWidth="1.5" markerEnd="url(#ff3-ay)" />
      <text x="415" y="330" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,200,40,0.45)">
        ── return flow (excess fuel) ──
      </text>

      {/* Pressure label on HP line */}
      <text x="729" y="152" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">
        2000 bar
      </text>

      {/* ── Standard label ─────────────────────────────────────────────── */}
      <text x="840" y="395" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16332 · ASTM D6304
      </text>
    </svg>
  );
}
