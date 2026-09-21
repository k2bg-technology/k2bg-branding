import { describe, expect, it } from 'vitest';
import { InvalidSlugError } from '../errors/errors';
import { Slug } from './slug';

describe('Slug', () => {
  describe('create', () => {
    it.each([
      { format: 'kebab-case words', value: 'my-blog-post' },
      { format: 'a single word', value: 'hello' },
      { format: 'words with numbers', value: 'my-blog-post-2024' },
      { format: 'a leading number', value: '2024-year-in-review' },
    ])('accepts $format', ({ value }) => {
      const sut = Slug.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('trims whitespace from value', () => {
      const slugWithWhitespace = '  my-blog-post  ';

      const sut = Slug.create(slugWithWhitespace);

      expect(sut.getValue()).toBe('my-blog-post');
    });

    it.each([
      { format: 'an empty string', value: '' },
      { format: 'only whitespace', value: '   ' },
    ])('rejects $format as empty', ({ value }) => {
      expect(() => Slug.create(value)).toThrow(InvalidSlugError);
      expect(() => Slug.create(value)).toThrow('Slug cannot be empty');
    });

    it.each([
      { format: 'uppercase letters', value: 'My-Blog-Post' },
      { format: 'underscores', value: 'my_blog_post' },
      { format: 'spaces', value: 'my blog post' },
      { format: 'a leading hyphen', value: '-my-blog-post' },
      { format: 'a trailing hyphen', value: 'my-blog-post-' },
      { format: 'consecutive hyphens', value: 'my--blog--post' },
    ])('rejects $format as invalid kebab-case', ({ value }) => {
      expect(() => Slug.create(value)).toThrow(InvalidSlugError);
      expect(() => Slug.create(value)).toThrow('Slug must be kebab-case');
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
