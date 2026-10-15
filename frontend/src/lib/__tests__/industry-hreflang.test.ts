import { describe, expect, it } from 'vitest';
import { generateMetadata } from '../../app/industries/[slug]/page';
import { languageAlternates } from '../localized-routes';
describe('English industry reciprocal language metadata', () => {
  for (const slug of ['mining','agriculture','manufacturing','railway','bus-coach','waste-municipal','automotive','trucks-fleets','power-generation','marine','oil-gas','construction']) {
    it(slug + ' declares all published language twins', async () => {
      const metadata=await generateMetadata({params:Promise.resolve({slug})});
      expect(metadata.alternates?.canonical).toBe(`https://elimfilters.com/industries/${slug}/`);
      expect(metadata.alternates?.languages).toEqual(languageAlternates(`/industries/${slug}`));
    });
  }
});
