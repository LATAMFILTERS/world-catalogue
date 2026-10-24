import type { Metadata } from 'next';
import { MarineIndustryPage } from '@/components/MarineIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/marine/';
export const metadata: Metadata = { title: "Filtração marítima para proprietários e engenheiros | ELIMFILTERS", description: "Filtração para proprietários, engenheiros e técnicos de manutenção naval: motores de propulsão, diesel, hidráulica de convés e sistemas auxiliares.", alternates: { canonical, languages: languageAlternates('/industries/marine') }, openGraph: { title: "Filtração marítima para proprietários e engenheiros | ELIMFILTERS", description: "Filtração para proprietários, engenheiros e técnicos de manutenção naval: motores de propulsão, diesel, hidráulica de convés e sistemas auxiliares.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function MarineLocalizedPage() { return <MarineIndustryPage lang="pt" />; }
