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
    <div style={{
      maxWidth,
      margin: '0 auto',
      padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
      display: 'grid',
      gridTemplateColumns: sidebar ? `minmax(0, 1fr) ${sidebarWidth}` : '1fr',
      gap: '3rem',
      alignItems: 'start',
    }}>
      <div>{children}</div>
      {sidebar && (
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}
