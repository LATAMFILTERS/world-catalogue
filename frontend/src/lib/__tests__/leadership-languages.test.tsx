import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import registry from '../../data/executive-visual-identity.json';
import { LeadershipPageClient } from '../../components/LeadershipPageClient';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/leadership/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));

describe('Leadership language coverage and preserved identity', () => {
  for (const lang of ['en', 'es', 'pt'] as const) {
    it(lang + ' renders the founder, all five agents and language-specific navigation', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><LeadershipPageClient /></I18nextProvider>);
      const visible = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
      const profile = visible.match(/class="founder-profile">([\s\S]*?)<\/div>/)?.[1] || '';
      expect((profile.match(/<p>/g) || []).length).toBe(5);
      expect((visible.match(/class="agent-profile"/g) || []).length).toBe(5);
      expect((visible.match(/class="agent-description"/g) || []).length).toBe(5);
      const agentDescriptions = [...visible.matchAll(/class="agent-description">([\s\S]*?)<\/div>/g)];
      expect(agentDescriptions).toHaveLength(5);
      for (const [, description] of agentDescriptions) expect((description.match(/<p>/g) || []).length).toBe(3);
      expect(visible).toContain(registry.founder.name);
      expect((visible.match(/class="founder-timeline-item"/g) || []).length).toBe(3);
      expect(visible).toContain('2004');
      expect(visible).toContain('2015');
      expect(visible).toContain(lang === 'pt' ? 'Marcos da trajetória' : lang === 'es' ? 'Hitos de trayectoria' : 'Career milestones');
      expect(visible).toContain(lang === 'pt' ? 'Desenvolvimento da plataforma de inteligência em filtração.' : lang === 'es' ? 'Desarrollo de la plataforma de inteligencia en filtración.' : 'Development of the filtration intelligence platform.');
      for (const person of [registry.founder, ...registry.agents]) expect(visible).toContain(person.image.replaceAll('&', '&amp;'));
      for (const technology of ['MACROCORE™', 'HYDROCORE™', 'TURBOCORE™', 'FH/FG']) expect(visible).not.toContain(technology);
      expect(visible).toContain('href="/about/who-we-are"');
      expect(visible).toContain('href="' + (lang === 'en' ? '/' : '/' + lang + '/') + '"');
      for (const heading of lang === 'pt' ? ['Liderança humana.', 'Execução nativa de IA.'] : lang === 'es' ? ['Liderazgo humano.', 'Ejecución nativa con IA.'] : ['Human leadership.', 'AI-native execution.']) expect(visible).toContain(heading);
      if (lang === 'pt') {
        for (const english of ['ELIMFILTERS · LEADERSHIP', 'FOUNDER &amp; CEO', 'EXECUTIVE AI LEADERSHIP', 'GOVERNANCE &amp; ACCOUNTABILITY', 'CAPABILITY BEFORE COMPLEXITY', 'Executive AI Agent', 'Chief Operating &amp; Supply Chain Agent', 'Human leadership.', 'Back to Who We Are']) expect(visible).not.toContain(english);
        for (const translated of ['LIDERANÇA EXECUTIVA DE IA', 'GOVERNANÇA E RESPONSABILIDADE', 'CAPACIDADE ANTES DA COMPLEXIDADE', 'Agente executivo de IA', 'não funcionários humanos', 'permanecem sujeitas à autoridade humana', '2002', 'UCAT', 'URBE']) expect(visible).toContain(translated);
      }
      if (lang === 'es') {
        for (const approved of ['2000', '2004', '2015', 'ELIMPERCA', 'protección de activos', 'costo total de propiedad (TCO)', 'retorno sobre la inversión (ROI)', 'sin limitarse a países específicos', 'simetría de información']) expect(visible).toContain(approved);
        for (const removed of ['2014', '18 contenedores HQ', 'LATAMFILTERS PRO INC.', 'Colombia, República Dominicana, Venezuela y Estados Unidos']) expect(visible).not.toContain(removed);
        expect(visible).toContain('LIDERAZGO EJECUTIVO DE IA');
        expect(visible).toContain('Agente ejecutivo de IA');
      }
      expect(visible).not.toContain('mailto:');
    });
  }
});
