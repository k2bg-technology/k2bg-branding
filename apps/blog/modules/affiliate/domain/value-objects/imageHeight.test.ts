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

    it('throws InvalidImageHeightError when value is zero', () => {
      const zeroValue = 0;

      expect(() => ImageHeight.create(zeroValue)).toThrow(
        InvalidImageHeightError
      );
      expect(() => ImageHeight.create(zeroValue)).toThrow(
        'ImageHeight must be a positive number'
      );
    });

    it('throws InvalidImageHeightError when value is negative', () => {
      const negativeValue = -100;

      expect(() => ImageHeight.create(negativeValue)).toThrow(
        InvalidImageHeightError
      );
    });

    it('throws InvalidImageHeightError when value is not an integer', () => {
      const floatValue = 100.5;

      expect(() => ImageHeight.create(floatValue)).toThrow(
        InvalidImageHeightError
      );
      expect(() => ImageHeight.create(floatValue)).toThrow(
        'ImageHeight must be an integer'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ImageHeight without validation', () => {
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

  describe('toString', () => {
    it('returns the height as string value', () => {
      const value = 200;
      const sut = ImageHeight.create(value);

      const result = sut.toString();

      expect(result).toBe('200');
    });
  });
});
