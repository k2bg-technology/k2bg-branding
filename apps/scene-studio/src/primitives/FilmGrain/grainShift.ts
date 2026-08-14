const GRAIN_SHIFT_INTERVAL_IN_FRAMES = 2;

// Fixed offsets so the grain "boils" deterministically instead of animating
// the (expensive, non-deterministic-looking) turbulence seed itself.
const SHIFT_PATTERN = [
  { x: 0, y: 0 },
  { x: -7, y: 4 },
  { x: 5, y: -6 },
  { x: -3, y: -8 },
  { x: 8, y: 7 },
  { x: -6, y: -2 },
] as const;

export function getGrainShift(frame: number): { x: number; y: number } {
  const step = Math.floor(frame / GRAIN_SHIFT_INTERVAL_IN_FRAMES);

  return SHIFT_PATTERN[step % SHIFT_PATTERN.length] ?? SHIFT_PATTERN[0];
}
