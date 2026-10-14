// DRAFT (internal-only, see ../README.md): HYDROCORE™ standard non-turbine fuel/water separators, two variants:
//   default    separator with a reusable transparent bowl and drain (service: change the element, keep the bowl)
//   --spinon   spin-on with an integrated drain, sump shown in section (service: replace the whole cartridge)
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Percentages shown are illustrative, not product data.
// node build.mjs [--spinon] [--light] [--audit]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, glassBowl, PAGE_CSS, LIVE_BOWL, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const SPINON = process.argv.includes("--spinon");
const SERVICE = [0, 78, 0]; // where the element (bowl variant) or the whole cartridge (spin-on) goes at service
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
const B = SPINON ? { z0: 50, z1: CAN_Z, r: 26, mark: 72, wing: 15, cupR: 13, cupH: 6 } : { z0: 40, z1: COLLAR_Z, r: 21.5, mark: 74, wing: 15, cupR: 13, cupH: 6 };
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
const F = studio(P, { order: ["element", "stand"], pieces: { element: SERVICE, stand: [0, 0, 0] } });
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

// spin-on shell: a rolled seam at the head, a raised grip band with flutes
const CAN = vertical(CAN_Z);
const H = HEAD_Z - CAN_Z;
const band = [[11.4, 26], [12, 26.6], [20, 26.6], [20.6, 26]];
const canProfile = SPINON
  ? [[0, 26], ...band, [H - 7, 26], [H - 5.4, 26.8], [H - 1.6, 26.8], [H, 23.5]]
  : [[0, 23.5], [1.6, 26.8], [5.4, 26.8], [7, 26], ...band, [H - 7, 26], [H - 5.4, 26.8], [H - 1.6, 26.8], [H, 23.5]];
const seams = L((SPINON ? "" : G.arcOf(CAN, 3.5, 26.8, P)) + G.arcOf(CAN, H - 3.5, 26.8, P), { tone: "faint" });
const element = { piece: "element" };
put("canister", [0, 0, CAN_Z + H / 2], S(G.solidOf(canProfile, CAN, P, { fill: "surface" }), { tone: "hi", inner: seams }) + k.fadedSvg(G.ribsOf(CAN, 12, 20, 26.6, 36, P, { fade: [0.3, 0.75] }), { tone: "lo" }), [A.solid(CAN, canProfile, { name: "canister" })], element);

const V0 = vertical(VALVE_Z);
if (SPINON) {
  // the lower shell of the same cartridge, cut away to show the sump; a domed end with a rolled seam and the drain
  put("sump", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, { ...B, cutaway: true }), [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "sump" })], element);
  const e = B.z0 - VALVE_Z;
  const endProfile = [[0, 6], [CAP_Z - VALVE_Z - 2, 15, 1], [CAP_Z - VALVE_Z, 22], [e - 4, 26], [e - 3.5, 26.8], [e, 26.8]];
  put("end", [0, 0, (VALVE_Z + B.z0) / 2], S(G.solidOf(endProfile, V0, P), { tone: "hi", inner: L(G.arcOf(V0, e - 1.75, 26.8, P, { trim: 0, least: 0 }), { tone: "faint" }) }), [A.solid(V0, endProfile, { name: "end" })], element);
  F.drain(VALVE_Z, B.wing, element);
} else {
  // threaded collar, the reusable glass bowl, the drain cap and the drain: these stay when the element is changed
  const C = vertical(COLLAR_Z);
  const collarProfile = [[0, 22.6], [0.8, 23.6], [CAN_Z - COLLAR_Z - 0.8, 23.6], [CAN_Z - COLLAR_Z, 22.6]];
  put("collar", [0, 0, COLLAR_Z + 2.5], S(G.solidOf(collarProfile, C, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(C, 0.8, CAN_Z - COLLAR_Z - 0.8, 23.6, 40, P, { fade: [0.3, 0.75] }), { tone: "lo" }), [A.solid(C, collarProfile, { name: "collar" })]);
  put("bowl", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, B), [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "bowl" })]);
  const capProfile = [[0, 6], [CAP_Z - VALVE_Z - 2, 14, 1], [CAP_Z - VALVE_Z, 20], [B.z0 - VALVE_Z, 22.6]];
  put("cap", [0, 0, (VALVE_Z + B.z0) / 2], S(G.solidOf(capProfile, V0, P), { tone: "mid", inner: L(G.arcOf(V0, B.z0 - VALVE_Z - 2.4, 22.1, P), { tone: "faint" }) }), [A.solid(V0, capProfile, { name: "cap" })]);
  F.drain(VALVE_Z, B.wing);
}
F.cup(B.cupR, B.cupH, B.wing - 5);

const layers = F.render();
A.auditOrExit(F.R, P);


