import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import {
  COVER_FIT_VERTEX_SHADER,
  getCoverUvScale,
  getTextureAspect,
} from '../shared/coverFit';
import { ScreenQuad } from '../shared/ScreenQuad';
import { useImageTexture } from '../shared/useImageTexture';
import { getParallaxMotion } from './parallaxMotion';

interface Props {
  src: string;
  depthSrc: string;
  parallaxAmount: number;
  dollyAmount?: number;
  speed?: number;
  focus?: number;
  blurAmount?: number;
}

// Blur disc radius in UV at blurAmount = 1 and a full focus distance.
const MAX_BLUR_IN_UV = 0.012;

// The depth map scales both the sway (pixels at the focus depth stay still,
// near and far layers move apart) and the defocus blur. Brighter depth
// values read as nearer, the usual monocular-depth convention.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform vec2 uParallaxOffset;
uniform float uZoom;
uniform float uFocus;
uniform float uMaxBlurInUv;

const float DIAGONAL_SHARE = 0.7071;

void main() {
  vec2 zoomedUv = (vUv - 0.5) / uZoom + 0.5;
  float depth = texture2D(uDepthTex, zoomedUv).r;
  vec2 displacedUv = zoomedUv + uParallaxOffset * (depth - uFocus);

  float blurRadius = uMaxBlurInUv * abs(depth - uFocus);
  float diagonal = blurRadius * DIAGONAL_SHARE;
  vec3 color = texture2D(uTex, displacedUv).rgb;
  color += texture2D(uTex, displacedUv + vec2(blurRadius, 0.0)).rgb;
  color += texture2D(uTex, displacedUv - vec2(blurRadius, 0.0)).rgb;
  color += texture2D(uTex, displacedUv + vec2(0.0, blurRadius)).rgb;
  color += texture2D(uTex, displacedUv - vec2(0.0, blurRadius)).rgb;
  color += texture2D(uTex, displacedUv + vec2(diagonal, diagonal)).rgb;
  color += texture2D(uTex, displacedUv + vec2(diagonal, -diagonal)).rgb;
  color += texture2D(uTex, displacedUv + vec2(-diagonal, diagonal)).rgb;
  color += texture2D(uTex, displacedUv + vec2(-diagonal, -diagonal)).rgb;

  gl_FragColor = vec4(color / 9.0, 1.0);
}
`;

// Gives a still photo internal camera motion from a depth map: an elliptical
// sway whose displacement follows depth, a breathing push-in, and a depth-
// weighted defocus. Zero amounts render the untouched photo.
export function DepthParallax({
  src,
  depthSrc,
  parallaxAmount,
  dollyAmount = 0,
  speed = 0.25,
  focus = 0.5,
  blurAmount = 0,
}: Props) {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height}>
      <ParallaxImage
        src={src}
        depthSrc={depthSrc}
        parallaxAmount={parallaxAmount}
        dollyAmount={dollyAmount}
        speed={speed}
        focus={focus}
        blurAmount={blurAmount}
        canvasAspect={width / height}
      />
    </ThreeCanvas>
  );
}

function ParallaxImage({
  src,
  depthSrc,
  parallaxAmount,
  dollyAmount,
  speed,
  focus,
  blurAmount,
  canvasAspect,
}: Required<Props> & { canvasAspect: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Raw passthrough for the photo (ChannelShift convention); the depth map
  // is data, never color-managed.
  const texture = useImageTexture(src, { colorSpace: NoColorSpace });
  const depthTexture = useImageTexture(depthSrc, { colorSpace: NoColorSpace });

  if (!texture || !depthTexture) {
    return null;
  }

  const coverScale = getCoverUvScale({
    canvasAspect,
    imageAspect: getTextureAspect(texture),
  });
  const motion = getParallaxMotion({
    frame,
    fps,
    speed,
    parallaxAmount,
    dollyAmount,
  });

  return (
    <ScreenQuad
      vertexShader={COVER_FIT_VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      uniformValues={{
        uTex: texture,
        uDepthTex: depthTexture,
        uCoverScale: new Vector2(coverScale.x, coverScale.y),
        uParallaxOffset: new Vector2(motion.offsetXInUv, motion.offsetYInUv),
        uZoom: motion.zoom,
        uFocus: clampUnit(focus),
        uMaxBlurInUv: clampUnit(blurAmount) * MAX_BLUR_IN_UV,
      }}
    />
  );
}
