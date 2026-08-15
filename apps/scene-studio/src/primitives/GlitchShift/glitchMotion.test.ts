import { describe, expect, it } from 'vitest';

import { getGlitchIntensity, getGlitchTick } from './glitchMotion';

const TEN_SECONDS_OF_FRAMES = Array.from({ length: 300 }, (_, frame) => frame);

describe('getGlitchIntensity', () => {
  it('stays within the unit range across a long sweep', () => {
    const intensities = TEN_SECONDS_OF_FRAMES.map((frame) =>
      getGlitchIntensity({ frame, fps: 30, seed: 0 })
    );

    expect(
      intensities.every((intensity) => intensity >= 0 && intensity <= 1)
    ).toBe(true);
  });

  it('rests between bursts and fires during them', () => {
    const intensities = TEN_SECONDS_OF_FRAMES.map((frame) =>
      getGlitchIntensity({ frame, fps: 30, seed: 0 })
    );

    expect(intensities.some((intensity) => intensity === 0)).toBe(true);
    expect(intensities.some((intensity) => intensity > 0)).toBe(true);
  });

  it('returns the same intensity for the same frame', () => {
    const first = getGlitchIntensity({ frame: 42, fps: 30, seed: 3 });
    const second = getGlitchIntensity({ frame: 42, fps: 30, seed: 3 });

    expect(first).toBe(second);
  });

  it('produces a different burst pattern per seed', () => {
    const patternForSeedZero = TEN_SECONDS_OF_FRAMES.map((frame) =>
      getGlitchIntensity({ frame, fps: 30, seed: 0 })
    );
    const patternForSeedFive = TEN_SECONDS_OF_FRAMES.map((frame) =>
      getGlitchIntensity({ frame, fps: 30, seed: 5 })
    );

    expect(patternForSeedZero).not.toEqual(patternForSeedFive);
  });

  it('decays within a burst', () => {
    const intensities = TEN_SECONDS_OF_FRAMES.map((frame) =>
      getGlitchIntensity({ frame, fps: 30, seed: 0 })
    );
    const burstStart = intensities.findIndex((intensity) => intensity > 0);

    expect(intensities[burstStart + 1]).toBeLessThan(intensities[burstStart]);
  });
});

describe('getGlitchTick', () => {
  it.each([
    { frame: 0, expectedTick: 0 },
    { frame: 3, expectedTick: 0 },
    { frame: 4, expectedTick: 1 },
    { frame: 30, expectedTick: 8 },
  ])(
    'steps to tick $expectedTick at frame $frame',
    ({ frame, expectedTick }) => {
      const tick = getGlitchTick({ frame, fps: 30 });

      expect(tick).toBe(expectedTick);
    }
  );
});
