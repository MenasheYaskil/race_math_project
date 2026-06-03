import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Speed-line streaks + drifting particles + chromatic vignette.
// Two color stops, tinted per-variant via uTintA/uTintB.
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uTintA;
uniform vec3  uTintB;
uniform float uSpeed;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float streaks(vec2 uv, float t) {
  // horizontal streaks scrolling left, density varies with y
  vec2 g = uv * vec2(2.0, 90.0);
  g.x += t * uSpeed;
  float lane = floor(g.y);
  float laneJitter = hash(vec2(lane, 1.0));
  g.x += laneJitter * 12.0;
  float row = fract(g.x);
  float laneAlpha = step(0.92, hash(vec2(lane, floor(g.x))));
  float streak = smoothstep(0.0, 0.05, row) * smoothstep(0.55, 0.0, row);
  return streak * laneAlpha * (0.5 + 0.5 * laneJitter);
}

float particles(vec2 uv, float t) {
  vec2 g = uv * 18.0;
  g.x += t * 0.18;
  vec2 id = floor(g);
  vec2 f  = fract(g) - 0.5;
  float r = hash(id);
  float a = step(0.97, r);
  float d = length(f);
  return a * smoothstep(0.05, 0.0, d) * (0.6 + 0.4 * sin(t * 2.0 + r * 6.28));
}

float vignette(vec2 uv) {
  vec2 c = uv - 0.5;
  float d = dot(c, c);
  return smoothstep(0.85, 0.05, d);
}

void main() {
  vec2 uv = vUv;
  // Slight perspective: stretch streaks toward horizon
  vec2 puv = uv;
  puv.x = (puv.x - 0.5) / (0.45 + puv.y * 0.55) + 0.5;

  float s = streaks(puv, uTime) * uIntensity;
  float p = particles(uv, uTime) * 0.85;

  // Two-tone gradient base
  vec3 baseA = vec3(0.020, 0.027, 0.062);   // asphalt deep
  vec3 baseB = vec3(0.043, 0.058, 0.115);   // tarmac
  vec3 base  = mix(baseA, baseB, smoothstep(0.0, 1.0, uv.y));

  // Streak color travels along x — tintA on left, tintB on right
  vec3 streakColor = mix(uTintA, uTintB, smoothstep(0.0, 1.0, uv.x));
  vec3 col = base + streakColor * s * 1.4;
  col += uTintA * p * 1.2;

  // Horizon glow band
  float horizon = smoothstep(0.35, 0.5, uv.y) * smoothstep(0.65, 0.5, uv.y);
  col += mix(uTintA, uTintB, 0.5) * horizon * 0.12;

  // Soft scanline shimmer
  col += 0.012 * sin(uv.y * uResolution.y * 1.4 + uTime * 1.8);

  // Vignette
  col *= 0.55 + 0.45 * vignette(uv);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VARIANT_TINTS = {
  // [tintA (left/streaks primary), tintB (right/streaks secondary)]
  cyan: [
    [0.00, 0.953, 1.00],   // #00F3FF
    [0.737, 0.075, 0.996], // #BC13FE
  ],
  ignition: [
    [1.00, 0.176, 0.333],  // #FF2D55
    [1.00, 0.667, 0.00],   // #FFAA00
  ],
  podium: [
    [1.00, 0.824, 0.290],  // #FFD24A
    [0.737, 0.075, 0.996],
  ],
};

const RacingBackdrop = ({ variant = 'cyan', speed = 6.0, intensity = 1.0 }) => {
  const mountRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let renderer;
    let resizeHandler;

    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      // WebGL unavailable — leave the CSS fallback layer to do its job.
      return undefined;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.className = 'rg-backdrop';
    mount.appendChild(canvas);

    const tints = VARIANT_TINTS[variant] || VARIANT_TINTS.cyan;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uTintA: { value: tints[0] },
        uTintB: { value: tints[1] },
        uSpeed: { value: speed },
        uIntensity: { value: intensity },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };
    resizeHandler = resize;
    window.addEventListener('resize', resize);
    resize();

    const start = performance.now();
    const loop = () => {
      if (cancelled) return;
      const t = (performance.now() - start) / 1000;
      program.uniforms.uTime.value = t;
      renderer.render({ scene: mesh });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    stateRef.current = { renderer, mesh, program, canvas };

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeHandler);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [variant, speed, intensity]);

  return <div ref={mountRef} className="rg-backdrop-mount" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />;
};

export default RacingBackdrop;
