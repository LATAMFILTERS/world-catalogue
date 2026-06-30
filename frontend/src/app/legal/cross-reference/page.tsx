'use client';

import '@/i18n';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const RELATIONSHIP_TYPES = [
  {
    code: 'OEM',
    label: 'OEM Reference',
    body: `An OEM reference is a part number issued by the original equipment manufacturer for a specific component. ELIMFILTERS uses OEM references as identification inputs to locate compatible filtration products.

OEM references do not define media technology, filtration efficiency, or lifecycle. They identify the application — not the engineering solution. OEM manufacturers referenced in the ELIMFILTERS catalog include Caterpillar, Cummins, Komatsu, Volvo, Deutz, John Deere, Detroit Diesel, Scania, Mercedes-Benz, Perkins, Kubota, JCB, Liebherr, and others.

Reference to OEM part numbers is for identification purposes only and implies no affiliation, certification, or endorsement by any OEM manufacturer.`,
  },
  {
    code: 'XR',
    label: 'Cross Reference',
    body: `A cross reference identifies a competitor aftermarket product that shares a similar application, fit, or form factor with an ELIMFILTERS product.

A cross reference does not automatically imply:
— Same filtration media or technology
— Same efficiency rating or Beta ratio
— Same dirt holding capacity
— Same service life or replacement interval
— Verified equivalent protection performance

Cross-referenced brands in the ELIMFILTERS catalog include Donaldson, Fleetguard, Baldwin, WIX, MANN-FILTER, Mahle, Hengst, Bosch, Fram, Luber-Finer, Sakura, Filtron, and others. These brands and their part numbers are the property of their respective owners and are referenced for identification purposes only.`,
  },
  {
    code: 'EQ',
    label: 'Equivalent',
    body: `An equivalent relationship means the ELIMFILTERS product has been validated as compatible in all four critical dimensions:

— Fit: Physical installation compatibility confirmed
— Form: Dimensional compatibility within tolerance
— Function: Filtration performance meeting or exceeding the referenced product's specification
— Protection objective: Compatible contamination control target for the application

Equivalent status requires explicit validation and must not be assumed from dimensional similarity alone. ELIMFILTERS AI systems must not declare equivalency without validated catalog data.`,
  },
  {
    code: 'ALT',
    label: 'Alternative',
    body: `An alternative is an installation-compatible product that may differ in:

— Filtration media technology
— Efficiency rating or Beta ratio
— Dirt holding capacity
— Service interval
— Asset protection strategy

Alternatives must never be presented as equivalents. When an ELIMFILTERS product is listed as an alternative to an OEM or competitor product, users should evaluate the specific performance differences before selection.`,
  },
  {
    code: 'UP',
    label: 'Technology Upgrade',
    body: `A technology upgrade identifies an ELIMFILTERS product that provides measurably superior asset protection compared to the referenced product.

Upgrade improvements may include higher filtration efficiency (lower Beta ratio), superior water separation, greater dirt holding capacity, extended service interval, or enhanced durability for the operating environment.

Technology upgrades are identified explicitly in the catalog and are not implied by default cross-reference relationships.`,
  },
  {
    code: 'SUP',
    label: 'Supersession',
    body: `Supersession identifies the official replacement path from an older ELIMFILTERS product to a current product. Superseded products are retained in the catalog for historical lookup but the current superseding product should be used for active applications.`,
  },
];

