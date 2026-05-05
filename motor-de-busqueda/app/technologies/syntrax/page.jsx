'use client';
import Link from 'next/link';

export default function SyntraxPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <style>{\
        .impact { font-family: sans-serif; font-weight: 900; text-transform: uppercase; }
        .tech-label { font-family: monospace; color: #FFF12D; }
      \}</style>
      <div className="p-20">
        <span className="tech-label">// LUBRICATION TECHNOLOGY</span>
        <h1 className="impact text-6xl mt-4">SYNTRAX™</h1>
        <p className="mt-6 text-xl text-gray-400 max-w-2xl">
          AI-developed hybrid media combining high-grade synthetic material and specialized cellulose for superior lubrication filtration.
        </p>
        <Link href="/technologies" className="mt-10 inline-block text-yellow-400">← BACK TO INDEX</Link>
      </div>
    </div>
  );
}
