'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from '@/components/LocalizedLink';
import { KC_STANDARDS } from '@/lib/knowledge-center-data/canonical-public-standards-registry';

const publishedStandards = new Set(KC_STANDARDS.map(standard => standard.slug));

export function hasPublishedReferenceRoute(href: string): boolean {
  const standard = href.match(/^\/(?:es\/|pt\/)?knowledge-center\/standards\/([^/?#]+)\/?(?:[?#].*)?$/);
  return !standard || publishedStandards.has(standard[1]);
}

export function PublicReferenceLink({ href, children, className, style }: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  if (!hasPublishedReferenceRoute(href)) return <span className={className} style={style}>{children}</span>;
  return <Link href={href} className={className} style={style}>{children}</Link>;
}
