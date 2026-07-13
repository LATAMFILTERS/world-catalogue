'use client';

import { useEffect } from 'react';

const approvedHeroSubtitles: Record<string, string> = {
  '/industries/mining': 'MINING ASSETS',
  '/industries/agriculture': 'AGRICULTURAL ASSETS',
};

export function MiningHeroCleanup() {
  useEffect(() => {
    const matchedSubtitle = Object.entries(approvedHeroSubtitles).find(([path]) => window.location.pathname.includes(path))?.[1];
    if (!matchedSubtitle) return;

    const cleanApprovedHeroSubtitle = () => {
      document.querySelectorAll<HTMLElement>('h1, h2, p, span').forEach((element) => {
        const currentText = element.textContent?.trim();

        if (currentText === `${matchedSubtitle}.`) {
          element.textContent = matchedSubtitle;
        }

        if (element.textContent?.trim() === matchedSubtitle) {
          element.style.fontFamily = 'Chakra Petch, Arial Narrow, monospace';
          element.style.fontWeight = '700';
          element.style.fontSize = 'clamp(1.24rem, 3vw, 2.88rem)';
          element.style.lineHeight = '0.95';
          element.style.letterSpacing = '-0.035em';
          element.style.marginTop = '0.55rem';
          element.style.marginBottom = '1.65rem';
        }
      });
    };

    cleanApprovedHeroSubtitle();
    requestAnimationFrame(cleanApprovedHeroSubtitle);
    window.setTimeout(cleanApprovedHeroSubtitle, 300);
  }, []);

  return null;
}
