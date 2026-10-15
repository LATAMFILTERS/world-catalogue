// DRYCORE™ air-dryer protection (status in ../status.json): a desiccant cartridge in a pneumatic brake circuit.
//   compressor → DRYCORE cartridge (in section: desiccant bed, purge valve under it) → air reservoir → brake circuit
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs [--light] [--audit] [--lang es|en|pt] [--public]   (see pageTarget in ../common.mjs)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, shellCut, PAGE_CSS, pageTarget, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = pageTarget(HERE, "drycore");
const { lang: LANG, theme } = TARGET;
const WIDTH = 640;
const HEIGHT = 520;
const SERVICE = [0, 70, 0]; // where the spin-on goes when it is changed

const PLATE = { x: -164, y: -78, w: 328, d: 158, r: 8 };
const WALL = { x: -156, y: -74, w: 312, d: 8, r: 2 };
const WALL_TOP = 236;
const WALL_FACE = WALL.y + WALL.d;
const PY = -29; // the circuit runs in one plane in front of the wall
const HEAD_Z = 150;
const HEAD_H = 20;
const PORT_Z = HEAD_Z + HEAD_H / 2;
const CAN_R = 24;
const ER = 18; // element media radius; its end caps are 3 wider
const CAN_Z = 74;
const ST = HEAD_Z - 4;
const FX = 45; // the filter's axis
const PUMP = { x: -54, y: WALL_FACE, w: 28, d: PY + 11 - WALL_FACE, r: 3 };
const PUMP_Z = 104;
const PUMP_H = 32;
const PUMP_PORT_Z = PUMP_Z + PUMP_H / 2;
const GAL = { x: -40, y: PY - 7, w: 140, d: 14, r: 4 };
const GAL_Z = 198;
const GAL_H = 14;
const GAL_PORT_Z = GAL_Z + GAL_H / 2;
const PAN = { x: -158, y: 6, w: 70, d: 66, r: 4 }; // the brake-valve block on the bench
const PAN_H = 30;
const RETURN = [-108, 40];
const COL = { mid: -8, right: 135, drop: 140 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [FX - CAN_R, PY + SERVICE[1] + CAN_R, CAN_Z - 6], [FX + CAN_R, PY + SERVICE[1] + CAN_R, ST]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const SPRING = { stagger: 0, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: ["filter", "stand"], spring: SPRING, pieces: { filter: SERVICE, stand: [0, 0, 0] } });
const { S, L, D, put, line, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 120, y: 40, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-130, 40], [130, 40], [100, 110], [-100, 180]]);
const side = (x, z, dir) => G.frameOf([x, PY, z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);

// filter head on the block, with the spin-on drawn in section so the pleated element can be seen
const EARS = { x: FX - 20, y: WALL_FACE, w: 40, d: 9, r: 2 };
const HEAD = { x: FX - 28, y: EARS.y + EARS.d, w: 56, d: 2 * (PY - EARS.y - EARS.d), r: 8 };
put("head.ears", [FX, EARS.y + EARS.d / 2, HEAD_Z + 4], S(k.slabOf(EARS, HEAD_Z - 10, 38, P, 3, 0.5), { tone: "mid" }), [A.slab(EARS, HEAD_Z - 10, 38, { name: "head.ears" })]);
const FRONT = HEAD.y + HEAD.d;
const headMark =
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 16.2, P, "left"), "ELIMFILTERS", { size: 2.8, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 12.6, P, "left"), "DRYCORE™ · ED4", { size: 2.1, tone: "mid", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 8.8, P, "left"), { en: "AIR DRYER", es: "SECADOR DE AIRE", pt: "SECADOR DE AR" }[LANG], { size: 1.8, tone: "lo", anchor: "middle" });
put("head", [FX, HEAD.y + HEAD.d / 2, HEAD_Z + HEAD_H / 2], S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 6, P, 8), { tone: "faint" }) }) + headMark, [A.slab(HEAD, HEAD_Z, HEAD_H, { name: "head" })]);
const filterIn = FX - 28 - fitting("head.inlet", side(FX - 28, PORT_Z, -1));
const filterOut = FX + 28 + fitting("head.outlet", side(FX + 28, PORT_Z, 1));
const seam = [[0, CAN_R - 2.5], [1, CAN_R + 0.8], [3, CAN_R + 0.8], [4, CAN_R - 2.5]];
const endProfile = [[0, 13], [3, 21.5, 1], [6, CAN_R]];
const piece = { piece: "filter" };
// the desiccant bed: a canister of beads between two end plates, drawn as a tinted core with its front beads
const BED = k.cylinder(FX, PY, ER, CAN_Z + 5, ST - CAN_Z - 7, P, 64);
let beadSeed = 3;
const beadRand = () => ((beadSeed = (beadSeed * 16807) % 2147483647) / 2147483647);
const beads = Array.from({ length: 150 }, () => {
  const a = (P.azimuth * Math.PI) / 180 + (beadRand() - 0.5) * 2.6;
  return [FX + Math.cos(a) * (ER - 0.6), PY + Math.sin(a) * (ER - 0.6), CAN_Z + 7 + beadRand() * (ST - CAN_Z - 11)];
});
const desiccant =
  k.solidSvg(k.cylinder(FX, PY, ER + 3, CAN_Z + 3, 2, P, 64), { tone: "mid" }) +
  k.solidSvg(BED, { tone: "mid", className: "dc-bed" }) +
  D(beads.map((b) => k.iso(b, P)), { size: 0.75, tone: "lo" }) +
  k.solidSvg(k.cylinder(FX, PY, ER + 3, ST - 2, 2, P, 64), { tone: "mid" });
