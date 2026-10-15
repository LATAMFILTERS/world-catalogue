# Knowledge Center figures (drafts)

Interactive isometric explainer figures for Fuel Cleanliness Protection technology pages.

**Status: see `status.json`.** The HYDROCORE™, TURBOCORE™ and SYNTAPORE™ figures are approved for publication:
their English builds (`--en`) are written to `frontend/public/knowledge-center/figures/` and linked from the How
It Works section of each technology page (`/knowledge-center/technologies/<technology>/`).
Do not publish a new figure until both of its statuses are approved (see the publication gate in
`../FUEL_CANONICAL_GOVERNANCE.md`). The Spanish pages in this folder are the review drafts and are not served.

| Figure | Technology scope | Pages | Preview |
|---|---|---|---|
| Fig 1A · HYDROCORE™ separator with reusable bowl | Standard non-turbine separator, transparent bowl and drain; at service only the element is changed and the bowl is refitted | `hydrocore/hydrocore.html`, `hydrocore/hydrocore-light.html` | `shots/hydrocore-light.png`, `shots/hydrocore-service.png` |
| Fig 1B · HYDROCORE™ spin-on with integrated drain | Standard non-turbine spin-on, sump in section, integrated drain; at service the whole cartridge is replaced | `hydrocore/hydrocore-spinon.html`, `hydrocore/hydrocore-spinon-light.html` | `shots/hydrocore-spinon-light.png`, `shots/hydrocore-spinon-service.png` |
| Fig 1C · HYDROCORE™ element in a transparent bowl | Standard non-turbine separator: permanent metal shroud under the head, tall transparent bowl with the pleated element visible inside, red seal, drain; at service the bowl comes off, only the element is replaced, and the same bowl is refitted | `hydrocore/hydrocore-housing.html`, `hydrocore/hydrocore-housing-light.html` | `shots/hydrocore-housing-light.png`, `shots/hydrocore-housing-service.png` |
| Fig 3 · SYNTAPORE™ primary and secondary | Diesel particulate filtration: primary spin-on on the suction side before the transfer pump, secondary spin-on on the engine before the injection rail, both in section; at service each spin-on is replaced | `syntapore/syntapore.html`, `syntapore/syntapore-light.html` | `shots/syntapore-light.png`, `shots/syntapore-service.png` |
| Fig 2 · TURBOCORE™ turbine-style housing | FH/FG turbine-style housing, replaceable element | `turbocore/turbocore.html`, `turbocore/turbocore-light.html` | `shots/turbocore-light.png`, `shots/turbocore-lid-open.png` |

HYDROCORE™ and TURBOCORE™ are separate figures because they are distinct scopes; neither page mentions the other technology.

## Content rules applied

- Figures are conceptual explainers, not SKU product images (those go through `elimfilters-product-image-pipeline`).
- No competitor names, product codes, efficiencies, capacities, pressures or service intervals.
- Fuel figures show water drops and solid residues settling (residues as darker dots).
- Readouts show qualitative states (for example `caudal medio · acumulando agua`), never numbers.
- TURBOCORE™ copy states staged separation with a stage-1 turbine deflector that centrifuges the fuel, as confirmed by the operator (see `status.json`).
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
node hydrocore/build.mjs --spinon --audit && node hydrocore/build.mjs --spinon --light
node hydrocore/build.mjs --housing --audit && node hydrocore/build.mjs --housing --light
node turbocore/build.mjs --audit && node turbocore/build.mjs --light
node syntapore/build.mjs --audit && node syntapore/build.mjs --light
# published English pages and their previews (dark theme, for the Knowledge Center)
for v in "" --spinon --housing; do node hydrocore/build.mjs $v --en; done
node turbocore/build.mjs --en
node syntapore/build.mjs --en
for f in hydrocore hydrocore-spinon hydrocore-housing turbocore syntapore; do
  node .anatomy/scripts/capture.mjs ../../../frontend/public/knowledge-center/figures/$f.html --out /tmp/$f.png --wait 4000 --scale 1.5
  ffmpeg -v error -i /tmp/$f.png -c:v libwebp -quality 82 ../../../frontend/public/knowledge-center/figures/$f.webp -y
done
```

`--audit` proves the geometry (clearances, supports, mounts, depth order, including every lid position).
Line ends are checked in headless Chromium with `node .anatomy/scripts/lines.mjs <page>.html`.

`common.mjs` holds the parts the figures share: the bench, the wall, fittings and lines, the glass bowl, the drain and cup, and the bowl's live logic.
