'use client';

import { useEffect } from 'react';

export default function LeadershipTitleNormalizer() {
  useEffect(() => {
    const applyTitle = () => {
      const heading = document.querySelector('.leadership-hero h1');
      if (!heading) return;

      const current = heading.textContent || '';
      const spanish = current.includes('Liderazgo') || document.documentElement.lang.toLowerCase().startsWith('es');
      const next = spanish
        ? 'Liderazgo humano. Ejecución nativa con IA.'
        : 'Human Leadership. AI Native Execution.';

      if (heading.textContent !== next) heading.textContent = next;
    };

    applyTitle();
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
