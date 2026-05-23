'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const STANDARDS = [
  { code: 'ISO 11155-1', desc: 'Particle filtration efficiency testing for cabin air filter elements using synthetic dust at controlled concentrations, defining minimum 85% efficiency at PM10 particle size class.' },
  { code: 'ISO 11155-2', desc: 'Gaseous contaminant filtration testing for cabin air systems, covering carbon filter performance against NO2, SO2, ozone, and organic vapor penetration.' },
  { code: 'DIN 71220', desc: 'German standard for operator cabin air filtration in mobile off-highway equipment, specifying filter construction requirements and minimum service interval performance.' },
  { code: 'ISO 16890', desc: 'General air filtration standard classifying filters by PM1, PM2.5, and PM10 efficiency ratings, increasingly applied to mobile equipment cabin filtration specification.' },
];

const TECHNOLOGIES = [
  {
    name: 'SYNTRAX',
    slug: 'syntrax',
    role: 'Electrostatically-enhanced synthetic fiber media providing 92-97% efficiency at PM10 particle class with stable efficiency through the full service interval under positive cabin pressure.',
  },
  {
    name: 'DURATECH',
    slug: 'duratech',
    role: 'Reinforced pleated construction maintaining structural integrity through temperature cycling and positive cabin pressure differentials across extended 500-1000 hour service intervals.',
  },
];

const OPERATIONAL_IMPACTS = [
  { metric: '100-500', unit: 'mg/m³', label: 'Ambient dust concentration during harvest and construction operations' },
  { metric: '8-10', unit: 'hrs', label: 'Daily operator exposure during standard industrial work shifts' },
  { metric: '85-95%', unit: 'PM10', label: 'Minimum filter efficiency required for adequate respiratory protection' },
  { metric: '150-200', unit: 'Pa', label: 'Maximum restriction before cabin positive pressure drops below protection threshold' },
];

