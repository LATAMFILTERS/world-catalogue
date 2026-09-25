---
name: elimfilters-brag
description: Turn an approved ELIMFILTERS release, page, feature, platform, or technical capability into a governed launch package: screenshots, short-form launch storyboard/video plan, and channel-ready copy. Reuse repository assets and brand governance; never invent claims or publish automatically.
activation: Trigger when the user asks to brag, showcase, launch, demo, announce, make a launch video, or create social/commercial launch material for something already built or approved.
---

# ELIMFILTERS Brag

You built it. Now present it without creating a second marketing system.

This skill converts an already-built ELIMFILTERS artifact into a traceable launch package. It is a presentation/release capability, not a product-development workflow and not a publishing bot.

## Non-negotiable boundaries

1. Read root `CLAUDE.md` before execution.
2. Treat `docs/brand/` as the brand and claims authority.
3. Reuse existing repository assets, screenshots, video, animation libraries and release metadata before creating anything new.
4. Check sibling repository `LATAMFILTERS/elimfilters-crm` before creating any commercial workflow, campaign state, scheduler, approval flow, lead activity, posting worker, or follow-up mechanism. Those belong to CRM when they are operational/commercial.
5. Do not create a second source of truth for product, technology, SKU, customer, distributor, campaign, or release state.
6. Do not invent performance claims, certifications, customer results, technical values, product availability, launch dates, market coverage, testimonials, or comparative claims.
7. Never publish, post, email, message, or schedule distribution without explicit authorization.
8. Do not expose secrets, internal URLs, admin interfaces, tokens, customer data, CRM records, private dashboards, or unreleased commercial information.
9. Never modify the product being showcased merely to make the presentation easier.
10. Every output must identify the exact source commit/ref or supplied release identifier it represents.

## What this skill produces

Default package:

- a release summary;
- one concise launch narrative;
- a 15–30 second storyboard;
- screenshot/capture plan;
- on-screen text;
- optional voiceover script;
- LinkedIn copy;
- Instagram caption;
- website/newsroom copy when relevant;
- asset manifest with source paths and hashes when files are generated;
- provenance record: repository, ref/commit, target URL or feature path, date, brand/claim sources used.

Optional outputs only when requested or supported by the local toolchain:

- rendered vertical video;
- rendered landscape video;
- animated web demo;
- thumbnail/poster frame;
- alternate language versions.

## Supported subjects

Use this skill for completed or approved:

- website pages;
- product/platform launches;
- technical capabilities;
- Knowledge Center experiences;
- Part Search improvements;
- distributor-facing pages;
- approved product imagery;
- internal tools when the user explicitly wants an internal demo.

Do not use it to imply a release is complete when engineering/release evidence says otherwise.

## Phase 0 — Resolve the exact release

Before generating presentation material, identify:

- repository;
- branch/ref/commit;
- feature/page/path;
- whether it is public, staged, internal, or unreleased;
- intended audience;
- requested language;
- requested channels.

If the user gave a commit/ref, use it.
If not, use the current checked-out ref and record it.
If the target is ambiguous, inspect recent changes and ask only if ambiguity remains material.

Terminal outcomes for this phase:

- `RELEASE_LOCKED`
- `BLOCKED_AMBIGUOUS_RELEASE`

Do not continue on ambiguity.

## Phase 1 — Reuse audit

Search before creating.

In `world-catalogue`, inspect at minimum:

- `frontend/public/assets/`
- existing page-specific images/video;
- `frontend/src/lib/video-metadata.ts`
- `scripts/generate-video-thumbnails.mjs`
- `scripts/generate-video-sitemap.mjs`
- relevant `.claude/skills/`
- `docs/brand/`

Use existing GSAP, Framer Motion, Motion, browser/screenshot tooling, and repository-native scripts where they already solve the need.

In `elimfilters-crm`, check for any existing campaign/approval/publication workflow before adding operational behavior.

Record:

- `reused[]`
- `created[]`
- `rejected_duplicates[]`

## Phase 2 — Brand and claims gate

Read the minimum relevant canonical brand sources. At minimum:

- `docs/brand/ELIMFILTERS_CONSTITUTION_v1.md`
- `docs/brand/BRAND_ARCHITECTURE.md`
- `docs/brand/CLAIM_REGISTRY.md`
- `docs/brand/BRAND_MANUAL.md`
- relevant technology/product registries for the subject.

All public copy must follow:

**ELIMFILTERS = Industrial Filtration Engineering**  
**Strategic offering = Asset Protection Systems**  
**The filter is the means. Asset protection is the objective.**

Product/technology claims must resolve from canonical data and approved evidence. If a proposed line cannot be supported, rewrite it conservatively or block that line.

Terminal outcomes:

- `BRAND_GATE_PASS`
- `BLOCKED_UNSUPPORTED_CLAIM`

## Phase 3 — Capture the real product

