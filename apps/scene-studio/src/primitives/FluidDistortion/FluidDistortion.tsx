import { useCurrentFrame, useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { getEffectTimeInSeconds } from '../shared/effectTime';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  scale?: number;
  speed?: number;
  seed?: number;
}

// Screen-UV displacement at amount = 1.
const MAX_DISPLACEMENT_IN_UV = 0.06;

// Two decorrelated fbm fields drive the displacement vector; the noise
// domain drifts with time so the warp keeps flowing.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uTime;
uniform float uAmount;
uniform float uScale;
uniform float uSpeed;
uniform float uSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(cell);
  float b = hash(cell + vec2(1.0, 0.0));
  float c = hash(cell + vec2(0.0, 1.0));
  float d = hash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave++) {
    value += amplitude * valueNoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 field = vUv * uScale + vec2(uTime * uSpeed * 0.35, uTime * uSpeed * 0.2);
  vec2 displacement = vec2(
    fbm(field) - 0.5,
    fbm(field + vec2(37.2, 11.7)) - 0.5
  ) * 2.0 * uAmount;
  vec2 coverUv = (vUv + displacement - 0.5) * uCoverScale + 0.5;
  gl_FragColor = vec4(texture2D(uTex, coverUv).rgb, 1.0);
}
`;

// Organic fluid warp: fbm noise bends the media like heat haze or water.
// Amount 0 renders the media untouched, so transitions can cross that
// endpoint invisibly.
export function FluidDistortion({
  src,
  mediaType = 'image',
  amount,
  scale = 3,
  speed = 1,
  seed = 0,
}: Props) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  return (
    <MediaTextureStage
      src={src}
      mediaType={mediaType}
      imageColorSpace={NoColorSpace}
    >
      {(texture) => {
        const coverScale = getCoverUvScale({
          canvasAspect: width / height,
          imageAspect: getTextureAspect(texture),
        });

        return (
          <ScreenQuad
            fragmentShader={FRAGMENT_SHADER}
            uniformValues={{
              uTex: texture,
              uCoverScale: new Vector2(coverScale.x, coverScale.y),
              uTime: getEffectTimeInSeconds({ frame, fps }),
              uAmount: clampUnit(amount) * MAX_DISPLACEMENT_IN_UV,
              uScale: scale,
              uSpeed: speed,
              uSeed: seed,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
