// DRAFT (internal-only, see README.md): shared bench parts for the HYDROCORE™ and TURBOCORE™ figures.
// Every drawn item records its true shape so `node build.mjs --audit` can prove the geometry.
import * as k from "./.anatomy/kit/iso-kit.mjs";
import * as G from "./.anatomy/kit/lathe.mjs";
import * as A from "./.anatomy/kit/audit.mjs";
import { tubePieces, tubeSvg } from "./.anatomy/kit/tube.mjs";

export { k, G, A };

// The pages inline the MIT-licensed anatomy kit; this keeps its notice with every copy.
export const KIT_NOTICE = "/* anatomy kit (github.com/wheresryan22/anatomy @ be2fa9b) · Copyright (c) 2026 Ryan · MIT License, see ANATOMY_LICENSE.txt */\n";
// Internal-only drafts must never be indexed if they are ever served.
export const draftPage = (html) => html.replace('<html lang="en">', '<html lang="es">').replace("<head>", '<head><meta name="robots" content="noindex, nofollow">');

export const UP = [0, 0, 1];
export const vertical = (z, x = 0, y = 0) => G.frameOf([x, y, z], UP, [1, 0, 0], [0, 1, 0]);
export const hexagon = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * r, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * r]);

export function studio(P, { order = ["stand"], spring = { stagger: 0.035, stiffness: 46, damping: 13.6, substeps: 4 }, pieces = { stand: [0, 0, 0] } } = {}) {
  const R = A.recorder(P, { order, spring });
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

  // put(name, ref, svg, shapes, { piece, bias }): one depth-sorted item; shapes are A.* constructors (unrecorded)
  function put(name, ref, svg, shapes, { piece = "stand", bias = 0, part } = {}) {
    const id = R.nameFor(name);
    R.put({ name: id, piece, ride: piece, move: pieces[piece], at: ref, bias, svg, part, shapes: shapes.map((shape) => R.solid(shape)) });
    return id;
  }

  function hose(name, route, r, { tone = "mid", piece = "stand", maxLength = 10 } = {}) {
    const id = R.nameFor(name);
    R.route(id, route, r, { owner: id, piece, move: pieces[piece], ride: piece });
    tubePieces(route, r, P, { maxLength }).forEach((part, index) =>
      R.put({ name: `${id}:${index}`, piece, ride: piece, move: pieces[piece], at: part.mid, svg: tubeSvg(part, { tone }), route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] }),
    );
    return id;
  }

  // A turned fitting on a flat face: a round boss then a hex, along F.a from s = 0.
  function fitting(name, F, { boss = 7, bossH = 4, hex = 5.4, hexH = 5.5 } = {}) {
    put(`${name}.boss`, G.pointOf(F, bossH / 2, 0, 0), S(G.disc(0, bossH, boss, F, P), { tone: "mid" }), [A.disc(F, 0, bossH, boss, { name: `${name}.boss` })]);
    put(`${name}.hex`, G.pointOf(F, bossH + hexH / 2, 0, 0), S(G.prismOf(F, hexagon(hex), bossH, bossH + hexH, P), { tone: "mid" }), [A.prism(F, hexagon(hex), bossH, bossH + hexH, { name: `${name}.hex` })]);
    return bossH + hexH;
  }

  function plate(PLATE, { thick = 10, foot = 5, strip, label } = {}) {
    const svg = [`<path class="iso-halo" d="${k.haloOf(PLATE, -thick - foot, thick, P)}"/>`];
    const shapes = [A.slab(PLATE, -thick, thick, { name: "stand.plate" })];
    for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
      svg.push(S(k.cylinder(x, y, 7, -thick - foot, 1.6, P, 28), { tone: "lo" }));
      svg.push(S(k.cylinder(x, y, 5.4, -thick - foot + 1.6, foot - 1.6, P, 28), { tone: "mid" }));
      shapes.push(A.cylinder(x, y, 7, -thick - foot, 1.6, { name: "stand.foot-pad" }), A.cylinder(x, y, 5.4, -thick - foot + 1.6, foot - 1.6, { name: "stand.foot" }));
    }
    svg.push(S(k.slabOf(PLATE, -thick, thick, P, 8, 1.4), { tone: "mid" }));
    svg.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
    const screws = k.corners(PLATE, 10);
    svg.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
    svg.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    put("stand.plate", [PLATE.x + PLATE.w / 2, PLATE.y + PLATE.d / 2, -thick], svg.join(""), shapes, { bias: -400 });
    if (strip) {
      const out = [S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" })];
      const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.2], P);
      out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
      out.push(D([at([strip.x + 2, strip.y + strip.d / 2, 0.6]), at([strip.x + strip.w - 2, strip.y + strip.d / 2, 0.6])], { size: 0.4 }));
      put("ruler", [strip.x + strip.w / 2, strip.y + strip.d / 2, 0.3], out.join(""), [A.slab(strip, 0, 0.6, { name: "ruler" })]);
    }
    if (label) {
      const out = [S(k.slabOf(label, 0, 1.2, P, 3, 0.4), { tone: "mid" })];
      const rows = [label.y + 5, label.y + 9, label.y + 13];
      for (const y of rows) out.push(L(k.lineOnTop([label.x + 4, y], [label.x + (y === rows[2] ? 16 : 24), y], 1.2, P), { tone: "lo", free: true }));
      out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, 1.2])), { size: 0.4 }));
      put("label-plate", [label.x + label.w / 2, label.y + label.d / 2, 0.6], out.join(""), [A.slab(label, 0, 1.2, { name: "label-plate" })]);
    }
  }

  function slot(face, x, z) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI / 2 + (i / 12) * Math.PI;
      pts.push(at([x - 4 + Math.cos(a) * 2.2, face, z + Math.sin(a) * 2.2]));
    }
    for (let i = 0; i <= 12; i++) {
      const a = -Math.PI / 2 + (i / 12) * Math.PI;
      pts.push(at([x + 4 + Math.cos(a) * 2.2, face, z + Math.sin(a) * 2.2]));
    }
    return "M" + pts.map(([sx, sy]) => `${sx.toFixed(1)} ${sy.toFixed(1)}`).join("L") + "Z";
  }

  // The service wall: an upright panel on an angle foot, with spare slotted mounting holes.
  function wall(WALL, top, slots) {
    const face = WALL.y + WALL.d;
    const svg = [S(k.slabOf(WALL, 0, top, P, 3, 0.6), { tone: "mid" })];
    for (const [x, z] of slots) svg.push(L(slot(face, x, z), { tone: "lo" }));
    svg.push(D([[WALL.x + 6, top - 6], [WALL.x + WALL.w - 6, top - 6]].map(([x, z]) => at([x, face, z])), { size: 0.6, tone: "hi" }));
    put("wall", [0, WALL.y + WALL.d / 2, top / 2], svg.join(""), [A.slab(WALL, 0, top, { name: "wall" })], { bias: -300 });
    const foot = { x: WALL.x, y: face, w: WALL.w, d: 12, r: 1.5 };
    put("wall.foot", [0, face + 6, 2], S(k.slabOf(foot, 0, 4, P, 3, 0.5), { tone: "mid" }) + D([-0.4, -0.15, 0.15, 0.4].map((f) => at([f * WALL.w, face + 7, 4])), { size: 0.5 }), [A.slab(foot, 0, 4, { name: "wall.foot" })]);
    return face;
  }

  // The catch cup on the plate, under the drain.
  function cup(r, h, spoutZ) {
    const F = vertical(h);
    const svg = [`<path class="iso-halo" d="${k.haloOf({ x: -r, y: -r, w: r * 2, d: r * 2, r }, 0, 0.1, P)}" style="filter:blur(3px)"/>`];
    svg.push(S(k.cylinder(0, 0, r, 0, h, P, 56, 0.6), { tone: "mid", inner: L(k.sideArc(0, 0, r, 2.2, P, 48), { tone: "faint" }) }));
    svg.push(`<path class="pc-cav" d="${G.circleOf(F, 0, r - 1.4, P)}"/>`);
    svg.push(`<path data-part="cup-fill" class="pc-water" d=""/>`);
    svg.push(L(G.circleOf(F, 0, r - 1.4, P), { tone: "lo" }));
    svg.push(`<path data-part="stream" class="iso-line pc-stream" data-flow="" d="${k.segment([0, 0, spoutZ], [0, 0, h - 1.2], P)}" style="opacity:0"/>`);
    put("cup", [0, 0, h / 2], svg.join(""), [A.cylinder(0, 0, r, 0, h, { name: "cup" })]);
  }

  // Twist drain under the bowl: a body under the cap, a wing below it that turns a quarter turn to open, and a spout.
  function drain(valveZ, wingZ, { piece = "stand" } = {}) {
    put("drain.body", [0, 0, (wingZ + 5 + valveZ) / 2], S(k.cylinder(0, 0, 4.2, wingZ + 5, valveZ - wingZ - 5, P, 28), { tone: "mid" }), [A.cylinder(0, 0, 4.2, wingZ + 5, valveZ - wingZ - 5, { name: "drain.body" })], { piece });
    const wing = k.ringOf({ x: -9, y: -1.4, w: 18, d: 2.8, r: 1.2 }, 3);
    put("drain.wing", [0, 0, wingZ + 2.5], `<g data-part="wing">${S(k.extrude(wing, wingZ, 5, P), { tone: "hi", lit: true })}</g>`, [A.extruded(wing, wingZ, 5, { name: "drain.wing" })], { piece });
    put("drain.spout", [0, 0, wingZ - 2.5], S(k.cylinder(0, 0, 1.7, wingZ - 5, 5, P, 16), { tone: "mid", crease: "none" }), [A.cylinder(0, 0, 1.7, wingZ - 5, 5, { name: "drain.spout" })], { piece });
  }

  function render() {
    A.settle(R, P);
    R.items.sort((a, b) => a.key - b.key);
    return R.items.map((item) => `<g data-piece="${item.piece}">${item.svg}</g>`).join("");
  }

  return { R, at, S, L, D, byDepth, put, hose, fitting, plate, wall, cup, drain, render };
}

