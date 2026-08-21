import type { Texture } from 'three';

// Cover-fit texture mapping: scale UV around the center so an arbitrary-aspect
// image fills the canvas, cropping the overflowing axis (CSS object-fit: cover).
export const COVER_FIT_VERTEX_SHADER = `
varying vec2 vUv;

uniform vec2 uCoverScale;

void main() {
  vUv = (uv - 0.5) * uCoverScale + 0.5;
  gl_Position = vec4(position, 1.0);
}
`;

// TextureLoader always decodes into an HTMLImageElement, but three types
// Texture.image as unknown; centralize the cast here.
export function getImageAspect(texture: Texture): number {
  const image = texture.image as HTMLImageElement;

  return image.width / image.height;
}

// Media textures back onto different sources per path: HTMLImageElement
// (TextureLoader) or HTMLVideoElement (preview VideoTexture). Videos expose
// their intrinsic size only via videoWidth/videoHeight.
export function getTextureAspect(texture: Texture): number {
  const image = texture.image as HTMLImageElement | HTMLVideoElement;

  if ('videoWidth' in image && image.videoWidth > 0) {
    return image.videoWidth / image.videoHeight;
  }

  return image.width / image.height;
}

export function getCoverUvScale(input: {
  canvasAspect: number;
  imageAspect: number;
}): { x: number; y: number } {
  if (input.imageAspect >= input.canvasAspect) {
    return { x: input.canvasAspect / input.imageAspect, y: 1 };
  }

  return { x: 1, y: input.imageAspect / input.canvasAspect };
}
