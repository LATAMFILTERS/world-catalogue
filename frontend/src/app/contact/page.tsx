'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit to FormSubmit endpoint
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('company', formData.company);
    form.append('message', formData.message);

    fetch('https://formspree.io/f/mbjekqwb', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(() => {
        alert('Error sending message. Please try again.');
      });
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

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
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#FFF12D',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              // GET IN TOUCH
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              fontFamily: 'DM Sans, Gotham, sans-serif',
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            ELIMFILTERS GLOBAL CONTACT
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '700px',
            }}
          >
            Have questions about our filtration systems? Need technical support? Contact our global team.
          </p>
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
            <div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  fontFamily: 'DM Sans, Gotham, sans-serif',
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
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '0.75rem',
                    color: '#fff',
                  }}
                >
                  GLOBAL HEADQUARTERS
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Inter, sans-serif',
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
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '0.75rem',
                    color: '#fff',
                  }}
                >
                  LATIN AMERICAN OPERATIONS
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Inter, sans-serif',
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
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '0.75rem',
                    color: '#fff',
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
                    fontFamily: 'Inter, sans-serif',
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
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '0.75rem',
                    color: '#FFF12D',
                  }}
                >
                  HOURS OF OPERATION
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Inter, sans-serif',
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

            {/* Right: Contact Form */}
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
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '2rem',
                    color: '#fff',
                  }}
                >
                  SEND A MESSAGE
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
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    ✓ Message sent successfully! We'll be in touch soon.
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
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

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: '#FFF12D',
                      color: '#000',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.1em',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,241,45,0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    SEND MESSAGE
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
