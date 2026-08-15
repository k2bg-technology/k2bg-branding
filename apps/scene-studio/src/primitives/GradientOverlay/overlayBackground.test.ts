import { describe, expect, it } from 'vitest';

import { getOverlayBackground } from './overlayBackground';

describe('getOverlayBackground', () => {
  it.each([
    {
      description: 'renders a flat dark layer for full position',
      position: 'full',
      tone: 'dark',
      maxOpacity: 0.6,
      expected: 'rgba(0, 0, 0, 0.6)',
    },
    {
      description: 'fades upward from the bottom edge',
      position: 'bottom',
      tone: 'dark',
      maxOpacity: 0.6,
      expected: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))',
    },
    {
      description: 'fades downward from the top edge with the brand tone',
      position: 'top',
      tone: 'brand',
      maxOpacity: 0.8,
      expected:
        'linear-gradient(to bottom, rgba(71, 74, 77, 0.8), rgba(71, 74, 77, 0))',
    },
  ] as const)('$description', ({ position, tone, maxOpacity, expected }) => {
    const result = getOverlayBackground({ position, tone, maxOpacity });

    expect(result).toBe(expected);
  });
});
