'use client';
import { useState } from 'react';

const WP = '/uploads';

export default function Contact() {
  const [form, setForm] = useState({ Name:'', Email:'', Product_Code:'', Subject:'', Message:'' });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending request to engineering...');
    setStatusType('loading');
    try {
      const formData = new FormData(e.target);
      const res = await fetch('https://formsubmit.co/ajax/support@elimfilters.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setStatus('Inquiry sent successfully. Engineering will contact you within 24-48 business hours.');
        setStatusType('success');
        setForm({ Name:'', Email:'', Product_Code:'', Subject:'', Message:'' });
      } else { throw new Error(); }
    } catch {
      setStatus('Connection interrupted. Please email us directly at support@elimfilters.com');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const css = `
    .ct{background:#000;color:#fff;min-height:100vh;}
    .ct-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ct-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ct-hero{position:relative;height:80vh;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ct-hero-img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;}
    .ct-hero-content{position:absolute;top:32px;right:5%;max-width:450px;text-align:right;}
    .ct-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:14px;font-weight:700;}
    .ct-hero-h{font-family:'Russo One',sans-serif;font-size:clamp(40px,5.5vw,72px);text-transform:uppercase;line-height:0.95;color:#fff;margin-bottom:4px;}
    .ct-hero-h span{color:#FFF12D;}
    .ct-hero-p{color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;font-style:italic;border-right:4px solid #FFF12D;padding-right:18px;line-height:1.75;letter-spacing:0.05em;}
    .ct-intro{padding:70px 6%;border-bottom:1px solid rgba(255,255,255,0.04);text-align:center;}
    .ct-intro-inner{max-width:1300px;margin:0 auto;}
    .ct-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;}
    .ct-h1 span{color:#FFF12D;}
    .ct-intro-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:700px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;text-align:left;margin:32px auto 0;}
    .ct-main{padding:70px 6%;background:#050505;}
    .ct-main-inner{max-width:1300px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;}
    .ct-info-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ct-info-h{font-family:'Russo One',sans-serif;font-size:24px;text-transform:uppercase;color:#fff;margin-bottom:8px;}
    .ct-info-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.03em;}
    .ct-info-link{font-family:'JetBrains Mono',monospace;font-size:13px;color:#FFF12D;font-weight:700;text-decoration:none;}
    .ct-info-link:hover{text-decoration:underline;}
    .ct-info-section{margin-bottom:32px;}
    .ct-social{display:flex;gap:24px;align-items:center;flex-wrap:wrap;}
    .ct-social-link{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);text-decoration:none;transition:color 0.2s;letter-spacing:0.1em;text-transform:uppercase;}
    .ct-social-link:hover{color:#FFF12D;}
    .ct-card{background:#050505;border:1px solid #1a1a1a;padding:44px;}
    .ct-form-h{font-family:'Russo One',sans-serif;font-size:28px;text-transform:uppercase;margin-bottom:24px;}
    .ct-form-h span{color:#FFF12D;}
    .ct-input{width:100%;padding:14px;margin-bottom:12px;background:#0d0d0d;border:1px solid #1f1f1f;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color 0.3s;box-sizing:border-box;}
    .ct-input:focus{border-color:#FFF12D;}
    .ct-textarea{width:100%;padding:14px;margin-bottom:12px;background:#0d0d0d;border:1px solid #1f1f1f;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color 0.3s;min-height:120px;resize:vertical;box-sizing:border-box;}
    .ct-textarea:focus{border-color:#FFF12D;}
    .ct-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:13px;letter-spacing:0.15em;padding:18px 36px;width:100%;text-transform:uppercase;border:none;cursor:pointer;transition:all 0.25s;}
    .ct-btn:hover{background:#fff;transform:translateY(-2px);}
    .ct-btn:disabled{background:#444;color:#888;cursor:not-allowed;transform:none;}
    .ct-status{font-family:'JetBrains Mono',monospace;font-size:12px;margin:12px 0;min-height:20px;letter-spacing:0.05em;}
    .ct-status.success{color:#FFF12D;}
    .ct-status.error{color:#ef4444;}
    .ct-status.loading{color:#FFF12D;}
    @media(max-width:1024px){.ct-main-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.ct-hero-content{top:auto;bottom:32px;right:5%;left:5%;text-align:left;max-width:100%;} .ct-hero-p{border-right:none;border-left:4px solid #FFF12D;padding-right:0;padding-left:18px;} .ct-card{padding:28px;}}
  `;

  return (
    <div className="ct">
      <style>{css}</style>
      <a href="/?skip=1" className="ct-back">&larr; HOME</a>

      <section className="ct-hero">
        <img className="ct-hero-img" src={`${WP}/2026/02/grok-image-b1afc52c-7ecb-4433-932c-64be6cc82e89.jpg`} alt="ELIMFILTERS Engineering Team" />
        <div className="ct-hero-content">
          <div className="ct-eyebrow">// GLOBAL ENGINEERING CENTER</div>
          <div className="ct-hero-h">BEHIND EVERY FILTER</div>
          <div className="ct-hero-h"><span>THERE IS A TEAM.</span></div>
          <p className="ct-hero-p">Engineers and technical specialists committed to protecting every asset and fleet that trusts ELIMFILTERS worldwide.</p>
        </div>
      </section>

      <section className="ct-intro">
        <div className="ct-intro-inner">
          <div className="ct-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// EXCLUSIVE TECHNICAL SUPPORT CHANNEL</div>
          <h1 className="ct-h1">TECHNICAL<br /><span>SUPPORT</span></h1>
          <p className="ct-intro-p">This portal is strictly for technical product inquiries. We assist active users with performance analysis, cross-reference validation, and asset protection engineering. Industrial asset protection systems engineered for fleets, mining operations, and critical diesel and gasoline-powered infrastructure — backed by total engineering support. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
        </div>
      </section>

      <section className="ct-main">
        <div className="ct-main-inner">
          <div>
            <div className="ct-info-section">
              <div className="ct-info-label">// GLOBAL OPERATIONS HEADQUARTERS</div>
              <div className="ct-info-h">OPERATIONS</div>
              <p className="ct-info-p">Frisco, TX — United States</p>
            </div>
            <div className="ct-info-section">
              <div className="ct-info-label">// DIRECT ENGINEERING EMAIL</div>
              <a href="mailto:support@elimfilters.com" className="ct-info-link">support@elimfilters.com</a>
            </div>
            <div className="ct-info-section">
              <div className="ct-info-label">// RESPONSE PROTOCOL</div>
              <p className="ct-info-p">Technical response time: 24–48 business hours. Our engineering team provides full fleet analysis and cross-reference validation for all active clients worldwide.</p>
            </div>
            <div className="ct-info-section">
              <div className="ct-info-label">// CONNECT WITH US</div>
              <div className="ct-social">
                <a href="https://www.linkedin.com/company/elimfilters-german-quality/" target="_blank" className="ct-social-link">LinkedIn</a>
                <a href="https://www.youtube.com/@elimfilters9112" target="_blank" className="ct-social-link">YouTube</a>
                <a href="https://instagram.com/elimfilters.global" target="_blank" className="ct-social-link">Instagram</a>
                <a href="https://wa.me/12819659142" target="_blank" className="ct-social-link">WhatsApp</a>
                <a href="https://x.com/elimfilters" target="_blank" className="ct-social-link">X</a>
              </div>
            </div>
          </div>
          <div className="ct-card">
            <div className="ct-eyebrow" style={{marginBottom:'16px'}}>// NEW TECHNICAL TICKET</div>
            <div className="ct-form-h">REQUEST <span>ASSISTANCE</span></div>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="_subject" value="New Engineering Ticket - ELIMFILTERS" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input className="ct-input" type="text" name="Name" placeholder="Full Name" required value={form.Name} onChange={handleChange} />
              <input className="ct-input" type="email" name="Email" placeholder="Email Address" required value={form.Email} onChange={handleChange} />
              <input className="ct-input" type="text" name="Product_Code" placeholder="Product Code (e.g., EL82100)" value={form.Product_Code} onChange={handleChange} />
              <input className="ct-input" type="text" name="Subject" placeholder="Subject" value={form.Subject} onChange={handleChange} />
              <textarea className="ct-textarea" name="Message" placeholder="How can our engineering team assist you?" required value={form.Message} onChange={handleChange} />
              {status && <div className={`ct-status ${statusType}`}>{statusType === 'success' ? '✓' : statusType === 'error' ? '✗' : '...'} {status}</div>}
              <button className="ct-btn" type="submit" disabled={loading}>{loading ? 'TRANSMITTING...' : 'SEND TO ENGINEERING'}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
