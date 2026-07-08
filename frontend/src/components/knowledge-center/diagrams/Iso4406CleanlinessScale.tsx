interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Iso4406CleanlinessScale({ className, style }: SvgDiagramProps = {}) {
  return (
    <svg
      role="img"
      aria-labelledby="i4c-title i4c-desc"
      viewBox="0 0 760 500"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="i4c-title">ISO 4406 Fluid Cleanliness Code Scale</title>
      <desc id="i4c-desc">
        Chart showing the ISO 4406 cleanliness code scale: particle count ranges per millilitre
        for each code number (6 to 24), with three particle size channels (≥4µm, ≥6µm, ≥14µm)
        and target cleanliness requirements for servo valves, proportional valves, and gear pumps.
      </desc>

      {/* ── Chart axes ─────────────────────────────────────────────────── */}
      {/* Y-axis */}
      <line x1="110" y1="40" x2="110" y2="400"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1="110" y1="400" x2="700" y2="400"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

      {/* ── Y-axis: Particle count scale (log) ─────────────────────────── */}
      {/*
        Code 6 = 0.32 p/mL | Code 8 = 1.3 | Code 10 = 5 | Code 12 = 20
        Code 14 = 80       | Code 16 = 320 | Code 18 = 1300 | Code 20 = 5000
        Code 22 = 20000    | Code 24 = 80000

        Y positions: map code 6→400, code 24→40 (linear on code axis)
        Actually plotting CODE on X-axis and count on Y-axis makes more sense.

        X-axis: codes 6 through 24 (10 codes, 9 intervals)
        Chart width: 110 to 700 = 590px for 9 intervals = ~65.5px per interval
      */}
      {[6,8,10,12,14,16,18,20,22,24].map((code, i) => {
        const x = 110 + i * 65.5;
        return (
          <g key={code}>
            <line x1={x} y1="400" x2={x} y2="396"
              stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <text x={x} y="412" textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
              {code}
            </text>
          </g>
        );
      })}

      {/* X-axis label */}
      <text x="405" y="435" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5"
        fill="rgba(255,255,255,0.45)" letterSpacing="0.06em">
        ISO 4406 CLEANLINESS CODE NUMBER
      </text>

      {/* Y-axis label */}
      <text x="25" y="220" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        fill="rgba(255,255,255,0.45)" transform="rotate(-90, 25, 220)" textAnchor="middle" letterSpacing="0.06em">
        PARTICLE COUNT PER mL
      </text>

      {/* Y-axis tick labels (particle counts) */}
      {[
        { y: 400, label: '0.32' },
        { y: 357, label: '1.3' },
        { y: 314, label: '5' },
        { y: 271, label: '20' },
        { y: 228, label: '80' },
        { y: 185, label: '320' },
        { y: 142, label: '1 300' },
        { y: 99,  label: '5 000' },
        { y: 56,  label: '20 000' },
      ].map(({ y, label }) => (
        <g key={label}>
          <line x1="106" y1={y} x2="110" y2={y}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="103" y={y + 3} textAnchor="end"
            fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">
            {label}
          </text>
        </g>
      ))}

      {/* ── Grid lines ─────────────────────────────────────────────────── */}
      {[357, 314, 271, 228, 185, 142, 99, 56].map((y) => (
        <line key={y} x1="110" y1={y} x2="700" y2={y}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* ── Data lines ─────────────────────────────────────────────────── */}
      {/* Each code step = 43px Y rise, starting Y at code 6 = 400
          Code n → y = 400 - (n-6)/2 * 43
          6→400, 8→357, 10→314, 12→271, 14→228, 16→185, 18→142, 20→99, 22→56, 24→13

          But we have 3 channels: ≥4µm, ≥6µm, ≥14µm
          The ≥4µm channel is typically 1-2 codes higher than ≥6µm
          The ≥14µm channel is typically 2-3 codes lower than ≥6µm

          For a "target" system at code 17/15/12:
          ≥4µm at code 17 → between 16(y=185) and 18(y=142) → y≈163
          ≥6µm at code 15 → between 14(y=228) and 16(y=185) → y≈206
          ≥14µm at code 12 → y=271

          Let me just draw lines showing the scale progression for each channel.
          The 3 lines are parallel, offset by ~65px (1 code = 65px X)
      */}

      {/* ≥4µm channel line — codes 6-22 plotted linearly */}
      <polyline
        points="110,400 175.5,357 241,314 306.5,271 372,228 437.5,185 503,142 568.5,99 634,56"
        fill="none" stroke="#FFF12D" strokeWidth="2" />

      {/* ≥6µm channel line — offset 1 code lower (starts at code 6 but lower y because fewer particles ≥6µm) */}
      <polyline
        points="110,357 175.5,314 241,271 306.5,228 372,185 437.5,142 503,99 568.5,56"
        fill="none" stroke="rgba(100,200,255,0.8)" strokeWidth="2" />

      {/* ≥14µm channel line — offset 2 codes lower */}
      <polyline
        points="110,271 175.5,228 241,185 306.5,142 372,99 437.5,56"
        fill="none" stroke="rgba(255,160,80,0.8)" strokeWidth="2" />

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <rect x="120" y="46" width="280" height="72"
        fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" rx="3" />
      <line x1="130" y1="64" x2="165" y2="64" stroke="#FFF12D" strokeWidth="2" />
      <text x="172" y="68" fontFamily="'JetBrains Mono', monospace" fontSize="10"
        fill="rgba(255,255,255,0.75)">
        Channel ≥4µm(c) [ISO 11171]
      </text>
      <line x1="130" y1="82" x2="165" y2="82" stroke="rgba(100,200,255,0.8)" strokeWidth="2" />
      <text x="172" y="86" fontFamily="'JetBrains Mono', monospace" fontSize="10"
        fill="rgba(255,255,255,0.75)">
        Channel ≥6µm(c) [ISO 11171]
      </text>
      <line x1="130" y1="100" x2="165" y2="100" stroke="rgba(255,160,80,0.8)" strokeWidth="2" />
      <text x="172" y="104" fontFamily="'JetBrains Mono', monospace" fontSize="10"
        fill="rgba(255,255,255,0.75)">
        Channel ≥14µm(c) [ISO 11171]
      </text>

      {/* ── Target cleanliness bands ────────────────────────────────────── */}
      {/* Servo valves: ISO 16/14/11 → x≈585(16), x≈516(14), x≈385(11)?
          Better: draw horizontal target lines at specific X positions */}

      {/* Servo valve target band: 14/12/10 (very clean) — x range ~175-372 */}
      <rect x="110" y="270" width="262" height="3"
        fill="rgba(100,220,100,0.6)" />
      <text x="112" y="265" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(100,220,100,0.7)">
        ← Servo valves ≤14/12/10
      </text>

      {/* Proportional valve target: 17/15/12 — x range ~372-503 */}
      <rect x="110" y="195" width="393" height="3"
        fill="rgba(255,241,45,0.5)" />
      <text x="112" y="190" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,241,45,0.7)">
        ← Proportional valves ≤17/15/12
      </text>

      {/* Gear pumps target: 19/17/14 — x range ~437-634 */}
      <rect x="110" y="150" width="458" height="3"
        fill="rgba(255,160,80,0.5)" />
      <text x="112" y="145" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,160,80,0.7)">
        ← Gear pumps / cylinders ≤19/17/14
      </text>

      {/* ── Standard label ─────────────────────────────────────────────── */}
      <text x="696" y="480" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">
        ISO 4406 · ISO 11171
      </text>
    </svg>
  );
}
