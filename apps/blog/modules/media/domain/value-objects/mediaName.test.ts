import { describe, expect, it } from 'vitest';

import { InvalidMediaNameError } from '../errors/errors';

import { MediaName } from './mediaName';

describe('MediaName', () => {
  describe('create', () => {
    it('creates MediaName when given valid name', () => {
      const validName = 'Hero Image';

      const sut = MediaName.create(validName);

      expect(sut.getValue()).toBe(validName);
    });

    it('trims whitespace from name', () => {
      const nameWithWhitespace = '  Hero Image  ';

      const sut = MediaName.create(nameWithWhitespace);

      expect(sut.getValue()).toBe('Hero Image');
    });

    it('creates MediaName at max length boundary (200 chars)', () => {
      const maxLengthName = 'a'.repeat(200);

      const sut = MediaName.create(maxLengthName);

      expect(sut.getValue()).toBe(maxLengthName);
    });

    it('throws InvalidMediaNameError when value is empty string', () => {
      const emptyValue = '';

      expect(() => MediaName.create(emptyValue)).toThrow(InvalidMediaNameError);
      expect(() => MediaName.create(emptyValue)).toThrow(
        'MediaName cannot be empty'
      );
    });

    it('throws InvalidMediaNameError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => MediaName.create(whitespaceValue)).toThrow(
        InvalidMediaNameError
      );
    });

    it('throws InvalidMediaNameError when name exceeds 200 characters', () => {
      const tooLongName = 'a'.repeat(201);

      expect(() => MediaName.create(tooLongName)).toThrow(
        InvalidMediaNameError
      );
      expect(() => MediaName.create(tooLongName)).toThrow(
        'MediaName cannot exceed 200 characters'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates MediaName without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = MediaName.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal MediaNames', () => {
      const name = 'Hero Image';
      const name1 = MediaName.create(name);
      const name2 = MediaName.create(name);

      const result = name1.equals(name2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different MediaNames', () => {
      const name1 = MediaName.create('Hero Image');
      const name2 = MediaName.create('Banner Image');

      const result = name1.equals(name2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the name string value', () => {
      const name = 'Hero Image';
      const sut = MediaName.create(name);

      const result = sut.toString();

      expect(result).toBe(name);
    });
  });
});
