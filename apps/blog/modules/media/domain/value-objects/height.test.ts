import { describe, expect, it } from 'vitest';

import { InvalidHeightError } from '../errors/errors';

import { Height } from './height';

describe('Height', () => {
  describe('create', () => {
    it('creates Height when given valid positive integer', () => {
      const validHeight = 600;

      const sut = Height.create(validHeight);

      expect(sut.getValue()).toBe(validHeight);
    });

    it('creates Height when given value of 1', () => {
      const minHeight = 1;

      const sut = Height.create(minHeight);

      expect(sut.getValue()).toBe(minHeight);
    });

    it('throws InvalidHeightError when value is zero', () => {
      const zeroValue = 0;

      expect(() => Height.create(zeroValue)).toThrow(InvalidHeightError);
      expect(() => Height.create(zeroValue)).toThrow(
        'Height must be a positive number'
      );
    });

    it('throws InvalidHeightError when value is negative', () => {
      const negativeValue = -100;

      expect(() => Height.create(negativeValue)).toThrow(InvalidHeightError);
      expect(() => Height.create(negativeValue)).toThrow(
        'Height must be a positive number'
      );
    });

    it('throws InvalidHeightError when value is not an integer', () => {
      const floatValue = 100.5;

      expect(() => Height.create(floatValue)).toThrow(InvalidHeightError);
      expect(() => Height.create(floatValue)).toThrow(
        'Height must be an integer'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates Height without validation', () => {
      const value = 600;

      const sut = Height.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Heights', () => {
      const height = 600;
      const height1 = Height.create(height);
      const height2 = Height.create(height);

      const result = height1.equals(height2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Heights', () => {
      const height1 = Height.create(600);
      const height2 = Height.create(900);

      const result = height1.equals(height2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the height as string value', () => {
      const height = 600;
      const sut = Height.create(height);

      const result = sut.toString();

      expect(result).toBe('600');
    });
  });
});
