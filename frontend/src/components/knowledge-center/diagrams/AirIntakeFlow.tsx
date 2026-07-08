interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AirIntakeFlow({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="aif-title aif-desc"
      viewBox="0 0 860 400"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="aif-title">Air Intake Filtration System Flow Diagram</title>
      <desc id="aif-desc">
        Sequential air intake filtration flow: ambient dusty air enters a pre-cleaner or cyclonic
        separator, passes through the main filter element, through a safety element, and exits as
        clean air to the engine intake. A restriction indicator monitors differential pressure
        across the main element. Based on ISO 5011 and SAE J726.
      </desc>

      <defs>
        <marker id="aif-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="aif-ag" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,220,100,0.9)" />
        </marker>
        <pattern id="aif-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,241,45,0.3)" strokeWidth="1" />
        </pattern>
        <pattern id="aif-safety" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(100,200,255,0.3)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ── Ambient air (left) ──────────────────────────────────────────── */}
      <text x="28" y="45" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,255,255,0.4)" letterSpacing="0.06em">
        AMBIENT AIR
      </text>
      {/* Dust particles in ambient air */}
      <circle cx="38" cy="110" r="4" fill="rgba(255,120,40,0.6)" />
      <circle cx="55" cy="90"  r="3" fill="rgba(255,120,40,0.55)" />
      <circle cx="48" cy="145" r="5" fill="rgba(255,120,40,0.6)" />
      <circle cx="68" cy="125" r="3" fill="rgba(255,120,40,0.5)" />
      <circle cx="35" cy="160" r="2.5" fill="rgba(255,120,40,0.5)" />
      <circle cx="62" cy="170" r="4" fill="rgba(255,120,40,0.55)" />
      <circle cx="45" cy="190" r="3" fill="rgba(255,120,40,0.5)" />
      <circle cx="70" cy="200" r="2" fill="rgba(255,120,40,0.4)" />

      {/* ── Pre-cleaner / cyclonic separator ─────────────────────────────── */}
      {/* Inlet duct */}
      <line x1="75" y1="160" x2="115" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#aif-ay)" />

      {/* Pre-cleaner box */}
      <rect x="115" y="100" width="80" height="120"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="4" />
      {/* Cyclonic symbol — curved arrow inside */}
      <path d="M155,130 C170,130 175,145 165,155 C155,165 140,160 140,150 C140,140 150,135 155,140"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <path d="M155,140 L162,136" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
        markerEnd="url(#aif-ay)" />
      {/* Ejected dust port (bottom) */}
      <line x1="155" y1="220" x2="155" y2="250"
        stroke="rgba(255,120,40,0.5)" strokeWidth="1.5" markerEnd="url(#aif-ay)" />
      <circle cx="155" cy="262" r="4" fill="rgba(255,120,40,0.4)" />
      <text x="162" y="262" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,120,40,0.6)">
        dust ejected
      </text>
      <text x="155" y="295" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        PRE-CLEANER
      </text>
      <text x="155" y="307" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.3)">
        cyclonic separator
      </text>

      {/* ── Flow line → main filter ──────────────────────────────────────── */}
      <line x1="195" y1="160" x2="250" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#aif-ay)" />

      {/* ── Main filter element ──────────────────────────────────────────── */}
      <rect x="250" y="80" width="130" height="160"
        fill="url(#aif-hatch)" stroke="rgba(255,241,45,0.7)" strokeWidth="2" rx="3" />
      {/* Pleated media symbol — vertical lines */}
      <line x1="270" y1="80" x2="270" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="286" y1="80" x2="286" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="302" y1="80" x2="302" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="318" y1="80" x2="318" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="334" y1="80" x2="334" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="350" y1="80" x2="350" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />
      <line x1="366" y1="80" x2="366" y2="240" stroke="rgba(255,241,45,0.25)" strokeWidth="1" />

      <text x="315" y="275" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.8)">
        MAIN FILTER
      </text>
      <text x="315" y="287" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.8)">
        ELEMENT
      </text>
      <text x="315" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.3)">
        ISO 5011 / SAE J726
      </text>

      {/* Restriction indicator connection */}
      <line x1="315" y1="80" x2="315" y2="52"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="315" y1="52" x2="400" y2="52"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" strokeDasharray="4,3" />
      {/* Restriction indicator */}
      <circle cx="420" cy="52" r="18"
        fill="rgba(255,241,45,0.08)" stroke="rgba(255,241,45,0.5)" strokeWidth="1.5" />
      {/* Gauge needle */}
      <line x1="420" y1="52" x2="430" y2="38"
        stroke="#FFF12D" strokeWidth="2" />
      <path d="M403,58 A18,18 0 0,1 437,58"
        fill="none" stroke="rgba(255,241,45,0.4)" strokeWidth="1" />
      <text x="420" y="82" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.7)">
        RESTRICTION
      </text>
      <text x="420" y="92" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.7)">
        INDICATOR
      </text>

      {/* ── Flow line → safety element ───────────────────────────────────── */}
      <line x1="380" y1="160" x2="440" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#aif-ay)" />

      {/* ── Safety element ───────────────────────────────────────────────── */}
      <rect x="440" y="120" width="70" height="80"
        fill="url(#aif-safety)" stroke="rgba(100,200,255,0.6)" strokeWidth="2" rx="2" />
      {/* Safety element media lines */}
      <line x1="456" y1="120" x2="456" y2="200" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
      <line x1="470" y1="120" x2="470" y2="200" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
      <line x1="484" y1="120" x2="484" y2="200" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
      <line x1="498" y1="120" x2="498" y2="200" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />

      <text x="475" y="225" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.7)">
        SAFETY
      </text>
      <text x="475" y="237" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.7)">
        ELEMENT
      </text>
      <text x="475" y="250" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.25)">
        secondary protection
      </text>

      {/* ── Flow line → engine ───────────────────────────────────────────── */}
      <line x1="510" y1="160" x2="590" y2="160"
        stroke="rgba(100,220,100,0.9)" strokeWidth="2" markerEnd="url(#aif-ag)" />

      {/* Clean air indicator */}
      {/* Small clean particles — only sub-micron remain */}
      <circle cx="540" cy="148" r="1.5" fill="rgba(100,220,100,0.5)" />
      <circle cx="558" cy="172" r="1"   fill="rgba(100,220,100,0.4)" />
      <circle cx="570" cy="150" r="1.5" fill="rgba(100,220,100,0.4)" />

      {/* ── Engine ──────────────────────────────────────────────────────── */}
      <rect x="590" y="100" width="120" height="120"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" rx="4" />
      {/* Engine symbol — simplified cylinders */}
      <rect x="610" y="120" width="20" height="60" rx="2"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="638" y="120" width="20" height="60" rx="2"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="666" y="120" width="20" height="60" rx="2"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="650" y="240" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        ENGINE INTAKE
      </text>

      {/* CLEAN AIR label on output line */}
      <text x="550" y="148" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,220,100,0.7)">
        CLEAN AIR
      </text>

      {/* ── Dust holding capacity note ──────────────────────────────────── */}
      <rect x="20" y="330" width="820" height="52"
        fill="rgba(255,241,45,0.04)" stroke="rgba(255,241,45,0.15)" strokeWidth="1" rx="3" />
      <text x="430" y="350" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,241,45,0.7)" letterSpacing="0.05em">
        DUST HOLDING CAPACITY (DHC) — measured per ISO 5011: mass of ISO A2 fine test dust
      </text>
      <text x="430" y="368" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">
        retained by filter to terminal restriction ΔP · determines service interval
      </text>

      {/* Standard label */}
      <text x="840" y="395" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 5011 · SAE J726
      </text>
    </svg>
  );
}
