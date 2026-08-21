// The reference implementation left the seed frozen at 1; stepping it per
// frame turns the hash field into animated static.
const INITIAL_NOISE_SEED = 1;
const NOISE_SEED_STEP_PER_FRAME = 1;

export function getNoiseSeed(input: { frame: number }): number {
  return INITIAL_NOISE_SEED + input.frame * NOISE_SEED_STEP_PER_FRAME;
}
