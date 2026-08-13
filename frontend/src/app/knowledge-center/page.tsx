import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PUBLIC_INDUSTRIES, PUBLIC_SYSTEMS } from '@/lib/public-taxonomy';

const primaryNav = [
  ['SYSTEMS', '/knowledge-center/systems/'],
  ['CONTAMINATION', '/knowledge-center/contamination/'],
  ['STANDARDS', '/knowledge-center/standards/'],
  ['PROBLEMS', '/knowledge-center/problems/'],
  ['INDUSTRIES', '/knowledge-center/industries/'],
  ['DIAGRAMS', '/knowledge-center/diagrams/'],
  ['GLOSSARY', '/knowledge-center/glossary/'],
] as const;

const sectionStyle = { padding: 'clamp(3.5rem,7vw,6rem) clamp(1.25rem,5vw,4rem)', borderBottom: '1px solid rgba(255,255,255,.08)' } as const;
const shellStyle = { maxWidth: '1180px', margin: '0 auto' } as const;
const eyebrowStyle = { color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '.72rem', letterSpacing: '.14em', fontWeight: 700, marginBottom: '1rem' } as const;
const cardStyle = { color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,.12)', background: '#050505', padding: '1.5rem', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } as const;

function Flow({ items }: { items: string[] }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.55rem', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '.72rem', color: 'rgba(255,255,255,.72)', marginTop: '1rem' }}>{items.map((item, i) => <span key={item} style={{ display: 'flex', gap: '.55rem', alignItems: 'center' }}><b style={{ fontWeight: 600 }}>{item}</b>{i < items.length - 1 ? <span style={{ color: '#FFF12D' }}>→</span> : null}</span>)}</div>;
}

