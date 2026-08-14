import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig } from 'remotion';
import { Vector3 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { ScreenQuad } from '../shared/ScreenQuad';

interface Props {
  coverage: number;
  seed?: number;
}

// Patch cells across the screen height; lower reads as bigger brush blobs.
const PATCH_SCALE = 3.2;
// Domain-warp strength bending the blob borders into stroke-like lobes.
const WARP_STRENGTH = 1.6;
// Share of long horizontal smears mixed into the blob field.
const STREAK_WEIGHT = 0.35;
// Field-space half width of the mask edge; keeps borders brushy, not razor.
const EDGE_SOFTNESS = 0.05;
// Field-space band above the mask edge that darkens into a dirty stroke rim.
const EDGE_BAND = 0.16;
const PAINT_DEEP_COLOR = new Vector3(0.58, 0.14, 0.03);
const PAINT_BRIGHT_COLOR = new Vector3(1.0, 0.82, 0.28);

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform float uCoverage;
uniform float uSeed;
uniform float uAspect;
uniform float uPatchScale;
uniform float uWarpStrength;
uniform float uStreakWeight;
uniform float uEdgeSoftness;
uniform float uEdgeBand;
uniform vec3 uPaintDeep;
uniform vec3 uPaintBright;

float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
}

float valueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 fraction = fract(point);
  vec2 smoothing = fraction * fraction * (3.0 - 2.0 * fraction);
  float bottomLeft = hash(cell);
  float bottomRight = hash(cell + vec2(1.0, 0.0));
  float topLeft = hash(cell + vec2(0.0, 1.0));
  float topRight = hash(cell + vec2(1.0, 1.0));

  return mix(
    mix(bottomLeft, bottomRight, smoothing.x),
    mix(topLeft, topRight, smoothing.x),
    smoothing.y
  );
}

float fbm(vec2 point) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave++) {
    total += amplitude * valueNoise(point);
    point *= 2.0;
    amplitude *= 0.5;
  }

  return total / 0.875;
}

void main() {
  vec2 screen = vec2(vUv.x * uAspect, vUv.y) * uPatchScale;
  vec2 warp = vec2(
    fbm(screen + vec2(3.1, 7.7)),
    fbm(screen + vec2(9.2, 1.3))
  ) - 0.5;
  float blobs = fbm(screen + uWarpStrength * warp);
  float streaks = valueNoise(
    vec2(screen.x * 0.8, screen.y * 7.0) + warp * 2.0
  );
  float field = mix(blobs, streaks, uStreakWeight);

  float threshold = mix(1.0 + uEdgeSoftness, -uEdgeSoftness, uCoverage);
  float mask = smoothstep(
    threshold - uEdgeSoftness,
    threshold + uEdgeSoftness,
    field
  );

  float depthAboveEdge = smoothstep(0.0, uEdgeBand, field - threshold);
  float tone = fbm(screen * 1.7 + vec2(5.0 + uSeed, 2.0));
  vec3 paint = mix(uPaintDeep, uPaintBright, tone);
  paint *= mix(0.55, 1.0, depthAboveEdge);
  paint += (valueNoise(vec2(vUv.x * uAspect, vUv.y) * 220.0) - 0.5) * 0.12;

  gl_FragColor = vec4(paint, mask);
}
`;

// A transparent paint wash meant to sit above a scene: coverage 0 renders
// nothing and coverage 1 covers the frame, so both endpoints are invisible
// mount/unmount boundaries for transitions.
export function PaintReveal({ coverage, seed = 0 }: Props) {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <ScreenQuad
        transparent
        fragmentShader={FRAGMENT_SHADER}
        uniformValues={{
          uCoverage: clampUnit(coverage),
          uSeed: seed,
          uAspect: width / height,
          uPatchScale: PATCH_SCALE,
          uWarpStrength: WARP_STRENGTH,
          uStreakWeight: STREAK_WEIGHT,
          uEdgeSoftness: EDGE_SOFTNESS,
          uEdgeBand: EDGE_BAND,
          uPaintDeep: PAINT_DEEP_COLOR,
          uPaintBright: PAINT_BRIGHT_COLOR,
        }}
      />
    </ThreeCanvas>
  );
}
