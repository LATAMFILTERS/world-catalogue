import FAQHub, { faqMetadata } from '@/app/knowledge-center/faq/FAQHub';

export const metadata = faqMetadata('pt');

export default function FAQHubPage() {
  return <FAQHub lang="pt" />;
}
