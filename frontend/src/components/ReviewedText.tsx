'use client';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';
export function ReviewedText({ text, context, stripNumber = false }: { text: string; context?: string; stripNumber?: boolean }) {
  const { t } = useTranslation();
  const translated = t(reviewedCopyKey(text) + (context ? '_' + context : ''), { defaultValue: text });
  return <>{stripNumber ? translated.replace(/^\d+\.\s*/, '') : translated}</>;
}

/** Same lookup as <ReviewedText>, for strings used in props and attributes. */
export function useReviewed() {
  const { t } = useTranslation();
  return (text: string) => t(reviewedCopyKey(text), { defaultValue: text });
}
