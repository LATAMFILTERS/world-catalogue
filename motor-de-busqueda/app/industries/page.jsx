import React from 'react';

export default function IndustriesIndex() {
  const industries = [
    { id: 'mining', name: 'MINING', desc: 'Open-pit & underground operations' },
    { id: 'construction', name: 'CONSTRUCTION', desc: 'Heavy equipment & earthmoving' },
    { id: 'oil-gas', name: 'OIL & GAS', desc: 'Upstream & downstream protection' },
    { id: 'marine', name: 'MARINE', desc: 'Offshore & inland waterway' },
    { id: 'power-gen', name: 'POWER GENERATION', desc: 'Diesel & gas turbine systems' },
    { id: 'agriculture', name: 'AGRICULTURE', desc: 'Harvesting & field equipment' },
    { id: 'trucks-fleets', name: 'TRUCKS & FLEETS', desc: 'Long-haul & urban logistics' },
    { id: 'manufacturing', name: 'MANUFACTURING', desc: 'Industrial process equipment' },
    { id: 'bus-coach', name: 'BUS & COACH', desc: 'Mass transit & tourism fleets' },
    { id: 'railway', name: 'RAILWAY', desc: 'Diesel-electric & compressed air' },
    { id: 'automotive', name: 'AUTOMOTIVE', desc: 'Light & commercial vehicles' },
    { id: 'municipal-services', name: 'WASTE & MUNICIPAL', desc: 'Critical urban services' }
  ];

  return (
    <div className="bg-black min-h-screen p-12 font-sans text-white">
      <h1 className="text-5xl font-black mb-12 border-l-4 border-yellow-400 pl-6 uppercase">INDUSTRIES WE PROTECT</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {industries.map(i => (
          <a key={i.id} href={/industries/ + i.id} className="p-6 bg-zinc-900/50 border-l border-zinc-800 hover:bg-yellow-400 hover:text-black transition-all group">
            <h3 className="font-black text-xl mb-1">{i.name}</h3>
            <p className="text-xs uppercase opacity-70">{i.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
