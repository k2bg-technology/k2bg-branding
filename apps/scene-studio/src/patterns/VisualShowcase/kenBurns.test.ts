import { describe, expect, it } from 'vitest';

import { getKenBurnsTransform } from './kenBurns';

describe('getKenBurnsTransform', () => {
  it('starts each item at its unscaled position', () => {
    const result = getKenBurnsTransform({
      frame: 0,
      durationInFrames: 120,
      itemIndex: 0,
    });

    expect(result).toBe('scale(1) translate(0%, 0%)');
  });

  it('applies a deterministic zoom and pan for each item index', () => {
    const result = getKenBurnsTransform({
      frame: 120,
      durationInFrames: 120,
      itemIndex: 1,
    });

    expect(result).toBe('scale(1.08) translate(2%, -2%)');
  });

  it('clamps motion outside an item duration', () => {
    const result = getKenBurnsTransform({
      frame: 200,
      durationInFrames: 120,
      itemIndex: 2,
    });

    expect(result).toBe('scale(1.08) translate(-2%, 2%)');
  });
});
