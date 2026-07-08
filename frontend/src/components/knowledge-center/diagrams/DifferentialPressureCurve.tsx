interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DifferentialPressureCurve({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="dpc-title dpc-desc"
      viewBox="0 0 760 490"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="dpc-title">Differential Pressure vs Service Life Curve</title>
      <desc id="dpc-desc">
        Chart showing differential pressure (ΔP) across a filter element rising with contamination
        load over service life. Key thresholds: service indicator alert, bypass valve opening
        pressure, and element collapse threshold. Based on ISO 16889 and ISO 3968.
      </desc>

      {/* ── Chart region ───────────────────────────────────────────────── */}
      {/* Normal operating zone */}
      <rect x="80" y="260" width="500" height="140"
        fill="rgba(100,220,100,0.04)" />
      {/* Caution zone */}
      <rect x="80" y="175" width="580" height="85"
        fill="rgba(255,241,45,0.04)" />
      {/* Critical / bypass zone */}
      <rect x="80" y="100" width="580" height="75"
        fill="rgba(255,80,80,0.05)" />

      {/* ── Threshold lines ─────────────────────────────────────────────── */}
      {/* Service indicator threshold */}
      <line x1="80" y1="260" x2="700" y2="260"
        stroke="rgba(255,241,45,0.5)" strokeWidth="1" strokeDasharray="6,4" />
      <text x="704" y="263" fontFamily="'JetBrains Mono', monospace" fontSize="8.5"
        fill="rgba(255,241,45,0.7)" letterSpacing="0.04em">
        SERVICE INDICATOR
      </text>

      {/* Bypass valve opening */}
      <line x1="80" y1="175" x2="700" y2="175"
        stroke="rgba(255,160,40,0.6)" strokeWidth="1" strokeDasharray="6,4" />
      <text x="704" y="178" fontFamily="'JetBrains Mono', monospace" fontSize="8.5"
        fill="rgba(255,160,40,0.8)" letterSpacing="0.04em">
        BYPASS OPENS
      </text>

      {/* Element collapse threshold */}
      <line x1="80" y1="100" x2="700" y2="100"
        stroke="rgba(255,60,60,0.6)" strokeWidth="1" strokeDasharray="6,4" />
      <text x="704" y="103" fontFamily="'JetBrains Mono', monospace" fontSize="8.5"
        fill="rgba(255,60,60,0.8)" letterSpacing="0.04em">
        COLLAPSE RISK
      </text>

      {/* ── ΔP curve ───────────────────────────────────────────────────── */}
      {/* Smooth S-curve: starts low, rises progressively, accelerates near bypass */}
      <path
        d="M80,395 C130,392 170,385 220,370 C260,358 295,340 330,315
           C365,290 395,268 430,245 C460,226 488,210 515,196
           C540,184 565,178 590,173 C620,168 650,162 680,155"
        fill="none"
        stroke="#FFF12D"
        strokeWidth="2.5"
      />

      {/* Key point: Initial ΔP */}
      <circle cx="80" cy="395" r="5" fill="#FFF12D" />
      <text x="88" y="410" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,255,255,0.6)">
        Initial ΔP
      </text>
      <text x="88" y="421" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,255,255,0.35)">
        (clean element)
      </text>

      {/* Key point where curve crosses service indicator (~x=510) */}
      <circle cx="512" cy="260" r="5" fill="rgba(255,241,45,0.9)" />
      <line x1="512" y1="250" x2="512" y2="230"
        stroke="rgba(255,241,45,0.5)" strokeWidth="1" />
      <text x="516" y="224" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,241,45,0.7)">
        Replace element
      </text>

      {/* Zone labels */}
      <text x="88" y="295" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(100,220,100,0.6)" letterSpacing="0.05em">
        NORMAL OPERATING RANGE
      </text>
      <text x="88" y="222" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,241,45,0.5)" letterSpacing="0.05em">
        SERVICE INTERVAL EXCEEDED
      </text>
      <text x="88" y="140" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,80,80,0.6)" letterSpacing="0.05em">
        BYPASS ACTIVE — UNFILTERED FLOW
      </text>

      {/* ── Axes ───────────────────────────────────────────────────────── */}
      {/* Y-axis */}
      <line x1="80" y1="60" x2="80" y2="410"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1="80" y1="410" x2="700" y2="410"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

      {/* Y-axis label */}
      <text x="22" y="235" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,255,255,0.45)" transform="rotate(-90, 22, 235)" textAnchor="middle" letterSpacing="0.06em">
        DIFFERENTIAL PRESSURE ΔP
      </text>

      {/* X-axis label */}
      <text x="390" y="440" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,255,255,0.45)" letterSpacing="0.06em">
        CONTAMINATION LOAD / SERVICE TIME →
      </text>

      {/* X-axis endpoints */}
      <text x="80" y="455" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.3)">
        NEW
      </text>
      <text x="680" y="455" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.3)">
        END OF LIFE
      </text>

      {/* Bypass valve symbol on Y-axis at bypass threshold */}
      <rect x="60" y="167" width="20" height="16" rx="2"
        fill="rgba(255,160,40,0.15)" stroke="rgba(255,160,40,0.5)" strokeWidth="1" />
      <text x="70" y="178" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,160,40,0.8)">
        BV
      </text>

      {/* ── Standards label ─────────────────────────────────────────────── */}
      <text x="696" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889 · ISO 3968
      </text>
    </svg>
  );
}
