'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIn } from '@/components/AnimateIn';
import RetrievalBlock from '@/components/RetrievalBlock';

const TECHNOLOGIES = [
  { code: 'MACROCORE™', domain: 'Engine · Lube · Hydraulic', href: '/technologies/macrocore' },
  { code: 'MICROKAPPA™', domain: 'Sub-Micron Particle Capture', href: '/technologies/microkappa' },
  { code: 'DRYCORE™', domain: 'Air Intake · Dust Separation', href: '/technologies/drycore' },
  { code: 'INTEKCORE™', domain: 'Fuel · Water Separation', href: '/technologies/intekcore' },
  { code: 'SYNTEPORE™', domain: 'Synthetic Depth Media', href: '/technologies/syntepore' },
  { code: 'HYDROCORE™', domain: 'Hydraulic High-Pressure', href: '/technologies/hydrocore' },
  { code: 'SYNTRAX™', domain: 'Active Synthetic Media', href: '/technologies/syntrax' },
  { code: 'NANOFORCE™', domain: 'Sub-1µm Particle Removal', href: '/technologies/nanoforce' },
  { code: 'THERMACORE™', domain: 'Thermal Management', href: '/technologies/thermacore' },
];

const PARTNER_CRITERIA = [
  {
    code: '01',
    title: 'Industrial Sector Access',
    body: 'Active relationships with operators in mining, agriculture, marine, construction, oil & gas, power generation, or heavy transport. You serve equipment operators, not retail end-consumers.',
  },
  {
    code: '02',
    title: 'Technical Capability',
    body: 'Ability to deliver system-level consultation — OEM cross-reference validation, ISO specification matching, application engineering. Filter distribution experience is an asset but not a requirement.',
  },
  {
    code: '03',
    title: 'Regional Coverage',
    body: 'Defined service territory with distribution infrastructure. ELIMFILTERS® prioritizes coverage gaps in LATAM, Southeast Asia, Middle East, and Sub-Saharan Africa where industrial asset density is highest.',
  },
  {
    code: '04',
    title: 'Asset Protection Alignment',
    body: 'Willingness to position ELIMFILTERS® as a contamination control system — not a filter SKU. Partners who sell on specification and system value, not on price and brand recognition.',
  },
];

const PARTNER_VALUE = [
  {
    title: 'Proprietary Technology Portfolio',
    body: '10 proprietary technologies covering all critical filtration domains: air, fuel, hydraulic, lube oil, cabin, and compressed air. No commodity product dependence.',
  },
  {
    title: 'Knowledge System Access',
    body: 'Full access to the ELIMFILTERS® Knowledge System — ISO standards library, contamination case studies, fleet optimization frameworks — tools to sell by engineering value, not price.',
  },
  {
    title: 'Technical Support Infrastructure',
    body: 'Dedicated engineering support for OEM cross-reference validation, application specification, and fleet filtration system design. You have backing on every technical question.',
  },
  {
    title: 'Warranty Coverage',
    body: 'Non-prorated warranty with immediate replacement guarantee. Full asset protection warranty language supports distributor credibility with industrial clients.',
  },
  {
    title: 'LATAM Operations Proximity',
    body: 'Operations center in Barquisimeto, Venezuela provides regional support for LATAM distributors. Regional knowledge, Spanish-language support, proximity to key mining and agricultural markets.',
  },
  {
    title: 'Category Leadership Positioning',
    body: 'Represent a platform that defines a new category: industrial asset protection vs commodity filtration. Distributors who understand this distinction gain a defensible competitive position.',
  },
];

const schemaService = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ELIMFILTERS® Authorized Distributor Program',
  provider: {
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
  },
  description:
    'Authorized distributor partnership program for industrial asset protection. ELIMFILTERS® provides proprietary contamination control technologies across 12 industrial sectors.',
  areaServed: 'Worldwide',
  serviceType: 'Industrial Distributor Partnership',
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Distributor Application',
      item: 'https://elimfilters.com/distributor-application/',
    },
  ],
};

