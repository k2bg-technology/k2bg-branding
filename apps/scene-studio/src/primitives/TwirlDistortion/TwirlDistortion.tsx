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
  maxRotationInDegrees?: number;
  radius?: number;
  center?: { x: number; y: number };
  rgbShift?: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

// Extra rotation per channel relative to the twirl at rgbShift = 1.
const MAX_RGB_SPREAD = 0.08;

// The swirl is measured in aspect-corrected screen space so it stays circular,
// and the rotation is applied as a UV offset: at rotation 0 the offset is
// exactly zero, which keeps amount 0 a byte-faithful passthrough.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uCanvasAspect;
uniform float uRotationInRadians;
uniform float uRadius;
uniform vec2 uCenter;
uniform float uRgbSpread;

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

vec2 twirlUv(vec2 toCenter, float rotation) {
  float cosine = cos(rotation);
  float sine = sin(rotation);
  vec2 rotated = vec2(
    toCenter.x * cosine - toCenter.y * sine,
    toCenter.x * sine + toCenter.y * cosine
  );
  vec2 offset = rotated - toCenter;
  offset.x /= uCanvasAspect;

  return toCoverUv(vUv + offset);
}

void main() {
  vec2 toCenter = vUv - uCenter;
  toCenter.x *= uCanvasAspect;
  float centerDistance = length(toCenter);
  float falloff = 1.0 - smoothstep(0.0, uRadius, centerDistance);
  float twirl = uRotationInRadians * falloff;

  float r = texture2D(uTex, twirlUv(toCenter, twirl * (1.0 - uRgbSpread))).r;
  float g = texture2D(uTex, twirlUv(toCenter, twirl)).g;
  float b = texture2D(uTex, twirlUv(toCenter, twirl * (1.0 + uRgbSpread))).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// Vortex swirl around a center point, fading out to the falloff radius, with
// an optional channel spread on the rotation. Amount 0 renders the media
// untouched, so transitions can cross that endpoint invisibly.
export function TwirlDistortion({
  src,
  mediaType = 'image',
  amount,
  maxRotationInDegrees = 240,
  radius = 0.75,
  center = { x: 0.5, y: 0.5 },
  rgbShift = 0,
}: Props) {
  const { width, height } = useVideoConfig();
  const canvasAspect = width / height;

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
              uCanvasAspect: canvasAspect,
              uRotationInRadians:
                clampUnit(amount) * maxRotationInDegrees * DEGREES_TO_RADIANS,
              uRadius: radius,
              uCenter: new Vector2(center.x, center.y),
              uRgbSpread: clampUnit(rgbShift) * MAX_RGB_SPREAD,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
