import { useReviewed } from '@/components/ReviewedText';
interface SvgDiagramProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ParticleWearMechanism({ className, style }: SvgDiagramProps = {}) {
  const tr = useReviewed();
  return (
    <svg
      role="img"
      aria-labelledby="pwm-title pwm-desc"
      viewBox="0 0 780 480"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <title id="pwm-title">{tr("Particle Wear Mechanisms in Lubricated Systems")}</title>
      <desc id="pwm-desc">{tr("Three abrasive wear mechanisms: two-body abrasion (hard particle embedded in soft surface cutting harder counter-surface), three-body abrasion (free particle rolling between two surfaces), and adhesive wear (direct metal-to-metal contact from oil film breakdown). Particle sizes shown relative to bearing clearance (0.5–5µm critical range).")}</desc>

      <defs>
        <marker id="pwm-ay" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="rgba(255,255,255,0.6)" />
        </marker>
        <marker id="pwm-ao" viewBox="0 0 8 6" refX="7" refY="3"
          markerWidth="7" markerHeight="5" orient="auto">
          <path d="M0 0L8 3L0 6Z" fill="#ff8040" />
        </marker>
      </defs>

      {/* ── Panel dividers ─────────────────────────────────────────────── */}
      <line x1="260" y1="30" x2="260" y2="390"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="520" y1="30" x2="520" y2="390"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PANEL 1: Two-Body Abrasion (x=0-260)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <text x="130" y="28" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5"
        fill="rgba(255,100,40,0.9)" letterSpacing="0.08em">{tr("TWO-BODY ABRASION")}</text>

      {/* Upper surface — counter surface (moving right) */}
      <rect x="20" y="70" width="220" height="50"
        fill="rgba(150,180,200,0.12)" stroke="rgba(200,220,240,0.5)" strokeWidth="1.5" />
      <text x="130" y="100" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.45)">{tr("COUNTER-SURFACE (moving)")}</text>
      {/* Motion arrow */}
      <line x1="170" y1="58" x2="220" y2="58"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" markerEnd="url(#pwm-ay)" />
      <text x="170" y="52" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,255,255,0.35)">{tr("sliding →")}</text>

