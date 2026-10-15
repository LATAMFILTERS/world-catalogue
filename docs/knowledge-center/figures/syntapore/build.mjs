// SYNTAPORE™ diesel particulate filtration (status in ../status.json): a primary and a secondary spin-on in one fuel circuit.
//   tank → primary (suction side, before the transfer pump) → transfer pump → secondary (pressure side, on the engine) → injection rail
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs [--light] [--audit] [--en]
//   --en  English page for the Knowledge Center, written to frontend/public/knowledge-center/figures
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, shellCut, pleatedElement, PAGE_CSS, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const EN = process.argv.includes("--en");
const WIDTH = 640;
const HEIGHT = 520;
const SERVICE = [0, 70, 0]; // where each spin-on goes when it is changed

const PLATE = { x: -164, y: -78, w: 328, d: 158, r: 8 };
const WALL = { x: -156, y: -74, w: 312, d: 8, r: 2 };
const WALL_TOP = 236;
const WALL_FACE = WALL.y + WALL.d;
const PY = -29; // the circuit runs in one plane in front of the wall
const HEAD_Z = 150;
const HEAD_H = 20;
const PORT_Z = HEAD_Z + HEAD_H / 2;
const CAN_R = 22;
const ER = 16; // element media radius; its end caps are 3 wider
const CAN_Z = 74;
const ST = HEAD_Z - 4;
const FILTERS = [
  { name: "primary", x: -85, mark: EN ? "PRIMARY" : "PRIMARIO" },
  { name: "secondary", x: 85, mark: EN ? "SECONDARY" : "SECUNDARIO" },
];
const PUMP = { x: -14, y: WALL_FACE, w: 28, d: PY + 11 - WALL_FACE, r: 3 };
const PUMP_Z = 104;
const PUMP_H = 32;
const RAIL = { x: -40, y: PY - 7, w: 140, d: 14, r: 4 };
const RAIL_Z = 198;
const RAIL_H = 14;
const BALL = 4.8;
const HOSE = 3;
const SINK = Math.sqrt(BALL * BALL - HOSE * HOSE);
const TANK = { x: -156, y: 8, w: 46, d: 64, r: 6 };
const TANK_H = 38;
const TANK_PORT = [-135, 40];
const COL = { left: -135, mid: -32, right: 135 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -15, 0),
    ...k.boxCorners(WALL, 0, WALL_TOP),
    ...FILTERS.flatMap(({ x }) => [[x - CAN_R, PY + SERVICE[1] + CAN_R, CAN_Z - 6], [x + CAN_R, PY + SERVICE[1] + CAN_R, ST]]),
    [RAIL.x, RAIL.y, RAIL_Z + RAIL_H + 12],
  ],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const ORDER = FILTERS.map(({ name }) => name);
const SPRING = { stagger: 0.12, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: [...ORDER, "stand"], spring: SPRING, pieces: { primary: SERVICE, secondary: SERVICE, stand: [0, 0, 0] } });
const { at, S, L, D, put, hose, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 120, y: 40, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-130, 40], [130, 40], [0, 60], [0, 180]]);

