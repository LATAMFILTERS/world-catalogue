'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const sections = [
  {
    title: 'How Contamination Happens',
    content: 'High-pressure common rail (HPCR) fuel injector wear originates from contamination reaching injector precision components through inadequate filtration or filter bypass. Particulate contamination in diesel fuel at 10-100 µm causes abrasive wear on injector needle seats and guide bores; HPCR systems operating at 1,600-2,500 bar require injector component clearances of 1-3 µm — particles within this size range function as abrasive media under high contact stress. Water contamination (above 200 ppm ASTM D6304 limit) creates emulsified water droplets in fuel that produce micro-hydraulic shock at injector tip surfaces when flashed to steam at injector tip temperatures of 300-400°C; repeated steam expansion events cause micro-pitting on needle seats and erosion of spray hole entry chamfers. Wax crystal formation in cold ambient conditions (below cloud point temperature) occurs when paraffin wax components in diesel recrystallise; wax crystals are typically 10-100 µm, large enough to block injector spray holes (0.1-0.3 mm diameter) and cause uneven spray pattern distribution. Lacquer and varnish deposit formation on injector internals from thermal oxidation of fuel residuals at injector tip temperatures — HPCR injectors experience fuel tip temperatures of 180-220°C at idle and 300-400°C at full load, which thermally crack and oxidise diesel fuel residuals into carbonaceous deposits. Deposit buildup on needle seats increases hydraulic stiction force required for needle opening, causing injection timing delays of 1-3° crank angle that directly affect combustion efficiency.'
  },
  {
    title: 'System Damage',
    content: 'HPCR injector contamination causes progressive and often irreversible damage: needle seat wear from particle abrasion creates seat leakage — fuel bypasses the closed needle seat, causing injector dribble, incomplete combustion, and hydrocarbon emissions; seat wear of 5-10 µm is sufficient to cause measurable dribble in 200 MPa injection systems. Guide bore wear from particle abrasion increases needle-to-bore clearance from design value (1-2 µm) to 5-15 µm, causing injection volume variability between injectors of ±5-15% — this imbalance creates cylinder-to-cylinder combustion variation, increasing vibration and noise. Spray hole erosion from water steam and abrasive particles enlarges nominal 0.16-0.24 mm spray holes by 5-20 µm per 1,000 hours, reducing injection pressure and altering spray cone angle; reduced pressure causes incomplete fuel atomisation, increasing particulate emissions and fuel consumption. Injector body corrosion from water-contaminated fuel creates rust particles that accelerate internal abrasion; corrosion products from mild steel injector bodies are hard enough (Mohs 5-7) to abrade hardened steel needle surfaces (Rockwell 60+ HRC). Stiction from lacquer deposits causes slow or non-opening needles; affected cylinders show reduced power contribution (detectable by cylinder cutout balance test) and misfires at idle. All HPCR damage modes are cumulative and self-accelerating: initial abrasion increases internal leakage, which reduces rail pressure stability, which further stresses precision components under abnormal operating conditions.'
  },
  {
    title: 'Operational Impact',
    content: 'HPCR injector failure from contamination generates the highest per-event repair costs in diesel engine maintenance: single injector replacement for heavy equipment diesel engines costs 800-3,500 USD per unit including parts and labour; full 6-cylinder injector set replacement costs 5,000-20,000 USD. HPCR injection system pump replacement (required when pump damage accompanies injector failure) adds 3,000-8,000 USD. Total injector replacement events in contaminated fuel applications typically occur at 3,000-6,000 hours instead of the 12,000-20,000 hour design life — representing 50-75% life reduction. Fuel consumption increases 3-8% when injector spray quality degrades from seat wear and spray hole erosion; over 10,000 operating hours, this represents significant fuel cost increase at fleet scale. Emissions compliance risk increases as worn injectors produce excessive particulate matter (PM) and unburned hydrocarbons; OBD diagnostic systems trigger fault codes at specified PM thresholds, potentially grounding equipment pending repair. For fleet-level fuel cost analysis, see the'
  },
  {
    title: 'Prevention Methods',
    content: 'HPCR injector protection requires maintaining fuel cleanliness to ISO 4406 target code 16/14/11 or better (corresponding to <1,000 particles/mL above 4 µm, <250 particles/mL above 6 µm): (1) Primary fuel filtration — install primary filter rated 10 µm absolute (Beta₁₀ ≥ 200) at transfer pump inlet to protect pump from large particles in bulk fuel; (2) Secondary fuel filtration — install secondary filter rated 2 µm absolute (Beta₂ ≥ 200) upstream of HPCR pump; HPCR engine OEMs (Cummins, Bosch, Delphi) specify 2-4 µm secondary filtration; (3) Water removal — primary filter must include water separation function achieving <200 ppm total water per ASTM D6304; regular manual drain of water separator bowl (every 250 hours or monthly) prevents water accumulation and re-entrainment; (4) Fuel quality monitoring — perform ASTM D6304 Karl Fischer titration quarterly on bulk storage fuel; maintain tank desiccant breathers to prevent moisture ingress during thermal breathing; (5) Bulk storage management — inspect and drain bulk storage tank bottoms semi-annually to remove accumulated free water and sediment; (6) Filter replacement discipline — replace primary and secondary filters at OEM-specified intervals (typically 500-1,000 hours); never bypass filter elements for temporary operation — a single hour of unfiltered HPCR operation can cause irreversible injector damage.'
  },
  {
    title: 'Related Standards',
    content: 'HPCR injector fuel cleanliness and water content requirements are defined by: ASTM D6304 (determination of water in petroleum products, lubricating oils, and additives by coulometric Karl Fischer titration — primary method for fuel water content quantification, maximum 200 ppm for on-road diesel); ISO 12937 (petroleum products — determination of water — Karl Fischer coulometric titration method — international equivalent of ASTM D6304 used in European and ISO markets); ISO 16332 (diesel engines — fuel filters — method for evaluating filtration and water separation performance of fuel filters — specifies test procedures for Beta ratio measurement and water rejection efficiency of diesel fuel filters); ISO 4406 (hydraulic fluid power — fluids — method for coding the level of contamination by solid particles — applicable to fuel cleanliness classification using particle count methodology); ASTM D975 (standard specification for diesel fuel oils — defines maximum allowable water and sediment content, cloud point, and lubricity for on-road and off-road diesel grades); ISO 12156-1 (diesel fuel — assessment of lubricity using the high-frequency reciprocating rig (HFRR) — defines lubricity specification relevant to HPCR pump and injector wear from low-lubricity fuel); SAE J1488 (emulsified water in motor fuels — determination and water separation capability of fuel filters).'
  },
  {
    title: 'Related Technologies',
    content: 'ELIMFILTERS SYNTEPORE, HYDROCORE, and TURBOCORE technologies address the three primary HPCR contamination mechanisms. SYNTEPORE synthetic media elements for HPCR secondary filtration achieve Beta₂ ≥ 200 (2 µm absolute rating, 99.5% efficiency) using high-tenacity synthetic microfibre media resistant to wet collapse under fuel pressure pulses up to 6 bar; SYNTEPORE media maintains rated efficiency from -30°C to +120°C, covering cold-start and full-load temperature ranges in HPCR applications. HYDROCORE water separation elements combine coalescent media for droplet capture with a hydrophobic barrier screen that rejects coalesced water droplets to the sump; HYDROCORE elements achieve <100 ppm residual water content from fuel containing up to 2,000 ppm free water in single-pass operation. TURBOCORE 3-stage integrated elements combine pre-filtration (10 µm), water separation (HYDROCORE coalescent stage), and final filtration (2 µm SYNTEPORE stage) in a single housing, replacing the separate primary-secondary filter arrangement required in high-contamination applications such as mining, construction, and marine equipment. When deployed as a SYNTEPORE secondary / HYDROCORE primary combination, these technologies protect HPCR injectors to the manufacturer-specified fuel cleanliness targets across the range of contamination levels encountered in field operations.'
  },
];

