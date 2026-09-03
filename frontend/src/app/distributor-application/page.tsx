'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { PageHeader } from '@/components/PageHeader';

const PROGRAM_SUPPORT = [
  {
    title: 'Country Market Rights',
    body: 'ELIMFILTERS selects one primary distribution partner per country or defined market. Territorial exclusivity is granted under the commercial agreement and maintained through agreed performance and volume targets.',
  },
  {
    title: 'Factory-Direct Volume Economics',
    body: 'Built for container and recurring-volume purchasing. The model is designed to give the country distributor competitive landed cost, commercial margin and room to build a national reseller network.',
  },
  {
    title: 'Commercial Infrastructure Included',
    body: 'Partners receive product intelligence, cross-reference tools, technical knowledge, audiovisual assets, campaign support, sales materials and digital resources to accelerate market development.',
  },
  {
    title: 'Brand + Product Platform',
    body: 'A complete heavy-duty filtration platform covering air, fuel, lube, hydraulic and cooling protection, supported by a consistent product identity and technical positioning.',
  },
  {
    title: 'Local Network Development',
    body: 'The country distributor develops the downstream market: resellers, workshops, fleets, agriculture, construction, mining and other industrial accounts. ELIMFILTERS supports the distributor rather than competing with it.',
  },
  {
    title: 'Long-Term Market Building',
    body: 'This is not a spot-buy program. We are selecting companies capable of building inventory, developing coverage and representing ELIMFILTERS as a long-term national distribution business.',
  },
];

const QUALIFICATION = [
  'Established company with local commercial presence',
  'Ability to import, warehouse and finance inventory',
  'Existing access to automotive, heavy-duty or industrial channels',
  'Capacity to purchase and replenish in commercial volume',
  'Commitment to develop ELIMFILTERS across the assigned territory',
  'Dedicated sales execution and measurable annual growth targets',
];

