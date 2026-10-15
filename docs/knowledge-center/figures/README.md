# Knowledge Center figures (drafts)

Interactive isometric explainer figures for Fuel Cleanliness Protection technology pages.

**Status: see `status.json`.** Every figure listed below is approved for publication. Their public builds
(`--lang en|es|pt --public`) are written to `frontend/public/knowledge-center/figures/`: `<name>.html` in English,
`<name>-es.html` and `<name>-pt.html`. The How It Works section of each technology page
(`/knowledge-center/technologies/<technology>/`) opens the English page and links the Spanish and Portuguese ones.
Do not publish a new figure until both of its statuses are approved (see the publication gate in
`../FUEL_CANONICAL_GOVERNANCE.md`). The Spanish pages in this folder are the review drafts and are not served.

| Figure | Technology scope | Pages | Preview |
|---|---|---|---|
| Fig 1A · HYDROCORE™ separator with reusable bowl | Standard non-turbine separator, transparent bowl and drain; at service only the element is changed and the bowl is refitted | `hydrocore/hydrocore.html`, `hydrocore/hydrocore-light.html` | `shots/hydrocore-light.png`, `shots/hydrocore-service.png` |
| Fig 1B · HYDROCORE™ spin-on with integrated drain | Standard non-turbine spin-on, sump in section, integrated drain; at service the whole cartridge is replaced | `hydrocore/hydrocore-spinon.html`, `hydrocore/hydrocore-spinon-light.html` | `shots/hydrocore-spinon-light.png`, `shots/hydrocore-spinon-service.png` |
| Fig 1C · HYDROCORE™ element in a transparent bowl | Standard non-turbine separator: permanent metal shroud under the head, tall transparent bowl with the pleated element visible inside, red seal, drain; at service the bowl comes off, only the element is replaced, and the same bowl is refitted | `hydrocore/hydrocore-housing.html`, `hydrocore/hydrocore-housing-light.html` | `shots/hydrocore-housing-light.png`, `shots/hydrocore-housing-service.png` |
| Fig 3 · SYNTAPORE™ primary and secondary | Diesel particulate filtration: primary spin-on on the suction side before the transfer pump, secondary spin-on on the engine before the injection rail, both in section; at service each spin-on is replaced | `syntapore/syntapore.html`, `syntapore/syntapore-light.html` | `shots/syntapore-light.png`, `shots/syntapore-service.png` |
| Fig 4 · SYNTRAX™ full-flow spin-on | Engine lube circuit: oil pan, oil pump, full-flow spin-on on the engine in section, main gallery to the bearings, return; at service the spin-on is replaced | `syntrax/syntrax.html`, `syntrax/syntrax-light.html` | `shots/syntrax-light.png`, `shots/syntrax-service.png` |
| Fig 3B / 4B / 5 · spin-on vs cartridge (SYNTAPORE™, SYNTRAX™, NANOFORCE™) | The two formats side by side: the spin-on comes off whole; on the cartridge the bowl drops, only the element is replaced and the same bowl goes back. ES / EN / PT | `compare/compare-<tech>.html`, `compare/compare-<tech>-light.html` | built on demand |
| Fig 6 · THERMACORE™ coolant spin-on | Engine cooling circuit: radiator, water pump, coolant spin-on in section with an additive charge under the element (where approved), water jacket, return; at service the spin-on is replaced | `thermacore/thermacore.html`, `thermacore/thermacore-light.html` | `shots/thermacore-light.png`, `shots/thermacore-service.png` |
| Fig 7 · INTEKCORE™ housing + MACROCORE™ elements | Engine air cleaner in section: head with inlet and outlet ducts and restriction indicator, primary and safety elements, cover; at service the cover and primary come off and the safety element stays | `air/air-intake.html`, `air/air-intake-light.html` | `shots/air-intake-light.png`, `shots/air-intake-service.png` |
| Fig 2 · TURBOCORE™ turbine-style housing | FH/FG turbine-style housing, replaceable element | `turbocore/turbocore.html`, `turbocore/turbocore-light.html` | `shots/turbocore-light.png`, `shots/turbocore-lid-open.png` |

HYDROCORE™ and TURBOCORE™ are separate figures because they are distinct scopes; neither page mentions the other technology.

## Content rules applied

- Figures are conceptual explainers, not SKU product images (those go through `elimfilters-product-image-pipeline`).
- No competitor names, product codes, efficiencies, capacities, pressures or service intervals.
- Fuel figures show water drops and solid residues settling (residues as darker dots).
- Every caption ends by calling the figure an illustrative simulation of how the technology works: a conceptual animation, not an engineering model or test result, with no product data (operator decision, 2026-10-15).
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
node syntrax/build.mjs --audit && node syntrax/build.mjs --light
node thermacore/build.mjs --audit && node thermacore/build.mjs --light
node air/build.mjs --audit && node air/build.mjs --light
# published pages (dark theme, for the Knowledge Center) in English, Spanish and Portuguese, and the English previews
for l in en es pt; do
  for v in "" --spinon --housing; do node hydrocore/build.mjs $v --lang $l --public; done
  for f in turbocore syntapore syntrax thermacore air; do node $f/build.mjs --lang $l --public; done
done
for t in syntapore syntrax nanoforce; do
  node compare/build.mjs --tech $t --audit && node compare/build.mjs --tech $t --light
  for l in en es pt; do node compare/build.mjs --tech $t --lang $l --public; done
done
for f in hydrocore hydrocore-spinon hydrocore-housing turbocore syntapore syntrax compare-syntapore compare-syntrax compare-nanoforce thermacore air-intake; do
  node .anatomy/scripts/capture.mjs ../../../frontend/public/knowledge-center/figures/$f.html --out /tmp/$f.png --wait 4000 --scale 1.5
  ffmpeg -v error -i /tmp/$f.png -c:v libwebp -quality 82 ../../../frontend/public/knowledge-center/figures/$f.webp -y
done
```

`--audit` proves the geometry (clearances, supports, mounts, depth order, including every lid position).
Line ends are checked in headless Chromium with `node .anatomy/scripts/lines.mjs <page>.html`.

`common.mjs` holds the parts the figures share: the bench, the wall, fittings and lines, the glass bowl, the drain and cup, and the bowl's live logic.
