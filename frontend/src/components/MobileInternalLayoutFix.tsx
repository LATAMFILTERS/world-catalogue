'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MobileInternalLayoutFix() {
  const pathname = usePathname();

  useEffect(() => {
    const applyClasses = () => {
      const main = document.querySelector('main');
      if (!main) return;

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
      }

      if (pathname === '/technologies' || pathname === '/technologies/') {
        main.classList.add('technologies-page-mobile-fix');
      }
    };

    applyClasses();
    const observer = new MutationObserver(applyClasses);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <style>{`
      @media (max-width: 860px) {
        .about-page-mobile-fix,
        .technologies-page-mobile-fix {
          overflow-x: clip !important;
        }

        .about-page-mobile-fix section,
        .technologies-page-mobile-fix section {
          max-width: 100vw !important;
          overflow-x: clip !important;
        }

        .about-failure-row-mobile {
          grid-template-columns: 44px minmax(0, 1fr) !important;
          column-gap: 1rem !important;
          row-gap: 0.85rem !important;
          padding: 1.4rem 0 !important;
          align-items: start !important;
        }

        .about-failure-row-mobile > h3 {
          min-width: 0 !important;
          max-width: 100% !important;
          font-size: clamp(1.15rem, 5.6vw, 1.5rem) !important;
          line-height: 1.08 !important;
          overflow-wrap: normal !important;
          word-break: normal !important;
          hyphens: none !important;
        }

        .about-failure-row-mobile > p {
          grid-column: 1 / -1 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          font-size: 1rem !important;
          line-height: 1.72 !important;
          text-align: left !important;
          overflow-wrap: normal !important;
          word-break: normal !important;
          hyphens: none !important;
        }

        .about-technology-layout-mobile {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 2rem !important;
          width: 100% !important;
        }

        .about-technology-layout-mobile > * {
          min-width: 0 !important;
          width: 100% !important;
        }

        .about-technology-cards-mobile {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.8rem !important;
          width: 100% !important;
        }

        .about-technology-cards-mobile > a {
          width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .about-page-mobile-fix h1,
        .about-page-mobile-fix h2,
        .about-page-mobile-fix h3,
        .technologies-page-mobile-fix h1,
        .technologies-page-mobile-fix h2,
        .technologies-page-mobile-fix h3 {
          overflow-wrap: normal !important;
          word-break: normal !important;
          hyphens: none !important;
          text-wrap: balance;
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
          max-width: 100% !important;
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

        .technologies-page-mobile-fix h2 {
          font-size: clamp(1.65rem, 8.1vw, 2.3rem) !important;
        }
      }
    `}</style>
  );
}
