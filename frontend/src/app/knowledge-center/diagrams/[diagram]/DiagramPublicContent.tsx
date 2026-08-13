import Link from 'next/link';
import type { KCDiagram } from '@/lib/knowledge-center-data';
import DiagramBlock from '@/components/knowledge-center/DiagramBlock';

const labels:Record<string,string>={flow:'FLOW DIAGRAM',schematic:'SCHEMATIC','cross-section':'CROSS-SECTION',system:'SYSTEM DIAGRAM',process:'PROCESS DIAGRAM',chart:'CHART'};

export default function DiagramPublicContent({diagram}:{diagram:KCDiagram}){
  return <main style={{background:'#000',color:'#fff',minHeight:'100vh',padding:'4rem 2rem'}}>
    <section style={{maxWidth:1000,margin:'0 auto'}}>
      <Link href="/knowledge-center/diagrams/" style={{color:'rgba(255,255,255,.45)'}}>← TECHNICAL VISUAL LIBRARY</Link>
      <p style={{color:'#FFF12D',marginTop:'2rem'}}>{labels[diagram.diagramType]||diagram.diagramType.toUpperCase()}</p>
      <h1>{diagram.title}</h1>
      <p style={{color:'rgba(255,255,255,.62)',lineHeight:1.8}}>{diagram.engineeringPurpose}</p>
    </section>
    <section style={{maxWidth:1100,margin:'2.5rem auto 0',border:'1px solid rgba(255,255,255,.08)',padding:'1rem'}}><DiagramBlock id={diagram.svgComponentId} caption={diagram.accessibility.desc} aspectRatio="unset" /></section>
    {diagram.governingStandards.length?<section style={{maxWidth:1000,margin:'2.5rem auto 0',borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:'1.5rem'}}><h2>Technical Reference</h2><p style={{color:'rgba(255,255,255,.55)'}}>This visual is governed by the applicable standards and engineering context listed for the topic. Interpret measurements and limits within the referenced test method and application conditions.</p></section>:null}
  </main>;
}
