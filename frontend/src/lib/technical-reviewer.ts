// Shared schema.org Person reference for the named human technical reviewer
// attributed on ELIMFILTERS technology (TechArticle) pages.
export const TECHNICAL_REVIEWER = {
  '@type': 'Person',
  '@id': 'https://elimfilters.com/about/leadership/#victor-abreu',
  name: 'Víctor Abreu',
  jobTitle: 'Founder & CEO, ELIMFILTERS',
  url: 'https://elimfilters.com/about/leadership/',
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'UCAT' },
    { '@type': 'CollegeOrUniversity', name: 'Universidad Rafael Belloso Chacín (URBE)' },
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'Public Accounting' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MBA (Master of Business Administration)' },
  ],
} as const;
