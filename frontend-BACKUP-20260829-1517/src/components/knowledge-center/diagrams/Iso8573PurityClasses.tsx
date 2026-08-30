interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Iso8573PurityClasses({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="iso8573-title iso8573-desc"
      viewBox="0 0 860 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="iso8573-title">ISO 8573-1 Compressed Air Purity Classes</title>
      <desc id="iso8573-desc">
        Three-panel reference chart for ISO 8573-1:2010. Top panel shows solid particle purity
        classes 0–5 by particle count per cubic metre at ≥0.1 µm, ≥0.5 µm, ≥1 µm, and ≥5 µm.
        Middle panel shows water content as maximum pressure dew point from Class 1 (−70 °C)
        to Class 6 (+10 °C). Bottom panel shows total oil content from Class 1 (0.01 mg/m³)
        to Class 4 (5 mg/m³). Lower class number means tighter / cleaner air.
      </desc>

      {/* ── Global labels ─────────────────────────────────────────────────── */}
      <text x="430" y="22" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="700"
        fill="#FFF12D" letterSpacing="0.08em">
        ISO 8573-1:2010 — COMPRESSED AIR PURITY CLASSES
      </text>

      {/* "tighter →" direction indicator */}
      <text x="62" y="38" fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
        fill="rgba(255,255,255,0.3)">
        ← TIGHTER (more stringent)
      </text>
      <line x1="60" y1="32" x2="230" y2="32"
        stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" markerEnd="url(#iso8573-al)" />

      <defs>
        <marker id="iso8573-al" viewBox="0 0 8 6" refX="0" refY="3"
          markerWidth="6" markerHeight="5" orient="auto-start-reverse">
          <path d="M8 0L0 3L8 6Z" fill="rgba(255,255,255,0.3)" />
        </marker>
        <marker id="iso8573-ar" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="6" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 1: SOLID PARTICLES
      ══════════════════════════════════════════════════════════════════════ */}
      <rect x="30" y="44" width="800" height="148"
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Panel header */}
      <rect x="30" y="44" width="800" height="22"
        fill="rgba(255,241,45,0.08)" />
      <text x="430" y="59" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,241,45,0.8)"
        letterSpacing="0.06em">
        SOLID PARTICLES — MAX COUNT PER m³ AT STATED SIZE RANGE
      </text>

      {/* Column headers */}
      {[
        { x: 90,  label: 'CLASS' },
        { x: 195, label: '≥0.1 µm' },
        { x: 330, label: '≥0.5 µm' },
        { x: 460, label: '≥1 µm' },
        { x: 595, label: '≥5 µm' },
        { x: 730, label: 'ISO CODE' },
      ].map(col => (
        <text key={col.x} x={col.x} y="82" textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
          fill="rgba(255,255,255,0.45)" letterSpacing="0.04em">
          {col.label}
        </text>
      ))}

      {/* Vertical dividers */}
      {[145, 265, 395, 525, 655].map(x => (
        <line key={x} x1={x} y1="66" x2={x} y2="192"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Row data: [class, ≥0.1µm, ≥0.5µm, ≥1µm, ≥5µm] */}
      {[
        { cls: '0',  c01: 'per spec', c05: 'per spec', c1: 'per spec', c5: 'per spec', highlight: true },
        { cls: '1',  c01: '20 000',  c05: '400',      c1: '10',       c5: '0' },
        { cls: '2',  c01: '400 000', c05: '6 000',    c1: '100',      c5: '2' },
        { cls: '3',  c01: '—',       c05: '90 000',   c1: '1 000',    c5: '10' },
        { cls: '4',  c01: '—',       c05: '—',        c1: '10 000',   c5: '500' },
        { cls: '5',  c01: '—',       c05: '—',        c1: '100 000',  c5: '1 000' },
      ].map((row, i) => {
        const y = 92 + i * 17;
        return (
          <g key={row.cls}>
            {row.highlight && (
              <rect x="31" y={y - 10} width="798" height="16"
                fill="rgba(255,241,45,0.05)" stroke="rgba(255,241,45,0.2)" strokeWidth="0.5" />
            )}
            {[
              { x: 90,  v: row.cls },
              { x: 195, v: row.c01 },
              { x: 330, v: row.c05 },
              { x: 460, v: row.c1 },
              { x: 595, v: row.c5 },
              { x: 730, v: `ISO 8573-1 Class ${row.cls}` },
            ].map(cell => (
              <text key={cell.x} x={cell.x} y={y} textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={cell.x === 730 ? 6.5 : 8}
                fill={row.highlight ? 'rgba(255,241,45,0.7)' : cell.x === 90 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)'}>
                {cell.v}
              </text>
            ))}
          </g>
        );
      })}

      {/* Row 6+: "..." indication */}
      <text x="90" y="197" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.2)">
        6–9…
      </text>
      <text x="350" y="197" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.2)">
        (see ISO 8573-1:2010 Table 1 for complete values)
      </text>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 2: WATER CONTENT — Pressure Dew Point
      ══════════════════════════════════════════════════════════════════════ */}
      <rect x="30" y="202" width="800" height="115"
        fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      <rect x="30" y="202" width="800" height="22"
        fill="rgba(100,180,255,0.08)" />
      <text x="430" y="217" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,180,255,0.8)"
        letterSpacing="0.06em">
        WATER CONTENT — MAXIMUM PRESSURE DEW POINT [°C]
      </text>

      {/* Dew point bars */}
      {[
        { cls: '1', label: '−70 °C', pct: 0.08, color: 'rgba(100,200,255,0.7)' },
        { cls: '2', label: '−40 °C', pct: 0.22, color: 'rgba(100,200,255,0.6)' },
        { cls: '3', label: '−20 °C', pct: 0.38, color: 'rgba(100,200,255,0.55)' },
        { cls: '4', label:  '+3 °C', pct: 0.56, color: 'rgba(100,200,255,0.45)' },
        { cls: '5', label:  '+7 °C', pct: 0.72, color: 'rgba(100,200,255,0.4)' },
        { cls: '6', label: '+10 °C', pct: 0.88, color: 'rgba(100,200,255,0.35)' },
      ].map((row, i) => {
        const y = 232 + i * 13.5;
        const barW = row.pct * 620;
        return (
          <g key={row.cls}>
            <text x="75" y={y + 9} textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="8"
              fill="rgba(255,255,255,0.6)">
              {row.cls}
            </text>
            <rect x="100" y={y} width={barW} height="11"
              fill={row.color} rx="1" />
            <text x={105 + barW} y={y + 9}
              fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
              fill="rgba(255,255,255,0.5)">
              {row.label}
            </text>
          </g>
        );
      })}

      <text x="100" y="318" fontFamily="'JetBrains Mono', monospace" fontSize="7"
        fill="rgba(255,255,255,0.25)">
        100  →  driest Class 1 (−70 °C) ·····················dryness →····················· wettest Class 6 (+10 °C)
      </text>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 3: OIL CONTENT
      ══════════════════════════════════════════════════════════════════════ */}
      <rect x="30" y="324" width="800" height="138"
        fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      <rect x="30" y="324" width="800" height="22"
        fill="rgba(255,200,40,0.08)" />
      <text x="430" y="339" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,200,40,0.8)"
        letterSpacing="0.06em">
        TOTAL OIL CONTENT — MAXIMUM [mg/m³]
      </text>

      {/* Oil bars */}
      {[
        { cls: '1', label: '0.01', val: 0.01,  pct: 0.04, color: 'rgba(255,200,40,0.7)' },
        { cls: '2', label: '0.1',  val: 0.1,   pct: 0.18, color: 'rgba(255,200,40,0.6)' },
        { cls: '3', label: '1',    val: 1,     pct: 0.42, color: 'rgba(255,200,40,0.5)' },
        { cls: '4', label: '5',    val: 5,     pct: 0.88, color: 'rgba(255,200,40,0.4)' },
        { cls: 'X', label: 'per spec', val: 0, pct: 0, color: 'rgba(255,241,45,0.25)' },
      ].map((row, i) => {
        const y = 355 + i * 20;
        return (
          <g key={row.cls}>
            <text x="75" y={y + 12} textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="8"
              fill={row.cls === 'X' ? 'rgba(255,241,45,0.6)' : 'rgba(255,255,255,0.6)'}>
              {row.cls}
            </text>
            {row.pct > 0 && (
              <rect x="100" y={y} width={row.pct * 680} height="14"
                fill={row.color} rx="1" />
            )}
            <text x={row.pct > 0 ? 108 + row.pct * 680 : 108} y={y + 11}
              fontFamily="'JetBrains Mono', monospace" fontSize="8"
              fill="rgba(255,255,255,0.5)">
              {row.label} mg/m³
            </text>
          </g>
        );
      })}

      {/* Standard label */}
      <text x="850" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)"
        letterSpacing="0.06em">
        ISO 8573-1:2010
      </text>
    </svg>
  );
}