// The glass bowl as one item: cavity and fuel behind, live water and drops, then the glass in front.
// cutaway: true draws a steel shell seen in section (the spin-on sump) instead of clear glass.
export function glassBowl(P, { z0, z1, r, mark, inside = "", cutaway = false }) {
  const L = (d, style) => k.lineSvg(d, style);
  const glass = k.cylinder(0, 0, r, z0, z1 - z0, P, 72);
  const fuel = k.cylinder(0, 0, r - 0.8, z0, z1 - z0, P, 72);
  const out = [`<path class="pc-cav" d="${glass.fill}"/>`, `<path class="pc-fuel" d="${fuel.fill}"/>`];
  out.push(`<path data-part="water" class="pc-water" d=""/>`, `<path data-part="surface" class="iso-line" data-tone="lit" d=""/>`);
  out.push(`<g data-part="drops-back" class="pc-drops"></g>`, inside, `<g data-part="drops-front" class="pc-drops"></g>`);
  out.push(`<g class="pc-glass${cutaway ? " pc-cut" : ""}">`);
  glass.shades.forEach((d, shade) => d && out.push(`<path class="iso-shade" data-shade="${shade}" d="${d}"/>`));
  out.push(`</g>`);
  // graduation: a ring at the drain mark and fine rings below it, all on the glass
  const rings = [];
  for (let z = z0 + 4; z < mark - 1; z += 4) rings.push(k.sideArc(0, 0, r, z, P, 48));
  if (!cutaway) {
    out.push(L(rings.join(""), { tone: "faint" }));
    out.push(L(k.sideArc(0, 0, r, mark, P, 48) + k.sideArc(0, 0, r, mark + 1.6, P, 48), { tone: "hi" }));
  }
  // a reflection down the glass, from the cap rim to under the collar, toward the light
  const a = ((P.azimuth + 58) * Math.PI) / 180;
  if (!cutaway) out.push(`<path class="pc-shine" d="${k.segment([Math.cos(a) * r, Math.sin(a) * r, z0], [Math.cos(a) * r, Math.sin(a) * r, z1], P)}"/>`);
  out.push(L(glass.outline, { tone: "mid" }));
  return out.join("");
}

