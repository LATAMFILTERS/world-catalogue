'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const TECHNOLOGIES = [
  { code: 'MACROCORE TM', domain: 'Air Intake / Severe Dust Protection', href: '/technologies/macrocore' },
  { code: 'SYNTEPORE TM', domain: 'Fuel Cleanliness / Water Control', href: '/technologies/syntepore' },
  { code: 'NANOFORCE TM', domain: 'Hydraulic Contamination Control', href: '/technologies/nanoforce' },
  { code: 'SYNTRAX TM', domain: 'Lube Oil / Engine Protection', href: '/technologies/syntrax' },
  { code: 'HYDROCORE TM', domain: 'Fuel Water Separation', href: '/technologies/hydrocore' },
  { code: 'THERMACORE TM', domain: 'Cooling System Protection', href: '/technologies/thermacore' },
];

const MARKETS = [
  'Mining',
  'Construction',
  'Agriculture',
  'Truck Fleets',
  'Oil & Gas',
  'Marine',
  'Power Generation',
  'Industrial Equipment',
];

const PARTNER_VALUE = [
  'Technical selling position beyond commodity filter distribution.',
  'Industrial asset protection language for fleets and equipment operators.',
  'OEM cross-reference support and application validation.',
  'Coverage across air, fuel, lube, hydraulic and cooling systems.',
  'Brand platform built for severe-duty markets and distributor growth.',
  'Commercial positioning focused on downtime reduction and service life.',
];

const schemaService = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ELIMFILTERS Authorized Distributor Program',
  provider: {
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
  },
  description:
    'Authorized distributor partnership program for industrial asset protection. ELIMFILTERS provides proprietary contamination control technologies across industrial sectors.',
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
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    const handler = (e: Event) => setTurnstileToken((e as CustomEvent).detail);
    document.addEventListener('turnstile-verified', handler);
    return () => document.removeEventListener('turnstile-verified', handler);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/distributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });
      if (!res.ok) throw new Error();
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
    } catch {
      alert('Error sending application. Please try again.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.95rem 1rem',
    background: 'rgba(255,255,255,0.085)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 0,
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 800,
    marginBottom: '0.55rem',
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.85)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.085)';
  };

  return (
    <main style={{ background: '#050811', color: '#fff', minHeight: '100vh', fontFamily: 'Barlow, Arial, sans-serif', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          border: '1px solid rgba(255,241,45,0.65)',
          padding: '0.55rem 1rem',
          color: '#FFF12D',
          background: 'rgba(5,8,17,0.92)',
          textDecoration: 'none',
          fontFamily: 'Chakra Petch, Arial Narrow, monospace',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
        }}
      >
        HOME
      </Link>

      <section
        style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          background:
            'radial-gradient(circle at top, rgba(255,241,45,0.42), transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(56,189,248,0.15) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          padding: '6rem clamp(1.25rem,5vw,2rem) 4rem',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
          <p
            style={{
              color: '#FFF12D',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Authorized Distributor Program
          </p>

          <h1
            style={{
              maxWidth: '980px',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.055em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Represent Total Asset
            <span style={{ display: 'block', color: '#FFF12D' }}>Protection</span>
          </h1>

          <p
            style={{
              maxWidth: '760px',
              color: 'rgba(255,255,255,0.76)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.65,
              fontWeight: 600,
              marginBottom: '2rem',
            }}
          >
            Join an industrial filtration platform built for severe-duty markets,
            technical selling, OEM cross-reference intelligence and contamination control.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {['Technical Selling', 'Severe Duty Markets', 'Industrial Reliability'].map((item) => (
              <span
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.75rem 1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#050505', padding: '1.6rem' }}>
              <h2 style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Not Commodity Distribution
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.65, margin: 0 }}>
                ELIMFILTERS distributors sell technical outcomes: downtime reduction,
                cleaner systems, longer service life and better asset protection.
              </p>
            </div>

            <div style={{ border: '1px solid rgba(255,241,45,0.28)', background: 'rgba(255,241,45,0.035)', padding: '1.6rem' }}>
              <h2 style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Built For Industrial Markets
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
                Priority partners serve fleets, equipment operators, mining, construction,
                agriculture, marine, oil and power generation accounts.
              </p>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#050505', padding: '1.6rem' }}>
              <h2 style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Technical Sales Advantage
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.65, margin: 0 }}>
                Partners gain a stronger position by selling contamination control systems,
                not interchangeable filter SKUs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Severe-Duty Coverage
          </h2>
          <p style={{ maxWidth: '680px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, marginBottom: '2rem' }}>
            ELIMFILTERS is positioned for markets where equipment uptime, contamination control
            and technical specification matter.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {MARKETS.map((market) => (
              <div
                key={market}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  color: 'rgba(255,255,255,0.78)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {market}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Technology Portfolio
          </h2>
          <p style={{ maxWidth: '720px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, marginBottom: '2rem' }}>
            A focused portfolio covering air intake, fuel cleanliness, hydraulic protection,
            lube oil protection, water separation and cooling system protection.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link
                key={tech.code}
                href={tech.href}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1.35rem',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <div style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  {tech.code}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.92rem' }}>
                  {tech.domain}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/technologies"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: '#FFF12D',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Explore All Technologies &gt;
          </Link>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '2rem' }}>
            Partner Advantage
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {PARTNER_VALUE.map((value) => (
              <div
                key={value}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1.3rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem) 5rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(2rem, 4vw, 3.8rem)', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '1.2rem' }}>
              Apply For Distributor Review
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, maxWidth: '560px', marginBottom: '1.5rem' }}>
              Applications are reviewed for industrial sector alignment, regional coverage,
              technical selling capability and fit with the ELIMFILTERS asset protection model.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, maxWidth: '560px' }}>
              Include specific details about your territory, current industrial clients,
              product lines and the sectors you serve.
            </p>
          </div>

          <div
            style={{
              border: '1px solid rgba(255,241,45,0.28)',
              background: 'linear-gradient(135deg, rgba(255,241,45,0.055), rgba(255,255,255,0.025))',
              padding: 'clamp(1.4rem, 4vw, 2.5rem)',
            }}
          >
            <h3
              style={{
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                color: '#FFF12D',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1.8rem',
              }}
            >
              Authorized Partner Application
            </h3>

            {submitted && (
              <div
                style={{
                  background: 'rgba(100,200,100,0.12)',
                  border: '1px solid rgba(100,200,100,0.35)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#90ee90',
                }}
              >
                Application submitted. Our commercial team will review and respond within 5 business days.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Company Legal Name *</label>
                <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Contact Name *</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
                <div>
                  <label style={labelStyle}>Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={labelStyle}>State / Province</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Years In Business</label>
                <input type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Current Product Lines</label>
                <textarea name="currentProducts" value={formData.currentProducts} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={labelStyle}>Service Territory / Industries Served *</label>
                <textarea
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe your geographic territory and the industrial sectors you currently serve."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Additional Information</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div
                className="cf-turnstile"
                data-sitekey="0x4AAAAAAAAADqjDbXIBhXQVtSY"
                data-callback="onTurnstileSuccess"
                data-theme="dark"
                style={{ margin: '1rem 0' }}
              />

              <button
                type="submit"
                disabled={!turnstileToken}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: turnstileToken ? '#FFF12D' : 'rgba(255,255,255,0.18)',
                  color: turnstileToken ? '#000' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.18em',
                  border: 'none',
                  cursor: turnstileToken ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                }}
              >
                Request Distributor Review
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
