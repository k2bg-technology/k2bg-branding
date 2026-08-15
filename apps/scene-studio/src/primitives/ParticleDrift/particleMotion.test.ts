import { describe, expect, it } from 'vitest';

import { getParticleState } from './particleMotion';

describe('getParticleState', () => {
  it('returns the same state for the same particle and frame', () => {
    const firstResult = getParticleState({ particleIndex: 5, frame: 42 });
    const secondResult = getParticleState({ particleIndex: 5, frame: 42 });

    expect(firstResult).toEqual(secondResult);
  });

  it('places distinct particles at distinct positions', () => {
    const firstParticle = getParticleState({ particleIndex: 1, frame: 0 });
    const secondParticle = getParticleState({ particleIndex: 2, frame: 0 });

    expect(firstParticle.xInPercent).not.toBeCloseTo(secondParticle.xInPercent);
    expect(firstParticle.yInPercent).not.toBeCloseTo(secondParticle.yInPercent);
  });

  it('changes the layout with the seed', () => {
    const defaultSeedParticle = getParticleState({
      particleIndex: 1,
      frame: 0,
    });
    const reseededParticle = getParticleState({
      particleIndex: 1,
      frame: 0,
      seed: 9,
    });

    expect(defaultSeedParticle.xInPercent).not.toBeCloseTo(
      reseededParticle.xInPercent
    );
  });

  it.each([
    { frame: 0 },
    { frame: 150 },
    { frame: 900 },
  ])('keeps opacity and vertical position bounded at frame $frame', ({
    frame,
  }) => {
    const result = getParticleState({ particleIndex: 7, frame });

    expect(result.opacity).toBeGreaterThanOrEqual(0.1);
    expect(result.opacity).toBeLessThanOrEqual(0.55);
    expect(result.yInPercent).toBeGreaterThanOrEqual(-5);
    expect(result.yInPercent).toBeLessThanOrEqual(105);
  });

  it('drifts particles upward over time modulo the wrap', () => {
    const earlyState = getParticleState({ particleIndex: 3, frame: 10 });
    const laterState = getParticleState({ particleIndex: 3, frame: 11 });

    const wrapRangeInPercent = 110;
    const driftInPercent =
      (((earlyState.yInPercent - laterState.yInPercent) % wrapRangeInPercent) +
        wrapRangeInPercent) %
      wrapRangeInPercent;
    expect(driftInPercent).toBeGreaterThan(0);
    expect(driftInPercent).toBeLessThan(1);
  });
});
