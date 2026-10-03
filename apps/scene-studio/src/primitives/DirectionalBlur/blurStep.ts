import { clampUnit } from '../../utils/clampUnit';

// Total smear length in screen-height units at amount = 1.
export const MAX_SMEAR_IN_SCREEN = 0.4;
// Samples spread across the smear; the shader reads this same constant.
export const TAP_COUNT = 24;

const DEGREES_TO_RADIANS = Math.PI / 180;

// The smear axis is measured in screen space (height units) so a given angle
// points the same way regardless of the canvas aspect; only the x component
// converts back into UV space.
export function getDirectionalStepInUv(input: {
  amount: number;
  angleInDegrees: number;
  canvasAspect: number;
}): { x: number; y: number } {
  const stepLength =
    (clampUnit(input.amount) * MAX_SMEAR_IN_SCREEN) / (TAP_COUNT - 1);
  const angleInRadians = input.angleInDegrees * DEGREES_TO_RADIANS;

  return {
    x: (Math.cos(angleInRadians) * stepLength) / input.canvasAspect,
    y: Math.sin(angleInRadians) * stepLength,
  };
}
