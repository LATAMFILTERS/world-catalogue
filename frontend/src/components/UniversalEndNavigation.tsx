'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
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

  if (isRoute(pathname, '/knowledge-center')) {
    return {
      kind: 'knowledge',
      eyebrow: '',
      title: pathname === '/knowledge-center'
        ? 'Turn technical knowledge into an asset protection decision.'
        : 'Turn technical understanding into a protection decision.',
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
  const [positioned, setPositioned] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const language = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);
  const isMacrocore = pathname === '/technologies/macrocore' || pathname === '/technologies/macrocore/';

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setPositioned(false);
  }, [pathname]);

  useEffect(() => {
    if (isMacrocore) {
      setPositioned(true);
      return;
    }
    if (!hydrated || !navRef.current) return;

    let cancelled = false;
    const tryRelocate = () => {
      if (cancelled || !navRef.current) return false;
      const footer = document.querySelector('footer');
      if (!footer) return false;
      const parent = footer.parentElement;
      if (parent && navRef.current.parentElement !== parent) {
        parent.insertBefore(navRef.current, footer);
      }
      setPositioned(true);
      return true;
    };

    if (tryRelocate()) return;

    // The footer may not have mounted yet on first pass - retry briefly.
    const interval = window.setInterval(() => {
      if (tryRelocate()) window.clearInterval(interval);
    }, 100);

    // Never leave the block permanently hidden: reveal it regardless after a
    // short grace period, even if the footer never appears to relocate against.
    const fallback = window.setTimeout(() => {
      window.clearInterval(interval);
      setPositioned(true);
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(fallback);
    };
  }, [hydrated, isMacrocore, pathname, language]);

  useEffect(() => {
    if (isMacrocore || !config || !hydrated || language !== 'en') return;
    const main = document.querySelector('main');
    if (!main) return;

    const hiddenSections: HTMLElement[] = [];
    const sections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section'));

    sections.forEach((section) => {
      const heading = section.querySelector('h2, h3, p, span, [data-navigation-marker]');
      const text = heading?.textContent?.trim().toLowerCase() ?? '';
      if (text && LEGACY_ENDING_MARKERS.some((marker) => text.includes(marker))) {
        section.dataset.universalEndNavHidden = 'true';
        section.style.display = 'none';
        hiddenSections.push(section);
      }
    });

    return () => {
      hiddenSections.forEach((section) => {
        section.style.removeProperty('display');
        delete section.dataset.universalEndNavHidden;
      });
    };
  }, [config, pathname, hydrated, language, isMacrocore]);

  if (!config || !hydrated || language !== 'en') return null;

  const eyebrow = label ?? config.eyebrow;

  return (
    <nav
      ref={navRef}
      className={`universal-end-nav universal-end-nav--${config.kind}`}
      aria-label={t('nav.continueLabel', 'Continue through the ELIMFILTERS platform')}
      role="navigation"
      style={{ visibility: positioned ? 'visible' : 'hidden' }}
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
