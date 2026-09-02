'use client';

import Link from 'next/link';

const routes = [
  {
    title: 'Technical Support',
    body: 'Application questions, repeated failures, OEM cross-reference validation and engineering review.',
    href: 'mailto:support@elimfilters.com?subject=ELIMFILTERS%20Technical%20Support',
    action: 'application-support',
    label: 'Request technical support',
  },
  {
    title: 'Part Number / Product Intelligence',
    body: 'Known part number, cross-reference or application lookup. Start with Product Intelligence.',
    href: 'https://part-search.elimfilters.com',
    action: 'product-intelligence',
    label: 'Search product intelligence',
  },
  {
    title: 'Distributor Application',
    body: 'Companies seeking a structured B2B distribution relationship and market-development program.',
    href: '/distributor-application/',
    action: 'distributor-application',
    label: 'Apply as distributor',
  },
  {
    title: 'Commercial Inquiry',
    body: 'Existing customers, bulk orders, or general business questions not covered by the paths above.',
    href: 'mailto:info@elimfilters.com?subject=ELIMFILTERS%20Commercial%20Inquiry',
    action: 'commercial-inquiry',
    label: 'Send a commercial inquiry',
  },
] as const;

export default function ContactIntentRouter() {
  return (
    <>
    <section aria-labelledby="contact-intent-title" style={{position:'relative',overflow:'hidden',minHeight:420,display:'flex',alignItems:'flex-end',background:"linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.6) 62%,rgba(0,0,0,.25)),url('/images/contacto-papa.avif') center/cover no-repeat"}}>
      <div style={{maxWidth:1180,margin:'0 auto',width:'100%',padding:'96px clamp(20px,5vw,32px) 48px'}}>
        <p style={{margin:'0 0 12px',color:'#FFF12D',font:"700 .72rem/1.2 'Chakra Petch',Arial,sans-serif",letterSpacing:'.18em',textTransform:'uppercase'}}>CONTACT ELIMFILTERS</p>
        <h1 id="contact-intent-title" style={{margin:'0 0 14px',maxWidth:900,font:"700 clamp(2.2rem,5vw,4.4rem)/.95 'Chakra Petch',Arial,sans-serif",textTransform:'uppercase'}}>Choose the reason for your inquiry.</h1>
        <p style={{margin:0,maxWidth:820,color:'rgba(255,255,255,.68)',fontSize:'1.05rem',lineHeight:1.65}}>Technical, product-intelligence and distribution requests follow different workflows. Start with the path that matches what you need so the request reaches the correct team with the right context.</p>
      </div>
    </section>
    <section style={{background:'#050505',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{maxWidth:1180,margin:'0 auto',padding:'40px clamp(20px,5vw,32px) 56px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
          {routes.map((route) => {
            const external = route.href.startsWith('http');
            const mail = route.href.startsWith('mailto:');
            const style = {display:'flex',flexDirection:'column' as const,minHeight:210,padding:24,border:'1px solid rgba(255,255,255,.1)',background:'#0a0a0a',color:'#fff',textDecoration:'none'};
            const content = <><h2 style={{margin:'0 0 12px',font:"700 1.15rem 'Chakra Petch',Arial,sans-serif",textTransform:'uppercase'}}>{route.title}</h2><p style={{margin:'0 0 22px',color:'rgba(255,255,255,.62)',lineHeight:1.6}}>{route.body}</p><strong style={{marginTop:'auto',color:'#FFF12D',font:"700 .72rem 'Chakra Petch',Arial,sans-serif",letterSpacing:'.08em',textTransform:'uppercase'}}>{route.label} →</strong></>;
            if (external || mail) return <a key={route.title} href={route.href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} data-conversion-action={route.action} style={style}>{content}</a>;
            return <Link key={route.title} href={route.href} data-conversion-action={route.action} style={style}>{content}</Link>;
          })}
        </div>
      </div>
    </section>
    </>
  );
}
