import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Distribuidor ELIMFILTERS | Programa de Parceiros Comerciais',
  description: 'Solicite a avaliação da sua empresa como parceiro comercial ou distribuidor da ELIMFILTERS, plataforma de proteção de ativos industriais.',
  alternates: { canonical: 'https://elimfilters.com/pt/distributor-application/', languages: languageAlternates('/distributor-application') },
};

export default function DistributorApplicationLayoutPt({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
