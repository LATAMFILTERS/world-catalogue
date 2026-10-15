// DRAFT (internal-only, see ../README.md): HYDROCORE™ standard non-turbine fuel/water separators, two variants:
//   default    separator with a reusable transparent bowl and drain (service: change the element, keep the bowl)
//   --spinon   spin-on with an integrated drain, sump shown in section (service: replace the whole cartridge)
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Percentages shown are illustrative, not product data.
//   --housing  replaceable element inside a tall transparent bowl under a permanent metal shroud (service: bowl off, change the element, refit the bowl)
// node build.mjs [--spinon|--housing] [--light] [--audit] [--en]
//   --en  English page for the Knowledge Center, written to frontend/public/knowledge-center/figures
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, glassBowl, shellCut, pleatedElement, PAGE_CSS, LIVE_BOWL, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const SPINON = process.argv.includes("--spinon");
const HOUSING = process.argv.includes("--housing");
const EN = process.argv.includes("--en");
const SERVICE = [0, 78, 0]; // where the element (bowl variant), the whole cartridge (spin-on) or the bowl with its element (housing) goes at service
const WIDTH = 600;
const HEIGHT = 520;

const PLATE = { x: -84, y: -78, w: 168, d: 156, r: 8 };
const WALL = { x: -78, y: -74, w: 156, d: 8, r: 2 };
const WALL_TOP = 222;
const WALL_FACE = WALL.y + WALL.d;
const EARS = { x: -46, y: WALL_FACE, w: 92, d: 9, r: 2 };
const HEAD = { x: -30, y: EARS.y + EARS.d, w: 60, d: 87, r: 9 };
const HEAD_Z = 172;
const HEAD_TOP = HEAD_Z + 20;
const PUMP = [0, 6];
const CAN_Z = SPINON ? 84 : 94;
const COLLAR_Z = 89;
// the housing variant's bowl runs up to the shroud and holds the element; drops leave from under the element (B.from)
const SHROUD_Z = 148;
const SEAL = 1.6;
const EL = { z0: 76, z1: SHROUD_Z - SEAL - 1 };
const B = SPINON
  ? { z0: 50, z1: CAN_Z, r: 26, mark: 72, wing: 15, cupR: 13, cupH: 6 }
  : HOUSING
  ? { z0: 40, z1: SHROUD_Z - SEAL, r: 26, mark: 66, wing: 15, cupR: 13, cupH: 6, from: EL.z0 }
  : { z0: 40, z1: COLLAR_Z, r: 21.5, mark: 74, wing: 15, cupR: 13, cupH: 6 };
const CAP_Z = 32;
const VALVE_Z = 25;
const PORT_Y = -14;
const PORT_Z = HEAD_Z + 10;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [84, PORT_Y, PORT_Z], [-84, PORT_Y, PORT_Z], [27, SERVICE[1] + 27, HEAD_Z], [-27, SERVICE[1] - 27, B.z0 - 25]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 40 },
);
// moving pieces in service order; the housing variant takes the bowl off before the element drops out
const MOVES = HOUSING ? { bowl: SERVICE } : { element: SERVICE };
const ORDER = Object.keys(MOVES);
const SPRING = { stagger: 0.035, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: [...ORDER, "stand"], spring: SPRING, pieces: { ...MOVES, stand: [0, 0, 0] } });
const { at, S, L, D, put, hose, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 40, y: 36, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-62, 40], [62, 40], [-62, 110], [62, 110]]);