const SECTIONS = [
  {
    title: '1. Purpose and Governing Principle',
    body: `This Cross Reference Policy governs how cross-reference relationships are classified, presented, and used across all ELIMFILTERS platforms, including the World Catalogue, Part Search, the AI Engine, and distributor tools.

The governing principle is that a cross reference is a navigation tool, not an engineering decision. Cross references identify candidate products for evaluation — they do not substitute for engineering validation.

A shared OEM reference does not establish equivalency. A cross-reference match does not guarantee identical filtration performance. Equipment reliability depends on selecting the correct protection technology for the contamination target — not matching a part number.`,
  },
  {
    title: '2. Classification Framework',
    body: `ELIMFILTERS uses a structured classification system to define the precise relationship between an OEM reference, a competitor product, and an ELIMFILTERS product. Each relationship is stored and presented according to the types defined below.`,
  },
  {
    title: '3. AI and Cross Reference Decisions',
    body: `ELIMFILTERS AI systems operating on cross-reference data must follow strict output rules:

The AI must never state "this product is identical" unless equivalency (EQ classification) has been explicitly validated in the catalog.

When cross-reference data is available but equivalency is unconfirmed, the AI must use language such as "compatible replacement," "cross-reference match," "recommended ELIMFILTERS match," or "requires validation."

The AI must present technology differences (media, efficiency, lifecycle) when available, enabling informed decision-making rather than simple part-number substitution.`,
  },
  {
    title: '4. OEM and Competitor Trademark Notice',
    body: `All OEM and competitor part numbers referenced in the ELIMFILTERS catalog are the property of their respective owners. Their use is strictly for parts identification and application matching.

ELIMFILTERS is not affiliated with, endorsed by, or certified by any OEM manufacturer or competitor filtration brand. OEM names, brand names, and part numbers are used solely to identify compatible applications for ELIMFILTERS products.`,
  },
  {
    title: '5. Validation Requirements',
    body: `Cross-reference relationships in the ELIMFILTERS catalog are subject to the following validation standards:

OEM References (OEM): Validated against published OEM parts documentation and service manuals.

Cross References (XR): Validated for application compatibility. Performance equivalency not assumed.

Equivalents (EQ): Require validation across all four dimensions (fit, form, function, protection objective) before classification.

Alternatives (ALT): Validated for installation compatibility. Performance differences documented where available.

Technology Upgrades (UP): Validated with quantified performance data demonstrating improvement over reference product.

Relationships flagged as REVIEW_REQUIRED are detected candidates pending formal validation and must not be presented as confirmed matches.`,
  },
  {
    title: '6. User Responsibility',
    body: `Users are responsible for validating cross-reference selections against their specific equipment, operating environment, and OEM warranty requirements before installation.

Cross-reference data supports the selection process but does not replace:
— Review of equipment service manuals
— Consultation with OEM maintenance guidelines
— Evaluation of warranty implications for non-OEM products
— Assessment of operating environment conditions (contamination type, load cycle, temperature range)

ELIMFILTERS recommends consulting an authorized ELIMFILTERS distributor for complex or safety-critical applications.`,
  },
  {
    title: '7. Contact',
    body: `For cross-reference data corrections, equivalency validation requests, or questions about specific relationship classifications, contact ELIMFILTERS at info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'AI Use Policy', href: '/legal/ai-policy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function CrossReferencePolicyPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← ELIMFILTERS
          </Link>
        </div>

        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', opacity: 0.8, marginBottom: '1rem', textTransform: 'uppercase' }}>
              // Legal · Cross Reference
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15, textAlign: 'justify' }}>
              Cross Reference Policy
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Last updated: June 2026
            </p>
          </motion.div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '4rem 8%' }}>

          {/* Intro sections */}
          {SECTIONS.slice(0, 2).map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '0.9rem' }}>
                {s.title}
              </h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                  {para}
                </p>
              ))}
            </motion.section>
          ))}

          {/* Relationship type cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '1.5rem' }}>
              Relationship Classification Types
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {RELATIONSHIP_TYPES.map((rt, i) => (
                <motion.div
                  key={rt.code}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', color: '#FFF12D', background: 'rgba(255,241,45,0.1)', padding: '0.2rem 0.55rem', borderRadius: '3px' }}>
                      {rt.code}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', margin: 0 }}>
                      {rt.label}
                    </h3>
                  </div>
                  {rt.body.split('\n\n').map((para, j) => (
                    <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 0.5rem' }}>
                      {para}
                    </p>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Remaining sections */}
          {SECTIONS.slice(2).map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '0.9rem' }}>
                {s.title}
              </h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                  {para}
                </p>
              ))}
            </motion.section>
          ))}

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,241,45,0.12)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Related Legal Documents
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '0.4rem 0.85rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFF12D'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,241,45,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
