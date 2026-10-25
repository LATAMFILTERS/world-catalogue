'use client';

import Link from '@/components/LocalizedLink';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { trackNavigationClick } from '@/lib/analytics';

interface NavItem {
  href: string;
  label: string;
  description: string;
  external?: boolean;
}

interface NavigationConfig {
  kind: 'families' | 'systems' | 'technologies' | 'industries' | 'knowledge' | 'home';
  eyebrow: string;
  title: string;
  items: NavItem[];
}

interface UniversalEndNavigationProps {
  label?: string;
}

const COMMON: Record<string, NavItem> = {
  systems: {
    href: '/systems',
    label: 'Protection Systems',
    description: 'Move from the current topic to the contamination-control architecture protecting the asset.',
  },
  families: {
    href: '/families',
    label: 'Product Families',
    description: 'Explore the physical filter and component families connected to the protection strategy.',
  },
  technologies: {
    href: '/technologies',
    label: 'Technologies',
    description: 'Review the ELIMFILTERS technologies engineered for specific contamination mechanisms.',
  },
  industries: {
    href: '/industries',
    label: 'Industries',
    description: 'See how operating environment, duty cycle, and downtime risk change the protection requirement.',
  },
  knowledge: {
    href: '/knowledge-center/',
    label: 'Knowledge System',
    description: 'Continue into standards, contamination mechanisms, engineering principles, and reliability guidance.',
  },
  search: {
    href: 'https://part-search.elimfilters.com',
    label: 'Part Search',
    description: 'Connect the engineering path to OEM, dimensional, and application references.',
    external: true,
  },
};

function isRoute(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function navigationFor(pathname: string): NavigationConfig | null {
  if (isRoute(pathname, '/knowledge-center')) return null;

  if (isRoute(pathname, '/families')) {
    return {
      kind: 'families',
      eyebrow: 'CONTINUE THROUGH THE PLATFORM',
      title: pathname === '/families'
        ? 'Connect product families to complete protection systems.'
        : 'From product family to complete asset protection.',
      items: [COMMON.systems, COMMON.technologies, COMMON.knowledge, COMMON.search],
    };
  }

  if (isRoute(pathname, '/systems')) {
    return {
      kind: 'systems',
      eyebrow: '',
      title: pathname === '/systems'
        ? 'Move from protection architecture to products and field application.'
        : 'Connect the protection system to products and operating context.',
      items: [COMMON.families, COMMON.technologies, COMMON.industries, COMMON.search],
    };
  }

  if (isRoute(pathname, '/technologies')) {
    return {
      kind: 'technologies',
      eyebrow: 'EXPLORE RELATED TECHNOLOGIES',
      title: pathname === '/technologies'
        ? 'Understand the engineering behind contamination control.'
        : 'Explore related protection technologies and principles.',
      items: [COMMON.systems, COMMON.industries, COMMON.knowledge, COMMON.search],
    };
  }

  if (isRoute(pathname, '/industries')) {
    return {
      kind: 'industries',
      eyebrow: '',
      title: pathname === '/industries'
        ? 'Translate industry risk into the correct protection architecture.'
        : 'Move from operating environment to the correct protection architecture.',
      items: [COMMON.systems, COMMON.families, COMMON.technologies, COMMON.search],
    };
  }

  return null;
}

const LEGACY_ENDING_MARKERS = [
  'explore further',
  'continue through the platform',
  'related platform paths',
  'next engineering path',
  'explore related',
  'further reading',
  'related resources',
];

export function UniversalEndNavigation({ label }: UniversalEndNavigationProps = {}) {
  const pathname = usePathname();
  const config = navigationFor(pathname);
  const { t, i18n } = useTranslation();
  const [hydrated, setHydrated] = useState(false);
  const language = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!config || !hydrated || language !== 'en') return null;

  const eyebrow = label ?? config.eyebrow;

  return (
    <nav
      className={`universal-end-nav universal-end-nav--${config.kind}`}
      aria-label={t('nav.continueLabel', 'Continue through the ELIMFILTERS platform')}
      role="navigation"
    >
      <div className="universal-end-nav__inner">
        {eyebrow && <p className="universal-end-nav__eyebrow">{eyebrow}</p>}
        <h2 className="universal-end-nav__title">{config.title}</h2>
        <div className="universal-end-nav__grid">
          {config.items.map((item) => {
            const handleNavigationClick = () => {
              trackNavigationClick(config.kind, item.label.toLowerCase().replace(/\s+/g, '_'), 'universal_end');
            };

            const content = (
              <>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
                <small>{t('nav.explore', 'EXPLORE')} →</small>
              </>
            );

            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="universal-end-nav__card"
                aria-label={`${item.label}: ${item.description}`}
                onClick={handleNavigationClick}
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="universal-end-nav__card"
                aria-label={`${item.label}: ${item.description}`}
                onClick={handleNavigationClick}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
