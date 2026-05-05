'use client';
export default function TechPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <style>{\
        .impact { font-family: sans-serif; font-weight: 900; text-transform: uppercase; }
        .tech-label { font-family: monospace; color: #FFF12D; }
      \}</style>
      <div className="p-20">
        <h1 className="impact text-6xl">FILTRATION REVOLUTION</h1>
        <p className="tech-label mt-4">// ELIMFILTERS PROPRIETARY TECH</p>
        <a href="/technologies" className="mt-10 inline-block text-yellow-400">← BACK TO INDEX</a>
      </div>
    </div>
  );
}
