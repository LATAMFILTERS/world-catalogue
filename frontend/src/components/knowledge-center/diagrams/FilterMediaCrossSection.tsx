interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function FilterMediaCrossSection({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="fmcs-title fmcs-desc"
      viewBox="0 0 860 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="fmcs-title">Filter Element Media Cross-Section</title>
      <desc id="fmcs-desc">
        Cross-sectional view through a cylindrical filter element from outside to center.
        Outer wrap (protective), pre-filter coarse layer, main synthetic/glass-fiber media
        depth zone (progressive-density gradient), anti-collapse scrim, and perforated steel
        center tube. Particle capture is progressive: large particles at outer layer,
        medium at mid-depth, fine at inner zones. Beta ratio formula shown.
      </desc>

      <defs>
        <pattern id="fmcs-coarse-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2="10" y2="0" stroke="rgba(255,200,80,0.3)" strokeWidth="1.2" />
        </pattern>
        <pattern id="fmcs-media-hatch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(255,241,45,0.25)" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="6" y2="6" stroke="rgba(255,241,45,0.15)" strokeWidth="0.8" />
        </pattern>
        <pattern id="fmcs-tube-lines" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.5" fill="none" stroke="rgba(100,200,255,0.35)" strokeWidth="1" />
        </pattern>
        <marker id="fmcs-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="fmcs-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.7)" />
        </marker>
        <marker id="fmcs-ar" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
      </defs>

      {/* ── Layer boundaries (x positions) ──────────────────────────────────
          outer-edge: x=60
          wrap right: x=100
          pre-filter right: x=185
          media right (inner): x=660
          scrim right: x=680
          center-tube right: x=760
          center-tube interior: x=700 — x=760
      ── */}

      {/* ── OUTER WRAP ──────────────────────────────────────────────────── */}
      <rect x="60" y="100" width="40" height="280"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeDasharray="6,3" />
      <text x="80" y="60" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.5)" letterSpacing="0.05em">
        OUTER WRAP
      </text>
      <line x1="80" y1="65" x2="80" y2="98" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="3,2" />

      {/* ── PRE-FILTER (COARSE) LAYER ───────────────────────────────────── */}
      <rect x="100" y="100" width="85" height="280"
        fill="url(#fmcs-coarse-hatch)"
        stroke="rgba(255,200,80,0.4)" strokeWidth="1" />
      <rect x="100" y="100" width="85" height="280"
        fill="rgba(255,200,80,0.05)" />
      <text x="142" y="60" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,200,80,0.7)" letterSpacing="0.04em">
        PRE-FILTER
      </text>
      <text x="142" y="72" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,200,80,0.5)">
        (COARSE)
      </text>
      <line x1="142" y1="76" x2="142" y2="98" stroke="rgba(255,200,80,0.2)" strokeWidth="0.8" strokeDasharray="3,2" />

      {/* Large particles trapped in pre-filter */}
      <circle cx="120" cy="165" r="7" fill="rgba(255,120,40,0.55)" stroke="rgba(255,120,40,0.8)" strokeWidth="1" />
      <circle cx="155" cy="200" r="6" fill="rgba(255,120,40,0.5)" stroke="rgba(255,120,40,0.7)" strokeWidth="1" />
      <circle cx="130" cy="310" r="6.5" fill="rgba(255,120,40,0.5)" stroke="rgba(255,120,40,0.75)" strokeWidth="1" />
      <circle cx="165" cy="270" r="5.5" fill="rgba(255,120,40,0.45)" stroke="rgba(255,120,40,0.65)" strokeWidth="1" />
      <circle cx="115" cy="240" r="5" fill="rgba(255,120,40,0.4)" />
      <circle cx="148" cy="140" r="5" fill="rgba(255,120,40,0.45)" />

      {/* ── MAIN FILTRATION MEDIA ────────────────────────────────────────── */}
      <rect x="185" y="100" width="475" height="280"
        fill="url(#fmcs-media-hatch)" />
      <rect x="185" y="100" width="475" height="280"
        fill="rgba(255,241,45,0.03)"
        stroke="rgba(255,241,45,0.5)" strokeWidth="1.5" />

      {/* Depth zone label */}
      <text x="422" y="60" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.7)" letterSpacing="0.06em">
        FILTRATION MEDIA (DEPTH ZONE)
      </text>
      <text x="422" y="73" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.45)">
        progressive-density gradient · ISO 16889
      </text>
      <line x1="422" y1="77" x2="422" y2="98" stroke="rgba(255,241,45,0.2)" strokeWidth="0.8" strokeDasharray="3,2" />

      {/* Media vertical density lines (denser toward center) */}
      {[220, 250, 270, 285, 295, 305, 313, 320, 326, 332, 337, 341, 345, 349].map((x, i) => (
        <line key={i} x1={x} y1="100" x2={x} y2="380"
          stroke={`rgba(255,241,45,${0.05 + i * 0.015})`} strokeWidth="0.7" />
      ))}
      {[380, 420, 460, 490, 515, 535, 552, 566, 578, 589, 598, 606, 613, 620].map((x, i) => (
        <line key={i} x1={x} y1="100" x2={x} y2="380"
          stroke={`rgba(255,241,45,${0.12 + i * 0.012})`} strokeWidth="0.7" />
      ))}

      {/* Medium particles — mid-media zone */}
      <circle cx="230" cy="175" r="5" fill="rgba(255,120,40,0.5)" />
      <circle cx="260" cy="235" r="4.5" fill="rgba(255,120,40,0.48)" />
      <circle cx="240" cy="310" r="4.5" fill="rgba(255,120,40,0.45)" />
      <circle cx="270" cy="350" r="4" fill="rgba(255,120,40,0.4)" />
      <circle cx="215" cy="145" r="4" fill="rgba(255,120,40,0.42)" />

      {/* Small particles — deeper media */}
      <circle cx="370" cy="180" r="3" fill="rgba(255,120,40,0.45)" />
      <circle cx="420" cy="260" r="2.5" fill="rgba(255,120,40,0.4)" />
      <circle cx="390" cy="330" r="3" fill="rgba(255,120,40,0.38)" />
      <circle cx="440" cy="140" r="2.5" fill="rgba(255,120,40,0.4)" />

      {/* Very fine particles — inner media, approaching center */}
      <circle cx="540" cy="200" r="2" fill="rgba(255,120,40,0.35)" />
      <circle cx="570" cy="310" r="1.8" fill="rgba(255,120,40,0.32)" />
      <circle cx="610" cy="165" r="1.5" fill="rgba(255,120,40,0.3)" />
      <circle cx="640" cy="260" r="1.5" fill="rgba(255,120,40,0.28)" />

      {/* ── ANTI-COLLAPSE SCRIM ──────────────────────────────────────────── */}
      <rect x="660" y="100" width="20" height="280"
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <text x="670" y="455" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(255,255,255,0.35)"
        transform="rotate(-90, 670, 455)">
        ANTI-COLLAPSE SCRIM
      </text>

      {/* ── CENTER TUBE ─────────────────────────────────────────────────── */}
      <rect x="680" y="100" width="100" height="280"
        fill="url(#fmcs-tube-lines)"
        stroke="rgba(100,200,255,0.55)" strokeWidth="1.5" />
      <rect x="680" y="100" width="100" height="280"
        fill="rgba(100,200,255,0.04)" />
      <text x="730" y="60" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(100,200,255,0.65)" letterSpacing="0.05em">
        CENTER TUBE
      </text>
      <text x="730" y="72" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.4)">
        (perforated)
      </text>
      <line x1="730" y1="76" x2="730" y2="98" stroke="rgba(100,200,255,0.2)" strokeWidth="0.8" strokeDasharray="3,2" />

      {/* Clean fluid in center tube — almost no particles */}
      <circle cx="710" cy="200" r="1" fill="rgba(255,120,40,0.2)" />
      <circle cx="740" cy="300" r="0.8" fill="rgba(255,120,40,0.15)" />

      {/* ── FLOW ARROWS ─────────────────────────────────────────────────── */}
      {/* Contaminated flow entering from left */}
      <line x1="15" y1="195" x2="57" y2="195"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#fmcs-ay)" />
      <line x1="15" y1="240" x2="57" y2="240"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#fmcs-ay)" />
      <line x1="15" y1="285" x2="57" y2="285"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#fmcs-ay)" />
      <text x="30" y="185" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.55)" letterSpacing="0.04em">
        CONTAMINATED
      </text>
      <text x="30" y="195" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.55)">
        FLOW
      </text>

      {/* Clean flow exiting right through center tube */}
      <line x1="782" y1="220" x2="838" y2="220"
        stroke="rgba(100,200,255,0.7)" strokeWidth="2" markerEnd="url(#fmcs-ab)" />
      <line x1="782" y1="260" x2="838" y2="260"
        stroke="rgba(100,200,255,0.7)" strokeWidth="2" markerEnd="url(#fmcs-ab)" />
      <text x="818" y="245" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.55)" letterSpacing="0.04em">
        CLEAN
      </text>
      <text x="818" y="256" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.55)">
        FLOW
      </text>

      {/* ── BETA RATIO FORMULA ───────────────────────────────────────────── */}
      <rect x="185" y="405" width="240" height="58"
        fill="rgba(255,241,45,0.06)" stroke="rgba(255,241,45,0.25)" strokeWidth="1" rx="3" />
      <text x="305" y="425" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="#FFF12D" fontWeight="700">
        β_x(c) = N_up / N_down
      </text>
      <text x="305" y="442" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
        efficiency E = (1 − 1/β) × 100 %
      </text>
      <text x="305" y="455" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">
        ISO 16889:2022 §3.1.2
      </text>

      {/* Particle size legend */}
      <rect x="460" y="405" width="230" height="58"
        fill="rgba(255,120,40,0.05)" stroke="rgba(255,120,40,0.2)" strokeWidth="1" rx="3" />
      <text x="470" y="422" fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">
        CAPTURE DEPTH BY PARTICLE SIZE:
      </text>
      <circle cx="478" cy="436" r="6" fill="rgba(255,120,40,0.5)" />
      <text x="490" y="440" fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">Large (&gt;10 µm) → pre-filter</text>
      <circle cx="478" cy="453" r="3" fill="rgba(255,120,40,0.45)" />
      <text x="490" y="456" fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">Med (2–10 µm) → mid-media</text>
      <circle cx="670" cy="436" r="1.5" fill="rgba(255,120,40,0.35)" />
      <text x="678" y="440" fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">Fine (&lt;2 µm) → inner zone</text>

      {/* Standard label */}
      <text x="850" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889 · ISO 11171
      </text>
    </svg>
  );
}
