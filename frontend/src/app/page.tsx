import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { en: '/', es: '/es/', 'x-default': '/' },
  },
};

export default function Page() {
  return <HomePage />;
}
