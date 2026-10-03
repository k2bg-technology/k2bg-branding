import { useVideoConfig } from 'remotion';
import { NoColorSpace, Vector2, Vector3 } from 'three';

import { clampUnit } from '../../utils/clampUnit';
import { getCoverUvScale, getTextureAspect } from '../shared/coverFit';
import { MediaTextureStage, type MediaType } from '../shared/MediaTextureStage';
import { ScreenQuad } from '../shared/ScreenQuad';
import { parseHexColor } from './hexColor';

interface Props {
  src: string;
  mediaType?: MediaType;
  amount: number;
  shadowColor?: string;
  highlightColor?: string;
}

// Luminance drives a two-color ramp; amount blends the original back in, so
// 0 passes pixels through.
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uCoverScale;
uniform float uAmount;
uniform vec3 uShadowColor;
uniform vec3 uHighlightColor;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

void main() {
  vec2 coverUv = (vUv - 0.5) * uCoverScale + 0.5;
  vec3 original = texture2D(uTex, coverUv).rgb;
  float luminance = dot(original, LUMA);
  vec3 mapped = mix(uShadowColor, uHighlightColor, luminance);

  gl_FragColor = vec4(mix(original, mapped, uAmount), 1.0);
}
`;

export function Duotone({
  src,
  mediaType = 'image',
  amount,
  shadowColor = '#14161a',
  highlightColor = '#b8d200',
}: Props) {
  const { width, height } = useVideoConfig();
  const shadow = parseHexColor(shadowColor);
  const highlight = parseHexColor(highlightColor);

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
              uAmount: clampUnit(amount),
              uShadowColor: new Vector3(shadow.red, shadow.green, shadow.blue),
              uHighlightColor: new Vector3(
                highlight.red,
                highlight.green,
                highlight.blue
              ),
            }}
          />
        );
      }}
    </MediaTextureStage>
  );
}
