'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIn } from '@/components/AnimateIn';

const BASE_URL = 'https://elimfilters.com';

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Authorized Distributor Application | ELIMFILTERS®',
  url: `${BASE_URL}/distributor-application/`,
  dateModified: '2026-05-30',
  description: 'Apply to become an authorized ELIMFILTERS® distributor across North America and Latin America.',
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS®', url: BASE_URL },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Distributor Application', item: `${BASE_URL}/distributor-application/` },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I apply to become an ELIMFILTERS® distributor?',
      acceptedAnswer: { '@type': 'Answer', text: 'Complete the online application form on this page with your company details, service territory, and current product lines. Applications are reviewed within 5–10 business days. Approved applicants are contacted directly by an ELIMFILTERS® account manager to discuss onboarding, pricing, and territory terms.' },
    },
    {
      '@type': 'Question',
      name: 'What are the requirements to become an ELIMFILTERS® distributor?',
      acceptedAnswer: { '@type': 'Answer', text: 'ELIMFILTERS® seeks distributors with at least 2 years of B2B distribution experience in mining, agriculture, marine, automotive, construction, oil & gas, or related heavy-industry sectors. Candidates must have an active sales team, a defined service territory, and the ability to maintain adequate stock levels to serve their market.' },
    },
    {
      '@type': 'Question',
      name: 'What industries do ELIMFILTERS® distributors serve?',
      acceptedAnswer: { '@type': 'Answer', text: 'ELIMFILTERS® distributors serve 12 industrial sectors: Mining, Agriculture, Marine, Oil & Gas, Automotive, Construction, Power Generation, Bus & Coach, Manufacturing, Railway, Trucks & Fleets, and Municipal & Waste. Distributors typically specialise in 2–4 sectors relevant to their service territory.' },
    },
    {
      '@type': 'Question',
      name: 'What support does ELIMFILTERS® provide to authorized distributors?',
      acceptedAnswer: { '@type': 'Answer', text: 'Authorized ELIMFILTERS® distributors receive: competitive wholesale pricing, dedicated account manager, technical training programme on proprietary filtration technologies, co-branded marketing materials, priority order fulfillment, and full warranty support including non-prorated coverage with immediate replacement guarantee.' },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />


      {/* Hero Section */}
      <section
        style={{
          marginTop: '72px',
          paddingTop: '4rem',
          paddingBottom: '4rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.8) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#FFF12D',
                fontFamily: 'Outfit, sans-serif',
                display: 'inline-block',
              }}
            >
              // BECOME A PARTNER
            </motion.span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            AUTHORIZED DISTRIBUTOR APPLICATION
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
            }}
          >
            Join the ELIMFILTERS® network. We're seeking qualified distributors to expand our industrial filtration reach.
          </motion.p>
        </div>
      </section>

      {/* Who We're Looking For */}
      <section style={{ padding: '3rem 2rem', background: 'rgba(255,241,45,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#FFF12D', marginBottom: '1.5rem' }}>
              WHO WE'RE LOOKING FOR
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Industry Experience', detail: 'B2B distribution in mining, agriculture, marine, oil & gas, automotive, or construction' },
                { label: 'Established Operation', detail: 'Minimum 2 years in business with an active direct sales team' },
                { label: 'Defined Territory', detail: 'Clear service area within North America or Latin America' },
                { label: 'Stock Capacity', detail: 'Ability to maintain adequate inventory levels to serve your market' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,241,45,0.12)', borderRadius: '6px', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', color: '#FFF12D', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Section */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'start',
            }}
          >
            {/* Left: Why Partner */}
            <AnimateIn direction="left">
            <div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk, sans-serif',
                  marginBottom: '2rem',
                  color: '#FFF12D',
                }}
              >
                WHY PARTNER WITH ELIMFILTERS®?
              </h2>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.75rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  Market-Leading Technology
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  12 proprietary filtration technologies engineered for maximum performance across 12 industry verticals.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.75rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  Global Support Infrastructure
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  Headquarters in Frisco, Texas with LATAM operations center in Barquisimeto. Direct access to engineering and support teams.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.75rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  Comprehensive Warranty
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  Non-prorated coverage with immediate replacement guarantee. Full engine protection included.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.75rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  Distributor Benefits
                </h3>
                <ul
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.7,
                    paddingLeft: '1.5rem',
                  }}
                >
                  <li>Competitive wholesale pricing</li>
                  <li>Marketing and sales support</li>
                  <li>Technical training program</li>
                  <li>Dedicated account manager</li>
                  <li>Co-branded marketing materials</li>
                  <li>Priority order fulfillment</li>
                </ul>
              </div>
            </div>
            </AnimateIn>

            {/* Right: Application Form */}
            <AnimateIn direction="right">
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.3) 100%)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '2rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  APPLICATION FORM
                </h2>

                {submitted && (
                  <div
                    style={{
                      background: 'rgba(100, 200, 100, 0.2)',
                      border: '1px solid rgba(100, 200, 100, 0.4)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.95rem',
                      color: '#90ee90',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    ✓ Application submitted! Our team will review and contact you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Company Legal Name *
                    </label>
                    <input
                      type="text"
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Current Product Lines
                    </label>
                    <textarea
                      name="currentProducts"
                      value={formData.currentProducts}
                      onChange={handleChange}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Service Area / Markets
                    </label>
                    <textarea
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Additional Information
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(255,241,45,0.4)' }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: '#FFF12D',
                      color: '#000',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.1em',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    SUBMIT APPLICATION
                  </motion.button>
                </form>
              </div>
            </div>
            </AnimateIn>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section style={{ padding: '5rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
            // FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '2.5rem' }}>
            Distributor Programme FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                q: 'How do I apply to become an ELIMFILTERS® distributor?',
                a: 'Complete the application form above with your company details, service territory, and current product lines. Applications are reviewed within 5–10 business days. Approved applicants are contacted directly by an ELIMFILTERS® account manager to discuss onboarding, wholesale pricing, and territory terms.',
              },
              {
                q: 'What are the requirements to become an ELIMFILTERS® distributor?',
                a: 'ELIMFILTERS® seeks distributors with at least 2 years of B2B distribution experience in mining, agriculture, marine, automotive, construction, oil & gas, or related heavy-industry sectors. Candidates must have an active sales team, a defined service territory, and the ability to maintain adequate stock levels.',
              },
              {
                q: 'What industries do ELIMFILTERS® distributors serve?',
                a: 'ELIMFILTERS® distributors serve 12 industrial sectors: Mining, Agriculture, Marine, Oil & Gas, Automotive, Construction, Power Generation, Bus & Coach, Manufacturing, Railway, Trucks & Fleets, and Municipal & Waste. Distributors typically specialise in 2–4 sectors relevant to their service territory.',
              },
              {
                q: 'What support does ELIMFILTERS® provide to authorized distributors?',
                a: 'Authorized distributors receive: competitive wholesale pricing, a dedicated account manager, technical training on all 12 proprietary filtration technologies (validated to ISO 5011, ISO 16889, and ISO 4406), co-branded marketing materials, priority order fulfillment, and full non-prorated warranty coverage with immediate replacement guarantee.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '1.75rem 2rem' }}
              >
                <h3 style={{ fontSize: '0.975rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', lineHeight: 1.85, margin: '0' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
