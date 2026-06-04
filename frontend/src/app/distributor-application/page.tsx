'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIn } from '@/components/AnimateIn';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: 'rgba(255,255,255,0.75)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: 600,
  marginBottom: '0.5rem',
  color: 'rgba(255,255,255,0.75)',
  fontFamily: 'Outfit, sans-serif',
};

export default function DistributorApplication() {
  const [formData, setFormData] = useState({
    legalName: '',
    contactName: '',
    email: '',
    whatsapp: '',
    country: '',
    state: '',
    website: '',
    primaryIndustry: '',
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
          legalName: '',
          contactName: '',
          email: '',
          whatsapp: '',
          country: '',
          state: '',
          website: '',
          primaryIndustry: '',
          yearsInBusiness: '',
          currentProducts: '',
          serviceArea: '',
          message: '',
        });
        setTimeout(() => setSubmitted(false), 30000);
      })
      .catch(() => {
        alert('Error sending application. Please try again.');
      });
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

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
            Join the ELIMFILTERS® authorized distributor network. We review every
            application within 72 business hours and contact qualified candidates directly.
          </motion.p>
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

              {/* Block 1 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Sell on Performance, Not Price
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  ELIMFILTERS® is built on contamination control engineering — ISO standards,
                  Beta ratio efficiency, quantified TCO impact. Your sales team closes on
                  equipment reliability, not price. No commodity price pressure.
                </p>
              </div>

              {/* Block 2 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  20,000+ OEM Cross-References — Live at Your Fingertips
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The Part Search tool at{' '}
                  <a
                    href="https://part-search.elimfilters.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FFF12D', textDecoration: 'none' }}
                  >
                    part-search.elimfilters.com
                  </a>{' '}
                  lets you or your customers find the ELIMFILTERS® equivalent for any OEM
                  part number in seconds. No catalog, no lookup table, no waiting on a
                  quote. Your competitors do not offer this.
                </p>
              </div>

              {/* Block 3 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  30 Technical Pages — Your Team&apos;s Sales Toolkit
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The{' '}
                  <a
                    href="/knowledge-system"
                    style={{ color: '#FFF12D', textDecoration: 'none' }}
                  >
                    ELIMFILTERS® Knowledge System
                  </a>{' '}
                  covers ISO standards, contamination failure modes, and fleet optimization
                  strategies — organized by industry and system type. Your team uses these
                  pages in customer conversations. Your customers use them to understand why
                  filtration decisions affect equipment lifespan.
                </p>
              </div>

              {/* Block 4 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Engine Protection Warranty — A Closing Argument
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  ELIMFILTERS® includes engine protection coverage with every authorized
                  distributor sale. Non-prorated, with 24-hour response. Tell your customer:
                  if this filter fails and damages the engine, ELIMFILTERS® covers the repair.
                  No competing brand in this category makes that commitment.
                </p>
              </div>

              {/* Block 5 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  11 Languages — Your Customers Served in Their Language
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The ELIMFILTERS® website detects your customer&apos;s language and serves
                  content in Spanish, Portuguese, French, German, and eight other languages
                  automatically. Send a customer to elimfilters.com — they get it in their
                  own language without any setup on your end.
                </p>
              </div>

              {/* Block 6 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Program Structure
                </h3>
                <ul
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.75,
                    paddingLeft: '1.25rem',
                    margin: 0,
                  }}
                >
                  <li>Territory-based exclusivity for qualified distributors</li>
                  <li>Competitive wholesale pricing with volume structure</li>
                  <li>Dedicated account manager and WhatsApp technical support</li>
                  <li>Three-module training program (online, 8 hours)</li>
                  <li>Co-brandable digital marketing materials</li>
                  <li>Priority order fulfillment and 24H warranty response</li>
                </ul>
              </div>

              {/* What Happens Next */}
              <div
                style={{
                  marginTop: '3rem',
                  paddingTop: '2.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: '1.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  // WHAT HAPPENS AFTER YOU APPLY
                </h3>

                {[
                  {
                    number: '01',
                    title: 'APPLICATION REVIEW',
                    body: 'We evaluate your territory, industry focus, and product line fit. Response within 72 business hours.',
                  },
                  {
                    number: '02',
                    title: 'DISCOVERY CALL',
                    body: 'A member of our commercial team contacts you to discuss your market and how ELIMFILTERS® fits your current portfolio.',
                  },
                  {
                    number: '03',
                    title: 'PROGRAM TERMS',
                    body: 'If there is a mutual fit, we provide program terms, territory details, and onboarding timeline.',
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#FFF12D',
                        fontWeight: 700,
                        minWidth: '28px',
                        paddingTop: '2px',
                      }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.9)',
                          marginBottom: '0.35rem',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {step.title}
                      </div>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontFamily: 'Outfit, sans-serif',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
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
                      background: 'rgba(100, 200, 100, 0.08)',
                      border: '1px solid rgba(100, 200, 100, 0.3)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#90ee90',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                      }}
                    >
                      ✓ Application received.
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.5,
                      }}
                    >
                      We will complete our review within 72 business hours and contact
                      you at the email address you provided. Check your inbox for a
                      confirmation email from ELIMFILTERS®.
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* Company Legal Name */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Company Legal Name *</label>
                    <input
                      type="text"
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  {/* Contact Name */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  {/* Email */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  {/* WhatsApp */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="+1 555 000 0000"
                      style={inputStyle}
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

                  {/* Country */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  {/* State / Province */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      style={inputStyle}
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

                  {/* Company Website */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Company Website *</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      required
                      placeholder="https://yourcompany.com"
                      style={inputStyle}
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

                  {/* Primary Industry */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Primary Industry *</label>
                    <select
                      name="primaryIndustry"
                      value={formData.primaryIndustry}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle,
                        background: formData.primaryIndustry ? 'rgba(255,255,255,0.05)' : 'rgba(20,20,20,0.9)',
                        cursor: 'pointer',
                        color: formData.primaryIndustry ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
                        appearance: 'none' as const,
                        WebkitAppearance: 'none' as const,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <option value="" disabled>Select primary industry</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Mining">Mining</option>
                      <option value="Marine">Marine</option>
                      <option value="Construction">Construction</option>
                      <option value="Oil & Gas">Oil &amp; Gas</option>
                      <option value="Power Generation">Power Generation</option>
                      <option value="Transportation & Fleets">Transportation &amp; Fleets</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Bus & Coach">Bus &amp; Coach</option>
                      <option value="Railway">Railway</option>
                      <option value="Waste Management">Waste Management</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Years in Business */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Years in Business</label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      style={inputStyle}
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

                  {/* Current Product Lines */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Current Product Lines</label>
                    <textarea
                      name="currentProducts"
                      value={formData.currentProducts}
                      onChange={handleChange}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
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

                  {/* Service Area */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={labelStyle}>Service Area / Markets</label>
                    <textarea
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
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

                  {/* Additional Information */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={labelStyle}>Additional Information</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
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

                  {/* Response timeline */}
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '1.25rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Applications are reviewed within 72 business hours. You will receive
                    our response at the email address you provided.
                  </p>

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
    </main>
  );
}