// A steel shell seen in section: its inside (cavity), whatever sits inside it, then the shell's front shading and outline.
// part: "all" in one item, or "back" / "front" when something moving inside must be painted between them.
export function shellCut(P, { z0, z1, r, inside = "", part = "all" }) {
  const shell = k.cylinder(0, 0, r, z0, z1 - z0, P, 72);
  const back = `<path class="pc-cav" d="${shell.fill}"/>`;
  const front = [`<g class="pc-glass pc-cut">`, ...shell.shades.map((d, i) => (d ? `<path class="iso-shade" data-shade="${i}" d="${d}"/>` : "")), `</g>`, k.lineSvg(shell.outline, { tone: "mid" })].join("");
  return part === "back" ? back : part === "front" ? front : back + inside + front;
}

// A pleated filter element: end caps, vertical pleats, and fuel flow running down outside the pleats
// (the drawn flow lines start and end under the end caps, which are painted after them).
export function pleatedElement(P, { z0, z1, r, flow = true }) {
  const F = vertical(z0 + 2);
  const h = z1 - z0 - 4;
  const media = k.cylinder(0, 0, r, z0 + 2, h, P, 64);
  // bottom end cap first, so the pleats stand in front of its top face
  const out = [k.solidSvg(k.cylinder(0, 0, r + 3, z0, 2, P, 64), { tone: "mid" })];
  out.push(k.solidSvg(media, { tone: "mid", className: "pc-media" }), k.fadedSvg(G.ribsOf(F, 0, h, r + 0.01, 96, P, { fade: [0.12, 0.6] }), { tone: "lo" }));
  if (flow) {
    // fuel running down outside the pleats: each line starts under the top cap and runs out at the bottom of the element
    const lines = [];
    for (const deg of [-70, -40, -10, 20, 50]) {
      const a = ((P.azimuth + deg) * Math.PI) / 180, rr = r + 2.2;
      lines.push(k.segment([Math.cos(a) * rr, Math.sin(a) * rr, z1 - 1], [Math.cos(a) * rr, Math.sin(a) * rr, z0 + 3], P));
    }
    out.push(k.lineSvg(lines.join(""), { tone: "lo", className: "pc-flow", flow: true, free: "end" }));
  }
  out.push(k.solidSvg(k.cylinder(0, 0, r + 3, z1 - 2, 2, P, 64), { tone: "mid" }));
  return out.join("");
}

