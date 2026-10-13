# Knowledge Center figures (drafts)

Interactive isometric explainer figures for Fuel Cleanliness Protection technology pages.

**Status: internal-only.** Every figure here is `validationStatus: pending-secondary-validation` and
`publicationStatus: internal-only` (see `status.json` and the publication gate in
`../FUEL_CANONICAL_GOVERNANCE.md`). Nothing in this folder is served by the frontend. Do not copy a page
into `frontend/` or any public surface until both statuses are approved.

| Figure | Technology scope | Pages | Preview |
|---|---|---|---|
| Fig 1 · HYDROCORE™ standard separator | Standard non-turbine fuel/water separator, drain and transparent bowl | `hydrocore/hydrocore.html`, `hydrocore/hydrocore-light.html` | `shots/hydrocore-light.png`, `shots/hydrocore-dark.png` |
| Fig 2 · TURBOCORE™ turbine-style housing | FH/FG turbine-style housing, replaceable element | `turbocore/turbocore.html`, `turbocore/turbocore-light.html` | `shots/turbocore-light.png`, `shots/turbocore-lid-open.png` |

HYDROCORE™ and TURBOCORE™ are separate figures because they are distinct scopes; neither page mentions the other technology.

## Content rules applied

- Figures are conceptual explainers, not SKU product images (those go through `elimfilters-product-image-pipeline`).
- No competitor names, product codes, efficiencies, capacities, pressures or service intervals.
- Readouts show qualitative states (for example `caudal medio · acumulando agua`), never numbers.
- TURBOCORE™ copy states only staged separation; it does not claim how any stage works.
- Remaining review items and operator decisions are recorded in `status.json`.

## Rebuilding

The pages are self-contained HTML. They are built with the third-party
[anatomy](https://github.com/wheresryan22/anatomy) kit (MIT, notice in `ANATOMY_LICENSE.txt` and inlined
in every page). The kit is not vendored. Clone it at the pinned commit into `.anatomy/` (git-ignored):

```sh
cd docs/knowledge-center/figures
git clone https://github.com/wheresryan22/anatomy .anatomy
git -C .anatomy checkout be2fa9b47a7e4b05dec468be9ffc42e830c2101c
node hydrocore/build.mjs --audit && node hydrocore/build.mjs --light
node turbocore/build.mjs --audit && node turbocore/build.mjs --light
```

`--audit` proves the geometry (clearances, supports, mounts, depth order, including every lid position).
Line ends are checked in headless Chromium with `node .anatomy/scripts/lines.mjs <page>.html`.

`common.mjs` holds the parts both figures share: the bench, the wall, fittings and lines, the glass bowl, the drain and cup, and the bowl's live logic.
