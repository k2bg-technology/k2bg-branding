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
  frequency?: number;
  speed?: number;
  rgbShift?: number;
  rippleCenter?: { x: number; y: number };
}

// Screen-UV displacement of the ring crests at amount = 1.
const MAX_DISPLACEMENT_IN_UV = 0.035;
// Channel spread relative to the displacement at rgbShift = 1.
const MAX_RGB_SPREAD = 0.6;

// Rings are measured in screen space (aspect-corrected) so they stay
// circular; the cover-fit transform then picks the texel per channel.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uCanvasAspect;
uniform float uTime;
uniform float uAmount;
uniform float uFrequency;
uniform float uSpeed;
uniform float uRgbSpread;
uniform vec2 uRippleCenter;

const float TWO_PI = 6.28318530718;

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  vec2 toCenter = vUv - uRippleCenter;
  toCenter.x *= uCanvasAspect;
  float centerDistance = length(toCenter);
  vec2 direction = centerDistance > 0.0001
    ? vec2(toCenter.x / uCanvasAspect, toCenter.y) / centerDistance
    : vec2(0.0);
  float ring = sin(centerDistance * uFrequency * TWO_PI - uTime * uSpeed * TWO_PI);
  vec2 displacement = direction * ring * uAmount;

  float r = texture2D(uTex, toCoverUv(vUv + displacement * (1.0 + uRgbSpread))).r;
  float g = texture2D(uTex, toCoverUv(vUv + displacement)).g;
  float b = texture2D(uTex, toCoverUv(vUv + displacement * (1.0 - uRgbSpread))).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// Water-surface ripple: rings travel outward from rippleCenter and displace
// the media, with an optional channel spread along the displacement. Amount 0
// renders the media untouched, so transitions can cross that endpoint
// invisibly.
export function WaveDistortion({
  src,
  mediaType = 'image',
  amount,
  frequency = 9,
  speed = 0.6,
  rgbShift = 0,
  rippleCenter = { x: 0.5, y: 0.5 },
}: Props) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
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
              uTime: getEffectTimeInSeconds({ frame, fps }),
              uAmount: clampUnit(amount) * MAX_DISPLACEMENT_IN_UV,
              uFrequency: frequency,
              uSpeed: speed,
              uRgbSpread: clampUnit(rgbShift) * MAX_RGB_SPREAD,
              uRippleCenter: new Vector2(rippleCenter.x, rippleCenter.y),
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
