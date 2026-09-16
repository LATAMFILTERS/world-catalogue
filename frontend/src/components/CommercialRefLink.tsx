'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'children'> & {
  href: string;
  children: ReactNode;
};

export function CommercialRefLink({ href, children, ...props }: Props) {
  const params = useSearchParams();
  const ref = (params.get('ref') || '').trim().toUpperCase();
  const valid = /^[A-Z]{2}-[0-9]{6}$/.test(ref);
  const separator = href.includes('?') ? '&' : '?';
  const target = valid ? `${href}${separator}ref=${encodeURIComponent(ref)}` : href;
  return <Link href={target} {...props}>{children}</Link>;
}
