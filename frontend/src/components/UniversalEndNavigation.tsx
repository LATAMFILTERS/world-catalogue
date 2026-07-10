'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  description: string;
  external?: boolean;
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
    href: '/knowledge-system',
    label: 'Knowledge System',
    description: 'Continue into standards, contamination mechanisms, engineering principles, and reliability guidance.',
  },
  search: {
    href: 'https://part-search.elimfilters.com',
    label: 'Part Search',
    description: 'Connect the engineering path to OEM, competitor, dimensional, and application references.',
    external: true,
  },
};

function navigationFor(pathname: string): { eyebrow: string; title: string; items: NavItem[] } | null {
  if (pathname.startsWith('/families/')) {
    return {
      eyebrow: 'CONTINUE THROUGH THE PLATFORM',
      title: 'From product family to complete asset protection.',
      items: [COMMON.systems, COMMON.technologies, COMMON.knowledge, COMMON.search],
    };
  }

  if (pathname.startsWith('/systems/')) {
    return {
      eyebrow: 'NEXT ENGINEERING PATH',
      title: 'Connect the protection system to products and operating context.',
      items: [COMMON.families, COMMON.technologies, COMMON.industries, COMMON.search],
    };
  }

  if (pathname.startsWith('/technologies/')) {
    return {
      eyebrow: 'RELATED PLATFORM PATHS',
      title: 'Connect the technology to systems, products, and field application.',
      items: [COMMON.systems, COMMON.families, COMMON.industries, COMMON.knowledge],
    };
  }

  if (pathname.startsWith('/industries/')) {
    return {
      eyebrow: 'CONTINUE THE PROTECTION STRATEGY',
      title: 'Move from operating environment to the correct protection architecture.',
      items: [COMMON.systems, COMMON.families, COMMON.technologies, COMMON.search],
    };
  }

  if (pathname.startsWith('/knowledge-system/')) {
    return {
      eyebrow: 'APPLY THE KNOWLEDGE',
      title: 'Turn technical understanding into a protection decision.',
      items: [COMMON.systems, COMMON.families, COMMON.technologies, COMMON.search],
    };
  }

  return null;
}

export function UniversalEndNavigation() {
  const pathname = usePathname();
  const config = navigationFor(pathname);

  if (!config) return null;

  return (
    <nav className="universal-end-nav" aria-label="Continue through the ELIMFILTERS platform">
      <div className="universal-end-nav__inner">
        <p className="universal-end-nav__eyebrow">{config.eyebrow}</p>
        <h2 className="universal-end-nav__title">{config.title}</h2>
        <div className="universal-end-nav__grid">
          {config.items.map((item) => {
            const content = (
              <>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
                <small>EXPLORE →</small>
              </>
            );

            return item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="universal-end-nav__card">
                {content}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="universal-end-nav__card">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
