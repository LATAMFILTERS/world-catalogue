'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const sections = [
  {
    title: 'How Contamination Happens',
    content: 'Compressed air contamination originates from three primary sources. Atmospheric air drawn into the compressor intake contains ambient particulates (dust, pollen, carbon particles at concentrations of 0.01-0.5 mg/m³), water vapour (varying with ambient relative humidity and temperature), and trace hydrocarbons from industrial environments. Compressor-generated contamination is the second source: lubricated reciprocating and rotary screw compressors introduce lubricating oil as aerosol and vapour into the air stream at 1-25 mg/m³ depending on compressor type, age, and maintenance condition; oil-flooded screw compressors generate oil carryover when separator elements age beyond 4,000-6,000 hours; even oil-free compressors introduce carbon wear particles from cylinder rings and bearing grease aerosols at 0.01-0.1 mg/m³. The third source is the distribution network: steel distribution pipework corrodes under the action of oxygen, water vapour, and CO₂ in compressed air, generating iron oxide particles that contaminate downstream air; pipe scale dislodges during pressure transients; internal condensate collects in horizontal pipe runs and re-atomises under flow velocity, carrying dissolved pipe corrosion products. Water vapour condenses within the system whenever compressed air cools below its pressure dew point; at typical operating pressures (7-10 bar), saturated atmospheric air at 25°C yields approximately 130 mL of condensate per 1,000 m³ of compressed air.'
  },
  {
    title: 'System Damage',
    content: 'Compressed air contamination causes specific failure modes in pneumatic equipment and processes: oil contamination of pneumatic valves (ISO 6358 classification valves, proportional control valves) swells elastomeric seals (NBR, EPDM) by 10-30% in volume, causing valve stiction and positional error that exceeds control system tolerance thresholds; oil aerosol deposits on electrostatic spray painting equipment cause fish-eye defects in coatings, increasing rework rates by 5-20%; pharmaceutical and food processing applications have zero tolerance for oil contamination — ISO 8573-1 Class 1 limits 0.01 mg/m³ total oil. Water contamination causes pneumatic actuator corrosion from dissolved CO₂ forming carbonic acid in condensate; brass and aluminium valve bodies pit under continuous condensate flow; pneumatic cylinder bore scoring from corrosion products mixed with condensate reduces cylinder seal life from 2-5 years to 6-18 months; water in compressed air supply lines to blast cleaning equipment (sand, grit blast) causes media clumping, nozzle blockage, and reduced cleaning efficiency. Particulate contamination scores servo valve internal lands (requiring ±1-2 µm clearance tolerance), causing internal leakage and reducing actuator force output; particles above 25 µm cause immediate valve seizure in precision pneumatic components.',
  },
  {
    title: 'Operational Impact',
    content: 'Compressed air contamination is quantified in operational and economic terms: pneumatic actuator seal replacement frequency increases 2-4x when operating on ISO 8573-1 Class 5 air quality vs. Class 2; each actuator seal replacement requires 30-90 minutes of downtime per unit. Oil-contaminated air reaching product-contact processes (food packaging, pharmaceutical filling) triggers regulatory non-compliance events with costs of 50,000-500,000 USD per incident including product recall, regulatory notification, and process revalidation. Compressed air system energy consumption increases 10-20% when filter elements are blocked beyond design differential pressure (typically 0.35 bar), representing significant operating cost in large facilities consuming 50-500 kW of compressor power. Servo valve replacement costs range from 500 to 5,000 USD per unit; valve failure from contamination in automated manufacturing lines can cause 2-8 hours of production downtime per event. Desiccant dryer regeneration efficiency drops 15-30% when oil contamination exceeds 0.5 mg/m³ at the dryer inlet, reducing the effective service interval of desiccant beds and increasing compressed air dew point above specification. For fleet-level analysis of compressed air system costs, see the'
  },
  {
    title: 'Prevention Methods',
    content: 'Compressed air contamination is controlled through a treatment train matched to application quality requirements: (1) Aftercooler — cool compressed air from discharge temperature (80-150°C) to within 10°C of ambient; condensate volume removed at this stage represents 70-80% of total water to be managed; (2) Bulk liquid water separator — centrifugal or impingement separator removes bulk condensate droplets and large oil aerosols (>10 µm); automatic drain valve required for continuous condensate removal; (3) Coalescing pre-filter (ISO 8573-2 Grade AO, 1 µm at ≥99.9% efficiency) — removes submicron oil aerosol and fine particulate; differential pressure indicator required; element replacement at 0.35 bar differential or 12 months; (4) Refrigeration or desiccant drying — refrigeration dryers achieve pressure dew point of +3°C, suitable for ISO 8573-1 Classes 4-6 water; desiccant dryers achieve -20°C to -70°C PDP for Classes 1-3; (5) Final coalescing or activated carbon filter — removes trace oil vapour and odour to ISO 8573-1 Class 1 levels (0.003 mg/m³ total oil). ISO 8573-2 and ISO 8573-3 specify test methods for verifying filter performance at each treatment stage.',
  },
  {
    title: 'Related Standards',
    content: 'Compressed air quality classification and testing are defined by: ISO 8573-1 (compressed air — contaminant classes for particles, water, and total oil content; Class 1 requires <0.1 µm particulate, -70°C PDP, <0.01 mg/m³ oil; Class 6 represents unfiltered industrial air); ISO 8573-2 (test methods for oil aerosol content measurement — photometric/gravimetric analysis of oil in compressed air streams); ISO 8573-3 (test methods for moisture content measurement in compressed air — chilled mirror hygrometry, capacitance sensors, coulometric Karl Fischer analysis); ISO 8573-4 (test methods for solid particle content in compressed air — gravimetric analysis); ISO 8573-5 (test methods for oil vapour content in compressed air — activated charcoal tube extraction and gas chromatography); ISO 8573-8 (test methods for solid particle concentration in compressed air — optical particle counting); ISO 12500 (compressed air filters — test methods for pressure drop, filtration efficiency, and oil aerosol separation); CAGI ADF100 (compressed air dryers — standard test conditions and rating methods for refrigeration dryers).'
  },
  {
    title: 'Related Technologies',
    content: 'ELIMFILTERS DRYCORE technology addresses compressed air contamination through multi-stage treatment optimised for the ISO 8573-1 classification hierarchy. DRYCORE coalescing filter elements use borosilicate glass microfibre media with progressive density gradient: coarse outer zone (5-15 µm) captures bulk aerosol and particulate; fine inner zone (0.01-0.3 µm borosilicate) coalesces sub-micron oil aerosol into droplets for gravity drainage to the sump; DRYCORE elements achieve <0.01 mg/m³ oil carryover at rated flow (ISO 8573-2 Class 1 oil). The DRYCORE filter element design incorporates internal and external support cages to maintain structural integrity at maximum rated differential pressure (1.0 bar), preventing media collapse failure. DRYCORE elements are specified for installation downstream of aftercoolers and upstream of desiccant dryers, protecting desiccant beds from oil contamination that reduces desiccant capacity by 50-80% when oil loading exceeds 0.1 mg/m³. Replacement interval is 4,000 operating hours or when differential pressure exceeds 0.35 bar, whichever occurs first.'
  },
];

