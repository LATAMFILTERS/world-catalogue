# MANN patch source semantics

The legacy specification generator mapped CU to engine air and interpreted anonymous A/B/C dimensions as diameter or gasket sizes. This conflicts with the official CU26021 and CUK24021 cabin pages, where A/B are length/width. The historical CUK24021 patch also names an EA product and assigns rectangular dimensions to diameter/gasket columns. These findings identify unsafe transformations; they do not establish the history of every production row.

CU now belongs to the cabin family. An explicit type that conflicts with the inferred source family causes the record to be skipped. Unknown explicit types are not silently overridden. Cabin Air Filter is accepted as the cabin label.

The dimension mapper accepts only explicit semantic labels, height/H and literal thread/G. Anonymous A/B/C, unqualified inner diameter, panel length/width and other unsupported labels reject the entire record for semantic review. Skipping the complete record avoids emitting a partial patch with invented meanings. This deliberately reduces generated output until product-specific geometry is reviewed; it does not guess missing meanings or erase existing fields.

The program entry is now guarded, allowing pure helper tests without reading master files or rewriting the historical patch. Three focused tests cover cabin identity, type conflicts, rectangular and circular ambiguity, and explicit diameter/gasket/thread fields.

No generator/importer was executed, no historical JSONL regenerated, no database changed and no pending product certified. Existing importer canonical-source guard stays intact. This prevention change does not resolve old mixed references or authorize selecting an existing SKU by suffix; those remain in the separate reconciliation orders.

Primary sources: [CU26021](https://www.mann-filter.com/en/catalog/search-results/product.html/cu26021_mann-filter.html), [CUK24021](https://www.mann-filter.com/en/catalog/search-results/product.html/cuk24021_mann-filter.html), [C27054](https://www.mann-filter.com/en/catalog/search-results/product.html/c27054_mann-filter.html).
