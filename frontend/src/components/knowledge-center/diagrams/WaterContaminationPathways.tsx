interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function WaterContaminationPathways({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="wcp-title wcp-desc"
      viewBox="0 0 860 520"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="wcp-title">Water Contamination Pathways in Fuel and Hydraulic Systems</title>
      <desc id="wcp-desc">
        Diagram showing five water ingress pathways into a central fuel/hydraulic tank:
        atmospheric condensation through breather vent, contaminated fill via fill cap,
        worn shaft seals, cross-contamination from connected circuits, and airborne
        humidity ingression. Right side shows consequence chain: free water accumulation
        leading to microbial growth, filter plugging, injector corrosion, and HPCR pump
        damage. Detection box shows Karl Fischer titration per ASTM D6304 and ISO 12937
        with target below 200 ppm wt water content.
      </desc>

      <defs>
        <marker id="wcp-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="wcp-ar" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.7)" />
        </marker>
        <marker id="wcp-aw" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,80,80,0.7)" />
        </marker>
        <marker id="wcp-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,120,0.7)" />
        </marker>

        {/* Water drop pattern inside tank */}
        <pattern id="wcp-fluid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="1.5" fill="rgba(100,200,255,0.18)" />
        </pattern>

        {/* Hatch for danger zone */}
        <pattern id="wcp-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,80,80,0.2)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ── TITLE ────────────────────────────────────────────────────────── */}
      <text x="430" y="22" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="700"
        fill="#FFF12D" letterSpacing="0.08em">
        WATER CONTAMINATION INGRESS PATHWAYS
      </text>
      <text x="430" y="36" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
        fill="rgba(255,255,255,0.35)" letterSpacing="0.04em">
        Fuel &amp; Hydraulic Systems — ASTM D6304 · ISO 12937 · ISO 16332
      </text>

      {/* ══════════════════════════════════════════════════════════════════════
          CENTRAL TANK
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Tank body */}
      <rect x="290" y="185" width="200" height="180"
        fill="url(#wcp-fluid)"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" rx="4" />
      <rect x="290" y="185" width="200" height="180"
        fill="rgba(0,60,120,0.15)" rx="4" />

      {/* Tank label */}
      <text x="390" y="260" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700"
        fill="rgba(255,255,255,0.7)" letterSpacing="0.06em">
        FUEL /
      </text>
      <text x="390" y="274" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700"
        fill="rgba(255,255,255,0.7)" letterSpacing="0.06em">
        HYDRAULIC
      </text>
      <text x="390" y="288" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700"
        fill="rgba(255,255,255,0.7)" letterSpacing="0.06em">
        TANK
      </text>

      {/* Free water layer at bottom of tank */}
      <rect x="291" y="334" width="198" height="30"
        fill="rgba(100,200,255,0.22)" rx="0" />
      <rect x="291" y="334" width="198" height="30"
        fill="url(#wcp-hatch)" />
      <text x="390" y="353" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(100,200,255,0.8)">
        FREE WATER (bottom layer)
      </text>

      {/* Water level indicator line */}
      <line x1="292" y1="334" x2="488" y2="334"
        stroke="rgba(100,200,255,0.6)" strokeWidth="1" strokeDasharray="4,2" />

      {/* ══════════════════════════════════════════════════════════════════════
          INGRESS PATHWAYS — 5 arrows converging on tank
      ══════════════════════════════════════════════════════════════════════ */}

      {/* PATH 1: ATMOSPHERIC CONDENSATION — top center (via breather vent) */}
      <rect x="345" y="52" width="90" height="40"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1" rx="2" />
      <text x="390" y="67" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        BREATHER VENT
      </text>
      <text x="390" y="79" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        atmospheric humidity
      </text>
      <line x1="390" y1="92" x2="390" y2="183"
        stroke="rgba(100,200,255,0.6)" strokeWidth="1.5" strokeDasharray="5,3"
        markerEnd="url(#wcp-ar)" />
      <text x="396" y="140" fontFamily="'JetBrains Mono', monospace" fontSize="6.5"
        fill="rgba(100,200,255,0.55)">
        condensation cycle
      </text>

      {/* PATH 2: CONTAMINATED FILL — top-left */}
      <rect x="80" y="52" width="90" height="40"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1" rx="2" />
      <text x="125" y="67" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        FILL CAP /
      </text>
      <text x="125" y="79" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        FILLING
      </text>
      {/* Arrow: fill cap → tank top-left corner */}
      <path d="M170 72 Q230 72 270 200"
        fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" strokeDasharray="5,3"
        markerEnd="url(#wcp-ar)" />
      <text x="200" y="132" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        wet fuel /
      </text>
      <text x="200" y="143" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        dirty nozzle
      </text>

      {/* PATH 3: WORN SEALS — left side */}
      <rect x="55" y="255" width="100" height="40"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1" rx="2" />
      <text x="105" y="270" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        WORN SEALS /
      </text>
      <text x="105" y="282" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        GASKETS
      </text>
      <line x1="155" y1="275" x2="288" y2="275"
        stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" strokeDasharray="5,3"
        markerEnd="url(#wcp-ar)" />
      <text x="220" y="267" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        shaft ingress
      </text>

      {/* PATH 4: CROSS-CONTAMINATION — bottom-left */}
      <rect x="65" y="380" width="115" height="40"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1" rx="2" />
      <text x="122" y="395" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        CROSS-CONT.
      </text>
      <text x="122" y="407" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        CIRCUIT
      </text>
      <path d="M180 400 Q235 400 275 370"
        fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" strokeDasharray="5,3"
        markerEnd="url(#wcp-ar)" />
      <text x="210" y="393" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        return line water
      </text>

      {/* PATH 5: AIRBORNE HUMIDITY — top-right */}
      <rect x="615" y="52" width="105" height="40"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.35)" strokeWidth="1" rx="2" />
      <text x="667" y="67" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        AIRBORNE
      </text>
      <text x="667" y="79" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.8)">
        HUMIDITY
      </text>
      <path d="M615 72 Q530 72 500 195"
        fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" strokeDasharray="5,3"
        markerEnd="url(#wcp-ar)" />
      <text x="558" y="120" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        hygroscopic
      </text>
      <text x="558" y="131" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(100,200,255,0.5)">
        absorption
      </text>

      {/* ══════════════════════════════════════════════════════════════════════
          CONSEQUENCE CHAIN — right side
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Exit arrow from tank */}
      <line x1="490" y1="275" x2="530" y2="275"
        stroke="rgba(255,80,80,0.7)" strokeWidth="2" markerEnd="url(#wcp-aw)" />
      <text x="510" y="267" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,80,80,0.55)">
        consequence
      </text>

      {/* Chain box 1: Microbial Growth */}
      <rect x="532" y="150" width="150" height="44"
        fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.35)" strokeWidth="1" rx="2" />
      <text x="607" y="166" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,180,80,0.8)"
        letterSpacing="0.04em">
        MICROBIAL GROWTH
      </text>
      <text x="607" y="181" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        HIF bacteria, fungal colonies
      </text>
      <text x="607" y="191" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        (free water &gt;200 ppm wt)
      </text>

      {/* Connector 1→2 */}
      <line x1="607" y1="194" x2="607" y2="210"
        stroke="rgba(255,80,80,0.55)" strokeWidth="1.5" markerEnd="url(#wcp-aw)" />

      {/* Chain box 2: Filter Plugging */}
      <rect x="532" y="212" width="150" height="44"
        fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.35)" strokeWidth="1" rx="2" />
      <text x="607" y="228" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,180,80,0.8)"
        letterSpacing="0.04em">
        FILTER PLUGGING
      </text>
      <text x="607" y="243" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        biomass + wax deposits
      </text>
      <text x="607" y="253" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        ΔP spike → bypass open
      </text>

      {/* Connector 2→3 */}
      <line x1="607" y1="256" x2="607" y2="272"
        stroke="rgba(255,80,80,0.55)" strokeWidth="1.5" markerEnd="url(#wcp-aw)" />

      {/* Chain box 3: Injector Corrosion */}
      <rect x="532" y="274" width="150" height="44"
        fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.35)" strokeWidth="1" rx="2" />
      <text x="607" y="290" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,180,80,0.8)"
        letterSpacing="0.04em">
        INJECTOR CORROSION
      </text>
      <text x="607" y="305" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        nozzle erosion, stiction
      </text>
      <text x="607" y="315" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        spray pattern degradation
      </text>

      {/* Connector 3→4 */}
      <line x1="607" y1="318" x2="607" y2="334"
        stroke="rgba(255,80,80,0.55)" strokeWidth="1.5" markerEnd="url(#wcp-aw)" />

      {/* Chain box 4: HPCR Pump Damage */}
      <rect x="532" y="336" width="150" height="48"
        fill="rgba(255,80,80,0.1)" stroke="rgba(255,80,80,0.6)" strokeWidth="1.5" rx="2" />
      <text x="607" y="353" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,80,80,0.9)"
        letterSpacing="0.04em">
        HPCR PUMP DAMAGE
      </text>
      <text x="607" y="368" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        plunger/barrel seizure
      </text>
      <text x="607" y="378" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        2000 bar clearance failure
      </text>

      {/* Free water box connecting tank to chain */}
      <rect x="532" y="106" width="150" height="40"
        fill="rgba(100,200,255,0.08)" stroke="rgba(100,200,255,0.4)" strokeWidth="1" rx="2" />
      <text x="607" y="120" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.85)"
        letterSpacing="0.04em">
        FREE WATER
      </text>
      <text x="607" y="134" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        accumulated at tank bottom
      </text>
      <text x="607" y="143" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="rgba(255,255,255,0.4)">
        &gt;200 ppm wt saturation
      </text>

      {/* Arrow: free water → microbial growth */}
      <line x1="607" y1="146" x2="607" y2="148"
        stroke="rgba(255,80,80,0.55)" strokeWidth="1.5" markerEnd="url(#wcp-aw)" />

      {/* Arrow: tank exit → free water box */}
      <line x1="490" y1="340" x2="520" y2="340"
        stroke="rgba(100,200,255,0.5)" strokeWidth="1.5" />
      <line x1="520" y1="340" x2="520" y2="126"
        stroke="rgba(100,200,255,0.5)" strokeWidth="1.5" />
      <line x1="520" y1="126" x2="530" y2="126"
        stroke="rgba(100,200,255,0.5)" strokeWidth="1.5" markerEnd="url(#wcp-ar)" />

      {/* ══════════════════════════════════════════════════════════════════════
          DETECTION BOX — bottom left
      ══════════════════════════════════════════════════════════════════════ */}
      <rect x="30" y="430" width="420" height="74"
        fill="rgba(100,220,120,0.05)" stroke="rgba(100,220,120,0.3)" strokeWidth="1.5" rx="3" />
      <rect x="30" y="430" width="420" height="20"
        fill="rgba(100,220,120,0.08)" />
      <text x="240" y="445" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,220,120,0.8)"
        letterSpacing="0.06em">
        DETECTION — ASTM D6304 / ISO 12937
      </text>
      <text x="240" y="463" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="#FFF12D" fontWeight="700">
        Karl Fischer Coulometric Titration
      </text>
      <text x="240" y="477" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">
        Target: &lt;200 ppm wt (dissolved) · Action: &gt;500 ppm wt (free water present)
      </text>
      <text x="240" y="490" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.3)">
        ISO 12937 §6 — detection limit 10 ppm wt · ASTM D6304 — diesel/hydraulic fluid
      </text>
      <text x="240" y="500" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.3)">
        ISO 16332 — water separator efficiency test &gt;95% water removal at rated flow
      </text>

      {/* ══════════════════════════════════════════════════════════════════════
          PREVENTION BOX — bottom right
      ══════════════════════════════════════════════════════════════════════ */}
      <rect x="470" y="430" width="360" height="74"
        fill="rgba(255,241,45,0.04)" stroke="rgba(255,241,45,0.25)" strokeWidth="1.5" rx="3" />
      <rect x="470" y="430" width="360" height="20"
        fill="rgba(255,241,45,0.07)" />
      <text x="650" y="445" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.8)"
        letterSpacing="0.06em">
        PREVENTION TECHNOLOGIES
      </text>
      {[
        { t: 'HYDROCORE — coalescing water separator, bulk free-water removal', y: 463 },
        { t: 'SYNTEPORE — glass-fiber fuel media, hydrophobic coating repels water', y: 477 },
        { t: 'TURBOCORE — 3-stage fuel treatment: pre-filter + coalesce + final', y: 491 },
        { t: 'Desiccant breather recommended on all non-pressurised vent ports', y: 503 },
      ].map(row => (
        <text key={row.y} x="480" y={row.y}
          fontFamily="'JetBrains Mono', monospace" fontSize="6.8" fill="rgba(255,255,255,0.45)">
          {row.t}
        </text>
      ))}

      {/* Standard label */}
      <text x="850" y="515" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)"
        letterSpacing="0.06em">
        ASTM D6304 · ISO 12937 · ISO 16332
      </text>
    </svg>
  );
}
