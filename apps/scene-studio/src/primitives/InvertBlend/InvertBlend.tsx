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

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform float uMixRatio;

void main() {
  vec3 color = texture2D(uTex, vUv).rgb;
  gl_FragColor = vec4(mix(color, 1.0 - color, uMixRatio), 1.0);
}
`;

export function InvertBlend({ src, amount }: Props) {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <InvertedImage src={src} amount={amount} canvasAspect={width / height} />
    </ThreeCanvas>
  );
}

function InvertedImage({
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
        uMixRatio: clampUnit(amount),
      }}
    />
  );
}
