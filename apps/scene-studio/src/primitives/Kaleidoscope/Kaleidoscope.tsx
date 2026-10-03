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
  segments?: number;
  rotationInDegrees?: number;
  speedInDegreesPerSecond?: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

// Angles fold into one mirrored segment measured in aspect-corrected screen
// space, so the wedges stay symmetric. Amount blends the original back in,
// so 0 passes pixels through.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uCanvasAspect;
uniform float uAmount;
uniform float uSegments;
uniform float uRotation;

const float TWO_PI = 6.28318530718;

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  vec3 original = texture2D(uTex, toCoverUv(vUv)).rgb;

  vec2 centered = vUv - 0.5;
  centered.x *= uCanvasAspect;
  float radius = length(centered);
  float angle = atan(centered.y, centered.x) + uRotation;
  float segmentAngle = TWO_PI / uSegments;
  float folded = abs(mod(angle, segmentAngle) - segmentAngle * 0.5);
  vec2 mirrored = vec2(cos(folded), sin(folded)) * radius;
  mirrored.x /= uCanvasAspect;
  vec2 kaleidoUv = clamp(mirrored + 0.5, 0.0, 1.0);
  vec3 kaleido = texture2D(uTex, toCoverUv(kaleidoUv)).rgb;

  gl_FragColor = vec4(mix(original, kaleido, uAmount), 1.0);
}
`;

export function Kaleidoscope({
  src,
  mediaType = 'image',
  amount,
  segments = 6,
  rotationInDegrees = 0,
  speedInDegreesPerSecond = 0,
}: Props) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const rotation =
    (rotationInDegrees +
      getEffectTimeInSeconds({ frame, fps }) * speedInDegreesPerSecond) *
    DEGREES_TO_RADIANS;

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
              uCanvasAspect: width / height,
              uAmount: clampUnit(amount),
              uSegments: segments,
              uRotation: rotation,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
