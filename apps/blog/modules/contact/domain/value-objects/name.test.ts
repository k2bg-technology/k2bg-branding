import { describe, expect, it } from 'vitest';

import { InvalidNameError } from '../errors/errors';
import { Name } from './name';

describe('Name Value Object', () => {
  describe('create', () => {
    it('creates a valid name', () => {
      const sut = Name.create('John Doe');

      expect(sut.getValue()).toBe('John Doe');
    });

    it('trims whitespace', () => {
      const sut = Name.create('  John Doe  ');

      expect(sut.getValue()).toBe('John Doe');
    });

    it('throws InvalidNameError when name is empty', () => {
      expect(() => Name.create('')).toThrow(InvalidNameError);
      expect(() => Name.create('')).toThrow('Name cannot be empty');
    });

    it('throws InvalidNameError when name is whitespace only', () => {
      expect(() => Name.create('   ')).toThrow(InvalidNameError);
      expect(() => Name.create('   ')).toThrow('Name cannot be empty');
    });

    it('throws InvalidNameError when name exceeds max length', () => {
      const longName = 'a'.repeat(101);

      expect(() => Name.create(longName)).toThrow(InvalidNameError);
      expect(() => Name.create(longName)).toThrow(
        'Name must be 100 characters or less'
      );
    });

    it('accepts name at max length', () => {
      const maxLengthName = 'a'.repeat(100);
      const sut = Name.create(maxLengthName);

      expect(sut.getValue()).toBe(maxLengthName);
      expect(sut.getLength()).toBe(100);
    });
  });

  describe('equals', () => {
    it('returns true for names with same value', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('John Doe');

      expect(name1.equals(name2)).toBe(true);
    });

    it('returns false for names with different values', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('Jane Doe');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('creates name without validation', () => {
      const sut = Name.reconstitute('Existing Name');

      expect(sut.getValue()).toBe('Existing Name');
    });
  });
});
