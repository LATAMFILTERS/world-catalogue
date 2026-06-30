'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import { RelatedProducts } from '@/components/RelatedProducts';

export default function DieselWaterContaminationPage() {
  const sections = [
    {
      title: 'How Contamination Happens',
      content: 'Water enters diesel systems through multiple mechanisms: atmospheric moisture enters fuel tanks during thermal breathing cycles (fuel contracts during cool nights, draws in humid air), condensation forms on tank interior surfaces during temperature cycling in outdoor storage, fuel transfer equipment introduces water during delivery and handling, damaged or missing tank caps allow direct water ingress, and water migration occurs across tank seals in systems exposed to high-humidity environments or prolonged rainfall. Hygroscopic fuel additives (lubricity improvers, biocides, corrosion inhibitors) absorb atmospheric moisture, creating a continuous pathway for water uptake. In marine and cold-climate applications, water accumulation accelerates due to extended outdoor exposure and greater thermal cycling extremes.'
    },
    {
      title: 'System Damage',
      content: 'Water contamination causes multiple failures: fuel injector stiction from microfilm on needle seats, corrosion of fuel delivery components from electrolytic reactions, microbial colony growth at fuel-water interfaces, fuel gum formation from oxidative degradation, and lubricity loss that accelerates wear in pumps and injectors.'
    },
    {
      title: 'Operational Impact',
      content: '__LINKED_DIESEL_IMPACT__',
    },
    {
      title: 'Prevention Methods',
      content: 'Water contamination is controlled through: (1) Storage management - maintain fuel tanks in covered, climate-controlled facilities; install desiccant breathers on fuel tank vent lines to allow air exchange while blocking moisture ingress; (2) Regular fuel testing - perform monthly Karl Fischer titration (ASTM D6304) to measure water content; maintain target threshold of <200 ppm free water, <100 ppm total water; (3) Tank maintenance - inspect for corrosion, damaged seals, or cracks biannually; drain sediment from tank bottoms quarterly; (4) Fuel treatment - deploy water removal additives (chemical demulsifiers) to coalesce emulsified water into free water that can be separated; implement biocides (Kathon FP1.5, Fuzex) to prevent microbial growth at water interfaces; (5) Filtration - install high-capacity water-removal fuel filters (coalescent media) rated for 10-50 microns absolute, 98% efficiency at removal of free water; (6) Equipment design - specify closed fuel transfer systems to eliminate atmospheric contact; use sealed filler caps with integrated water traps; install fuel tank heaters in cold-climate applications to prevent condensation.'
    },
    {
      title: 'Related Standards',
      content: '__LINKED_DIESEL_STANDARDS__',
    },
    {
      title: 'Related Technologies',
      content: 'ELIMFILTERS fuel filtration technologies address water contamination through complementary mechanisms: MACROCORE™ progressive density gradient architecture captures water droplets in the coarse outer zone through coalescent action, channeling free water into the lowest point of the filter housing for gravity separation and removal via drain valve; NANOFORCE™ synthetic media actively rejects water molecules through polarity-differential absorption, allowing hydrocarbon fuel to pass while accumulating water in a gel matrix that can be back-flushed during maintenance; HYDROCORE™ series incorporates integrated water-removal cartridges with superabsorbent polymer cores that encapsulate free water molecules, preventing emulsification and blocking microbial access to aqueous microhabitats. When specified as primary-secondary filter pairs, these technologies reduce water content from raw fuel (500-2000 ppm) to finished fuel specification (<100 ppm) in single-pass operation.'
    }
  ];

  const faqs = [
    {
      question: 'How do I know if my fuel has water contamination?',
      answer: 'Visual indicators include hazy or cloudy appearance in clear sample bottles (emulsified water), sediment at tank bottom (free water settling), or a distinct water layer if fuel is left in a glass overnight. Operational symptoms include hard starting, injector rough idle, smoke during warm-up, and reduced fuel economy. The only accurate measurement is Karl Fischer titration (ASTM D6304), performed by a certified fuel lab. Field test kits exist (paste-based water detection) but are only qualitative; they confirm water presence but not concentration. Total water content must be measured monthly in high-exposure applications (marine, outdoor storage, extreme climates).'
    },
    {
      question: 'Can water-contaminated fuel be cleaned or treated in-tank?',
      answer: 'Partial treatment is possible: chemical demulsifiers and water-removal additives can coalescence emulsified water into free water, allowing gravity separation to a tank sump within 24-48 hours for removal via drain valve. However, this method only recovers 40-60% of emulsified water and does not address microbial contamination already established as biofilm. Complete remediation requires: (1) Tank bottom sediment removal by suction; (2) High-capacity fuel filter pass-through with water-removal cartridges; (3) Biocide treatment to kill established colonies; (4) Verification testing (Karl Fischer) every 100 hours until water content stabilizes below specification. For severely contaminated tanks (>1000 ppm), tank replacement is more cost-effective than remediation.'
    },
    {
      question: 'What is the difference between free water and emulsified water?',
      answer: 'Free water is liquid water that separates from fuel due to density difference and gravity; it collects at tank bottoms and can be visually detected and removed via drain valves. Emulsified water is suspended as microscopic droplets (1-10 microns) throughout the fuel matrix, stabilized by fuel surfactants and additives; it appears as haze or cloudiness and cannot be separated by gravity. Sedimentary water is water that has reacted with fuel additives and degradation products, forming a stable gel-like suspension. Free water is easily removed (drain method, coalescent filtration). Emulsified water requires chemical demulsifiers or high-shear coalescent filtration to convert to free water before removal. Sedimentary water is the most persistent and often requires fuel polishing (circulation through high-capacity filters) or tank replacement if concentration exceeds 500 ppm total water.'
    },
    {
      question: 'How does microbial growth affect fuel systems?',
      answer: 'Microbes thrive at water-fuel interfaces where moisture provides the growth medium. Bacterial colonies (Pseudomonas, Bacillus) produce enzymes that degrade fuel hydrocarbons into organic acids, lowering fuel pH and accelerating corrosion. Fungal hyphae (Aspergillus, Cladosporium) penetrate fuel filter media, causing rapid plugging within days. Biofilm accumulation forms a slime layer on tank interior and fuel system components, causing fuel flow restriction and injector stiction. Microbial metabolites (including hydrogen sulfide from sulfate-reducing bacteria) create foul odors and contribute to fuel instability. Biocide treatment kills planktonic (free-floating) microbes within hours but is less effective against established biofilm colonies. Prevention through storage management and desiccant breathing is more effective than treatment after microbial colonization is established.'
    },
    {
      question: 'What fuel storage conditions minimize water contamination?',
      answer: 'Optimal storage requires: (1) Climate control - maintain ambient temperature between 10-25°C to minimize thermal breathing; (2) Humidity control - maintain relative humidity below 60% to reduce atmospheric moisture availability; (3) Tank sealing - install desiccant breathers rated for 10-50 microns absolute, with silica gel indicator providing visual saturation status; (4) Cover storage - provide weather-tight structures that prevent rain contact and direct solar heating; (5) Elevated tanks - position fuel storage 0.5m+ above grade to prevent surface water pooling around tank base; (6) Drain maintenance - open sediment drain valve daily for 5-10 seconds to expel free water accumulation; (7) Routine testing - perform Karl Fischer titration monthly, increasing frequency to weekly in marine applications; (8) Rotation - practice first-in-first-out fuel inventory management, avoiding extended static storage of fuel batches older than 3-6 months.'
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
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Diesel Water Contamination
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
            Root cause analysis of water ingress mechanisms and failure progression in diesel fuel systems.
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
            Water contamination in diesel fuel systems exists in three physical states: free water (gravitational separation), emulsified water (suspended in fuel), and sedimentary water (integrated into fuel matrix via hygroscopic additives). This contamination mode falls under the broader framework defined in the{' '}
            <Link href="/knowledge-system/standards/fuel-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fuel filtration systems</Link>{' '}
            domain. Water ingress occurs through fuel tank breathation, condensation from thermal cycling, fuel transfer contamination, and storage tank corrosion. Even small percentages of water (0.5-2% by volume) initiate chemical degradation chains that compromise fuel quality, accelerate microbial growth, and trigger corrosion in fuel delivery systems.
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
            {section.content === '__LINKED_DIESEL_IMPACT__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
                Water-contaminated diesel causes immediate and measurable operational degradation: Hard starting increases by 5-15 seconds during cold ambient operation; Fuel consumption increases 3-8% as water-induced combustion inefficiency requires longer burn times; Injector cleaning intervals compress from 8,000 hours to 2,000-3,000 hours of operation, with each cleaning event adding 4-8 hours of downtime; Particulate emissions increase 40-60% as incomplete combustion produces excessive soot; Unplanned maintenance events average one per 500-1000 operating hours when water content exceeds 500 ppm; Equipment availability drops 12-18% due to intermittent fuel system faults; Fuel tank replacement becomes necessary after 18-24 months of chronic water exposure, representing 15-25% of annual fuel management budget in marine and outdoor equipment fleets. For fleet-level analysis of how water contamination affects fuel economy,{' '}
                <Link href="/knowledge-system/fleet/fuel-efficiency" style={{ color: '#FFF12D', textDecoration: 'underline' }}>see the filtration and fuel efficiency guide</Link>.
              </p>
            ) : section.content === '__LINKED_DIESEL_STANDARDS__' ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
                Water contamination thresholds and testing methods are defined by: ASTM D6304 (Karl Fischer titration - quantifies free and total water in distillate fuels, maximum 200 ppm for on-road diesel, 500 ppm for marine applications); ISO 12937 (determination of water in crude oils by Karl Fischer titration);{' '}
                <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
                and ISO 16889 (particle and water contamination classification in hydraulic fluids, applicable to fuel systems with hydraulic components); ASTM D975 (diesel fuel specification, includes water limits for different service categories); ISO 14540 (marine fuel water content classification); SAE J1488 (automotive fuel system corrosion testing procedures that verify compatibility with water-contaminated fuel); IMO 2020 regulations (marine fuel sulfur and contaminant limits affecting water solubility).
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
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5, textAlign: 'justify' }}>Abrasive contamination and three-body wear</p>
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
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5, textAlign: 'justify' }}>Pressurized fluid system contamination</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Diesel Water Contamination',
        description: 'Water contamination in diesel fuel causes injector stiction, microbial growth, and fuel system corrosion. Above 500 ppm water concentration, microbial colonies establish at the fuel-water interface, and above 1,000 ppm visible biomass accumulation occurs within days.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['diesel water contamination', 'fuel water removal', 'ASTM D6304', 'ISO 12937', 'Karl Fischer titration', 'injector stiction', 'microbial growth fuel', 'HYDROCORE', 'MACROCORE', 'NANOFORCE'],
        about: { '@type': 'Thing', name: 'Diesel Water Contamination', description: 'Water ingress failure mechanism in diesel fuel systems causing injector precision degradation, corrosion, and microbial colonization through atmospheric moisture, condensation, and handling.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Contamination', item: 'https://elimfilters.com/knowledge-system/contamination' },
          { '@type': 'ListItem', position: 4, name: 'Diesel Water Contamination', item: 'https://elimfilters.com/knowledge-system/contamination/diesel-water' },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How do I know if my fuel has water contamination?', acceptedAnswer: { '@type': 'Answer', text: 'Visual indicators include hazy or cloudy appearance in clear sample bottles (emulsified water), sediment at tank bottom (free water settling), or a distinct water layer if fuel is left in a glass overnight. Operational symptoms include hard starting, injector rough idle, smoke during warm-up, and reduced fuel economy. The only accurate measurement is Karl Fischer titration (ASTM D6304), performed by a certified fuel lab. Field test kits exist (paste-based water detection) but are only qualitative; they confirm water presence but not concentration. Total water content must be measured monthly in high-exposure applications (marine, outdoor storage, extreme climates).' } },
          { '@type': 'Question', name: 'Can water-contaminated fuel be cleaned or treated in-tank?', acceptedAnswer: { '@type': 'Answer', text: 'Partial treatment is possible: chemical demulsifiers and water-removal additives can coalesce emulsified water into free water, allowing gravity separation to a tank sump within 24-48 hours for removal via drain valve. However, this method only recovers 40-60% of emulsified water and does not address microbial contamination already established as biofilm. Complete remediation requires tank bottom sediment removal, high-capacity fuel filter pass-through with water-removal cartridges, biocide treatment, and verification testing every 100 hours until water content stabilizes below specification.' } },
          { '@type': 'Question', name: 'What is the difference between free water and emulsified water?', acceptedAnswer: { '@type': 'Answer', text: 'Free water is liquid water that separates from fuel due to density difference and gravity; it collects at tank bottoms and can be visually detected and removed via drain valves. Emulsified water is suspended as microscopic droplets (1-10 microns) throughout the fuel matrix, stabilized by fuel surfactants and additives; it appears as haze or cloudiness and cannot be separated by gravity. Sedimentary water is water that has reacted with fuel additives and degradation products, forming a stable gel-like suspension. Free water is easily removed (drain method, coalescent filtration). Emulsified water requires chemical demulsifiers or high-shear coalescent filtration to convert to free water before removal.' } },
          { '@type': 'Question', name: 'How does microbial growth affect fuel systems?', acceptedAnswer: { '@type': 'Answer', text: 'Microbes thrive at water-fuel interfaces where moisture provides the growth medium. Bacterial colonies (Pseudomonas, Bacillus) produce enzymes that degrade fuel hydrocarbons into organic acids, lowering fuel pH and accelerating corrosion. Fungal hyphae (Aspergillus, Cladosporium) penetrate fuel filter media, causing rapid plugging within days. Biofilm accumulation forms a slime layer on tank interior and fuel system components, causing fuel flow restriction and injector stiction. Biocide treatment kills planktonic (free-floating) microbes within hours but is less effective against established biofilm colonies.' } },
        ],
      }) }} />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        <RelatedProducts filterType="fuel filter" duty="HEAVY_DUTY" searchQuery="fuel filter heavy duty" label="VER FILTROS DE COMBUSTIBLE RELACIONADOS" />
      </div>
    </main>
  );
}
