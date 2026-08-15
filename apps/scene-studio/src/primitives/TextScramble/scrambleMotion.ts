import { getSeededRandom } from '../../utils/seededRandom';

export const DEFAULT_SCRAMBLE_GLYPHS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&';

// Spreads neighbouring characters across the hash so they never cycle in step.
const CHARACTER_SEED_STRIDE = 97.7;

interface ScrambleCharacterInput {
  finalCharacter: string;
  characterIndex: number;
  characterCount: number;
  frame: number;
  fps: number;
  enterDelayInFrames: number;
  settleDurationInFrames: number;
  scrambleTicksPerSecond: number;
  glyphs: string;
  seed: number;
}

export function getScrambleCharacter({
  finalCharacter,
  characterIndex,
  characterCount,
  frame,
  fps,
  enterDelayInFrames,
  settleDurationInFrames,
  scrambleTicksPerSecond,
  glyphs,
  seed,
}: ScrambleCharacterInput): {
  character: string;
  isSettled: boolean;
  isVisible: boolean;
} {
  const isVisible = frame >= enterDelayInFrames;
  const settleFrame =
    enterDelayInFrames +
    ((characterIndex + 1) / characterCount) * settleDurationInFrames;
  const isWhitespace = finalCharacter.trim().length === 0;

  if (isWhitespace || frame >= settleFrame) {
    return { character: finalCharacter, isSettled: true, isVisible };
  }

  const tick = Math.floor((frame / fps) * scrambleTicksPerSecond);
  const glyphIndex = Math.floor(
    getSeededRandom(characterIndex * CHARACTER_SEED_STRIDE + tick, seed) *
      glyphs.length
  );

  return {
    character: glyphs.charAt(glyphIndex),
    isSettled: false,
    isVisible,
  };
}
