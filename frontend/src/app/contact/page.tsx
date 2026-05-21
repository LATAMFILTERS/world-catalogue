'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIn } from '@/components/AnimateIn';

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
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone || '—');
      form.append('company', formData.company || '—');
      form.append('message', formData.message);
      form.append('_subject', `[elimfilters.com] New contact from ${formData.name}`);
      form.append('_captcha', 'false');
      form.append('_template', 'table');

      const res = await fetch('https://formsubmit.co/info@elimfilters.com', {
        method: 'POST',
        body: form,
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
      <Link href="/" style={{
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
              // GET IN TOUCH
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
            ELIMFILTERS GLOBAL CONTACT
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
            Have questions about our filtration systems? Need technical support? Contact our global team.
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
                    ELIMFILTERS LLC
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
                    Barquisimeto, Lara
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

                <div
                  style={{
                    background: 'rgba(255,241,45,0.08)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginTop: '2rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                      marginBottom: '0.75rem',
                      color: '#FFF12D',
                    }}
                  >
                    HOURS OF OPERATION
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'Outfit, sans-serif',
                      lineHeight: 1.6,
                    }}
                  >
                    Monday - Friday: 8:00 AM - 6:00 PM CST
                    <br />
                    Saturday: 9:00 AM - 2:00 PM CST
                    <br />
                    Sunday: Closed
                  </p>
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
    </main>
  );
}