const live = `
const P = ${JSON.stringify(P)};
const B = ${JSON.stringify(B)};
const SV = ${JSON.stringify({ out: SERVICE, spinon: SPINON })};
${LIVE_BOWL}
const elementGroups = [...svg.querySelectorAll('[data-piece="element"]')];
const svc = { x: 0, v: 0, target: 0 };
let wet = 0.5, wetTarget = 0.5, spawn = 0, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false;
const falling = [];
function draw() {
  drawBowl(falling.map((d) => ({ at: [d.x, d.y, d.z], back: false })));
  const shift = translateAlong(P, SV.out.map((v) => v * svc.x));
  for (const group of elementGroups) group.setAttribute("transform", shift);
  const where = SV.spinon ? "cartucho" : "vaso";
  const text = svc.x > 0.5
    ? (SV.spinon ? "cartucho fuera · se cambia entero" : "elemento fuera · vaso reutilizado")
    : bowl.open > 0.5 ? where + " · purgando" : bowl.level > 0.85 ? where + " · llegando al límite" : where + " · acumulando agua";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(wet * 100)));
  stage.setAttribute("aria-valuetext", (wet > 0.66 ? "mucha" : wet > 0.33 ? "algo de" : "poca") + " agua en el combustible, " + text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  if (touring) wetTarget = 0.55 + 0.4 * Math.sin(clock * 0.35);
  wet += (wetTarget - wet) * (1 - Math.exp(-dt / 0.5));
  // water separated by the media leaves the element's bottom as drops, denser than the fuel, and settles
  spawn += svc.x > 0.05 ? 0 : dt * (0.6 + 5 * wet); // no separation while the element is out
  while (spawn > 1) { spawn -= 1; const r = Math.sqrt(rand()) * 13, a = rand() * Math.PI * 2; falling.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: B.z1 - 1, v: 0 }); }
  const top = waterTop();
  for (let i = falling.length - 1; i >= 0; i--) {
    const d = falling[i];
    d.v = Math.min(d.v + 60 * dt, 34);
    d.z -= d.v * dt;
    if (d.z <= top) { falling.splice(i, 1); bowl.level = Math.min(bowl.level + 0.012, 1.08); }
  }
  stepBowl(dt);
  for (let i = 0; i < 4; i++) { const h = dt / 4; svc.v += ((svc.target - svc.x) * 46 - svc.v * 13.6) * h; svc.x += svc.v * h; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { svc.x = svc.target; draw(); } };
const steer = (next) => { touring = false; wetTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  svc.target = (event.clientY - box.top) / box.height < 0.3 ? 1 : 0;
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { svc.target = 0; run(); });
stage.addEventListener("click", () => { bowl.opening = true; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(wetTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(wetTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { svc.target = svc.target ? 0 : 1; run(); }
  else if (event.key === " " || event.key === "Enter") { bowl.opening = true; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const COPY = SPINON
  ? {
      fig: "Fig 1B",
      hint: "Arriba: servicio · clic: purgar",
      readout: "cartucho · acumulando agua",
      keys: [
        { mark: "lit", label: "Nivel de agua en el fondo del cartucho y mariposa del purgador" },
        { mark: "blue", label: "Agua separada decantando dentro del cartucho" },
        { mark: "raised", label: "Cabezal con bomba de cebado, cartucho spin-on con purgador incorporado (vista en corte), taza colectora" },
      ],
      caption:
        "Ilustración conceptual de un filtro separador spin-on HYDROCORE™ con purgador incorporado, con el fondo del cartucho en vista de corte. El agua separada, más densa que el diésel, decanta en el fondo del propio cartucho y se descarga abriendo el purgador. En el servicio se reemplaza el cartucho completo, con su purgador. Es una ilustración conceptual: no muestra datos de producto.",
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
        { mark: "blue", label: "Agua separada: gotas y columna en el vaso" },
        { mark: "raised", label: "Cabezal con bomba de cebado, elemento spin-on, vaso transparente reutilizable, taza colectora" },
      ],
      caption:
        "Ilustración conceptual de un separador de combustible/agua HYDROCORE™ con vaso transparente reutilizable y purgador. El agua separada, más densa que el diésel, cae al vaso y se descarga por el purgador. En el servicio se cambia solo el elemento: el mismo vaso se desmonta y se instala en el elemento nuevo. Es una ilustración conceptual: no muestra datos de producto.",
      aria: "Separador HYDROCORE con vaso: flechas cambian el agua en el combustible, E cambia el elemento, espacio purga",
      label:
        "Separador de combustible y agua con vaso transparente y purgador, montado en un cabezal sobre un soporte de pared. Las gotas de agua separadas caen al vaso y el purgador las descarga a una taza colectora. Al cambiar el elemento, el vaso se conserva y se reutiliza.",
    };

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

const name = `hydrocore${SPINON ? "-spinon" : ""}${theme === "light" ? "-light" : ""}.html`;
writeFileSync(join(HERE, name), draftPage(k.pageHtml({ title: "HYDROCORE separador", theme, body, script: KIT_NOTICE + kitScript() + live })));
console.log("wrote", name, F.R.items.length, "items");