const FAQS = [
  {
    q: 'What particle sizes are most critical for operator health in cabin air filtration?',
    a: 'PM10 particles (particles under 10 microns aerodynamic diameter) penetrate the upper respiratory tract and deposit in bronchial passages. PM2.5 (under 2.5 micron) particles penetrate deep into lung alveoli and carry the highest health risk. Cabin air filtration targets PM10 as the primary protection class because achieving 99%+ efficiency at PM2.5 requires unacceptably high pressure drop for the fan volumes used in mobile equipment HVAC systems. A well-maintained cabin filter achieving 85-95% efficiency at PM10 significantly reduces deposited dose even when external concentrations reach 500 mg/m3.',
  },
  {
    q: 'How does cabin filter degradation affect operator health before visual saturation is apparent?',
    a: 'Cabin filter efficiency decreases progressively with dust loading. At 50% filter capacity, efficiency may drop 5-10% below rated performance. At 80% capacity, efficiency loss reaches 15-25% below rated values. More critically, bypass can occur at element edge seals before the filter face becomes visually saturated. Restriction-based service timing (150-200 Pa differential) is more reliable than visual inspection or fixed-hour intervals for maintaining actual operator protection performance.',
  },
  {
    q: 'Why do agricultural operations require more frequent cabin filter service than construction?',
    a: 'Agricultural operations during grain harvest generate unique contamination combinations: fine chaff particulate (5-50 micron range), crop-specific allergens from pollen and grain dust, and secondary contamination from pesticide residue on harvested material. Combine harvesters during dry-season wheat or corn harvest can encounter 500-1500 mg/m3 dust concentrations - 10 to 30 times higher than urban construction sites. A cabin filter designed for 1000-hour service in typical conditions may be functionally saturated in 100-200 hours during peak agricultural operations, requiring weekly inspection protocols.',
  },
  {
    q: 'What are the operator health risks from operating without a functioning cabin filter?',
    a: 'Operating without cabin filtration in dusty environments exposes operators to occupational dust limits that exceed OSHA PEL standards within hours. Crystalline silica dust (SiO2) from soil and rock contact causes progressive silicosis after years of cumulative exposure - an irreversible fibrotic lung disease. Grain and crop dusts are recognized respiratory sensitizers that trigger occupational asthma. Cognitive performance and reaction time measurably decrease at PM10 concentrations above 150 mg/m3 even during single-shift exposure, directly affecting equipment operator safety in confined-space or high-traffic environments.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'AIR', title: 'Air Intake Systems', href: '/knowledge-system/standards/air-intake-systems' },
  { code: 'LUBE', title: 'Lube / Oil Systems', href: '/knowledge-system/standards/lube-oil-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
];

export default function CabinSafetySystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>// INDUSTRIAL STANDARDS · CABIN SAFETY</p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>Cabin / Human Safety Filtration Systems</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Operator cabin air filtration protecting breathing air quality against PM10 dust, agricultural allergens, and chemical vapors that cause respiratory stress and cognitive degradation during extended equipment operation in contaminated industrial environments.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Cabin Air Filtration Domain</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Mobile equipment operator cabins in agricultural and construction applications represent a distinct filtration domain where the protected medium is human breathing air rather than a mechanical fluid. Agricultural combine harvesters, tractors, excavators, and mining haul trucks expose operators to external dust concentrations of 100-1500 mg/m3 during operation - concentrations that can cause acute respiratory stress and long-term occupational lung disease without adequate cabin filtration. Cabin safety filtration sits alongside engine air, fuel, hydraulic, and lube systems as one of the six domains covered by the <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration systems framework</Link>.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Modern cabs maintain positive internal pressurization (5-10 Pa above exterior) to prevent unfiltered dust infiltration through door seals and gaps. The cabin air filter is the primary barrier preventing external contamination from reaching operator breathing space. Unlike engine air intake filters that protect mechanical components with defined particle tolerance limits, cabin filters must protect biological tissue with no safe exposure threshold for contaminants such as crystalline silica and sensitizing crop allergens.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Operator Exposure Pathways</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                title: 'PM10 Mineral Dust',
                desc: 'Soil and rock particulate suspended during tillage, grading, and material handling operations constitutes the primary bulk contamination load. Fine mineral particles in the PM10-PM2.5 range deposit in bronchial tissue and accumulate with repeated exposure across working seasons.',
              },
              {
                title: 'Crystalline Silica (SiO2)',
                desc: 'Quartz and cristobalite silica dust from soil disturbance causes progressive silicosis - an irreversible fibrotic lung disease - at cumulative exposures exceeding OSHA PEL limits. Agricultural topsoil and construction site soils contain 5-30% crystalline silica depending on geological region.',
              },
              {
                title: 'Agricultural Allergens and Crop Dust',
                desc: 'Grain dust, pollen, fungal spores from harvested crops, and processing dust are recognized respiratory sensitizers. Operators exposed without protection develop occupational asthma and hypersensitivity pneumonitis that progressively worsens with continued exposure even at sub-threshold concentrations.',
              },
              {
                title: 'Chemical Spray Vapors',
                desc: 'Pesticide, herbicide, and fertilizer aerosols generated during application operations infiltrate cab air through HVAC systems without chemical-rated activated carbon cabin filters. Standard particle filters provide no protection against pesticide vapors, herbicide aerosols, or fumigation gases.',
              },
              {
                title: 'Diesel Exhaust Re-Circulation',
                desc: 'Diesel particulate matter (DPM) from the operating machine and nearby equipment can enter HVAC fresh air intakes during idling and low-speed maneuvers. Exhaust particulate in PM2.5 range is a Group 1 IARC carcinogen with no safe exposure threshold.',
              },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'start' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D' }}>{std.code}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / OPERATIONAL IMPACT</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination Exposure Parameters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {OPERATIONAL_IMPACTS.map((impact) => (
              <div key={impact.metric} style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>{impact.metric}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.6)', marginBottom: '0.5rem' }}>{impact.unit}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{impact.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Cabin filter failure has both immediate and long-term health consequences. Acute exposure at 500+ mg/m3 without filtration causes measurable pulmonary function reduction within a single work shift. Cumulative lifetime exposure beyond regulatory limits results in occupational lung disease qualifying as permanent disability. From a fleet operations perspective, cabin filter maintenance is the lowest-cost intervention with the highest operator health protection return on investment. Proactive cabin filter management is one component of broader <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction strategies</Link> that integrate condition-based maintenance across all filtration domains.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Particle Exposure Analysis</h2>
          <Link href="/knowledge-system/contamination/particle-wear" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Particle Wear in Engines</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>The same atmospheric particles that enter engine air intakes also contaminate cabin air. Understanding particle size distribution, concentration mechanisms, and the three-body abrasion model provides context for cabin contamination severity in high-dust industrial environments.</p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>VIEW ANALYSIS →</span>
            </motion.div>
          </Link>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>06 / ELIMFILTERS TECHNOLOGIES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Filtration Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', height: '100%' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem' }}>{tech.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>07 / SYSTEM DESIGN CONSIDERATIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                title: 'Positive Pressure Maintenance',
                body: 'Cab pressurization of 5-10 Pa above exterior pressure prevents unfiltered infiltration through door seals and structural gaps. HVAC blower and cabin filter restriction must be matched to maintain this differential as the filter loads. As restriction increases, blower capacity must overcome both the filter differential and maintain static cabin pressurization.',
              },
              {
                title: 'Restriction-Based Service Intervals',
                body: 'Cabin filter elements should be serviced when restriction reaches 150-200 Pa differential, before efficiency drops to unacceptable levels. In peak harvest environments, restriction can reach service threshold within 80-120 hours. A cabin differential pressure indicator enables condition-based maintenance rather than calendar-based guessing.',
              },
              {
                title: 'Chemical vs. Particle-Only Filtration',
                body: 'Standard cabin filters address particle contamination only. Chemical application environments require combination filters with activated carbon impregnation or dual-stage systems with separate activated carbon elements downstream of the particle filter. Standard particle filters provide no protection against pesticide vapors, herbicide aerosols, or fumigation gases.',
              },
              {
                title: 'Seal Integrity Inspection',
                body: 'Cabin filter media efficiency only protects breathing air when element edge seals are intact. Compression seal degradation, housing cracks, and HVAC duct leaks allow unfiltered air bypass that negates filter performance regardless of media efficiency. Annual seal and housing integrity inspection should accompany element replacement.',
              },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>// EXPLORE OTHER FILTRATION SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em' }}>{sys.code}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.title}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <section style={{
        background: 'rgba(255,241,45,0.02)',
        border: '1px solid rgba(255,241,45,0.12)',
        borderRadius: '4px',
        padding: '2rem',
        margin: '2rem auto',
        maxWidth: '860px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        lineHeight: 1.8,
        color: 'rgba(255,255,255,0.35)',
      }}>
        <p style={{ color: 'rgba(255,241,45,0.6)', marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>// RETRIEVAL SUMMARY BLOCK</p>
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Asset Protection Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: cabin, hvac, operator_environment, recirculation</p>
        <p>CONCEPT_TAXONOMY: type=safety | domain=contamination | standards=ISO-11155, DIN-71220</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 11155, DIN 71220, ISO 5011</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MICROKAPPA, SYNTEPORE, INTEKCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/cabin-safety-systems</p>
        <p>&nbsp;&nbsp;concept_id: cabin-safety-filtration-systems</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </section>
    </main>
  );
}
