// The visitor's manual language choice (globe menu, or "yes"/"no thanks" on the language
// suggestion). It is stored in localStorage with a cookie fallback and always wins over the
// country-based suggestion. Nothing here is ever derived from geolocation.

export type SiteLang = 'en' | 'es' | 'pt';

export const SITE_LANGS: readonly SiteLang[] = ['en', 'es', 'pt'];

const STORAGE_KEY = 'ef_lang_pref';
const COOKIE_NAME = 'ef_lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSiteLang(value: unknown): value is SiteLang {
  return typeof value === 'string' && (SITE_LANGS as readonly string[]).includes(value);
}

/** Language code of an i18n/browser tag ("pt-BR" → "pt"), limited to the languages we publish. */
export function siteLangFromTag(tag: string | null | undefined): SiteLang {
  const code = (tag || '').slice(0, 2).toLowerCase();
  return isSiteLang(code) ? code : 'en';
}

export function getLanguagePreference(): SiteLang | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSiteLang(stored)) return stored;
  } catch {
    // Storage can be blocked; fall through to the cookie.
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([a-z]{2})`));
  return match && isSiteLang(match[1]) ? match[1] : null;
}

export function setLanguagePreference(lang: SiteLang): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // The cookie below still carries the choice.
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}
