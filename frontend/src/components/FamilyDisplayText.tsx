'use client';
import { useTranslation } from 'react-i18next';
import { FAMILY_ES, SYSTEM_ES } from '@/lib/families-es';
import { FAMILY_PT, SYSTEM_PT } from '@/lib/families-pt';
import { siteLangFromTag } from '@/lib/language-preference';
export function FamilyDisplayText({ slug, field, original, limit }: { slug: string; field: 'name' | 'purpose'; original: string; limit?: number }) {
  const { i18n } = useTranslation();
  const lang = siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  const local = lang === 'es' ? FAMILY_ES[slug] : lang === 'pt' ? FAMILY_PT[slug] : undefined;
  const text = local?.[field] ?? original;
  return <>{limit ? text.slice(0, limit) : text}</>;
}
export function SystemDisplayText({ slug, original }: { slug: string; original: string }) {
  const { i18n } = useTranslation();
  const lang = siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  return <>{(lang === 'es' ? SYSTEM_ES[slug]?.name : lang === 'pt' ? SYSTEM_PT[slug]?.name : undefined) ?? original}</>;
}