      {/* Lower surface — softer surface with embedded particle */}
      <rect x="20" y="200" width="220" height="55"
        fill="rgba(100,120,140,0.15)" stroke="rgba(180,200,220,0.4)" strokeWidth="1.5" />
      <text x="130" y="240" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.4)">{tr("SOFT SURFACE")}</text>

      {/* Embedded hard particle */}
      <polygon points="130,195 118,210 142,210"
        fill="rgba(255,100,40,0.9)" stroke="rgba(255,140,60,0.7)" strokeWidth="1" />
      <text x="148" y="207" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,100,40,0.9)">{tr("hard particle")}</text>

      {/* Wear groove on upper surface bottom */}
      <path d="M95,120 Q130,132 165,120"
        fill="none" stroke="rgba(255,80,40,0.6)" strokeWidth="1.5" />
      <text x="130" y="150" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,80,40,0.7)">{tr("← wear groove →")}</text>

      {/* Clearance gap label */}
      <line x1="240" y1="120" x2="240" y2="200"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="234" y1="120" x2="246" y2="120"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" />
      <line x1="234" y1="200" x2="246" y2="200"
        stroke="rgba(255,241,45,0.4)" strokeWidth="1" />
      <text x="248" y="165" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        fill="rgba(255,241,45,0.6)">{tr("gap")}</text>

      {/* Panel 1 note */}
      <text x="130" y="285" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("Particle embedded in soft surface")}</text>
      <text x="130" y="298" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("cuts groove in opposing face")}</text>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PANEL 2: Three-Body Abrasion (x=260-520)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <text x="390" y="28" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5"
        fill="rgba(255,100,40,0.9)" letterSpacing="0.08em">{tr("THREE-BODY ABRASION")}</text>

      {/* Upper surface — moving */}
      <rect x="275" y="70" width="230" height="50"
        fill="rgba(150,180,200,0.12)" stroke="rgba(200,220,240,0.5)" strokeWidth="1.5" />
      <text x="390" y="100" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.45)">{tr("UPPER SURFACE (moving)")}</text>
      <line x1="420" y1="58" x2="470" y2="58"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" markerEnd="url(#pwm-ay)" />

      {/* Lower surface */}
      <rect x="275" y="200" width="230" height="55"
        fill="rgba(100,120,140,0.15)" stroke="rgba(180,200,220,0.4)" strokeWidth="1.5" />
      <text x="390" y="235" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.4)">{tr("LOWER SURFACE")}</text>

      {/* Free particles between surfaces — rolling */}
      <circle cx="350" cy="160" r="8" fill="rgba(255,100,40,0.75)" />
      <circle cx="390" cy="155" r="6" fill="rgba(255,120,50,0.75)" />
      <circle cx="430" cy="162" r="7" fill="rgba(255,100,40,0.75)" />
      {/* Particle rolling indication */}
      <path d="M345,155 Q350,148 355,155" fill="none"
        stroke="rgba(255,200,100,0.5)" strokeWidth="1" />

      {/* Wear marks on both surfaces */}
      <path d="M310,120 Q340,127 370,120 Q400,127 430,120 Q460,127 490,120"
        fill="none" stroke="rgba(255,80,40,0.5)" strokeWidth="1.5" />
      <path d="M310,200 Q340,207 370,200 Q400,207 430,200 Q460,207 490,200"
        fill="none" stroke="rgba(255,80,40,0.5)" strokeWidth="1.5" />

      <text x="390" y="285" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("Free particles roll between surfaces,")}</text>
      <text x="390" y="298" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("abrading both contact faces")}</text>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PANEL 3: Adhesive Wear (x=520-780)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <text x="650" y="28" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9.5"
        fill="rgba(255,60,60,0.9)" letterSpacing="0.08em">{tr("ADHESIVE WEAR")}</text>

      {/* Upper surface */}
      <rect x="535" y="70" width="230" height="50"
        fill="rgba(150,180,200,0.12)" stroke="rgba(200,220,240,0.5)" strokeWidth="1.5" />
      <text x="650" y="100" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.45)">{tr("SURFACE A")}</text>
      <line x1="680" y1="58" x2="730" y2="58"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" markerEnd="url(#pwm-ay)" />

      {/* Lower surface */}
      <rect x="535" y="160" width="230" height="55"
        fill="rgba(100,120,140,0.15)" stroke="rgba(180,200,220,0.4)" strokeWidth="1.5" />
      <text x="650" y="195" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.4)">{tr("SURFACE B")}</text>

      {/* No oil film — direct contact zones */}
      <rect x="565" y="118" width="30" height="42"
        fill="rgba(255,60,60,0.15)" stroke="rgba(255,60,60,0.4)" strokeWidth="1" />
      <rect x="630" y="118" width="30" height="42"
        fill="rgba(255,60,60,0.15)" stroke="rgba(255,60,60,0.4)" strokeWidth="1" />
      <rect x="690" y="118" width="30" height="42"
        fill="rgba(255,60,60,0.15)" stroke="rgba(255,60,60,0.4)" strokeWidth="1" />
      <text x="650" y="145" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,60,60,0.8)">{tr("metal contact")}</text>
      <text x="650" y="155" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="rgba(255,60,60,0.8)">{tr("(no oil film)")}</text>

      {/* Material transfer arrows */}
      <line x1="580" y1="160" x2="580" y2="140"
        stroke="#ff8040" strokeWidth="1.5" markerEnd="url(#pwm-ao)" />
      <line x1="645" y1="140" x2="645" y2="160"
        stroke="#ff8040" strokeWidth="1.5" markerEnd="url(#pwm-ao)" />

      <text x="650" y="255" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("Oil film breakdown causes direct")}</text>
      <text x="650" y="268" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{tr("metal contact and material transfer")}</text>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Critical particle size band (bottom)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <rect x="20" y="330" width="740" height="60"
        fill="rgba(255,241,45,0.04)" stroke="rgba(255,241,45,0.2)" strokeWidth="1" rx="3" />
      <text x="390" y="352" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,241,45,0.8)" letterSpacing="0.06em">{tr("CRITICAL PARTICLE SIZE RANGE RELATIVE TO BEARING CLEARANCE")}</text>
      <text x="390" y="370" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.5)">{tr("Engine bearings: 0.5–5µm clearance · Hydraulic servo valves: 0.5–2µm clearance")}</text>
      <text x="390" y="383" textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.35)">{tr("Particles ≥4µm(c) cause measurable wear in lube oil systems (ISO 4406 / ISO 16889)")}</text>

      {/* Standard label */}
      <text x="750" y="470" textAnchor="end"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(255,255,255,0.2)" letterSpacing="0.06em">{tr("ISO 4406 · ISO 16889")}</text>
    </svg>
  );
}
