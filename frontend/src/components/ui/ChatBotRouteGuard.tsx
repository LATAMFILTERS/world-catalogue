'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatBot from '@/components/ui/ChatBot';

const MOBILE_BREAKPOINT = 768;

export default function ChatBotRouteGuard() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  if (pathname === '/instagram' && isMobile) {
    return null;
  }

  return <ChatBot />;
}
