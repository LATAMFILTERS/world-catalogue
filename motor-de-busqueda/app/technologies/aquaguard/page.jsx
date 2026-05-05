'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Aquaguard() {
  const css = `
    #aw{--volt:#FFF12D;--bg:#000;--text-body:#a1a1aa;--border-soft:rgba(255,255,255,0.08);background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;}
    .aw-impact{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:0.9;margin:0;}
    .aw-tech{font-family:'JetBrains Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:0.25em;color:var(--volt);font-size:11px;}
    .aw-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 8% 80px;}
    .aw-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_1av7l01av7l01av7.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .aw-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .aw-hero-c{position:relative;z-index:3;max-width:900px;}
    .aw-sec{padding:90px 8%;border-bottom:1px solid var(--border-soft);}
    .aw-sec-inner{max-width:1400px;margin:0 auto;}
    .aw-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .aw-h1{font-size:clamp(50px,10vw,110px);color:#fff;margin-bottom:0;}
    .aw-h1-volt{color:var(--volt);display:block;}
    .aw-p{color:var(--text-body);font-size:lg;line-height:1.8;margin-bottom:20px;font-weight:300;}
    .aw-h2{font-size:clamp(32px,4.5vw,58px);margin-bottom:24px;line-height:0.95;}
    .aw-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .aw-spec{border-left:1px solid #27272a;padding-left:16px;}
    .aw-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:var(--volt);text-transform:uppercase;display:block;margin-bottom:4px;}
    .aw-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;}
    .aw-img{width:100%;height:auto;display:block;filter:contrast(1.05);border:1px solid #1a1a1a;padding:4px;background:#000;}
    .aw-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .aw-card{background:linear-gradient(145deg,#080808,#000);border:1px solid var(--border-soft);padding:45px 35px;transition:all 0.4s;}
    .aw-card:hover{border-color:var(--volt);transform:translateY(-5px);}
    .aw-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;text-transform:uppercase;margin-bottom:16px;}
    .aw-btn{background:var(--volt);color:#000;font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;font-size:13px;text-decoration:none;transition:all 0.3s;border:2px solid var(--volt);}
    .aw-btn:hover{background:transparent;color:var(--volt);transform:scale(1.05);}
    .aw-cta{padding:100px 8%;background:#000;text-align:center;border-top:1px solid #111;}
    .aw-cta-inner{max-width:900px;margin:0 auto;}
    .aw-cta-h2{font-size:clamp(40px,8vw,100px);margin-bottom:32px;line-height:0.95;}
    .aw-cta-p{font-size:13px;color:var(--text-body);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .aw-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:var(--volt);text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .aw-back:hover{background:var(--volt);color:#000;}
    @media(max-width:1024px){.aw-grid2{grid-template-columns:1fr;} .aw-grid3{grid-template-columns:repeat(2,1fr);} .aw-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;}}
    @media(max-width:768px){.aw-grid3{grid-template-columns:1fr;} .aw-p{font-size:12px;} .aw-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div id="aw">
      <style>{css}</style>
      <a href="/?skip=1" className="aw-back">&larr; HOME</a>
      <section className="aw-hero">
        <div className="aw-hero-bg" />
        <div className="aw-hero-ov" />
        <div className="aw-hero-c">
          <p className="aw-tech" style={{marginBottom:'24px'}}>// SEPARACIÓN_TURBINA_FH / SERIE_S</p>
          <h1 className="aw-impact aw-h1">HIDROFÓBICA</h1>
          <h1 className="aw-impact aw-h1"><span className="aw-h1-volt">AQUAGUARD™</span></h1>
          <div style={{marginTop:'40px',maxWidth:'640px',borderLeft:'4px solid var(--volt)',paddingLeft:'40px'}}>
            <p className="aw-p" style={{fontSize:'22px',fontStyle:'italic',fontWeight:'300'}}>Blindaje avanzado para <strong>Turbinas Separadoras</strong> Serie FH. Ingeniería de coalescencia extrema para la eliminación total de agua en combustible</p>
          </div>
          <div style={{marginTop:'48px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="aw-btn">IDENTIFICAR SKU</Link>
            <div>
              <span className="aw-tech" style={{fontSize:'9px',opacity:0.4,display:'block',marginBottom:'4px'}}>PROTECCIÓN CRÍTICA</span>
              <span style={{color:'#fff',fontSize:'12px',letterSpacing:'0.05em',fontWeight:'bold'}}>99.8% SEPARACIÓN H2O</span>
            </div>
          </div>
        </div>
      </section>

      <section className="aw-sec" style={{background:'#050505'}}>
        <div className="aw-sec-inner">
          <div className="aw-grid2">
            <div>
              <p className="aw-tech" style={{marginBottom:'24px'}}>// DINÁMICA DE COALESCENCIA</p>
              <h2 className="aw-impact aw-h2">REPELENCIA<br /><span style={{color:'var(--volt)'}}>MOLECULAR ACTIVA</span></h2>
              <p className="aw-p">La tecnología <strong>AQUAGUARD™</strong> utiliza un medio filtrante con recubrimiento hidrofóbico de alta densidad. Este proceso fuerza la unión de micropartículas de agua emulsionada, logrando que decanten instantáneamente antes de comprometer la integridad de los inyectores</p>
              <div className="aw-specs">
                <div className="aw-spec">
                  <span className="aw-spec-label">EFICIENCIA DE SEPARACIÓN</span>
                  <p className="aw-spec-sub">Grado Industrial Superior</p>
                </div>
                <div className="aw-spec">
                  <span className="aw-spec-label">COMPATIBILIDAD</span>
                  <p className="aw-spec-sub">Sistemas Turbina Serie FH</p>
                </div>
              </div>
            </div>
            <div style={{background:'#000',border:'1px solid #1a1a1a',padding:'4px'}}>
              <img src={`${WP}/2026/04/Gemini_Generated_Image_i2rhli2rhli2rhli.png`} alt="Validación Técnica AQUAGUARD" className="aw-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="aw-sec">
        <div className="aw-sec-inner">
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p className="aw-tech" style={{marginBottom:'16px'}}>// CONTROL DE AGUA Y PARTÍCULAS</p>
            <h2 className="aw-impact aw-h2" style={{textAlign:'center'}}>INGENIERÍA PARA <span style={{color:'var(--volt)'}}>SISTEMAS DIESEL</span></h2>
          </div>
          <div className="aw-grid3">
            {[
              {title:'MEDIO HIDROFÓBICO',desc:'Fibras tratadas para repeler activamente el agua bajo flujos de alta velocidad'},
              {title:'FLUJO OPTIMIZADO',desc:'Diseño que minimiza la restricción, extendiendo la vida útil de la bomba de transferencia'},
              {title:'PROTECCIÓN TOTAL',desc:'Elimina el riesgo de corrosión y picaduras en los sistemas de inyección Common Rail'},
            ].map((c,i) => (
              <div key={i} className="aw-card">
                <h3 className="aw-impact" style={{fontSize:'20px',marginBottom:'16px'}}>{c.title}</h3>
                <p className="aw-p" style={{fontSize:'13px',color:'var(--text-body)'}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aw-cta">
        <div className="aw-cta-inner">
          <h2 className="aw-impact aw-cta-h2">ASEGURA TU COMBUSTIBLE</h2>
          <h2 className="aw-impact aw-cta-h2"><span style={{color:'var(--volt)'}}>USA AQUAGUARD™</span></h2>
          <Link href="/search" className="aw-btn">BUSCAR MI SKU</Link>
          <p className="aw-tech" style={{fontSize:'9px',opacity:0.3,marginTop:'48px',letterSpacing:'0.5em'}}>// INGENIERÍA GLOBAL HEAVY DUTY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