const faqs = [
  {
    question: 'What ISO 8573-1 class is required for my application?',
    answer: 'ISO 8573-1 class selection depends on the most contamination-sensitive process downstream. Class 1 (particles <0.1 µm, PDP -70°C, oil <0.01 mg/m³) is required for pharmaceutical manufacturing, food-contact applications, and precision instrument supply. Class 2 (particles <0.1 µm, PDP -40°C, oil <0.1 mg/m³) covers most medical device and electronics assembly. Class 3 (PDP -20°C, oil <1 mg/m³) is standard for general pneumatic tools and automation with metal-to-metal or elastomer seal actuators. Class 4 (PDP +3°C, oil <5 mg/m³) is adequate for blow-off, conveying, and non-contact applications. A common mistake is specifying the compressor output to Class 1 when only a portion of air consumption requires that quality; point-of-use filtration at Class 1 equipment is more economical than treating the entire system volume to Class 1 standards. ISO 8573-1 classification applies to a specific point in the distribution system, not to the compressor output — measure at the point of use.',
  },
  {
    question: 'How is pressure dew point different from atmospheric dew point?',
    answer: 'Atmospheric dew point is the temperature at which water vapour in air at atmospheric pressure (1 bar absolute) condenses to liquid. Pressure dew point (PDP) is the condensation temperature of compressed air at its operating pressure. Compression increases water vapour partial pressure proportionally — air compressed to 7 bar absolute contains 7 times more water vapour mass per unit volume than the same air at 1 bar. The same air that has a -40°C atmospheric dew point will have a PDP of approximately -20°C at 7 bar. When compressed air is depressurised (expanded) at a pneumatic tool or process connection, water vapour partial pressure drops back to atmospheric levels; if the local temperature is above the corresponding atmospheric dew point, no condensation occurs. Specifying dryer performance requires understanding the operating pressure: a desiccant dryer rated for -40°C PDP at 7 bar provides -40°C PDP only at 7 bar; at 4 bar the effective PDP will be warmer. Always specify PDP at the highest system operating pressure.',
  },
  {
    question: 'How often should compressed air coalescing filter elements be replaced?',
    answer: 'Coalescing filter element replacement is triggered by two independent criteria, whichever occurs first: (1) Differential pressure exceeds 0.35 bar across the element (measured with a differential pressure gauge or indicator) — blocked media increases compressor energy consumption and can cause media collapse under high-velocity flow conditions; (2) Elapsed time reaches 12 months or 4,000 operating hours from last replacement — oil-wetted coalescing media develops bacterial growth and hydrocarbon degradation products over time independent of differential pressure reading. Oil-laden elements may show low differential pressure even when contaminated because oil fills media voids, reducing apparent restriction while allowing contaminated airflow; time-based replacement prevents this failure mode. In applications with high oil carryover (reciprocating compressors, aged rotary screw separators), inspection at 6-month intervals is recommended. Record differential pressure at each scheduled PM to track contamination load and anticipate replacement intervals.',
  },
  {
    question: 'Can oil-contaminated desiccant dryer beds be regenerated?',
    answer: 'Desiccant beds contaminated with oil (>0.1 mg/m³ inlet oil concentration) cannot be effectively regenerated to full capacity. Oil molecules permanently occupy adsorption sites on the desiccant surface (silica gel or activated alumina), reducing water adsorption capacity by 50-80% depending on oil loading. Heated regeneration cycles (150-200°C) can partially volatilise lighter hydrocarbon fractions but cannot remove polymerised oil films that form on desiccant at operating temperatures. The correct remediation is desiccant bed replacement combined with installation of a coalescing pre-filter rated to ISO 8573-2 Class 1 (0.01 mg/m³ total oil) upstream of the dryer. Before replacing desiccant, identify and correct the source of oil contamination: inspect compressor separator element condition, measure oil carryover with ISO 8573-2 test methods, and verify separator element replacement interval is being followed. Operating a desiccant dryer without adequate upstream coalescing filtration reduces desiccant service life from 3-5 years (design life) to 6-18 months.',
  },
];

