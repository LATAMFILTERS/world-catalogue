'use client';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';
export function ReviewedText({ text, context, stripNumber = false }: { text: string; context?: string; stripNumber?: boolean }) {
  const { t } = useTranslation();
  const translated = t(reviewedCopyKey(text) + (context ? '_' + context : ''), { defaultValue: text });
  return <>{stripNumber ? translated.replace(/^\d+\.\s*/, '') : translated}</>;
}
