'use client';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';
export function ReviewedImage({ alt, ...props }: ComponentProps<'img'>) {
  const { t } = useTranslation();
  return <img {...props} alt={alt ? t(reviewedCopyKey(alt), { defaultValue: alt }) : alt} />;
}
export function ReviewedBreadcrumb({ children, ...props }: ComponentProps<'nav'>) {
  const { t } = useTranslation();
  return <nav {...props} aria-label={t('a11y.breadcrumb', 'Breadcrumb')}>{children}</nav>;
}