// a hose run with an elbow ball at every corner: each straight run ends rim-on-sphere on its ball
function line(name, points) {
  for (let i = 1; i < points.length - 1; i++) put(`${name}.elbow`, points[i], k.solidSvg(G.sphereOf(points[i], BALL, P), { tone: "mid" }), [A.ball(points[i], BALL, { name: `${name}.elbow` })]);
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const d = G.unit3(G.sub3(b, a));
    const from = i === 0 ? a : G.add3(a, G.mul3(d, SINK));
    const to = i === points.length - 2 ? b : G.sub3(b, G.mul3(d, SINK));
    hose(`${name}.hose`, [from, to], HOSE);
  }
}
const side = (x, dir) => G.frameOf([x, PY, PORT_Z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);

// two filter heads on the wall, each with its spin-on drawn in section so the pleated element can be seen
const reach = {};
for (const { name, x, mark } of FILTERS) {
  const EARS = { x: x - 20, y: WALL_FACE, w: 40, d: 9, r: 2 };
  const HEAD = { x: x - 28, y: EARS.y + EARS.d, w: 56, d: 2 * (PY - EARS.y - EARS.d), r: 8 };
  put(`${name}.ears`, [x, EARS.y + EARS.d / 2, HEAD_Z + 4], S(k.slabOf(EARS, HEAD_Z - 10, 38, P, 3, 0.5), { tone: "mid" }), [A.slab(EARS, HEAD_Z - 10, 38, { name: `${name}.ears` })]);
  const FRONT = HEAD.y + HEAD.d;
  const headMark =
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 16.2, P, "left"), "ELIMFILTERS", { size: 2.8, tone: "hi", anchor: "middle" }) +
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 12.6, P, "left"), "SYNTAPORE™ · EF9", { size: 2.1, tone: "mid", anchor: "middle" }) +
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 8.8, P, "left"), mark, { size: 1.9, tone: "lo", anchor: "middle" });
  put(`${name}.head`, [x, HEAD.y + HEAD.d / 2, HEAD_Z + HEAD_H / 2], S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 6, P, 8), { tone: "faint" }) }) + headMark, [A.slab(HEAD, HEAD_Z, HEAD_H, { name: `${name}.head` })]);
  reach[name] = {
    in: x - 28 - fitting(`${name}.inlet`, side(x - 28, -1)),
    out: x + 28 + fitting(`${name}.outlet`, side(x + 28, 1)),
  };
  // the spin-on: a steel shell in section with the pleated element and its trapped particles, a rolled seam and a closed end
  const seam = [[0, CAN_R - 2.5], [1, CAN_R + 0.8], [3, CAN_R + 0.8], [4, CAN_R - 2.5]];
  const endProfile = [[0, 12], [3, 19.5, 1], [6, CAN_R]];
  const dirt = `<g data-part="${name}-dirt" class="sp-dirt"></g>`;
  const piece = { piece: name };
  put(
    `${name}.canister`,
    [x, PY, (CAN_Z + ST) / 2],
    shellCut(P, { x, y: PY, z0: CAN_Z, z1: ST, r: CAN_R, inside: pleatedElement(P, { x, y: PY, z0: CAN_Z + 3, z1: ST, r: ER }) + dirt }) + S(G.solidOf(seam, vertical(ST, x, PY), P), { tone: "hi" }),
    [A.ring(vertical(CAN_Z, x, PY), 0, ST - CAN_Z, ER + 3.2, CAN_R, { name: `${name}.canister`, owner: `${name}.canister` }), A.cylinder(x, PY, ER + 3, CAN_Z + 3, ST - CAN_Z - 3, { name: `${name}.element`, owner: `${name}.canister` }), A.solid(vertical(ST, x, PY), seam, { name: `${name}.seam`, owner: `${name}.canister` })],
    piece,
  );
  put(`${name}.end`, [x, PY, CAN_Z - 3], S(G.solidOf(endProfile, vertical(CAN_Z - 6, x, PY), P), { tone: "hi" }), [A.solid(vertical(CAN_Z - 6, x, PY), endProfile, { name: `${name}.end` })], piece);
}

