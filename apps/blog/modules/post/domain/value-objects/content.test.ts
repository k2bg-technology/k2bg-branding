import { describe, expect, it } from 'vitest';
import { InvalidContentError } from '../errors/errors';
import { Content } from './content';

describe('Content', () => {
  describe('create', () => {
    it('creates Content when given valid value', () => {
      const validContent = 'This is the body of my blog post.';

      const sut = Content.create(validContent);

      expect(sut.getValue()).toBe(validContent);
    });

    it('trims whitespace from value', () => {
      const contentWithWhitespace = '  Blog post content  ';

      const sut = Content.create(contentWithWhitespace);

      const expectedValue = 'Blog post content';
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidContentError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Content.create(emptyValue)).toThrow(InvalidContentError);
      expect(() => Content.create(emptyValue)).toThrow(
        'Content cannot be empty'
      );
    });

    it('throws InvalidContentError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => Content.create(whitespaceValue)).toThrow(
        InvalidContentError
      );
    });

    it('throws InvalidContentError when value exceeds 100,000 characters', () => {
      const longContent = 'a'.repeat(100_001);

      expect(() => Content.create(longContent)).toThrow(InvalidContentError);
      expect(() => Content.create(longContent)).toThrow(
        'Content must be 100,000 characters or less'
      );
    });

    it('creates Content when value is exactly 100,000 characters', () => {
      const exactContent = 'a'.repeat(100_000);

      const sut = Content.create(exactContent);

      const expectedLength = 100_000;
      expect(sut.getLength()).toBe(expectedLength);
    });
  });

  describe('reconstitute', () => {
    it('creates Content without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Content.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('getLength', () => {
    it('returns the length of the content', () => {
      const content = 'Hello World';
      const sut = Content.create(content);

      const result = sut.getLength();

      const expectedLength = 11;
      expect(result).toBe(expectedLength);
    });
  });

  describe('isEmpty', () => {
    it('returns false when content has text', () => {
      const sut = Content.create('Some content');

      const result = sut.isEmpty();

      expect(result).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Contents', () => {
      const contentValue = 'Blog post content';
      const content1 = Content.create(contentValue);
      const content2 = Content.create(contentValue);

      const result = content1.equals(content2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Contents', () => {
      const content1 = Content.create('Content One');
      const content2 = Content.create('Content Two');

      const result = content1.equals(content2);

      expect(result).toBe(false);
    });
  });
});