export const PAGE_CSS = `<style>
.pc-cav{fill:var(--anatomy-shade-0)}
.iso[data-theme="light"] .pc-cav{fill:#e8edf0}
.pc-fuel{fill:color-mix(in srgb,#c9a253 10%,var(--anatomy-paper));opacity:.92}
.pc-water{fill:color-mix(in srgb,var(--anatomy-blue) 30%,var(--anatomy-paper))}
.pc-drops circle{fill:color-mix(in srgb,var(--anatomy-blue) 72%,var(--anatomy-lit))}
.pc-drops circle.s{fill:color-mix(in srgb,#6b4f2e 70%,var(--anatomy-hi))}
.pc-swirl{stroke:color-mix(in srgb,var(--anatomy-blue) 55%,var(--anatomy-mid));opacity:.55;fill:none}
.pc-stream{stroke:color-mix(in srgb,var(--anatomy-blue) 72%,var(--anatomy-lit));stroke-width:1.2px}
.pc-glass .iso-shade{opacity:.26}
.pc-cut .iso-shade{opacity:.42}
.pc-media>.iso-fill,.pc-media>.iso-top{fill:color-mix(in srgb,#c9a253 16%,var(--anatomy-paper))}
.pc-flow{stroke:color-mix(in srgb,#c9a253 70%,var(--anatomy-mid));stroke-width:.9px}
.pc-shine{fill:none;stroke:#fff;stroke-width:1.8px;opacity:.85;stroke-linecap:butt}
.iso:not([data-theme="light"]) .pc-shine{opacity:.16}
.pc-media{fill:color-mix(in srgb,#c9a253 14%,var(--anatomy-paper))}
.pc-seal{fill:none;stroke:#c8372d;stroke-width:1.6px;stroke-linecap:butt}
</style>`;

