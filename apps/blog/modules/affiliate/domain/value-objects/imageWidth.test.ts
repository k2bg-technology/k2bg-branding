import { describe, expect, it } from 'vitest';

import { InvalidImageWidthError } from '../errors/errors';

import { ImageWidth } from './imageWidth';

describe('ImageWidth', () => {
  describe('create', () => {
    it('creates ImageWidth when given valid positive integer', () => {
      const value = 300;

      const sut = ImageWidth.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('creates ImageWidth when given value of 1', () => {
      const value = 1;

      const sut = ImageWidth.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('throws InvalidImageWidthError when value is zero', () => {
      const zeroValue = 0;

      expect(() => ImageWidth.create(zeroValue)).toThrow(InvalidImageWidthError);
      expect(() => ImageWidth.create(zeroValue)).toThrow(
        'ImageWidth must be a positive number'
      );
    });

    it('throws InvalidImageWidthError when value is negative', () => {
      const negativeValue = -100;

      expect(() => ImageWidth.create(negativeValue)).toThrow(
        InvalidImageWidthError
      );
    });

    it('throws InvalidImageWidthError when value is not an integer', () => {
      const floatValue = 100.5;

      expect(() => ImageWidth.create(floatValue)).toThrow(
        InvalidImageWidthError
      );
      expect(() => ImageWidth.create(floatValue)).toThrow(
        'ImageWidth must be an integer'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ImageWidth without validation', () => {
      const value = 300;

      const sut = ImageWidth.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ImageWidths', () => {
      const value = 300;
      const width1 = ImageWidth.create(value);
      const width2 = ImageWidth.create(value);

      const result = width1.equals(width2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ImageWidths', () => {
      const width1 = ImageWidth.create(300);
      const width2 = ImageWidth.create(400);

      const result = width1.equals(width2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the width as string value', () => {
      const value = 300;
      const sut = ImageWidth.create(value);

      const result = sut.toString();

      expect(result).toBe('300');
    });
  });
});
