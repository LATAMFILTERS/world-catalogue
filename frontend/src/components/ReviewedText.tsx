'use client';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';
export function ReviewedText({ text }: { text: string }) {
  const { t } = useTranslation();
  return <>{t(reviewedCopyKey(text), { defaultValue: text })}</>;
}
