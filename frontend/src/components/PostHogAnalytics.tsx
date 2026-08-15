'use client';

import { useEffect } from 'react';

type PostHogClient = {
  init?: (
    key: string,
    options: {
      api_host: string;
      autocapture: boolean;
      sessionRecording: boolean;
    }
  ) => void;
};

export default function PostHogAnalytics() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  useEffect(() => {
    if (typeof window === 'undefined' || !posthogKey) return;

    const script = document.createElement('script');
    script.src = `${posthogHost}/static/js/web.js`;
    script.async = true;
    script.onload = () => {
      const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
      posthog?.init?.(posthogKey, {
        api_host: posthogHost,
        autocapture: true,
        sessionRecording: false,
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [posthogKey, posthogHost]);

  if (!posthogKey) {
    console.warn('PostHog API key not configured. Set NEXT_PUBLIC_POSTHOG_KEY environment variable.');
    return null;
  }

  return null;
}
