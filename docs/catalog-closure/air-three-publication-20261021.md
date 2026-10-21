# Restore three missing air-element product pages

EA10960, EA18678 and EA18905 are active, certified catalogue records whose public product URLs return HTTP404. Add their governed records and sitemap entries while preserving all 161 existing records.

The exact manufacturer capture identifies EA10960/P770960 and EA18678/P158678 as safety elements, assigned to secondary-air. EA18905/P778905 is a primary element, assigned to primary-air. Existing catalogue applications match each exact archived source payload; independent application-publication evidence is still required, so the exporter publishes no application or engine claims. Performance publication remains disabled.

The publication gate initially rejected missing specifications. Body inner diameters were restored from explicit Inner Diameter labels on the exact hash-bound Donaldson records: 74.47, 91.2 and 130.9 mm respectively. No gasket dimension was inferred. The existing exporter then accepted the complete records without policy changes.

Reference classification and certification passed native 093/resolver-v7 and 273 controls, full rollback and post-commit verification. Existing manual holds remain in force, including three different assembly SKUs with inherited applications awaiting independent reconciliation. Those assemblies are excluded from this publication.

The adjacent evidence file records exact source hashes, component roles, scoped backups and verified restoration probes. Revert this publication commit to remove these three additions; database corrections have separate scoped backups. No redirect or 301 change is part of this PR.

After independent review, merge and deployment, verify all three URLs return HTTP200 with self canonical and matching Product JSON-LD. They are not published until that verification passes.
