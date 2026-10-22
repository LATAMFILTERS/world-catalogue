import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Distribuidor ELIMFILTERS | Programa de Socios Comerciales',
  description: 'Solicite la evaluación de su empresa como socio comercial o distribuidor de ELIMFILTERS, plataforma de protección de activos industriales.',
  alternates: { canonical: 'https://elimfilters.com/es/distributor-application/', languages: languageAlternates('/distributor-application') },
};

export default function DistributorApplicationLayoutEs({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
