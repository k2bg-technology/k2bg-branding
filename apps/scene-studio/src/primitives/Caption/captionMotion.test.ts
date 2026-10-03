import { describe, expect, it } from 'vitest';

import { getCaptionMotion } from './captionMotion';

describe('getCaptionMotion', () => {
  it.each([
    {
      description: 'is invisible before the enter delay',
      frame: 0,
      enterDelayInFrames: 30,
      expectedOpacity: 0,
      expectedTranslateYInPx: 24,
    },
    {
      description: 'is halfway through the enter animation',
      frame: 10,
      enterDelayInFrames: 0,
      expectedOpacity: 0.5,
      expectedTranslateYInPx: 12,
    },
    {
      description: 'is fully visible after the enter duration',
      frame: 20,
      enterDelayInFrames: 0,
      expectedOpacity: 1,
      expectedTranslateYInPx: 0,
    },
    {
      description: 'stays visible when no exit frame is set',
      frame: 500,
      enterDelayInFrames: 0,
      expectedOpacity: 1,
      expectedTranslateYInPx: 0,
    },
  ])(
    '$description',
    ({
      frame,
      enterDelayInFrames,
      expectedOpacity,
      expectedTranslateYInPx,
    }) => {
      const result = getCaptionMotion({ frame, enterDelayInFrames });

      expect(result.opacity).toBeCloseTo(expectedOpacity);
      expect(result.translateYInPx).toBeCloseTo(expectedTranslateYInPx);
    }
  );

  it.each([
    {
      description: 'stays visible until the exit frame',
      frame: 110,
      expectedOpacity: 1,
    },
    {
      description: 'is halfway through the exit fade',
      frame: 115,
      expectedOpacity: 0.5,
    },
    {
      description: 'is invisible after the exit fade',
      frame: 130,
      expectedOpacity: 0,
    },
  ])('$description', ({ frame, expectedOpacity }) => {
    const exitAtFrame = 110;

    const result = getCaptionMotion({
      frame,
      enterDelayInFrames: 0,
      exitAtFrame,
    });

    expect(result.opacity).toBeCloseTo(expectedOpacity);
  });
});
