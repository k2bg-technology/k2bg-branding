import { describe, expect, it } from 'vitest';
import { InvalidExcerptError } from '../errors/errors';
import { Excerpt } from './excerpt';

describe('Excerpt', () => {
  describe('create', () => {
    it('creates Excerpt when given valid value', () => {
      const validExcerpt = 'A brief summary of the blog post.';

      const sut = Excerpt.create(validExcerpt);

      expect(sut.getValue()).toBe(validExcerpt);
    });

    it('trims whitespace from value', () => {
      const excerptWithWhitespace = '  Summary text  ';

      const sut = Excerpt.create(excerptWithWhitespace);

      const expectedValue = 'Summary text';
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('returns empty Excerpt when value is null', () => {
      const nullValue = null;

      const sut = Excerpt.create(nullValue);

      expect(sut.getValue()).toBeNull();
      expect(sut.hasValue()).toBe(false);
    });

    it('returns empty Excerpt when value is undefined', () => {
      const undefinedValue = undefined;

      const sut = Excerpt.create(undefinedValue);

      expect(sut.getValue()).toBeNull();
      expect(sut.hasValue()).toBe(false);
    });

    it('returns empty Excerpt when value is empty string', () => {
      const emptyValue = '';

      const sut = Excerpt.create(emptyValue);

      expect(sut.getValue()).toBeNull();
      expect(sut.hasValue()).toBe(false);
    });

    it('returns empty Excerpt when value is whitespace only', () => {
      const whitespaceValue = '   ';

      const sut = Excerpt.create(whitespaceValue);

      expect(sut.getValue()).toBeNull();
      expect(sut.hasValue()).toBe(false);
    });

    it('throws InvalidExcerptError when value exceeds 500 characters', () => {
      const longExcerpt = 'a'.repeat(501);

      expect(() => Excerpt.create(longExcerpt)).toThrow(InvalidExcerptError);
      expect(() => Excerpt.create(longExcerpt)).toThrow(
        'Excerpt must be 500 characters or less'
      );
    });

    it('creates Excerpt when value is exactly 500 characters', () => {
      const exactExcerpt = 'a'.repeat(500);

      const sut = Excerpt.create(exactExcerpt);

      const expectedLength = 500;
      expect(sut.getLength()).toBe(expectedLength);
    });
  });

  describe('empty', () => {
    it('creates empty Excerpt', () => {
      const sut = Excerpt.empty();

      expect(sut.getValue()).toBeNull();
      expect(sut.hasValue()).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('creates Excerpt without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Excerpt.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });

    it('creates Excerpt with null value', () => {
      const nullValue = null;

      const sut = Excerpt.reconstitute(nullValue);

      expect(sut.getValue()).toBeNull();
    });
  });

  describe('hasValue', () => {
    it('returns true when excerpt has value', () => {
      const sut = Excerpt.create('Some excerpt');

      const result = sut.hasValue();

      expect(result).toBe(true);
    });

    it('returns false when excerpt is empty', () => {
      const sut = Excerpt.empty();

      const result = sut.hasValue();

      expect(result).toBe(false);
    });
  });

  describe('getLength', () => {
    it('returns the length of the excerpt', () => {
      const excerpt = 'Hello World';
      const sut = Excerpt.create(excerpt);

      const result = sut.getLength();

      const expectedLength = 11;
      expect(result).toBe(expectedLength);
    });

    it('returns 0 when excerpt is empty', () => {
      const sut = Excerpt.empty();

      const result = sut.getLength();

      const expectedLength = 0;
      expect(result).toBe(expectedLength);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Excerpts', () => {
      const excerptValue = 'Brief summary';
      const excerpt1 = Excerpt.create(excerptValue);
      const excerpt2 = Excerpt.create(excerptValue);

      const result = excerpt1.equals(excerpt2);

      expect(result).toBe(true);
    });

    it('returns true when comparing empty Excerpts', () => {
      const excerpt1 = Excerpt.empty();
      const excerpt2 = Excerpt.empty();

      const result = excerpt1.equals(excerpt2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Excerpts', () => {
      const excerpt1 = Excerpt.create('Excerpt One');
      const excerpt2 = Excerpt.create('Excerpt Two');

      const result = excerpt1.equals(excerpt2);

      expect(result).toBe(false);
    });
  });
});
