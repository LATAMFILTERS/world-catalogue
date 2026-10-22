# Restore four missing air and hydraulic product pages

EA10960, EA18678, EA18905 and EH61454 are active, certified catalogue records missing from the public static snapshot. Add their governed records and sitemap entries, preserving all 161 pre-existing records. The new snapshot contains 165 products.

Exact manufacturer captures classify EA10960/P770960 and EA18678/P158678 as safety elements (secondary-air), EA18905/P778905 as a primary element (primary-air), and EH61454/P171454 as a hydraulic cartridge (hydraulic-filters). Existing application payloads agree with their exact source captures. The exporter still requires separate application-publication evidence, so these additions publish no application or engine claims. An empty captured application list is not an absence claim.

The publication gate initially rejected missing specifications. Explicit Inner Diameter labels supplied 74.47, 91.2, 130.9 and 56.26 mm respectively; no gasket dimension was inferred. These are manufacturer reference dimensions, not measurements or performance tests of ELIMFILTERS products. Performance publication remains disabled.

Reference classification and certification passed native 093/resolver-v7 and 273 controls, complete rollback and post-commit verification. Catalogue applications and identity fields were preserved. Other cases with inherited or unreconciled applications retain explicit manual holds and are excluded.

The adjacent evidence file records exact source hashes, component roles, scoped backups and restoration probes. Reverting this publication change removes four static additions without reversing the separately backed-up catalogue repairs. No redirects or 301 changes are included.

Validation on the initial three additions: 12 publication-evidence tests, frontend typecheck, full prebuild, webpack build and postbuild passed; 164 product pages validated and SEO/GEO/AEO scored 100/100. All three preview URLs returned HTTP200 with correct production canonical and Product JSON-LD. The fourth addition passes the unchanged governed exporter; the updated four-product head requires fresh build and deployment checks. After independent review and merge, verify all four production URLs before calling publication complete.
