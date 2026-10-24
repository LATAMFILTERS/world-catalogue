// Server-only: reviewed /es/ and /pt/ engineering article bodies, read at build time (never shipped in the client bundle).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KCArticle, KCStandard, KCSystemDetail, KCTechnology } from '../types';
import type { KC_SYSTEMS } from '../canonical-systems-registry';
import type { ProblemStub, TerminologyEntry } from '@/lib/knowledge-center';

export function translatedArticle(slug: string, lang: 'es' | 'pt'): KCArticle {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, `${slug}.json`), 'utf8'));
}

export interface TranslatedFAQ {
  questions: Record<string, { question: string; answer: string }>;
  topics: Record<string, string>;
  categories: Record<string, string>;
}

export function translatedFAQ(lang: 'es' | 'pt'): TranslatedFAQ {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'faq.json'), 'utf8'));
}

export interface TranslatedSystem {
  system: (typeof KC_SYSTEMS)[number];
  detail: KCSystemDetail | null;
}

export function translatedSystem(slug: string, lang: 'es' | 'pt'): TranslatedSystem {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'systems', `${slug}.json`), 'utf8'));
}

export function translatedTechnology(slug: string, lang: 'es' | 'pt'): KCTechnology {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'technologies', `${slug}.json`), 'utf8'));
}

export function translatedStandard(slug: string, lang: 'es' | 'pt'): KCStandard {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'standards', `${slug}.json`), 'utf8'));
}

export function translatedTerm(slug: string, lang: 'es' | 'pt'): TerminologyEntry {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'glossary', `${slug}.json`), 'utf8'));
}

export function translatedProblem(slug: string, lang: 'es' | 'pt'): ProblemStub {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'problems', `${slug}.json`), 'utf8'));
}
