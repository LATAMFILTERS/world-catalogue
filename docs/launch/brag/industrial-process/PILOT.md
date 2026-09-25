# ELIMFILTERS Brag Pilot — Industrial & Process

Status: COMPLETE_STORYBOARD_ONLY
Pilot target: `/industrial-process/`
Repository: `LATAMFILTERS/world-catalogue`
Source ref: `1e00a0bb89f5dda857136b956c29a637320c5946`
Public URL: `https://elimfilters.com/industrial-process/`
Publication authorized: no

## 1. Release lock

The pilot is locked to the Industrial & Process root page as represented by source ref `1e00a0bb89f5dda857136b956c29a637320c5946`.

The root page is a public engineering/commercial entry point. Its canonical architecture contains five commercial technology platforms:

1. AEREMIS™ — Air Technologies
2. PARTION™ — Dust & Fume Technologies
3. COALVEX™ — Gas Conditioning Technologies
4. FLUREXIS™ — Fluid Conditioning Technologies
5. AQUVEXIS™ — Water Treatment Technologies

The pilot must represent the root architecture as a whole. FLUREXIS™ technologies such as HYLTRIS™, LUBREVA™, DEWATIS™ and OILREVEX™ may appear as supporting detail, but they must not be presented as if they are the complete Industrial & Process architecture.

## 2. Reuse audit

### Reused

- `frontend/src/app/industrial-process/page.tsx` — public page, hero language, CTA and actual page structure.
- `frontend/src/lib/industrial-process-architecture.ts` — canonical five-platform presentation model.
- `elimfilters-vault/13-canonical-knowledge/industrial-process/IP-INDUSTRIAL-PROCESS-ARCHITECTURE.md` — approved technical architecture and claim boundaries.
- `docs/brand/CLAIM_REGISTRY.md` — approved corporate positioning and engineering principle.
- `docs/brand/BRAND_MANUAL.md` — brand positioning and communication direction.
- `scripts/generate-video-sitemap.mjs` — existing governed video inventory.
- `frontend/src/lib/video-metadata.ts` — existing video metadata capability.
- `scripts/generate-video-thumbnails.mjs` — existing thumbnail generation capability.
- Existing hero asset: `/images/INDUSTRIAL PROCESS.mp4`.
- Existing hero poster: `/images/planta_converted.avif`.
- Existing platform video assets including `AEREMIS.mp4`, `PARTION-VIDEO.mp4`, `COALVEX.mp4`, `FLUREXIS-VIDEO.mp4` and `AQUVEXIS.mp4`.

### Created

- This pilot package.
- A machine-readable pilot manifest.
- One correction to the `elimfilters-brag` skill: root/collection showcases must preserve canonical coverage and must not silently reduce a multi-platform architecture to a preferred subset.

### Rejected duplicates

- No new marketing database.
- No new campaign worker.
- No new scheduler.
- No new animation framework.
- No Remotion dependency.
- No duplicate video metadata system.
- No duplicate product/platform registry.

## 3. Brand and claims gate

PASS.

Approved positioning used by this pilot:

- ELIMFILTERS = Industrial Filtration Engineering.
- Strategic offering = Asset Protection Systems.
- The filter is the means. Asset protection is the objective.
- Industrial & Process selection starts with the carrier phase, contaminant phase, treatment objective and required downstream condition.
- Commercial scope is centered on validated filtration, separation and treatment media and replacement elements.

Explicitly excluded from pilot copy:

- universal efficiency claims;
- universal service-life claims;
- unsupported pressure, capacity, recovery or carryover values;
- blanket certification language;
- claims that ELIMFILTERS sells complete process equipment;
- competitor comparisons.

## 4. Storyboard v1 — 30 seconds

### Scene 1 — 0:00–0:04
Visual: actual `/industrial-process/` hero using the existing `INDUSTRIAL PROCESS.mp4`.
On-screen:
`INDUSTRIAL & PROCESS`
`ENGINEER THE PROCESS. PROTECT THE ASSET.`

### Scene 2 — 0:04–0:08
Visual: real page transition into the engineering-entry section.
On-screen:
`Start with the operating problem — not a generic filter list.`

### Scene 3 — 0:08–0:20
Visual: real platform grid, then short cuts from existing platform assets.
On-screen sequence:
`AEREMIS™ — AIR`
`PARTION™ — DUST & FUME`
`COALVEX™ — GAS`
`FLUREXIS™ — FLUID CONDITIONING`
`AQUVEXIS™ — WATER`

Each platform receives equivalent visual weight in the root-page pilot.

### Scene 4 — 0:20–0:25
Visual: actual engineering qualification / standards area.
On-screen:
`Carrier medium. Contaminant. Operating envelope. Required outcome.`

### Scene 5 — 0:25–0:30
Visual: ELIMFILTERS closing frame using the official logo and actual page CTA.
On-screen:
`INDUSTRIAL FILTRATION ENGINEERING`
`ASSET PROTECTION SYSTEMS`
`elimfilters.com/industrial-process/`

## 5. Optional voiceover

“Industrial filtration starts with the process condition, not a generic filter list. ELIMFILTERS Industrial & Process organizes air, dust and fume, gas, fluid conditioning and water treatment around the actual contamination mechanism and required outcome. Engineer the process. Protect the asset.”

## 6. LinkedIn copy v1

Industrial filtration is not one treatment mechanism.

ELIMFILTERS Industrial & Process organizes engineering selection around the carrier medium, contaminant phase, operating conditions and required downstream result.

Five governed technology platforms provide the entry architecture: AEREMIS™ for industrial air, PARTION™ for dust and fume, COALVEX™ for gas conditioning, FLUREXIS™ for fluid conditioning and AQUVEXIS™ for industrial water treatment.

The filter is the means. Asset protection is the objective.

Explore the engineering architecture at elimfilters.com/industrial-process/

## 7. Instagram copy v1

Industrial & Process filtration, organized by the problem that must be solved.

Air. Dust & fume. Gas. Fluid conditioning. Water.

Five governed ELIMFILTERS technology platforms. One engineering principle: the filter is the means; asset protection is the objective.

elimfilters.com/industrial-process/

## 8. Capture plan

Required real captures for a future rendered MP4:

1. Hero at desktop viewport with live hero video visible.
2. “What is ELIMFILTERS Industrial & Process?” section.
3. Five-platform grid with all platform names legible.
4. Standards / engineering qualification section.
5. Closing CTA.

Optional mobile validation capture:

- hero;
- platform grid;
- CTA.

No fabricated dashboards or device mockups are permitted.

## 9. Audit

Release lock: PASS.
Canonical platform coverage: PASS.
Brand positioning: PASS.
Claims governance: PASS.
Existing-asset reuse: PASS.
No duplicate architecture introduced: PASS.
Publication safety: PASS — nothing was published.
Real screenshot capture: NOT EXECUTED.
MP4 assembly: NOT EXECUTED.

The connected ELIMSERVER is online and the repository is present, but remote shell process creation failed in this session before a safe `ffmpeg`/browser preflight could be completed. No dependency or system package was installed as a workaround.

Per the skill contract, this does not justify creating a parallel renderer. The pilot therefore closes as `COMPLETE_STORYBOARD_ONLY`.

## 10. Closure

Terminal state: `COMPLETE_STORYBOARD_ONLY`.

To promote this exact pilot to `COMPLETE_PACKAGE_READY`, the next execution only needs to:

- run browser capture against the locked release or a newly locked ref;
- verify local render tooling;
- assemble the five governed captures/assets;
- record generated asset hashes in the manifest.

No copy, architecture or governance redesign is required unless the source release changes.
