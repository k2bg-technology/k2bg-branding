import { describe, expect, it } from 'vitest';

import { getAccentLabelMotion } from './accentLabelMotion';

const restingTextOffsetInPx = 24;

describe('getAccentLabelMotion', () => {
  it.each([
    {
      description: 'keeps the label at rest before the enter delay',
      frame: 0,
      enterDelayInFrames: 30,
    },
    {
      description: 'clamps to the resting state for negative frames',
      frame: -15,
      enterDelayInFrames: 0,
    },
  ])('$description', ({ frame, enterDelayInFrames }) => {
    const result = getAccentLabelMotion({ frame, enterDelayInFrames });

    expect(result.barScale).toBeCloseTo(0);
    expect(result.textOpacity).toBeCloseTo(0);
    expect(result.textTranslateXInPx).toBeCloseTo(restingTextOffsetInPx);
  });

  it('settles bar and text by frame 38 after a 12-frame enter delay', () => {
    const enterDelayInFrames = 12;

    const result = getAccentLabelMotion({
      frame: 38,
      enterDelayInFrames,
    });

    expect(result.barScale).toBeCloseTo(1);
    expect(result.textOpacity).toBeCloseTo(1);
    expect(result.textTranslateXInPx).toBeCloseTo(0);
  });

  it.each([{ frame: 6 }, { frame: 10 }, { frame: 16 }])(
    'grows the bar ahead of the text at frame $frame',
    ({ frame }) => {
      const result = getAccentLabelMotion({ frame, enterDelayInFrames: 0 });

      expect(result.barScale).toBeGreaterThan(result.textOpacity);
    }
  );
});