put(
  "canister",
  [FX, PY, (CAN_Z + ST) / 2],
  shellCut(P, { x: FX, y: PY, z0: CAN_Z, z1: ST, r: CAN_R, inside: desiccant + `<g data-part="dirt" class="dc-water"></g>` }) + `<g data-part="purge" class="dc-water"></g>` + S(G.solidOf(seam, vertical(ST, FX, PY), P), { tone: "hi" }),
  [A.ring(vertical(CAN_Z, FX, PY), 0, ST - CAN_Z, ER + 3.2, CAN_R, { name: "canister", owner: "canister" }), A.cylinder(FX, PY, ER + 3, CAN_Z + 3, ST - CAN_Z - 3, { name: "element", owner: "canister" }), A.solid(vertical(ST, FX, PY), seam, { name: "seam", owner: "canister" })],
  piece,
);
put("end", [FX, PY, CAN_Z - 3], S(G.solidOf(endProfile, vertical(CAN_Z - 6, FX, PY), P), { tone: "hi" }), [A.solid(vertical(CAN_Z - 6, FX, PY), endProfile, { name: "end" })], piece);
// purge valve under the cartridge: it opens on the purge cycle and expels the collected water
put("purge.valve", [FX, PY, CAN_Z - 10], S(k.cylinder(FX, PY, 6, CAN_Z - 14, 8, P, 6, 0.5), { tone: "mid" }) + S(k.cylinder(FX, PY, 2.4, CAN_Z - 18, 4, P, 20), { tone: "hi" }), [A.cylinder(FX, PY, 6, CAN_Z - 14, 8, { name: "purge.valve" }), A.cylinder(FX, PY, 2.4, CAN_Z - 18, 4, { name: "purge.spout" })], piece);

