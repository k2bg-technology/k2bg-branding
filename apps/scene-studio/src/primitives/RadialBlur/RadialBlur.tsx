import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  center?: { x: number; y: number };
}

// Share of the center distance each ray smears over at amount = 1.
const MAX_ZOOM_PULL = 0.25;
// Samples spread along each ray; the GLSL loop bound must be a compile-time
// constant, so the shader interpolates this one.
const TAP_COUNT = 24;

// Zoom smear: every fragment averages the samples between itself and the
// center. Scaling stays in vUv space, which is aspect-safe because the pull is
// uniform along the ray.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uStrength;
uniform vec2 uCenter;

const int TAP_COUNT = ${TAP_COUNT};

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  // Averaging identical samples is not float-exact, so amount 0 takes the
  // single-sample path and passes the media through untouched.
  if (uStrength <= 0.0) {
    gl_FragColor = texture2D(uTex, toCoverUv(vUv));
    return;
  }

  vec3 accumulated = vec3(0.0);
  for (int tap = 0; tap < TAP_COUNT; tap++) {
    float scale = 1.0 - uStrength * (float(tap) / float(TAP_COUNT - 1));
    vec2 uv = uCenter + (vUv - uCenter) * scale;
    accumulated += texture2D(uTex, toCoverUv(uv)).rgb;
  }

  gl_FragColor = vec4(accumulated / float(TAP_COUNT), 1.0);
}
`;

// Radial zoom blur pulling toward center. Amount 0 renders the media
// untouched, so transitions can cross that endpoint invisibly.
export function RadialBlur({
  src,
  mediaType = 'image',
  amount,
  center = { x: 0.5, y: 0.5 },
}: Props) {
  const { width, height } = useVideoConfig();

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
              uStrength: clampUnit(amount) * MAX_ZOOM_PULL,
              uCenter: new Vector2(center.x, center.y),
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
