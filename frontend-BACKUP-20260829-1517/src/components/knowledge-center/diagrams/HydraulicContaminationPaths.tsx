interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function HydraulicContaminationPaths({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="hcp-title hcp-desc"
      viewBox="0 0 800 500"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="hcp-title">Hydraulic System Contamination Ingression Paths</title>
      <desc id="hcp-desc">
        Three contamination ingression paths in a hydraulic system: built-in contamination from
        manufacturing and assembly residues, ingressed contamination through seals, breathers, and
        cylinder rods, and generated contamination from component wear (adhesive, abrasive, fatigue).
        All converge on the hydraulic reservoir. Filtration removes particles from the circuit.
        Based on ISO 16889 and NFPA T2.14.
      </desc>

      <defs>
        <marker id="hcp-ao" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#ff8040" />
        </marker>
        <marker id="hcp-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="hcp-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,100,0.9)" />
        </marker>
      </defs>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CENTRAL: Hydraulic Reservoir + System
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Reservoir */}
      <rect x="290" y="240" width="220" height="140"
        fill="rgba(255,200,40,0.08)" stroke="rgba(255,200,40,0.45)" strokeWidth="2" rx="4" />
      {/* Fluid surface */}
      <line x1="290" y1="290" x2="510" y2="290"
        stroke="rgba(255,200,40,0.4)" strokeWidth="1" strokeDasharray="6,4" />
      {/* Particles suspended in fluid */}
      <circle cx="320" cy="310" r="3.5" fill="rgba(255,120,40,0.5)" />
      <circle cx="355" cy="325" r="2.5" fill="rgba(255,120,40,0.45)" />
      <circle cx="390" cy="308" r="4"   fill="rgba(255,120,40,0.5)" />
      <circle cx="430" cy="320" r="3"   fill="rgba(255,120,40,0.45)" />
      <circle cx="465" cy="312" r="3.5" fill="rgba(255,120,40,0.5)" />
      <circle cx="340" cy="348" r="2"   fill="rgba(255,120,40,0.4)" />
      <circle cx="408" cy="352" r="3"   fill="rgba(255,120,40,0.45)" />
      <circle cx="478" cy="345" r="2.5" fill="rgba(255,120,40,0.4)" />
      <text x="400" y="390" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,200,40,0.7)">
        HYDRAULIC RESERVOIR
      </text>

      {/* Return filter (on return line to reservoir) */}
      <rect x="340" y="200" width="120" height="40"
        fill="rgba(100,220,100,0.06)" stroke="rgba(100,220,100,0.45)" strokeWidth="1.5" rx="3" />
      {/* Filter element lines */}
      <line x1="365" y1="200" x2="365" y2="240" stroke="rgba(100,220,100,0.25)" strokeWidth="1" />
      <line x1="385" y1="200" x2="385" y2="240" stroke="rgba(100,220,100,0.25)" strokeWidth="1" />
      <line x1="405" y1="200" x2="405" y2="240" stroke="rgba(100,220,100,0.25)" strokeWidth="1" />
      <line x1="425" y1="200" x2="425" y2="240" stroke="rgba(100,220,100,0.25)" strokeWidth="1" />
      <text x="400" y="226" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,220,100,0.7)">
        RETURN FILTER
      </text>
      {/* Arrow into reservoir from filter */}
      <line x1="400" y1="240" x2="400" y2="255"
        stroke="rgba(100,220,100,0.7)" strokeWidth="1.5" markerEnd="url(#hcp-ag)" />

      {/* Pressure filter on supply line */}
      <rect x="490" y="200" width="120" height="40"
        fill="rgba(100,220,100,0.04)" stroke="rgba(100,220,100,0.3)" strokeWidth="1" rx="3" />
      <line x1="515" y1="200" x2="515" y2="240" stroke="rgba(100,220,100,0.2)" strokeWidth="1" />
      <line x1="530" y1="200" x2="530" y2="240" stroke="rgba(100,220,100,0.2)" strokeWidth="1" />
      <line x1="545" y1="200" x2="545" y2="240" stroke="rgba(100,220,100,0.2)" strokeWidth="1" />
      <line x1="560" y1="200" x2="560" y2="240" stroke="rgba(100,220,100,0.2)" strokeWidth="1" />
      <line x1="575" y1="200" x2="575" y2="240" stroke="rgba(100,220,100,0.2)" strokeWidth="1" />
      <text x="550" y="226" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,220,100,0.55)">
        PRESSURE FILTER
      </text>

      {/* ── Circuit flow lines ────────────────────────────────────────────── */}
      {/* Pump suction from reservoir → pump */}
      <line x1="510" y1="310" x2="610" y2="310"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1.5" markerEnd="url(#hcp-ay)" />
      {/* Pump */}
      <circle cx="630" cy="310" r="22"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <text x="630" y="314" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.6)">
        P
      </text>
      {/* Pressure line to pressure filter */}
      <line x1="630" y1="288" x2="630" y2="220"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" markerEnd="url(#hcp-ay)" />
      <line x1="610" y1="220" x2="630" y2="220"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      {/* Return line from actuators to return filter */}
      <line x1="490" y1="220" x2="460" y2="220"
        stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#hcp-ay)" />
      <text x="340" y="188" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(100,220,100,0.5)">
        return ←
      </text>
      <text x="492" y="188" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(100,220,100,0.5)">
        → supply
      </text>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PATH 1: BUILT-IN CONTAMINATION (top left)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="20" y="20" width="200" height="110"
        fill="rgba(255,80,40,0.06)" stroke="rgba(255,80,40,0.4)" strokeWidth="1.5" rx="4" />
      <text x="120" y="40" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,80,40,0.9)" letterSpacing="0.06em">
        BUILT-IN
      </text>
      <text x="120" y="53" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,80,40,0.9)" letterSpacing="0.06em">
        CONTAMINATION
      </text>
      <text x="120" y="72" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Manufacturing residues
      </text>
      <text x="120" y="84" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Assembly contamination
      </text>
      <text x="120" y="96" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Casting sand / metal fines
      </text>
      <text x="120" y="108" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Residual hose fibres
      </text>
      {/* Arrow into reservoir */}
      <line x1="180" y1="130" x2="290" y2="260"
        stroke="#ff8040" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#hcp-ao)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PATH 2: INGRESSED CONTAMINATION (top right)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="580" y="20" width="200" height="130"
        fill="rgba(255,160,40,0.06)" stroke="rgba(255,160,40,0.4)" strokeWidth="1.5" rx="4" />
      <text x="680" y="40" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,160,40,0.9)" letterSpacing="0.06em">
        INGRESSED
      </text>
      <text x="680" y="53" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,160,40,0.9)" letterSpacing="0.06em">
        CONTAMINATION
      </text>
      <text x="680" y="72" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Breather / vent contamination
      </text>
      <text x="680" y="84" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Cylinder rod seals
      </text>
      <text x="680" y="96" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Fluid top-up (unfiltered)
      </text>
      <text x="680" y="108" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Access covers / service
      </text>
      <text x="680" y="120" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Water / coolant ingress
      </text>
      {/* Arrow into reservoir */}
      <line x1="620" y1="150" x2="510" y2="255"
        stroke="rgba(255,160,40,0.8)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#hcp-ao)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PATH 3: GENERATED CONTAMINATION (bottom left)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="20" y="340" width="220" height="130"
        fill="rgba(255,60,60,0.06)" stroke="rgba(255,60,60,0.4)" strokeWidth="1.5" rx="4" />
      <text x="130" y="360" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,60,60,0.9)" letterSpacing="0.06em">
        GENERATED
      </text>
      <text x="130" y="373" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fill="rgba(255,60,60,0.9)" letterSpacing="0.06em">
        CONTAMINATION
      </text>
      <text x="130" y="392" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Pump / motor wear debris
      </text>
      <text x="130" y="404" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Valve spool / bore erosion
      </text>
      <text x="130" y="416" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Seal degradation particles
      </text>
      <text x="130" y="428" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Hose interior erosion
      </text>
      <text x="130" y="440" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        Oxidation / varnish particles
      </text>
      {/* Arrow into reservoir */}
      <line x1="240" y1="380" x2="292" y2="340"
        stroke="rgba(255,60,60,0.8)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#hcp-ao)" />

      {/* ── ISO Cleanliness target ──────────────────────────────────────── */}
      <rect x="560" y="380" width="220" height="95"
        fill="rgba(100,220,100,0.05)" stroke="rgba(100,220,100,0.25)" strokeWidth="1" rx="3" />
      <text x="670" y="400" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,220,100,0.7)" letterSpacing="0.05em">
        TARGET CLEANLINESS
      </text>
      <text x="670" y="416" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(100,220,100,0.9)">
        Servo valves: ISO 14/12/10
      </text>
      <text x="670" y="430" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.8)">
        Prop. valves: ISO 17/15/12
      </text>
      <text x="670" y="444" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        Gear pumps: ISO 19/17/14
      </text>
      <text x="670" y="460" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">
        per ISO 4406 / NFPA T2.14
      </text>

      {/* Standard label */}
      <text x="780" y="490" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889 · NFPA T2.14 · ISO 4406
      </text>
    </svg>
  );
}
