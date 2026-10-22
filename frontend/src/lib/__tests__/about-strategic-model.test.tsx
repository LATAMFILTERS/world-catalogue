import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { AboutStrategicModel } from '../../components/AboutStrategicModel';

describe('About strategic model: full-width editorial rows', () => {
  for (const lang of ['en', 'es', 'pt'] as const) {
    it(lang + ' keeps the strategic narrative while distributing sections 02–05', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(
        <I18nextProvider i18n={instance}><AboutStrategicModel /></I18nextProvider>,
      );
      const visible = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');

      expect(visible).toContain('ELIMFILTERS · ASSET PROTECTION SYSTEMS');
      expect(visible).toContain('id="strategic-model-title"');
      expect((visible.match(/class="strategic-intro-grid(?:\s|")/g) || []).length).toBe(1);
      expect((visible.match(/class="strategic-statement(?:\s|")/g) || []).length).toBe(1);
      expect((visible.match(/class="strategic-row(?:\s|")/g) || []).length).toBe(4);
      expect((visible.match(/class="strategic-row-heading(?:\s|")/g) || []).length).toBe(4);
      expect((visible.match(/class="strategic-row-copy(?:\s|")/g) || []).length).toBe(4);
      expect((visible.match(/class="strategic-conclusion(?:\s|")/g) || []).length).toBe(1);

      for (const number of ['02', '03', '04', '05']) {
        expect(visible).toMatch(new RegExp('class="strategic-number[^"]*"[^>]*>' + number + '<'));
      }

      const copy = instance.t('corporatePositioning.strategic', { returnObjects: true }) as Record<string, string>;
      for (const part of ['title', 'intro1', 'intro2', 'statement1', 'statement2', 'globalTitle',
        'modelingTitle', 'horizontalTitle', 'efficiencyTitle', 'closing1', 'closing2']) {
        expect(visible).toContain(copy[part].replaceAll('&', '&amp;'));
      }
    });
  }
});