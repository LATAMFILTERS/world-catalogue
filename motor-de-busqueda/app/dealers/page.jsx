'use client';
import { useState } from 'react';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function DealersApply() {
  const [form, setForm] = useState({
    Company:'', Country:'', Website:'', Executive:'', Position:'', Email:'',
    mining:false, agriculture:false, oilgas:false,
  });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({...form, [e.target.name]: val});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('TRANSMITTING APPLICATION...');
    setStatusType('loading');
    try {
      const formData = new FormData(e.target);
      const res = await fetch('https://formsubmit.co/ajax/distribution_network@elimfilters.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setStatus('APPLICATION SUBMITTED. OUR TEAM WILL CONTACT YOU WITHIN 24-48 BUSINESS HOURS.');
        setStatusType('success');
        setForm({Company:'',Country:'',Website:'',Executive:'',Position:'',Email:'',mining:false,agriculture:false,oilgas:false});
      } else { throw new Error(); }
    } catch {
      setStatus('CONNECTION ERROR. PLEASE EMAIL distribution_network@elimfilters.com');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const css = `
    .da{background:#000;color:#fff;min-height:100vh;}
    .da-back{position:fixed;top:24px;left:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .da-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .da-page{min-height:100vh;padding:40px 5%;background:radial-gradient(circle at 10% 10%,rgba(255,241,45,0.05) 0%,transparent 50%),linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.95)),url('${WP}/2025/08/ChatGPT-Image-1-ago-2025-01_36_10-p.m.png') center/cover no-repeat fixed;}
    .da-topbar{max-width:1400px;margin:0 auto 50px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:20px;}
    .da-topbar img{height:60px;filter:brightness(1.1);}
    .da-topbar-status{font-family:'JetBrains Mono',monospace;font-size:10px;color:#FFF12D;letter-spacing:0.2em;text-transform:uppercase;}
    .da-panel{max-width:1300px;margin:auto;background:rgba(10,10,10,0.8);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:1.4fr 1fr;}
    .da-form-side{padding:60px;border-right:1px solid rgba(255,255,255,0.08);}
    .da-info-side{padding:60px;background:rgba(255,255,255,0.01);}
    .da-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;color:#FFF12D;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;display:block;}
    .da-h1{font-family:'Russo One',sans-serif;font-size:42px;text-transform:uppercase;line-height:0.9;margin:10px 0 40px;}
    .da-h1 span{color:#FFF12D;}
    .da-label{display:block;font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa;margin-bottom:8px;}
    .da-field{margin-bottom:24px;}
    .da-input{width:100%;background:#111;border:1px solid #222;padding:16px;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;box-sizing:border-box;}
    .da-input:focus{border-color:#FFF12D;background:#161616;}
    .da-select{width:100%;background:#111;border:1px solid #222;padding:16px;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:all 0.3s;box-sizing:border-box;}
    .da-select:focus{border-color:#FFF12D;}
    .da-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    .da-checkgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;}
    .da-check{display:flex;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;align-items:center;background:#000;padding:10px;border:1px solid #222;cursor:pointer;color:#fff;letter-spacing:0.1em;text-transform:uppercase;}
    .da-check input{width:14px;height:14px;accent-color:#FFF12D;flex-shrink:0;}
    .da-btn{width:100%;background:#FFF12D;color:#000;border:none;padding:24px;font-family:'Russo One',sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;transition:all 0.4s;margin-top:20px;}
    .da-btn:hover{background:#fff;transform:translateY(-2px);}
    .da-btn:disabled{background:#444;color:#888;cursor:not-allowed;transform:none;}
    .da-status{font-family:'JetBrains Mono',monospace;font-size:11px;margin-top:16px;letter-spacing:0.05em;line-height:1.6;}
    .da-status.success{color:#FFF12D;}
    .da-status.error{color:#ef4444;}
    .da-status.loading{color:#FFF12D;}
    .da-info-img{width:100%;filter:grayscale(1) contrast(1.2);margin-bottom:40px;display:block;}
    .da-h2{font-family:'Russo One',sans-serif;font-size:24px;text-transform:uppercase;margin:10px 0 16px;}
    .da-h2 span{color:#FFF12D;}
    .da-info-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.03em;}
    .da-pillars{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0;}
    .da-pillar{border:1px solid rgba(255,241,45,0.2);padding:12px;font-family:'JetBrains Mono',monospace;font-size:10px;text-align:center;background:rgba(255,241,45,0.02);color:#fff;letter-spacing:0.15em;text-transform:uppercase;}
    .da-validation{background:rgba(255,241,45,0.05);border:1px dashed #FFF12D;padding:28px;margin-top:24px;}
    .da-validation-h{font-family:'Russo One',sans-serif;font-size:14px;text-transform:uppercase;margin-bottom:10px;color:#fff;}
    .da-validation-p{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,0.5);line-height:1.6;letter-spacing:0.03em;margin:0;}
    .da-footer-note{margin-top:40px;opacity:0.4;font-family:'JetBrains Mono',monospace;font-size:9px;text-align:center;letter-spacing:0.15em;text-transform:uppercase;}
    @media(max-width:1024px){.da-panel{grid-template-columns:1fr;} .da-form-side{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding:40px 20px;} .da-info-side{padding:40px 20px;}}
    @media(max-width:768px){.da-grid2{grid-template-columns:1fr;} .da-checkgrid{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <div className="da">
      <style>{css}</style>
      <a href="/" className="da-back">&larr; DEALERS</a>

      <div className="da-page">
        <div className="da-topbar">
          <img src={`${WP}/2025/11/logo-sin-fondo.png`} alt="ELIMFILTERS Global" />
          <div className="da-topbar-status">// GLOBAL PARTNER NETWORK v2.0</div>
        </div>

        <div className="da-panel">
          <div className="da-form-side">
            <span className="da-eyebrow">// PARTNERSHIP INTAKE MODULE</span>
            <h1 className="da-h1">AUTHORIZED<br /><span>DISTRIBUTOR.</span></h1>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="_subject" value="New Distributor Partnership Application - ELIMFILTERS" />
              <input type="hidden" name="_captcha" value="false" />

              <div className="da-field">
                <label className="da-label">Company Legal Name</label>
                <input className="da-input" type="text" name="Company" placeholder="Full Registered Business Name" required value={form.Company} onChange={handleChange} />
              </div>
              <div className="da-grid2">
                <div className="da-field">
                  <label className="da-label">Primary Country</label>
                  <input className="da-input" type="text" name="Country" placeholder="Global Territory" required value={form.Country} onChange={handleChange} />
                </div>
                <div className="da-field">
                  <label className="da-label">Official Website</label>
                  <input className="da-input" type="url" name="Website" placeholder="https://www.company.com" value={form.Website} onChange={handleChange} />
                </div>
              </div>
              <div className="da-field">
                <label className="da-label">Lead Executive Name</label>
                <input className="da-input" type="text" name="Executive" placeholder="Full Name" required value={form.Executive} onChange={handleChange} />
              </div>
              <div className="da-grid2">
                <div className="da-field">
                  <label className="da-label">Executive Position</label>
                  <select className="da-select" name="Position" required value={form.Position} onChange={handleChange}>
                    <option value="" disabled>Select Role</option>
                    <option>CEO / Managing Director</option>
                    <option>Head of Procurement</option>
                    <option>Business Development Manager</option>
                  </select>
                </div>
                <div className="da-field">
                  <label className="da-label">Corporate Email Address</label>
                  <input className="da-input" type="email" name="Email" placeholder="executive@company.com" required value={form.Email} onChange={handleChange} />
                </div>
              </div>
              <div className="da-field">
                <label className="da-label">Market Vertical Specialization</label>
                <div className="da-checkgrid">
                  <label className="da-check"><input type="checkbox" name="mining" checked={form.mining} onChange={handleChange} /> MINING</label>
                  <label className="da-check"><input type="checkbox" name="agriculture" checked={form.agriculture} onChange={handleChange} /> AGRICULTURE</label>
                  <label className="da-check"><input type="checkbox" name="oilgas" checked={form.oilgas} onChange={handleChange} /> OIL & GAS</label>
                </div>
              </div>
              {status && <div className={`da-status ${statusType}`}>{status}</div>}
              <button className="da-btn" type="submit" disabled={loading}>{loading ? 'TRANSMITTING...' : 'SUBMIT PARTNERSHIP APPLICATION'}</button>
            </form>
          </div>

          <div className="da-info-side">
            <img className="da-info-img" src={`${WP}/2026/01/5F57101E-1586-46DC-8A17-6923D4AFC385.jpg`} alt="ELIMFILTERS Industrial Application" loading="lazy" />
            <span className="da-eyebrow">// INTEGRATED SYSTEMS MATRIX</span>
            <div className="da-h2">INTEGRATED <span>FILTRATION CORE.</span></div>
            <p className="da-info-p">Joining the ELIMFILTERS dealer network grants exclusive access to high-tier industrial filtration intellectual property and precision engineering standards across 12 industries worldwide.</p>
            <div className="da-pillars">
              <div className="da-pillar">SINTRAXâ„¢ / LUBE</div>
              <div className="da-pillar">MACROCOREâ„¢ / AIR</div>
              <div className="da-pillar">NANOFORCEâ„¢ / HYD</div>
              <div className="da-pillar">COOLTECHâ„¢ / COOLANT</div>
            </div>
            <div className="da-validation">
              <div className="da-validation-h">ENGINEERING VALIDATION</div>
              <p className="da-validation-p">All ELIMFILTERS systems are certified under ISO 16889 and ISO 19438 protocols to ensure 99.9% particulate retention in high-horsepower applications worldwide.</p>
            </div>
            <div className="da-footer-note">Â© 2026 FILTVEX TECHNOLOGY LLC | ELIMFILTERSÂ® SYSTEMS | TECHNICAL REPOSITORY SECURED</div>
          </div>
        </div>
      </div>
    </div>
  );
}