const faqs = [
  {
    question: 'What particle size is most damaging to HPCR injectors?',
    answer: 'Particles in the 4-20 µm range cause the most severe damage to HPCR injector internals because they are large enough to bridge the 1-3 µm clearances in needle guides and control orifices, generating abrasive contact stress, while being small enough to pass through upstream filtration designed for 25 µm nominal removal. The damage mechanism is two-body and three-body abrasion: a particle trapped between needle and bore creates micro-cutting in hardened steel surfaces (hardness 58-65 HRC). Particles above 25 µm cause immediate valve or orifice blockage detectable as injection cutout; particles below 1 µm contribute to polishing wear at extremely long time scales. The critical concern is particles in the 4-15 µm range, which explains why HPCR OEMs specify secondary filtration at 2-4 µm absolute (Beta₂ ≥ 200) rather than the 10-25 µm nominal rating common in older mechanical injection systems. Fuel cleanliness measurement for HPCR protection should use ISO 4406 particle counting methodology rather than gravimetric analysis, since mass-based measurements miss the critical fine particle population.',
  },
  {
    question: 'How do I know if my injectors have lacquer deposit stiction?',
    answer: 'Lacquer deposit stiction on HPCR injector needles produces characteristic symptoms: rough idle at cold start improving after warm-up (deposits soften as injector reaches operating temperature); cylinder balance imbalance detectable via injector cutout test showing affected cylinders have lower power contribution than balanced cylinders; elevated injector return fuel flow (indicative of needle not seating fully); fuel economy reduction of 3-8% from incomplete combustion at affected cylinders; visible smoke at idle from partially open injector dribble. Laboratory diagnosis requires injector flow bench testing: an injector with stiction shows longer than specified activation delay and variable injection volume across multiple cycles. Preventive fuel additive programmes using deposit control additives (polyisobutylene succinimide-based packages, ASTM D6201 qualified) dissolve existing lacquer deposits over 100-300 hours of operation at specified treat rates. If stiction is severe enough to cause misfire faults, injectors must be removed for ultrasonic cleaning or replacement.',
  },
  {
    question: 'Can contaminated HPCR injectors be cleaned rather than replaced?',
    answer: 'Ultrasonic cleaning can remove external deposits and some internal lacquer accumulation from HPCR injectors, but cannot reverse abrasive wear of needle seats, guide bores, or spray holes. Cleaning is cost-effective when stiction is the primary failure mode (deposit-related) with no measurable wear: flow bench testing after cleaning shows injection volume within ±3% of specification, needle activation delay within spec, and spray pattern geometry correct. Cleaning is not appropriate when: injector flow balance deviation exceeds ±5% after cleaning; needle seat leakage test shows seat blow-by; spray hole diameter inspection (optical) shows hole enlargement greater than 10% of nominal; or injector has been operated dry (fuel starvation) which removes lubrication from metal-to-metal contacts. For contamination-damaged injectors showing abrasive wear (identified by flow bench deviation or visual microscopy), replacement is the only reliable remediation. Replacing injectors without correcting the contamination source (filtration upgrade, water control, fuel quality management) results in repeat failure at the same or shorter interval.',
  },
  {
    question: 'What is the relationship between fuel lubricity and injector wear?',
    answer: 'HPCR injection systems rely on diesel fuel itself to lubricate the sliding contact between injection pump plungers and barrel bores, and between injector needles and guide bores. Fuel lubricity is measured by the high-frequency reciprocating rig (HFRR) test per ISO 12156-1; the maximum allowable wear scar diameter is 460 µm at 60°C. Low-sulfur diesel (ultra-low sulfur diesel, ULSD) has inherently lower lubricity than high-sulfur grades because sulfur compounds provided natural lubrication; ULSD requires lubricity additives (typically 20-100 ppm fatty acid methyl ester (FAME) or polyol ester) to restore film-forming capability. Fuel water contamination above 200 ppm dilutes the lubricating film between contact surfaces, increasing boundary friction coefficient by 30-50% and accelerating wear at the contact zone. Fuel lubricity failure and particulate contamination interact: particles trapped at the contact zone under reduced lubricant film thickness cause higher stress per contact event, accelerating abrasive wear beyond what either factor alone would produce. ASTM D975 specifies lubricity compliance for commercial diesel at a maximum 520 µm HFRR wear scar; premium grades specify 400-460 µm maximum.',
  },
];

