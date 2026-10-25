'use client';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';
export function ReviewedText({ text, context, stripNumber = false }: { text: string; context?: string; stripNumber?: boolean }) {
  const { t } = useTranslation();
  const translated = t(reviewedCopyKey(text) + (context ? '_' + context : ''), { defaultValue: text });
  // Never render an empty content block when a locale entry is absent or accidentally blank.
  const safeText = typeof translated === 'string' && translated.trim() ? translated : text;
  return <>{stripNumber ? safeText.replace(/^\d+\.\s*/, '') : safeText}</>;
}

/** Same lookup as <ReviewedText>, for strings used in props and attributes. */
export function useReviewed() {
  const { t } = useTranslation();
  return (text: string) => {
    const translated = t(reviewedCopyKey(text), { defaultValue: text });
    return typeof translated === 'string' && translated.trim() ? translated : text;
  };
}