export default function CompressedAirContaminationPage() {
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
            Compressed Air Contamination
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
            Oil carryover, moisture ingress, and particulate contamination mechanisms in compressed air systems, classified per ISO 8573-1.
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
            Compressed air contamination encompasses three principal contaminant classes defined in{' '}
            <Link href="/knowledge-system/standards/compressed-air-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 8573-1</Link>:{' '}
            solid particulates (ambient dust, pipe scale, compressor wear debris), water (condensate from compressed humid air, pressure dew point exceedance), and total oil (lubricant carryover from compressor, oil vapour from ambient air). Each contaminant class degrades pneumatic system reliability through distinct failure mechanisms and must be controlled to the quality class required by the most sensitive downstream process. ISO 8573-1 defines seven classes (0-6) for each contaminant type; class selection determines the treatment train specification.
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
                <Link href="/knowledge-system/fleet/total-cost-ownership" style={{ color: '#FFF12D', textDecoration: 'underline' }}>total cost of ownership analysis</Link>.
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
              { href: '/knowledge-system/contamination/particle-wear', code: '⚙ PARTICLE WEAR', desc: 'Abrasive contamination and three-body wear' },
              { href: '/knowledge-system/contamination/hydraulic-system', code: '⚡ HYDRAULIC', desc: 'Pressurized fluid system contamination' },
              { href: '/knowledge-system/contamination/diesel-water', code: '💧 DIESEL WATER', desc: 'Water ingress in diesel fuel systems' },
              { href: '/knowledge-system/contamination/coolant-contamination', code: '🌡 COOLANT', desc: 'Silicate depletion and cavitation erosion' },
              { href: '/knowledge-system/contamination/fuel-injector-wear', code: '🔧 FUEL INJECTOR', desc: 'HPCR injector stiction and wear' },
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
            CANONICAL KNOWLEDGE BLOCK: Compressed Air Contamination
          </h3>
          <div style={{ lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            <p><strong style={{ color: '#fff' }}>DEFINITION</strong><br />
            Compressed air contamination comprises three ISO 8573-1 classified contaminant classes: solid particulates (ambient dust, pipe scale, compressor debris), water (condensate from pressure dew point exceedance at 130 mL/1,000 m³ for saturated air at 25°C compressed to 7 bar), and total oil (lubricant carryover 1-25 mg/m³ from lubricated compressors).</p>

            <p><strong style={{ color: '#fff' }}>SYSTEMS</strong><br />
            Pneumatic actuator and control valve networks, compressed air distribution pipework, desiccant dryer systems, process air supply for food/pharmaceutical/electronics manufacturing</p>

            <p><strong style={{ color: '#fff' }}>FAILURE_IMPACT</strong><br />
            Oil contamination → elastomeric seal swell (10-30% volume) → valve stiction and positional error | Water condensate → pneumatic actuator bore corrosion → seal life reduction from 2-5 years to 6-18 months | Oil at desiccant dryer inlet &gt;0.1 mg/m³ → desiccant capacity reduction 50-80% → PDP exceedance → downstream condensation | Operational Impact: pharmaceutical non-compliance events 50,000-500,000 USD per incident; actuator seal replacement frequency 2-4× higher at ISO Class 5 vs Class 2</p>

            <p><strong style={{ color: '#fff' }}>RELATED_STANDARDS</strong><br />
            ISO 8573-1: Compressed air purity classes for particles, water, and oil (Class 0-6 for each contaminant) | ISO 8573-2: Test methods for oil aerosol content measurement | ISO 8573-3: Test methods for moisture and pressure dew point measurement | ISO 8573-4: Test methods for solid particle content | ISO 12500: Compressed air filter performance testing</p>

            <p><strong style={{ color: '#fff' }}>RELATED_TECHNOLOGIES</strong><br />
            DRYCORE: Borosilicate glass microfibre coalescing filter achieving &lt;0.01 mg/m³ oil carryover (ISO 8573-2 Class 1), progressive density gradient media, rated to 1.0 bar maximum differential pressure, 4,000-hour replacement interval</p>

            <p><strong style={{ color: '#fff' }}>INDUSTRIAL_ROLE</strong><br />
            Compressed air quality determines pneumatic system reliability and process compliance; inadequate coalescing filtration upstream of desiccant dryers reduces desiccant service life from 3-5 years to 6-18 months, and oil carryover into product-contact processes creates regulatory liability that exceeds the capital cost of the entire filtration system.</p>

            <p><strong style={{ color: '#fff' }}>CITATION_REFERENCE</strong><br />
            source: elimfilters.com/knowledge-system/contamination/compressed-air-contamination<br />
            concept: Compressed Air Contamination<br />
            version: 1.0<br />
            last_updated: 2026-06-30</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/contamination/compressed-air-contamination',
        headline: 'Compressed Air Contamination',
        description: 'Oil carryover (1-25 mg/m³), moisture condensation, and particulate contamination in compressed air systems per ISO 8573-1 classification. Oil contamination of desiccant dryer beds reduces water adsorption capacity 50-80%.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-30',
        keywords: ['compressed air contamination', 'ISO 8573-1', 'oil carryover', 'pressure dew point', 'coalescing filter', 'desiccant dryer', 'pneumatic system', 'DRYCORE', 'ISO 8573-2', 'ISO 8573-3'],
        about: { '@type': 'Thing', name: 'Compressed Air Contamination', description: 'Contamination mechanisms in compressed air systems from oil carryover, moisture, and particulates classified per ISO 8573-1.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Contamination', item: 'https://elimfilters.com/knowledge-system/contamination' },
          { '@type': 'ListItem', position: 4, name: 'Compressed Air Contamination', item: 'https://elimfilters.com/knowledge-system/contamination/compressed-air-contamination' },
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
