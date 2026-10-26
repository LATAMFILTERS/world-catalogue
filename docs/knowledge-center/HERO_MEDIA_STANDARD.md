# ELIMFILTERS Knowledge Center · Hero media standard

Applies to editorial hubs and individual pages, in English, Spanish and Portuguese.

1. **Distinct media per page:** A hero image must not be reused on another distinct Knowledge Center page or previously assigned site page. Language variants of the *same* page must use the same hero asset.
2. **Quality before zoom:** Determine intrinsic pixel size, source image clarity, rendered area and focal point before choosing `cover`. If source cannot withstand the crop, use an approved higher-resolution, page-specific asset. Do not stretch or enlarge a low-resolution image.
3. **Composition:** Set focal point per asset. Keep space for text and meaningful visual context. Avoid a single global focus setting or unnecessary CSS transforms/zoom.
4. **Responsive inspection:** Check desktop, tablet and mobile screenshots; verify headline readability, crop, subject visibility, and no visual duplication.
5. **Technical relevance:** Visual media must represent the system, mechanism, test or industrial application actually discussed. Never use a generic unrelated image to fill a hero.
6. **Localization:** Preserve the same photographic subject across EN/ES/PT of the same page and provide localized accessible description where required.
7. **Release gate:** Maintain a route-to-asset inventory. Run `node scripts/audit-kc-hero-image-reuse.cjs --out=artifacts/kc-hero-reuse.json` for an advisory report; review collisions, including assets used outside `heroBackgroundImage`. Strict mode fails for any source-level duplicate hero assignment.

The source scanner does **not** prove unique imagery site-wide or sufficient resolution. Those require complete asset inventory and visual checks.
