'use client';

import React from 'react';

export interface ArticleLayoutProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  sidebarWidth?: string;
}

export default function ArticleLayout({
  sidebar,
  children,
  maxWidth = '1200px',
  sidebarWidth = '280px',
}: ArticleLayoutProps) {
  return (
    <>
      <div
        className="kc-article-layout"
        style={{
          maxWidth,
          margin: '0 auto',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
          gridTemplateColumns: sidebar ? `minmax(0, 1fr) ${sidebarWidth}` : '1fr',
        }}
      >
        <div className="kc-article-main">{children}</div>
        {sidebar && (
          <aside className="kc-article-sidebar">
            {sidebar}
          </aside>
        )}
      </div>

      <style jsx>{`
        .kc-article-layout {
          display: grid;
          gap: 3rem;
          align-items: start;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .kc-article-main {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .kc-article-sidebar {
          position: sticky;
          top: 4rem;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        @media (max-width: 860px) {
          .kc-article-layout {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 2.5rem;
            padding: 2.25rem 1rem 3.5rem !important;
          }

          .kc-article-main,
          .kc-article-sidebar {
            grid-column: 1 / -1;
            width: 100%;
            min-width: 0;
            max-width: 100%;
          }

          .kc-article-sidebar {
            position: static;
            top: auto;
            margin-top: 1rem;
          }
        }

        @media (max-width: 430px) {
          .kc-article-layout {
            gap: 2rem;
            padding: 2rem 1rem 3rem !important;
          }
        }
      `}</style>
    </>
  );
}
