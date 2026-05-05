'use client';
import Link from 'next/link';
const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Syntrax() {
  return (
    <div className="bg-black text-white min-h-screen antialiased font-sans">
      <style>{
        .impact { font-family: 'Montserrat', sans-serif; font-weight: 900; text-transform: uppercase; line-height: 0.9; }
        .tech { font-family: 'JetBrains Mono', monospace; color: #FFF12D; letter-spacing: 0.25em; font-size: 11px; }
      }</style>
      <section className="relative h-screen flex items-center px-[8%] overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover opacity-30 z-0" src="$WP/2026/05/p554004.mp4" autoPlay muted loop playsInline />
        <div className="relative z-10">
          <p className="tech mb-4">// LUBRICATION_SYSTEMS / MOD-01</p>
          <h1 className="impact text-7xl md:text-9xl mb-2">SYNTRAX</h1>
          <h1 className="impact text-6xl md:text-8xl text-[#FFF12D]">POWERED FILTRATION</h1>
          <div className="mt-10 max-w-xl border-l-4 border-[#FFF12D] pl-8 italic text-xl text-zinc-300">
            Hybrid synthetic media engineered for absolute soot capture and extended oil intervals.
          </div>
          <div className="mt-12"><Link href="/search" className="bg-[#FFF12D] text-black px-12 py-5 impact text-sm inline-block border-2 border-[#FFF12D] hover:bg-transparent hover:text-[#FFF12D] transition-all">SEARCH MY SKU</Link></div>
        </div>
      </section>
    </div>
  );
}
