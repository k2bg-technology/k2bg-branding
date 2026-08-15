import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import {
  COVER_FIT_VERTEX_SHADER,
  getCoverUvScale,
  getImageAspect,
} from '../shared/coverFit';
import { ScreenQuad } from '../shared/ScreenQuad';
import { useImageTexture } from '../shared/useImageTexture';

interface Props {
  src: string;
  amount: number;
}

// UV shift of the red/blue channels at amount = 1.
const MAX_SHIFT_IN_UV = 0.05;

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform float uShiftInUv;

void main() {
  float r = texture2D(uTex, vUv + vec2(uShiftInUv, 0.0)).r;
  float g = texture2D(uTex, vUv).g;
  float b = texture2D(uTex, vUv - vec2(uShiftInUv, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export function ChannelShift({ src, amount }: Props) {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <ShiftedImage src={src} amount={amount} canvasAspect={width / height} />
    </ThreeCanvas>
  );
}

function ShiftedImage({
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
      vertexShader={COVER_FIT_VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      uniformValues={{
        uTex: texture,
        uCoverScale: new Vector2(coverScale.x, coverScale.y),
        uShiftInUv: clampUnit(amount) * MAX_SHIFT_IN_UV,
      }}
    />
  );
}
