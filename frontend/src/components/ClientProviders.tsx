'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ScrollProgress } from './ScrollProgress';
import { LanguageDetector } from './LanguageDetector';
import { UniversalEndNavigation } from './UniversalEndNavigation';
import { LanguageSelector } from './LanguageSelector';
import { ABTestVariantDisplay } from './ABTestVariantDisplay';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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

      {/* Fixed Language Selector Header */}
      <header
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '2rem',
          zIndex: 999,
        }}
      >
        <LanguageSelector />
      </header>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />

      {children}
      <UniversalEndNavigation />
      <ABTestVariantDisplay />
    </I18nextProvider>
  );
}