// air compressor, with an intake cap on its inlet
const PCX = PUMP.x + PUMP.w / 2;
put("pump", [PCX, PUMP.y + PUMP.d / 2, PUMP_Z + PUMP_H / 2], S(k.slabOf(PUMP, PUMP_Z, PUMP_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(PUMP, PUMP_Z + 8, P, 3), { tone: "faint" }) }), [A.slab(PUMP, PUMP_Z, PUMP_H, { name: "pump" })]);
const PF = G.frameOf([PCX, PUMP.y + PUMP.d, PUMP_PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
put("pump.cover", G.pointOf(PF, 1, 0, 0), S(G.disc(0, 2, 9, PF, P), { tone: "hi" }) + D(G.dotsOf(PF, 2, 6.5, 4, P, { all: true }), { size: 0.45 }), [A.disc(PF, 0, 2, 9, { name: "pump.cover" })]);
const pumpIn = PUMP.x - fitting("pump.inlet", side(PUMP.x, PUMP_PORT_Z, -1), { boss: 6, hex: 4.6 });
const INTAKE = G.frameOf([pumpIn, PY, PUMP_PORT_Z], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
put("intake", G.pointOf(INTAKE, 4, 0, 0), S(G.disc(0, 8, 9, INTAKE, P), { tone: "mid", inner: k.fadedSvg(G.ribsOf(INTAKE, 1, 7, 9.01, 24, P, { fade: [0.2, 0.7] }), { tone: "lo" }) }), [A.disc(INTAKE, 0, 8, 9, { name: "intake" })]);
const pumpOut = PUMP.x + PUMP.w + fitting("pump.outlet", side(PUMP.x + PUMP.w, PUMP_PORT_Z, 1), { boss: 6, hex: 4.6 });

const reservoirTag = k.faceTextSvg(k.sideMatrix([30, GAL.y + GAL.d], GAL_Z + 5, P, "left"), { en: "AIR RESERVOIR", es: "DEPÓSITO DE AIRE", pt: "RESERVATÓRIO DE AR" }[LANG], { size: 2.6, tone: "lo", anchor: "middle" });
// the air reservoir on two brackets, with its drain-free fittings along the top
for (const bx of [-20, 88]) {
  const BR = { x: bx - 4, y: WALL_FACE, w: 8, d: GAL.y - WALL_FACE, r: 1 };
  put("gallery.bracket", [bx, BR.y + BR.d / 2, GAL_Z + GAL_H / 2], S(k.slabOf(BR, GAL_Z + 2, GAL_H - 4, P, 2, 0.4), { tone: "mid" }), [A.slab(BR, GAL_Z + 2, GAL_H - 4, { name: "gallery.bracket" })]);
}
put("gallery", [GAL.x + GAL.w / 2, PY, GAL_PORT_Z], S(k.slabOf(GAL, GAL_Z, GAL_H, P, 6, 0.8), { tone: "mid" }) + reservoirTag, [A.slab(GAL, GAL_Z, GAL_H, { name: "gallery" })]);
const galIn = GAL.x + GAL.w + fitting("gallery.inlet", side(GAL.x + GAL.w, GAL_PORT_Z, 1), { boss: 4.6, bossH: 3, hex: 3.8, hexH: 4 });
const galOut = GAL.x - fitting("gallery.return", side(GAL.x, GAL_PORT_Z, -1), { boss: 4.6, bossH: 3, hex: 3.8, hexH: 4 });

// brake-valve block on the bench: the supply from the reservoir enters on top
put("pan", [PAN.x + PAN.w / 2, PAN.y + PAN.d / 2, PAN_H / 2], S(k.slabOf(PAN, 0, PAN_H, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(PAN, PAN_H - 6, P, 6), { tone: "faint" }) }) + k.faceTextSvg(k.sideMatrix([PAN.x + PAN.w / 2, PAN.y + PAN.d], PAN_H - 15, P, "left"), { en: "BRAKES", es: "FRENOS", pt: "FREIOS" }[LANG], { size: 3, tone: "lo", anchor: "middle" }), [A.slab(PAN, 0, PAN_H, { name: "pan" })]);
const up = ([x, y]) => G.frameOf([x, y, PAN_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const returnTop = PAN_H + fitting("pan.return", up(RETURN));

// the circuit: compressor → dryer → reservoir → brake valves
line("pressure", [[pumpOut, PY, PUMP_PORT_Z], [COL.mid, PY, PUMP_PORT_Z], [COL.mid, PY, PORT_Z], [filterIn, PY, PORT_Z]]);
line("feed", [[filterOut, PY, PORT_Z], [COL.right, PY, PORT_Z], [COL.right, PY, GAL_PORT_Z], [galIn, PY, GAL_PORT_Z]]);
// the supply drops from the reservoir, then comes forward and down into the brake-valve block
line("return", [[galOut, PY, GAL_PORT_Z], [RETURN[0], PY, GAL_PORT_Z], [RETURN[0], PY, COL.drop], [...RETURN, COL.drop], [...RETURN, returnTop]]);

const layers = F.render();
// the reservoir hoses plug into the ends of the reservoir, a rod, along its own axis: on screen their ends meet it by design
A.auditOrExit(F.R, P, { crowd: [["feed.hose#3", "gallery"], ["return.hose", "gallery"]] });

const COPY = {
  en: {
    hint: "Cursor: humidity · top: service",
    readout: "desiccant: dry",
    keys: [
      { mark: "blue", label: "Moisture taken up by the desiccant bed, and water expelled by the purge valve" },
      { mark: "raised", label: "Compressor with intake, DRYCORE cartridge (in section) with purge valve, air reservoir, brake valves" },
    ],
    caption:
      "Conceptual illustration of a pneumatic brake circuit with a DRYCORE™ air-dryer cartridge. Compressed air from the compressor passes through the cartridge, shown in section, where the desiccant bed takes up its moisture before the air reaches the reservoir and the brake valves. On the purge cycle the purge valve opens and expels the collected water, and the bed is regenerated. Recurring water downstream of the dryer is a system symptom that calls for inspecting the compressor, governor, purge cycle and reservoirs. At service the cartridge is replaced. Illustrative simulation of how it works: a conceptual animation, not an engineering model or test result, and it shows no product data.",
    aria: "DRYCORE air dryer: arrow keys change the humidity in the air, E changes the cartridge",
    label:
      "Pneumatic brake circuit on a wall bracket: a compressor with an intake, an air-dryer cartridge drawn in section with its desiccant bed and a purge valve under it, an air reservoir and a brake-valve block on the bench. Moisture collects in the bed and the purge valve periodically drops the water out.",
    title: "DRYCORE air dryer",
    live: { filter: "desiccant", light: "dry", building: "taking up moisture", heavy: "near saturation", purging: "purge valve open · expelling water", fresh: "new cartridge", out: "cartridge off · replaced" },
  },
  es: {
    hint: "Cursor: humedad · arriba: servicio",
    readout: "desecante: seco",
    keys: [
      { mark: "blue", label: "Humedad retenida por el lecho de desecante y agua expulsada por la válvula de purga" },
      { mark: "raised", label: "Compresor con toma de aire, cartucho DRYCORE (en corte) con válvula de purga, depósito de aire, válvulas de freno" },
    ],
    caption:
      "Ilustración conceptual de un circuito neumático de frenos con un cartucho secador de aire DRYCORE™. El aire comprimido que sale del compresor atraviesa el cartucho, visto en corte, donde el lecho de desecante retiene su humedad antes de que el aire llegue al depósito y a las válvulas de freno. En el ciclo de purga, la válvula de purga se abre y expulsa el agua acumulada, y el lecho se regenera. La presencia recurrente de agua aguas abajo del secador es un síntoma del sistema que obliga a revisar el compresor, el gobernador, el ciclo de purga y los depósitos. En el servicio se reemplaza el cartucho. Simulación ilustrativa del funcionamiento: es una animación conceptual, no un modelo de ingeniería ni un resultado de prueba, y no muestra datos de producto.",
    aria: "Secador de aire DRYCORE: flechas cambian la humedad del aire, E cambia el cartucho",
    label:
      "Circuito neumático de frenos sobre un soporte de pared: un compresor con toma de aire, un cartucho secador en corte con su lecho de desecante y una válvula de purga debajo, un depósito de aire y un bloque de válvulas de freno en el banco. La humedad se acumula en el lecho y la válvula de purga expulsa el agua periódicamente.",
    title: "DRYCORE secador de aire",
    live: { filter: "desecante", light: "seco", building: "reteniendo humedad", heavy: "cerca de saturarse", purging: "válvula de purga abierta · expulsando agua", fresh: "cartucho nuevo", out: "cartucho fuera · se reemplaza" },
  },
  pt: {
    hint: "Cursor: umidade · topo: manutenção",
    readout: "dessecante: seco",
    keys: [
      { mark: "blue", label: "Umidade retida pelo leito de dessecante e água expulsa pela válvula de purga" },
      { mark: "raised", label: "Compressor com tomada de ar, cartucho DRYCORE (em corte) com válvula de purga, reservatório de ar, válvulas de freio" },
    ],
    caption:
      "Ilustração conceitual de um circuito pneumático de freios com um cartucho secador de ar DRYCORE™. O ar comprimido que sai do compressor atravessa o cartucho, visto em corte, onde o leito de dessecante retém sua umidade antes que o ar chegue ao reservatório e às válvulas de freio. No ciclo de purga, a válvula de purga se abre e expulsa a água acumulada, e o leito é regenerado. A presença recorrente de água a jusante do secador é um sintoma do sistema que exige inspecionar o compressor, o governador, o ciclo de purga e os reservatórios. Na manutenção substitui-se o cartucho. Simulação ilustrativa do funcionamento: é uma animação conceitual, não um modelo de engenharia nem um resultado de ensaio, e não mostra dados de produto.",
    aria: "Secador de ar DRYCORE: setas mudam a umidade do ar, E troca o cartucho",
    label:
      "Circuito pneumático de freios sobre um suporte de parede: um compressor com tomada de ar, um cartucho secador em corte com o leito de dessecante e uma válvula de purga embaixo, um reservatório de ar e um bloco de válvulas de freio na bancada. A umidade acumula-se no leito e a válvula de purga expulsa a água periodicamente.",
    title: "DRYCORE secador de ar",
    live: { filter: "dessecante", light: "seco", building: "retendo umidade", heavy: "perto de saturar", purging: "válvula de purga aberta · expulsando água", fresh: "cartucho novo", out: "cartucho fora · substituído" },
  },
}[LANG];

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ move: SERVICE, spring: SPRING, x: FX, y: PY, z0: CAN_Z + 9, z1: ST - 6, r: ER - 0.4, spout: CAN_Z - 19, floor: 4 })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 13;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const VIEW = Math.atan2(Math.sin(P.azimuth * Math.PI / 180), Math.cos(P.azimuth * Math.PI / 180));
const group = svg.querySelector('[data-part="dirt"]'), purgeGroup = svg.querySelector('[data-part="purge"]');
// the purge cycle: when the bed holds enough moisture the purge valve opens and water drops out under the cartridge
const purge = { drops: [], timer: 0, open: 0 };
const parts = [...svg.querySelectorAll('[data-piece="filter"]')];
// moisture carried by the compressed air is taken up by the front of the desiccant bed; the purge cycle expels it
const filter = { stuck: [], moving: [], load: 0, x: 0, v: 0, target: 0, spawn: 0 };
let wear = 0.5, wearTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function draw() {
  const dot = (p) => { const [x, y] = iso([SV.x + Math.cos(p.a) * p.r, SV.y + Math.sin(p.a) * p.r, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + p.size + '"/>'; };
  group.innerHTML = filter.stuck.concat(filter.moving).map(dot).join("");
  purgeGroup.innerHTML = purge.drops.map((p) => { const [x, y] = iso([SV.x + p.dx, SV.y + p.dy, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.1"/>'; }).join("");
  const shift = translateAlong(P, SV.move.map((v) => v * filter.x));
  const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
  for (const g of parts) { g.setAttribute("transform", shift); holdStill(g, [dx, dy]); }
  const word = filter.load > 0.6 ? W.heavy : filter.load > 0.15 ? W.building : W.light;
  const text = filter.x > 0.5 ? W.out : fresh > 0 ? W.fresh : purge.open > 0 ? W.purging : W.filter + ": " + word;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(wear * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  fresh = Math.max(0, fresh - dt);
  if (touring) wearTarget = 0.55 + 0.4 * Math.sin(clock * 0.3);
  wear += (wearTarget - wear) * (1 - Math.exp(-dt / 0.5));
  if (filter.x < 0.05) {
    filter.spawn += dt * (0.6 + 7 * wear);
    while (filter.spawn > 1) { filter.spawn -= 1; filter.moving.push({ a: VIEW + (rand() - 0.5) * 2.6, r: SV.r + 3, z: SV.z0 + rand() * (SV.z1 - SV.z0), size: rand() < 0.35 ? 1 : 0.6 }); }
    for (let i = filter.moving.length - 1; i >= 0; i--) { const p = filter.moving[i]; p.r -= dt * 3; if (p.r <= SV.r) { filter.moving.splice(i, 1); if (filter.stuck.length < 200) filter.stuck.push(p); } }
    filter.load = Math.min(1, filter.stuck.length / 200);
    // purge: after a while with moisture in the bed, open the valve, drop water and give part of the bed back
    purge.timer += dt;
    if (purge.open <= 0 && purge.timer > 6 && filter.load > 0.25) { purge.open = 1.6; purge.timer = 0; filter.stuck.splice(0, Math.floor(filter.stuck.length * 0.6)); }
    if (purge.open > 0) { purge.open -= dt; if (rand() < dt * 18) purge.drops.push({ dx: (rand() - 0.5) * 2, dy: (rand() - 0.5) * 2, z: SV.spout, v: 6 }); }
  }
  for (let i = purge.drops.length - 1; i >= 0; i--) { const p = purge.drops[i]; p.v = Math.min(p.v + 60 * dt, 40); p.z -= p.v * dt; if (p.z < SV.floor || filter.x > 0.05) purge.drops.splice(i, 1); }
  for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; filter.v += ((filter.target - filter.x) * SV.spring.stiffness - filter.v * SV.spring.damping) * h; filter.x += filter.v * h; }
  // a new spin-on goes on clean
  if (filter.x > 0.9 && filter.stuck.length) { filter.stuck = []; filter.moving = []; filter.load = 0; fresh = 2.5; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { filter.x = filter.target; draw(); } };
const steer = (next) => { touring = false; wearTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  filter.target = (event.clientY - box.top) / box.height < 0.25 ? 1 : 0;
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { filter.target = 0; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(wearTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(wearTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { filter.target = filter.target ? 0 : 1; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>.dc-water circle{fill:color-mix(in srgb,var(--anatomy-blue) 72%,var(--anatomy-lit))}.dc-bed>.iso-fill,.dc-bed>.iso-top{fill:color-mix(in srgb,#d9c48a 22%,var(--anatomy-paper))}</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: "Fig 9",
  title: "ELIMFILTERS · DRYCORE™ · ED4",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

mkdirSync(TARGET.dir, { recursive: true });
writeFileSync(TARGET.path, draftPage(k.pageHtml({ title: COPY.title, theme, body, script: KIT_NOTICE + kitScript() + live }), LANG));
console.log("wrote", TARGET.file, F.R.items.length, "items");
