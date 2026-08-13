'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { KC_SEARCH_INDEX } from '@/lib/knowledge-center/search-index';
import { search } from '@/lib/knowledge-center/search-engine';
import type { KCSearchEntityType, KCSearchFilter } from '@/lib/knowledge-center/search-types';

const labels: Record<KCSearchEntityType,string> = {
  article:'ARTICLE', standard:'STANDARD', technology:'TECHNOLOGY', term:'GLOSSARY', system:'SYSTEM', diagram:'DIAGRAM', calculator:'CALCULATOR', comparison:'COMPARISON', industry:'INDUSTRY', problem:'PROBLEM',
};

const filters: {type:KCSearchFilter;label:string}[] = [
  {type:'all',label:'ALL'}, {type:'standard',label:'STANDARDS'}, {type:'technology',label:'TECHNOLOGIES'}, {type:'system',label:'SYSTEMS'}, {type:'problem',label:'PROBLEMS'}, {type:'term',label:'GLOSSARY'}, {type:'diagram',label:'DIAGRAMS'}, {type:'industry',label:'INDUSTRIES'},
];

export default function SearchPage(){
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<KCSearchFilter>('all');
  const results=useMemo(()=>{
    if(query.trim().length<2)return [];
    const found=search(KC_SEARCH_INDEX,query,80);
    return filter==='all'?found:found.filter((item)=>item.document.type===filter);
  },[query,filter]);

  return <main style={{background:'#000',color:'#fff',minHeight:'100vh',padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)'}}>
    <section style={{maxWidth:900,margin:'0 auto'}}>
      <Link href="/knowledge-center/" style={{color:'rgba(255,255,255,.45)',textDecoration:'none'}}>← KNOWLEDGE CENTER</Link>
      <p style={{color:'#FFF12D',fontFamily:'JetBrains Mono, monospace',fontSize:'.68rem',letterSpacing:'.1em',marginTop:'2rem'}}>ENGINEERING SEARCH</p>
      <h1 style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',lineHeight:1.05,margin:'1rem 0'}}>Search Technical Knowledge</h1>
      <p style={{color:'rgba(255,255,255,.62)',lineHeight:1.75,maxWidth:760}}>Search standards, systems, technologies, contamination topics, failure mechanisms, industries, diagrams and controlled engineering terminology from the ELIMFILTERS Knowledge Center.</p>
      <input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search by topic, standard, system, problem or application" style={{width:'100%',boxSizing:'border-box',marginTop:'1.5rem',background:'#050505',border:'1px solid rgba(255,241,45,.3)',color:'#fff',padding:'1rem 1.1rem',fontSize:'1rem'}} />
      <div style={{display:'flex',flexWrap:'wrap',gap:'.45rem',marginTop:'1rem'}}>{filters.map((item)=><button key={item.type} onClick={()=>setFilter(item.type)} style={{background:filter===item.type?'#FFF12D':'#050505',color:filter===item.type?'#000':'rgba(255,255,255,.65)',border:'1px solid rgba(255,255,255,.12)',padding:'.45rem .65rem',cursor:'pointer',fontSize:'.68rem'}}>{item.label}</button>)}</div>
    </section>

    <section style={{maxWidth:900,margin:'2.5rem auto 0'}}>
      {query.trim().length>=2 && <p style={{color:'rgba(255,255,255,.4)',fontSize:'.75rem',marginBottom:'1rem'}}>{results.length} relevant result{results.length===1?'':'s'}</p>}
      <div style={{display:'grid',gap:'.6rem'}}>{results.map((result)=>{const doc=result.document;return <Link key={`${doc.type}-${doc.href}`} href={doc.href} style={{textDecoration:'none',color:'#fff',border:'1px solid rgba(255,255,255,.09)',background:'#050505',padding:'1rem 1.15rem'}}><span style={{color:'#FFF12D',fontFamily:'JetBrains Mono, monospace',fontSize:'.58rem',letterSpacing:'.08em'}}>{labels[doc.type]}</span><strong style={{display:'block',margin:'.45rem 0'}}>{doc.label}</strong><p style={{margin:0,color:'rgba(255,255,255,.5)',fontSize:'.84rem',lineHeight:1.55}}>{doc.subtitle}</p></Link>;})}</div>
      {query.trim().length>=2 && results.length===0 ? <p style={{color:'rgba(255,255,255,.5)'}}>No matching technical reference was found. Try a broader engineering term, system, standard or application.</p> : null}
    </section>
  </main>;
}
