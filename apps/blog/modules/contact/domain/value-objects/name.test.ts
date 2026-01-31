import { describe, expect, it } from 'vitest';

import { InvalidNameError } from '../errors/errors';
import { Name } from './name';

describe('Name', () => {
  describe('create', () => {
    it('creates Name with valid value', () => {
      const name = Name.create('John Doe');

      expect(name.getValue()).toBe('John Doe');
    });

    it('trims whitespace from name', () => {
      const name = Name.create('  John Doe  ');

      expect(name.getValue()).toBe('John Doe');
    });

    it('throws InvalidNameError when name is empty', () => {
      expect(() => Name.create('')).toThrow(InvalidNameError);
    });

    it('throws InvalidNameError when name is only whitespace', () => {
      expect(() => Name.create('   ')).toThrow(InvalidNameError);
    });
  });

  describe('equals', () => {
    it('returns true when names are equal', () => {
      const name1 = Name.create('John');
      const name2 = Name.create('John');

      expect(name1.equals(name2)).toBe(true);
    });

    it('returns false when names are different', () => {
      const name1 = Name.create('John');
      const name2 = Name.create('Jane');

      expect(name1.equals(name2)).toBe(false);
    });
  });
});
