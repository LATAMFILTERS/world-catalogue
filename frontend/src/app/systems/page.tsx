'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const PROTECTION_SYSTEMS = [
  {
    number: '01',
    id: 'air-intake',
    name: 'Air Intake Protection',
    tagline: 'COMBUSTION SYSTEM INTEGRITY',
    description: 'Air intake contamination is the primary cause of piston ring, cylinder liner, and turbocharger compressor blade wear in diesel and gas turbine engines. Silica dust at construction and mining sites reaches 3,000–10,000 mg/m³ — concentrations that overwhelm standard OEM elements in 50–100 operating hours. Agricultural harvest environments generate 1,500 mg/m³ or more of organic and mineral dust. Air intake protection systems must maintain ISO 5011-compliant restriction levels and particulate efficiency throughout extended field service intervals without bypass.',
    failureMode: 'Particulate ingestion above 5 µm → abrasive wear of piston ring and cylinder liner → increased blow-by → accelerated oil consumption and reduced compression.',
    productFamilies: [
      { name: 'Air Filter', slug: 'airfilter', tech: 'MACROCORE™ / SYNTEPORE™' },
      { name: 'Filter Housing', slug: 'housing', tech: 'Integrated radial seal geometry' },
    ],
    technologies: ['MACROCORE™', 'SYNTEPORE™'],
    equipment: ['Diesel engines', 'Gas turbines', 'Turbochargers', 'Industrial compressors', 'Generator sets'],
    industries: ['Agriculture', 'Construction', 'Mining', 'Oil & Gas', 'Railway', 'Power Generation'],
  },
  {
    number: '02',
    id: 'fuel-cleanliness',
    name: 'Fuel Cleanliness Protection',
    tagline: 'INJECTION SYSTEM INTEGRITY',
    description: 'Modern high-pressure common-rail (HPCR) injection systems operate at 1,800–2,500 bar with injector needle clearances of 1–3 µm. At these tolerances, particulate contamination above 10 µm causes injector tip erosion and free water above 200 ppm causes hydrogen embrittlement and corrosion of needle components. Marine and offshore fuel systems face accelerated water accumulation through tank condensation and bunkered fuel quality variation. Power generation standby fuel degrades biologically and oxidatively over 6–12 month storage cycles. Fuel cleanliness protection removes free water, emulsified water, and particulate contamination before fuel reaches high-pressure injection components.',
    failureMode: 'Water contamination above 200 ppm → injector corrosion and microbial growth → fuel line blockage and injector stiction → combustion instability and injection failure.',
    productFamilies: [
      { name: 'Fuel Filter', slug: 'fuel', tech: 'Precision particulate capture' },
      { name: 'Turbine Fuel Separator', slug: 'aquaguard-series', tech: 'AQUAGUARD™ 3-stage water separation' },
      { name: 'Fuel/Water Separator', slug: 'water', tech: 'Coalescing water removal' },
      { name: 'Marine Fuel Filter', slug: 'marine', tech: 'MARINECLEAN™ salt-resistant alloy' },
    ],
    technologies: ['AQUAGUARD™', 'MARINECLEAN™'],
    equipment: ['HPCR diesel engines', 'Common-rail marine engines', 'Gas turbines on liquid fuel', 'Standby generators', 'Offshore fuel systems'],
    industries: ['Marine', 'Oil & Gas', 'Power Generation', 'Trucks & Fleets', 'Waste & Municipal'],
  },
  {
    number: '03',
    id: 'lubrication-reliability',
    name: 'Lubrication Reliability Protection',
    tagline: 'BEARING AND DRIVETRAIN INTEGRITY',
    description: 'Engine oil cleanliness determines bearing, cam lobe, and valve train service life across all diesel and gas engine applications. ISO 4406 cleanliness codes define the contamination targets that govern component wear rates — maintaining ISO 16/14/11 or cleaner extends bearing service life three to five times compared to uncontrolled contamination at ISO 19/17/14. Urban transit buses and refuse vehicles complete 300–600 engine starts per week, accumulating soot in lube oil at three to five times the rate of steady-state operation. Long-haul commercial trucks require lubrication protection calibrated for extended oil drain intervals of 60,000–100,000 km under ISO 4406 monitoring programs. Lubrication reliability protection captures soot, metal wear particles, and oxidative byproducts throughout the full service interval.',
    failureMode: 'Soot accumulation above 2% by weight → degraded oil film strength → abrasive wear of bearing journals and cam lobes → accelerated clearance growth → bearing seizure.',
    productFamilies: [
      { name: 'Oil Filter', slug: 'oil', tech: 'SYNTRAX™ / DURATECH™ synthetic media' },
      { name: 'Filter Kits', slug: 'kits', tech: 'Coordinated multi-circuit service sets' },
    ],
    technologies: ['SYNTRAX™', 'DURATECH™'],
    equipment: ['Diesel engines (automotive, commercial, industrial)', 'Gas engines', 'Gearboxes', 'Pump bearings', 'Compressor crankcases'],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Automotive', 'Manufacturing', 'Railway'],
  },
  {
    number: '04',
    id: 'hydraulic-protection',
    name: 'Hydraulic System Protection',
    tagline: 'PROPORTIONAL VALVE AND ACTUATOR INTEGRITY',
    description: 'Hydraulic systems in heavy equipment, manufacturing machinery, and marine deck systems operate at 200–450 bar with proportional valve spool clearances of 5–25 µm. ISO 4406 cleanliness targets of 16/14/11 or tighter are required to prevent spool stiction, actuator drift, and pump wear. Silica particles entering hydraulic circuits from construction and mining environments have a Mohs hardness of 7 — harder than most valve alloy surfaces — causing abrasive wear that permanently degrades valve response accuracy. Hydraulic contamination is the leading cause of unplanned maintenance in construction equipment fleets, accounting for 40–60% of hydraulic repair costs. Sub-micron hydraulic protection removes particles at 1–10 µm that bypass standard return-line filtration.',
    failureMode: 'Particle contamination above ISO 4406 16/14/11 → proportional valve spool wear → internal leakage and position drift → actuator response degradation and system pressure loss.',
    productFamilies: [
      { name: 'Hydraulic Filter', slug: 'hydraulic', tech: 'NANOFORCE™ sub-micron Beta-rated media' },
    ],
    technologies: ['NANOFORCE™'],
    equipment: ['Excavators', 'Wheel loaders', 'Industrial presses', 'Injection molding machines', 'Marine deck machinery', 'Agricultural implements'],
    industries: ['Construction', 'Mining', 'Manufacturing', 'Agriculture', 'Marine'],
  },
  {
    number: '05',
    id: 'cabin-cooling-compressed-air',
    name: 'Cabin, Cooling & Compressed Air Protection',
    tagline: 'OCCUPANT HEALTH AND AUXILIARY SYSTEM INTEGRITY',
    description: 'Cabin environments in commercial vehicles, construction equipment, and transit applications expose operators to PM2.5 concentrations of 30–80 µg/m³ — levels that exceed WHO 24-hour exposure guidelines in sustained occupational use. Driver and operator health compliance under EU Directive 2019/130 and OSHA standards requires active cabin air quality management in heavy vehicle and construction equipment cabs. Compressed air systems in pneumatic braking, suspension actuation, and process control require ISO 8573-1 air purity — moisture contamination above dew point causes valve icing, seat corrosion, and actuator seal failure. Engine cooling systems require contamination control to prevent silicate depletion and corrosion scaling that reduce radiator thermal efficiency over time.',
    failureMode: 'Cabin: PM2.5 above WHO limits → sustained occupational exposure → health compliance exposure. Pneumatic: moisture above dew point → valve icing at -20°C → brake actuation failure.',
    productFamilies: [
      { name: 'Cabin Air Filter', slug: 'cabin', tech: 'MICROKAPPA™ HEPA + activated carbon' },
      { name: 'Air Dryer', slug: 'dryer', tech: 'DRYCORE™ molecular sieve desiccant' },
      { name: 'Coolant Filter', slug: 'coolant', tech: 'COOLTECH™ DCA replenishment media' },
    ],
    technologies: ['MICROKAPPA™', 'DRYCORE™', 'COOLTECH™'],
    equipment: ['Commercial truck cabs', 'Transit bus cabins', 'Construction equipment cabs', 'Pneumatic brake systems', 'Engine cooling circuits'],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Waste & Municipal', 'Construction', 'Railway'],
  },
];

