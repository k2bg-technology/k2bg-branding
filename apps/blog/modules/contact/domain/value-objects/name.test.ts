import { describe, expect, it } from 'vitest';

import { InvalidNameError } from '../errors/errors';
import { Name } from './name';

describe('Name Value Object', () => {
  describe('create', () => {
    it('should create a valid name', () => {
      const name = Name.create('John Doe');

      expect(name.getValue()).toBe('John Doe');
    });

    it('should trim whitespace', () => {
      const name = Name.create('  John Doe  ');

      expect(name.getValue()).toBe('John Doe');
    });

    it('should throw InvalidNameError when name is empty', () => {
      expect(() => Name.create('')).toThrow(InvalidNameError);
      expect(() => Name.create('')).toThrow('Name cannot be empty');
    });

    it('should throw InvalidNameError when name is whitespace only', () => {
      expect(() => Name.create('   ')).toThrow(InvalidNameError);
      expect(() => Name.create('   ')).toThrow('Name cannot be empty');
    });

    it('should throw InvalidNameError when name exceeds max length', () => {
      const longName = 'a'.repeat(101);

      expect(() => Name.create(longName)).toThrow(InvalidNameError);
      expect(() => Name.create(longName)).toThrow(
        'Name must be 100 characters or less'
      );
    });

    it('should accept name at max length', () => {
      const maxLengthName = 'a'.repeat(100);
      const name = Name.create(maxLengthName);

      expect(name.getValue()).toBe(maxLengthName);
      expect(name.getLength()).toBe(100);
    });
  });

  describe('equals', () => {
    it('should return true for names with same value', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('John Doe');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for names with different values', () => {
      const name1 = Name.create('John Doe');
      const name2 = Name.create('Jane Doe');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should create name without validation', () => {
      const name = Name.reconstitute('Existing Name');

      expect(name.getValue()).toBe('Existing Name');
    });
  });
});
