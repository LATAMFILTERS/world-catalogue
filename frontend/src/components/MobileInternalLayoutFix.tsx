'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MOBILE_QUERY = '(max-width: 860px)';

export function MobileInternalLayoutFix() {
  const pathname = usePathname();

  useEffect(() => {
    const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';
    const isAbout = normalizedPath === '/about' || normalizedPath.endsWith('/about');
    const isTechnologies =
      normalizedPath === '/technologies' || normalizedPath.endsWith('/technologies');

    const applyFixes = () => {
      const main = document.querySelector<HTMLElement>('main');
      if (!main || !window.matchMedia(MOBILE_QUERY).matches) return;

      if (!isAbout && !isTechnologies) return;

      main.classList.toggle('about-page-mobile-fix', isAbout);
      main.classList.toggle('technologies-page-mobile-fix', isTechnologies);
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

      main.querySelectorAll<HTMLElement>('div').forEach((element) => {
        const computed = window.getComputedStyle(element);
        if (computed.display === 'grid' && computed.gridTemplateColumns !== 'none') {
          element.style.gridTemplateColumns = 'minmax(0, 1fr)';
          element.style.width = '100%';
          element.style.maxWidth = '100%';
          element.style.minWidth = '0';
        }

        if (computed.display === 'flex') {
          element.style.maxWidth = '100%';
          element.style.minWidth = '0';
          if (computed.flexWrap === 'nowrap' && element.scrollWidth > window.innerWidth) {
            element.style.flexWrap = 'wrap';
          }
        }
      });

      main.querySelectorAll<HTMLElement>('h1, h2, h3, p, a, span').forEach((element) => {
        element.style.maxWidth = '100%';
        element.style.minWidth = '0';
        element.style.whiteSpace = 'normal';
        element.style.wordBreak = 'normal';
        element.style.overflowWrap = 'break-word';
        element.style.hyphens = 'none';
        element.style.boxSizing = 'border-box';
      });

      if (isAbout) {
        main.querySelectorAll<HTMLElement>('div').forEach((element) => {
          const first = element.firstElementChild?.textContent?.trim();
          if (first && ['01', '02', '03', '04'].includes(first) && element.children.length === 3) {
            element.classList.add('about-failure-row-mobile');
          }
        });

        main.querySelectorAll<HTMLElement>('p').forEach((element) => {
          if (element.textContent?.trim() === 'TECHNOLOGY PORTFOLIO') {
            const section = element.closest('section');
            const layout = section?.querySelector<HTMLElement>(':scope > div');
            const cards = layout?.children.item(1) as HTMLElement | null;
            section?.classList.add('about-technology-section-mobile');
            layout?.classList.add('about-technology-layout-mobile');
            cards?.classList.add('about-technology-cards-mobile');
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
        .technologies-page-mobile-fix {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: clip !important;
        }

        .about-page-mobile-fix section,
        .technologies-page-mobile-fix section {
          width: 100% !important;
          max-width: 100vw !important;
          min-height: auto !important;
          height: auto !important;
          overflow-x: clip !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix section > div,
        .technologies-page-mobile-fix section > div,
        .about-page-mobile-fix div > *,
        .technologies-page-mobile-fix div > * {
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix div[style*="display: grid"],
        .technologies-page-mobile-fix div[style*="display: grid"] {
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          gap: 1.25rem !important;
        }

        .about-page-mobile-fix p,
        .technologies-page-mobile-fix p {
          width: 100% !important;
          max-width: 100% !important;
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          hyphens: none !important;
        }

        .about-failure-row-mobile {
          display: grid !important;
          grid-template-columns: 44px minmax(0, 1fr) !important;
          column-gap: 1rem !important;
          row-gap: 0.9rem !important;
          padding: 1.4rem 0 !important;
          min-height: auto !important;
          height: auto !important;
          align-items: start !important;
        }

        .about-failure-row-mobile > h3 {
          font-size: clamp(1.15rem, 5.6vw, 1.5rem) !important;
          line-height: 1.08 !important;
        }

        .about-failure-row-mobile > p {
          grid-column: 1 / -1 !important;
          width: 100% !important;
          margin: 0 !important;
          font-size: 1rem !important;
          line-height: 1.7 !important;
          text-align: left !important;
        }

        .about-technology-layout-mobile,
        .about-technology-cards-mobile {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .about-technology-layout-mobile { gap: 2rem !important; }
        .about-technology-cards-mobile { gap: 0.8rem !important; }

        .about-page-mobile-fix h1,
        .about-page-mobile-fix h2,
        .about-page-mobile-fix h3,
        .technologies-page-mobile-fix h1,
        .technologies-page-mobile-fix h2,
        .technologies-page-mobile-fix h3 {
          max-width: 100% !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
          hyphens: none !important;
          text-wrap: balance;
        }

        .about-page-mobile-fix h2,
        .technologies-page-mobile-fix h2 {
          font-size: clamp(1.65rem, 8.1vw, 2.8rem) !important;
          line-height: 1 !important;
        }
      }

      @media (max-width: 430px) {
        .about-page-mobile-fix section,
        .technologies-page-mobile-fix section {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
      }
    `}</style>
  );
}
