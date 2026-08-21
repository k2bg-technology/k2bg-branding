// Shader clocks run in seconds so effect speeds are frame-rate independent;
// primitives scale this by their own speed uniform on the GPU.
export function getEffectTimeInSeconds(input: {
  frame: number;
  fps: number;
}): number {
  return input.frame / input.fps;
}