const schemaService = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ELIMFILTERS Country Master Distributor Program',
  provider: {
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
  },
  description:
    'Country-level distribution partnership for companies building the ELIMFILTERS filtration business in their local market with factory-direct volume economics, technical support and commercial infrastructure.',
  areaServed: 'Worldwide',
  serviceType: 'Country Distribution Partnership',
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://elimfilters.com/contact/' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Country Distributor Application',
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
    const handler = (e: Event) => setTurnstileToken((e as CustomEvent<string>).detail);
    document.addEventListener('turnstile-verified', handler);
    return () => document.removeEventListener('turnstile-verified', handler);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.currentTarget;
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
      if (!res.ok) throw new Error('Application request failed');
      setSubmitted(true);
      setTurnstileToken('');
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

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.95rem 1rem',
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.14)',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 800,
    marginBottom: '0.55rem',
    color: 'rgba(255,255,255,0.58)',
    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  };

  const sectionStyle: CSSProperties = {
    padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 3rem)',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  };

  const headingStyle: CSSProperties = {
    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
    fontSize: 'clamp(2rem, 4vw, 3.8rem)',
    lineHeight: 0.95,
    textTransform: 'uppercase',
    letterSpacing: '-0.03em',
    margin: 0,
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Barlow, Arial, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <PageHeader breadcrumbs={[{ label: 'Contact', href: '/contact/' }]} currentPage="Country Distributor Application" />

      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '7rem clamp(1.25rem, 6vw, 6rem)', background: "linear-gradient(100deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.74) 42%, rgba(0,0,0,0.34) 75%, rgba(0,0,0,0.15) 100%), radial-gradient(circle at 85% 15%, rgba(255,241,45,0.18), transparent 34%), url('/images/DISTRIBUTION.jpeg') center/cover no-repeat", borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
          <p style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', fontSize: '0.76rem', marginBottom: '1.4rem' }}>
            // COUNTRY MASTER DISTRIBUTOR PROGRAM
          </p>
          <h1 style={{ maxWidth: '1050px', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(3.2rem, 8vw, 7.5rem)', lineHeight: 0.88, letterSpacing: '-0.055em', textTransform: 'uppercase', margin: 0 }}>
            Build ELIMFILTERS
            <span style={{ display: 'block', color: '#FFF12D' }}>In Your Country.</span>
          </h1>
          <p style={{ maxWidth: '820px', color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', lineHeight: 1.7, fontWeight: 600, marginTop: '2rem' }}>
            We are selecting one primary distribution partner per market to build the ELIMFILTERS business locally. You import in volume, develop the national sales network and own the commercial execution. We provide the brand, product platform, technical intelligence and market-development tools behind it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2rem' }}>
            {['One Primary Partner Per Market', 'Factory-Direct Volume', 'Commercial Support', 'Technical Intelligence'].map((item) => (
              <span key={item} style={{ border: '1px solid rgba(255,255,255,0.16)', padding: '0.8rem 1rem', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, background: '#050505' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)', gap: 'clamp(2rem, 6vw, 5rem)', alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: '7rem' }}>
              <p style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', textTransform: 'uppercase' }}>// THE BUSINESS MODEL</p>
              <h2 style={headingStyle}>One Country. One Distribution Partner.</h2>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.22rem', lineHeight: 1.7, fontWeight: 600, marginTop: 0 }}>
                ELIMFILTERS is built for wholesale distribution, not direct competition with our partners. Our objective is volume: manufacture efficiently, support the country distributor and help that partner expand through local resellers and commercial accounts.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.75 }}>
                Selected partners can receive territorial exclusivity under a formal agreement, subject to agreed purchasing, inventory, coverage and performance commitments. The result is a protected market-development structure with aligned incentives on both sides.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={headingStyle}>What The Country Distributor Receives</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem', marginTop: '2.5rem' }}>
            {PROGRAM_SUPPORT.map((item, index) => (
              <article key={item.title} style={{ border: '1px solid rgba(255,255,255,0.1)', background: index === 0 ? 'rgba(255,241,45,0.045)' : '#050505', padding: '1.5rem', minHeight: '220px' }}>
                <span style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.72rem' }}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: '1.35rem', textTransform: 'uppercase', margin: '1rem 0 0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.62)', lineHeight: 1.68, margin: 0 }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, background: '#050505' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div>
            <p style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', textTransform: 'uppercase' }}>// WHO WE ARE LOOKING FOR</p>
            <h2 style={headingStyle}>Operators, Not Order Takers.</h2>
            <p style={{ color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, marginTop: '1.4rem' }}>
              We are looking for companies capable of building a country-level distribution operation, carrying inventory and developing recurring wholesale demand.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {QUALIFICATION.map((item) => (
              <div key={item} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0.9rem 0', color: 'rgba(255,255,255,0.76)', lineHeight: 1.55 }}>
                <span style={{ color: '#FFF12D', fontWeight: 800 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, background: '#000', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          <div>
            <p style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', textTransform: 'uppercase' }}>// COUNTRY PARTNER REVIEW</p>
            <h2 style={headingStyle}>Apply To Build Your Market.</h2>
            <p style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.72, maxWidth: '560px', marginTop: '1.4rem' }}>
              Tell us about your company, territory, distribution reach and current product lines. We evaluate market fit, import capability, commercial volume and the ability to build ELIMFILTERS as a national business.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, maxWidth: '560px' }}>
              Applications do not create exclusivity automatically. Country rights, purchasing commitments and performance requirements are defined only in the final distribution agreement.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,241,45,0.28)', background: 'linear-gradient(135deg, rgba(255,241,45,0.055), rgba(255,255,255,0.025))', padding: 'clamp(1.4rem, 4vw, 2.5rem)' }}>
            <h3 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', color: '#FFF12D', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.8rem' }}>
              Country Distributor Application
            </h3>

            {submitted && (
              <div style={{ background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#90ee90' }}>
                Application submitted. Our commercial team will review your market and contact you.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Company / Commercial Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Company Legal Name *</label>
                <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Contact Name *</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>State / Province</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Years In Business</label>
                  <input type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Employees</label>
                  <input type="number" name="employees" value={formData.employees} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Current Product Lines / Brands</label>
                <textarea name="currentProducts" value={formData.currentProducts} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Distribution Territory / Channels *</label>
                <textarea name="serviceArea" value={formData.serviceArea} onChange={handleChange} required rows={3} placeholder="Describe your country coverage, reseller network, customer channels and industries served." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Commercial Capacity / Additional Information</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Tell us about import capability, warehouse capacity, purchasing volume and how you would develop ELIMFILTERS in your market." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div className="cf-turnstile" data-sitekey="0x4AAAAAAAAADqjDbXIBhXQVtSY" data-callback="onTurnstileSuccess" data-theme="dark" style={{ margin: '1rem 0' }} />

              <button type="submit" disabled={!turnstileToken} style={{ width: '100%', padding: '1rem', background: turnstileToken ? '#FFF12D' : 'rgba(255,255,255,0.18)', color: turnstileToken ? '#000' : 'rgba(255,255,255,0.5)', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.16em', border: 'none', cursor: turnstileToken ? 'pointer' : 'not-allowed', textTransform: 'uppercase' }}>
                Request Country Distributor Review
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
