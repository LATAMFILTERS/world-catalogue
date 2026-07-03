'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const STANDARDS = [
  { code: 'ASTM D6210', desc: 'Specification for fully formulated glycol-based engine coolant for heavy-duty engines, including SCA/additive package requirements.' },
  { code: 'ASTM D3306', desc: 'Specification for glycol-based engine coolant for automotive and light-duty service.' },
];

const FAQS = [
  {
    q: 'What is Supplemental Coolant Additive (SCA) and why does it deplete?',
    a: 'SCA is the corrosion-inhibitor and buffering package (typically nitrites, molybdates, and other additives depending on formulation) blended into engine coolant to protect wetted metal surfaces and control pH. SCA depletes through two mechanisms: chemical consumption, as inhibitor molecules react with metal surfaces and byproducts of combustion heat transfer to form protective films, and dilution, as coolant is topped up with water or unfortified coolant over time. As SCA concentration falls below the manufacturer’s minimum threshold, protection against cavitation erosion, pitting, and electrolytic corrosion degrades even though the coolant may still look and perform normally in terms of freeze protection and heat transfer.',
  },
  {
    q: 'How does cavitation erosion damage wet cylinder liners?',
    a: 'In engines with wet-sleeve cylinder liners, the liner wall vibrates against the coolant film during each combustion cycle. This vibration creates localized low-pressure zones on the coolant-side surface, causing dissolved gases to form vapor bubbles that collapse violently against the liner wall — a process called cavitation. Repeated bubble collapse erodes the liner’s protective oxide layer and eventually perforates the metal, allowing coolant to enter the combustion chamber or crankcase. SCA additives form a protective film on the liner surface that resists this erosion; when SCA is depleted, cavitation pitting can perforate a liner between scheduled service intervals.',
  },
  {
    q: 'What happens when coolant chemistry drifts out of the protection corridor?',
    a: 'Coolant chemistry is formulated to sit within a defined pH and additive concentration range — the "protection corridor" — that balances corrosion inhibition against different metals (aluminum, cast iron, brass, solder, steel) present in the cooling circuit. Chemistry drift from SCA depletion, dilution, or mixing incompatible coolant types can push pH outside the specified range, accelerating electrolytic corrosion between dissimilar metals or causing silicate dropout that forms an abrasive gel. Both failure modes progress silently: coolant can appear visually normal while corrosion products or gel accumulate in low-flow areas of the circuit, eventually restricting heat transfer or seeding cross-contamination between coolant and oil circuits at a failed head gasket or liner seal.',
  },
  {
    q: 'How is coolant chemistry monitored between service intervals?',
    a: 'Coolant condition is assessed through test strips or laboratory analysis measuring freeze point, pH, and additive (SCA) concentration, typically at intervals defined by the engine manufacturer or as part of a fluid analysis program alongside oil sampling. Refractometer readings confirm glycol concentration for freeze protection, while SCA test strips or titration confirm remaining additive reserve. A coolant that tests correctly for freeze point but low for SCA reserve requires supplemental additive dosing or a full coolant change, even though it would appear serviceable by visual inspection alone.',
  },
];

