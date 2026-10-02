'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { LanguageMenu } from './LanguageMenu';
import { languageMenuCount, subscribeLanguageMenus } from '@/lib/language-menu-registry';

/**
 * Fixed top-right globe for pages that have no header of their own with a language menu
 * (engineering, legal, 404, ...). It renders only when no other menu is mounted, after a
 * short settle delay so a route change does not flash it between the old and new page.
 */
export function GlobalLanguageMenu() {
  const pathname = usePathname();
  const menus = useSyncExternalStore(subscribeLanguageMenus, languageMenuCount, () => 1);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    const timer = window.setTimeout(() => setSettled(true), 150);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!settled || menus > 0) return null;

  return (
    <div
      style={{ position: 'fixed', top: 'calc(1rem + env(safe-area-inset-top, 0px))', right: 'clamp(0.75rem, 4vw, 4rem)', zIndex: 90, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '0 0.2rem' }}
    >
      <LanguageMenu registers={false} />
    </div>
  );
}
