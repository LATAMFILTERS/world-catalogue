import type { Metadata } from 'next';
import { MarineIndustryPage } from '@/components/MarineIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/marine/';
export const metadata: Metadata = { title: "Filtração marítima e separação de água | ELIMFILTERS", description: "Controle de contaminação para embarcações, motores marítimos, propulsão, convés, combustível e hidráulica.", alternates: { canonical, languages: languageAlternates('/industries/marine') }, openGraph: { title: "Filtração marítima e separação de água | ELIMFILTERS", description: "Controle de contaminação para embarcações, motores marítimos, propulsão, convés, combustível e hidráulica.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function MarineLocalizedPage() { return <MarineIndustryPage lang="pt" />; }
