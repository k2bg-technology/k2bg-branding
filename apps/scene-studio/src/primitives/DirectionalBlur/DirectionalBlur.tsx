import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';
import { getDirectionalStepInUv, TAP_COUNT } from './blurStep';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  angleInDegrees?: number;
}

// Symmetric box smear: taps sit on both sides of the fragment so the blur
// spreads without drifting off the smear axis. TAP_COUNT is interpolated from
// the pure module because the GLSL loop bound must be a compile-time
// constant — one source of truth for both sides.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform vec2 uStepInUv;

const int TAP_COUNT = ${TAP_COUNT};

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  // Averaging identical samples is not float-exact, so amount 0 takes the
  // single-sample path and passes the media through untouched.
  if (uStepInUv == vec2(0.0)) {
    gl_FragColor = texture2D(uTex, toCoverUv(vUv));
    return;
  }

  // Taps outside the media rely on clamp-to-edge wrapping (ChannelShift).
  vec3 accumulated = vec3(0.0);
  for (int tap = 0; tap < TAP_COUNT; tap++) {
    vec2 offset = (float(tap) - float(TAP_COUNT - 1) * 0.5) * uStepInUv;
    accumulated += texture2D(uTex, toCoverUv(vUv + offset)).rgb;
  }

  gl_FragColor = vec4(accumulated / float(TAP_COUNT), 1.0);
}
`;

// Motion-blur style smear along a fixed screen axis. Amount 0 renders the
// media untouched, so transitions can cross that endpoint invisibly.
export function DirectionalBlur({
  src,
  mediaType = 'image',
  amount,
  angleInDegrees = 0,
}: Props) {
  const { width, height } = useVideoConfig();
  const canvasAspect = width / height;
  const stepInUv = getDirectionalStepInUv({
    amount,
    angleInDegrees,
    canvasAspect,
  });

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
              uStepInUv: new Vector2(stepInUv.x, stepInUv.y),
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
