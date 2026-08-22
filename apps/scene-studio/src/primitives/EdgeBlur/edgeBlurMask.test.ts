import { describe, expect, it } from 'vitest';

import { getEdgeBlurMask } from './edgeBlurMask';

describe('getEdgeBlurMask', () => {
  it.each([
    {
      edge: 'top' as const,
      expectedMask: 'linear-gradient(to bottom, black, transparent)',
    },
    {
      edge: 'bottom' as const,
      expectedMask: 'linear-gradient(to top, black, transparent)',
    },
  ])('fades the $edge band away from its edge', ({ edge, expectedMask }) => {
    const result = getEdgeBlurMask(edge);

    expect(result).toBe(expectedMask);
  });
});
