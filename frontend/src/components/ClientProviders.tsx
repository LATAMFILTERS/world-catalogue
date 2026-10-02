'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LOCALE_TAG, localeFromPath, localeInstances } from '@/i18n-locales';
import { ScrollProgress } from './ScrollProgress';
import { LanguageDetector } from './LanguageDetector';
import { UniversalEndNavigation } from './UniversalEndNavigation';
import { MeasurementProvider } from './MeasurementProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Published locale routes (/es/, /pt/) render with their own instance and skip geo switching.
  const locale = localeFromPath(usePathname());

  useEffect(() => {
    const updateLang = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = ['ar', 'fa', 'he'].includes(lng) ? 'rtl' : 'ltr';
    };
    if (locale) {
      updateLang(LOCALE_TAG[locale]);
      return;
    }
    i18n.on('languageChanged', updateLang);
    if (i18n.language) updateLang(i18n.language);
    return () => i18n.off('languageChanged', updateLang);
  }, [locale]);

  return (
    <I18nextProvider i18n={locale ? localeInstances[locale] : i18n}>
      <MeasurementProvider>
        {!locale && <LanguageDetector />}
        <ScrollProgress />
        {children}
        <UniversalEndNavigation />
      </MeasurementProvider>
    </I18nextProvider>
  );
}
