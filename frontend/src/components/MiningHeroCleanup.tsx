'use client';

import { useEffect } from 'react';

export function MiningHeroCleanup() {
  useEffect(() => {
    if (!window.location.pathname.includes('/industries/mining')) return;

    const cleanMiningHero = () => {
      document.querySelectorAll('h1, h2, p, span').forEach((element) => {
        if (element.textContent?.trim() === 'MINING ASSETS.') {
          element.textContent = 'MINING ASSETS';
        }
      });
    };

    cleanMiningHero();
    requestAnimationFrame(cleanMiningHero);
    window.setTimeout(cleanMiningHero, 300);
  }, []);

  return null;
}
