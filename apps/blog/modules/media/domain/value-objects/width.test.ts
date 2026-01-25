import { describe, expect, it } from 'vitest';

import { InvalidWidthError } from '../errors/errors';

import { Width } from './width';

describe('Width', () => {
  describe('create', () => {
    it('creates Width when given valid positive integer', () => {
      const validWidth = 800;

      const sut = Width.create(validWidth);

      expect(sut.getValue()).toBe(validWidth);
    });

    it('creates Width when given value of 1', () => {
      const minWidth = 1;

      const sut = Width.create(minWidth);

      expect(sut.getValue()).toBe(minWidth);
    });

    it('throws InvalidWidthError when value is zero', () => {
      const zeroValue = 0;

      expect(() => Width.create(zeroValue)).toThrow(InvalidWidthError);
      expect(() => Width.create(zeroValue)).toThrow(
        'Width must be a positive number'
      );
    });

    it('throws InvalidWidthError when value is negative', () => {
      const negativeValue = -100;

      expect(() => Width.create(negativeValue)).toThrow(InvalidWidthError);
      expect(() => Width.create(negativeValue)).toThrow(
        'Width must be a positive number'
      );
    });

    it('throws InvalidWidthError when value is not an integer', () => {
      const floatValue = 100.5;

      expect(() => Width.create(floatValue)).toThrow(InvalidWidthError);
      expect(() => Width.create(floatValue)).toThrow(
        'Width must be an integer'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates Width without validation', () => {
      const value = 800;

      const sut = Width.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Widths', () => {
      const width = 800;
      const width1 = Width.create(width);
      const width2 = Width.create(width);

      const result = width1.equals(width2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Widths', () => {
      const width1 = Width.create(800);
      const width2 = Width.create(1200);

      const result = width1.equals(width2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the width as string value', () => {
      const width = 800;
      const sut = Width.create(width);

      const result = sut.toString();

      expect(result).toBe('800');
    });
  });
});