// cast head: ears bolted to the wall, a body with a parting seam, flow arrows, plugs, a hand primer pump and a bleed screw
put("head.ears", [0, EARS.y + EARS.d / 2, HEAD_Z + 4], S(k.slabOf(EARS, HEAD_Z - 12, 44, P, 3, 0.5), { tone: "mid" }) + D([[-40, HEAD_Z - 6], [40, HEAD_Z - 6], [-40, HEAD_TOP + 6], [40, HEAD_TOP + 6]].map(([x, z]) => at([x, EARS.y + EARS.d, z])), { size: 0.6, tone: "hi" }), [A.slab(EARS, HEAD_Z - 12, 44, { name: "head.ears" })]);
const arrows = [-1, 1].map((side) => k.onTop([[side * 12 - 4, PORT_Y], [side * 12 + 4, PORT_Y]], HEAD_TOP, P) + k.onTop([[side * 12 + 1, PORT_Y - 3], [side * 12 + 4, PORT_Y], [side * 12 + 1, PORT_Y + 3]], HEAD_TOP, P)).join("");
// brand, technology and series prefix cast into the head's front face
const FRONT = HEAD.y + HEAD.d;
const headMark =
  k.faceTextSvg(k.sideMatrix([0, FRONT], HEAD_Z + 18.6, P, "left"), "ELIMFILTERS", { size: 3, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([0, FRONT], HEAD_Z + 15, P, "left"), "HYDROCORE™ · ES9", { size: 2.2, tone: "mid", anchor: "middle" });
put("head", [0, HEAD.y + HEAD.d / 2, HEAD_Z + 10], S(k.slabOf(HEAD, HEAD_Z, 20, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 6, P, 8), { tone: "faint" }) }) + L(arrows, { tone: "lo", free: true }) + headMark, [A.slab(HEAD, HEAD_Z, 20, { name: "head" })]);
for (const x of [-14, 14]) fitting("head.plug", G.frameOf([x, HEAD.y + HEAD.d, HEAD_Z + 8], [0, 1, 0], [1, 0, 0], [0, 0, 1]), { boss: 4.2, bossH: 1.6, hex: 3.4, hexH: 3 });
put("pump.base", [PUMP[0], PUMP[1], HEAD_TOP + 1.5], S(k.cylinder(PUMP[0], PUMP[1], 13, HEAD_TOP, 3, P, 48, 0.5), { tone: "mid" }) + D(G.dotsOf(vertical(HEAD_TOP + 3, ...PUMP), 0, 10.6, 6, P, { all: true }), { size: 0.45 }), [A.cylinder(PUMP[0], PUMP[1], 13, HEAD_TOP, 3, { name: "pump.base" })]);
put("pump.barrel", [PUMP[0], PUMP[1], HEAD_TOP + 6], S(k.cylinder(PUMP[0], PUMP[1], 7.5, HEAD_TOP + 3, 6, P, 32), { tone: "mid", crease: "none" }), [A.cylinder(PUMP[0], PUMP[1], 7.5, HEAD_TOP + 3, 6, { name: "pump.barrel" })]);
put("pump.knob", [PUMP[0], PUMP[1], HEAD_TOP + 12], S(k.cylinder(PUMP[0], PUMP[1], 10, HEAD_TOP + 9, 6, P, 48, 0.5), { tone: "hi" }) + L(k.knurl(PUMP[0], PUMP[1], 10, HEAD_TOP + 9.6, HEAD_TOP + 14.4, 44, P, 0.3), { tone: "lo" }) + L(k.ring(PUMP[0], PUMP[1], 6, HEAD_TOP + 15, P, 32), { tone: "faint" }), [A.cylinder(PUMP[0], PUMP[1], 10, HEAD_TOP + 9, 6, { name: "pump.knob" })]);
put("bleed", [18, 18, HEAD_TOP + 1.5], S(k.cylinder(18, 18, 3.2, HEAD_TOP, 3, P, 6), { tone: "mid" }) + D([at([18, 18, HEAD_TOP + 3])], { size: 0.5, tone: "hi" }), [A.cylinder(18, 18, 3.2, HEAD_TOP, 3, { name: "bleed" })]);

