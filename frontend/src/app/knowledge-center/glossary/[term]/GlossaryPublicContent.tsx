import Link from 'next/link';
import { TERMINOLOGY_REGISTRY, termIdToSlug, getGlossarySidebarData, TERM_CATEGORY_LABELS } from '@/lib/knowledge-center';
import type { TerminologyEntry } from '@/lib/knowledge-center';

export default function GlossaryPublicContent({entry,slug}:{entry:TerminologyEntry;slug:string}) {
  const sidebar=getGlossarySidebarData(slug);
  const related=entry.relatedTerms.map((id)=>TERMINOLOGY_REGISTRY[id]).filter(Boolean) as TerminologyEntry[];
  return <main style={{background:'#000',color:'#fff',minHeight:'100vh',padding:'4rem 2rem'}}>
    <section style={{maxWidth:900,margin:'0 auto'}}>
      <Link href="/knowledge-center/glossary/" style={{color:'rgba(255,255,255,.45)'}}>← TECHNICAL GLOSSARY</Link>
      <p style={{color:'#FFF12D',marginTop:'2rem'}}>{TERM_CATEGORY_LABELS[entry.category]}</p>
      <h1>{entry.term}</h1>
      {entry.aliases.length?<p style={{color:'rgba(255,255,255,.4)'}}>Also referenced as: {entry.aliases.join(' · ')}</p>:null}
    </section>
    <section style={{maxWidth:900,margin:'2.5rem auto 0'}}><h2>Definition</h2><p style={{color:'rgba(255,255,255,.75)',lineHeight:1.8}}>{entry.definition}</p></section>
    <section style={{maxWidth:900,margin:'2.5rem auto 0',borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:'1.5rem'}}><h2>Engineering Context</h2><p style={{color:'rgba(255,255,255,.65)',lineHeight:1.8}}>{entry.engineeringContext}</p></section>
    {sidebar.relatedStandards.length?<section style={{maxWidth:900,margin:'2.5rem auto 0'}}><h2>Applicable Standards</h2><div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>{sidebar.relatedStandards.map((std)=>std.slug?<Link key={std.code} href={`/knowledge-center/standards/${std.slug}/`} style={{color:'#FFF12D'}}>{std.code}</Link>:<span key={std.code}>{std.code}</span>)}</div></section>:null}
    {sidebar.relatedTechnologies.length?<section style={{maxWidth:900,margin:'2.5rem auto 0'}}><h2>Related Technologies</h2><div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>{sidebar.relatedTechnologies.map((tech)=><Link key={tech.slug} href={`/knowledge-center/technologies/${tech.slug}/`} style={{color:'#fff'}}>{tech.name}</Link>)}</div></section>:null}
    {sidebar.relatedSystems.length?<section style={{maxWidth:900,margin:'2.5rem auto 0'}}><h2>Protection Systems</h2><div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>{sidebar.relatedSystems.map((system)=><Link key={system.slug} href={`/knowledge-center/systems/${system.slug}/`} style={{color:'#fff'}}>{system.title}</Link>)}</div></section>:null}
    {related.length?<section style={{maxWidth:900,margin:'2.5rem auto 0',borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:'1.5rem'}}><h2>Related Terms</h2><div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>{related.map((term)=><Link key={term.id} href={`/knowledge-center/glossary/${termIdToSlug(term.id)}/`} style={{color:'rgba(255,255,255,.7)'}}>{term.term}</Link>)}</div></section>:null}
  </main>;
}
