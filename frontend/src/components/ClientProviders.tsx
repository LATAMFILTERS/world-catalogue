'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import i18nEs, { isSpanishPath } from '@/i18n-es';
import { ScrollProgress } from './ScrollProgress';
import { LanguageDetector } from './LanguageDetector';
import { UniversalEndNavigation } from './UniversalEndNavigation';
import { MeasurementProvider } from './MeasurementProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Published /es/ routes render with the Spanish instance and skip geo switching.
  const spanish = isSpanishPath(usePathname());

  useEffect(() => {
    const updateLang = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = ['ar', 'fa', 'he'].includes(lng) ? 'rtl' : 'ltr';
    };
    if (spanish) {
      updateLang('es');
      return;
    }
    i18n.on('languageChanged', updateLang);
    if (i18n.language) updateLang(i18n.language);
    return () => i18n.off('languageChanged', updateLang);
  }, [spanish]);

  return (
    <I18nextProvider i18n={spanish ? i18nEs : i18n}>
      <MeasurementProvider>
        {!spanish && <LanguageDetector />}
        <ScrollProgress />
        {children}
        <UniversalEndNavigation />
      </MeasurementProvider>
    </I18nextProvider>
  );
}
