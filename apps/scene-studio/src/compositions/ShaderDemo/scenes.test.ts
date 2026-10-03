import { describe, expect, it } from 'vitest';

import { getShaderDemoDurationInFrames } from './scenes';

describe('getShaderDemoDurationInFrames', () => {
  it('covers all shader scenes in the demo duration', () => {
    const expectedDurationInFrames = 1950;

    const result = getShaderDemoDurationInFrames();

    expect(result).toBe(expectedDurationInFrames);
  });
});
