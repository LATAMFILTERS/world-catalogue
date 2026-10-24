import type { Metadata } from 'next';
import { PowerGenerationIndustryPage } from '@/components/PowerGenerationIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/power-generation/';
export const metadata: Metadata = { title: "Filtração e manutenção de geradores | ELIMFILTERS", description: "Proteção de combustível diesel, ar e lubrificação para engenheiros e técnicos de manutenção de grupos geradores de reserva e potência principal.", alternates: { canonical, languages: languageAlternates('/industries/power-generation') }, openGraph: { title: "Filtração e manutenção de geradores | ELIMFILTERS", description: "Proteção de combustível diesel, ar e lubrificação para engenheiros e técnicos de manutenção de grupos geradores de reserva e potência principal.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function PowerGenerationLocalizedPage() { return <PowerGenerationIndustryPage lang="pt" />; }