export default function KnowledgeCenterPage() {
  return <>
    <Navigation />
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <section style={{ ...sectionStyle, paddingTop: 'clamp(7rem,12vw,10rem)', background: 'linear-gradient(180deg,rgba(255,241,45,.07),transparent 52%)' }}>
        <div style={shellStyle}>
          <p style={eyebrowStyle}>KNOWLEDGE CENTER</p>
          <h1 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(2.5rem,5.4vw,4.8rem)', lineHeight: 1.02, maxWidth: '1000px', margin: '0 0 1.5rem', textTransform: 'uppercase' }}>Industrial Filtration Engineering<br />&amp; Asset Protection Intelligence</h1>
          <p style={{ maxWidth: '820px', color: 'rgba(255,255,255,.68)', fontSize: 'clamp(1rem,1.8vw,1.2rem)', lineHeight: 1.7 }}>Technical knowledge for contamination control, protection systems, standards, failure mechanisms and industrial applications — organized as one governed ELIMFILTERS source of truth.</p>
          <Link href="/knowledge-center/search/" style={{ marginTop: '2rem', maxWidth: '860px', minHeight: '64px', border: '1px solid rgba(255,241,45,.35)', background: '#070707', color: 'rgba(255,255,255,.68)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', fontFamily: 'Barlow, Arial, sans-serif' }}><span>Search technical knowledge, standards, systems, problems or applications</span><b style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '.72rem', letterSpacing: '.1em' }}>SEARCH</b></Link>
          <nav aria-label="Knowledge Center sections" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', marginTop: '1.5rem' }}>{primaryNav.map(([label, href]) => <Link key={label} href={href} style={{ color: 'rgba(255,255,255,.72)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '.68rem', letterSpacing: '.08em' }}>{label}</Link>)}</nav>
        </div>
      </section>

      <section style={sectionStyle}><div style={shellStyle}>
        <p style={eyebrowStyle}>ENGINEERING KNOWLEDGE</p><h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.7rem)', maxWidth: '760px' }}>Navigate by engineering question, not by marketing category.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginTop: '2rem' }}>
          <Link href="/knowledge-center/systems/" style={cardStyle}><div><span style={eyebrowStyle}>SYSTEMS</span><h3>5 protection systems</h3><Flow items={['AIR','FUEL','LUBE','HYDRAULIC','COOLING']} /></div><p style={{ color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>System architecture, contamination targets and protection relationships.</p></Link>
          <Link href="/knowledge-center/contamination/" style={cardStyle}><div><span style={eyebrowStyle}>CONTAMINATION</span><h3>Particle · Water · Chemical · Biological</h3><Flow items={['SOURCE','PATHWAY','COMPONENT','CONTROL']} /></div><p style={{ color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>Trace contamination from entry point to failure mechanism and control strategy.</p></Link>
          <Link href="/knowledge-center/standards/" style={cardStyle}><div><span style={eyebrowStyle}>STANDARDS</span><h3>ISO 16889 · ISO 4406 · ISO 5011</h3><Flow items={['TEST','MEASURE','CLASSIFY','APPLY']} /></div><p style={{ color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>Measurement methods, cleanliness classification and filtration performance context.</p></Link>
        </div>
      </div></section>

      <section style={{ ...sectionStyle, background: '#050505' }}><div style={shellStyle}><p style={eyebrowStyle}>UNDERSTAND THE FAILURE</p><h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)' }}>Follow the engineering chain from symptom to protection strategy.</h2><Flow items={['Failure mechanism','Contamination source','Component affected','Protection strategy']} /><Link href="/knowledge-center/problems/" style={{ display: 'inline-block', color: '#FFF12D', marginTop: '1.5rem', textDecoration: 'none', fontWeight: 700 }}>Explore failure problems →</Link></div></section>

      <section style={sectionStyle}><div style={shellStyle}><p style={eyebrowStyle}>EXPLORE BY SYSTEM</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '.8rem', marginTop: '1.5rem' }}>{PUBLIC_SYSTEMS.map(system => <Link key={system.slug} href={`/knowledge-center/systems/${system.slug}/`} style={{ color: '#fff', textDecoration: 'none', borderTop: '2px solid #FFF12D', background: '#050505', padding: '1.25rem', minHeight: '120px' }}><strong style={{ display: 'block', fontSize: '1rem', marginBottom: '.7rem' }}>{system.title}</strong><small style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>{system.technologies.join(' · ')}</small></Link>)}</div></div></section>

      <section style={{ ...sectionStyle, background: '#050505' }}><div style={shellStyle}><p style={eyebrowStyle}>TECHNICAL VISUAL LIBRARY</p><h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)' }}>Engineering concepts designed to be read visually.</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '.8rem', marginTop: '1.5rem' }}>{['Filtration diagrams','Contamination charts','System architecture','Failure mechanisms','Measurement references'].map((item,i) => <Link key={item} href="/knowledge-center/diagrams/" style={{ color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', padding: '1.2rem' }}><span style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '.65rem' }}>0{i+1}</span><strong style={{ display: 'block', marginTop: '.8rem' }}>{item}</strong><div aria-hidden="true" style={{ height: '26px', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,.3)', borderBottom: '1px solid rgba(255,255,255,.12)' }} /></Link>)}</div></div></section>

      <section style={sectionStyle}><div style={shellStyle}><p style={eyebrowStyle}>EXPLORE BY INDUSTRY</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.6rem', marginTop: '1.5rem' }}>{PUBLIC_INDUSTRIES.map(industry => <Link key={industry.slug} href={`/knowledge-center/industries/${industry.slug}/`} style={{ color: 'rgba(255,255,255,.82)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.12)', padding: '.85rem 0' }}>{industry.title}</Link>)}</div></div></section>

      <section style={{ ...sectionStyle, background: '#050505' }}><div style={{ ...shellStyle, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '2rem', alignItems: 'center' }}><div><p style={eyebrowStyle}>TECHNICAL GLOSSARY</p><h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)' }}>Controlled engineering terminology.</h2><p style={{ color: 'rgba(255,255,255,.58)', maxWidth: '720px', lineHeight: 1.7 }}>Canonical terms, definitions and aliases reduce ambiguity across web, search, AI retrieval, diagrams and translated content.</p></div><Link href="/knowledge-center/glossary/" style={{ background: '#FFF12D', color: '#000', textDecoration: 'none', fontWeight: 800, padding: '1rem 1.35rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '.72rem' }}>OPEN GLOSSARY</Link></div></section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'CollectionPage','@id':'https://elimfilters.com/knowledge-center/#collection',name:'ELIMFILTERS Knowledge Center — Industrial Filtration Engineering & Asset Protection Intelligence',description:'Canonical ELIMFILTERS engineering hub for filtration systems, contamination, standards, failure problems, industries, diagrams and controlled terminology.',url:'https://elimfilters.com/knowledge-center/',publisher:{'@id':'https://elimfilters.com/#organization'},mainEntity:{'@type':'ItemList',itemListElement:primaryNav.map(([name,href],index)=>({'@type':'ListItem',position:index+1,name,url:`https://elimfilters.com${href}`}))} }) }} />
    </main>
    <Footer />
  </>;
}
