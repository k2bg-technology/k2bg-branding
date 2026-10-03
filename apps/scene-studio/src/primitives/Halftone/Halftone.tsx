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
  spacingInPx?: number;
  angleInDegrees?: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

// The dot grid lives in rotated screen-pixel space; each dot's radius follows
// the darkness of the media sampled at its cell center, the classic print
// screen. Amount blends the original back in, so 0 passes pixels through.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSpacingInPx;
uniform float uAngle;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 INK = vec3(0.06, 0.06, 0.06);
const vec3 PAPER = vec3(0.97, 0.97, 0.97);
// A dot must cover its whole cell at full darkness: half the diagonal.
const float FULL_COVER_RADIUS_SHARE = 0.7071;
const float EDGE_SOFTNESS_IN_PX = 0.8;

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  vec3 original = texture2D(uTex, toCoverUv(vUv)).rgb;

  vec2 px = vUv * uResolution;
  mat2 rotate = mat2(cos(uAngle), -sin(uAngle), sin(uAngle), cos(uAngle));
  mat2 unrotate = mat2(cos(uAngle), sin(uAngle), -sin(uAngle), cos(uAngle));
  vec2 gridPx = rotate * px;
  vec2 cellCenterGrid = (floor(gridPx / uSpacingInPx) + 0.5) * uSpacingInPx;
  vec2 cellCenterUv = (unrotate * cellCenterGrid) / uResolution;
  float luminance = dot(texture2D(uTex, toCoverUv(cellCenterUv)).rgb, LUMA);
  float dotRadius = uSpacingInPx * FULL_COVER_RADIUS_SHARE * (1.0 - luminance);
  float distanceToCenter = length(gridPx - cellCenterGrid);
  float ink = 1.0 - smoothstep(
    dotRadius - EDGE_SOFTNESS_IN_PX,
    dotRadius + EDGE_SOFTNESS_IN_PX,
    distanceToCenter
  );
  vec3 halftone = mix(PAPER, INK, ink);

  gl_FragColor = vec4(mix(original, halftone, uAmount), 1.0);
}
`;

export function Halftone({
  src,
  mediaType = 'image',
  amount,
  spacingInPx = 14,
  angleInDegrees = 15,
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
              uResolution: new Vector2(width, height),
              uAmount: clampUnit(amount),
              uSpacingInPx: spacingInPx,
              uAngle: angleInDegrees * DEGREES_TO_RADIANS,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
