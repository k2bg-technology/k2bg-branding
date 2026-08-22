// GLSL-style hash: fract(sin(n · 127.1) · 43758.5453) — deterministic, render-safe.
const PSEUDO_RANDOM_SINE_MULTIPLIER = 127.1;
const PSEUDO_RANDOM_MAGNITUDE = 43758.5453;
// Wrap 5% beyond both vertical edges so particles never pop at the border.
const VERTICAL_WRAP_RANGE_IN_PERCENT = 110;
const VERTICAL_WRAP_OFFSET_IN_PERCENT = 5;

function getPseudoRandom(value: number): number {
  const scaled =
    Math.sin(value * PSEUDO_RANDOM_SINE_MULTIPLIER) * PSEUDO_RANDOM_MAGNITUDE;

  return scaled - Math.floor(scaled);
}

interface ParticleStateInput {
  particleIndex: number;
  frame: number;
  seed?: number;
}

export function getParticleState({
  particleIndex,
  frame,
  seed = 0,
}: ParticleStateInput) {
  const particleKey = particleIndex + seed * 101;
  const baseXInPercent = getPseudoRandom(3 * particleKey + 1) * 100;
  const baseYInPercent = getPseudoRandom(3 * particleKey + 2) * 100;
  const swayFrequency = 0.008 + 0.01 * getPseudoRandom(particleKey);
  const swayPhase = 2 * Math.PI * getPseudoRandom(particleKey + 7);
  const riseSpeedInPercent = 0.02 + 0.05 * getPseudoRandom(particleKey + 13);
  const twinkleFrequency = 0.03 + 0.04 * getPseudoRandom(particleKey + 19);
  const twinklePhase = 2 * Math.PI * getPseudoRandom(particleKey + 23);

  const driftedY = baseYInPercent - frame * riseSpeedInPercent;
  const wrappedY =
    (((driftedY % VERTICAL_WRAP_RANGE_IN_PERCENT) +
      VERTICAL_WRAP_RANGE_IN_PERCENT) %
      VERTICAL_WRAP_RANGE_IN_PERCENT) -
    VERTICAL_WRAP_OFFSET_IN_PERCENT;

  return {
    xInPercent:
      baseXInPercent + 2.5 * Math.sin(frame * swayFrequency + swayPhase),
    yInPercent: wrappedY,
    sizeInPx: 1.5 + 4 * getPseudoRandom(3 * particleKey + 3),
    opacity:
      0.1 +
      0.45 * (0.5 + 0.5 * Math.sin(frame * twinkleFrequency + twinklePhase)),
  };
}
