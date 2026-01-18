import { describe, expect, it } from 'vitest';
import { InvalidTagsError } from '../errors/errors';
import { Tags } from './tags';

describe('Tags', () => {
  describe('create', () => {
    it('creates Tags when given valid values', () => {
      const validTags = ['typescript', 'react', 'nodejs'];

      const sut = Tags.create(validTags);

      expect(sut.getValues()).toEqual(['typescript', 'react', 'nodejs']);
    });

    it('normalizes tags to lowercase', () => {
      const mixedCaseTags = ['TypeScript', 'REACT', 'NodeJS'];

      const sut = Tags.create(mixedCaseTags);

      expect(sut.getValues()).toEqual(['typescript', 'react', 'nodejs']);
    });

    it('trims whitespace from tags', () => {
      const tagsWithWhitespace = ['  typescript  ', '  react  '];

      const sut = Tags.create(tagsWithWhitespace);

      expect(sut.getValues()).toEqual(['typescript', 'react']);
    });

    it('removes duplicate tags', () => {
      const duplicateTags = ['react', 'React', 'REACT', 'typescript'];

      const sut = Tags.create(duplicateTags);

      expect(sut.getValues()).toEqual(['react', 'typescript']);
    });

    it('removes empty tags after trimming', () => {
      const tagsWithEmpty = ['typescript', '', '   ', 'react'];

      const sut = Tags.create(tagsWithEmpty);

      expect(sut.getValues()).toEqual(['typescript', 'react']);
    });

    it('creates empty Tags when given empty array', () => {
      const emptyArray: string[] = [];

      const sut = Tags.create(emptyArray);

      expect(sut.isEmpty()).toBe(true);
      const expectedCount = 0;
      expect(sut.count()).toBe(expectedCount);
    });

    it('throws InvalidTagsError when exceeding 20 tags', () => {
      const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`);

      expect(() => Tags.create(tooManyTags)).toThrow(InvalidTagsError);
      expect(() => Tags.create(tooManyTags)).toThrow('Maximum 20 tags allowed');
    });

    it('creates Tags when exactly 20 tags', () => {
      const exactTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);

      const sut = Tags.create(exactTags);

      const expectedCount = 20;
      expect(sut.count()).toBe(expectedCount);
    });

    it('throws InvalidTagsError when tag exceeds 10 characters', () => {
      const longTag = ['a'.repeat(11)];

      expect(() => Tags.create(longTag)).toThrow(InvalidTagsError);
      expect(() => Tags.create(longTag)).toThrow(
        'exceeds maximum length of 10 characters'
      );
    });

    it('creates Tags when tag is exactly 10 characters', () => {
      const exactTag = ['a'.repeat(10)];

      const sut = Tags.create(exactTag);

      const expectedLength = 10;
      expect(sut.getValues()[0].length).toBe(expectedLength);
    });
  });

  describe('empty', () => {
    it('creates empty Tags', () => {
      const sut = Tags.empty();

      expect(sut.isEmpty()).toBe(true);
      const expectedCount = 0;
      expect(sut.count()).toBe(expectedCount);
    });
  });

  describe('reconstitute', () => {
    it('creates Tags without validation', () => {
      const values = ['any', 'values', 'from', 'persistence'];

      const sut = Tags.reconstitute(values);

      expect(sut.getValues()).toEqual(values);
    });
  });

  describe('contains', () => {
    it('returns true when tag exists', () => {
      const sut = Tags.create(['typescript', 'react']);

      const result = sut.contains('typescript');

      expect(result).toBe(true);
    });

    it('returns true when searching case-insensitively', () => {
      const sut = Tags.create(['typescript', 'react']);

      const result = sut.contains('TypeScript');

      expect(result).toBe(true);
    });

    it('returns false when tag does not exist', () => {
      const sut = Tags.create(['typescript', 'react']);

      const result = sut.contains('vue');

      expect(result).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('returns true when tags are empty', () => {
      const sut = Tags.empty();

      const result = sut.isEmpty();

      expect(result).toBe(true);
    });

    it('returns false when tags have values', () => {
      const sut = Tags.create(['typescript']);

      const result = sut.isEmpty();

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('returns the number of tags', () => {
      const sut = Tags.create(['typescript', 'react', 'nodejs']);

      const result = sut.count();

      const expectedCount = 3;
      expect(result).toBe(expectedCount);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Tags', () => {
      const tags1 = Tags.create(['typescript', 'react']);
      const tags2 = Tags.create(['typescript', 'react']);

      const result = tags1.equals(tags2);

      expect(result).toBe(true);
    });

    it('returns true when tags are in different order', () => {
      const tags1 = Tags.create(['react', 'typescript']);
      const tags2 = Tags.create(['typescript', 'react']);

      const result = tags1.equals(tags2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Tags', () => {
      const tags1 = Tags.create(['typescript', 'react']);
      const tags2 = Tags.create(['typescript', 'vue']);

      const result = tags1.equals(tags2);

      expect(result).toBe(false);
    });

    it('returns false when tag counts differ', () => {
      const tags1 = Tags.create(['typescript', 'react']);
      const tags2 = Tags.create(['typescript']);

      const result = tags1.equals(tags2);

      expect(result).toBe(false);
    });
  });
});
