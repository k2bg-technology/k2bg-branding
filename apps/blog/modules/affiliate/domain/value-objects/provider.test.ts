import { describe, expect, it } from 'vitest';

import { InvalidProviderError } from '../errors/errors';

import { Provider } from './provider';

describe('Provider', () => {
  describe('create', () => {
    it('creates Provider when given valid value', () => {
      const value = 'Amazon';

      const sut = Provider.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('trims whitespace from value', () => {
      const value = '  Rakuten  ';

      const sut = Provider.create(value);

      expect(sut.getValue()).toBe('Rakuten');
    });

    it('creates Provider with maximum allowed length', () => {
      const value = 'a'.repeat(50);

      const sut = Provider.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('throws InvalidProviderError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Provider.create(emptyValue)).toThrow(InvalidProviderError);
      expect(() => Provider.create(emptyValue)).toThrow(
        'Provider cannot be empty'
      );
    });

    it('throws InvalidProviderError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => Provider.create(whitespaceValue)).toThrow(
        InvalidProviderError
      );
    });

    it('throws InvalidProviderError when value exceeds maximum length', () => {
      const longValue = 'a'.repeat(51);

      expect(() => Provider.create(longValue)).toThrow(InvalidProviderError);
      expect(() => Provider.create(longValue)).toThrow(
        'Provider cannot exceed 50 characters'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates Provider without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Provider.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Providers', () => {
      const value = 'Amazon';
      const provider1 = Provider.create(value);
      const provider2 = Provider.create(value);

      const result = provider1.equals(provider2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Providers', () => {
      const provider1 = Provider.create('Amazon');
      const provider2 = Provider.create('Rakuten');

      const result = provider1.equals(provider2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the provider string value', () => {
      const value = 'Amazon';
      const sut = Provider.create(value);

      const result = sut.toString();

      expect(result).toBe(value);
    });
  });
});
