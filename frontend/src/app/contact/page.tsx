'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIn } from '@/components/AnimateIn';
import RetrievalBlock from '@/components/RetrievalBlock';

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact ELIMFILTERS',
  url: 'https://elimfilters.com/contact/',
  description: 'Contact ELIMFILTERS for industrial asset protection support: asset protection strategy, contamination control engineering, OEM cross-reference validation, system specification, and distributor partnerships across 12 industrial industries.',
  dateModified: '2026-06-11',
  mainEntity: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    availableLanguage: ['English', 'Spanish'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://elimfilters.com/contact/' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What industries does ELIMFILTERS serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ELIMFILTERS serves 12 industrial sectors: Agriculture, Mining, Marine, Construction, Automotive, Oil & Gas, Power Generation, Manufacturing, Transportation & Fleets, Bus & Coach, Railway, and Waste Management. Filtration solutions cover air, fuel, hydraulic, lube oil, cabin, coolant, and compressed air systems.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I request an OEM cross-reference for ELIMFILTERS products?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Submit your OEM part number, equipment make and model, and application details via the contact form at elimfilters.com/contact or by email at info@elimfilters.com. The ELIMFILTERS technical team will identify the correct replacement and confirm specification compatibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I become an ELIMFILTERS distributor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Distributor applications are accepted via the Distributor Application form at elimfilters.com/distributor-application. Include your company profile, service territory, and current product lines. The ELIMFILTERS commercial team reviews applications for regional coverage fit and responds within 5 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What technical support does ELIMFILTERS provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ELIMFILTERS provides technical support for: OEM cross-reference validation, filter specification matching to ISO standards (ISO 16889, ISO 4406, ISO 5011), application engineering for air/fuel/hydraulic/lube systems, and fleet filtration optimization. Contact the technical team at info@elimfilters.com with equipment details and application context.',
      },
    },
  ],
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          company: formData.company || '',
          message: formData.message,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setError('Error sending message. Please try again or email us directly at info@elimfilters.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Link href="/"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>← HOME</Link>


      {/* Hero Section */}
      <section
        style={{
          marginTop: 0,
          minHeight: 'clamp(480px, 70vh, 680px)',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Background photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/contacto-papa.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
        }} />
        {/* Gradient overlay — dark only at bottom for text, transparent in middle to show people */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.15) 58%, rgba(0,0,0,0.05) 100%)',
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.5rem,4vw,2rem) clamp(1.25rem,5vw,2rem) clamp(2.5rem,5vw,4rem)', width: '100%' }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', display: 'inline-block', marginBottom: '1rem' }}
          >
            // GLOBAL OPERATIONS CENTER
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1rem', lineHeight: 1.1 }}
          >
            Engineering Consultation, Asset Protection Strategy &amp; Industrial Partnerships
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', fontFamily: 'Outfit, sans-serif', maxWidth: '640px' }}
          >
            Asset protection strategy, contamination control engineering, OEM cross-reference validation, system specification, and distributor partnerships across 12 industrial industries.
          </motion.p>
        </div>
      </section>

      {/* Contact Info & Form */}
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
            {/* Left: Contact Information */}
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
                  CONTACT INFORMATION
                </h2>

                <div style={{ marginBottom: '2.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                      marginBottom: '0.75rem',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    GLOBAL HEADQUARTERS
                  </h3>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'Outfit, sans-serif',
                      lineHeight: 1.6,
                    }}
                  >
                    KLEO TECHNOLOGIES
                    <br />
                    Frisco, Texas 75034
                    <br />
                    United States
                  </p>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                      marginBottom: '0.75rem',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    LATIN AMERICAN OPERATIONS
                  </h3>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'Outfit, sans-serif',
                      lineHeight: 1.6,
                    }}
                  >
                    LATAM Operations Center
                    <br />
                    Caracas, Distrito Capital
                    <br />
                    Venezuela
                  </p>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                      marginBottom: '0.75rem',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    EMAIL
                  </h3>
                  <a
                    href="mailto:info@elimfilters.com"
                    style={{
                      fontSize: '0.95rem',
                      color: '#FFF12D',
                      textDecoration: 'none',
                      fontFamily: 'Outfit, sans-serif',
                      transition: 'opacity 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    info@elimfilters.com
                  </a>
                </div>

              </div>
            </AnimateIn>

            {/* Right: Contact Form */}
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
                    SEND A MESSAGE
                  </h2>

                  {submitted && (
                    <div style={{ background: 'rgba(100,200,100,0.15)', border: '1px solid rgba(100,200,100,0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#90ee90', fontFamily: 'Outfit, sans-serif' }}>
                      ✓ Message sent successfully! We'll be in touch soon.
                    </div>
                  )}
                  {error && (
                    <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#ff9090', fontFamily: 'Outfit, sans-serif' }}>
                      {error}
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
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
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
                        Email Address
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
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
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
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
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
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Describe your assets, application, contamination challenge, or operational requirements..."
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
                      disabled={sending}
                      whileHover={{ scale: sending ? 1 : 1.03, boxShadow: sending ? 'none' : '0 0 32px rgba(255,241,45,0.4)' }}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: sending ? 'rgba(255,241,45,0.5)' : '#FFF12D',
                        color: '#000',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: sending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {sending ? 'SENDING...' : 'SEND MESSAGE'}
                    </motion.button>
                  </form>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* What We Handle — capability list */}
      <section style={{ padding: '4rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateIn>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '1rem' }}>
              // WHAT WE HANDLE
            </p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '2.5rem' }}>
              Technical Support Scope
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Asset Protection Strategy', body: 'System-level filtration strategy identifying contamination targets across air, fuel, hydraulic, lube, cabin, and coolant domains for specific equipment and operational environments.' },
                { title: 'OEM Cross-Reference Validation', body: 'Submit your OEM part number, equipment make, and model. Our team identifies the compatible ELIMFILTERS product and confirms specification compliance against ISO standards.' },
                { title: 'Contamination Control Engineering', body: 'Filter specification matching to ISO 16889 (Beta ratio), ISO 4406 (cleanliness codes), and ISO 5011 (air filtration). Application engineering for defined contamination targets.' },
                { title: 'Distributor Applications', body: 'Distributor partnership applications reviewed for regional coverage fit. Include your company profile, service territory, and current product lines. Response within 5 business days.' },
                { title: 'Fleet Optimization Support', body: 'Fleet-level extended service interval planning, multi-system coverage, and total cost of ownership analysis across all 12 industrial sectors.' },
              ].map(({ title, body }) => (
                <div key={title} style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', background: '#000' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#FFF12D', marginBottom: '0.75rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Distributor CTA */}
      <section style={{ padding: '3rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateIn>
            <Link
              href="/distributor-application"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                padding: '2rem 2.5rem',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '8px',
                background: 'rgba(255,241,45,0.02)',
                textDecoration: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,241,45,0.4)';
                e.currentTarget.style.background = 'rgba(255,241,45,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,241,45,0.2)';
                e.currentTarget.style.background = 'rgba(255,241,45,0.02)';
              }}
            >
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '0.4rem' }}>
                  AUTHORIZED DISTRIBUTION PROGRAM
                </p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', margin: 0 }}>
                  Interested in distributing ELIMFILTERS in your region?
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>
                  Apply for authorized distributor status → industrial sectors, defined territory, technical capability required.
                </p>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#FFF12D', whiteSpace: 'nowrap' }}>
                APPLY →
              </span>
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* Internal Knowledge Links */}
      <section style={{ padding: '3rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateIn>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              // KNOWLEDGE RESOURCES
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Industrial Standards Library', href: '/knowledge-system/standards' },
                { label: 'Contamination Case Studies', href: '/knowledge-system/contamination' },
                { label: 'Fleet Optimization Guides', href: '/knowledge-system/fleet' },
                { label: 'Filtration Systems Overview', href: '/systems' },
                { label: 'Technology Portfolio', href: '/technologies' },
                { label: 'Industries We Serve', href: '/industries' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '1rem 1.25rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontFamily: 'Outfit, sans-serif',
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    background: '#000',
                    display: 'block',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFF12D';
                    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  {label} →
                </Link>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Visible FAQ Section */}
      <section style={{ padding: '5rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <AnimateIn>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '1rem' }}>
              // COMMON QUESTIONS
            </p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '3rem' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                <div key={name} style={{ padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: '#050505' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem' }}>{name}</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* RetrievalBlock */}
      <div style={{ padding: '0 2rem 4rem' }}>
        <RetrievalBlock>
          <p>
            <strong>CONCEPT:</strong> ELIMFILTERS Contact & Technical Support
          </p>
          <p>
            <strong>DEFINITION:</strong> ELIMFILTERS provides technical support for industrial
            operators and distribution partners across OEM cross-reference validation, ISO
            specification matching (ISO 16889, ISO 4406, ISO 5011), fleet filtration optimization,
            and distributor partnership applications. Contact: info@elimfilters.com
          </p>
          <p>
            <strong>SYSTEMS:</strong> Air Intake · Fuel · Hydraulic · Lube Oil · Cabin · Compressed Air
          </p>
          <p>
            <strong>RELATED_STANDARDS:</strong> ISO 16889: Beta ratio filter testing | ISO 4406:
            Particle cleanliness codes | ISO 5011: Air intake filtration efficiency
          </p>
          <p>
            <strong>INDUSTRIAL_ROLE:</strong> Technical contact point for contamination control
            system specification, OEM compatibility validation, and asset protection strategy
            across 12 industrial sectors.
          </p>
          <p>
            <strong>CITATION_REFERENCE:</strong> source: elimfilters.com/contact | concept:
            Technical Support & Contact | version: 2.0 | last_updated: 2026-06-11
          </p>
        </RetrievalBlock>
      </div>
    </main>
  );
}
