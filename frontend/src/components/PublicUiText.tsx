'use client';
import { useTranslation } from 'react-i18next';
export function PublicUiText({ textKey, children }: { textKey: string; children: string }) {
  const { t } = useTranslation();
  return <>{t(textKey, { defaultValue: children })}</>;
}
