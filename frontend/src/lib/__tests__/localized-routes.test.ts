import { describe, expect, it, afterEach, vi } from 'vitest';
import { LOCALIZED_ROUTES, languageAlternates, languageHref, localizedHref, englishRouteOf } from '../localized-routes';
import { getLanguagePreference, setLanguagePreference, siteLangFromTag } from '../language-preference';

describe('Published public language navigation', () => {
  for (const route of LOCALIZED_ROUTES) {
    for (const lang of ['en', 'es', 'pt'] as const) {
      it(route + ' → ' + lang, () => {
        const target = languageHref(route, lang)!;
        expect(englishRouteOf(target)).toBe(route);
        expect(localizedHref(target + '?source=nav#details', lang)).toBe(target + '?source=nav#details');
        expect(languageAlternates(route)[lang === 'pt' ? 'pt-BR' : lang]).toBe('https://elimfilters.com' + target);
      });
    }
  }
  it('keeps unpublished destinations and external services intact', () => {
    for (const href of ['/systems/', '/api/partner-application', '/assets/image.png', '#main-content', 'https://part-search.elimfilters.com', '//example.com/contact', 'mailto:info@elimfilters.com']) {
      expect(localizedHref(href, 'es')).toBe(href);
    }
    expect(languageHref('/systems/', 'pt')).toBeNull();
  });
  it('switches from a localized route back to English', () => {
    expect(localizedHref('/pt/contact/?topic=air#form', 'en')).toBe('/contact/?topic=air#form');
    expect(localizedHref('/es/', 'pt')).toBe('/pt/');
    expect(siteLangFromTag('pt-BR')).toBe('pt');
  });
});

describe('Manual language preference', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('persists every menu language and reads it across navigation', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (k: string) => values.get(k), setItem: (k: string, v: string) => values.set(k, v) }, location: { protocol: 'https:' } });
    vi.stubGlobal('document', { cookie: '' });
    for (const lang of ['es', 'pt', 'en'] as const) {
      setLanguagePreference(lang);
      expect(getLanguagePreference()).toBe(lang);
      expect(document.cookie).toContain('ef_lang=' + lang + '; path=/;');
      expect(document.cookie).toContain('SameSite=Lax; Secure');
    }
  });
  it('keeps the choice when localStorage is blocked', () => {
    vi.stubGlobal('window', { localStorage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } }, location: { protocol: 'http:' } });
    vi.stubGlobal('document', { cookie: '' });
    setLanguagePreference('pt');
    expect(getLanguagePreference()).toBe('pt');
    expect(document.cookie).not.toContain('Secure');
  });
  it('ignores invalid preferences and does not access storage during SSR', () => {
    vi.stubGlobal('window', undefined);
    expect(getLanguagePreference()).toBeNull();
    expect(() => setLanguagePreference('es')).not.toThrow();
  });
});

describe('Synchronous language resources', () => {
  it('has complete shared labels in all three languages before a network request', async () => {
    const { default: i18n } = await import('../../i18n');
    for (const lang of ['en', 'es', 'pt']) {
      expect(i18n.hasResourceBundle(lang, 'translation')).toBe(true);
      await i18n.changeLanguage(lang);
      for (const key of ['nav.knowledgeCenter', 'nav.industrialProcess', 'footer.aboutUs', 'footer.productFamilies', 'footer.privacyPolicy', 'a11y.language', 'a11y.openMenu', 'publicUi.text21']) {
        expect(i18n.exists(key, { lng: lang, fallbackLng: false })).toBe(true);
      }
    }
    await i18n.changeLanguage('en');
  });
});
