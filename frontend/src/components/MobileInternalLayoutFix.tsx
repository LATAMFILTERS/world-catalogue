'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MOBILE_QUERY = '(max-width: 860px)';

export function MobileInternalLayoutFix() {
  const pathname = usePathname();

  useEffect(() => {
    const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';
    const matchesRoute = (segment: string) =>
      normalizedPath === `/${segment}` ||
      normalizedPath.endsWith(`/${segment}`) ||
      normalizedPath.includes(`/${segment}/`);

    const isAbout = matchesRoute('about');
    const isTechnologies = matchesRoute('technologies');
    const isIndustries = matchesRoute('industries');
    const isSystems = matchesRoute('systems');

    // Technology detail pages now carry route-specific responsive layouts.
    // Do not run this legacy generic DOM mutator on /technologies/* because it
    // rewrites authored grid, width, media and section geometry at runtime.
    const isTarget = !isTechnologies && (isAbout || isIndustries || isSystems);

    const applyFixes = () => {
      const main = document.querySelector<HTMLElement>('main');
      if (!main || !window.matchMedia(MOBILE_QUERY).matches || !isTarget) return;

      main.classList.toggle('about-page-mobile-fix', isAbout);
      main.classList.remove('technologies-page-mobile-fix');
      main.classList.toggle('industries-page-mobile-fix', isIndustries);
      main.classList.toggle('systems-page-mobile-fix', isSystems);
      main.style.width = '100%';
      main.style.maxWidth = '100%';
      main.style.overflowX = 'clip';

      main.querySelectorAll<HTMLElement>('section').forEach((section, index) => {
        section.style.width = '100%';
        section.style.maxWidth = '100vw';
        section.style.overflowX = 'clip';
        section.style.boxSizing = 'border-box';
        if (index > 0) {
          section.style.height = 'auto';
          section.style.minHeight = 'auto';
        }
      });

      main.querySelectorAll<HTMLElement>('div, ul, ol').forEach((element) => {
        const computed = window.getComputedStyle(element);
        element.style.maxWidth = '100%';
        element.style.minWidth = '0';
        element.style.boxSizing = 'border-box';

        if (computed.display === 'grid' && computed.gridTemplateColumns !== 'none') {
          element.style.gridTemplateColumns = 'minmax(0, 1fr)';
          element.style.width = '100%';
        }

        if (computed.display === 'flex' && computed.flexWrap === 'nowrap' && element.scrollWidth > window.innerWidth) {
          element.style.flexWrap = 'wrap';
        }
      });

      main.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, a, span, li, button').forEach((element) => {
        element.style.maxWidth = '100%';
        element.style.minWidth = '0';
        element.style.whiteSpace = 'normal';
        element.style.wordBreak = 'normal';
        element.style.overflowWrap = 'break-word';
        element.style.hyphens = 'none';
        element.style.boxSizing = 'border-box';
      });

      main.querySelectorAll<HTMLElement>('img, video, svg, canvas').forEach((element) => {
        element.style.maxWidth = '100%';
        element.style.height = 'auto';
      });

      if (isAbout) {
        main.querySelectorAll<HTMLElement>('div').forEach((element) => {
          const first = element.firstElementChild?.textContent?.trim();
          if (first && ['01', '02', '03', '04'].includes(first) && element.children.length === 3) {
            element.classList.add('about-failure-row-mobile');
          }
        });
      }
    };

    applyFixes();
    window.addEventListener('resize', applyFixes);
    const observer = new MutationObserver(applyFixes);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', applyFixes);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <style>{`
      @media (max-width: 860px) {
        .about-page-mobile-fix,
        .industries-page-mobile-fix,
        .systems-page-mobile-fix {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: clip !important;
        }

        .industries-page-mobile-fix section,
        .systems-page-mobile-fix section {
          width: 100% !important;
          max-width: 100vw !important;
          min-height: auto !important;
          height: auto !important;
          overflow-x: clip !important;
          box-sizing: border-box !important;
        }

        .industries-page-mobile-fix section > div,
        .systems-page-mobile-fix section > div,
        .industries-page-mobile-fix div > *,
        .systems-page-mobile-fix div > * {
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .industries-page-mobile-fix div[style*="display: grid"],
        .systems-page-mobile-fix div[style*="display: grid"],
        .industries-page-mobile-fix ul,
        .systems-page-mobile-fix ul {
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .industries-page-mobile-fix h1,
        .industries-page-mobile-fix h2,
        .industries-page-mobile-fix h3,
        .systems-page-mobile-fix h1,
        .systems-page-mobile-fix h2,
        .systems-page-mobile-fix h3 {
          max-width: 100% !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
          hyphens: none !important;
          text-wrap: balance;
        }

        .industries-page-mobile-fix h1,
        .systems-page-mobile-fix h1 {
          font-size: clamp(2.2rem, 10vw, 3.4rem) !important;
          line-height: 1 !important;
        }

        .industries-page-mobile-fix h2,
        .systems-page-mobile-fix h2 {
          font-size: clamp(1.8rem, 8vw, 2.8rem) !important;
          line-height: 1.03 !important;
        }

        .industries-page-mobile-fix p,
        .systems-page-mobile-fix p {
          width: 100% !important;
          max-width: 100% !important;
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
        }

        .industries-page-mobile-fix img,
        .systems-page-mobile-fix img,
        .industries-page-mobile-fix video,
        .systems-page-mobile-fix video {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
        }
      }

      @media (max-width: 430px) {
        .industries-page-mobile-fix section,
        .systems-page-mobile-fix section {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
      }
    `}</style>
  );
}
