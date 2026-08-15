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
  columns?: number;
  speed?: number;
  rgbShift?: number;
  seed?: number;
}

// Screen-UV displacement of a cell at amount = 1.
const MAX_DISPLACEMENT_IN_UV = 0.03;
// Channel spread relative to the displacement at rgbShift = 1.
const MAX_RGB_SPREAD = 0.8;

// Cells are quantized square in screen space (Mosaic convention); each cell
// wobbles along its own hashed direction with its own phase, so the grid
// shimmers instead of moving in lockstep.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uCanvasAspect;
uniform float uTime;
uniform float uAmount;
uniform float uColumns;
uniform float uSpeed;
uniform float uRgbSpread;
uniform float uSeed;

const float TWO_PI = 6.28318530718;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453123);
}

vec2 toCoverUv(vec2 uv) {
  return (uv - 0.5) * uCoverScale + 0.5;
}

void main() {
  vec2 cellSize = vec2(1.0 / uColumns, uCanvasAspect / uColumns);
  vec2 cell = floor(vUv / cellSize);
  float cellHash = hash(cell);
  float angle = cellHash * TWO_PI;
  vec2 direction = vec2(cos(angle), sin(angle));
  float wobble = sin(uTime * uSpeed * TWO_PI + cellHash * TWO_PI);
  vec2 displacement = direction * wobble * uAmount;

  float r = texture2D(uTex, toCoverUv(vUv + displacement * (1.0 + uRgbSpread))).r;
  float g = texture2D(uTex, toCoverUv(vUv + displacement)).g;
  float b = texture2D(uTex, toCoverUv(vUv + displacement * (1.0 - uRgbSpread))).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// Per-cell displacement shimmer with an optional channel spread along each
// cell's wobble. Amount 0 renders the media untouched, so transitions can
// cross that endpoint invisibly.
export function GridDisplacement({
  src,
  mediaType = 'image',
  amount,
  columns = 12,
  speed = 0.5,
  rgbShift = 0,
  seed = 0,
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
              uColumns: columns,
              uSpeed: speed,
              uRgbSpread: clampUnit(rgbShift) * MAX_RGB_SPREAD,
              uSeed: seed,
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
