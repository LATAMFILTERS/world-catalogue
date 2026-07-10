'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

import { ScrollProgress } from './ScrollProgress';
import { LanguageDetector } from './LanguageDetector';
import { UniversalEndNavigation } from './UniversalEndNavigation';
import { CanonicalEngineeringBlocks } from './CanonicalEngineeringBlocks';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Update html lang attribute when language changes
    const updateLang = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = ['ar', 'fa', 'he'].includes(lng) ? 'rtl' : 'ltr';
    };
    i18n.on('languageChanged', updateLang);
    if (i18n.language) updateLang(i18n.language);
    return () => i18n.off('languageChanged', updateLang);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageDetector />
      <ScrollProgress />
      {children}
      <CanonicalEngineeringBlocks />
      <UniversalEndNavigation />
    </I18nextProvider>
  );
}
