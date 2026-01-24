import { describe, expect, it } from 'vitest';

import { InvalidProviderColorError } from '../errors/errors';

import { ProviderColor } from './providerColor';

describe('ProviderColor', () => {
  describe('create', () => {
    it('creates ProviderColor when given valid 6-digit hex color', () => {
      const color = '#FF5733';

      const sut = ProviderColor.create(color);

      expect(sut.getValue()).toBe('#ff5733');
    });

    it('creates ProviderColor when given valid 3-digit hex color', () => {
      const color = '#F00';

      const sut = ProviderColor.create(color);

      expect(sut.getValue()).toBe('#f00');
    });

    it('normalizes hex color to lowercase', () => {
      const color = '#AABBCC';

      const sut = ProviderColor.create(color);

      expect(sut.getValue()).toBe('#aabbcc');
    });

    it('throws InvalidProviderColorError when value is empty string', () => {
      const emptyValue = '';

      expect(() => ProviderColor.create(emptyValue)).toThrow(
        InvalidProviderColorError
      );
      expect(() => ProviderColor.create(emptyValue)).toThrow(
        'ProviderColor cannot be empty'
      );
    });

    it('throws InvalidProviderColorError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => ProviderColor.create(whitespaceValue)).toThrow(
        InvalidProviderColorError
      );
    });

    it('throws InvalidProviderColorError when hex format is invalid', () => {
      const invalidColor = 'FF5733';

      expect(() => ProviderColor.create(invalidColor)).toThrow(
        InvalidProviderColorError
      );
      expect(() => ProviderColor.create(invalidColor)).toThrow(
        'Invalid hex color format'
      );
    });

    it('throws InvalidProviderColorError when hex color has wrong length', () => {
      const invalidColor = '#FF57';

      expect(() => ProviderColor.create(invalidColor)).toThrow(
        InvalidProviderColorError
      );
    });

    it('throws InvalidProviderColorError when hex color contains invalid characters', () => {
      const invalidColor = '#GGHHII';

      expect(() => ProviderColor.create(invalidColor)).toThrow(
        InvalidProviderColorError
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ProviderColor without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = ProviderColor.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ProviderColors', () => {
      const color1 = ProviderColor.create('#FF5733');
      const color2 = ProviderColor.create('#ff5733');

      const result = color1.equals(color2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ProviderColors', () => {
      const color1 = ProviderColor.create('#FF5733');
      const color2 = ProviderColor.create('#00FF00');

      const result = color1.equals(color2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the hex color string value', () => {
      const color = '#ff5733';
      const sut = ProviderColor.create('#FF5733');

      const result = sut.toString();

      expect(result).toBe(color);
    });
  });
});
