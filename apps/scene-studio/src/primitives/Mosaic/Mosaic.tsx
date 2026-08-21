import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getImageAspect } from '../shared/coverFit';
import { ScreenQuad } from '../shared/ScreenQuad';
import { useImageTexture } from '../shared/useImageTexture';

interface Props {
  src: string;
  amount: number;
}

// Horizontal UV size of a mosaic cell at amount = 1.
const MAX_CELL_SIZE_IN_UV = 0.02;

// Cells are quantized in screen UV space (square on screen thanks to the
// canvas-aspect correction), then the cover-fit transform picks the texel.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uCellSizeInUv;
uniform float uCanvasAspect;

void main() {
  vec2 uv = vUv;
  if (uCellSizeInUv > 0.0) {
    vec2 cellSize = vec2(uCellSizeInUv, uCellSizeInUv * uCanvasAspect);
    uv = floor(uv / cellSize) * cellSize + cellSize * 0.5;
  }
  vec2 coverUv = (uv - 0.5) * uCoverScale + 0.5;
  gl_FragColor = vec4(texture2D(uTex, coverUv).rgb, 1.0);
}
`;

export function Mosaic({ src, amount }: Props) {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <MosaicImage src={src} amount={amount} canvasAspect={width / height} />
    </ThreeCanvas>
  );
}

function MosaicImage({
  src,
  amount,
  canvasAspect,
}: Props & { canvasAspect: number }) {
  // The shader writes raw values without an output color transform, so the
  // texture stays untagged for a byte-faithful passthrough at amount = 0.
  const texture = useImageTexture(src, { colorSpace: NoColorSpace });

  if (!texture) {
    return null;
  }

  const coverScale = getCoverUvScale({
    canvasAspect,
    imageAspect: getImageAspect(texture),
  });

  return (
    <ScreenQuad
      fragmentShader={FRAGMENT_SHADER}
      uniformValues={{
        uTex: texture,
        uCoverScale: new Vector2(coverScale.x, coverScale.y),
        uCellSizeInUv: clampUnit(amount) * MAX_CELL_SIZE_IN_UV,
        uCanvasAspect: canvasAspect,
      }}
    />
  );
}