// inlet and outlet: a boss and hex on each side of the head, a hose back to a bulkhead fitting in the wall
for (const side of [-1, 1]) {
  const name = side < 0 ? "inlet" : "outlet";
  const reach = fitting(`${name}.port`, G.frameOf([side * 30, PORT_Y, PORT_Z], [side, 0, 0], [0, 1, 0], [0, 0, 1]));
  const wallReach = fitting(`${name}.bulkhead`, G.frameOf([side * 70, WALL_FACE, PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), { boss: 6.6, hex: 5.2 });
  // a 90° elbow fitting at the corner: each hose run ends rim-on-sphere on the ball
  const corner = [side * 70, PORT_Y, PORT_Z], ballR = 4.8, sink = Math.sqrt(ballR * ballR - 9);
  put(`${name}.elbow`, corner, k.solidSvg(G.sphereOf(corner, ballR, P), { tone: "mid" }), [A.ball(corner, ballR, { name: `${name}.elbow` })]);
  hose(`${name}.hose`, [[side * (30 + reach), PORT_Y, PORT_Z], [side * (70 - sink), PORT_Y, PORT_Z]], 3);
  hose(`${name}.hose`, [[side * 70, PORT_Y - sink, PORT_Z], [side * 70, WALL_FACE + wallReach, PORT_Z]], 3);
}

// the cartridge (or the housing) is drawn in section, so the pleated element inside can be seen
const CAN = vertical(CAN_Z);
const H = HEAD_Z - CAN_Z;
const ER = 19; // element media radius; its end caps are 3 wider
const element = { piece: "element" };
const keep = { piece: HOUSING ? "bowl" : "stand" };
if (HOUSING) {
  // permanent cast shroud under the head, with a lip where the bowl's seal seats
  const SF = vertical(SHROUD_Z);
  const SP = [[0, 27.4], [3, 27.4], [3.6, 26.6], [HEAD_Z - SHROUD_Z, 26.6]];
  const edge = L(G.arcOf(SF, 3, 27.4, P, { trim: 0, least: 0 }), { tone: "faint" });
  put("shroud", [0, 0, (SHROUD_Z + HEAD_Z) / 2], S(G.solidOf(SP, SF, P), { tone: "mid", inner: edge }), [A.solid(SF, SP, { name: "shroud" })]);
} else {
  // the spin-on: a steel shell in section with the pleated element inside, closed by a rolled seam at the head
  const ST = HEAD_Z - 4;
  const seam = [[0, 23.5], [1, 26.8], [3, 26.8], [4, 23.5]];
  put(
    "canister",
    [0, 0, CAN_Z + H / 2],
    shellCut(P, { z0: CAN_Z, z1: ST, r: 26, inside: pleatedElement(P, { z0: CAN_Z + 3, z1: ST, r: ER }) }) + S(G.solidOf(seam, vertical(ST), P), { tone: "hi" }),
    [A.ring(CAN, 0, ST - CAN_Z, 22.2, 26, { name: "canister", owner: "canister" }), A.cylinder(0, 0, ER + 3, CAN_Z + 3, ST - CAN_Z - 3, { name: "canister.element", owner: "canister" }), A.solid(vertical(ST), seam, { name: "canister.seam", owner: "canister" })],
    element,
  );
}

const V0 = vertical(VALVE_Z);
if (SPINON) {
  // the lower shell of the same cartridge, cut away to show the sump; a domed end with a rolled seam and the drain
  put("sump", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, { ...B, cutaway: true }), [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "sump" })], element);
  const e = B.z0 - VALVE_Z;
  const endProfile = [[0, 6], [CAP_Z - VALVE_Z - 2, 15, 1], [CAP_Z - VALVE_Z, 22], [e - 4, 26], [e - 3.5, 26.8], [e, 26.8]];
  put("end", [0, 0, (VALVE_Z + B.z0) / 2], S(G.solidOf(endProfile, V0, P), { tone: "hi", inner: L(G.arcOf(V0, e - 1.75, 26.8, P, { trim: 0, least: 0 }), { tone: "faint" }) }), [A.solid(V0, endProfile, { name: "end" })], element);
  F.drain(VALVE_Z, B.wing, element);
} else {
  // threaded collar (bowl variant), the reusable glass bowl, the drain cap and the drain: these stay when the element is changed
  const C = vertical(COLLAR_Z);
  const collarProfile = [[0, 22.6], [0.8, 23.6], [CAN_Z - COLLAR_Z - 0.8, 23.6], [CAN_Z - COLLAR_Z, 22.6]];
  if (!HOUSING) put("collar", [0, 0, COLLAR_Z + 2.5], S(G.solidOf(collarProfile, C, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(C, 0.8, CAN_Z - COLLAR_Z - 0.8, 23.6, 40, P, { fade: [0.3, 0.75] }), { tone: "lo" }), [A.solid(C, collarProfile, { name: "collar" })], keep);
  if (HOUSING) {
    // the tall bowl carries the pleated element, seen through the glass, and a red seal ring at its rim
    const seal = `<path class="pc-seal" d="${k.sideArc(0, 0, B.r + 0.3, B.z1 + SEAL / 2, P, 64)}"/>`;
    put("bowl", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, { ...B, inside: pleatedElement(P, { z0: EL.z0, z1: EL.z1, r: ER }) }) + seal, [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "bowl" }), A.cylinder(0, 0, B.r + 0.6, B.z1, SEAL, { name: "bowl.seal" })], keep);
  } else put("bowl", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, B), [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "bowl" })], keep);
  const capProfile = [[0, 6], [CAP_Z - VALVE_Z - 2, 14, 1], [CAP_Z - VALVE_Z, B.r - 1.5], [B.z0 - VALVE_Z, B.r + 1.1]];
  put("cap", [0, 0, (VALVE_Z + B.z0) / 2], S(G.solidOf(capProfile, V0, P), { tone: "mid", inner: L(G.arcOf(V0, B.z0 - VALVE_Z - 2.4, B.r + 0.6, P), { tone: "faint" }) }), [A.solid(V0, capProfile, { name: "cap" })], keep);
  F.drain(VALVE_Z, B.wing, keep);
}
F.cup(B.cupR, B.cupH, B.wing - 5);

