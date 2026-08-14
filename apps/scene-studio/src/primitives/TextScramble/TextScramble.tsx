import { useCurrentFrame, useVideoConfig } from 'remotion';

import { cn } from '../../utils/cn';
import {
  DEFAULT_SCRAMBLE_GLYPHS,
  getScrambleCharacter,
} from './scrambleMotion';

const UNSETTLED_OPACITY = 0.85;

function getCharacterOpacity(character: {
  isSettled: boolean;
  isVisible: boolean;
}): number {
  if (!character.isVisible) {
    return 0;
  }

  return character.isSettled ? 1 : UNSETTLED_OPACITY;
}

interface Props {
  text: string;
  enterDelayInFrames?: number;
  settleDurationInFrames?: number;
  scrambleTicksPerSecond?: number;
  glyphs?: string;
  seed?: number;
  className?: string;
}

export function TextScramble({
  text,
  enterDelayInFrames = 0,
  settleDurationInFrames = 45,
  scrambleTicksPerSecond = 15,
  glyphs = DEFAULT_SCRAMBLE_GLYPHS,
  seed = 0,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const finalCharacters = Array.from(text);
  const characters = finalCharacters.map((finalCharacter, characterIndex) => ({
    characterIndex,
    ...getScrambleCharacter({
      finalCharacter,
      characterIndex,
      characterCount: finalCharacters.length,
      frame,
      fps,
      enterDelayInFrames,
      settleDurationInFrames,
      scrambleTicksPerSecond,
      glyphs,
      seed,
    }),
  }));

  return (
    // The monospace-first font-original stack keeps every glyph the same width,
    // so the line does not reflow while the characters cycle. Characters before
    // the enter delay stay in the flow at opacity 0 to hold that width.
    <p
      className={cn('font-original', className)}
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {characters.map((character) => (
        <span
          key={`character-${character.characterIndex}`}
          className={
            character.isSettled ? 'text-base-white' : 'text-main-default'
          }
          style={{ opacity: getCharacterOpacity(character) }}
        >
          {character.character}
        </span>
      ))}
    </p>
  );
}
