import { describe, expect, it } from 'vitest';

import sut from './image-loader';

describe('imageLoader', () => {
  it.each([
    {
      scenario: 'rounds a width up to the next generated variant',
      src: '/images/skill-pattern.jpg',
      width: 1000,
      expected: '/images/generated/skill-pattern-w1080.avif',
    },
    {
      scenario: 'keeps a width that equals a generated variant',
      src: '/images/skill-pattern.jpg',
      width: 1080,
      expected: '/images/generated/skill-pattern-w1080.avif',
    },
    {
      scenario: 'caps a width above the largest variant at that variant',
      src: '/images/skill-pattern.jpg',
      width: 1920,
      expected: '/images/generated/skill-pattern-w1440.avif',
    },
    {
      scenario: 'serves the only variant of an image generated at one width',
      src: '/images/hero.jpg',
      width: 1920,
      expected: '/images/generated/hero-w640.avif',
    },
    {
      scenario: 'caps at a variant generated at a source width below 1920',
      src: '/images/hero-readme.jpg',
      width: 1920,
      expected: '/images/generated/hero-readme-w1200.avif',
    },
    {
      scenario: 'keeps the Open Graph image unchanged',
      src: '/images/hero-og.jpg',
      width: 1080,
      expected: '/images/hero-og.jpg',
    },
  ])('$scenario', ({ src, width, expected }) => {
    const result = sut({ src, width });

    expect(result).toBe(expected);
  });
});
