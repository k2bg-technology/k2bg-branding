import { describe, expect, it } from 'vitest';

import { InvalidNameError } from '../errors/errors';

import { Name } from './name';

describe('Name', () => {
  describe('create', () => {
    it('creates Name when given valid value', () => {
      const value = 'Test Product Name';

      const sut = Name.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('trims whitespace from value', () => {
      const value = '  Test Product  ';

      const sut = Name.create(value);

      expect(sut.getValue()).toBe('Test Product');
    });

    it('creates Name with maximum allowed length', () => {
      const value = 'a'.repeat(200);

      const sut = Name.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('throws InvalidNameError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Name.create(emptyValue)).toThrow(InvalidNameError);
      expect(() => Name.create(emptyValue)).toThrow('Name cannot be empty');
    });

    it('throws InvalidNameError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => Name.create(whitespaceValue)).toThrow(InvalidNameError);
    });

    it('throws InvalidNameError when value exceeds maximum length', () => {
      const longValue = 'a'.repeat(201);

      expect(() => Name.create(longValue)).toThrow(InvalidNameError);
      expect(() => Name.create(longValue)).toThrow(
        'Name cannot exceed 200 characters'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates Name without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Name.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Names', () => {
      const value = 'Test Name';
      const name1 = Name.create(value);
      const name2 = Name.create(value);

      const result = name1.equals(name2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Names', () => {
      const name1 = Name.create('Name 1');
      const name2 = Name.create('Name 2');

      const result = name1.equals(name2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the name string value', () => {
      const value = 'Test Product';
      const sut = Name.create(value);

      const result = sut.toString();

      expect(result).toBe(value);
    });
  });
});
