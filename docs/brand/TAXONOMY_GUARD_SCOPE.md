# Canonical Taxonomy Guard Scope

The prebuild taxonomy guard validates active canonical and deployable taxonomy sources only. Historical reports, migrations, tests, backups, archived evidence, and provenance records may preserve retired identifiers when required to explain prior states and must not block a production build.

The postbuild public-governance validator remains the final publication gate. It scans generated public HTML, JSON, XML, and text output and fails the build if retired identifiers or prohibited public claims are emitted.

The legacy `/commercial-lines/duratech/` source is an explicit migration shim only. It may contain the retired URL token solely to provide noindex/canonical migration signals toward `/commercial-lines/duractech/`. It is not a canonical commercial surface.
