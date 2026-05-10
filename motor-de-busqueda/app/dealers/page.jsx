'use client';
import { useState } from 'react';
const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';
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
    .da-h1{font-family:'Russo One',sans-serif;font-size:clamp(32px,6vw,64px);text-transform:uppercase;color:#fff;margin:0;}
    .da-h1 span{color:#FFF12D;}
    .da-sub{font-family:'JetBrains Mono',monospace;font-size:12px;color:#666;letter-spacing:0.05em;text-transform:uppercase;}
    .da-form{max-width:700px;margin:0 auto;}
    .da-form-group{margin-bottom:20px;}
    .da-form-label{display:block;font-family:'JetBrains Mono',monospace;font-size:11px;color:#FFF12D;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;}
    .da-form-input,.da-form-select{width:100%;background:#0d0d0d;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px;font-family:inherit;font-size:14px;transition:border 0.2s;}
    .da-form-input:focus,.da-form-select:focus{outline:none;border-color:#FFF12D;}
    .da-form-checkbox{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
    .da-form-checkbox input{width:18px;height:18px;cursor:pointer;}
    .da-form-checkbox label{cursor:pointer;font-size:14px;}
    .da-form-submit{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.15em;padding:14px 40px;border:none;cursor:pointer;text-transform:uppercase;transition:all 0.2s;width:100%;}
    .da-form-submit:hover{background:#fff;}
    .da-form-submit:disabled{background:#666;cursor:not-allowed;}
    .da-status{margin-top:20px;padding:16px;background:rgba(255,241,45,0.1);border:1px solid rgba(255,241,45,0.3);color:#FFF12D;font-family:'JetBrains Mono',monospace;font-size:12px;text-align:center;border-radius:4px;}
    .da-status.success{background:rgba(76,175,80,0.1);border-color:rgba(76,175,80,0.3);color:#4caf50;}
    .da-status.error{background:rgba(244,67,54,0.1);border-color:rgba(244,67,54,0.3);color:#f44336;}
    .da-status.loading{background:rgba(255,241,45,0.1);border-color:rgba(255,241,45,0.3);color:#FFF12D;}
  `;
  return (
    <div className="da">
      <style>{css}</style>
      <a href="/?skip=1" className="da-back">&larr; HOME</a>
      <div className="da-page">
        <div className="da-topbar">
          <div>
            <h1 className="da-h1">BECOME A<br /><span>DEALER</span></h1>
            <p className="da-sub">Distribution Network Application</p>
          </div>
        </div>
        <form className="da-form" onSubmit={handleSubmit}>
          <div className="da-form-group">
            <label className="da-form-label">Company Name *</label>
            <input type="text" name="Company" value={form.Company} onChange={handleChange} className="da-form-input" required />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Country *</label>
            <input type="text" name="Country" value={form.Country} onChange={handleChange} className="da-form-input" required />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Website</label>
            <input type="url" name="Website" value={form.Website} onChange={handleChange} className="da-form-input" />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Executive Name *</label>
            <input type="text" name="Executive" value={form.Executive} onChange={handleChange} className="da-form-input" required />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Position *</label>
            <input type="text" name="Position" value={form.Position} onChange={handleChange} className="da-form-input" required />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Email *</label>
            <input type="email" name="Email" value={form.Email} onChange={handleChange} className="da-form-input" required />
          </div>
          <div className="da-form-group">
            <label className="da-form-label">Industries of Interest</label>
            <div className="da-form-checkbox">
              <input type="checkbox" id="mining" name="mining" checked={form.mining} onChange={handleChange} />
              <label htmlFor="mining">Mining</label>
            </div>
            <div className="da-form-checkbox">
              <input type="checkbox" id="agriculture" name="agriculture" checked={form.agriculture} onChange={handleChange} />
              <label htmlFor="agriculture">Agriculture</label>
            </div>
            <div className="da-form-checkbox">
              <input type="checkbox" id="oilgas" name="oilgas" checked={form.oilgas} onChange={handleChange} />
              <label htmlFor="oilgas">Oil & Gas</label>
            </div>
          </div>
          <button type="submit" className="da-form-submit" disabled={loading}>
            {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
          </button>
          {status && <div className={`da-status ${statusType}`}>{status}</div>}
        </form>
      </div>
    </div>
  );
}
