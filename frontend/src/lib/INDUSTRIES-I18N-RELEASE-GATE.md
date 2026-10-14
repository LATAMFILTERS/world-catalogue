# Internationalization release gate — Industries

**Status: IN PROGRESS; NOT RELEASE READY.**

- Existing `frontend/src/i18n.ts`, `i18n-locales.ts` and `localized-routes.ts` are reused.
- The index has shared ES/PT editorial strings and matching static route files.
- Mining has its own translations for 124 editorial strings. **Mining localized routes are deliberately not advertised yet**, because the embedded `IndustryFilterCarousel` and additional metadata/links must be localized before release.
- The remaining 11 industry components have not been translated.
- Keep `/es/industries/[slug]` and `/pt/industries/[slug]` out of the sitemap/hreflang until all their content is translated and the route exists.
- Required before release: TypeScript, lint, Next static export, inspection of generated ES/PT HTML including lang/canonical, navigation and accessibility, all 12 industry child pages per language, and visual checks.
- **Do not merge this branch just because the translated index routes exist**; that would leave a mixed-language experience at child navigation.

The workflow `.github/workflows/cloudflare-pages.yml` currently deploys `public/**`, not `frontend/src/**`. A merge does not independently prove the user-facing site was deployed. Trace the real build/deploy path, and verify production URLs after a controlled release.
