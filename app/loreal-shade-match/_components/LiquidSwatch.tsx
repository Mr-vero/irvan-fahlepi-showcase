"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// A lit sphere of liquid colour: domain-warped noise swirls the pigment, a fake normal catches a
// soft key light and a sharp specular, like a freshly cut lipstick bullet seen from above.
const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec3 c;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + 3.1; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / min(r.x, r.y) * 2.0;
  float d = length(uv);
  if (d > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec2 q = uv * 1.7;
  float w = fbm(q + vec2(fbm(q + t * 0.12), fbm(q - t * 0.1 + 4.0)));
  // Keep the average at exactly the target colour; the swirl and light only move around it.
  vec3 base = c * (1.0 + 0.2 * (w - 0.5));
  float z = sqrt(1.0 - d * d);
  vec3 N = normalize(vec3(uv * 0.85 + (w - 0.5) * 0.35, z));
  vec3 L = normalize(vec3(-0.45, 0.6, 0.75));
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 48.0);
  float rim = pow(1.0 - z, 3.0) * 0.25;
  vec3 col = base * (0.86 + 0.24 * diff) + spec * 0.45 + rim * 0.4;
  float a = smoothstep(1.0, 0.975, d);
  gl_FragColor = vec4(col * a, a);
}`;

type Props = {
  rgb: [number, number, number];
  className?: string;
  /** Wait for the visitor's first interaction before starting WebGL, so a decorative swatch costs nothing at load. */
  deferred?: boolean;
};

/** Renders nothing visible on its own if WebGL is unavailable; the parent's CSS colour shows through. */
export default function LiquidSwatch({ rgb, className, deferred }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const color = useRef(rgb);
  color.current = rgb;

  useEffect(() => {
    let stop = () => {};
    if (!deferred) {
      stop = start();
      return () => stop();
    }
    const events = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      stop = start();
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start(): () => void {
    const el = canvas.current;
    if (!el) return () => {};
    const gl = el.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl) return () => {};

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uC = gl.getUniformLocation(prog, "c");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      gl.viewport(0, 0, el.width, el.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const draw = () => {
      gl.uniform2f(uR, el.width, el.height);
      gl.uniform1f(uT, still ? 4 : (performance.now() - start) / 1000);
      gl.uniform3f(uC, ...color.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    };
    draw();
    el.dataset.webgl = "on";

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }

  return <canvas ref={canvas} className={className} aria-hidden />;
}
