import { describe, expect, it } from 'vitest';
import { InvalidSlugError } from '../errors/errors';
import { Slug } from './slug';

describe('Slug', () => {
  describe('create', () => {
    it('creates Slug when given valid kebab-case value', () => {
      const validSlug = 'my-blog-post';

      const sut = Slug.create(validSlug);

      expect(sut.getValue()).toBe(validSlug);
    });

    it('creates Slug when given single word', () => {
      const singleWord = 'hello';

      const sut = Slug.create(singleWord);

      expect(sut.getValue()).toBe(singleWord);
    });

    it('creates Slug when given value with numbers', () => {
      const slugWithNumbers = 'my-blog-post-2024';

      const sut = Slug.create(slugWithNumbers);

      expect(sut.getValue()).toBe(slugWithNumbers);
    });

    it('creates Slug when given value starting with number', () => {
      const startWithNumber = '2024-year-in-review';

      const sut = Slug.create(startWithNumber);

      expect(sut.getValue()).toBe(startWithNumber);
    });

    it('trims whitespace from value', () => {
      const slugWithWhitespace = '  my-blog-post  ';

      const sut = Slug.create(slugWithWhitespace);

      expect(sut.getValue()).toBe('my-blog-post');
    });

    it('throws InvalidSlugError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Slug.create(emptyValue)).toThrow(InvalidSlugError);
      expect(() => Slug.create(emptyValue)).toThrow('Slug cannot be empty');
    });

    it('throws InvalidSlugError when value is only whitespace', () => {
      const whitespaceOnly = '   ';

      expect(() => Slug.create(whitespaceOnly)).toThrow(InvalidSlugError);
      expect(() => Slug.create(whitespaceOnly)).toThrow('Slug cannot be empty');
    });

    it('throws InvalidSlugError when value contains uppercase', () => {
      const uppercaseSlug = 'My-Blog-Post';

      expect(() => Slug.create(uppercaseSlug)).toThrow(InvalidSlugError);
      expect(() => Slug.create(uppercaseSlug)).toThrow(
        'Slug must be kebab-case'
      );
    });

    it('throws InvalidSlugError when value contains underscores', () => {
      const underscoreSlug = 'my_blog_post';

      expect(() => Slug.create(underscoreSlug)).toThrow(InvalidSlugError);
      expect(() => Slug.create(underscoreSlug)).toThrow(
        'Slug must be kebab-case'
      );
    });

    it('throws InvalidSlugError when value contains spaces', () => {
      const spacedSlug = 'my blog post';

      expect(() => Slug.create(spacedSlug)).toThrow(InvalidSlugError);
    });

    it('throws InvalidSlugError when value starts with hyphen', () => {
      const startsWithHyphen = '-my-blog-post';

      expect(() => Slug.create(startsWithHyphen)).toThrow(InvalidSlugError);
    });

    it('throws InvalidSlugError when value ends with hyphen', () => {
      const endsWithHyphen = 'my-blog-post-';

      expect(() => Slug.create(endsWithHyphen)).toThrow(InvalidSlugError);
    });

    it('throws InvalidSlugError when value contains consecutive hyphens', () => {
      const consecutiveHyphens = 'my--blog--post';

      expect(() => Slug.create(consecutiveHyphens)).toThrow(InvalidSlugError);
    });

    it('throws InvalidSlugError when value exceeds max length', () => {
      const longSlug = 'a'.repeat(101);

      expect(() => Slug.create(longSlug)).toThrow(InvalidSlugError);
      expect(() => Slug.create(longSlug)).toThrow(
        'Slug cannot exceed 100 characters'
      );
    });

    it('accepts slug at max length', () => {
      const maxLengthSlug = 'a'.repeat(100);

      const sut = Slug.create(maxLengthSlug);

      expect(sut.getValue()).toBe(maxLengthSlug);
    });
  });

  describe('reconstitute', () => {
    it('creates Slug without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = Slug.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Slugs', () => {
      const slugValue = 'my-blog-post';
      const slug1 = Slug.create(slugValue);
      const slug2 = Slug.create(slugValue);

      const result = slug1.equals(slug2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Slugs', () => {
      const slug1 = Slug.create('post-one');
      const slug2 = Slug.create('post-two');

      const result = slug1.equals(slug2);

      expect(result).toBe(false);
    });
  });
});
