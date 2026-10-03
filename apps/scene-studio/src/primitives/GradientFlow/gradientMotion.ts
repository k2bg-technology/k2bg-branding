// The reference implementation accumulated 0.01 per ~60fps frame but wrapped
// it in Math.sin, slowly rocking the field back and forth; linear elapsed
// time keeps the gradient flowing continuously instead. The per-second step
// keeps the flow speed independent of the composition fps.
const TIME_ACCUMULATION_PER_SECOND = 0.6;

export function getGradientTime(input: { frame: number; fps: number }): number {
  return (TIME_ACCUMULATION_PER_SECOND * input.frame) / input.fps;
}
