import type { Texture } from 'three';
import { describe, expect, it } from 'vitest';

import { getCoverUvScale, getImageAspect } from './coverFit';

describe('getCoverUvScale', () => {
  it.each([
    {
      description: 'crops the sides of a wider image',
      canvasAspect: 0.5,
      imageAspect: 2,
      expected: { x: 0.25, y: 1 },
    },
    {
      description: 'crops the top and bottom of a taller image',
      canvasAspect: 2,
      imageAspect: 0.5,
      expected: { x: 1, y: 0.25 },
    },
    {
      description: 'keeps the full image when aspects match',
      canvasAspect: 0.5625,
      imageAspect: 0.5625,
      expected: { x: 1, y: 1 },
    },
  ])('$description', ({ canvasAspect, imageAspect, expected }) => {
    const scale = getCoverUvScale({ canvasAspect, imageAspect });

    expect(scale).toEqual(expected);
  });
});

describe('getImageAspect', () => {
  it('derives the aspect from the decoded image dimensions', () => {
    const texture = {
      image: { width: 600, height: 900 },
    } as unknown as Texture;

    const aspect = getImageAspect(texture);

    expect(aspect).toBeCloseTo(2 / 3);
  });
});
