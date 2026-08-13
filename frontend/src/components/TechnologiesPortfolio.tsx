import Link from 'next/link';

const technologies = [
  ['macrocore', 'MACROCORE™'],
  ['syntapore', 'SYNTAPORE™'],
  ['turbocore', 'TURBOCORE™'],
  ['syntrax', 'SYNTRAX™'],
  ['nanoforce', 'NANOFORCE™'],
  ['thermacore', 'THERMACORE™'],
  ['drycore', 'DRYCORE™'],
  ['intekcore', 'INTEKCORE™'],
  ['microkappa', 'MICROKAPPA™'],
  ['marineclean', 'MARINECLEAN™'],
  ['duractech', 'DURACTECH™'],
];

export function TechnologiesPortfolio() {
  return (
    <section style={{padding:'clamp(3rem,8vw,7rem) clamp(1rem,4vw,4rem)',background:'#000',color:'#fff'}}>
      <div style={{maxWidth:'1320px',margin:'0 auto'}}>
        <p style={{color:'#FFF12D',letterSpacing:'.25em'}}>TECHNOLOGY PORTFOLIO</p>
        <h2 style={{fontSize:'clamp(2rem,4vw,3.5rem)'}}>Select the architecture. Understand the protection role.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'1rem'}}>
          {technologies.map(([slug,name]) => (
            <Link key={slug} href={`/technologies/${slug}`} style={{display:'block',padding:'2rem',border:'1px solid rgba(255,255,255,.15)',color:'#fff',textDecoration:'none'}}>
              {name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