export default function FuelInjectorWearPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Back Button */}
      <Link href="/knowledge-system/contamination"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← CONTAMINATION</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Fuel Injector Wear from Contamination
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
            textAlign: 'justify',
          }}>
            HPCR injector stiction, abrasive wear, and water emulsification mechanisms in high-pressure common rail diesel fuel systems.
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Short Definition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            Short Definition
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            textAlign: 'justify',
          }}>
            HPCR injector wear encompasses abrasive degradation of needle seats, guide bores, and spray holes by particulate contamination in fuel, lacquer deposit stiction from thermal oxidation of fuel residuals, and micro-erosion from water emulsification at injector tip temperatures. This failure mode is addressed by the{' '}
            <Link href="/knowledge-system/standards/fuel-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fuel filtration systems</Link>{' '}
            domain and is the primary driver of premature HPCR injection system replacement in field operations. HPCR systems operating at 1,600-2,500 bar require fuel cleanliness to ISO 4406 target code 16/14/11 or better; failure to maintain these targets reduces injector service life from 12,000-20,000 hours to 3,000-6,000 hours, with replacement costs of 800-3,500 USD per injector.
          </p>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFF12D',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h2>
            {section.title === 'Operational Impact' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
                {section.content}{' '}
                <Link href="/knowledge-system/fleet/fuel-efficiency" style={{ color: '#FFF12D', textDecoration: 'underline' }}>filtration and fuel efficiency guide</Link>.
              </p>
            ) : (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                textAlign: 'justify',
              }}>
                {section.content}
              </p>
            )}
          </motion.div>
        ))}
      </section>

      {/* FAQ Section */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sections.length * 0.1 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (sections.length + 1 + i) * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                }}
              >
                <h3 style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#FFF12D',
                  marginBottom: '0.75rem',
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                  textAlign: 'justify',
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Navigation to Other Contamination Pages */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '4rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em',
          }}>
            Explore Other Contamination Types
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '1rem' }}>
            {[
              { href: '/knowledge-system/contamination/diesel-water', code: '💧 DIESEL WATER', desc: 'Water ingress in diesel fuel systems' },
              { href: '/knowledge-system/contamination/particle-wear', code: '⚙ PARTICLE WEAR', desc: 'Abrasive contamination and three-body wear' },
              { href: '/knowledge-system/contamination/hydraulic-system', code: '⚡ HYDRAULIC', desc: 'Pressurized fluid system contamination' },
              { href: '/knowledge-system/contamination/coolant-contamination', code: '🌡 COOLANT', desc: 'Silicate depletion and cavitation erosion' },
              { href: '/knowledge-system/contamination/compressed-air-contamination', code: '💨 COMPRESSED AIR', desc: 'Oil carryover and moisture in pneumatic systems' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', margin: '0 0 0.5rem 0' }}>{link.code}</p>
                  <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Canonical Knowledge Block */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '0 2rem 4rem',
      }}>
        <div style={{
          background: 'rgba(255,241,45,0.05)',
          border: '2px solid rgba(255,241,45,0.25)',
          borderRadius: '8px',
          padding: '2rem',
          marginTop: '2rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8rem',
        }}>
          <h3 style={{ color: '#FFF12D', marginBottom: '1.5rem', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            CANONICAL KNOWLEDGE BLOCK: Fuel Injector Wear from Contamination
          </h3>
          <div style={{ lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            <p><strong style={{ color: '#fff' }}>DEFINITION</strong><br />
            HPCR injector wear from contamination occurs when particles in the 4-20 µm range abrade needle seats and guide bores with 1-3 µm design clearances at injection pressures of 1,600-2,500 bar, water above 200 ppm ASTM D6304 creates steam micro-erosion at injector tip temperatures of 300-400°C, and lacquer deposits from thermal oxidation cause needle stiction.</p>

            <p><strong style={{ color: '#fff' }}>SYSTEMS</strong><br />
            High-pressure common rail (HPCR) injection systems, fuel transfer pump circuits, bulk fuel storage and distribution, diesel engine fuel management systems</p>

            <p><strong style={{ color: '#fff' }}>FAILURE_IMPACT</strong><br />
            Particle abrasion → needle seat wear (5-10 µm) → injector dribble and incomplete combustion → PM emissions exceedance | Water &gt;200 ppm → steam micro-erosion at 300-400°C tip temperatures → spray hole enlargement → fuel atomisation failure | Lacquer stiction → injection timing delay 1-3° CA → combustion efficiency loss | Operational Impact: injector life reduced from 12,000-20,000 hours to 3,000-6,000 hours; replacement cost 800-3,500 USD per injector; fuel consumption increase 3-8%</p>

            <p><strong style={{ color: '#fff' }}>RELATED_STANDARDS</strong><br />
            ASTM D6304: Karl Fischer titration for water in diesel fuel, maximum 200 ppm | ISO 12937: International equivalent water determination by Karl Fischer coulometric titration | ISO 16332: Diesel fuel filter performance evaluation — Beta ratio and water rejection efficiency | ISO 4406: Particle contamination classification for fluid cleanliness coding | ASTM D975: Diesel fuel specification including water, sediment, and lubricity limits | ISO 12156-1: Fuel lubricity by HFRR test, maximum 460 µm wear scar</p>

            <p><strong style={{ color: '#fff' }}>RELATED_TECHNOLOGIES</strong><br />
            SYNTEPORE: Synthetic microfibre HPCR secondary filtration, Beta₂ ≥ 200 (2 µm absolute), rated -30°C to +120°C, wet collapse resistance to 6 bar pressure pulses | HYDROCORE: Coalescent water separation achieving &lt;100 ppm residual water from 2,000 ppm inlet concentration | TURBOCORE: 3-stage integrated element combining 10 µm pre-filtration, HYDROCORE water separation, and 2 µm SYNTEPORE final stage</p>

            <p><strong style={{ color: '#fff' }}>INDUSTRIAL_ROLE</strong><br />
            HPCR injector contamination is the highest per-event cost failure mode in diesel engine maintenance fleets; secondary filtration at 2 µm absolute and water control below 200 ppm ASTM D6304 are the critical interventions that determine whether HPCR systems reach design service life or fail at 25-50% of intended operating hours.</p>

            <p><strong style={{ color: '#fff' }}>CITATION_REFERENCE</strong><br />
            source: elimfilters.com/knowledge-system/contamination/fuel-injector-wear<br />
            concept: Fuel Injector Wear from Contamination<br />
            version: 1.0<br />
            last_updated: 2026-06-30</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Fuel Injector Wear from Contamination',
        description: 'HPCR injector wear mechanisms from particulate contamination, water emulsification, and lacquer deposit stiction in high-pressure common rail diesel systems operating at 1,600-2,500 bar.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-30',
        keywords: ['HPCR injector wear', 'fuel injector contamination', 'injector stiction', 'ASTM D6304', 'ISO 12937', 'ISO 16332', 'diesel fuel cleanliness', 'SYNTEPORE', 'HYDROCORE', 'TURBOCORE', 'ISO 4406'],
        about: { '@type': 'Thing', name: 'Fuel Injector Wear from Contamination', description: 'Abrasive wear, water emulsification, and stiction failure mechanisms in HPCR diesel fuel injection systems from contaminated fuel.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Contamination', item: 'https://elimfilters.com/knowledge-system/contamination' },
          { '@type': 'ListItem', position: 4, name: 'Fuel Injector Wear from Contamination', item: 'https://elimfilters.com/knowledge-system/contamination/fuel-injector-wear' },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }) }} />

    </main>
  );
}
