import { useCurrentFrame, useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';
import { getGlitchIntensity, getGlitchTick } from './glitchMotion';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  bands?: number;
  rgbShift?: number;
  seed?: number;
}

// Horizontal tear of a band at full intensity.
const MAX_TEAR_IN_UV = 0.08;
// Whole-frame channel split at full intensity and rgbShift = 1.
const MAX_SPLIT_IN_UV = 0.01;
// Share of bands that tear during a burst.
const TEARING_BAND_SHARE = 0.4;

// Bands tear sideways while a burst is active; the whole frame gets a
// momentary channel split on top. Intensity 0 samples every channel at the
// identical texel, so the media passes through untouched between bursts.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uIntensity;
uniform float uTick;
uniform float uBands;
uniform float uSeed;
uniform float uTearInUv;
uniform float uSplitInUv;
uniform float uTearingShare;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453123);
}

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  float band = floor(vUv.y * uBands);
  float tears = step(1.0 - uTearingShare, hash(vec2(band, uTick)));
  float tearDirection = (hash(vec2(band + 13.7, uTick)) - 0.5) * 2.0;
  vec2 displacement = vec2(tears * tearDirection * uIntensity * uTearInUv, 0.0);
  vec2 split = vec2(uIntensity * uSplitInUv, 0.0);

  float r = texture2D(uTex, toCoverUv(vUv + displacement + split)).r;
  float g = texture2D(uTex, toCoverUv(vUv + displacement)).g;
  float b = texture2D(uTex, toCoverUv(vUv + displacement - split)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export function GlitchShift({
  src,
  mediaType = 'image',
  amount,
  bands = 24,
  rgbShift = 0.5,
  seed = 0,
}: Props) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const intensity =
    getGlitchIntensity({ frame, fps, seed }) * clampUnit(amount);

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
              uIntensity: intensity,
              uTick: getGlitchTick({ frame, fps }),
              uBands: bands,
              uSeed: seed,
              uTearInUv: MAX_TEAR_IN_UV,
              uSplitInUv: clampUnit(rgbShift) * MAX_SPLIT_IN_UV,
              uTearingShare: TEARING_BAND_SHARE,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
