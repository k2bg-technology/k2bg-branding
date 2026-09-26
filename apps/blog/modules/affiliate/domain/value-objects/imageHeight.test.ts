import { describe, expect, it } from 'vitest';

import { InvalidImageHeightError } from '../errors/errors';

import { ImageHeight } from './imageHeight';

describe('ImageHeight', () => {
  describe('create', () => {
    it('creates ImageHeight when given valid positive integer', () => {
      const value = 200;

      const sut = ImageHeight.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('creates ImageHeight when given value of 1', () => {
      const value = 1;

      const sut = ImageHeight.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it.each([
      { scenario: 'zero', value: 0 },
      { scenario: 'negative', value: -100 },
    ])(
      'rejects $scenario image height with InvalidImageHeightError',
      ({ value }) => {
        expect(() => ImageHeight.create(value)).toThrow(
          InvalidImageHeightError
        );
      }
    );

    it('throws InvalidImageHeightError when value is not an integer', () => {
      const floatValue = 100.5;

      expect(() => ImageHeight.create(floatValue)).toThrow(
        InvalidImageHeightError
      );
    });
  });

  describe('reconstitute', () => {
    it('restores ImageHeight from a valid persisted value', () => {
      const value = 200;

      const sut = ImageHeight.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ImageHeights', () => {
      const value = 200;
      const height1 = ImageHeight.create(value);
      const height2 = ImageHeight.create(value);

      const result = height1.equals(height2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ImageHeights', () => {
      const height1 = ImageHeight.create(200);
      const height2 = ImageHeight.create(300);

      const result = height1.equals(height2);

      expect(result).toBe(false);
    });
  });
});
