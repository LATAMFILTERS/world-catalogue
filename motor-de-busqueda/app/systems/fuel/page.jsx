'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function FuelSystems() {
  const css = `
    .fs{background:#000;color:#fff;min-height:100vh;}
    .fs-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .fs-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
  `;
  return (
    <div className="fs">
      <style>{css}</style>
      <a href="/" className="fs-back">&larr; HOME</a>
      <section>Fuel Systems Protection</section>
    </div>
  );
}