const layers = F.render();
A.auditOrExit(F.R, P);


const LIVE_TEXT = EN
  ? { cartridge: "cartridge", bowl: "bowl", cartridgeOut: "cartridge off · replaced whole", elementOut: "element off · bowl reused", bowlOut: "bowl off · element changed", draining: " · draining", full: " · near the limit", collecting: " · collecting water", much: "much", some: "some", little: "little", water: " water in the fuel, " }
  : { cartridge: "cartucho", bowl: "vaso", cartridgeOut: "cartucho fuera · se cambia entero", elementOut: "elemento fuera · vaso reutilizado", bowlOut: "vaso fuera · se cambia el elemento", draining: " · purgando", full: " · llegando al límite", collecting: " · acumulando agua", much: "mucha", some: "algo de", little: "poca", water: " agua en el combustible, " };

const live = `
const P = ${JSON.stringify(P)};
const B = ${JSON.stringify(B)};
const SV = ${JSON.stringify({ moves: MOVES, order: ORDER, spring: SPRING, spinon: SPINON, housing: HOUSING })};
const T = ${JSON.stringify(LIVE_TEXT)};
${LIVE_BOWL}
// service: each moving piece springs out on the page's own stagger, back in reverse order (as the audit replays it)
const parts = Object.fromEntries(SV.order.map((name) => [name, { x: 0, v: 0, target: 0, at: 0, next: 0, groups: [...svg.querySelectorAll('[data-piece="' + name + '"]')] }]));
const svc = { on: false };
function service(on) {
  svc.on = on;
  (on ? SV.order : [...SV.order].reverse()).forEach((name, index) => { parts[name].next = on ? 1 : 0; parts[name].at = clock + (still.matches ? 0 : index * SV.spring.stagger); });
}
const out = () => Math.max(...SV.order.map((name) => parts[name].x));
let wet = 0.5, wetTarget = 0.5, spawn = 0, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false;
const falling = [];
function draw() {
  drawBowl(falling.map((d) => ({ at: [d.x, d.y, d.z], back: false, solid: d.solid })));
  for (const name of SV.order) {
    const shift = translateAlong(P, SV.moves[name].map((v) => v * parts[name].x));
    const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
    for (const group of parts[name].groups) { group.setAttribute("transform", shift); holdStill(group, [dx, dy]); }
  }
  const el = parts.element ? parts.element.x : 0, bw = parts.bowl ? parts.bowl.x : 0;
  const where = SV.spinon ? T.cartridge : T.bowl;
  const text = el > 0.5
    ? (SV.spinon ? T.cartridgeOut : T.elementOut)
    : bw > 0.5 ? T.bowlOut
    : bowl.open > 0.5 ? where + T.draining : bowl.level > 0.85 ? where + T.full : where + T.collecting;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(wet * 100)));
  stage.setAttribute("aria-valuetext", (wet > 0.66 ? T.much : wet > 0.33 ? T.some : T.little) + T.water + text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  if (touring) wetTarget = 0.55 + 0.4 * Math.sin(clock * 0.35);
  wet += (wetTarget - wet) * (1 - Math.exp(-dt / 0.5));
  // water separated by the media leaves the element's bottom as drops, denser than the fuel, and settles
  spawn += out() > 0.05 ? 0 : dt * (0.6 + 5 * wet); // no separation while the service is under way
  while (spawn > 1) { spawn -= 1; const r = Math.sqrt(rand()) * 13, a = rand() * Math.PI * 2; falling.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: (B.from ?? B.z1) - 1, v: 0, solid: rand() < 0.3 }); }
  const top = waterTop();
  for (let i = falling.length - 1; i >= 0; i--) {
    const d = falling[i];
    d.v = Math.min(d.v + 60 * dt, 34);
    d.z -= d.v * dt;
    // water joins the column; solids (residues) keep sinking to the floor of the bowl
    if (d.solid) { if (d.z <= B.z0 + 0.8) { falling.splice(i, 1); settle(d.x, d.y); } else if (d.z <= top) d.v = Math.min(d.v, 10); }
    else if (d.z <= top) { falling.splice(i, 1); bowl.level = Math.min(bowl.level + 0.012, 1.08); }
  }
  stepBowl(dt);
  for (const part of Object.values(parts)) {
    if (part.target !== part.next && clock >= part.at) part.target = part.next;
    for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; part.v += ((part.target - part.x) * SV.spring.stiffness - part.v * SV.spring.damping) * h; part.x += part.v * h; }
  }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { for (const part of Object.values(parts)) part.x = part.target = part.next; draw(); } };
const steer = (next) => { touring = false; wetTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const want = (event.clientY - box.top) / box.height < 0.3;
  if (want !== svc.on) service(want);
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { if (svc.on) service(false); run(); });
stage.addEventListener("click", () => { bowl.opening = true; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(wetTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(wetTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { service(!svc.on); run(); }
  else if (event.key === " " || event.key === "Enter") { bowl.opening = true; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const COPY_EN = HOUSING
  ? {
      fig: "Fig 1C",
      hint: "Top: service · click: drain",
      readout: "bowl · collecting water",
      keys: [
        { mark: "lit", label: "Water level in the bowl and drain wing" },
        { mark: "blue", label: "Water and residues settling in the bowl" },
        { mark: "raised", label: "Head with metal shroud, transparent bowl with the pleated element in view, seal, drain, catch cup" },
      ],
      caption:
        "Conceptual illustration of a HYDROCORE™ fuel/water separator with a replaceable element inside a transparent bowl under a permanent metal shroud. The pleated element can be seen through the bowl. Separated water and impurities, denser than diesel, settle at the bottom of the bowl and are released through the drain. At service the bowl comes off, only the element is changed and the same bowl is refitted with its seal: the shroud and head stay in place. Conceptual illustration: it shows no product data.",
      aria: "HYDROCORE separator with element in a transparent bowl: arrow keys change the water in the fuel, E runs the service, space drains",
      label:
        "Fuel/water separator with a tall transparent bowl under a metal shroud, mounted on a head on a wall bracket. The pleated element is visible inside the bowl, and water and impurities settle at its bottom, above the drain. At service the bowl comes off, the element is changed and the same bowl is refitted; the shroud and head stay.",
    }
  : SPINON
  ? {
      fig: "Fig 1B",
      hint: "Top: service · click: drain",
      readout: "cartridge · collecting water",
      keys: [
        { mark: "lit", label: "Water level at the bottom of the cartridge and drain wing" },
        { mark: "blue", label: "Water and residues settling inside the cartridge" },
        { mark: "raised", label: "Head with primer pump, spin-on cartridge with built-in drain (section view), catch cup" },
      ],
      caption:
        "Conceptual illustration of a HYDROCORE™ spin-on separator with a built-in drain, with the bottom of the cartridge shown in section. Separated water and impurities, denser than diesel, settle at the bottom of the cartridge itself and are released by opening the drain. At service the whole cartridge is replaced, drain included. Conceptual illustration: it shows no product data.",
      aria: "HYDROCORE spin-on with built-in drain: arrow keys change the water in the fuel, E changes the cartridge, space drains",
      label:
        "Spin-on fuel/water separator with a built-in drain, mounted on a head on a wall bracket, with the bottom of the cartridge in section. Separated water settles at the bottom of the cartridge and the drain releases it into a catch cup. At service the whole cartridge is replaced.",
    }
  : {
      fig: "Fig 1A",
      hint: "Top: service · click: drain",
      readout: "bowl · collecting water",
      keys: [
        { mark: "lit", label: "Water level in the bowl and drain wing" },
        { mark: "blue", label: "Water and residues settling in the bowl" },
        { mark: "raised", label: "Head with primer pump, spin-on element, reusable transparent bowl, catch cup" },
      ],
      caption:
        "Conceptual illustration of a HYDROCORE™ fuel/water separator with a reusable transparent bowl and drain. Separated water and impurities, denser than diesel, settle in the bowl and are released through the drain. At service only the element is changed: the same bowl is removed and fitted to the new element. Conceptual illustration: it shows no product data.",
      aria: "HYDROCORE separator with bowl: arrow keys change the water in the fuel, E changes the element, space drains",
      label:
        "Fuel/water separator with a transparent bowl and drain, mounted on a head on a wall bracket. Separated water drops fall into the bowl and the drain releases them into a catch cup. When the element is changed, the bowl is kept and reused.",
    };

const COPY_ES = HOUSING
  ? {
      fig: "Fig 1C",
      hint: "Arriba: servicio · clic: purgar",
      readout: "vaso · acumulando agua",
      keys: [
        { mark: "lit", label: "Nivel de agua en el vaso y mariposa del purgador" },
        { mark: "blue", label: "Agua y residuos decantando en el vaso" },
        { mark: "raised", label: "Cabezal con carcasa metálica, vaso transparente con el elemento plisado a la vista, sello, purgador, taza colectora" },
      ],
      caption:
        "Ilustración conceptual de un separador de combustible/agua HYDROCORE™ con elemento reemplazable dentro de un vaso transparente, bajo una carcasa metálica permanente. El elemento plisado se ve a través del vaso. El agua y las impurezas separadas, más densas que el diésel, decantan en el fondo del vaso y se descargan por el purgador. En el servicio se desmonta el vaso, se cambia solo el elemento y se vuelve a montar el mismo vaso con su sello: la carcasa y el cabezal quedan en su lugar. Es una ilustración conceptual: no muestra datos de producto.",
      aria: "Separador HYDROCORE con elemento en vaso transparente: flechas cambian el agua en el combustible, E hace el servicio, espacio purga",
      label:
        "Separador de combustible y agua con un vaso transparente alto bajo una carcasa metálica, montado en un cabezal sobre un soporte de pared. El elemento plisado se ve dentro del vaso y el agua y las impurezas decantan en su fondo, sobre el purgador. En el servicio se desmonta el vaso, se cambia el elemento y se vuelve a montar el mismo vaso; la carcasa y el cabezal se quedan.",
    }
  : SPINON
  ? {
      fig: "Fig 1B",
      hint: "Arriba: servicio · clic: purgar",
      readout: "cartucho · acumulando agua",
      keys: [
        { mark: "lit", label: "Nivel de agua en el fondo del cartucho y mariposa del purgador" },
        { mark: "blue", label: "Agua y residuos decantando dentro del cartucho" },
        { mark: "raised", label: "Cabezal con bomba de cebado, cartucho spin-on con purgador incorporado (vista en corte), taza colectora" },
      ],
      caption:
        "Ilustración conceptual de un filtro separador spin-on HYDROCORE™ con purgador incorporado, con el fondo del cartucho en vista de corte. El agua y las impurezas separadas, más densas que el diésel, decantan en el fondo del propio cartucho y se descargan abriendo el purgador. En el servicio se reemplaza el cartucho completo, con su purgador. Es una ilustración conceptual: no muestra datos de producto.",
      aria: "Spin-on HYDROCORE con purgador incorporado: flechas cambian el agua en el combustible, E cambia el cartucho, espacio purga",
      label:
        "Filtro separador spin-on de combustible y agua con purgador incorporado, montado en un cabezal sobre un soporte de pared, con el fondo del cartucho en corte. El agua separada decanta en el fondo del cartucho y el purgador la descarga a una taza colectora. Al cambiarlo se retira el cartucho completo.",
    }
  : {
      fig: "Fig 1A",
      hint: "Arriba: servicio · clic: purgar",
      readout: "vaso · acumulando agua",
      keys: [
        { mark: "lit", label: "Nivel de agua en el vaso y mariposa del purgador" },
        { mark: "blue", label: "Agua y residuos decantando en el vaso" },
        { mark: "raised", label: "Cabezal con bomba de cebado, elemento spin-on, vaso transparente reutilizable, taza colectora" },
      ],
      caption:
        "Ilustración conceptual de un separador de combustible/agua HYDROCORE™ con vaso transparente reutilizable y purgador. El agua y las impurezas separadas, más densas que el diésel, decantan en el vaso y se descargan por el purgador. En el servicio se cambia solo el elemento: el mismo vaso se desmonta y se instala en el elemento nuevo. Es una ilustración conceptual: no muestra datos de producto.",
      aria: "Separador HYDROCORE con vaso: flechas cambian el agua en el combustible, E cambia el elemento, espacio purga",
      label:
        "Separador de combustible y agua con vaso transparente y purgador, montado en un cabezal sobre un soporte de pared. Las gotas de agua separadas caen al vaso y el purgador las descarga a una taza colectora. Al cambiar el elemento, el vaso se conserva y se reutiliza.",
    };

const COPY = EN ? COPY_EN : COPY_ES;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: COPY.label,
  body: layers,
});

const body = PAGE_CSS + k.plateHtml({
  fig: COPY.fig,
  title: "ELIMFILTERS · HYDROCORE™ · ES9",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

const name = `hydrocore${SPINON ? "-spinon" : HOUSING ? "-housing" : ""}${theme === "light" ? "-light" : ""}.html`;
const OUT = EN ? join(HERE, "../../../../frontend/public/knowledge-center/figures") : HERE;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, name), draftPage(k.pageHtml({ title: EN ? "HYDROCORE separator" : "HYDROCORE separador", theme, body, script: KIT_NOTICE + kitScript() + live }), EN ? "en" : "es"));
console.log("wrote", name, F.R.items.length, "items");
