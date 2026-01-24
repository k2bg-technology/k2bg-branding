import { describe, expect, it } from 'vitest';

import { InvalidImageProviderError } from '../errors/errors';

import { ImageProvider } from './imageProvider';

describe('ImageProvider', () => {
  describe('create', () => {
    it('creates ImageProvider when given valid value', () => {
      const value = 'Amazon';

      const sut = ImageProvider.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('trims whitespace from value', () => {
      const value = '  Rakuten  ';

      const sut = ImageProvider.create(value);

      expect(sut.getValue()).toBe('Rakuten');
    });

    it('creates ImageProvider with maximum allowed length', () => {
      const value = 'a'.repeat(50);

      const sut = ImageProvider.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('throws InvalidImageProviderError when value is empty string', () => {
      const emptyValue = '';

      expect(() => ImageProvider.create(emptyValue)).toThrow(
        InvalidImageProviderError
      );
      expect(() => ImageProvider.create(emptyValue)).toThrow(
        'ImageProvider cannot be empty'
      );
    });

    it('throws InvalidImageProviderError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => ImageProvider.create(whitespaceValue)).toThrow(
        InvalidImageProviderError
      );
    });

    it('throws InvalidImageProviderError when value exceeds maximum length', () => {
      const longValue = 'a'.repeat(51);

      expect(() => ImageProvider.create(longValue)).toThrow(
        InvalidImageProviderError
      );
      expect(() => ImageProvider.create(longValue)).toThrow(
        'ImageProvider cannot exceed 50 characters'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ImageProvider without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = ImageProvider.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ImageProviders', () => {
      const value = 'Amazon';
      const provider1 = ImageProvider.create(value);
      const provider2 = ImageProvider.create(value);

      const result = provider1.equals(provider2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ImageProviders', () => {
      const provider1 = ImageProvider.create('Amazon');
      const provider2 = ImageProvider.create('Rakuten');

      const result = provider1.equals(provider2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the image provider string value', () => {
      const value = 'Amazon';
      const sut = ImageProvider.create(value);

      const result = sut.toString();

      expect(result).toBe(value);
    });
  });
});
