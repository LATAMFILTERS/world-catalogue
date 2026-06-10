'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.9rem 0',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.25s ease',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '0.58rem',
  letterSpacing: '0.18em',
  color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase',
  marginBottom: '0.2rem',
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone || '—');
      form.append('company', formData.company || '—');
      form.append('message', formData.message);
      form.append('_subject', `[elimfilters.com] New contact from ${formData.name}`);
      form.append('_captcha', 'false');
      form.append('_template', 'table');
      const res = await fetch('https://formsubmit.co/info@elimfilters.com', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setTimeout(() => setSubmitted(false), 7000);
    } catch {
      setError('Error sending message. Email us directly at info@elimfilters.com');
    } finally {
      setSending(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.6)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact ELIMFILTERS',
          url: 'https://elimfilters.com/contact/',
          mainEntity: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'info@elimfilters.com',
            areaServed: 'Worldwide',
            availableLanguage: ['English', 'Spanish'],
          },
        }) }}
      />

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-info { padding-right: 0 !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding-bottom: 3rem !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 7% 5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/contacto-papa.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          filter: 'brightness(0.35)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1.5rem' }}
          >
            Global headquarters · Frisco, Texas
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.9)', margin: '0 0 1rem' }}
          >
            Engineering consultation<br />
            <span style={{ fontWeight: 600, color: '#FFF12D' }}>& industrial partnerships.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.95rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.45)', maxWidth: '560px', margin: 0 }}
          >
            OEM cross-reference, filtration system specification, contamination control strategy, and distributor partnerships across 12 industrial sectors.
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT GRID ── */}
      <section style={{ padding: '6rem 7%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '6rem', maxWidth: '1100px' }}>

          {/* LEFT — Info */}
          <div className="contact-info" style={{ paddingRight: '3rem', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                {
                  label: 'Global Headquarters',
                  lines: ['ELIMFILTERS LLC', 'Frisco, Texas 75034', 'United States'],
                },
                {
                  label: 'LATAM Operations',
                  lines: ['Barquisimeto, Lara', 'Venezuela'],
                },
                {
                  label: 'Email',
                  lines: ['info@elimfilters.com'],
                  isEmail: true,
                },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: '2.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                    {item.label}
                  </span>
                  {item.lines.map((line, j) =>
                    item.isEmail ? (
                      <a key={j} href={`mailto:${line}`} style={{ display: 'block', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.95rem', color: '#FFF12D', textDecoration: 'none', lineHeight: 1.6, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >{line}</a>
                    ) : (
                      <span key={j} style={{ display: 'block', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{line}</span>
                    )
                  )}
                </div>
              ))}

              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', display: 'block', marginBottom: '1.5rem' }}>
                  We handle
                </span>
                {[
                  'OEM cross-reference validation',
                  'ISO filtration specification',
                  'Distributor applications',
                  'Fleet maintenance strategy',
                  'Technical product inquiries',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '4px', height: '4px', background: '#FFF12D', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
                <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', marginTop: '1.25rem', lineHeight: 1.6 }}>
                  Technical inquiries: within 2 business days.<br />
                  Distributor applications: within 5 business days.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
              Send a message
            </p>

            {submitted && (
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(60,200,100,0.08)', border: '1px solid rgba(60,200,100,0.25)', marginBottom: '2rem' }}>
                <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.85rem', color: 'rgba(100,220,130,0.9)', margin: 0 }}>
                  Message sent. We&apos;ll respond within 2 business days.
                </p>
              </div>
            )}
            {error && (
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: '2rem' }}>
                <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.85rem', color: 'rgba(255,120,120,0.9)', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={LABEL_STYLE}>Full name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required style={INPUT_STYLE} placeholder="John Smith" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required style={INPUT_STYLE} placeholder="john@company.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={LABEL_STYLE}>Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} style={INPUT_STYLE} placeholder="Optional" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} style={INPUT_STYLE} placeholder="Optional" />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                  rows={5}
                  placeholder="Describe your equipment, application, and filtration needs..."
                  style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: sending ? 1 : 1.02, boxShadow: sending ? 'none' : '0 0 30px rgba(255,241,45,0.35)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: sending ? 'rgba(255,241,45,0.5)' : '#FFF12D',
                  color: '#000',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  padding: '0.9rem 2.25rem',
                  border: 'none',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {sending ? 'Sending...' : 'Send message'}
                {!sending && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
