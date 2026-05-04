'use client';
import { useState } from 'react';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Dealers() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({
    Company_Name: '', Tax_ID: '', Location: '',
    Business_Model: '', Email: '',
    Technical_Spec: '',
  });

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleFile = (e) => {
    if (e.target.files[0]) setFileName(e.target.files[0].name.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData(e.target);
      const res = await fetch('https://formsubmit.co/ajax/distribution_network@elimfilters.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        throw new Error();
      }
    } catch {
      setError('CONNECTION INTERRUPTED. RETRY.');
    } finally {
      setLoading(false);
    }
  };

  const progress = submitted ? 100 : step * 25;

  const css = `
    .dl{background:#000;color:#fff;min-height:100vh;position:relative;overflow:hidden;}
    .dl-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .dl-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .dl-videobg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;object-fit:cover;filter:brightness(0.3);}
    .dl-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.9) 100%);z-index:1;}
    .dl-wrap{position:relative;z-index:2;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;}
    .dl-progress-wrap{width:100%;max-width:600px;margin-bottom:16px;background:#111;}
    .dl-progress{height:3px;background:#FFF12D;transition:width 0.4s ease;box-shadow:0 0 15px #FFF12D;}
    .dl-panel{background:rgba(5,5,5,0.98);border:1px solid #1a1a1a;padding:clamp(24px,6vw,48px);width:100%;max-width:600px;box-shadow:0 40px 80px rgba(0,0,0,0.9);}
    .dl-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .dl-h1{font-family:'Russo One',sans-serif;font-size:clamp(28px,5vw,40px);text-transform:uppercase;line-height:0.95;color:#fff;margin-bottom:28px;}
    .dl-h1 span{color:#FFF12D;}
    .dl-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:6px;}
    .dl-input{width:100%;padding:14px;margin-bottom:16px;background:#0d0d0d;border:1px solid #222;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;box-sizing:border-box;}
    .dl-input:focus{border-color:#FFF12D;background:#111;}
    .dl-textarea{width:100%;padding:14px;margin-bottom:16px;background:#0d0d0d;border:1px solid #222;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;min-height:120px;resize:vertical;box-sizing:border-box;}
    .dl-textarea:focus{border-color:#FFF12D;background:#111;}
    .dl-select{width:100%;padding:14px;margin-bottom:16px;background:#0d0d0d;border:1px solid #222;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;box-sizing:border-box;}
    .dl-select:focus{border-color:#FFF12D;}
    .dl-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.05em;padding:18px 10px;width:100%;text-transform:uppercase;border:none;cursor:pointer;transition:all 0.3s;margin-top:8px;}
    .dl-btn:hover{background:#fff;}
    .dl-btn:disabled{background:#333;color:#666;cursor:not-allowed;}
    .dl-btn-back{background:#1a1a1a;color:#fff;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.05em;padding:18px 10px;width:100%;text-transform:uppercase;border:none;cursor:pointer;transition:all 0.3s;}
    .dl-btn-back:hover{background:#222;}
    .dl-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .dl-file-box{border:1px dashed #333;padding:24px;text-align:center;cursor:pointer;margin-bottom:16px;transition:all 0.3s;min-height:80px;display:flex;align-items:center;justify-content:center;}
    .dl-file-box:hover{border-color:#FFF12D;}
    .dl-file-label{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.2em;}
    .dl-file-label.active{color:#FFF12D;}
    .dl-error{font-family:'JetBrains Mono',monospace;font-size:10px;color:#ef4444;text-transform:uppercase;letter-spacing:0.1em;text-align:center;margin-bottom:12px;}
    .dl-success-icon{text-align:center;margin-bottom:24px;}
    .dl-success-icon svg{width:72px;height:72px;}
    .dl-success-h{font-family:'Russo One',sans-serif;font-size:40px;text-transform:uppercase;color:#FFF12D;text-align:center;margin-bottom:16px;}
    .dl-success-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7;text-align:center;max-width:400px;margin:0 auto 32px;letter-spacing:0.05em;}
  `;

  return (
    <div className="dl">
      <style>{css}</style>
      <a href="/?skip=1" className="dl-back">&larr; HOME</a>
      <video className="dl-videobg" muted loop playsInline autoPlay poster={`${WP}/2026/02/Gemini_Generated_Image_n5g37in5g37in5g3.png`}>
        <source src={`${WP}/2025/08/4468754-uhd_3840_2160_24fps.mp4`} type="video/mp4" />
      </video>
      <div className="dl-overlay" />
      <div className="dl-wrap">
        <div className="dl-progress-wrap">
          <div className="dl-progress" style={{width:`${progress}%`}} />
        </div>
        <div className="dl-panel">
          {submitted ? (
            <div>
              <div className="dl-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFF12D" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="dl-success-h">SUBMITTED.</div>
              <p className="dl-success-p">Your distribution profile has been sent to our Global Engineering Center. Response protocol: <strong style={{color:'#fff'}}>24–48 business hours.</strong></p>
              <a href="/?skip=1" className="dl-btn" style={{display:'block',textAlign:'center',textDecoration:'none'}}>RETURN TO HOME</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="_subject" value="New Distribution Request - Global Portal" />
              <input type="hidden" name="_captcha" value="false" />

              {step === 1 && (
                <div>
                  <div className="dl-eyebrow">// STEP 01: IDENTITY</div>
                  <div className="dl-h1">COMPANY <span>PROFILE</span></div>
                  <label className="dl-label">Legal Entity Name</label>
                  <input name="Company_Name" className="dl-input" required placeholder="Legal Name" value={form.Company_Name} onChange={handleChange} />
                  <label className="dl-label">Tax Identification (EIN / VAT / Tax ID)</label>
                  <input name="Tax_ID" className="dl-input" required placeholder="Registration Number" value={form.Tax_ID} onChange={handleChange} />
                  <label className="dl-label">Primary Location</label>
                  <input name="Location" className="dl-input" required placeholder="City, Country" value={form.Location} onChange={handleChange} />
                  <button type="button" className="dl-btn" onClick={() => setStep(2)}>CONTINUE APPLICATION</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="dl-eyebrow">// STEP 02: MARKET</div>
                  <div className="dl-h1">COMMERCIAL <span>REACH</span></div>
                  <label className="dl-label">Primary Business Model</label>
                  <select name="Business_Model" className="dl-select" required value={form.Business_Model} onChange={handleChange}>
                    <option value="" disabled>Select operation type...</option>
                    <option value="Wholesale Distributor">Wholesale Distributor</option>
                    <option value="Retail Store">Parts Retail Store</option>
                    <option value="Fleet Service">Fleet Service Center</option>
                  </select>
                  <label className="dl-label">Corporate Email Address</label>
                  <input name="Email" type="email" className="dl-input" required placeholder="manager@company.com" value={form.Email} onChange={handleChange} />
                  <div className="dl-grid2">
                    <button type="button" className="dl-btn-back" onClick={() => setStep(1)}>BACK</button>
                    <button type="button" className="dl-btn" onClick={() => setStep(3)}>NEXT</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="dl-eyebrow">// STEP 03: ENGINEERING</div>
                  <div className="dl-h1">ENGINE <span>SPECIALIZATION</span></div>
                  <label className="dl-label">Engine Brands Serviced</label>
                  <textarea name="Technical_Spec" className="dl-textarea" placeholder="e.g., Cummins, Caterpillar, Detroit Diesel, MTU..." value={form.Technical_Spec} onChange={handleChange} />
                  <div className="dl-grid2">
                    <button type="button" className="dl-btn-back" onClick={() => setStep(2)}>BACK</button>
                    <button type="button" className="dl-btn" onClick={() => setStep(4)}>VALIDATE</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="dl-eyebrow">// STEP 04: VALIDATION</div>
                  <div className="dl-h1">SECURITY <span>CONTROL</span></div>
                  <label className="dl-label">Upload Company Portfolio (PDF/ZIP)</label>
                  <div className="dl-file-box" onClick={() => document.getElementById('file-upload').click()}>
                    <span className={`dl-file-label${fileName ? ' active' : ''}`}>{fileName || 'ATTACH DOCUMENT'}</span>
                    <input type="file" name="Attachment" id="file-upload" style={{display:'none'}} accept=".pdf,.zip" onChange={handleFile} />
                  </div>
                  {error && <div className="dl-error">&#10005; {error}</div>}
                  <button type="submit" className="dl-btn" disabled={loading}>
                    {loading ? 'TRANSMITTING...' : 'TRANSMIT TO GLOBAL NETWORK'}
                  </button>
                  <button type="button" className="dl-btn-back" style={{marginTop:'8px'}} onClick={() => setStep(3)}>CORRECT PREVIOUS DATA</button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
