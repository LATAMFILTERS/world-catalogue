'use client';

import { useEffect } from 'react';

export function MiningHeroCleanup() {
  useEffect(() => {
    if (!window.location.pathname.includes('/industries/mining')) return;

    const cleanMiningHero = () => {
      document.querySelectorAll<HTMLElement>('h1, h2, p, span').forEach((element) => {
        if (element.textContent?.trim() === 'MINING ASSETS.') {
          element.textContent = 'MINING ASSETS';
        }

        if (element.textContent?.trim() === 'MINING ASSETS') {
          element.style.fontSize = 'clamp(1.24rem, 3vw, 2.88rem)';
          element.style.lineHeight = '0.95';
          element.style.letterSpacing = '-0.035em';
          element.style.marginTop = '0.55rem';
          element.style.marginBottom = '1.65rem';
        }
      });
    };

    cleanMiningHero();
    requestAnimationFrame(cleanMiningHero);
    window.setTimeout(cleanMiningHero, 300);
  }, []);

  return null;
}
