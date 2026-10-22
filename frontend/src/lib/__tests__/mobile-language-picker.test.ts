import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const menuSource = readFileSync(new URL('../../components/LanguageMenu.tsx', import.meta.url), 'utf8');
const changeSource = readFileSync(new URL('../apply-language.ts', import.meta.url), 'utf8');

describe('mobile language selection regression', () => {
  it('does not dismiss the Safari details popup on intermediate blur before click', () => {
    expect(menuSource).not.toContain('onBlur={(event)');
    expect(menuSource).toContain('touch-action:manipulation;min-height:44px');
    expect(menuSource).toContain("onClick={(event) => onSelect(event, lang)}");
  });
  it('changes the active i18next provider, not only the English singleton', () => {
    expect(menuSource).toContain('applyLanguageInPlace(lang, i18n)');
    expect(changeSource).toContain('instance: I18nInstance = i18n');
    expect(changeSource).toContain('await instance.changeLanguage(lang)');
    expect(menuSource).toContain('setLanguagePreference(lang)');
  });
});
