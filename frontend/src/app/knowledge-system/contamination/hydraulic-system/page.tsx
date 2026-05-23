'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function HydraulicSystemContaminationPage() {
  const sections = [
    {
      title: 'How Contamination Happens',
      content: 'Contamination enters hydraulic systems through multiple pathways: (1) Component manufacturing residue - metal particles, sand, machining chips remain inside pumps, motors, actuators after manufacturing; flush-out procedures remove 70-80% but 5-20% remain, releasing slowly during operation; (2) Seal degradation - elastomer seals (polyurethane, nitrile) degrade from fluid oxidation, excessive temperature (>60°C), or mechanical wear; breakdown products are 2-50 microns and circulate freely throughout the system; (3) External ingestion - contamination enters through damaged hoses, loose filler caps, worn rod wipers on cylinder actuators; atmospheric dust concentrations of 10-500 mg/m³ introduce 5-100 particles/mL with each atmospheric exposure; (4) Internal generation - ferrous components corrode from water presence, generating 50-200 ppm iron contamination within 200 hours; fluid oxidation produces organic polymers (gum, varnish) that agglomerate into 10-100 micron particles; (5) Pump wear particles - during normal operation, pump wear rings and slipper surfaces generate 10-50 mg of wear debris per 100 hours, releasing into circulation. Hydraulic systems are particularly vulnerable because fluid circulates continuously through precision components, and the high-pressure environment prevents particle settling that would allow physical separation in lower-pressure systems.'
    },
    {
      title: 'System Damage',
      content: 'Contamination triggers component failure through pressure-specific failure modes: (1) Valve spool stiction - particles (10-50 microns) lodge in the gap between spool and housing (typically 10-20 microns); spool friction increases from <0.1 bar to 5-15 bar differential pressure required for actuation; valve response time extends from <50 milliseconds to 500+ milliseconds, preventing proportional control; (2) Orifice blockage - pilot stage orifices (0.5-2mm diameter) contain 20-100 micron restriction passages; particles >5 microns accumulate and restrict flow, reducing pilot pressure from nominal 10-30 bar to <2 bar, causing main stage valve to remain in neutral or fail actuation; (3) Pump swashplate stiction - micron-scale wear on swashplate servo valve surfaces (typical finish 0.1 microns Ra) is disrupted by particles >1 micron; bearing friction increases, displacement regulation fails, and pump output remains at full flow regardless of demand, generating heat and cavitation damage; (4) Seal extrusion - wear particles or varnish deposits prevent dynamic seals from seating evenly; internal leakage increases from <1% to 10-25% of pump flow, reducing system pressure by 5-20 bar; (5) Heat exchanger blockage - system varnish and organic polymers deposit on cooler tubes, reducing heat transfer coefficient by 30-60%; fluid temperature rises from nominal 45°C to 65-75°C, accelerating oxidation 2-3× and triggering chain-reaction failures. System pressure relief valves protect against pressure spikes caused by contaminated component resistance, but prolonged over-pressure operation causes relief valve wear and eventual blow-by. Complete system failure occurs within 200-500 operating hours in severely contaminated baseline (ISO 16889 >22/20/18).'
    },
    {
      title: 'Operational Impact',
      content: '__LINKED_HYDRAULIC_IMPACT__',
    },
    {
      title: 'Prevention Methods',
      content: 'Hydraulic system contamination is controlled through: (1) Pre-commissioning filtration - all systems must be flushed at 2-3 meters per second flow velocity for 8-16 hours using 3-5 micron absolute filters before equipment operation; flush until particle count reaches ISO 4406 15/13/10 (acceptable operating baseline); (2) On-line filtration - main circuit filters rated ISO 16889 16/14/11 absolute with flow rates matching pump displacement; secondary loop filtration with offline kidney-loop system circulates fluid through 3-5 micron filters during idle periods, maintaining fluid cleanliness between equipment operation; (3) Return line filtration - all return flows pass through 10-25 micron filters before tank return; tank-top mounted spin-on cartridges with saturation indicators prevent bypass when media becomes clogged; (4) Breather filtration - tank breathing occurs as fluid level changes during actuator extension/retraction; install desiccant breathers (silica-gel, 3-micron) to prevent atmospheric dust and moisture ingress; (5) Fluid analysis - quarterly particle counting (ISO 4406 classification) and water content testing (Karl Fischer) monitors system contamination trajectory; establish action limits (trigger fluid change if ISO exceeds 17/15/12, water exceeds 200 ppm); (6) Seal maintenance - replace dynamic seals every 1000-2000 hours in high-contamination environments; specify upgraded seal designs (multi-lip, spring-loaded) that resist varnish deposit formation; (7) Cooler maintenance - inspect cooler tubes quarterly for varnish deposits; chemical flushing every 500-1000 hours if deposits exceed 10% of tube surface area.'
    },
    {
      title: 'Related Standards',
      content: '__LINKED_HYDRAULIC_STANDARDS__',
    },
    {
      title: 'Related Technologies',
      content: 'ELIMFILTERS hydraulic filtration technologies provide multi-stage contamination control: NANOFORCE™ main circuit filters achieve ISO 16889 15/13/10 particle removal with synthetic media that resists varnish deposit formation and maintains permeability across service life; 10-micron absolute with beta-10>200 ensures 99%+ capture of particles >10 microns; DURATECH™ return line filters (25-micron) capture gross contamination and prevent tank bottom accumulation, extending kidney-loop filter life 2-3×; AQUAGUARD™ water-removal cartridges integrate superabsorbent polymer cores that trap free water and prevent emulsification, reducing water content from 500-1000 ppm to <100 ppm in single-pass operation through offline kidney-loop; integrated desiccant breathers maintain tank air quality while blocking atmospheric moisture and dust. Three-stage filtration (main circuit 10-micron, return line 25-micron, kidney-loop 3-5 micron) enables initial flushing to ISO 4406 15/13/10 within 6-8 hours (versus 16+ hours with single-stage), reducing commissioning time and cost while achieving sustained cleanliness ISO 16889 16/14/11 throughout equipment operational life.'
    }
  ];

  const faqs = [
    {
      question: 'What is the correct procedure for flushing a hydraulic system before commissioning?',
      answer: 'ISO 4406 flushing procedure: (1) Install temporary bypass loops with 3-5 micron filters on main circuit and return line; (2) Fill system with new, clean hydraulic fluid (pre-flushed to ISO 4406 15/13/10 minimum); (3) Operate pump at 50% rated displacement, 1000-1500 RPM for 2 hours, monitoring fluid temperature (maintain <50°C, reduce pump speed if temperature exceeds 55°C); (4) Increase pump displacement to 75% for 3 hours at 1500 RPM; (5) Increase to full displacement and rated RPM for 3-4 hours at system pressure (70% of relief setting); (6) Take fluid samples every 2 hours and measure particle count (ISO 4406) - continue flushing until three consecutive samples confirm ISO 15/13/10 or better; (7) Circulate through offline kidney-loop at 2-3 m/s velocity for 4-8 additional hours to achieve ISO 4406 14/12/9 system cleanliness target; (8) Install permanent filters, change fluid one final time, and verify target cleanliness with freshly drawn sample. Total flushing duration: 20-24 hours for new equipment, 40-48 hours for previously contaminated systems being reconditioned. Cost: 2-4 days technician labor + filter replacement. Skip or abbreviate flushing is the most common cause of premature hydraulic system failure.'
    },
    {
      question: 'How do I choose between offline kidney-loop and main circuit filtration?',
      answer: 'Main circuit filters (on-line): Sized to match pump flow, rated 10-25 micron absolute; protect components during equipment operation; increase pressure drop 1-3 bar during peak flow. Kidney-loop (offline): Circulates fluid through pump at low flow rate (5-10% of main pump displacement) during idle periods and low-load operation; removes contamination continuously without affecting system pressure response. Optimal strategy uses both: Main circuit filter (16-micron) handles routine 80-90% of duty cycle; Kidney-loop (3-5 micron) processes 30-40% of total system flow during idle periods and overnight operation, achieving sustained ISO 16/14/11 or better. Kidney-loop alone is insufficient because it cannot prevent component exposure to high-pressure contamination during peak operation. Main circuit alone may not achieve target cleanliness in severe environments (construction, agricultural equipment). In mobile equipment with <2000 annual operating hours, main circuit filtration is sufficient. In manufacturing (continuous operation) or marine hydraulics (extended seasonal duty), dual-stage with kidney-loop is justified by reduced failure frequency and extended fluid life.'
    },
    {
      question: 'What causes hydraulic fluid varnish and how is it removed?',
      answer: 'Varnish forms through three mechanisms: (1) Thermal oxidation - fluid oxidizes at elevated temperatures (>60°C sustained), producing organic polymers; rate doubles for each 10°C temperature increase; (2) Catalytic oxidation - ferrous contamination (iron particles >100 ppm) accelerates oxidation 3-5×; (3) Fluid degradation - incompatible fluid blends or incorrect fluid selection (wrong viscosity grade for operating temperature) produce unstable mixtures that polymerize. Varnish appears as yellow-brown deposits on cooler tubes, strainer screens, proportional valve spools, and pump wetted surfaces. Removal requires: (1) Offline circulation through high-capacity filters (3-5 micron absolute) for 100-200 hours; varnish particles agglomerate and are captured by media; (2) Chemical flushing using approved hydraulic system cleaner (only ISO 6743-4 HEC or HEP fluids compatible with seal materials); circulate at 2-3 m/s for 24-48 hours; (3) Cooler tube cleaning - remove cooler core and flush with compressed air or hot water if varnish deposits exceed 10% of tube surface; (4) Complete fluid change after chemical cleaning. Prevention is far more cost-effective than remediation: maintain fluid temperature <55°C through proper cooler sizing; control iron contamination <100 ppm through filtration; perform quarterly fluid analysis to detect oxidation early (oxidation measured by acid number, ASTM D664); specify high-quality fluid formulated for temperature stability in your operating environment.'
    },
    {
      question: 'How do valve spools become stuck and can they be cleaned?',
      content: 'Valve spool stiction results from: (1) Particle lodging in radial clearance (10-20 microns) between spool and housing bore; (2) Varnish film deposit forming an adhesive layer; (3) Corrosion product layer from water-induced oxidation. Spool becomes increasingly difficult to move, eventually refusing actuation despite normal pilot pressure. Recovery is difficult: In-situ cleaning is unreliable - circulating high-pressure flush does not dislodge embedded particles or varnish; success rate <30%. Spool replacement is necessary: Remove valve cartridge (0.5-2 hour labor), soak original spool in hydraulic system cleaner for 24 hours (may recover 50%), test cleaned spool actuation with pilot pressure (go/no-go test); if stiction remains >5 bar differential, replace with new spool (cost $200-800 depending on valve type). Prevention through contamination control is far more cost-effective than spool replacement: maintain ISO 16889 16/14/11 maximum cleanliness, replace return line filters before saturation (saturation indicator <50%), perform fluid analysis quarterly to detect oxidation and varnish formation early. Proportional control systems (load-sensing, closed-center) are more sensitive than directional control valves; they require ISO 15/13/10 cleanliness minimum, not 16/14/11.'
    },
    {
      question: 'What is acceptable water content in hydraulic fluid and when must fluid be changed?',
      answer: 'Water content thresholds vary by application: General industrial hydraulics: <200 ppm (0.02% by volume) operational limit, change fluid at 500 ppm; Proportional control systems: <100 ppm limit, change at 250 ppm; Mobile equipment (excavators, loaders): <300 ppm, change at 1000 ppm due to frequency of water exposure; Marine hydraulics: <500 ppm, change at 1500 ppm (extended storage periods prevent frequent fluid changes). Water is measured by Karl Fischer titration (ASTM D6304), reporting both free water (separable by gravity) and total water (including emulsified). Free water >20 ppm requires immediate action - drain tank bottom sediment and circulate through water-removal filters. Total water >threshold requires fluid change within 50-100 operating hours; continued operation risks microbial growth and corrosion accumulation. Quarterly testing (every 250 operating hours) via Karl Fischer detects upward water trend early. Desiccant breather maintenance is critical - when silica gel indicator shows saturation (color change from blue to pink), replace immediately; saturated breathers admit 50-100 ppm water per atmospheric breathing cycle.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Button */}
      <Link href="/knowledge-system/contamination" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← CONTAMINATION</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: '8rem',
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
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // CONTAMINATION & FAILURE MODES
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Hydraulic System Contamination
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Precision contamination control requirements in pressurized fluid systems.
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
            fontFamily: 'Outfit, sans-serif',
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
          }}>
            Hydraulic system contamination refers to the presence of unwanted particles, water, air, and degradation products in pressurized hydraulic fluid. The engineering principles governing this domain are defined in the{' '}
            <Link href="/knowledge-system/standards/hydraulic-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>hydraulic systems standards</Link>{' '}
            domain. Hydraulic systems operate at pressures ranging from 70-350 bar (1000-5000 psi), where component tolerances are measured in micrometers and flow velocities reach 4-6 meters per second. Contamination causes failure through three distinct pathways: mechanical blockage (particles jam valve spools or orifices), chemical degradation (water initiates corrosion and viscosity loss), and mechanical wear (particles embed in seals and precision surfaces). Hydraulic system failures progress rapidly — contamination that would cause slow degradation in low-pressure systems triggers catastrophic failure in hydraulic applications within weeks. This operational environment requires contamination control orders of magnitude more stringent than other fluid systems: maximum tolerable particle concentration is ISO 16889 16/14/11 (320 particles &gt;4µm per milliliter).
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
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFF12D',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h2>
            {section.content === '__LINKED_HYDRAULIC_IMPACT__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                Contamination-induced failures in hydraulic systems produce immediate operational impact: Equipment control becomes erratic — actuators move slowly or incompletely; proportional valves (used in load-sensing systems) develop hunting behavior (oscillation ±10-30% of commanded position) as servo valve response time increases; Material handling equipment loses smooth motion control, increasing cycle time 20-40% and safety risk. System pressure increases 10-30% as contaminated components create resistance, elevating pump load and fuel consumption 15-25%; Heat generation increases from baseline 5-10 kW to 15-25 kW in a 50 kW hydraulic system, overwhelming cooler capacity; Fluid temperature runaway occurs within 100-200 operating hours, triggering automatic shutdown or fluid vaporization in high-pressure actuators. Unplanned maintenance escalates to 1-2 events per 500 operating hours; average diagnostic and repair time is 6-12 hours due to difficulty identifying contamination as root cause (technicians often replace components without addressing contamination source). Equipment availability drops 15-30% in mobile equipment (excavators, loaders) and manufacturing machinery (presses, injection molding) that depend on hydraulic proportional control. Cost impact includes: fluid replacement (every 500-1000 hours instead of 2000-4000 hours), component replacement, extended downtime, and potential production losses ($1000-5000 per hour in manufacturing applications). For a full analysis of ownership costs,{' '}
                <Link href="/knowledge-system/fleet/total-cost-ownership" style={{ color: '#FFF12D', textDecoration: 'underline' }}>see the total cost of ownership guide</Link>.
              </p>
            ) : section.content === '__LINKED_HYDRAULIC_STANDARDS__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                Hydraulic fluid cleanliness and contamination thresholds are defined by:{' '}
                <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
                (Hydraulic fluid power systems — Fluids — Method for coding the degree of contamination by solid particles, maximum ISO 16/14/11 for most systems, 15/13/10 for proportional control); ISO 4406 (legacy cleanliness code, equivalent ISO 16889 16/14/11 ≈ ISO 4406 18/16); ASTM D7368 (methods for testing hydraulic fluid for particulate contaminants); ISO 4572 (hydraulic fluids — ISO classification by viscosity); SAE J1487 (hydraulic fluid recommended practice for color and appearance, cleanliness); ISO 11158 (industrial hydraulic oils, specifies ISO 4406 cleanliness requirements); DIN 51524 (German standard for hydraulic fluids, specifies ISO 4406 cleanliness levels); NFPA (National Fluid Power Association) T2.14 (machine tool hydraulic fluid minimum cleanliness ISO 16889 18/16/13 for standard systems, 17/15/12 for proportional control); ISO 11171 (calibration of automatic particle counters used to verify system cleanliness).
              </p>
            ) : (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
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
            fontFamily: 'Outfit, sans-serif',
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
                  fontFamily: 'Outfit, sans-serif',
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
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em',
          }}>
            Explore Other Contamination Types
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
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
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>Water ingress and microbial growth</p>
              </div>
            </Link>
            <Link href="/knowledge-system/contamination/particle-wear" style={{ textDecoration: 'none' }}>
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
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', margin: '0 0 0.5rem 0' }}>⚙ PARTICLE WEAR</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>Abrasive contamination and wear</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
