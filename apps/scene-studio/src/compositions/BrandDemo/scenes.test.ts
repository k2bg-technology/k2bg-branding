import { describe, expect, it } from 'vitest';

import { getBrandDemoDurationInFrames } from './scenes';

describe('getBrandDemoDurationInFrames', () => {
  it('keeps the demo at 15 seconds at 30fps', () => {
    const expectedDurationInFrames = 450;

    const result = getBrandDemoDurationInFrames();

    expect(result).toBe(expectedDurationInFrames);
  });
});
