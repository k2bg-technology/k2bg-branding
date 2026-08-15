import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { ScreenQuad } from '../shared/ScreenQuad';
import { getGradientTime } from './gradientMotion';

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform float uTime;

void main() {
  vec2 p = vUv - 0.5;
  float r = 1.0 + 0.5 * (sin(5.0 * p.x + uTime));
  float g = 1.0 + 0.5 * (sin(5.0 * p.y) + sin(uTime + 2.0 * p.x));
  float b = 1.0 + 0.5 * (sin(5.0 + p.x * p.y * 17.0) + sin(uTime * 0.4 + 4.0 * p.y));
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export function GradientFlow() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <ScreenQuad
        fragmentShader={FRAGMENT_SHADER}
        uniformValues={{ uTime: getGradientTime({ frame, fps }) }}
      />
    </ThreeCanvas>
  );
}
