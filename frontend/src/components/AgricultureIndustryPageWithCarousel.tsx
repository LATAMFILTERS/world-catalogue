import { AgricultureIndustryPage } from './AgricultureIndustryPage';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

export function AgricultureIndustryPageWithCarousel() {
  return (
    <>
      <AgricultureIndustryPage />
      <IndustryFilterCarousel dutyClass="HD" industryName="Agriculture" />
    </>
  );
}
