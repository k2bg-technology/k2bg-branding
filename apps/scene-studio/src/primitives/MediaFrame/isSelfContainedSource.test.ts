import { describe, expect, it } from 'vitest';

import { isSelfContainedSource } from './isSelfContainedSource';

describe('isSelfContainedSource', () => {
  it.each([
    { src: 'https://example.com/photo.jpg', expected: true },
    { src: 'http://example.com/clip.mp4', expected: true },
    { src: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E', expected: true },
    { src: 'assets/photo.jpg', expected: false },
    { src: 'photo.jpg', expected: false },
    { src: 'https-notes/photo.jpg', expected: false },
  ])('returns $expected for $src', ({ src, expected }) => {
    const result = isSelfContainedSource(src);

    expect(result).toBe(expected);
  });
});
