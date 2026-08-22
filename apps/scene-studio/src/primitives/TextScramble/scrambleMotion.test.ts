import { describe, expect, it } from 'vitest';

import { SCENE_FPS } from '../../tokens/motion';
import {
  DEFAULT_SCRAMBLE_GLYPHS,
  getScrambleCharacter,
} from './scrambleMotion';

const settleDurationInFrames = 45;
const scrambleTicksPerSecond = 15;
const scrambledText = 'SCENESTUDIO';

function getScrambledCharacters(input: {
  text: string;
  frame: number;
  enterDelayInFrames?: number;
  seed?: number;
}) {
  const finalCharacters = Array.from(input.text);

  return finalCharacters.map((finalCharacter, characterIndex) =>
    getScrambleCharacter({
      finalCharacter,
      characterIndex,
      characterCount: finalCharacters.length,
      frame: input.frame,
      fps: SCENE_FPS,
      enterDelayInFrames: input.enterDelayInFrames ?? 0,
      settleDurationInFrames,
      scrambleTicksPerSecond,
      glyphs: DEFAULT_SCRAMBLE_GLYPHS,
      seed: input.seed ?? 0,
    })
  );
}

function joinCharacters(
  characters: ReturnType<typeof getScrambledCharacters>
): string {
  return characters.map((character) => character.character).join('');
}

describe('getScrambleCharacter', () => {
  it('reveals the original text once the settle duration has passed', () => {
    const result = getScrambledCharacters({
      text: scrambledText,
      frame: settleDurationInFrames,
    });

    expect(joinCharacters(result)).toBe(scrambledText);
    expect(result.every((character) => character.isSettled)).toBe(true);
  });

  it('never unsettles a character that has already settled', () => {
    const frames = Array.from(
      { length: settleDurationInFrames + 1 },
      (_, frame) => frame
    );

    const settledCounts = frames.map(
      (frame) =>
        getScrambledCharacters({ text: scrambledText, frame }).filter(
          (character) => character.isSettled
        ).length
    );

    const nonDecreasingCounts = [...settledCounts].sort(
      (left, right) => left - right
    );
    expect(settledCounts).toEqual(nonDecreasingCounts);
  });

  it.each([
    {
      description: 'settles the first character early',
      characterIndex: 0,
      frame: 6,
      expectedIsSettled: true,
    },
    {
      description: 'leaves the last character scrambling at the same frame',
      characterIndex: 10,
      frame: 6,
      expectedIsSettled: false,
    },
    {
      description: 'settles the middle character around the halfway point',
      characterIndex: 5,
      frame: 25,
      expectedIsSettled: true,
    },
    {
      description: 'leaves the last character scrambling at the halfway point',
      characterIndex: 10,
      frame: 25,
      expectedIsSettled: false,
    },
  ])('$description', ({ characterIndex, frame, expectedIsSettled }) => {
    const result = getScrambledCharacters({ text: scrambledText, frame });

    expect(result[characterIndex].isSettled).toBe(expectedIsSettled);
  });

  it.each([{ frame: 0 }, { frame: 8 }, { frame: 20 }])(
    'draws every unsettled character from the glyph set at frame $frame',
    ({ frame }) => {
      const result = getScrambledCharacters({ text: scrambledText, frame });

      const unsettledCharacters = result.filter(
        (character) => !character.isSettled
      );
      expect(unsettledCharacters.length).toBeGreaterThan(0);
      expect(
        unsettledCharacters.every((character) =>
          DEFAULT_SCRAMBLE_GLYPHS.includes(character.character)
        )
      ).toBe(true);
    }
  );

  it.each([
    {
      description: 'hides characters before the enter delay',
      frame: 4,
      expectedIsVisible: false,
    },
    {
      description: 'shows characters from the enter delay onward',
      frame: 10,
      expectedIsVisible: true,
    },
  ])('$description', ({ frame, expectedIsVisible }) => {
    const enterDelayInFrames = 10;

    const result = getScrambledCharacters({
      text: scrambledText,
      frame,
      enterDelayInFrames,
    });

    expect(
      result.every((character) => character.isVisible === expectedIsVisible)
    ).toBe(true);
  });

  it('passes whitespace through as settled from the first frame', () => {
    const spaceIndex = 5;

    const result = getScrambledCharacters({ text: 'SCENE STUDIO', frame: 0 });

    expect(result[spaceIndex].character).toBe(' ');
    expect(result[spaceIndex].isSettled).toBe(true);
  });

  it('produces the same characters for the same inputs', () => {
    const frame = 12;

    const result = getScrambledCharacters({ text: scrambledText, frame });

    const repeatedResult = getScrambledCharacters({
      text: scrambledText,
      frame,
    });
    expect(joinCharacters(repeatedResult)).toBe(joinCharacters(result));
  });

  it('produces a different scramble sequence for a different seed', () => {
    const frames = Array.from({ length: 30 }, (_, frame) => frame);

    const sequence = frames.map((frame) =>
      joinCharacters(getScrambledCharacters({ text: scrambledText, frame }))
    );

    const reseededSequence = frames.map((frame) =>
      joinCharacters(
        getScrambledCharacters({ text: scrambledText, frame, seed: 5 })
      )
    );
    expect(reseededSequence).not.toEqual(sequence);
  });
});