// transfer pump between the filters: suction from the primary, pressure to the secondary
put("pump", [0, PUMP.y + PUMP.d / 2, PUMP_Z + PUMP_H / 2], S(k.slabOf(PUMP, PUMP_Z, PUMP_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(PUMP, PUMP_Z + 8, P, 3), { tone: "faint" }) }), [A.slab(PUMP, PUMP_Z, PUMP_H, { name: "pump" })]);
const PF = G.frameOf([0, PUMP.y + PUMP.d, PUMP_Z + PUMP_H / 2], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
put("pump.cover", G.pointOf(PF, 1, 0, 0), S(G.disc(0, 2, 9, PF, P), { tone: "hi" }) + D(G.dotsOf(PF, 2, 6.5, 4, P, { all: true }), { size: 0.45 }), [A.disc(PF, 0, 2, 9, { name: "pump.cover" })]);
const PUMP_PORT_Z = PUMP_Z + PUMP_H / 2;
const pumpSide = (x, dir) => G.frameOf([x, PY, PUMP_PORT_Z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);
const pumpIn = -14 - fitting("pump.inlet", pumpSide(-14, -1), { boss: 6, hex: 4.6 });
const pumpOut = 14 + fitting("pump.outlet", pumpSide(14, 1), { boss: 6, hex: 4.6 });

// injection rail on two brackets, with four injectors along its top
for (const bx of [-20, 88]) {
  const BR = { x: bx - 4, y: WALL_FACE, w: 8, d: RAIL.y - WALL_FACE, r: 1 };
  put("rail.bracket", [bx, BR.y + BR.d / 2, RAIL_Z + RAIL_H / 2], S(k.slabOf(BR, RAIL_Z + 2, RAIL_H - 4, P, 2, 0.4), { tone: "mid" }), [A.slab(BR, RAIL_Z + 2, RAIL_H - 4, { name: "rail.bracket" })]);
}
put("rail", [RAIL.x + RAIL.w / 2, PY, RAIL_Z + RAIL_H / 2], S(k.slabOf(RAIL, RAIL_Z, RAIL_H, P, 6, 0.8), { tone: "mid" }), [A.slab(RAIL, RAIL_Z, RAIL_H, { name: "rail" })]);
for (const ix of [-22, 12, 46, 80]) {
  put("injector", [ix, PY, RAIL_Z + RAIL_H + 4], S(k.cylinder(ix, PY, 3.6, RAIL_Z + RAIL_H, 8, P, 24, 0.4), { tone: "mid" }) + S(k.cylinder(ix, PY, 2.2, RAIL_Z + RAIL_H + 8, 3, P, 20), { tone: "hi" }), [A.cylinder(ix, PY, 3.6, RAIL_Z + RAIL_H, 8, { name: "injector" }), A.cylinder(ix, PY, 2.2, RAIL_Z + RAIL_H + 8, 3, { name: "injector.cap" })]);
}
const RAIL_PORT_Z = RAIL_Z + RAIL_H / 2;
const railIn = RAIL.x + RAIL.w + fitting("rail.inlet", G.frameOf([RAIL.x + RAIL.w, PY, RAIL_PORT_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), { boss: 4.6, bossH: 3, hex: 3.8, hexH: 4 });

// fuel tank on the bench, with its outlet on top
put("tank", [TANK.x + TANK.w / 2, TANK.y + TANK.d / 2, TANK_H / 2], S(k.slabOf(TANK, 0, TANK_H, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(TANK, TANK_H - 8, P, 6), { tone: "faint" }) }) + k.faceTextSvg(k.sideMatrix([TANK.x + TANK.w / 2, TANK.y + TANK.d], TANK_H - 16, P, "left"), "DIESEL", { size: 3, tone: "lo", anchor: "middle" }), [A.slab(TANK, 0, TANK_H, { name: "tank" })]);
const tankUp = G.frameOf([...TANK_PORT, TANK_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const tankReach = TANK_H + fitting("tank.outlet", tankUp);

// the circuit: suction side (tank → primary → pump), pressure side (pump → secondary → rail)
line("suction", [[...TANK_PORT, tankReach], [...TANK_PORT, PORT_Z], [COL.left, PY, PORT_Z], [reach.primary.in, PY, PORT_Z]]);
line("transfer", [[reach.primary.out, PY, PORT_Z], [COL.mid, PY, PORT_Z], [COL.mid, PY, PUMP_PORT_Z], [pumpIn, PY, PUMP_PORT_Z]]);
line("pressure", [[pumpOut, PY, PUMP_PORT_Z], [-COL.mid, PY, PUMP_PORT_Z], [-COL.mid, PY, PORT_Z], [reach.secondary.in, PY, PORT_Z]]);
line("feed", [[reach.secondary.out, PY, PORT_Z], [COL.right, PY, PORT_Z], [COL.right, PY, RAIL_PORT_Z], [railIn, PY, RAIL_PORT_Z]]);

const layers = F.render();
// the feed hose plugs into the end of the rail, a rod, along its own axis: on screen its end meets the rail by design
A.auditOrExit(F.R, P, { crowd: [["feed.hose#3", "rail"]] });

const COPY = EN
  ? {
      hint: "Cursor: dirt · top: service",
      readout: "primary: low · secondary: low",
      keys: [
        { mark: "lit", label: "Larger particles held by the primary, finer particles by the secondary" },
        { mark: "raised", label: "Tank, primary spin-on (suction side), transfer pump, secondary spin-on (on the engine), injection rail" },
      ],
      caption:
        "Conceptual illustration of a diesel fuel circuit with two SYNTAPORE™ particulate filters. The primary, on the suction side before the transfer pump, holds the larger particles and protects the pump. The secondary, on the pressure side on the engine, holds the finer particles before the fuel reaches the injection system. Both are spin-ons shown in section, with the pleated element visible; at service each cartridge is replaced. Conceptual illustration: it shows no product data.",
      aria: "SYNTAPORE primary and secondary filters: arrow keys change the contamination in the fuel, E changes both filters",
      label:
        "Fuel circuit on a wall bracket: a tank on the bench feeds a primary spin-on filter, then a transfer pump, then a secondary spin-on filter and an injection rail with four injectors. Both filters are drawn in section with their pleated elements; the primary collects larger particles and the secondary finer ones.",
      title: "SYNTAPORE fuel filtration",
      live: { primary: "primary", secondary: "secondary", light: "low", building: "loading", heavy: "high", fresh: "new filters", out: "filters off · replaced" },
    }
  : {
      hint: "Cursor: suciedad · arriba: servicio",
      readout: "primario: baja · secundario: baja",
      keys: [
        { mark: "lit", label: "Partículas grandes retenidas en el primario, partículas finas en el secundario" },
        { mark: "raised", label: "Tanque, spin-on primario (succión), bomba de transferencia, spin-on secundario (en el motor), riel de inyección" },
      ],
      caption:
        "Ilustración conceptual de un circuito de combustible diésel con dos filtros de partículas SYNTAPORE™. El primario, en el lado de succión antes de la bomba de transferencia, retiene las partículas más grandes y protege la bomba. El secundario, en el lado de presión sobre el motor, retiene las partículas finas antes de que el combustible llegue al sistema de inyección. Ambos son spin-on vistos en corte, con el elemento plisado a la vista; en el servicio se reemplaza cada cartucho. Es una ilustración conceptual: no muestra datos de producto.",
      aria: "Filtros SYNTAPORE primario y secundario: flechas cambian la contaminación del combustible, E cambia ambos filtros",
      label:
        "Circuito de combustible sobre un soporte de pared: un tanque en el banco alimenta un filtro spin-on primario, luego una bomba de transferencia, luego un filtro spin-on secundario y un riel de inyección con cuatro inyectores. Ambos filtros se ven en corte con su elemento plisado; el primario retiene las partículas grandes y el secundario las finas.",
      title: "SYNTAPORE filtración de combustible",
      live: { primary: "primario", secondary: "secundario", light: "baja", building: "cargando", heavy: "alta", fresh: "filtros nuevos", out: "filtros fuera · se reemplazan" },
    };

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ moves: SERVICE, order: ORDER, spring: SPRING, filters: FILTERS.map(({ name, x }) => ({ name, x })), y: PY, z0: CAN_Z + 6, z1: ST - 5, r: ER })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const VIEW = [Math.cos(P.azimuth * Math.PI / 180), Math.sin(P.azimuth * Math.PI / 180)];
// the primary holds larger particles, the secondary the finer ones that got past it; only the front half of each element is drawn
const filters = SV.filters.map((f, i) => ({ name: f.name, cx: f.x, size: i ? 0.65 : 1.05, share: i ? 0.4 : 1, load: 0, stuck: [], moving: [], group: svg.querySelector('[data-part="' + f.name + '-dirt"]'), parts: [...svg.querySelectorAll('[data-piece="' + f.name + '"]')], x: 0, v: 0, target: 0, at: 0, next: 0 }));
let dirty = 0.5, dirtyTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function service(on) {
  (on ? filters : [...filters].reverse()).forEach((f, index) => { f.next = on ? 1 : 0; f.at = clock + (still.matches ? 0 : index * SV.spring.stagger); });
}
function draw() {
  for (const f of filters) {
    const dot = (p) => { const [x, y] = iso([f.cx + Math.cos(p.a) * p.r, SV.y + Math.sin(p.a) * p.r, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + f.size + '"/>'; };
    f.group.innerHTML = f.stuck.concat(f.moving).map(dot).join("");
    const shift = translateAlong(P, SV.moves.map((v) => v * f.x));
    const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
    for (const group of f.parts) { group.setAttribute("transform", shift); holdStill(group, [dx, dy]); }
  }
  const word = (f) => (f.load > 0.6 ? W.heavy : f.load > 0.15 ? W.building : W.light);
  const text = filters.some((f) => f.x > 0.5) ? W.out : fresh > 0 ? W.fresh : filters.map((f) => W[f.name] + ": " + word(f)).join(" · ");
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(dirty * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  fresh = Math.max(0, fresh - dt);
  if (touring) dirtyTarget = 0.55 + 0.4 * Math.sin(clock * 0.3);
  dirty += (dirtyTarget - dirty) * (1 - Math.exp(-dt / 0.5));
  for (const f of filters) {
    if (f.x < 0.05) {
      // particles carried by the fuel move in toward the pleats and stay on the media
      f.spawn = (f.spawn || 0) + dt * f.share * (0.5 + 6 * dirty);
      while (f.spawn > 1) { f.spawn -= 1; const a = Math.atan2(VIEW[1], VIEW[0]) + (rand() - 0.5) * 2.6; f.moving.push({ a, r: SV.r + 2.6, z: SV.z0 + rand() * (SV.z1 - SV.z0) }); }
      for (let i = f.moving.length - 1; i >= 0; i--) { const p = f.moving[i]; p.r -= dt * 3; if (p.r <= SV.r + 0.4) { f.moving.splice(i, 1); if (f.stuck.length < 160) f.stuck.push(p); } }
      f.load = Math.min(1, f.stuck.length / 160);
    }
    if (f.target !== f.next && clock >= f.at) f.target = f.next;
    for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; f.v += ((f.target - f.x) * SV.spring.stiffness - f.v * SV.spring.damping) * h; f.x += f.v * h; }
    // a new cartridge goes on clean
    if (f.x > 0.9 && f.stuck.length) { f.stuck = []; f.moving = []; f.load = 0; fresh = 2.5; }
  }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { for (const f of filters) f.x = f.target = f.next; draw(); } };
const steer = (next) => { touring = false; dirtyTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
let serviced = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const want = (event.clientY - box.top) / box.height < 0.25;
  if (want !== serviced) { serviced = want; service(want); }
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { if (serviced) { serviced = false; service(false); } run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(dirtyTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(dirtyTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { serviced = !serviced; service(serviced); run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>.sp-dirt circle{fill:color-mix(in srgb,#6b4f2e 75%,var(--anatomy-hi))}</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: "Fig 3",
  title: "ELIMFILTERS · SYNTAPORE™ · EF9",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

const name = theme === "light" ? "syntapore-light.html" : "syntapore.html";
const OUT = EN ? join(HERE, "../../../../frontend/public/knowledge-center/figures") : HERE;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, name), draftPage(k.pageHtml({ title: COPY.title, theme, body, script: KIT_NOTICE + kitScript() + live }), EN ? "en" : "es"));
console.log("wrote", name, F.R.items.length, "items");
