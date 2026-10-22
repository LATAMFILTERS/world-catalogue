import FAQHub, { faqMetadata } from '@/app/knowledge-center/faq/FAQHub';

export const metadata = faqMetadata('es');

export default function FAQHubPage() {
  return <FAQHub lang="es" />;
}
