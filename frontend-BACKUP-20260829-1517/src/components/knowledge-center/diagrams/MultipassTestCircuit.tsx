interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function MultipassTestCircuit({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="mpt-title mpt-desc"
      viewBox="0 0 860 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="mpt-title">ISO 16889 Multi-Pass Filter Test Circuit</title>
      <desc id="mpt-desc">
        The ISO 16889 multi-pass test circuit for measuring filter efficiency (Beta ratio).
        Test fluid circulates from the reservoir through the pump to the upstream particle counter
        (PC₁), through the test filter assembly, then through the downstream particle counter (PC₂)
        before returning to the reservoir. ISO medium test dust is injected upstream to maintain
        a target particle count at PC₁. Beta ratio β = PC₁ ÷ PC₂.
      </desc>

      <defs>
        <marker id="mpt-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#FFF12D" />
        </marker>
        <marker id="mpt-ao" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,120,40,0.8)" />
        </marker>
        <marker id="mpt-ab" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(100,200,255,0.8)" />
        </marker>
        <pattern id="mpt-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,241,45,0.35)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ── Main horizontal flow pipe ─────────────────────────────────────── */}
      {/* y=160: main pipe level */}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RESERVOIR (left)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Reservoir — U-shape (open top rectangle) */}
      <line x1="30" y1="360" x2="30"  y2="430" stroke="rgba(255,200,40,0.5)" strokeWidth="2" />
      <line x1="30" y1="430" x2="130" y2="430" stroke="rgba(255,200,40,0.5)" strokeWidth="2" />
      <line x1="130" y1="430" x2="130" y2="360" stroke="rgba(255,200,40,0.5)" strokeWidth="2" />
      {/* Fluid level */}
      <rect x="30" y="390" width="100" height="40"
        fill="rgba(255,200,40,0.12)" />
      <line x1="30" y1="390" x2="130" y2="390"
        stroke="rgba(255,200,40,0.4)" strokeWidth="1" strokeDasharray="5,3" />
      {/* Contamination particles in reservoir */}
      <circle cx="60"  cy="405" r="3"   fill="rgba(255,120,40,0.5)" />
      <circle cx="80"  cy="415" r="2.5" fill="rgba(255,120,40,0.45)" />
      <circle cx="105" cy="408" r="3"   fill="rgba(255,120,40,0.5)" />
      <circle cx="50"  cy="418" r="2"   fill="rgba(255,120,40,0.4)" />
      <text x="80" y="450" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,200,40,0.65)">
        RESERVOIR
      </text>

      {/* ── Pump ──────────────────────────────────────────────────────────── */}
      {/* Suction line: from reservoir top-right corner (130,360) → right to pump */}
      <line x1="130" y1="380" x2="175" y2="380"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1.5" />
      <line x1="175" y1="380" x2="175" y2="280"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1.5" />
      <line x1="175" y1="280" x2="195" y2="280"
        stroke="rgba(255,200,40,0.5)" strokeWidth="1.5" markerEnd="url(#mpt-ay)" />

      {/* Pump body */}
      <circle cx="225" cy="280" r="30"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      {/* Pump direction arrow */}
      <line x1="216" y1="280" x2="232" y2="268"
        stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" markerEnd="url(#mpt-ay)" />
      <text x="225" y="322" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        PUMP
      </text>

      {/* Pump outlet → main pipe */}
      <line x1="225" y1="250" x2="225" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />
      <line x1="225" y1="160" x2="275" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONTAMINATION INJECTION POINT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Injection at x=340 from top */}
      <line x1="340" y1="40" x2="340" y2="152"
        stroke="rgba(255,120,40,0.7)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#mpt-ao)" />
      <rect x="300" y="20" width="80" height="22"
        fill="rgba(255,120,40,0.08)" stroke="rgba(255,120,40,0.45)" strokeWidth="1" rx="3" />
      <text x="340" y="34" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,120,40,0.8)">
        ISO MTD INJECTION
      </text>
      {/* Injection point on pipe */}
      <circle cx="340" cy="160" r="5" fill="rgba(255,120,40,0.7)" stroke="rgba(255,120,40,0.9)" strokeWidth="1" />

      {/* Horizontal pipe from pump to PC1 */}
      <line x1="275" y1="160" x2="360" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PC₁ — UPSTREAM PARTICLE COUNTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Diamond shape for particle counter */}
      <polygon points="395,132 425,160 395,188 365,160"
        fill="rgba(100,200,255,0.08)" stroke="rgba(100,200,255,0.6)" strokeWidth="1.5" />
      {/* Particle dots inside diamond */}
      <circle cx="390" cy="155" r="2.5" fill="rgba(255,120,40,0.7)" />
      <circle cx="405" cy="168" r="2"   fill="rgba(255,120,40,0.6)" />
      <circle cx="398" cy="147" r="2"   fill="rgba(255,120,40,0.6)" />
      <circle cx="385" cy="168" r="1.5" fill="rgba(255,120,40,0.5)" />
      <text x="395" y="156" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(100,200,255,0.9)">
        PC
      </text>
      <text x="404" y="163" textAnchor="start"
        fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="rgba(100,200,255,0.9)">
        1
      </text>
      <text x="395" y="215" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.7)">
        UPSTREAM
      </text>
      <text x="395" y="228" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.7)">
        COUNTER
      </text>
      <text x="395" y="241" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.45)">
        counts Nᵤ
      </text>

      {/* Sample line for PC1 (branch from main pipe, shown as thin dashed) */}
      <line x1="395" y1="160" x2="425" y2="160"
        stroke="rgba(100,200,255,0.4)" strokeWidth="1" strokeDasharray="3,2" />

      {/* Pipe through PC1 area → to filter */}
      <line x1="425" y1="160" x2="475" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TEST FILTER ASSEMBLY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Filter housing */}
      <rect x="475" y="120" width="110" height="80"
        fill="rgba(255,241,45,0.06)" stroke="rgba(255,241,45,0.65)" strokeWidth="2" rx="4" />
      {/* Filter element with hatch */}
      <rect x="485" y="130" width="90" height="60"
        fill="url(#mpt-hatch)" stroke="rgba(255,241,45,0.3)" strokeWidth="1" />
      {/* Media vertical lines */}
      <line x1="500" y1="130" x2="500" y2="190" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="515" y1="130" x2="515" y2="190" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="530" y1="130" x2="530" y2="190" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="545" y1="130" x2="545" y2="190" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />
      <line x1="560" y1="130" x2="560" y2="190" stroke="rgba(255,241,45,0.2)" strokeWidth="1" />

      <text x="530" y="112" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,241,45,0.8)">
        TEST FILTER
      </text>

      {/* ΔP measurement taps on filter */}
      <line x1="530" y1="120" x2="530" y2="86"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" strokeDasharray="3,2" />
      <rect x="505" y="66" width="50" height="20"
        fill="rgba(255,241,45,0.08)" stroke="rgba(255,241,45,0.4)" strokeWidth="1" rx="2" />
      <text x="530" y="79" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(255,241,45,0.7)">
        ΔP SENSOR
      </text>

      {/* Pipe through filter → PC2 */}
      <line x1="585" y1="160" x2="640" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PC₂ — DOWNSTREAM PARTICLE COUNTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <polygon points="675,132 705,160 675,188 645,160"
        fill="rgba(100,200,255,0.06)" stroke="rgba(100,200,255,0.5)" strokeWidth="1.5" />
      {/* Only small particles downstream (high-efficiency filter) */}
      <circle cx="672" cy="158" r="1.5" fill="rgba(255,120,40,0.6)" />
      <circle cx="682" cy="165" r="1"   fill="rgba(255,120,40,0.5)" />
      <circle cx="667" cy="167" r="1.5" fill="rgba(255,120,40,0.5)" />
      <text x="675" y="156" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7" fill="rgba(100,200,255,0.9)">
        PC
      </text>
      <text x="684" y="163" textAnchor="start"
        fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="rgba(100,200,255,0.9)">
        2
      </text>
      <text x="675" y="215" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.6)">
        DOWNSTREAM
      </text>
      <text x="675" y="228" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(100,200,255,0.6)">
        COUNTER
      </text>
      <text x="675" y="241" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fill="rgba(100,200,255,0.4)">
        counts Nd
      </text>

      <line x1="705" y1="160" x2="780" y2="160"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RETURN LINE to reservoir
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Right side turn */}
      <line x1="780" y1="160" x2="820" y2="160"
        stroke="#FFF12D" strokeWidth="2" />
      <line x1="820" y1="160" x2="820" y2="410"
        stroke="#FFF12D" strokeWidth="2" />
      <line x1="820" y1="410" x2="130" y2="410"
        stroke="#FFF12D" strokeWidth="2" markerEnd="url(#mpt-ay)" />
      <text x="490" y="435" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,241,45,0.35)">
        ←── return to reservoir ───
      </text>

      {/* ── Flow control valve (back-pressure) ──────────────────────────── */}
      <rect x="750" y="272" width="22" height="180"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" rx="2" />
      <line x1="752" y1="340" x2="770" y2="360"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="770" y1="340" x2="752" y2="360"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <text x="786" y="355" fontFamily="'JetBrains Mono', monospace" fontSize="7.5"
        fill="rgba(255,255,255,0.3)">
        flow ctrl
      </text>

      {/* ── Beta ratio formula ───────────────────────────────────────────── */}
      <rect x="40" y="260" width="160" height="55"
        fill="rgba(255,241,45,0.06)" stroke="rgba(255,241,45,0.25)" strokeWidth="1" rx="3" />
      <text x="120" y="282" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#FFF12D">
        β = Nᵤ / Nd
      </text>
      <text x="120" y="300" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">
        β₁₀(c) — ISO 16889 notation
      </text>
      <text x="120" y="312" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,255,255,0.3)">
        subscript = particle size (µm)
      </text>

      {/* Standard label */}
      <text x="820" y="475" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 16889 · ISO 11171
      </text>
    </svg>
  );
}
