const SINE_MULTIPLIER = 127.1;
const SEED_MULTIPLIER = 311.7;
const MAGNITUDE = 43758.5453123;

// GLSL-style fract(sin(...)) hash: deterministic across renders, unlike Math.random.
export function getSeededRandom(value: number, seed = 0): number {
  const raw =
    Math.sin(value * SINE_MULTIPLIER + seed * SEED_MULTIPLIER) * MAGNITUDE;
  return raw - Math.floor(raw);
}
