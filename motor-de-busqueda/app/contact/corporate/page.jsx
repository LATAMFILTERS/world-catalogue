'use client';
import { useState } from 'react';

const WP = 'https://cdn.elimfilters.com';

export default function CorporateContact() {
  const [form, setForm] = useState({ Nombre:'', Email:'', Asunto:'', Mensaje:'' });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('TRANSMITTING INQUIRY...');
    setStatusType('loading');
    try {
      const formData = new FormData(e.target);
      const res = await fetch('https://formsubmit.co/ajax/info@elimfilters.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setStatus('MESSAGE SENT SUCCESSFULLY.');
        setStatusType('success');
        setForm({ Nombre:'', Email:'', Asunto:'', Mensaje:'' });
      } else { throw new Error(); }
    } catch {
      setStatus('CONNECTION ERROR. PLEASE TRY AGAIN.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const css = `
    .cc{background:#000;color:#fff;min-height:100vh;}
    .cc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cc-hero{position:relative;height:85vh;display:flex;align-items:center;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.05);}
    .cc-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    .cc-hero-ov{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.4) 100%);}
    .cc-hero-c{position:relative;z-index:1;padding:120px 6% 80px;max-width:900px;}
    .cc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.3em;color:#FFF12D;text-transform:uppercase;margin-bottom:16px;}
    .cc-line{width:60px;height:2px;background:#FFF12D;margin-bottom:24px;}
    .cc-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,80px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0 0 32px;}
    .cc-h1 span{color:#FFF12D;}
    .cc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:520px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;font-style:italic;}
    .cc-main{background:#000;padding:80px 6%;}
    .cc-main-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;}
    .cc-info-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.3em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .cc-info-h{font-family:'Russo One',sans-serif;font-size:32px;text-transform:uppercase;color:rgba(255,255,255,0.9);margin-bottom:16px;font-style:italic;}
    .cc-info-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;max-width:420px;letter-spacing:0.03em;}
    .cc-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding-top:40px;border-top:1px solid rgba(255,255,255,0.1);margin-top:40px;}
    .cc-loc-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.3em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .cc-loc-name{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;margin-bottom:4px;}
    .cc-loc-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .cc-email-wrap{margin-top:32px;}
    .cc-email{font-family:'Russo One',sans-serif;font-size:18px;color:#fff;text-transform:uppercase;}
    .cc-form-wrap{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:48px;}
    .cc-form-h{font-family:'Russo One',sans-serif;font-size:24px;text-transform:uppercase;margin-bottom:32px;text-align:center;}
    .cc-form-h span{color:#FFF12D;}
    .cc-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
    .cc-input{width:100%;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;box-sizing:border-box;}
    .cc-input:focus{border-color:#FFF12D;background:rgba(255,255,255,0.07);}
    .cc-textarea{width:100%;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;min-height:120px;resize:vertical;box-sizing:border-box;margin-bottom:16px;}
    .cc-textarea:focus{border-color:#FFF12D;background:rgba(255,255,255,0.07);}
    .cc-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-weight:800;padding:20px;width:100%;text-transform:uppercase;font-size:12px;letter-spacing:0.12em;border:none;cursor:pointer;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);}
    .cc-btn:hover{background:#fff;transform:translateY(-2px);}
    .cc-btn:disabled{background:#444;color:#888;cursor:not-allowed;transform:none;}
    .cc-status{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-align:center;min-height:20px;margin-bottom:12px;text-transform:uppercase;}
    .cc-status.success{color:#FFF12D;}
    .cc-status.error{color:#ef4444;}
    .cc-status.loading{color:#FFF12D;}
    @media(max-width:1024px){.cc-main-inner{grid-template-columns:1fr;gap:48px;} .cc-info-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.cc-form-wrap{padding:28px;} .cc-form-grid{grid-template-columns:1fr;} .cc-hero-p{font-size:12px;}}
  `;

  return (
    <div className="cc">
      <style>{css}</style>
      <a href="/?skip=1" className="cc-back">&larr; HOME</a>

      <section className="cc-hero">
        <img className="cc-hero-img" src={`${WP}/2026/02/Gemini_Generated_Image_n5g37in5g37in5g3.png`} alt="ELIMFILTERS Global Contact" />
        <div className="cc-hero-ov" />
        <div className="cc-hero-c">
          <div className="cc-eyebrow">// Corporate Communications</div>
          <div className="cc-line" />
          <h1 className="cc-h1">ELIMFILTERS<br /><span>GLOBAL CONTACT.</span></h1>
          <p className="cc-hero-p">Direct link to our global headquarters and regional operational centers. Industrial asset protection technology — engineered and supported worldwide. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
        </div>
      </section>

      <section className="cc-main">
        <div className="cc-main-inner">
          <div>
            <div className="cc-info-label">// Institutional Channel</div>
            <div className="cc-info-h">General Inquiries</div>
            <p className="cc-info-p">This portal is dedicated exclusively to corporate matters. For technical assistance or our distribution network, please use our specialized service portals — ensuring your inquiry reaches the right engineering team.</p>
            <div className="cc-info-grid">
              <div>
                <div className="cc-loc-label">Global Headquarters</div>
                <div className="cc-loc-name">Frisco, Texas</div>
                <div className="cc-loc-sub">United States</div>
              </div>
              <div>
                <div className="cc-loc-label">LATAM Operations</div>
                <div className="cc-loc-name">Barquisimeto, Lara</div>
                <div className="cc-loc-sub">Regional Hub</div>
              </div>
            </div>
            <div className="cc-email-wrap">
              <div className="cc-info-label" style={{marginBottom:'8px'}}>Electronic Mail</div>
              <div className="cc-email">info@elimfilters.com</div>
            </div>
          </div>
          <div className="cc-form-wrap">
            <div className="cc-eyebrow" style={{textAlign:'center',marginBottom:'32px'}}>// Secure Messaging Center</div>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_subject" value="Corporate Web Inquiry - ELIMFILTERS" />
              <div className="cc-form-grid">
                <input className="cc-input" type="text" name="Nombre" placeholder="Full Name" required value={form.Nombre} onChange={handleChange} />
                <input className="cc-input" type="email" name="Email" placeholder="Corporate Email" required value={form.Email} onChange={handleChange} />
              </div>
              <input className="cc-input" style={{marginBottom:'16px',display:'block'}} type="text" name="Asunto" placeholder="Inquiry Subject" required value={form.Asunto} onChange={handleChange} />
              <textarea className="cc-textarea" name="Mensaje" placeholder="Describe your corporate requirement" required value={form.Mensaje} onChange={handleChange} />
              {status && <div className={`cc-status ${statusType}`}>{status}</div>}
              <button className="cc-btn" type="submit" disabled={loading}>{loading ? 'PROCESSING...' : 'INITIATE CONTACT'}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