Show the real thing, not a fabricated UI.

For web features:

- start/use the real application;
- capture the actual page or interaction;
- prefer desktop and mobile views when both matter;
- hide browser chrome unless it adds context;
- do not mock states that are not present in the release.

For a static product/platform launch:

- reuse approved repository imagery and approved video assets;
- preserve geometry and branding governance;
- if product imagery is involved, invoke `elimfilters-product-image-pipeline`; never bypass it.

For screenshots:

- use an existing browser/screenshot tool first;
- capture a stable viewport;
- wait for fonts/assets;
- avoid loading/admin states;
- redact private information if the target is internal.

Every captured asset must map back to the locked release.

## Phase 4 — Narrative

Default narrative structure for 15–30 seconds:

1. **0–3 s — Problem / context**  
   One precise line. No hype.
2. **3–8 s — What ELIMFILTERS built**  
   Name the platform, capability, or experience.
3. **8–20 s — Show it working**  
   Real UI, real approved product visuals, or real workflow.
4. **20–26 s — Engineering value**  
   State only evidence-backed value.
5. **26–30 s — Close**  
   ELIMFILTERS identity + relevant URL/CTA.

Preferred tone:

- technical;
- concise;
- industrial;
- premium;
- evidence-led;
- no generic AI language;
- no exaggerated adjectives;
- no competitor denigration.

## Phase 5 — Motion and visual system

Use existing project capabilities before adding dependencies.

Preferred order:

1. existing page motion;
2. GSAP already present in frontend;
3. Framer Motion / Motion already present;
4. CSS/native browser animation;
5. external rendering dependency only if truly required and explicitly justified.

Do not add Remotion, a second animation framework, or a new render service merely to make a short launch piece if the existing stack can do it.

Default presentation rules:

- use official ELIMFILTERS logo assets only;
- use canonical colors/type rules from brand documentation;
- favor real full-screen captures over floating fake-device mockups;
- keep text large enough for mobile;
- one idea per scene;
- avoid stock footage when the release itself is visually demonstrable;
- avoid decorative UI that looks like functionality the product does not have.

## Phase 6 — Video rendering

Rendering is optional and environment-dependent.

Preflight:

- check whether a repository-supported capture/render path already exists;
- check whether `ffmpeg` is installed locally before relying on it;
- do not install a system package or new npm dependency automatically just to render;
- if no supported renderer exists, produce the complete storyboard, capture set, timing manifest and browser-based preview rather than creating a parallel media stack.

If `ffmpeg` exists, it may be used as a local standard tool to assemble approved captures/audio into MP4 without adding a repository dependency.

Recommended outputs:

- vertical: 1080×1920;
- landscape: 1920×1080;
- 30 fps unless source footage dictates otherwise;
- 15–30 seconds by default;
- H.264/AAC when rendering MP4.

Do not add licensed music unless the license is known and recorded. Default to no music or clearly licensed/owned audio.

## Phase 7 — Copy package

Generate only channels relevant to the request.

### LinkedIn

Structure:

- engineering/business problem;
- what was built;
- what it changes for the user;
- evidence-backed differentiator;
- restrained CTA.

Avoid hashtag walls. Use a small number of relevant tags only if requested.

### Instagram

Shorter, more visual, less technical density. Do not change the factual claims.

### Website/newsroom

Durable copy. Avoid temporal hype unless a real public launch date exists.

### Distributor material

If tied to a known prospect or campaign, stop before creating operational state and hand off to the existing CRM workflow.

## Phase 8 — Manifest and audit

For generated assets, create a manifest in the chosen output directory containing:

```json
{
  "skill": "elimfilters-brag",
  "version": 1,
  "repository": "LATAMFILTERS/world-catalogue",
  "source_ref": "<commit-or-ref>",
  "subject": "<feature/page/platform>",
  "audience": "<audience>",
  "language": "<language>",
  "channels": [],
  "brand_sources": [],
  "reused_assets": [],
  "generated_assets": [],
  "claims": [],
  "publication_authorized": false
}
```

Do not mark `publication_authorized: true` unless the user explicitly authorized publishing.

## Completion status

Every run ends in exactly one status:

- `COMPLETE_PACKAGE_READY`
- `COMPLETE_STORYBOARD_ONLY`
- `BLOCKED_AMBIGUOUS_RELEASE`
- `BLOCKED_UNSUPPORTED_CLAIM`
- `BLOCKED_MISSING_APPROVED_ASSET`
- `BLOCKED_PRIVATE_DATA_RISK`
- `BLOCKED_RENDER_TOOLING`

Do not loop indefinitely. If a preflight returns the same blocker twice without changed evidence, stop and report the blocker.

## Required completion report

Always state:

- what was reused;
- what was created;
- why each new artifact was necessary;
- exact source ref/commit represented;
- whether anything was published;
- remaining blocker, if any.