export default function SystemsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the five industrial asset protection systems from ELIMFILTERS®?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELIMFILTERS® structures industrial contamination control into five protection systems: Air Intake Protection (combustion system integrity), Fuel Cleanliness Protection (injection system integrity), Lubrication Reliability Protection (bearing and drivetrain integrity), Hydraulic System Protection (proportional valve and actuator integrity), and Cabin, Cooling & Compressed Air Protection (occupant health and auxiliary system integrity). Each system addresses a specific contamination pathway that causes measurable equipment degradation and failure.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does AQUAGUARD™ turbine fuel separation protect HPCR diesel injection systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AQUAGUARD™ uses a three-stage turbine-coalescing-precision architecture to remove free water to below ASTM D6304 thresholds and emulsified water by 95%, protecting common-rail injection systems operating at 1,800–2,500 bar injection pressure. At these pressures, free water above 200 ppm causes hydrogen embrittlement of injector needle components and accelerates corrosion of high-pressure pump internals. AQUAGUARD™ prevents the water-driven failure modes that cause injector replacement events in long-haul trucks, marine diesel engines, standby generators, and offshore equipment.',
        },
      },
      {
        '@type': 'Question',
        name: 'What ISO 4406 cleanliness target does NANOFORCE™ hydraulic protection maintain?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NANOFORCE™ sub-micron hydraulic filtration is designed to maintain ISO 4406 cleanliness codes of 16/14/11 or tighter, which is the target cleanliness level required to prevent proportional valve spool stiction and pump wear in construction, manufacturing, and mining hydraulic systems. At contamination levels above ISO 19/17/14, proportional valve failure rates increase by a factor of three to five. NANOFORCE™ uses Beta-rated synthetic media at 1–5 µm to capture particles that bypass standard return-line filtration.',
        },
      },
      {
        '@type': 'Question',
        name: 'What cabin air quality protection do MICROKAPPA™ systems provide in commercial vehicles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MICROKAPPA™ provides multi-stage cabin air protection combining HEPA-grade mechanical particle filtration with activated carbon adsorption media. In commercial vehicle and construction equipment applications, MICROKAPPA™ reduces cabin PM2.5 concentration by up to 85% compared to single-layer OEM cabin filters. This supports occupational health compliance for drivers and operators completing 6–11 hour daily schedules in urban environments where road-level PM2.5 concentrations range from 30–80 µg/m³.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does DRYCORE™ compressed air drying prevent pneumatic brake system failure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DRYCORE™ uses molecular sieve desiccant technology to achieve dew point targets below -40°C at system pressure, meeting ISO 8573-1 Class 1–2 requirements for railway, transit bus, and industrial pneumatic systems. Moisture above the dew point in pneumatic brake lines causes ice formation at ambient temperatures below 0°C, valve seat corrosion at normal operating temperatures, and actuator seal degradation across thermal cycling. Brake actuation failure from pneumatic moisture contamination is a safety-critical event requiring immediate vehicle withdrawal from service.',
        },
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Asset Protection Systems — ELIMFILTERS®',
    description: 'Five industrial asset protection systems engineered for contamination control in air intake, fuel cleanliness, lubrication, hydraulic, and cabin/compressed air domains across 12 heavy industry sectors.',
    url: 'https://elimfilters.com/systems',
    dateModified: '2026-05-25',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'Asset Protection Systems', item: 'https://elimfilters.com/systems' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Link
        href="/"
        style={{
          position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        ← HOME
      </Link>

      {/* Hero */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundImage: 'url(/images/system-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 100%)',
            zIndex: 1,
          }}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em',
              color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
            }}
          >
            // ASSET PROTECTION SYSTEMS
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)',
              fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem', lineHeight: 1.1,
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            Five Systems.<br />One Protection Architecture.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.75, color: 'rgba(255,255,255,0.72)',
              fontFamily: 'Outfit, sans-serif', maxWidth: '680px',
              borderLeft: '3px solid #FFF12D', paddingLeft: '1.25rem',
            }}
          >
            Industrial equipment fails when contamination accumulates faster than protection systems remove it.
            ELIMFILTERS® organizes contamination control into five protection domains — each targeting a specific
            failure pathway across air intake, fuel delivery, lubrication, hydraulic, and cabin/auxiliary systems.
          </motion.p>
        </div>
      </section>

      {/* Architecture intro */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
                color: '#FFF12D', letterSpacing: '0.2em', marginBottom: '1rem',
              }}
            >
              PROTECTION ARCHITECTURE
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1.5rem', color: '#fff',
              }}
            >
              From contamination source to component protection
            </h2>
            <p
              style={{
                fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Outfit, sans-serif', maxWidth: '800px', marginBottom: '2rem',
              }}
            >
              Equipment reliability is not determined by which filter brand is installed — it is determined by
              whether the contamination entering each system stays below the threshold that causes measurable wear.
              Each of the five protection systems below is defined by its contamination target, the failure mode
              it prevents, and the product families and technologies that control it.
            </p>

            {/* Architecture flow */}
            <div
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
              }}
            >
              {['Contamination Source', '→', 'Entry Pathway', '→', 'Protection System', '→', 'Technology', '→', 'Component Preserved'].map((step, i) => (
                <span
                  key={i}
                  style={{
                    color: step === '→' ? 'rgba(255,255,255,0.25)' : i === 4 ? '#FFF12D' : 'rgba(255,255,255,0.55)',
                    fontWeight: i === 4 ? 700 : 400,
                  }}
                >
                  {step}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Five Protection Systems */}
      <section style={{ padding: '2rem 0' }}>
        {PROTECTION_SYSTEMS.map((sys, sysIdx) => (
          <motion.div
            key={sys.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.05 }}
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              padding: '4rem 2rem',
              background: sysIdx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
            }}
          >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              {/* System header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)',
                  gap: '3rem',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                      color: 'rgba(255,241,45,0.6)', letterSpacing: '0.2em', marginBottom: '0.5rem',
                    }}
                  >
                    SYSTEM {sys.number}
                  </p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 800,
                      fontFamily: 'Space Grotesk, sans-serif', color: '#fff',
                      lineHeight: 1.2, marginBottom: '0.75rem',
                    }}
                  >
                    {sys.name}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                      color: '#FFF12D', letterSpacing: '0.15em',
                    }}
                  >
                    {sys.tagline}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)',
                      fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem',
                    }}
                  >
                    {sys.description}
                  </p>

                  {/* Failure mode */}
                  <div
                    style={{
                      background: 'rgba(255,241,45,0.04)',
                      border: '1px solid rgba(255,241,45,0.15)',
                      borderRadius: '4px', padding: '1rem 1.25rem',
                      marginBottom: '2rem',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                        color: 'rgba(255,241,45,0.6)', letterSpacing: '0.15em', marginBottom: '0.4rem',
                      }}
                    >
                      FAILURE MODE
                    </p>
                    <p
                      style={{
                        fontSize: '0.82rem', lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono, monospace',
                        margin: 0,
                      }}
                    >
                      {sys.failureMode}
                    </p>
                  </div>

                  {/* Product families */}
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginBottom: '0.75rem',
                    }}
                  >
                    PRODUCT FAMILIES
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '0.75rem', marginBottom: '2rem',
                    }}
                  >
                    {sys.productFamilies.map((pf) => (
                      <motion.div
                        key={pf.slug}
                        whileHover={{ borderColor: 'rgba(255,241,45,0.4)' }}
                        style={{
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '3px', padding: '0.9rem 1rem',
                          transition: 'border-color 0.25s',
                        }}
                      >
                        <Link
                          href={`/products/${pf.slug}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <p
                            style={{
                              fontSize: '0.85rem', fontWeight: 700,
                              fontFamily: 'Space Grotesk, sans-serif',
                              color: '#fff', margin: '0 0 0.35rem',
                            }}
                          >
                            {pf.name}
                          </p>
                          <p
                            style={{
                              fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace',
                              color: 'rgba(255,241,45,0.65)', margin: 0,
                            }}
                          >
                            {pf.tech}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Technologies + Equipment + Industries row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: '0.5rem',
                        }}
                      >
                        TECHNOLOGIES
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {sys.technologies.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                              color: '#FFF12D', background: 'rgba(255,241,45,0.08)',
                              border: '1px solid rgba(255,241,45,0.2)',
                              borderRadius: '2px', padding: '0.2rem 0.5rem',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p
                        style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: '0.5rem',
                        }}
                      >
                        EQUIPMENT PROTECTED
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {sys.equipment.map((eq) => (
                          <li
                            key={eq}
                            style={{
                              fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif',
                              color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                            }}
                          >
                            {eq}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p
                        style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: '0.5rem',
                        }}
                      >
                        INDUSTRIES
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {sys.industries.map((ind) => (
                          <li
                            key={ind}
                            style={{
                              fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif',
                              color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                            }}
                          >
                            {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Technology mapping summary */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'rgba(255,241,45,0.025)',
          borderTop: '1px solid rgba(255,241,45,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                color: '#FFF12D', letterSpacing: '0.2em', marginBottom: '1rem',
              }}
            >
              TECHNOLOGY ECOSYSTEM
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif', marginBottom: '2rem', color: '#fff',
              }}
            >
              Each technology controls one contamination pathway
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {[
                { tech: 'MACROCORE™', role: 'Air Intake', desc: 'High-capacity cellulose-synthetic composite media. ISO 5011-compliant silica retention for extreme-dust environments.' },
                { tech: 'SYNTEPORE™', role: 'Air Intake', desc: 'Synthetic all-media element for high-humidity and agricultural applications. Maintains restriction below OEM threshold.' },
                { tech: 'AQUAGUARD™', role: 'Fuel Cleanliness', desc: '3-stage turbine fuel separation. 99.8% free water removal. Protects HPCR injection at 1,800–2,500 bar.' },
                { tech: 'MARINECLEAN™', role: 'Fuel Cleanliness', desc: 'Salt-resistant alloy marine fuel filter. 99.9% water and sediment removal. IMO-compliant construction.' },
                { tech: 'SYNTRAX™', role: 'Lubrication', desc: 'Synthetic lube oil protection media. Maintains ISO 4406 cleanliness codes through extended drain intervals.' },
                { tech: 'DURATECH™', role: 'Lubrication', desc: 'Extended-lifecycle synthetic media. Engineered for high-soot, high-temperature diesel engine lube applications.' },
                { tech: 'NANOFORCE™', role: 'Hydraulic', desc: 'Sub-micron Beta-rated hydraulic media. Maintains ISO 4406 16/14/11 for proportional valve protection.' },
                { tech: 'MICROKAPPA™', role: 'Cabin Air', desc: 'HEPA-grade particle + activated carbon adsorption. Reduces cabin PM2.5 by up to 85% vs. standard OEM cabin filters.' },
                { tech: 'DRYCORE™', role: 'Compressed Air', desc: 'Molecular sieve desiccant. Achieves ISO 8573-1 Class 1–2 dew point targets for safety-critical pneumatic systems.' },
                { tech: 'COOLTECH™', role: 'Cooling', desc: 'DCA-replenishing coolant media. Prevents silicate depletion and corrosion scaling in diesel engine cooling circuits.' },
              ].map((item) => (
                <div
                  key={item.tech}
                  style={{
                    background: '#000', padding: '1.5rem',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                      color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em', marginBottom: '0.3rem',
                    }}
                  >
                    {item.role}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.9rem',
                      fontWeight: 700, color: '#fff', marginBottom: '0.5rem',
                    }}
                  >
                    {item.tech}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <Link
                href="/technologies"
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
                  fontWeight: 700, letterSpacing: '0.15em', color: '#FFF12D',
                  textDecoration: 'none',
                }}
              >
                VIEW ALL TECHNOLOGIES →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif', color: '#fff',
              marginBottom: '3rem', textAlign: 'center',
            }}
          >
            Technical Questions
          </motion.h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                q: 'What are the five industrial asset protection systems from ELIMFILTERS®?',
                a: 'Air Intake Protection, Fuel Cleanliness Protection, Lubrication Reliability Protection, Hydraulic System Protection, and Cabin/Cooling/Compressed Air Protection. Each system targets a specific contamination pathway — from silica dust ingestion in air intake systems to moisture accumulation in HPCR fuel systems — that causes measurable equipment wear and failure.',
              },
              {
                q: 'How does AQUAGUARD™ protect HPCR diesel injection systems?',
                a: 'AQUAGUARD™ uses three-stage turbine-coalescing-precision separation to remove free water to below ASTM D6304 thresholds and emulsified water by 95%. At 1,800–2,500 bar injection pressure, water above 200 ppm causes hydrogen embrittlement of injector needle components and corrosion of high-pressure pump internals. AQUAGUARD™ prevents these failure modes across long-haul trucks, marine diesel engines, standby generators, and offshore equipment.',
              },
              {
                q: 'What cleanliness target does NANOFORCE™ hydraulic protection maintain?',
                a: 'NANOFORCE™ maintains ISO 4406 cleanliness codes of 16/14/11 or tighter — the threshold required to prevent proportional valve spool stiction in construction, manufacturing, and mining hydraulic systems. At contamination above ISO 19/17/14, proportional valve failure rates increase by a factor of three to five. Beta-rated synthetic media at 1–5 µm captures particles that bypass standard return-line filtration.',
              },
              {
                q: 'What does MICROKAPPA™ cabin air protection provide for commercial vehicle operators?',
                a: 'MICROKAPPA™ combines HEPA-grade mechanical filtration with activated carbon adsorption, reducing cabin PM2.5 concentration by up to 85% versus single-layer OEM cabin filters. This supports occupational health compliance for drivers completing 6–11 hour daily schedules in urban environments where road-level PM2.5 ranges from 30–80 µg/m³ — above WHO 24-hour exposure guidelines.',
              },
              {
                q: 'How does DRYCORE™ prevent pneumatic brake system failure in transit and railway applications?',
                a: 'DRYCORE™ molecular sieve desiccant achieves dew point targets below -40°C at system pressure, meeting ISO 8573-1 Class 1–2 for safety-critical pneumatic braking systems. Moisture above the dew point causes ice formation at temperatures below 0°C and valve seat corrosion at normal operating temperatures. Brake actuation failure from pneumatic moisture is a safety-critical event requiring immediate vehicle withdrawal from service.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  padding: '1.75rem 2rem',
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.12)',
                  borderRadius: '4px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem', fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: '#FFF12D', margin: '0 0 0.85rem',
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem', fontFamily: 'Outfit, sans-serif',
                    color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: 0,
                  }}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.06) 0%, rgba(0,0,0,0) 60%)',
          borderTop: '1px solid rgba(255,241,45,0.15)',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '1rem',
              }}
            >
              Identify the right protection system for your equipment
            </h2>
            <p
              style={{
                fontSize: '1rem', fontFamily: 'Outfit, sans-serif',
                color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2.5rem',
              }}
            >
              Cross-reference 500,000+ parts across all five protection systems.
              Match your equipment platform to the correct contamination control solution.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/industries"
                style={{
                  background: '#FFF12D', color: '#000',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: '0.8rem', letterSpacing: '0.12em',
                  padding: '0.85rem 2rem', borderRadius: '2px',
                  textDecoration: 'none', display: 'inline-block',
                }}
              >
                BROWSE BY INDUSTRY
              </Link>
              <Link
                href="/technologies"
                style={{
                  background: 'transparent', color: '#FFF12D',
                  border: '1px solid rgba(255,241,45,0.5)',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: '0.8rem', letterSpacing: '0.12em',
                  padding: '0.85rem 2rem', borderRadius: '2px',
                  textDecoration: 'none', display: 'inline-block',
                }}
              >
                VIEW TECHNOLOGIES
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
