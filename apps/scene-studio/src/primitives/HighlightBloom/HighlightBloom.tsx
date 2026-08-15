import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';
import {
  getBloomGain,
  getBloomRadiusInUv,
  getBloomTapOffsets,
  TAP_COUNT,
} from './bloomSampling';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  threshold?: number;
}

// smoothstep is undefined when both edges coincide, so the luminance knee
// stays strictly below the upper edge.
const MAX_THRESHOLD = 0.99;

function formatOffset(value: number): string {
  return value.toFixed(6);
}

// The disc offsets are unrolled from the pure module because GLSL ES 1.00 has
// no constant arrays — one source of truth for both sides.
const TAP_LINES = getBloomTapOffsets()
  .map(
    (offset) =>
      `  bloom += bloomSample(vec2(${formatOffset(offset.x)}, ${formatOffset(offset.y)}));`
  )
  .join('\n');

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform vec2 uRadiusInUv;
uniform float uGain;
uniform float uThreshold;

const float TAP_COUNT = ${TAP_COUNT}.0;

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

vec3 bloomSample(vec2 offsetInTaps) {
  vec3 sampled = texture2D(uTex, toCoverUv(vUv + offsetInTaps * uRadiusInUv)).rgb;
  float luminance = dot(sampled, vec3(0.2126, 0.7152, 0.0722));

  return sampled * smoothstep(uThreshold, 1.0, luminance);
}

void main() {
  vec4 base = texture2D(uTex, toCoverUv(vUv));

  // Adding a zero-gain bloom is not float-exact, so amount 0 takes the
  // single-sample path and passes the media through untouched.
  if (uGain == 0.0) {
    gl_FragColor = base;
    return;
  }

  vec3 bloom = vec3(0.0);
${TAP_LINES}

  gl_FragColor = vec4(base.rgb + (bloom / TAP_COUNT) * uGain, 1.0);
}
`;

// Overexposed-film look: highlights above the luminance threshold bleed onto
// their surroundings. Amount 0 renders the media untouched, so transitions
// can cross that endpoint invisibly.
export function HighlightBloom({
  src,
  mediaType = 'image',
  amount,
  threshold = 0.7,
}: Props) {
  const { width, height } = useVideoConfig();
  const canvasAspect = width / height;
  const radiusInUv = getBloomRadiusInUv({ amount, canvasAspect });

  return (
    <MediaTextureStage
      src={src}
      mediaType={mediaType}
      imageColorSpace={NoColorSpace}
    >
      {(texture) => {
        const coverScale = getCoverUvScale({
          canvasAspect,
          imageAspect: getTextureAspect(texture),
        });

        return (
          <ScreenQuad
            fragmentShader={FRAGMENT_SHADER}
            uniformValues={{
              uTex: texture,
              uCoverScale: new Vector2(coverScale.x, coverScale.y),
              uRadiusInUv: new Vector2(radiusInUv.x, radiusInUv.y),
              uGain: getBloomGain(amount),
              uThreshold: Math.min(clampUnit(threshold), MAX_THRESHOLD),
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
