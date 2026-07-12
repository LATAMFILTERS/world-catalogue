interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function CompressedAirTreatment({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="cat-title cat-desc"
      viewBox="0 0 900 400"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="cat-title">Compressed Air Treatment Train — ISO 8573-1</title>
      <desc id="cat-desc">
        Sequential compressed air treatment stages: compressor, aftercooler and moisture separator,
        refrigerant or desiccant dryer, particulate filter (Class 1 dust), coalescing oil mist
        filter (Class 1 oil), and activated carbon filter (Class 1 hydrocarbons). ISO 8573-1
        purity class level achieved at each stage is shown.
      </desc>

      <defs>
        <marker id="cat-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="cat-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,100,0.9)" />
        </marker>
        <marker id="cat-aw" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,180,255,0.9)" />
        </marker>
      </defs>

      {/* ── Main flow pipe (top of each stage) ─────────────────────────── */}
      {/* Stage connection pipe at y=160 */}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 0: Compressor
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ambient air inlet */}
      <text x="18" y="155" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,120,40,0.6)">
        AMBIENT
      </text>
      <line x1="18" y1="165" x2="40" y2="165"
        stroke="rgba(255,120,40,0.6)" strokeWidth="1.5" markerEnd="url(#cat-ay)" />

      {/* Compressor body */}
      <rect x="40" y="125" width="70" height="80"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="3" />
      {/* Compressor symbol — triangle with stroke */}
      <polygon points="55,175 90,145 90,205"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <text x="75" y="228" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.55)">
        COMPRESSOR
      </text>

      {/* Connection pipe */}
      <line x1="110" y1="165" x2="140" y2="165"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cat-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 1: Aftercooler + Moisture Separator
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="140" y="115" width="80" height="100"
        fill="rgba(100,180,255,0.06)" stroke="rgba(100,180,255,0.45)" strokeWidth="1.5" rx="3" />
      {/* Cooling coil symbol */}
      <path d="M152,145 Q162,135 172,145 Q182,155 192,145 Q202,135 210,145"
        fill="none" stroke="rgba(100,180,255,0.6)" strokeWidth="1.5" />
      <path d="M152,158 Q162,148 172,158 Q182,168 192,158 Q202,148 210,158"
        fill="none" stroke="rgba(100,180,255,0.6)" strokeWidth="1.5" />
      {/* Condensate drain */}
      <line x1="180" y1="215" x2="180" y2="245"
        stroke="rgba(100,180,255,0.5)" strokeWidth="1.5" markerEnd="url(#cat-aw)" />
      <circle cx="180" cy="255" r="4" fill="rgba(100,180,255,0.4)" />
      <text x="188" y="258" fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
        fill="rgba(100,180,255,0.6)">
        condensate drain
      </text>
      <text x="180" y="285" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        AFTERCOOLER +
      </text>
      <text x="180" y="296" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        SEPARATOR
      </text>

      <line x1="220" y1="165" x2="260" y2="165"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cat-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 2: Desiccant Dryer
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="260" y="115" width="75" height="100"
        fill="rgba(255,241,45,0.05)" stroke="rgba(255,241,45,0.4)" strokeWidth="1.5" rx="3" />
      {/* Desiccant beads pattern */}
      {[0,1,2,3,4].map(row => (
        [0,1,2].map(col => (
          <circle key={`${row}-${col}`}
            cx={272 + col * 16} cy={128 + row * 18} r="4"
            fill="rgba(255,241,45,0.2)" stroke="rgba(255,241,45,0.3)" strokeWidth="0.5" />
        ))
      ))}
      {/* Water drain */}
      <line x1="297" y1="215" x2="297" y2="245"
        stroke="rgba(100,180,255,0.4)" strokeWidth="1.5" markerEnd="url(#cat-aw)" />
      <text x="297" y="285" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        DESICCANT
      </text>
      <text x="297" y="296" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        DRYER
      </text>

      {/* Dew point label */}
      <text x="297" y="310" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,180,255,0.5)">
        DP ≤ −40°C
      </text>

      <line x1="335" y1="165" x2="375" y2="165"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cat-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 3: Particulate Filter (dust)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Compressed air filter symbol — circle with inner symbol */}
      <circle cx="407" cy="165" r="40"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      {/* Diamond inside circle (filter element symbol) */}
      <polygon points="407,135 437,165 407,195 377,165"
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Filter lines inside diamond */}
      <line x1="390" y1="155" x2="424" y2="175" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="390" y1="165" x2="424" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="390" y1="175" x2="424" y2="155" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      {/* Drain (particles collect) */}
      <line x1="407" y1="205" x2="407" y2="240"
        stroke="rgba(255,120,40,0.4)" strokeWidth="1.5" markerEnd="url(#cat-ay)" />

      <text x="407" y="275" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        PARTICULATE
      </text>
      <text x="407" y="286" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        FILTER
      </text>
      <text x="407" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.5)">
        ISO 8573-1 dust
      </text>

      <line x1="447" y1="165" x2="490" y2="165"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cat-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 4: Oil Coalescer
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <circle cx="527" cy="165" r="40"
        fill="rgba(255,241,45,0.04)" stroke="rgba(255,241,45,0.45)" strokeWidth="1.5" />
      <polygon points="527,135 557,165 527,195 497,165"
        fill="rgba(255,241,45,0.05)" stroke="rgba(255,241,45,0.3)" strokeWidth="1" />
      <line x1="510" y1="155" x2="544" y2="175" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="510" y1="165" x2="544" y2="165" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="510" y1="175" x2="544" y2="155" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />

      {/* Oil drain bottom */}
      <line x1="527" y1="205" x2="527" y2="240"
        stroke="rgba(200,160,40,0.5)" strokeWidth="1.5" markerEnd="url(#cat-ay)" />
      <circle cx="527" cy="248" r="3" fill="rgba(200,160,40,0.4)" />

      <text x="527" y="275" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        OIL COALESCER
      </text>
      <text x="527" y="286" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        (coalescing)
      </text>
      <text x="527" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.5)">
        ISO 8573-1 oil mist
      </text>

      <line x1="567" y1="165" x2="612" y2="165"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#cat-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 5: Activated Carbon (optional)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <circle cx="647" cy="165" r="40"
        fill="rgba(100,220,100,0.04)" stroke="rgba(100,220,100,0.4)" strokeWidth="1.5" />
      {/* Carbon granule pattern */}
      {[0,1,2].map(row => (
        [0,1,2,3].map(col => (
          <circle key={`c${row}-${col}`}
            cx={622 + col * 10} cy={148 + row * 12} r="3"
            fill="rgba(100,220,100,0.2)" stroke="rgba(100,220,100,0.3)" strokeWidth="0.5" />
        ))
      ))}
      <text x="647" y="275" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        ACTIVATED
      </text>
      <text x="647" y="286" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        CARBON
      </text>
      <text x="647" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,220,100,0.5)">
        hydrocarbons
      </text>

      <line x1="687" y1="165" x2="730" y2="165"
        stroke="rgba(100,220,100,0.9)" strokeWidth="2" markerEnd="url(#cat-ag)" />

      {/* ── End use ──────────────────────────────────────────────────────── */}
      <rect x="730" y="130" width="80" height="70"
        fill="rgba(100,220,100,0.05)" stroke="rgba(100,220,100,0.4)" strokeWidth="1.5" rx="3" />
      <text x="770" y="162" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(100,220,100,0.7)">
        CLEAN
      </text>
      <text x="770" y="175" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(100,220,100,0.7)">
        AIR
      </text>
      <text x="770" y="188" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,220,100,0.45)">
        Class 1.1.1
      </text>
      <text x="770" y="228" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">
        END USE
      </text>

      {/* ── ISO 8573-1 class reference ──────────────────────────────────── */}
      <rect x="20" y="325" width="860" height="60"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" rx="3" />
      <text x="430" y="344" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.55)" letterSpacing="0.05em">
        ISO 8573-1 PURITY CLASSES — three-number code: [particles] [water] [oil]
      </text>
      <text x="430" y="360" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">
        Class 1.1.1: ≤0.1µm·mg/m³ · dew point ≤−70°C · ≤0.01mg/m³ oil · highest purity
      </text>
      <text x="430" y="375" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.25)">
        ISO 8573-2 specifies test methods for oil content measurement
      </text>

      {/* Standard label */}
      <text x="876" y="396" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 8573-1 · ISO 8573-2
      </text>
    </svg>
  );
}
