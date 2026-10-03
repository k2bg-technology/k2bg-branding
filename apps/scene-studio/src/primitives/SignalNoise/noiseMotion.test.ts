import { describe, expect, it } from 'vitest';

import { getNoiseSeed } from './noiseMotion';

describe('getNoiseSeed', () => {
  it('matches the reference seed on the first frame', () => {
    const seed = getNoiseSeed({ frame: 0 });

    const referenceSeed = 1;
    expect(seed).toBe(referenceSeed);
  });

  it('yields a different seed on consecutive frames', () => {
    const firstSeed = getNoiseSeed({ frame: 1 });
    const secondSeed = getNoiseSeed({ frame: 2 });

    expect(firstSeed).not.toBe(secondSeed);
  });

  it('steps linearly between frames', () => {
    const earlyStep = getNoiseSeed({ frame: 5 }) - getNoiseSeed({ frame: 4 });
    const lateStep = getNoiseSeed({ frame: 10 }) - getNoiseSeed({ frame: 9 });

    expect(earlyStep).toBe(lateStep);
  });
});
