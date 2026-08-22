import { describe, expect, it } from 'vitest';

import { getLightLeakMotion } from './lightLeakMotion';

const PULSE_PERIOD_IN_FRAMES = 180;

function getFirstWashOpacities(): number[] {
  return Array.from(
    { length: PULSE_PERIOD_IN_FRAMES },
    (_, frame) => getLightLeakMotion(frame)[0]?.opacity ?? 0
  );
}

describe('getLightLeakMotion', () => {
  it('returns two washes with distinct colors', () => {
    const result = getLightLeakMotion(0);

    expect(result).toHaveLength(2);
    expect(result[0]?.color).not.toEqual(result[1]?.color);
  });

  it('returns the same washes for the same frame', () => {
    const firstResult = getLightLeakMotion(77);
    const secondResult = getLightLeakMotion(77);

    expect(firstResult).toEqual(secondResult);
  });

  it('rests near the base opacity between pulses', () => {
    const opacities = getFirstWashOpacities();

    expect(Math.min(...opacities)).toBeLessThan(0.05);
  });

  it('flares close to the pulse peak once per period', () => {
    const opacities = getFirstWashOpacities();

    expect(Math.max(...opacities)).toBeGreaterThan(0.3);
    expect(Math.max(...opacities)).toBeLessThanOrEqual(0.4);
  });

  it('repeats the pulse one period later', () => {
    const initialWashes = getLightLeakMotion(30);
    const laterWashes = getLightLeakMotion(30 + PULSE_PERIOD_IN_FRAMES);

    expect(laterWashes[0]?.opacity).toBeCloseTo(initialWashes[0]?.opacity ?? 0);
  });

  it('keeps wash centers near their anchors', () => {
    const result = getLightLeakMotion(120);

    const [firstWash, secondWash] = result;
    expect(firstWash?.centerXInPercent).toBeGreaterThanOrEqual(15 - 18);
    expect(firstWash?.centerXInPercent).toBeLessThanOrEqual(15 + 18);
    expect(secondWash?.centerYInPercent).toBeGreaterThanOrEqual(75 - 14);
    expect(secondWash?.centerYInPercent).toBeLessThanOrEqual(75 + 14);
  });
});
