'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MacrocoreMediaEngineering } from './MacrocoreMediaEngineering';

export function MacrocoreMediaEngineeringPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const image = document.querySelector<HTMLImageElement>('img[src="/images/MACROCORE-media.png"]');
    const mediaGrid = image?.closest('figure')?.parentElement;
    const introInner = mediaGrid?.parentElement;
    if (introInner instanceof HTMLElement) setTarget(introInner);
  }, []);

  if (!target) return null;

  return createPortal(<MacrocoreMediaEngineering />, target);
}