export default function CoolingSystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      {/* Back Button */}
      <Link href="/knowledge-system/standards"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

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
            Cooling System Protection
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Coolant chemistry management, SCA depletion, and cavitation erosion prevention in engine cooling circuits
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Section: Definition (with internal links) */}
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
            System Overview
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            Cooling system protection maintains engine coolant within a defined chemistry corridor — additive concentration, pH, and freeze point — across the full service interval, specified under{' '}
            <Link href="#standards" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ASTM D6210 and ASTM D3306</Link>{' '}
            coolant formulations. Unlike particle-based contamination control in lube, fuel, or hydraulic systems, cooling system failure is primarily chemical: Supplemental Coolant Additive (SCA) depletes through consumption and dilution, and once concentration falls below the protection threshold, cavitation erosion and electrolytic corrosion attack wetted metal surfaces even though the coolant continues to transfer heat and protect against freezing normally. This is why cooling system condition cannot be judged by appearance or temperature performance alone — it requires chemistry testing.
          </p>
        </motion.div>

        {/* Section: Failure Mechanism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
            Failure Mechanism
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            SCA depletion → loss of protective film on wetted metal surfaces → cavitation erosion at wet cylinder liners (vibration-induced vapor bubble collapse against the liner wall) and pitting → liner wall thinning and eventual perforation → coolant enters the combustion chamber or crankcase, causing hydrolock risk or coolant-oil cross-contamination. In parallel, pH drift outside the formulated protection corridor accelerates electrolytic corrosion between dissimilar metals (aluminum, cast iron, brass, solder) in the circuit, and silicate-based coolants can drop out of solution to form an abrasive gel that restricts flow in radiators and heater cores. Both pathways progress without visible warning signs in the coolant’s appearance, temperature performance, or freeze protection.
          </p>
        </motion.div>

        {/* Standards */}
        <motion.div
          id="standards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            Associated Standards
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                  fontWeight: 600, color: '#FFF12D',
                }}>{std.code}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.6)', lineHeight: 1.55,
                }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            ELIMFILTERS Technologies
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            <Link href="/technologies/thermacore" style={{ color: '#FFF12D', textDecoration: 'underline' }}>THERMACORE™</Link>{' '}
            addresses cooling system protection through controlled, gradual SCA release rather than a single bulk dose at fill. Continuous replenishment maintains additive concentration within the protection corridor across the full service interval, rather than allowing SCA to decay from an initial peak toward the depletion threshold — the pattern that produces cavitation risk and pH drift toward the end of a conventional service interval.
          </p>
        </motion.div>

        {/* System Design Considerations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            System Design Considerations
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            Coolant type must match the metallurgy of the cooling circuit — mixing incompatible coolant chemistries (for example, a silicate-based formulation topped into an organic-acid-technology circuit) can precipitate additives out of solution rather than provide protection. Top-up water quality matters as well: hard water introduces scale-forming minerals that reduce heat transfer independently of SCA condition. Because chemistry drift is invisible without testing, coolant condition monitoring (test strips, refractometer, or laboratory titration) should be scheduled alongside oil sampling rather than treated as a separate, lower-priority interval.
          </p>
        </motion.div>
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
          transition={{ duration: 0.5, delay: 0.5 }}
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
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
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
                  {faq.q}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'justify', lineHeight: 1.7,
                }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Coolant Chemistry Management [PRIMARY] | Cavitation Erosion Prevention [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, cooling_circuit, wet_cylinder_liner, radiator</p>
        <p>CONCEPT_TAXONOMY: type=protection-system | domain=cooling-system-protection | standards=ASTM-D6210, ASTM-D3306</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ASTM D6210, ASTM D3306</p>
        <p>&nbsp;&nbsp;Related_Technologies: THERMACORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/cooling-systems</p>
        <p>&nbsp;&nbsp;concept_id: cooling-system-protection</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/standards/cooling-systems',
        headline: 'Cooling System Protection — Coolant Chemistry and Cavitation Erosion Prevention',
        description: 'Cooling system protection maintains SCA concentration and coolant pH within the specified protection corridor (ASTM D6210, ASTM D3306), preventing cavitation erosion at wet cylinder liners and electrolytic corrosion in the cooling circuit.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['cooling system protection', 'SCA depletion', 'cavitation erosion', 'wet cylinder liner pitting', 'ASTM D6210', 'ASTM D3306', 'coolant chemistry', 'THERMACORE'],
        about: { '@type': 'Thing', name: 'Cooling System Protection', description: 'Coolant chemistry management preventing cavitation erosion and corrosion in engine cooling circuits through Supplemental Coolant Additive control.' },
        inLanguage: 'en',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards' },
          { '@type': 'ListItem', position: 4, name: 'Cooling System Protection', item: 'https://elimfilters.com/knowledge-system/standards/cooling-systems' },
        ],
      }) }} />
    </main>
  );
}
