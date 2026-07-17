// The reference implementation accumulated 0.01 per ~60fps frame; expressing
// the step per second keeps the flow speed independent of the composition fps.
const TIME_ACCUMULATION_PER_SECOND = 0.6;

export function getGradientTime(input: { frame: number; fps: number }): number {
  return Math.sin((TIME_ACCUMULATION_PER_SECOND * input.frame) / input.fps);
}
