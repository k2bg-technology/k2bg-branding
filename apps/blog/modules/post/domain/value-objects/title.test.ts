import { describe, expect, it } from 'vitest';
import { InvalidTitleError } from '../errors/errors';
import { Title } from './title';

describe('Title', () => {
  describe('create', () => {
    it('creates Title when given valid value', () => {
      const validTitle = 'My Blog Post Title';

      const sut = Title.create(validTitle);

      expect(sut.getValue()).toBe(validTitle);
    });

    it('trims whitespace from value', () => {
      const titleWithWhitespace = '  My Blog Post Title  ';

      const sut = Title.create(titleWithWhitespace);

      const expectedValue = 'My Blog Post Title';
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidTitleError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Title.create(emptyValue)).toThrow(InvalidTitleError);
      expect(() => Title.create(emptyValue)).toThrow('Title cannot be empty');
    });

    it('throws InvalidTitleError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => Title.create(whitespaceValue)).toThrow(InvalidTitleError);
    });

    it('throws InvalidTitleError when value exceeds 100 characters', () => {
      const longTitle = 'a'.repeat(101);

      expect(() => Title.create(longTitle)).toThrow(InvalidTitleError);
      expect(() => Title.create(longTitle)).toThrow(
        'Title must be 100 characters or less'
      );
    });

    it('creates Title when value is exactly 100 characters', () => {
      const exactTitle = 'a'.repeat(100);

      const sut = Title.create(exactTitle);

      const expectedLength = 100;
      expect(sut.getLength()).toBe(expectedLength);
    });
  });

  describe('reconstitute', () => {
    it('creates Title without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Title.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('getLength', () => {
    it('returns the length of the title', () => {
      const title = 'Hello World';
      const sut = Title.create(title);

      const result = sut.getLength();

      const expectedLength = 11;
      expect(result).toBe(expectedLength);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Titles', () => {
      const titleValue = 'My Blog Post';
      const title1 = Title.create(titleValue);
      const title2 = Title.create(titleValue);

      const result = title1.equals(title2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Titles', () => {
      const title1 = Title.create('Title One');
      const title2 = Title.create('Title Two');

      const result = title1.equals(title2);

      expect(result).toBe(false);
    });
  });
});
