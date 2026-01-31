import { describe, expect, it } from 'vitest';

import { InvalidNameError } from '../errors/errors';
import { Name } from './name';

describe('Name', () => {
  describe('create', () => {
    it('creates name with valid value', () => {
      const name = Name.create('John Doe');

      expect(name.getValue()).toBe('John Doe');
    });

    it('trims whitespace from name', () => {
      const name = Name.create('  John Doe  ');

      expect(name.getValue()).toBe('John Doe');
    });

    it('throws InvalidNameError when name is empty', () => {
      expect(() => Name.create('')).toThrow(InvalidNameError);
      expect(() => Name.create('')).toThrow('Name cannot be empty');
    });

    it('throws InvalidNameError when name is only whitespace', () => {
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

    it('creates name at max length', () => {
      const maxLengthName = 'a'.repeat(100);
      const name = Name.create(maxLengthName);

      expect(name.getValue()).toBe(maxLengthName);
    });
  });

  describe('equals', () => {
    it('returns true when names are equal', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('John Doe');

      expect(name1.equals(name2)).toBe(true);
    });

    it('returns false when names are different', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('Jane Doe');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns name value as string', () => {
      const name = Name.create('John Doe');

      expect(name.toString()).toBe('John Doe');
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes name from string value', () => {
      const name = Name.reconstitute('John Doe');

      expect(name.getValue()).toBe('John Doe');
    });
  });
});
