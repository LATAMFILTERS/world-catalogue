'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { localizedHref } from '@/lib/localized-routes';
import { siteLangFromTag } from '@/lib/language-preference';

const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function LocalizedLink({ href, ...props }, ref) {
  const { i18n } = useTranslation();
  const lang = siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  const target = typeof href === 'string'
    ? localizedHref(href, lang)
    : href.host || href.hostname || href.protocol ? href : { ...href, pathname: href.pathname ? localizedHref(href.pathname, lang) : href.pathname };
  return <NextLink ref={ref} href={target} {...props} />;
});

export default LocalizedLink;