// Live drain logic shared by both pages: water level, drops, wing and stream. Pasted into each page's script.
export const LIVE_BOWL = `
const SVGNS = "http://www.w3.org/2000/svg";
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const $ = (name) => svg.querySelector('[data-part="' + name + '"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const water = $("water"), surface = $("surface"), back = $("drops-back"), front = $("drops-front"), wing = $("wing"), stream = $("stream"), cupFill = $("cup-fill");
const WING = ringOf({ x: -9, y: -1.4, w: 18, d: 2.8, r: 1.2 }, 3);
const SPAN = B.mark - B.z0;
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const bowl = { level: 0.3, open: 0, opening: false, cup: 0, sediment: [] };
// solids (residues) settle on the floor of the bowl and are flushed out with the water when it drains
const settle = (x, y) => { if (bowl.sediment.length < 48) bowl.sediment.push([x, y]); };
function setSolid(group, paths) {
  group.querySelector(".iso-fill").setAttribute("d", paths.fill);
  group.querySelector(".iso-top").setAttribute("d", paths.top);
  group.querySelector(".iso-edge").setAttribute("d", paths.outline);
  const crease = group.querySelector(".iso-crease"); if (crease) crease.setAttribute("d", paths.crease);
  group.querySelectorAll(".iso-shade").forEach((node) => node.remove());
  paths.shades.forEach((d, i) => { if (!d) return; const n = document.createElementNS(SVGNS, "path"); n.setAttribute("class", "iso-shade"); n.setAttribute("data-shade", i); n.setAttribute("d", d); group.firstChild.after(n); });
}
const waterTop = () => B.z0 + 0.4 + bowl.level * SPAN;
function stepBowl(dt) {
  if (bowl.level >= 1) bowl.opening = true;
  if (bowl.level <= 0.08) bowl.opening = false;
  bowl.open += ((bowl.opening ? 1 : 0) - bowl.open) * (1 - Math.exp(-dt / 0.25));
  const out = bowl.open > 0.5 ? Math.min(bowl.level - 0.05, dt * 0.3 * bowl.open) : 0;
  if (out > 0) { bowl.level -= out; bowl.cup = Math.min(1, bowl.cup + out * 0.35); if (rand() < dt * 6) bowl.sediment.shift(); }
  else bowl.cup = Math.max(0, bowl.cup - dt * 0.02); // the cup is emptied between drains
}
function drawBowl(drops) {
  const top = waterTop();
  water.setAttribute("d", cylinder(0, 0, B.r - 0.8, B.z0, top - B.z0, P, 72).fill);
  surface.setAttribute("d", ring(0, 0, B.r - 0.8, top, P, 72));
  const dot = (p) => { const [x, y] = iso(p.at, P); return '<circle' + (p.solid ? ' class="s"' : "") + ' cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (p.solid ? "0.95" : "1.15") + '"/>'; };
  const floor = bowl.sediment.map(([x, y]) => ({ at: [x, y, B.z0 + 0.7], solid: true }));
  back.innerHTML = drops.filter((p) => p.back).map(dot).join("");
  front.innerHTML = floor.concat(drops.filter((p) => !p.back)).map(dot).join("");
  const a = bowl.open * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
  setSolid(wing.firstChild, extrude(WING.map(([x, y]) => [x * c - y * s, x * s + y * c]), B.wing, 5, P));
  stream.style.opacity = String(clamp((bowl.open - 0.5) * 2, 0, 1));
  cupFill.setAttribute("d", bowl.cup > 0.01 ? circleRingPath(B.cupR - 1.6, B.cupH - 0.6 - (1 - bowl.cup) * (B.cupH - 2.5)) : "");
}
function circleRingPath(r, z) { return "M" + circleRing(0, 0, r, 48).map(([x, y]) => iso([x, y, z], P).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z"; }
`;
