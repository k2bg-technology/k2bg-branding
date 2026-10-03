import { describe, expect, it } from 'vitest';

import { getGrainShift } from './grainShift';

describe('getGrainShift', () => {
  it('returns the same shift for the same frame', () => {
    const first = getGrainShift(42);
    const second = getGrainShift(42);

    expect(first).toEqual(second);
  });

  it('holds the shift within the frame interval', () => {
    const intervalStart = getGrainShift(0);
    const intervalEnd = getGrainShift(1);

    expect(intervalStart).toEqual(intervalEnd);
  });

  it('moves the grain between intervals', () => {
    const firstInterval = getGrainShift(0);
    const secondInterval = getGrainShift(2);

    expect(firstInterval).not.toEqual(secondInterval);
  });
});
