// Server-only: reviewed /es/ and /pt/ engineering article bodies, read at build time (never shipped in the client bundle).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KCArticle } from '../types';

export function translatedArticle(slug: string, lang: 'es' | 'pt'): KCArticle {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, `${slug}.json`), 'utf8'));
}
