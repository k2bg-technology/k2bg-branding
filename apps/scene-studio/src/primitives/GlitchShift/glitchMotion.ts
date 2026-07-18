// Burst scheduling: time is divided into slots; a hash of (slot, seed)
// decides whether a burst fires and how strong it hits, and each burst
// decays over the head of its slot. Pure functions of the frame keep the
// glitch deterministic across renders.
const SLOT_DURATION_IN_SECONDS = 0.6;
const BURST_SHARE_OF_SLOT = 0.45;
const BURST_PROBABILITY = 0.6;
const MINIMUM_BURST_STRENGTH = 0.4;

// The band pattern re-rolls at this rate while a burst is active so the
// tear lines jump instead of sliding.
const TICKS_PER_SECOND = 8;

function hash(value: number, seed: number): number {
  const raw = Math.sin(value * 127.1 + seed * 311.7) * 43758.5453123;

  return raw - Math.floor(raw);
}

export function getGlitchIntensity(input: {
  frame: number;
  fps: number;
  seed: number;
}): number {
  const timeInSeconds = input.frame / input.fps;
  const slot = Math.floor(timeInSeconds / SLOT_DURATION_IN_SECONDS);
  const fires = hash(slot, input.seed) < BURST_PROBABILITY;
  if (!fires) {
    return 0;
  }

  const slotProgress = timeInSeconds / SLOT_DURATION_IN_SECONDS - slot;
  if (slotProgress >= BURST_SHARE_OF_SLOT) {
    return 0;
  }

  const decay = 1 - slotProgress / BURST_SHARE_OF_SLOT;
  const strength =
    MINIMUM_BURST_STRENGTH +
    (1 - MINIMUM_BURST_STRENGTH) * hash(slot + 0.37, input.seed);

  return strength * decay;
}

export function getGlitchTick(input: { frame: number; fps: number }): number {
  return Math.floor((input.frame / input.fps) * TICKS_PER_SECOND);
}
