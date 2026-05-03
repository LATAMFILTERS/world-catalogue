'use client';

import { useState, useEffect } from 'react';

const WP = 'https://elimfilters.com/wp-content/uploads';

const IMAGES = {
  hero: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg',
  mechanic: WP + '/2026/02/Gemini_Generated_Image_8slfcz8slfcz8slf.png',
  logo: WP + '/2025/11/logo-sin-fondo.png',
  seal: WP + '/2025/08/a2ec2ccf-d6ed-4acf-bcda-337b5669f007_removalai_preview.png',
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [activeIndustry, setActiveIndustry] = useState(0);

  const industries = [
    { name: 'MINING', desc: 'Open-pit & underground operations', img: WP + '/2025/08/digger-1867268_1920.jpg' },
    { name: 'CONSTRUCTION', desc: 'Heavy equipment & earthmoving', img: WP + '/2025/08/construction.jpg' },
    { name: 'OIL & GAS', desc: 'Upstream & downstream protection', img: WP + '/2026/04/pexels-tomfisk-6767962-1-scaled.jpg' },
    { name: 'MARINE', desc: 'Offshore & inland waterway', img: WP + '/2025/08/Screenshot-2025-08-07-075322.png' },
    { name: 'POWER GENERATION', desc: 'Diesel & gas turbine systems', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png' },
    { name: 'AGRICULTURE', desc: 'Harvesting & field equipment', img: WP + '/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg' },
    { name: 'TRUCKS & FLEETS', desc: 'Long-haul & urban logistics', img: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg' },
    { name: 'MANUFACTURING', desc: 'Industrial process equipment', img: WP + '/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg' },
  ];

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveIndustry(p => (p + 1) % industries.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{background:'#000',color:'#fff',fontFamily:'Barlow,sans-serif',overflowX:'hidden'}}>
      <p style={{textAlign:'center',padding:'40px',fontFamily:'JetBrains Mono,monospace',color:'#FFF12D'}}>
        ELIMFILTERS — PAGE.TSX CARGADO CORRECTAMENTE
      </p>
    </div>
  );
}
