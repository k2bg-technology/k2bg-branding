import { clampUnit } from '../../utils/clampUnit';

const TWO_PI = Math.PI * 2;
// Screen-UV amplitude of the sway at parallaxAmount = 1.
const MAX_PARALLAX_IN_UV = 0.04;
// Push-in share of the frame at dollyAmount = 1.
const MAX_DOLLY_ZOOM = 0.12;
// The vertical sway is smaller than the horizontal one, like a handheld
// camera orbit.
const VERTICAL_SWAY_SHARE = 0.6;

// One elliptical camera orbit per 1 / speed seconds, plus a breathing
// push-in. Zero amounts return the exact identity so the primitive can rest
// invisibly.
export function getParallaxMotion(input: {
  frame: number;
  fps: number;
  speed: number;
  parallaxAmount: number;
  dollyAmount: number;
}): { offsetXInUv: number; offsetYInUv: number; zoom: number } {
  const phase = (input.frame / input.fps) * input.speed * TWO_PI;
  const amplitudeInUv = clampUnit(input.parallaxAmount) * MAX_PARALLAX_IN_UV;

  return {
    offsetXInUv: Math.sin(phase) * amplitudeInUv,
    offsetYInUv: Math.cos(phase) * amplitudeInUv * VERTICAL_SWAY_SHARE,
    zoom:
      1 +
      clampUnit(input.dollyAmount) *
        MAX_DOLLY_ZOOM *
        (0.5 - 0.5 * Math.cos(phase)),
  };
}
