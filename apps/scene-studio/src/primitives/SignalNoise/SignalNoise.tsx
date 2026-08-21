import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { ScreenQuad } from '../shared/ScreenQuad';
import { getNoiseSeed } from './noiseMotion';

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform float uSeed;

float random(vec2 st, float seed) {
  const float a = 12.9898;
  const float b = 78.233;
  const float c = 43758.543123;
  return fract(sin(dot(st.xy, vec2(a, b)) + seed) * c);
}

void main() {
  vec3 color = random(vUv, uSeed) * vec3(1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

export function SignalNoise() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <ScreenQuad
        fragmentShader={FRAGMENT_SHADER}
        uniformValues={{ uSeed: getNoiseSeed({ frame }) }}
      />
    </ThreeCanvas>
  );
}
