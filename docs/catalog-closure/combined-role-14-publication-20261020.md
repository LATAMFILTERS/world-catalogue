# Restore 14 missing hydraulic product pages

Fourteen active hydraulic SKUs passed documentary catalogue closure but their public product URLs return 404. Add their governed static records and sitemap entries so the existing product route can generate them.

Preserve all 147 previous records. The native exporter suppresses applications without independent application evidence; all 14 additions have empty published application arrays. Performance publication stays disabled. No redirects, runtime configuration or catalogue rules change.

Each source is the existing hash-bound Donaldson capture for that exact canonical part. The 14 catalogue records passed native 093v7 and 273 checks after resolving 37 reference-role duplicates, with full rollback and post-commit comparisons. EH63596's missing 43 mm body inner diameter was independently restored from its exact published source before export. These are documentary catalogue checks, with no claim of physical ELIMFILTERS testing.

Validation: 12 existing application-publication tests pass; frontend typecheck passes; all prebuild gates pass. Default Turbopack fails on the local external node_modules junction; the unchanged project builds successfully with `next build --webpack`. All 14 generated HTML files have their exact SKU, canonical URL and Product JSON-LD. Full postbuild passes, including product validation for all 161 records and SEO/GEO/AEO closure 100/100.

Production HTTP is still 404 until reviewed merge and deployment. Mandatory review is retained; the separate legacy 301 Worker access failure is not changed by this PR.


## Evidence

The adjacent `combined-role-14-publication-evidence-20261020.json` records all 14 exact canonical codes, source file/record hashes, role-source URLs and hashes, native check results, rollback and post-commit verification.

Static file backup SHA256: `de6bc799e32c187b6b40ae5bd6c7e6d4e6b2283c00febc20d3655fb182350bf3`. Both original files were restored byte for byte in separate probes before modification. Existing 147 records are unchanged. Revert the publication commit to remove these additions; this does not reverse catalogue corrections.

## Production gate

After independent review, merge and deployment, GET each new `/products/<sku>/` URL and require HTTP200, exact SKU, self canonical and matching Product JSON-LD. Before deployment all 14 return404. None of these new pages creates or replaces the separately blocked301 Worker.
