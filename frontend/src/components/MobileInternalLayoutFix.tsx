'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MobileInternalLayoutFix() {
  const pathname = usePathname();

  useEffect(() => {
    const applyClasses = () => {
      const main = document.querySelector('main');
      if (!main) return;

      const isMobile = window.matchMedia('(max-width: 860px)').matches;

      if (pathname === '/about' || pathname === '/about/') {
        main.classList.add('about-page-mobile-fix');

        main.querySelectorAll<HTMLElement>('div').forEach((element) => {
          const first = element.firstElementChild?.textContent?.trim();
          if (first && ['01', '02', '03', '04'].includes(first) && element.children.length === 3) {
            element.classList.add('about-failure-row-mobile');
          }
        });

        main.querySelectorAll<HTMLElement>('p').forEach((element) => {
          if (element.textContent?.trim() === 'TECHNOLOGY PORTFOLIO') {
            const section = element.closest('section');
            section?.classList.add('about-technology-section-mobile');
            const layout = section?.querySelector<HTMLElement>(':scope > div');
            layout?.classList.add('about-technology-layout-mobile');
            const cards = layout?.children.item(1) as HTMLElement | null;
            cards?.classList.add('about-technology-cards-mobile');
          }
        });

        if (isMobile) {
          main.querySelectorAll<HTMLElement>('section').forEach((section, index) => {
            section.style.maxWidth = '100%';
            section.style.overflowX = 'clip';
            section.style.boxSizing = 'border-box';
            if (index > 0) {
              section.style.minHeight = 'auto';
              section.style.height = 'auto';
            }
          });

          main.querySelectorAll<HTMLElement>('div').forEach((element) => {
            const columns = element.style.gridTemplateColumns;
            if (columns && columns !== 'none') {
              element.style.gridTemplateColumns = 'minmax(0, 1fr)';
              element.style.width = '100%';
              element.style.maxWidth = '100%';
              element.style.minWidth = '0';
            }
          });

          main.querySelectorAll<HTMLElement>('h1, h2, h3, p, a, span').forEach((element) => {
            element.style.maxWidth = '100%';
            element.style.minWidth = '0';
            element.style.wordBreak = 'normal';
            element.style.overflowWrap = 'break-word';
            element.style.whiteSpace = 'normal';
            element.style.boxSizing = 'border-box';
          });
        }
      }

      if (pathname === '/technologies' || pathname === '/technologies/') {
        main.classList.add('technologies-page-mobile-fix');
      }
    };

    applyClasses();
    window.addEventListener('resize', applyClasses);
    const observer = new MutationObserver(applyClasses);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', applyClasses);
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
          overflow-x: clip !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix section:not(:first-of-type) {
          min-height: auto !important;
          height: auto !important;
        }

        .about-page-mobile-fix section > div,
        .technologies-page-mobile-fix section > div {
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
          gap: 1.5rem !important;
        }

        .about-page-mobile-fix div[style*="display: flex"],
        .technologies-page-mobile-fix div[style*="display: flex"] {
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .about-page-mobile-fix div[style*="grid-template-columns"] > *,
        .technologies-page-mobile-fix div[style*="grid-template-columns"] > *,
        .about-page-mobile-fix div[style*="display: flex"] > *,
        .technologies-page-mobile-fix div[style*="display: flex"] > * {
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix p,
        .technologies-page-mobile-fix p {
          width: 100% !important;
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: break-word !important;
          word-break: normal !important;
          hyphens: none !important;
        }

        .about-failure-row-mobile {
          display: grid !important;
          grid-template-columns: 44px minmax(0, 1fr) !important;
          column-gap: 1rem !important;
          row-gap: 0.85rem !important;
          padding: 1.4rem 0 !important;
          align-items: start !important;
          min-height: auto !important;
          height: auto !important;
        }

        .about-failure-row-mobile > h3 {
          min-width: 0 !important;
          max-width: 100% !important;
          font-size: clamp(1.15rem, 5.6vw, 1.5rem) !important;
          line-height: 1.08 !important;
        }

        .about-failure-row-mobile > p {
          grid-column: 1 / -1 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          font-size: 1rem !important;
          line-height: 1.72 !important;
          text-align: left !important;
        }

        .about-technology-layout-mobile,
        .about-technology-cards-mobile {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .about-technology-layout-mobile {
          gap: 2rem !important;
        }

        .about-technology-cards-mobile {
          gap: 0.8rem !important;
        }

        .about-technology-layout-mobile > *,
        .about-technology-cards-mobile > a {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix h1,
        .about-page-mobile-fix h2,
        .about-page-mobile-fix h3,
        .technologies-page-mobile-fix h1,
        .technologies-page-mobile-fix h2,
        .technologies-page-mobile-fix h3 {
          max-width: 100% !important;
          overflow-wrap: normal !important;
          word-break: normal !important;
          hyphens: none !important;
          text-wrap: balance;
        }

        .about-page-mobile-fix h2 {
          font-size: clamp(1.9rem, 9vw, 2.8rem) !important;
          line-height: 1 !important;
        }

        .technologies-page-mobile-fix h2 {
          font-size: clamp(1.8rem, 8.6vw, 2.7rem) !important;
          line-height: 0.98 !important;
          letter-spacing: -0.035em !important;
        }

        .technologies-page-mobile-fix p {
          max-width: 38rem !important;
          line-height: 1.7 !important;
          text-align: left !important;
        }

        .technologies-page-mobile-fix img,
        .technologies-page-mobile-fix video,
        .about-page-mobile-fix img,
        .about-page-mobile-fix video {
          display: block !important;
          width: auto !important;
          max-width: 100% !important;
          height: auto !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
      }

      @media (max-width: 430px) {
        .about-page-mobile-fix section,
        .technologies-page-mobile-fix section {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        .about-page-mobile-fix div[style*="display: grid"],
        .technologies-page-mobile-fix div[style*="display: grid"] {
          gap: 1.2rem !important;
        }

        .about-page-mobile-fix h2,
        .technologies-page-mobile-fix h2 {
          font-size: clamp(1.65rem, 8.1vw, 2.3rem) !important;
        }
      }
    `}</style>
  );
}