export default function DistributorApplication() {
  const [formData, setFormData] = useState({
    companyName: '',
    legalName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    employees: '',
    yearsInBusiness: '',
    currentProducts: '',
    serviceArea: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    fetch('https://formspree.io/f/mbjekqwb', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        setSubmitted(true);
        setFormData({
          companyName: '',
          legalName: '',
          contactName: '',
          email: '',
          phone: '',
          country: '',
          state: '',
          employees: '',
          yearsInBusiness: '',
          currentProducts: '',
          serviceArea: '',
          message: '',
        });
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(() => {
        alert('Error sending application. Please try again.');
      });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.08em',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.4)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px',
          padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: '#FFF12D',
          textDecoration: 'none',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        ← HOME
      </Link>

      {/* Hero */}
      <section
        style={{
          marginTop: 0,
          paddingTop: 'clamp(5rem, 12vh, 8rem)',
          paddingBottom: 'clamp(3rem, 6vh, 5rem)',
          background: 'linear-gradient(160deg, rgba(255,241,45,0.04) 0%, #000 60%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1.25rem,5vw,2rem)' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              color: '#FFF12D',
              marginBottom: '1.25rem',
            }}
          >
            // AUTHORIZED DISTRIBUTION PROGRAM
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Distribute an Asset Protection Platform.<br />
            <span style={{ color: '#FFF12D' }}>Not a Filter Brand.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '680px',
            }}
          >
            ELIMFILTERS® authorized distributors represent a contamination control system — 10
            proprietary technologies, 12 industrial sectors, and a knowledge infrastructure that
            enables technical selling. Industrial clients protect equipment assets. Distributors
            deliver the system that makes that possible.
          </motion.p>
        </div>
      </section>

      {/* 01 / WHY THIS IS DIFFERENT */}
      <section style={{ padding: 'clamp(3rem,7vh,5rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <AnimateIn>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}
            >
              01 / WHY THIS IS DIFFERENT
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: '#fff',
                marginBottom: '1.5rem',
                lineHeight: 1.25,
              }}
            >
              Most filter distributors sell SKUs. ELIMFILTERS® distributors sell outcomes.
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem',
              }}
            >
              <div
                style={{
                  padding: '1.75rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px',
                  background: '#050505',
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '0.75rem',
                  }}
                >
                  COMMODITY DISTRIBUTION
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Catalog selling. Compete on price and availability. OEM cross-reference matching as
                  the primary value. Filter brands are interchangeable. Margin pressure from
                  e-commerce. No defensible technical position.
                </p>
              </div>
              <div
                style={{
                  padding: '1.75rem',
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '4px',
                  background: 'rgba(255,241,45,0.02)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    color: '#FFF12D',
                    marginBottom: '0.75rem',
                  }}
                >
                  ASSET PROTECTION DISTRIBUTION
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  System-level consultation. Sell on contamination control outcomes — bearing life
                  extension, downtime reduction, total cost of ownership. ELIMFILTERS® technologies
                  are specified, not substituted. Technical value creates client retention.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* 02 / IDEAL PARTNER PROFILE */}
      <section
        style={{
          padding: 'clamp(3rem,7vh,5rem) clamp(1.25rem,5vw,2rem)',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <AnimateIn>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}
            >
              02 / IDEAL PARTNER PROFILE
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: '#fff',
                marginBottom: '2rem',
                lineHeight: 1.25,
              }}
            >
              Who We're Looking For
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {PARTNER_CRITERIA.map(({ code, title, body }) => (
                <div
                  key={code}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5rem 1fr',
                    gap: '1.25rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    background: '#000',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      color: '#FFF12D',
                      letterSpacing: '0.1em',
                      paddingTop: '0.2rem',
                    }}
                  >
                    {code}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'Outfit, sans-serif',
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'Outfit, sans-serif',
                        margin: 0,
                      }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* 03 / WHAT YOU REPRESENT */}
      <section
        style={{
          padding: 'clamp(3rem,7vh,5rem) clamp(1.25rem,5vw,2rem)',
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateIn>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}
            >
              03 / WHAT YOU REPRESENT
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: '#fff',
                marginBottom: '0.75rem',
                lineHeight: 1.25,
              }}
            >
              The Technology Portfolio
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '2rem',
                maxWidth: '600px',
              }}
            >
              10 proprietary technologies covering every critical contamination domain across 12
              industrial sectors.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {TECHNOLOGIES.map(({ code, domain, href }) => (
                <Link
                  key={code}
                  href={href}
                  style={{
                    display: 'block',
                    padding: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    background: '#050505',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')
                  }
                >
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {code}
                  </p>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'Outfit, sans-serif',
                      margin: 0,
                    }}
                  >
                    {domain}
                  </p>
                </Link>
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link
                href="/technologies"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  color: '#FFF12D',
                  textDecoration: 'none',
                }}
              >
                EXPLORE ALL TECHNOLOGIES →
              </Link>
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* 04 / PARTNER VALUE */}
      <section
        style={{
          padding: 'clamp(3rem,7vh,5rem) clamp(1.25rem,5vw,2rem)',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateIn>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}
            >
              04 / PARTNER VALUE
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: '#fff',
                marginBottom: '2rem',
                lineHeight: 1.25,
              }}
            >
              What the Partnership Provides
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {PARTNER_VALUE.map(({ title, body }) => (
                <div
                  key={title}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    background: '#000',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      fontFamily: 'Outfit, sans-serif',
                      color: '#FFF12D',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'Outfit, sans-serif',
                      margin: 0,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* 05 / APPLICATION */}
      <section
        style={{
          padding: 'clamp(3rem,7vh,5rem) clamp(1.25rem,5vw,2rem)',
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'start',
            }}
          >
            {/* Left: context */}
            <AnimateIn direction="left">
              <div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    marginBottom: '0.75rem',
                  }}
                >
                  05 / APPLICATION
                </p>
                <h2
                  style={{
                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#fff',
                    marginBottom: '1.25rem',
                    lineHeight: 1.25,
                  }}
                >
                  Apply for Authorized Distributor Status
                </h2>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Outfit, sans-serif',
                    marginBottom: '2rem',
                  }}
                >
                  The ELIMFILTERS® commercial team reviews each application for regional coverage
                  fit, industrial sector alignment, and technical capability. Applications that do
                  not clearly define a service territory or industrial focus are typically not
                  approved.
                </p>
                <p
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Outfit, sans-serif',
                    marginBottom: '2rem',
                  }}
                >
                  Response within 5 business days. Include specific details about your service
                  territory, current industrial clients, and which sectors you serve.
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.15em',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    RELATED
                  </p>
                  <Link
                    href="/industries"
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    → Industries We Serve
                  </Link>
                  <Link
                    href="/technologies"
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    → Proprietary Technologies
                  </Link>
                  <Link
                    href="/knowledge-system"
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    → Knowledge System
                  </Link>
                  <Link
                    href="/contact"
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    → Technical Contact
                  </Link>
                </div>
              </div>
            </AnimateIn>

            {/* Right: form */}
            <AnimateIn direction="right">
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255,241,45,0.03) 0%, rgba(0,0,0,0.2) 100%)',
                  border: '1px solid rgba(255,241,45,0.12)',
                  borderRadius: '8px',
                  padding: '2.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '2rem',
                  }}
                >
                  DISTRIBUTOR APPLICATION FORM
                </h3>

                {submitted && (
                  <div
                    style={{
                      background: 'rgba(100,200,100,0.12)',
                      border: '1px solid rgba(100,200,100,0.35)',
                      borderRadius: '4px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                      color: '#90ee90',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Application submitted. Our commercial team will review and respond within 5
                    business days.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>COMPANY LEGAL NAME *</label>
                    <input
                      type="text"
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>CONTACT NAME *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>EMAIL *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>PHONE *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <label style={labelStyle}>COUNTRY *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>STATE / PROVINCE</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>YEARS IN BUSINESS</label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>CURRENT PRODUCT LINES</label>
                    <textarea
                      name="currentProducts"
                      value={formData.currentProducts}
                      onChange={handleChange}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>SERVICE TERRITORY / INDUSTRIES SERVED *</label>
                    <textarea
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Describe your geographic territory and the industrial sectors you currently serve (mining, agriculture, marine, etc.)"
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={labelStyle}>ADDITIONAL INFORMATION</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(255,241,45,0.35)' }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: '#FFF12D',
                      color: '#000',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      letterSpacing: '0.12em',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    SUBMIT APPLICATION
                  </motion.button>
                </form>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* RetrievalBlock */}
      <div style={{ padding: '0 clamp(1.25rem,5vw,2rem) 4rem' }}>
        <RetrievalBlock>
          <p>
            <strong>CONCEPT:</strong> ELIMFILTERS® Authorized Distributor Program
          </p>
          <p>
            <strong>DEFINITION:</strong> Authorized distributors represent the ELIMFILTERS® asset
            protection platform — 10 proprietary contamination control technologies across 12
            industrial sectors. Program requires industrial sector access, technical consultation
            capability, defined service territory, and commitment to system-level positioning over
            commodity filter distribution.
          </p>
          <p>
            <strong>PARTNER CRITERIA:</strong> Industrial sector access (mining, agriculture,
            marine, construction, oil &amp; gas) | Technical consultation capability | Regional
            coverage in defined territory | Asset protection positioning alignment
          </p>
          <p>
            <strong>TECHNOLOGY PORTFOLIO:</strong> MACROCORE™ · MICROKAPPA™ · DRYCORE™ ·
            INTEKCORE™ · SYNTEPORE™ · HYDROCORE™ · SYNTRAX™ · NANOFORCE™ · THERMACORE™
          </p>
          <p>
            <strong>INDUSTRIAL_ROLE:</strong> Authorized distributors deliver contamination control
            systems to industrial operators — the last link between ELIMFILTERS® asset protection
            engineering and equipment reliability outcomes in the field.
          </p>
          <p>
            <strong>CITATION_REFERENCE:</strong> source: elimfilters.com/distributor-application |
            concept: Authorized Distributor Program | version: 2.0 | last_updated: 2026-06-11
          </p>
        </RetrievalBlock>
      </div>
    </main>
  );
}
