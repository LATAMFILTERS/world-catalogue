import FAQHub, { faqMetadata } from './FAQHub';

export const metadata = faqMetadata('en');

export default function FAQHubPage() {
  return <FAQHub lang="en" />;
}
