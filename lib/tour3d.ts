import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The live-work tour as a real-time product shot: a modelled phone and laptop under studio light, one
 * continuous camera move driven by scroll. Progress is damped, so the camera glides into place rather
 * than stepping with the wheel, and the scene renders only while something is still moving.
 */

export type TourScreens = { phone: string[]; laptop: string[] };
export type TourHandle = { setProgress: (p: number) => void; dispose: () => void };
export type TourFrame = { p: number; step: number };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/* ---------- shapes & materials ---------- */

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A rounded slab with softly bevelled edges, centred on its own depth. */
function slab(w: number, h: number, r: number, depth: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel)), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 28,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * A screen that wipes from one texture to the next along a diagonal, with a thin light edge, and has
 * rounded corners cut in the shader. Rendered unlit, like a real display.
 */
function screenMaterial(aspect: number, radius: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      a: { value: null },
      b: { value: null },
      wipe: { value: 0 },
      aCrop: { value: new THREE.Vector2(1, 1) },
      bCrop: { value: new THREE.Vector2(1, 1) },
      aspect: { value: aspect },
      radius: { value: radius },
      glow: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D a; uniform sampler2D b; uniform vec2 aCrop; uniform vec2 bCrop; uniform float wipe; uniform float aspect; uniform float radius; uniform float glow;
      varying vec2 vUv;
      float rounded(vec2 p, vec2 size, float r) { vec2 q = abs(p) - size + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main() {
        vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
        float d = rounded(p, vec2(aspect, 1.0) * 0.5, radius);
        if (d > 0.0) discard;
        float k = vUv.x * 0.35 + (1.0 - vUv.y) * 0.65;
        float edge = wipe * 1.3 - 0.15;
        float m = smoothstep(edge + 0.06, edge - 0.06, k);
        vec4 c = mix(texture2D(a, (vUv - 0.5) * aCrop + 0.5), texture2D(b, (vUv - 0.5) * bCrop + 0.5), m);
        float line = (1.0 - smoothstep(0.0, 0.025, abs(k - edge))) * step(0.001, wipe) * step(wipe, 0.999);
        c.rgb = c.rgb * glow + vec3(1.0, 0.85, 0.9) * line * 0.6;
        gl_FragColor = vec4(c.rgb, 1.0);
        #include <colorspace_fragment>
      }`,
    toneMapped: false,
  });
}

/* ---------- the devices ---------- */

function buildPhone(titanium: THREE.Material, glass: THREE.Material) {
  const W = 0.72;
  const H = 1.48;
  const D = 0.075;
  const R = 0.11;
  const g = new THREE.Group();

  const body = new THREE.Mesh(slab(W, H, R, D - 0.024, 0.012), titanium);
  g.add(body);
  // The bevel adds to the extruded depth, so the glass sits just proud of the body's real face.
  const F = (D - 0.024) / 2 + 0.012;

  // Front glass and the display, slightly proud of the frame.
  const front = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - 0.018, H - 0.018, R - 0.009), 24), glass);
  front.position.z = F + 0.0006;
  g.add(front);
  const screenW = W - 0.07;
  const screenH = H - 0.07;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMaterial(screenW / screenH, 0.085 / screenH));
  screen.position.z = F + 0.0012;
  g.add(screen);
  const island = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0.19, 0.055, 0.0275), 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  island.position.set(0, screenH / 2 - 0.07, F + 0.0018);
  g.add(island);

  // Back: frosted glass with a camera plateau and three lenses.
  const backGlass = new THREE.MeshPhysicalMaterial({ color: 0x8f8a84, roughness: 0.55, metalness: 0.1, clearcoat: 0.4, clearcoatRoughness: 0.4 });
  const back = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - 0.018, H - 0.018, R - 0.009), 24), backGlass);
  back.rotation.y = Math.PI;
  back.position.z = -F - 0.0006;
  g.add(back);
  const plateau = new THREE.Mesh(slab(0.34, 0.34, 0.085, 0.006, 0.006), backGlass);
  plateau.position.set(-W / 2 + 0.215, H / 2 - 0.215, -F - 0.006);
  g.add(plateau);
  const ring = new THREE.MeshPhysicalMaterial({ color: 0x77736d, metalness: 1, roughness: 0.25 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x05070c, metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 });
  for (const [x, y] of [
    [-0.07, 0.07],
    [-0.07, -0.075],
    [0.075, 0],
  ]) {
    const lens = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.064, 0.022, 48), ring);
    outer.rotation.x = Math.PI / 2;
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.046, 48), lensGlass);
    inner.rotation.y = Math.PI;
    inner.position.z = -0.0112;
    lens.add(outer, inner);
    lens.position.set(plateau.position.x + x, plateau.position.y + y, -F - 0.015);
    g.add(lens);
  }

  // Side buttons.
  const btn = (y: number, h: number, side: number) => {
    const m = new THREE.Mesh(slab(0.012, h, 0.006, 0.02, 0.004), titanium);
    m.rotation.y = Math.PI / 2;
    m.position.set((side * W) / 2 + side * 0.004, y, 0);
    g.add(m);
  };
  btn(0.33, 0.1, -1);
  btn(0.18, 0.13, -1);
  btn(0.02, 0.13, -1);
  btn(0.22, 0.2, 1);

  return { group: g, screen, screenH };
}

function keyboardTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 400;
  const x = c.getContext("2d")!;
  x.fillStyle = "#2a2b2e";
  x.fillRect(0, 0, c.width, c.height);
  const rows = [14, 14, 13, 12, 11];
  rows.forEach((n, r) => {
    const gap = 8;
    const kw = (c.width - 40 - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const kx = 20 + i * (kw + gap);
      const ky = 20 + r * 66;
      x.fillStyle = "#0f1012";
      x.beginPath();
      x.roundRect(kx, ky, kw, 56, 8);
      x.fill();
    }
  });
  x.fillStyle = "#0f1012";
  x.beginPath();
  x.roundRect(260, 20 + 5 * 66, 504, 46, 8);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function buildLaptop(aluminium: THREE.Material, glass: THREE.Material) {
  const W = 3.0;
  const DEPTH = 2.06;
  const T = 0.055;
  const g = new THREE.Group();

  const base = new THREE.Mesh(slab(W, DEPTH, 0.09, T - 0.02, 0.01), aluminium);
  base.rotation.x = -Math.PI / 2;
  g.add(base);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 1.02), new THREE.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.6, metalness: 0.2 }));
  kb.rotation.x = -Math.PI / 2;
  kb.position.set(0, T / 2 + 0.0015, -0.36);
  g.add(kb);
  const pad = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(1.15, 0.7, 0.06), 16),
    new THREE.MeshPhysicalMaterial({ color: 0xbfc2c7, metalness: 0.6, roughness: 0.2, clearcoat: 0.5 }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, T / 2 + 0.0015, 0.58);
  g.add(pad);

  // The lid pivots on the hinge at the back edge of the base.
  const hinge = new THREE.Group();
  hinge.position.set(0, T / 2, -DEPTH / 2 + 0.02);
  g.add(hinge);
  const LH = 1.98;
  const lid = new THREE.Mesh(slab(W, LH, 0.09, 0.012, 0.006), aluminium);
  lid.position.set(0, LH / 2, -0.012);
  hinge.add(lid);
  const bezel = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - 0.03, LH - 0.03, 0.08), 20), glass);
  bezel.position.set(0, LH / 2, 0.0005);
  hinge.add(bezel);
  const sw = 2.82;
  const sh = 1.76;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screenMaterial(sw / sh, 0.03 / sh));
  screen.position.set(0, LH / 2 + 0.04, 0.0015);
  hinge.add(screen);

  return { group: g, hinge, screen };
}

/* ---------- the camera path ---------- */

type V3 = [number, number, number];
type Key = { at: number; cam: V3; look: V3; phone: { pos: V3; rot: V3 }; laptop: { pos: V3; rotY: number; lid: number } };

/*
 * Always close: the screen is the subject and the device is cropped around it. The phone rises into
 * frame and holds face-on for its three projects, turning slightly through each swap. Then the camera
 * keeps pushing forward while the phone drops away beneath it and the laptop rises and opens straight
 * ahead, so the move never cuts. The laptop holds close for its five projects with small drifts.
 */
const PHONE_GONE = { pos: [0, -2.8, -0.4] as V3, rot: [1.1, -0.6, 0.2] as V3 };
const LAPTOP_LOW = { pos: [0, -2.8, -2.2] as V3, rotY: 0, lid: 1.5 };
// Where the open laptop's screen sits, and a camera square to it (the lid leans back by 0.18 rad).
const SCREEN: V3 = [0, -0.12, -3.39];
const laptopAt = (at: number, dx: number, rotY: number, back = 0): Key => ({
  at,
  cam: [dx, 0.78 + back * 0.18, 2.1 + back],
  // Aim a little below the screen's centre, so the screen sits high and the captions fall over the deck.
  look: [dx * 0.15, SCREEN[1] - 0.1, SCREEN[2]],
  phone: PHONE_GONE,
  laptop: { pos: [0, -1.06, -2.2], rotY, lid: -0.18 },
});
const phoneAt = (at: number, cam: V3, pos: V3, rot: V3): Key => ({ at, cam, look: [pos[0] * 0.4, pos[1] * 0.4, 0], phone: { pos, rot }, laptop: LAPTOP_LOW });

const KEYS: Key[] = [
  phoneAt(0, [0, 0, 3.4], [0.45, -1.5, 0.2], [0.55, -0.8, 0.12]),
  phoneAt(0.09, [0, 0, 3.0], [0.2, 0, 0], [0.05, -0.25, 0]),
  phoneAt(0.13, [0, 0, 2.9], [0, 0, 0], [0, 0, 0]),
  phoneAt(0.17, [0, 0, 2.9], [0, 0, 0], [0, 0, 0]),
  phoneAt(0.205, [0.08, 0, 2.8], [0, 0, 0], [0, 0.22, 0]),
  phoneAt(0.24, [0, 0, 2.9], [0, 0, 0], [0, 0, 0]),
  phoneAt(0.3, [0, 0, 2.9], [0, 0, 0], [0, 0, 0]),
  phoneAt(0.335, [-0.08, 0, 2.8], [0, 0, 0], [0, -0.22, 0]),
  phoneAt(0.37, [0, 0, 2.9], [0, 0, 0], [0, 0, 0]),
  phoneAt(0.44, [0, 0, 2.75], [0, 0, 0], [0, 0, 0]),
  { at: 0.5, cam: [0, 0.3, 1.7], look: [0, -0.1, -1.6], phone: { pos: [0, -1.1, 0.2], rot: [0.5, -0.35, 0.12] }, laptop: { pos: [0, -1.5, -2.2], rotY: 0, lid: 0.7 } },
  laptopAt(0.56, 0, 0),
  laptopAt(0.6, 0, 0),
  laptopAt(0.675, 0.3, -0.04),
  laptopAt(0.775, -0.3, 0.04),
  laptopAt(0.875, 0.3, -0.04),
  laptopAt(0.95, -0.15, 0.02),
  laptopAt(1, 0, 0, 0.25),
];

// Screen swaps, as [start, end] of each wipe.
const PHONE_SWAPS: [number, number][] = [
  [0.18, 0.23],
  [0.31, 0.36],
];
const LAPTOP_SWAPS: [number, number][] = [
  [0.6, 0.65],
  [0.7, 0.75],
  [0.8, 0.85],
  [0.9, 0.95],
];
const STEPS = [0, 0.205, 0.335, 0.5, 0.625, 0.725, 0.825, 0.925];

function lerp3(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function sample(p: number) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = ease(clamp01((p - a.at) / (b.at - a.at)));
  return {
    cam: lerp3(a.cam, b.cam, t),
    look: lerp3(a.look, b.look, t),
    phonePos: lerp3(a.phone.pos, b.phone.pos, t),
    phoneRot: lerp3(a.phone.rot, b.phone.rot, t),
    laptopPos: lerp3(a.laptop.pos, b.laptop.pos, t),
    laptopRotY: a.laptop.rotY + (b.laptop.rotY - a.laptop.rotY) * t,
    lid: a.laptop.lid + (b.laptop.lid - a.laptop.lid) * t,
  };
}

/** Which screen pair is showing and how far the wipe between them has got. */
function swapState(p: number, swaps: [number, number][]) {
  let index = 0;
  for (const [s, e] of swaps) {
    if (p >= e) index++;
    else if (p > s) return { from: index, to: index + 1, wipe: ease((p - s) / (e - s)) };
  }
  return { from: index, to: index, wipe: 0 };
}

/* ---------- the scene ---------- */

export function createTour(canvas: HTMLCanvasElement, screens: TourScreens, onFrame: (f: TourFrame) => void): TourHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);

  const key = new THREE.DirectionalLight(0xfff4e8, 1.6);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 1.1);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

  const titanium = new THREE.MeshPhysicalMaterial({ color: 0x9b968f, metalness: 1, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.25 });
  const aluminium = new THREE.MeshPhysicalMaterial({ color: 0xc4c7cc, metalness: 1, roughness: 0.36, clearcoat: 0.15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x050607, metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });

  const phone = buildPhone(titanium, glass);
  const laptop = buildLaptop(aluminium, glass);
  scene.add(phone.group, laptop.group);

  // Screens: textures load in the background; a dark placeholder shows until each arrives.
  const loader = new THREE.TextureLoader();
  const blank = new THREE.DataTexture(new Uint8Array([10, 10, 12, 255]), 1, 1);
  blank.needsUpdate = true;
  // Each screenshot is cropped to cover its screen, never stretched.
  const crops = new Map<THREE.Texture, THREE.Vector2>();
  const load = (screenAspect: number) => (src: string) => {
    const crop = new THREE.Vector2(1, 1);
    const t = loader.load(src, (tex) => {
      const img = tex.image as HTMLImageElement;
      const ta = img.width / img.height;
      if (ta > screenAspect) crop.set(screenAspect / ta, 1);
      else crop.set(1, ta / screenAspect);
      dirty = true;
    });
    crops.set(t, crop);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const phoneMat = phone.screen.material as THREE.ShaderMaterial;
  const laptopMat = laptop.screen.material as THREE.ShaderMaterial;
  const phoneTex = screens.phone.map(load(phoneMat.uniforms.aspect.value));
  const laptopTex = screens.laptop.map(load(laptopMat.uniforms.aspect.value));
  const one = new THREE.Vector2(1, 1);
  const setScreen = (mat: THREE.ShaderMaterial, from?: THREE.Texture, to?: THREE.Texture, wipe = 0) => {
    mat.uniforms.a.value = from ?? blank;
    mat.uniforms.b.value = to ?? blank;
    mat.uniforms.aCrop.value = (from && crops.get(from)) || one;
    mat.uniforms.bCrop.value = (to && crops.get(to)) || one;
    mat.uniforms.wipe.value = wipe;
  };

  let target = 0;
  let current = 0;
  let dirty = true;
  let raf = 0;
  let last = performance.now();
  let disposed = false;

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On a portrait screen, widen the lens so the devices still fit.
    camera.fov = camera.aspect < 1 ? 46 : 30;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const apply = (p: number) => {
    const s = sample(p);
    // Keep the subject's width in frame on narrow screens: back the camera off along its line of sight.
    const targetW = 0.86 + (3.05 - 0.86) * seg(p, 0.44, 0.56);
    const need = targetW / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
    const dir = new THREE.Vector3(s.cam[0] - s.look[0], s.cam[1] - s.look[1], s.cam[2] - s.look[2]);
    const dist = dir.length();
    if (need > dist) dir.multiplyScalar(need / dist);
    camera.position.set(s.look[0] + dir.x, s.look[1] + dir.y, s.look[2] + dir.z);
    camera.lookAt(s.look[0], s.look[1], s.look[2]);

    phone.group.position.set(...s.phonePos);
    phone.group.rotation.set(...s.phoneRot);
    phone.group.visible = p < 0.57;
    laptop.group.position.set(...s.laptopPos);
    laptop.group.rotation.y = s.laptopRotY;
    laptop.hinge.rotation.x = s.lid;
    laptop.group.visible = p > 0.43;

    const ps = swapState(p, PHONE_SWAPS);
    setScreen(phoneMat, phoneTex[ps.from], phoneTex[ps.to], ps.wipe);
    const ls = swapState(p, LAPTOP_SWAPS);
    setScreen(laptopMat, laptopTex[ls.from], laptopTex[ls.to], ls.wipe);
    // The laptop screen powers on as the lid opens.
    laptopMat.uniforms.glow.value = clamp01((1.3 - s.lid) / 1.2);

    const step = Math.max(0, STEPS.filter((t) => p >= t).length - 1);
    onFrame({ p, step });
  };

  const loop = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Critically damped follow: the camera glides to where the scroll says, never steps.
    const k = 1 - Math.exp(-dt * 7);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.00005) current = target;
    apply(current);
    renderer.render(scene, camera);
    dirty = false;
    if (current !== target) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf && !disposed) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  // Re-render once when a texture arrives or the size changes, even if scroll is idle.
  const idle = () => {
    if (disposed) return;
    if (dirty) kick();
    setTimeout(idle, 200);
  };
  idle();
  kick();

  return {
    setProgress(p: number) {
      target = clamp01(p);
      kick();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      pmrem.dispose();
      [...phoneTex, ...laptopTex].forEach((t) => t.dispose());
    },
  };
}
