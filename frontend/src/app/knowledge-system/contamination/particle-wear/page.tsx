'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ParticleWearPage() {
  const sections = [
    {
      title: 'How Contamination Happens',
      content: 'Particle contamination enters engines through: (1) Air intake - atmospheric dust concentrations vary from 10-500 mg/m³ depending on climate and operational environment; desert operations exceed 1000 mg/m³; conventional air filters (5-10 micron) capture 85-95%, allowing 5-50 mg/m³ penetration into engine; (2) Fuel system - diesel fuel delivery from storage and transfer systems introduces 50-500 particles/mL, with 30-40% in the 10-50 micron range; fuel quality degrades during storage through oxidation and tank corrosion; (3) Internal generation - combustion produces 200-500 mg of particulates per liter of fuel burned; normal combustion generates incomplete oxidation products, soot agglomerates, and organic polymers that settle in oil; (4) Oil circulation - oil collects contamination during operation and carries particles throughout bearing surfaces, piston rings, and valve trains; oil viscosity changes with temperature, altering particle suspension characteristics. In high-dust environments (agriculture, mining, construction), contamination rates can reach 1-5g per 100 operating hours without filtration.'
    },
    {
      title: 'System Damage',
      content: 'Particle-induced wear operates through three distinct mechanisms: (1) Two-body abrasive wear - hard particles (silica, aluminum oxide, iron oxide) embedded in one surface (cylinder wall) scratch the opposite surface (piston ring) as relative motion occurs; this produces grooved wear patterns with depths of 25-100 microns over 1000 hours; two-body wear dominates in the first 500 hours of operation before particle embedment stabilizes; (2) Three-body abrasive wear - loose particles roll between two surfaces (bearing raceway and rolling element) under load, cutting multiple surfaces simultaneously; this produces crater-shaped wear scars (5-25 microns deep) distributed across the entire contact zone; three-body wear dominates under high oil flow rates and establishes the failure signature visible in wear analysis; (3) Adhesive wear - particles lodge in surface asperities and act as welding sites; as relative motion continues, material transfer occurs between surfaces, generating large particles (100-500 microns) that accelerate subsequent abrasive wear. Secondary damage includes: bearing surface spalling when subsurface stress concentrations exceed yield strength at particle sites; ring sticking when accumulated deposits prevent free movement; and valve guide wear that increases crankcase blow-by. Combined wear mechanisms reduce bearing clearances from nominal 30-80 microns to <10 microns, causing metal-to-metal contact and catastropicfailure within 100-200 operating hours.'
    },
    {
      title: 'Operational Impact',
      content: '__LINKED_OPERATIONAL_IMPACT__',
    },
    {
      title: 'Prevention Methods',
      content: 'Particle contamination is controlled through: (1) Multi-stage air filtration - primary intake filter (40-50 micron) removes 95% of dust; secondary filter (15-20 micron) captures 98% of remaining particles; tertiary filter (5-10 micron) removes 99%+ of fine dust; combined system reduces atmospheric ingestion to <1-2 mg/m³ equivalent; (2) Fuel treatment - on-board fuel polishing systems with 5-10 micron filters process fuel circulation during idle periods, removing accumulated contamination; biofuel compatibility filters prevent deposit formation; (3) Oil filtration - premium engine oil filters (10-20 micron absolute, beta-25>200) capture 95-98% of generated wear particles; spin-on cartridge replacement every 250-500 hours maintains particle removal capacity; bypass prevention through proper bypass valve tuning (opening at 3-5 bar differential) ensures all oil passes filtration; (4) Breather filtration - desiccant breathers (10-50 micron) prevent atmospheric dust ingestion into crankcase during thermal breathing; (5) Intake manifold design - sealed intake systems prevent direct atmospheric dust contact; resonance mufflers dissipate acoustic energy that would otherwise resuspend settled particles; (6) Operating practices - avoid idling in high-dust environments; maintain idle air screw settings to prevent oil-air mixing at low RPM; scheduled oil sampling every 100-250 hours to monitor wear particle trends and adjust maintenance intervals.'
    },
    {
      title: 'Related Standards',
      content: '__LINKED_RELATED_STANDARDS__',
    },
    {
      title: 'Related Technologies',
      content: 'ELIMFILTERS air and fuel filtration technologies reduce particle ingestion through: MACROCORE™ progressive density gradient air filters capture 99.98% of particles at 2-10 microns, with outer zone designed for high-volume dust loading (10-50 microns) and core barrier optimized for fine particle penetration barriers; equivalent to ISO 4406 14/12/9 cleanliness in intake air; NANOFORCE™ fuel filtration media achieves 99.9% capture of 3-5 micron particles through electrostatic attraction mechanisms; flow-optimized construction maintains fuel delivery while reducing fuel-borne contamination from 50-100 particles/mL to <5 particles/mL; DURATECH™ spin-on engine oil filters integrate dual-stage architecture (coarse outer stage for rapid large-particle capture, precision inner stage for fine particle removal) achieving ISO 4406 equivalent cleanliness of 16/14/11 in circulating oil. When integrated as primary-secondary systems, these technologies reduce total particulate ingestion by 95-98%, extending engine overhaul intervals from 5,000 hours (contaminated baseline) to 10,000-12,000 hours (filtered baseline).'
    }
  ];

  const faqs = [
    {
      question: 'What particle size causes the most engine damage?',
      answer: 'Particles in the 10-50 micron range cause the highest damage rate: particles <5 microns pass through bearing clearances without causing contact with surfaces; particles >50 microns are typically captured by filters or settle rapidly in oil. The 10-50 micron window represents the "critical damage zone" where particles are small enough to circulate freely in bearing clearances (typically 20-60 microns), yet large enough to support high contact pressures when embedded in surfaces. Within this range, 15-25 micron particles cause maximum damage rate because they create multiple contact points in bearing raceways while maintaining enough size to sustain high local stress concentrations. Equipment operating in environments with 30-50% of contamination in the 15-25 micron range experiences 5-8× faster bearing wear compared to clean baseline. Modern air filtration (MACROCORE™, NANOFORCE™) targets the 5-25 micron range as priority, accepting some loss of very coarse particles (>50 microns) to maintain air flow and concentrate removal effort on the critical damage zone.'
    },
    {
      question: 'How do I interpret wear debris analysis results?',
      answer: 'Wear debris analysis quantifies iron (Fe), copper (Cu), lead (Pb), chromium (Cr), aluminum (Al), nickel (Ni), tin (Sn) concentration in ppm. Normal baselines for 500-hour oil: Fe <20 ppm (ferrous bearing wear), Cu <5 ppm (bearing alloy), Pb <2 ppm (bearing alloy), Cr <1 ppm (piston rings, valve seats). Elevated trends indicate: Fe >50 ppm = cylinder wall or piston ring wear progressing; Cu >15 ppm = bearing copper alloy depletion; Pb >5 ppm = bearing lead-tin backing material exposed. Rate of change is more significant than absolute value; increasing 5 ppm Fe per 250 hours indicates accelerating wear, requiring attention; stable 40 ppm Fe over 1000 hours indicates controlled wear. Particle count (particles/mL >4 microns) rising above 200 ppm simultaneously with metal increase confirms three-body abrasive wear active. Field test kits provide semi-quantitative results; laboratory ICP spectroscopy is required for accurate trending. Establish baseline trending after first 250 hours of operation, then monitor every 250-500 hours in normal operation, accelerating to every 100 hours if elevated metals detected.'
    },
    {
      question: 'Can heavily contaminated engines be reconditioned or must they be rebuilt?',
      answer: 'Engine reconditioning viability depends on damage severity: If wear particle analysis shows elevated metals but <100 ppm Fe and <20 ppm Cu, and bearing noise is absent, reconditioning is viable - remove deposits through bore cleaning, hone cylinder walls, replace piston rings, and install new bearings; cost approximately 30-40% of new engine. If analysis shows >200 ppm Fe, audible bearing knock, or blue discoloration inside cylinders indicating chronic overheating, full overhaul is required - crack the block, bore cylinders to oversize, replace all internal components; cost 50-70% of new engine. If main bearing surfaces are spalled or cylinder walls show >200 microns of scoring, engine is beyond economic repair. Prevention through contamination control is dramatically more cost-effective: a $500 premium air filtration system extends engine life 5,000+ hours, preventing $5,000-15,000 in rebuild or replacement costs. For field decisions, rely on borescope inspection of cylinder walls (visual scoring depth <50 microns = reconditioning candidate; >100 microns = overhaul required) and bearing surface analysis (smooth burnishing = controlled wear; crater patterns or spalling = failure imminent).'
    },
    {
      question: 'How does oil change frequency affect particle accumulation?',
      answer: 'Oil change interval directly controls particle concentration trajectory: Normal interval (500 hours) with premium filtration maintains 20-40 mg/L wear debris until 1500-2000 hours; extended interval (1000 hours) with same filtration accumulates 60-120 mg/L by 2000 hours, accelerating wear rates 2-3×; extended interval (1000 hours) with standard filtration reaches 150-300 mg/L, causing engine damage by 1500 hours. Optimal strategy depends on contamination environment: Clean environment (enclosed workshop, controlled climate) supports 1000-hour intervals with on-board filtration; Moderate environment (agricultural use, outdoor but covered storage) requires 500-hour intervals with dual-stage filtration; Severe environment (mining, desert, unpaved roads) requires 250-hour intervals with primary-secondary filtration plus oil conditioning systems. Oil condition monitoring via particle counting (ISO 4406 classification every 100-250 hours) enables condition-based maintenance - change oil when cleanliness reaches ISO 19/17/14, not at fixed-hour intervals. This approach can extend intervals 25-40% while maintaining superior wear protection compared to fixed-interval baseline.'
    },
    {
      question: 'What is the difference between combustion-generated particles and external contamination?',
      answer: 'Combustion particles are generated internally during fuel burning (200-500 mg per liter burned): soot (incompletely oxidized fuel hydrocarbons), sulfur oxides (from sulfur content in fuel), organic polymers (oxidation products of fuel and oil), and carbon residue deposits. These settle in oil as 5-25 micron particles and are normal wear products. External contamination originates outside the combustion chamber: dust ingestion (5-100+ microns, primarily silica and iron oxides), fuel tank corrosion products (rust and scale, 10-100 microns), and water-containing deposits (2-10 microns). Oil analysis distinguishes them: combustion particles show consistent elemental signatures (carbon-based with trace sulfur/vanadium from fuel additives); external particles show characteristic metallurgy (silica signature for mineral dust, iron dominance for corrosion). Wear metals (Fe, Cu, Pb) indicate bearing interaction; their presence confirms particles have reached bearing surfaces where abrasive damage occurs. Reduction strategy differs: combustion particles require oil change intervals matched to oxidation rate; external contamination requires filtration system upgrade. Modern analysis equipment (particle counting + elemental analysis) provides both particle size distribution and elemental signature, allowing technicians to distinguish root cause and target remediation appropriately.'
    }
  ];

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
            Particle Wear in Engines
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
            Abrasive contamination mechanisms and three-body wear progression analysis.
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Short Definition — with internal links */}
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
            Particle wear in engines is the accelerated material removal from bearing surfaces, piston rings, cylinder walls, and fuel injector components caused by the presence of hard abrasive particles in combustion byproducts, fuel, and engine oil. This failure mode is directly connected to contamination management practices documented in the{' '}
            <Link href="/knowledge-system/standards/lube-oil-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>lube oil filtration systems</Link>{' '}
            domain. Particulate contamination originates from three sources: external ingestion (atmospheric dust, sand) that bypasses air filtration, internal generation (combustion carbon, metal oxidation debris, wear particles), and fuel-borne contaminants (industrial dust, storage tank corrosion products, sulfur oxides from combustion). Particle size ranges from 5-100 microns; those &gt;10 microns initiate visible wear patterns, while &lt;5 micron particles cause progressive surface degradation. The interaction between particles and metal surfaces operates through three distinct wear mechanisms that compound over equipment life.
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
            {section.content === '__LINKED_OPERATIONAL_IMPACT__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
                Particle-induced wear produces measurable operational degradation: Oil consumption increases 15-40% as wear widens ring clearances and increases blow-by; Engine blow-by increases from &lt;1% to 5-10% of intake air volume, reducing combustion efficiency and elevating crankcase pressure; Fuel economy deteriorates 5-12% as increased friction losses and combustion inefficiency require higher fuel rates; Compression pressure drops 10-25%, reducing cold-start capability and full-load power output; Oil viscosity increases faster than normal (1.5-2× standard oxidation rate) due to contamination-induced viscosity shear; Wear debris concentration in oil reaches 100-500 mg/L within 250-500 hours (normal limit: 20-50 mg/L), triggering unplanned oil changes; Filter bypass events occur when particulate loading exceeds filter capacity within 50-75% of normal service interval; Engine noise increases 3-6 dB as bearing clearances widen and piston slap develops; Unplanned maintenance requirement rises to one event per 500-750 operating hours in contaminated environments. Equipment availability drops 15-25% in agricultural and construction applications operating in high-dust zones. For fleet-level strategies to reduce this downtime,{' '}
                <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>see the fleet downtime reduction guide</Link>.
              </p>
            ) : section.content === '__LINKED_RELATED_STANDARDS__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
                Particle contamination thresholds and detection methods are defined by:{' '}
                <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
                and{' '}
                <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
                (particle cleanliness codes defining maximum allowable 4µm, 6µm, and 14µm particles in hydraulic/fuel systems); ASTM D7085 (wear metals content by inductively coupled plasma spectroscopy, quantifies Fe, Cu, Pb, Cr, Al, Ni, Sn from bearing alloys and steel); ASTM D7364 (particle count and distribution by laser particle counter); ISO 4572 (engine oil viscosity classification and particle size thresholds); SAE J1211 (engine oil analysis procedures); SAE J1539 (diesel engine air intake cleanliness classification, defines maximum inlet contamination for various application categories); ISO 11158 (diesel engine oil specification, includes particle content limits for ISO 4406 16/14/11 minimum); NFPA T2.14 (machine tool hydraulic fluid requirements, establishes ISO 16889 18/16/13 minimum cleanliness).
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
        maxWidth: '900px',
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
        maxWidth: '900px',
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
            <Link href="/knowledge-system/contamination/diesel-water" style={{ textDecoration: 'none' }}>
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
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', margin: '0 0 0.5rem 0' }}>💧 WATER</p>
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>Water ingress and microbial growth</p>
              </div>
            </Link>
            <Link href="/knowledge-system/contamination/hydraulic-system" style={{ textDecoration: 'none' }}>
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
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', margin: '0 0 0.5rem 0' }}>⚡ HYDRAULIC</p>
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>Pressurized fluid system contamination</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Particle Wear in Engines',
        description: 'Particle contamination in engine oil and air intake systems causes three-body abrasive wear that reduces bearing life from 15,000+ hours to 2,000-3,000 hours. Particles in the 10-50 micron range represent the critical damage zone for bearing surfaces and piston rings.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['particle wear', 'engine contamination', 'abrasive wear', 'ISO 4406', 'wear debris analysis', 'MACROCORE', 'NANOFORCE', 'DURATECH', 'bearing wear', 'engine filtration'],
        about: { '@type': 'Thing', name: 'Particle Wear in Engines', description: 'Abrasive wear mechanism in engines caused by particle contamination in lube oil and combustion air, resulting in bearing surface damage and accelerated component failure.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Contamination', item: 'https://elimfilters.com/knowledge-system/contamination' },
          { '@type': 'ListItem', position: 4, name: 'Particle Wear in Engines', item: 'https://elimfilters.com/knowledge-system/contamination/particle-wear' },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What particle size causes the most engine damage?', acceptedAnswer: { '@type': 'Answer', text: 'Particles in the 10-50 micron range cause the highest damage rate: particles <5 microns pass through bearing clearances without causing contact with surfaces; particles >50 microns are typically captured by filters or settle rapidly in oil. The 10-50 micron window represents the "critical damage zone" where particles are small enough to circulate freely in bearing clearances (typically 20-60 microns), yet large enough to support high contact pressures when embedded in surfaces. Within this range, 15-25 micron particles cause maximum damage rate because they create multiple contact points in bearing raceways while maintaining enough size to sustain high local stress concentrations. Equipment operating in environments with 30-50% of contamination in the 15-25 micron range experiences 5-8x faster bearing wear compared to clean baseline.' } },
          { '@type': 'Question', name: 'How do I interpret wear debris analysis results?', acceptedAnswer: { '@type': 'Answer', text: 'Wear debris analysis quantifies iron (Fe), copper (Cu), lead (Pb), chromium (Cr), aluminum (Al), nickel (Ni), tin (Sn) concentration in ppm. Normal baselines for 500-hour oil: Fe <20 ppm (ferrous bearing wear), Cu <5 ppm (bearing alloy), Pb <2 ppm (bearing alloy), Cr <1 ppm (piston rings, valve seats). Elevated trends indicate: Fe >50 ppm = cylinder wall or piston ring wear progressing; Cu >15 ppm = bearing copper alloy depletion; Pb >5 ppm = bearing lead-tin backing material exposed. Rate of change is more significant than absolute value; increasing 5 ppm Fe per 250 hours indicates accelerating wear, requiring attention.' } },
          { '@type': 'Question', name: 'Can heavily contaminated engines be reconditioned or must they be rebuilt?', acceptedAnswer: { '@type': 'Answer', text: 'Engine reconditioning viability depends on damage severity: If wear particle analysis shows elevated metals but <100 ppm Fe and <20 ppm Cu, and bearing noise is absent, reconditioning is viable - remove deposits through bore cleaning, hone cylinder walls, replace piston rings, and install new bearings; cost approximately 30-40% of new engine. If analysis shows >200 ppm Fe, audible bearing knock, or blue discoloration inside cylinders indicating chronic overheating, full overhaul is required. If main bearing surfaces are spalled or cylinder walls show >200 microns of scoring, engine is beyond economic repair.' } },
          { '@type': 'Question', name: 'How does oil change frequency affect particle accumulation?', acceptedAnswer: { '@type': 'Answer', text: 'Oil change interval directly controls particle concentration trajectory: Normal interval (500 hours) with premium filtration maintains 20-40 mg/L wear debris until 1500-2000 hours; extended interval (1000 hours) with same filtration accumulates 60-120 mg/L by 2000 hours, accelerating wear rates 2-3x; extended interval (1000 hours) with standard filtration reaches 150-300 mg/L, causing engine damage by 1500 hours. Optimal strategy depends on contamination environment: Clean environment supports 1000-hour intervals with on-board filtration; Severe environment (mining, desert) requires 250-hour intervals with primary-secondary filtration plus oil conditioning systems.' } },
        ],
      }) }} />
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Air Intake Filtration Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, lube, air_intake, bearing</p>
        <p>CONCEPT_TAXONOMY: type=failure | domain=contamination | mechanism=abrasive-wear</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ASTM D7085</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/diesel-water, /knowledge-system/contamination/hydraulic-system</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DURATECH</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;concept_id: particle-wear-contamination</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
